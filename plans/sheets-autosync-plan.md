# Plan: Auto-Sync Google Sheets → Live Site
## (v8 — GPT review v7 incorporated)

> **Document structure:** This file serves three purposes in one document.
> - **ADR (Architecture Decision Record):** reasoning behind each architectural choice.
> - **Runbook:** Phase 1 and Phase 2 step-by-step setup, Maintenance, Verification.
> - **Implementation notes:** edge cases, validation rules, schema, retry policy.
>
> When the system is in production, the Runbook sections are the day-to-day reference.

---

## Architectural Principles

### 1. Fail open, not closed

The system keeps serving visitors even when Sheets is unavailable. A build that cannot reach the sheet uses seed data and deploys anyway.

```
Sheets unavailable → use seed data → deploy succeeds → visitors see a working site
```

Content staleness is recoverable. Site downtime is not.

### 2. Content updates and deployments are intentionally coupled

Every sheet edit triggers a full Astro rebuild and deployment. This is a deliberate trade-off accepted for this site's edit frequency (< 10 edits/week). A decoupled CMS + SSR architecture would add server infrastructure, Sheets API authentication, and per-request failure modes — unnecessary complexity for this use case.

### 3. Separation of seed data and generated build artifacts

The repository contains **seed JSON** files — intentional defaults, curated by maintainers. Generated JSON files produced by sync scripts are build artifacts and are not committed.

**Known trade-off — seed staleness:** Seed files become stale if the menu or events data changes frequently and seeds are not updated. If sync fails, visitors see the seed data, which may lag days or weeks behind the live sheet. Mitigation: run `npm run update-seeds` after significant content changes (documents current sheet state into seed files, then commit).

**Why CI does not auto-commit seeds:** Having the deployment pipeline modify git history is an anti-pattern. It introduces potential edge cases (merge conflicts, protected-branch push failures, push permission requirements) for marginal gain on a site with < 10 edits/week. The manual `update-seeds` command is the correct approach. If an automated refresh is ever needed, implement it as a separate maintenance workflow triggered on demand, not as a side-effect of every build.

### 4. The CSV export endpoint is unofficial

The Google Sheets CSV export endpoint (`/gviz/tq?tqx=out:csv`) has been stable for years but is not part of the official Sheets API. It is chosen because it requires no authentication. If Google changes it, migration to the Sheets API v4 is the correct path (requires a service account credential in CI).

---

## Architecture Overview

### File layout

```
src/data/
  menu.seed.json       ← committed; curated default/fallback data (updated by update-seeds)
  events.seed.json     ← committed; curated default/fallback data (updated by update-seeds)
  menu.json            ← generated at build time; NOT committed (.gitignore)
  events.json          ← generated at build time; NOT committed (.gitignore)
```

`.gitignore` additions:
```
src/data/menu.json
src/data/events.json
```

Astro components and pages import **only** `menu.json` / `events.json`. The sync scripts write these files; on failure they copy the corresponding seed file so Astro always has something to import.

### How data flows (build-time SSG)

```
Google Sheet (public, "Anyone with link can view")
      │  CSV export — no auth, no API key
      │  https://docs.google.com/spreadsheets/d/{ID}/gviz/tq?tqx=out:csv&gid={GID}
      │  timeout: 10s, retries: 2 (exponential backoff: 1s, 2s)
      ▼
scripts/sync-menu.mjs              scripts/sync-events.mjs
      │  1. fetch CSV                     │  1. fetch CSV
      │  2. parse (csv-parse, Node.js)    │  2. parse (csv-parse, Node.js)
      │  3. validate headers              │  3. validate headers
      │  4. validate rows + dedup         │  4. validate rows + dedup events
      │  5. validate output object        │  5. validate output object
      │  6. write atomically              │  6. write atomically
      │  → on any failure:                │  → on any failure:
      │    copy menu.seed.json → menu.json│    copy events.seed.json → events.json
      ▼                                   ▼
src/data/menu.json              src/data/events.json
  { schemaVersion, generatedAt, source, sheetId, activeRowCount, data: [...] }
  (generated build artifact — not committed to repo)
      └─────────────────────────────────────┘
                     │
                     ▼  astro build bakes JSON into static HTML
                  /dist/
                     │
                     ▼
            Live site (GitHub Pages → Vercel)
```

---

## Seed File Fallback — How It Works

```
Sync succeeds:
  → write fresh data to src/data/menu.json
  → astro build imports fresh data

Sync fails (any reason):
  → WARN/ERROR emitted
  → copy src/data/menu.seed.json → src/data/menu.json
  → astro build imports seed data
  → deploy continues — visitors see last-curated content (may be stale)
```

**Updating seed files (manual):**

```bash
npm run update-seeds
# Script does:
#   npm run prebuild (fetches live sheet → writes menu.json, events.json)
#   cp src/data/menu.json src/data/menu.seed.json
#   cp src/data/events.json src/data/events.seed.json
# Then commit:
git add src/data/menu.seed.json src/data/events.seed.json
git commit -m "chore(data): update seed files from sheet"
```

Run `update-seeds` after significant content changes (new menu season, major events lineup change). Commit the result — it becomes the new fallback baseline.

CI does **not** auto-commit seeds. See Architectural Principle 3 for the reasoning.

---

## Sync Pipeline — Exact Validation Order

Every sync script follows this sequence. Steps are ordered so that the most actionable errors appear first:

Named constants used by both sync scripts (defined in `scripts/lib/sync-sheet.mjs`):

```javascript
const REQUEST_TIMEOUT_MS = 10_000;
const MAX_RETRIES        = 2;      // 2 additional attempts after the first
const MAX_LOG_ROWS       = 1000;
const THROTTLE_MS        = 45_000;
```

```
1. Fetch CSV (timeout: REQUEST_TIMEOUT_MS, up to MAX_RETRIES retries on 5xx/429)
   └── Failure → WARN + copy seed → exit early

2. Check Content-Type header of the response
   └── If content-type starts with "text/html":
         ERROR: "Expected text/csv, got text/html — Google may have returned an error page."
         → copy seed → exit early
   (Catches silent export failures before csv-parse even runs.
    An error page that embeds HTML in a CSV-shaped response cannot be meaningfully parsed.)

3. Log CSV size (bytes) — helps detect silent export failures
   e.g. "CSV: 42 KB (54 rows)" — a sudden drop to 200 bytes means export failed silently

4. Parse CSV with csv-parse (handles quoted commas, embedded newlines)
   └── Parse exception → ERROR: "CSV parse failed: {message}. Using seed fallback."
                       → copy seed → exit early
   (Parse errors are caught separately from validation errors.
    A parse exception = response body is not valid CSV.
    Validation errors = valid CSV with bad row data.)

5. Validate headers — normalize first (trim, lowercase, strip BOM), then check required names
   └── Normalization prevents "Title" vs "title" vs " TITLE" from breaking builds
   └── Missing column → ERROR: "Missing required column: {name}."
                       → copy seed → exit early

6. Validate rows — type, format, required-field checks per row
   └── Invalid rows are skipped with a per-row warning; valid rows continue
   └── If date field fails all ACCEPTED_FORMATS and looks like M/D/YYYY:
         WARN: "Skipping row {n}: date '{val}' looks like US locale (M/D/YYYY).
                Did the sheet locale change from English (India)?"

7. Deduplicate
   Menu:   reject duplicate item IDs; log "duplicate ID {id} — row {n} kept, row {m} skipped"
   Events: reject duplicate (title, date, time) triples; log similarly
   (title+date alone is insufficient: two workshop sessions on the same day differ by time)

8. Apply type-specific zero-row policy (see below)

9. Validate output object (Array.isArray, required keys, JSON.stringify succeeds)
   └── Structural failure → ERROR + copy seed → exit early

10. Write atomically: temp file → rename to target → delete temp on failure
    └── Rename failure → delete .tmp file → exit early (seed file remains untouched)
```

---

## Build Failure Policy

### Zero-row policy — split by data type

**Menu (`sync-menu.mjs`):**

Zero valid rows is always an error. A working café cannot have an empty menu.

```
0 valid menu rows
      ↓
ERROR: "sync-menu: 0 valid rows after validation.
  Possible causes: wrong GID, columns missing, accidental delete.
  Seed fallback will be used. ACTION REQUIRED: check the sheet."
      ↓
Copy menu.seed.json → menu.json
```

**Events (`sync-events.mjs`):**

Zero *active* rows is a valid state (off-season, between programmes). Zero *total* rows is an error.

```
0 active events (all rows have active = FALSE):
      → WARN: "No active events found. Writing empty events list."
      → Write { schemaVersion: 1, ..., activeRowCount: 0, data: [] }
      → Events page shows its "no upcoming events" state — not an error

0 total rows (sheet completely empty):
      → ERROR: "sync-events: sheet appears completely empty. Accidental delete?
          Seed fallback will be used. ACTION REQUIRED."
      → Copy events.seed.json → events.json
```

### Output object validation (final safeguard)

```
→ Array.isArray(data)           must be true
→ every item has required keys  must be true (empty events array passes)
→ JSON.stringify(data) succeeds  must be true
Only if all pass → write atomically
```

### Atomic write strategy

```javascript
const tmp = outPath + '.tmp';
try {
  await fs.writeFile(tmp, JSON.stringify(output, null, 2));
  await fs.rename(tmp, outPath);       // atomic replace on same filesystem
} catch (err) {
  await fs.unlink(tmp).catch(() => {}); // always clean up .tmp on failure
  throw err;
}
```

The `.unlink` catch is silent — if `.tmp` doesn't exist, that's fine. The important thing is that the original seed file is never touched on failure.

---

## CSV Parsing

Sync scripts use **`csv-parse`** (Node.js, streaming, well-maintained, handles all edge cases). Do not use PapaParse — it targets browsers and adds unnecessary weight in a CI/Node context. Do not use `split(',')` under any circumstances.

`csv-parse` handles:
- Quoted fields: `"Chai, with ginger"` — commas inside quotes
- Embedded newlines inside quoted fields (multi-line event descriptions)
- Variable whitespace, BOM characters, Windows-style line endings

**CSV parse errors must be caught separately from row validation errors:**

```javascript
let rows;
try {
  rows = await parseAsync(responseText, { columns: true, skip_empty_lines: true, trim: true });
} catch (err) {
  console.error(`[sync-events] CSV parse failed: ${err.message}. Using seed fallback.`);
  await fs.copyFile(seedPath, outPath);
  return;
}
// Validation only runs if parse succeeded
```

---

## Date Format Policy

Google Sheets exports dates in the sheet locale's format. The locale can change without warning if the sheet owner's Google account locale changes:

| Locale | Exported format |
|---|---|
| English (India) | `10/7/2026` (D/M/YYYY) |
| English (UK) | `10/07/2026` (D/MM/YYYY) |
| English (US) | `7/10/2026` (M/D/YYYY) — parses as wrong month |
| Unformatted | `45482` (serial number — silently meaningless) |

Rather than accepting only one strict format and breaking on legitimate alternatives (e.g., `10-Jul-2026`, `2026-07-10`), sync scripts should normalize using **`date-fns/parse`** with a list of accepted formats:

```javascript
import { parse, isValid } from 'date-fns';

const ACCEPTED_FORMATS = ['d/M/yyyy', 'dd/MM/yyyy', 'yyyy-MM-dd', 'd-MMM-yyyy'];

function parseDate(val) {
  for (const fmt of ACCEPTED_FORMATS) {
    const d = parse(val, fmt, new Date());
    if (isValid(d)) return d;
  }
  return null; // triggers per-row warning: "Skipping row {n}: unrecognised date '{val}'"
}
```

**What is rejected:**
- US locale `M/D/YYYY` — ambiguous with D/M/YYYY; silently wrong months. If a date value matches `M/D/YYYY` pattern but fails all `ACCEPTED_FORMATS`, the per-row warning is specific: `"Skipping row {n}: date '{val}' looks like US locale (M/D/YYYY). Did the sheet locale change from English (India)?"` — rather than a generic invalid-date message.
- Numeric serial dates (e.g. `45482`) — meaningless without Excel epoch interpretation

**Operational note:** Document the required sheet locale (English – India) in the Sheet's About section. If the locale switches to English (US), dates parse as wrong months silently. The accepted format list (`ACCEPTED_FORMATS`) handles legitimate alternative representations without breaking on format edge cases.

---

## JSON Schema and Generated Metadata

Sync scripts wrap their output array in a metadata envelope. The envelope aids debugging (stale deployments, sync failures) and provides a schema migration hook.

```json
{
  "schemaVersion": 1,
  "generatedAt": "2026-07-10T09:15:22Z",
  "source": "Google Sheets",
  "sheetId": "1Vbjc75P7A3dT…",
  "buildId": "8329482381",
  "activeRowCount": 8,
  "data": [ ...items... ]
}
```

**`buildId`** is `process.env.GITHUB_RUN_ID` (GitHub Actions) or `process.env.VERCEL_GIT_COMMIT_SHA` (Vercel), whichever is set. When debugging a production issue — "are we serving stale data from build X or fresh data from build Y?" — the `buildId` field in the deployed JSON is the answer without needing to look up CI logs.

**`activeRowCount`** is defined as: the count of items in `data[]` — i.e., rows that passed all validation, deduplication, and active-flag filtering. It does not count raw CSV rows, invalid rows, or inactive rows. When debugging, compare `activeRowCount` in the file against the build log's "total rows" count to find what was filtered.

**Schema version compatibility:** Consumers must assert the version explicitly:

```javascript
const SUPPORTED_SCHEMA_VERSION = 1;
const file = await import('~/data/menu.json');
if (file.schemaVersion !== SUPPORTED_SCHEMA_VERSION) {
  throw new Error(`menu.json: expected schemaVersion ${SUPPORTED_SCHEMA_VERSION}, got ${file.schemaVersion}`);
}
const menuRows = file.data;
```

When the schema changes (e.g., `venue` → `location`), increment `schemaVersion` to `2`. All consumers must be updated before deploying a `v2`-producing sync script. The build fails explicitly — not silently — on version mismatch.

**Impact on existing imports:** After this migration, all import sites must read `.data`:

```javascript
// Before:
import menuRows from '~/data/mockMenuData.json';

// After:
import menuFile from '~/data/menu.json';
const menuRows = menuFile.data;
```

One-time migration across ~5–8 import sites.

**Note on `mockMenuData.json`:** This filename is a legacy artifact. It must be renamed to `menu.json` as part of this migration. All references in `scripts/sync-menu.mjs`, `src/pages/menu.astro`, `src/components/islands/CafeApp.jsx`, and any other import sites must be updated.

---

## Network Resilience: Timeout and Retry Policy

Both sync scripts use `REQUEST_TIMEOUT_MS`, `MAX_RETRIES` constants from `scripts/lib/sync-sheet.mjs`:

- **Timeout:** `REQUEST_TIMEOUT_MS` (10s) via `AbortSignal.timeout(REQUEST_TIMEOUT_MS)` in Node.js native fetch
- **Retries:** `MAX_RETRIES` (2) additional attempts on **429 and 5xx** (429, 502, 503, 504), with exponential backoff: 1s, then 2s
  - 429 (rate limit) is transient; Google Sheets occasionally rate-limits CSV exports during high-traffic periods
  - 5xx are infrastructure errors, also transient
- **No retry on other 4xx** — retrying won't help (wrong URL, wrong permissions, etc.)
- **After all retries exhausted:** copy seed fallback

---

## Concurrency Policy

```yaml
concurrency:
  group: deploy
  cancel-in-progress: ${{ github.event_name == 'repository_dispatch' }}
```

For `repository_dispatch` (sheet-triggered builds), cancel any in-progress build. For `push` events (code changes), allow code deployments to complete normally.

---

## Observability

### Sync script build log output

```
[sync-menu]   Sheet 1Vbjc75P7A3dT… gid=0 fetched at 2026-07-10T09:15:00Z (attempt 1)
[sync-menu]   CSV: 38 KB (54 rows) — content-type: text/csv ✓
[sync-menu]   Headers OK (normalized): category, subcategory, itemName, price, description
[sync-menu]   Wrote 54 items across 4 categories (3 skipped: 2 invalid price, 1 duplicate ID)
[sync-menu]   Metadata: { schemaVersion: 1, buildId: "8329482381", activeRowCount: 54, generatedAt: 2026-07-10T09:15Z }
[sync-menu]   Completed in 0.9s
[sync-events] Sheet 1Vbjc75P7A3dT… gid=985432 fetched at 2026-07-10T09:15:01Z (attempt 1)
[sync-events] CSV: 6.2 KB (13 rows) — content-type: text/csv ✓
[sync-events] Headers OK (normalized): title, date, time, venue, description, image, active
[sync-events] Wrote 8 active events (13 total, 4 inactive, 1 duplicate-skipped, 0 invalid)
[sync-events] Metadata: { schemaVersion: 1, buildId: "8329482381", activeRowCount: 8, generatedAt: 2026-07-10T09:15Z }
[sync-events] Completed in 1.2s
```

CSV size is logged explicitly. A sudden drop from `38 KB` to `200 bytes` means the export returned an error page rather than CSV — caught before any row parsing runs.

### Trigger Log tab in the Google Sheet

> **Naming:** Renamed from "Dispatch Log" to **Trigger Log** to avoid confusion. This tab logs Apps Script trigger attempts only — it does not record build results or deployment status.

| Timestamp | Status | HTTP Code | Duration (ms) | Notes |
|---|---|---|---|---|
| 2026-07-10 15:20 | OK | 204 | 312 | Trigger attempt 1 |
| 2026-07-10 09:02 | FAILED | NO_TOKEN | — | `GH_TOKEN` property not set |
| 2026-07-10 09:01 | FAILED | 404 | 201 | body: {"message":"Not Found","documentation_url":…} |
| 2026-07-10 08:55 | FAILED | 403 | 189 | body: {"message":"Resource not accessible by integration"…} |
| 2026-07-10 08:40 | FAILED | 503 | 8043 | Attempt 3 — giving up; body: (empty) |
| 2026-07-10 07:30 | FAILED | NETWORK_ERROR | — | UrlFetchApp exception |

**Duration (ms):** Total wall-clock time from first fetch attempt to final response (or error). Lets you observe if GitHub is becoming slow over time. A 8000ms entry vs. typical 200ms entries is an early signal.

Notes include the first 120 characters of the response body on non-204 responses. A `403` body immediately distinguishes "wrong permissions" from "wrong repo name" without checking GitHub docs.

**Rotation:** Trimmed automatically to last 1000 rows via `trimLog_()`.

**`OK 204 ≠ site updated`:** A `OK 204` entry means GitHub accepted the dispatch. The build could still fail or be cancelled. For build/deploy status, check GitHub Actions or Vercel dashboard.

### Health check (operational)

Because the site can go weeks without edits, the Apps Script trigger can die silently and go unnoticed. **Quarterly** (not monthly — the daily cron already exercises most of the pipeline):

1. Make a minor invisible edit (e.g., toggle a hidden column cell)
2. Confirm Trigger Log shows `OK 204` within 60s
3. Undo the edit

The daily cron proves sync scripts, build, and deployment. The quarterly check is the only thing that verifies the Apps Script trigger itself still fires — a much smaller risk surface than monthly.

Alternatively, instrument a nightly cron that writes a `health.json` timestamp artifact — verifying the trigger fires even without real content changes.

---

## Observability on Apps Script throttle behavior

The Apps Script implements a **throttle** (not a debounce):

```
Throttle behavior:
  11:00:00 — edit → dispatch fires
  11:00:20 — edit → ignored (within 45s window)
  11:00:40 — edit → ignored (within 45s window)
  11:00:46 — nothing fires automatically
```

This is intentional. For this site's use case (sheet edits are low-frequency, build reads live sheet state at build time), it is acceptable that edits during the 45s cooldown do not trigger an additional build. The daily drift correction cron catches any missed content.

A true debounce (fire 45s after the LAST edit) would require a secondary time-based trigger. The throttle is simpler, fewer moving parts, and correct for this edit frequency.

---

## Operational Ownership

### Infrastructure (Repo owner — Soham)
- GitHub Actions workflow (`build.yml`) — triggers, cron, CI steps
- GitHub Secrets — `MENU_SHEET_ID`, `EVENTS_SHEET_ID`, and related vars
- Vercel project and environment variables (Phase 2)
- Vercel Deploy Hook URL (Phase 2) — treat as a secret; see security note

### Content (Café manager / sheet owner)
- Google Sheet — data accuracy, column structure, keep public
- Sheet locale — must remain English (India) for correct date parsing
- Trigger Log tab — monitor for failed entries; check monthly health check

### Credentials (Repo owner — Soham)
- GitHub fine-grained PAT (Phase 1) — create, store in Apps Script, rotate annually
- Apps Script project — `GH_TOKEN` or `VERCEL_HOOK` in Script Properties
- Vercel Deploy Hook (Phase 2) — URL is equivalent to a password; rotate if leaked

**If ownership changes:** create new credentials for the new owner and revoke the old ones.

---

## Phase 1 — MVP: Complete GitHub Pages Pipeline

### Step 1 — Create a GitHub Fine-Grained PAT

> **Permission note:** `repository_dispatch` requires **Actions: Write** (not `Contents: Read and Write`). Verify the label in the current GitHub UI — it has changed across versions.

1. GitHub → Settings → Developer settings → Personal access tokens → Fine-grained tokens
2. Name: `MIME-Website Sheet Trigger`, Expiry: 1 year
3. Repository access: Only `MIME-Website`
4. **Permissions → Repository → Actions: Read and write**
5. Generate → copy immediately

**Security:** Store only in Apps Script Script Properties. Never paste into a sheet cell, comment, or shared document. Set a calendar reminder for annual renewal.

### Step 2 — Add Apps Script to the Google Sheet

Uses a **throttle** (`LAST_DISPATCH_AT` in Script Properties, 45s cooldown). No trigger churn. Trigger Log capped at 1000 rows. Response body included in failed entries.

```javascript
const REPO_OWNER    = 'SohamDutta2001';
const REPO_NAME     = 'MIME-Website';
const EVENT_TYPE    = 'sheet-edit';
const THROTTLE_MS   = 45 * 1000;  // fires immediately; then ignores edits for 45s
const MAX_RETRIES   = 3;          // total attempts (1 initial + 2 retries)
const MAX_LOG_ROWS  = 1000;
// IMPORTANT: Sheet locale must remain English (India) — D/M/YYYY expected by sync scripts

function onEdit(e) {
  const props = PropertiesService.getScriptProperties();
  const lastDispatch = Number(props.getProperty('LAST_DISPATCH_AT') || '0');
  if (Date.now() - lastDispatch < THROTTLE_MS) return; // throttle window active
  props.setProperty('LAST_DISPATCH_AT', String(Date.now()));
  fireDispatch_();
}

function fireDispatch_() {
  const token = PropertiesService.getScriptProperties().getProperty('GH_TOKEN');
  if (!token) { logToSheet_('FAILED', 'NO_TOKEN', null, 'GH_TOKEN property not set'); return; }

  const url = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/dispatches`;
  const payload = JSON.stringify({ event_type: EVENT_TYPE });
  const start = Date.now();

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const res = UrlFetchApp.fetch(url, {
        method: 'post',
        contentType: 'application/json',
        headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github+json' },
        payload,
        muteHttpExceptions: true,
      });
      const code = res.getResponseCode();
      const duration = Date.now() - start;
      if (code === 204) {
        logToSheet_('OK', '204', duration, `Trigger attempt ${attempt}`);
        return;
      }
      if ([429, 502, 503, 504].includes(code) && attempt < MAX_RETRIES) {
        Utilities.sleep(Math.pow(2, attempt - 1) * 1000);
        continue;
      }
      const body = res.getContentText().slice(0, 120).replace(/\n/g, ' ');
      logToSheet_('FAILED', String(code), duration, `Attempt ${attempt} — giving up; body: ${body}`);
      return;
    } catch (err) {
      if (attempt < MAX_RETRIES) { Utilities.sleep(Math.pow(2, attempt - 1) * 1000); continue; }
      logToSheet_('FAILED', 'NETWORK_ERROR', null, String(err).slice(0, 120));
    }
  }
}

function logToSheet_(status, code, durationMs, notes) {
  try {
    const log = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Trigger Log');
    if (!log) return;
    log.appendRow([new Date(), status, code, durationMs !== null ? durationMs : '—', notes]);
    trimLog_(log);
  } catch (_) {}
}

function trimLog_(log) {
  const rows = log.getLastRow();
  if (rows > MAX_LOG_ROWS + 1) log.deleteRows(2, rows - MAX_LOG_ROWS - 1);
}
```

Setup:
1. Google Sheet → **Extensions → Apps Script**
2. Delete existing `Code.gs` → paste script above → Save → Name project `MIME-Website Trigger`

### Step 3 — Store the PAT

Apps Script → **Project Settings → Script Properties** → add `GH_TOKEN` → value: PAT from Step 1.

### Step 4 — Install the Installable Trigger

Simple `onEdit` triggers only fire for the script owner's own edits. An installable trigger fires for all users.

1. Apps Script → **Triggers (clock icon) → + Add Trigger**
2. Function: `onEdit`, Event source: From spreadsheet, Event type: On edit
3. Save → authorize external URL access when prompted

### Step 5 — Create the Trigger Log Tab

Add a tab named exactly **Trigger Log**. Add headers in row 1: `Timestamp`, `Status`, `HTTP Code`, `Duration (ms)`, `Notes`.

### Step 6 — Test

Run the **Verification Checklist** at the bottom of this document. Start with Smoke Tests (5 checks), then Failure Injection (13 checks). Stop if any test fails — fix the issue before proceeding to Disaster Recovery.

### Step 7 — Maintenance

- **PAT renewal (yearly):** new token → update `GH_TOKEN` → test with a sheet edit
- **If trigger stops firing:** check Trigger Log. If >48h old despite edits, delete and recreate the installable trigger (Step 4).
- **Daily cron (07:00 IST) is drift correction.** It catches accumulated gaps but cannot substitute for a healthy trigger. 24-hour data drift is acceptable; longer means the trigger is broken.
- **Seed files:** Run `npm run update-seeds` and commit after significant menu or events changes (new menu season, major events change).
- **Quarterly health check:** Make a minor invisible edit → confirm `OK 204` in Trigger Log within 60s → undo. The daily cron covers everything else; this verifies only the Apps Script trigger, which is the one thing the cron doesn't exercise.
- **Sheet copied:** Apps Script copies too, but Script Properties do **not**. Set `GH_TOKEN` in Script Properties of the copy before use.

---

## Phase 2 — Production: Vercel + Custom Domain

When the domain is purchased, migrate to Vercel. GitHub Actions is removed from the deploy path; the Apps Script trigger switches from GitHub PAT to a **Vercel Deploy Hook**.

**GitHub Actions is not deleted.** CI remains; only deployment moves to Vercel.

### Trigger chains after migration

```
Code change → push to main → Vercel auto-deploys (native GitHub integration)
Sheet edit  → Apps Script (throttle: 45s) → POST to Vercel Deploy Hook
                               → Vercel build: sync scripts → astro build → live (~2–3 min)
```

> **Latency note:** Vercel Deploy Hooks queue a full Astro build — not an instant content swap. Sheet edit → live site remains ~2–3 minutes in Phase 2, identical to Phase 1. Near-instant updates require SSR (see Future Considerations).

### Why Deploy Hooks replace PATs in Phase 2

| | GitHub PAT (Phase 1) | Vercel Deploy Hook (Phase 2) |
|---|---|---|
| Expiry | 1 year — must renew | Never |
| Scope if leaked | Can trigger GitHub workflows (`Actions:write`) | Triggers rebuilds only — no repo access |
| Rotation time | ~5 minutes | ~30 seconds |

> **Security note:** The Vercel Deploy Hook URL has no authentication. Anyone who possesses it can trigger a rebuild. Treat it as a password. Store it only in Apps Script Script Properties (`VERCEL_HOOK`). Never commit it to the repo. If leaked, delete the hook and create a new one (30 seconds).

### What changes in the codebase

- `astro.config.mjs` — add `adapter: vercel()` from `@astrojs/vercel/static`
- `.github/workflows/build.yml` — remove the three Pages deploy steps; keep CI; no seed auto-commit (see Principle 3)
- `package.json` — add `@astrojs/vercel`
- Apps Script — update `fireDispatch_()` to POST to Vercel Deploy Hook URL (see below)

### Step-by-step Vercel migration

1. vercel.com → Add New → Import Git Repository → `MIME-Website`
2. Framework: Astro, Build Command: `npm run build`
3. Env vars: `MENU_SHEET_ID`, `MENU_SHEET_GID`, `EVENTS_SHEET_ID`, `EVENTS_SHEET_GID` — do **not** set `GITHUB_PAGES`
4. Enable Auto Deploy on push to `main` → Deploy → verify

**Configure Deploy Hook:**

5. Vercel → Project → **Settings → Git → Deploy Hooks** → create `Sheet Sync` on branch `main` → copy URL
6. Update Apps Script `fireDispatch_()`:

```javascript
function fireDispatch_() {
  const props = PropertiesService.getScriptProperties();
  const hookUrl = props.getProperty('VERCEL_HOOK');
  if (!hookUrl) { logToSheet_('FAILED', 'NO_HOOK', null, 'VERCEL_HOOK property not set'); return; }

  const start = Date.now();
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const res = UrlFetchApp.fetch(hookUrl, { method: 'post', muteHttpExceptions: true });
      const code = res.getResponseCode();
      const duration = Date.now() - start;
      if (code === 201) { logToSheet_('OK', '201', duration, `Trigger attempt ${attempt}`); return; }
      if ([429, 502, 503, 504].includes(code) && attempt < MAX_RETRIES) {
        Utilities.sleep(Math.pow(2, attempt - 1) * 1000); continue;
      }
      const body = res.getContentText().slice(0, 120).replace(/\n/g, ' ');
      logToSheet_('FAILED', String(code), duration, `Attempt ${attempt} — giving up; body: ${body}`);
      return;
    } catch (err) {
      if (attempt < MAX_RETRIES) { Utilities.sleep(Math.pow(2, attempt - 1) * 1000); continue; }
      logToSheet_('FAILED', 'NETWORK_ERROR', null, String(err).slice(0, 120));
    }
  }
}
```

7. Apps Script Script Properties: remove `GH_TOKEN`, add `VERCEL_HOOK`
8. Delete the old GitHub PAT

**Domain setup:**

9. Vercel → Settings → Domains → add `artteastreecafe.com` and `www.artteastreecafe.com`
10. DNS:

```
A      @    76.76.21.21
CNAME  www  cname.vercel-dns.com
```

SSL provisions automatically.

---

## Rollback Procedure

Options ordered fastest to slowest:

### Option A — Revert the sheet (fastest)

1. Sheet → undo incorrect edit
2. Edit any other cell to trigger a dispatch
3. Build runs → site updated in ~2–3 min

### Option B — Redeploy previous deployment (Phase 2, Vercel only)

1. Vercel → Deployments → find last known-good
2. Redeploy → instant swap (no rebuild)

### Option C — Revert seed files

1. `git log -- src/data/events.seed.json` → find known-good commit
2. `git checkout {commit} -- src/data/*.seed.json`
3. `git commit -m "revert: restore seed data"` → push
4. If sync fails on the next build, reverted seed is used as fallback

### Option D — Emergency manual deploy (Phase 1 only)

GitHub → Actions → Run workflow manually → deploy in ~2 minutes.

---

## Future Considerations

### Near-instant updates via SSR (optional)

SSR where `/events` fetches Sheet data at request time (~60s cache TTL) would reduce latency from ~2 min to ~60s.

| | SSG (current) | SSR |
|---|---|---|
| Sheets availability | Only affects builds | Affects every visitor request |
| Sheets outage | No impact between builds | Broken page for visitors |
| Complexity | Low | Medium — must design failure path first |

**Design the failure path before implementing SSR.** For this edit cadence, SSG is correct.

### Shared sync helper: `scripts/lib/sync-sheet.mjs`

Both `sync-menu.mjs` and `sync-events.mjs` share nearly identical fetch/parse/validate/write logic. A shared helper eliminates duplication and makes a future third data source trivial to add:

```javascript
// scripts/lib/sync-sheet.mjs — exports shared primitives
export { fetchCsv, checkContentType, validateHeaders, atomicWrite, copySeed, logSummary };
export const REQUEST_TIMEOUT_MS = 10_000;
export const MAX_RETRIES        = 2;
export const MAX_LOG_ROWS       = 1000;
```

`sync-menu.mjs` and `sync-events.mjs` import from this helper and implement only their domain-specific row validation and dedup logic.

### Config-driven sync (when a third data source is added)

```javascript
const SHEETS = [
  { name: 'menu',   seed: 'src/data/menu.seed.json',   out: 'src/data/menu.json',   parse: parseMenu },
  { name: 'events', seed: 'src/data/events.seed.json', out: 'src/data/events.json', parse: parseEvents },
];
```

Implement when needed.

---

## Risk Register

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Apps Script trigger dies silently | Low | Real-time updates stop; drift correction still fires | Monthly health check; Trigger Log >48h stale → recreate trigger |
| GitHub PAT expires | Certain (yearly) | `FAILED 401` in Trigger Log | Calendar reminder; renew in 5 min |
| Vercel Deploy Hook URL leaked (Phase 2) | Very low | Attacker can trigger rebuilds — no repo access | Delete hook → create new (30 sec) |
| Sheet set to Restricted accidentally | Low | Fetch fails → seed fallback → build continues | Make public to restore live sync |
| Google changes CSV endpoint or escaping | Very low | csv-parse handles most changes; seed fallback if not | Monitor build logs; plan Sheets API migration |
| Zero active events (intentional) | Expected | Events page shows "no upcoming events" — valid | Write empty array; UI handles this state |
| Zero total rows (accidental delete) | Low | ERROR; seed fallback; site stays up | Check Trigger Log and build logs; restore rows |
| Sheet column renamed without sync script update | Medium | Header ERROR at step 3 of pipeline; seed fallback | Caught before any row parsing — clear error message |
| Sheet locale changes from English (India) | Low | Date parsing breaks silently | `date-fns` multi-format list; warn on unrecognised formats |
| CSV parse exception (malformed response) | Very low | Caught separately; seed fallback | CSV size log (step 4) detects silent failures before parse |
| Duplicate events (same title + date + time) | Low | Duplicate cards on site | Dedup at step 6; log which rows were skipped |
| PAT missing `Actions: Write` | Low (setup time) | `FAILED 403` in Trigger Log; response body distinguishes this | Verify at token creation |
| Google Sheets rate limiting / temporary quota | Very low | Transient 429; 2 retries with backoff cover most cases | 429 is in the retry list; if recurring, increase `MAX_RETRIES` |
| Trigger Log grows unboundedly | Low (slow onset) | `appendRow()` slows above ~40,000 rows | `trimLog_()` keeps last 1000 rows automatically |
| Seed files become stale | Medium | Fallback data lags weeks behind live content | `npm run update-seeds` after significant changes; Phase 2: CI auto-update |
| `menu.json` / `events.json` accidentally committed | Low | Noisy PRs; confusing rollbacks | `.gitignore` entries prevent this |
| Throttle drops edits during 45s cooldown | Expected | Last edit in a burst doesn't trigger a build | Daily drift correction catches any missed content |

---

## Files Changed Per Phase

### Phase 1 — repo changes + Apps Script setup

- `.gitignore` — add `src/data/menu.json` and `src/data/events.json`
- `src/data/menu.seed.json` — rename from `mockMenuData.json`
- `src/data/events.seed.json` — create with current sheet state if not present
- `scripts/lib/sync-sheet.mjs` — **new shared helper** containing: `fetchCsv()`, `checkContentType()`, `validateHeaders()` (with normalization), `atomicWrite()` (with .tmp cleanup), `retryFetch()` (429+5xx), `copySeed()`, `logSummary()`; exports `REQUEST_TIMEOUT_MS`, `MAX_RETRIES`, `MAX_LOG_ROWS` constants
- `scripts/sync-menu.mjs` — refactored to use `sync-sheet.mjs`; implements only menu-specific row validation and dedup logic
- `scripts/sync-events.mjs` — refactored to use `sync-sheet.mjs`; implements only events-specific row validation, dedup (title+date+time), zero-row policy
- `package.json` — add `csv-parse`, `date-fns`; add `update-seeds` script
- All import sites (~5–8 files) — update `mockMenuData.json` → `menu.json`; assert `schemaVersion`; read `.data` property
- Google Sheet: Apps Script added, Trigger Log tab created (5 columns including Duration)
- GitHub: fine-grained PAT created → stored in Apps Script Script Properties

### Phase 2 — Production (Vercel)

- `astro.config.mjs` — add `adapter: vercel()`
- `package.json` — add `@astrojs/vercel`
- `.github/workflows/build.yml` — remove Pages deploy steps; add concurrency policy; keep CI; no seed auto-commit
- Apps Script: `GH_TOKEN` → `VERCEL_HOOK` in Script Properties

### Schema envelope migration (same time as Phase 1 sync script updates)

- Both sync scripts — wrap output in metadata object
- All import sites — update to read `.data` property

---

## Verification Checklist

### Smoke Tests (run first — fast, covers happy path)

1. Edit a cell → Trigger Log shows `OK 204` within ~60s → GitHub Actions run appears → completes
2. Live site reflects the change
3. `npm run prebuild` locally → `src/data/menu.json` and `events.json` written with correct metadata
4. **Addition test:** New event (`active` = TRUE) → rebuild → appears on site
5. **Deletion test:** Set `active` = FALSE → rebuild → disappears (most common regression)

### Failure Injection Tests

6. **Empty events:** All events `active` = FALSE → rebuild → "no upcoming events" state (not an error)
7. **Empty menu (staging):** Delete all menu rows → rebuild → ERROR, seed fallback used, site stays up
8. **Header rename:** Rename required column → rebuild → `Missing required column`, seed fallback used
9. **CSV parse failure:** Break CSV URL → rebuild → `CSV parse failed`, seed fallback used
10. **Duplicate event:** Two rows with identical title + date + time → rebuild → one appears, dedup log shows skipped row
11. **Throttle:** Edit 5 cells rapidly → single `OK 204` in Trigger Log
12. **Auth failure:** Invalid `GH_TOKEN` → `FAILED 401; body: {"message":"Bad credentials"…}`. Restore token.
13. **Fallback:** Temporarily restrict sheet → rebuild → WARN + seed fallback → site deploys

### Disaster Recovery Tests

14. **Rollback (Option A):** Revert sheet change → dispatch → previous data restored in ~2–3 min
15. **Escape hatch:** GitHub → Actions → Run workflow manually → rebuild in under 2 minutes
16. **Seed update:** `npm run update-seeds` → files updated → commit succeeds → seeds match live sheet
17. **Quarterly health check:** Edit hidden cell → Trigger Log shows `OK 204` within 60s → undo edit
18. **Cron verification:** 07:00 IST daily run completes (drift correction — not a trigger health indicator)
19. **Content-Type guard:** Temporarily replace the CSV URL with a URL that returns HTML → rebuild → `Expected text/csv, got text/html` error, seed fallback. Restore URL.
20. **429 retry:** Simulate a 429 response → verify script retries and succeeds on next attempt (or falls back after MAX_RETRIES)
21. **buildId in output:** Check `src/data/menu.json` after a CI build — `buildId` matches `GITHUB_RUN_ID` from Actions log

### Phase 2 Additional Tests

1. Push to `main` → Vercel auto-deploys; GitHub Actions does not deploy
2. `artteastreecafe.com` loads with valid SSL
3. `<link rel="canonical">` shows `artteastreecafe.com`
4. Sheet edit → `OK 201` in Trigger Log → Vercel build completes in ~2–3 min (expected)
5. Repeat smoke + failure injection tests on Vercel build
6. **Option B rollback:** Vercel → Deployments → Redeploy previous → instant swap
7. **No CI seed commits:** After a successful sheet-triggered build, `git log` shows no auto-commit. Seed updates are manual only.
8. Deploy Hook URL not present in any committed file (`grep -r VERCEL_HOOK . | grep -v "\.md$"` → empty)
