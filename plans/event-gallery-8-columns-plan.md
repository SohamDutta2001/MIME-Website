# Plan: Replace single `galleryUrls` cell with 8 separate Gallery URL columns

> **Status:** Draft for external review (ChatGPT) — do not implement until approved.

## Context

Today, adding multiple event photos means pasting several Drive/Cloudinary links into
one Google Sheet cell (`galleryUrls`), separated by manually inserting a newline with
Alt+Enter (Windows) / ⌘+Enter (Mac) between each link. This is fiddly for non-technical
café staff — it's easy to mis-type the shortcut, hard to see how many links are already
in the cell, and error-prone to edit one link without disturbing the others.

The fix: replace that one cell with **8 separate columns** — `Gallery URL 1` through
`Gallery URL 8` — so each photo link gets its own ordinary cell. Staff just paste a link,
Tab to the next column, paste the next link. No keyboard shortcut, no hidden newlines.

Eight is a UX choice, not a technical limit — current events use 1-3 photos, and eight
gives ample headroom while keeping the sheet scannable. If this cap needs to change
later, it's one constant (`GALLERY_URL_COLUMN_COUNT`) plus the sheet template — see
Implementation §1. **Column order determines display order** on the site (column 1's
photo shows first, etc.) — this is now a staff-editable behavior, not just a technical
detail.

This only touches how the sync script *collects* gallery links from the sheet. The
output shape the rest of the site consumes (`event.galleryUrls: string[]`) does not
change, so no frontend code is touched.

> **Revision note:** this plan was reviewed externally (ChatGPT) and scored 9.8/10 —
> architecture and migration strategy were called out as excellent with no structural
> concerns. Seven refinements were recommended and are folded in below: deduplication,
> a legacy-multiline warning, an overflow cap, URL-format validation, a helper-function
> extraction, a rollback step, and three additional verification cases. The reviewer's
> suggestion to keep a permanent dual-read compatibility shim was explicitly rejected —
> it agreed with this plan's original clean-cutover decision.

## How it works today (verified in code)

- `scripts/sync-events.mjs` line 84-87 (`REQUIRED_HEADERS`) requires a `galleryurls`
  header to exist in the sheet (build fails loudly if it's missing/renamed).
- Line 228-231, per event row:
  ```js
  galleryUrls: cell(r, 'galleryurls')
    .split(/\r?\n/)
    .map((u) => u.trim())
    .filter(Boolean),
  ```
- `cell()` / `normalizeHeader()` (`scripts/lib/sync-sheet.mjs` lines 78-95) do fuzzy
  header matching: case, spaces, and underscores are ignored, so `"Gallery URL 1"`,
  `"gallery_url_1"`, and `"GALLERY URL1"` all normalize to `galleryurl1`. Digits pass
  through unchanged, so 8 distinct numbered headers normalize to 8 distinct keys.
- `validateHeaders()` (`sync-sheet.mjs` lines 82-89) throws
  `Missing required columns: X, Y` naming every missing header — this is what currently
  protects `galleryUrls` and will protect the 8 new columns the same way.
- Frontend consumption (`src/components/events/EventGallery.astro`, `src/types/event.ts`
  line 56, `src/lib/events/images.js`) already treats `galleryUrls` as an ordered
  `string[]` of arbitrary length — the photo grid, the tilt-rotation cycling (a 6-entry
  array cycled via `i % tilts.length`), and the Drive-link resolver all work unchanged
  regardless of whether the array came from 1 column or 8. **No frontend changes.**

## Decisions locked in with the site owner

- **Column names:** `Gallery URL 1` … `Gallery URL 8` (normalizes to `galleryurl1`…`galleryurl8`).
- **Migration style:** clean cut-over — delete the old `galleryUrls` column once existing
  rows are redistributed into the 8 new columns. No dual-read/merge fallback kept in code
  (matches this project's existing preference for direct migrations over compatibility
  shims — see `[[workflow-one-phase-at-a-time]]`-style history of clean menu/category cutovers).
- **Column-fill semantics:** fill left-to-right; any subset of the 8 can be left blank
  (e.g. only columns 1 and 3 filled is fine — non-empty values are collected in column
  order and blanks are simply skipped, not padded).
- **Header requirement:** all 8 headers stay in `REQUIRED_HEADERS` (fail-loud), matching
  how `galleryUrls` is required today — a renamed/missing column fails the build with a
  clear message instead of silently dropping photos on the live site.
- **Duplicate URLs:** deduplicated, first occurrence wins, order preserved (via
  `[...new Set(urls)]`). Protects against accidental copy-paste of the same link into
  two columns without silently doubling a photo in the gallery.
- **Legacy multi-line paste (old Alt+Enter habit reapplied to a single new column):**
  still tolerated and split (as originally planned), but now logs a warning naming the
  row and column, so we can see whether the old habit is still happening in practice —
  and eventually remove the tolerance once it stops.
- **Overflow (more than 8 URLs collected, e.g. from a legacy multi-line paste):** warn
  and truncate to the first 8 (in column/line order), rather than error or silently
  keep all of them. Keeps the "8 is the cap" contract honest without hard-failing the
  build over a paste mistake.
- **URL format:** each collected value must start with `http://` or `https://`, or it's
  dropped with a warning naming the row and column. Prevents stray text (a typo, a
  half-pasted link) from becoming a broken `<img>` src on the live site.

## Implementation

### 1. `scripts/sync-events.mjs`

**Header comment** (lines 12-14) — update the documented column list to spell out the
8 gallery columns instead of the single `galleryUrls`.

**`REQUIRED_HEADERS`** (lines 84-87) — replace the single `'galleryurls'` entry with 8
generated entries. The count lives in one named constant so raising the cap later (e.g.
to 12) is a one-line change plus a sheet-template update, not a find-and-replace:

```js
// UX choice, not a technical limit — current events use 1-3 photos; 8 gives headroom
// while keeping the sheet scannable. Raise this (and the sheet template) if that changes.
const GALLERY_URL_COLUMN_COUNT = 8;
const GALLERY_URL_HEADERS = Array.from(
  { length: GALLERY_URL_COLUMN_COUNT },
  (_, i) => `galleryurl${i + 1}`,
);

const REQUIRED_HEADERS = [
  'active', 'category', 'title', 'date', 'time', 'venue', 'bannerurl',
  'description', 'additionalinfo', ...GALLERY_URL_HEADERS, 'registrationurl',
];
```

**Row-mapping** (lines 228-231) — the single-cell split grows a few new rules (dedupe,
overflow cap, URL-format check, legacy-paste warning per the decisions above), so it's
pulled into a small named helper instead of staying an inline chain — keeps the
per-row event-building block readable:

```js
// Collects one event row's gallery links from its 8 columns into an ordered,
// deduplicated array (first occurrence wins). Column order == display order.
// Tolerates a leftover Alt+Enter multi-line paste in any single cell (old habit)
// by splitting it too, but warns so we can tell if that's still happening.
function collectGalleryUrls(row, rowNum, label) {
  const raw = GALLERY_URL_HEADERS.map((h) => cell(row, h));

  const multilineIndex = raw.findIndex((v) => /\r?\n/.test(v));
  if (multilineIndex !== -1) {
    console.warn(`[${label}] row ${rowNum}: Gallery URL ${multilineIndex + 1} has multiple lines — old Alt+Enter habit? Splitting it anyway.`);
  }

  const urls = raw
    .flatMap((u) => u.split(/\r?\n/))
    .map((u) => u.trim())
    .filter(Boolean)
    .filter((u) => {
      const looksLikeUrl = /^https?:\/\//i.test(u);
      if (!looksLikeUrl) console.warn(`[${label}] row ${rowNum}: skipping gallery value that isn't a link: "${u}"`);
      return looksLikeUrl;
    });

  const deduped = [...new Set(urls)]; // Set preserves first-seen insertion order

  if (deduped.length > GALLERY_URL_COLUMN_COUNT) {
    console.warn(`[${label}] row ${rowNum}: ${deduped.length} gallery URLs collected — truncating to ${GALLERY_URL_COLUMN_COUNT}`);
    return deduped.slice(0, GALLERY_URL_COLUMN_COUNT);
  }
  return deduped;
}
```

Then the row-mapping object becomes a single call:

```js
galleryUrls: collectGalleryUrls(r, rowNum, label),
```

Output contract is still unchanged: `galleryUrls: string[]`, order preserved, `[]` when
all 8 are empty — identical to today's empty-cell behavior, just with dedupe/format/
overflow guards added on top.

### 2. Docs to update in the same change

All three currently teach the Alt+Enter technique and must not go stale:

- **`docs/HOW_TO_UPDATE_EVENTS.md`** line 39 — replace the `galleryUrls` table row with
  guidance to paste each link into its own `Gallery URL 1`…`Gallery URL 8` column,
  filling left to right, leaving unused columns blank. Add two short notes: links must
  start with `http://` or `https://` (plain text is skipped), and the column order is
  the order photos appear on the site.
- **`docs/sheets-template.md`** line 75 (column table) and lines 99-105 (the "Tip:
  multiple gallery photos" / Alt+Enter walkthrough) — replace both with the 8-column
  instructions; the tip section becomes unnecessary and should be deleted rather than
  reworded.
- **`docs/SETUP.md`** line 183 — update the column reference table the same way, so a
  fresh sheet built from this doc has the right headers from day one.
- **`docs/events-template.csv`** — header row (currently line 1) gets `Gallery URL 1`
  through `Gallery URL 8` in place of the single `galleryUrls` column; the 3 sample rows'
  existing multi-line gallery values get redistributed across those 8 columns (1-3 URLs
  filled left to right per sample row, rest blank) as a working example of the new format.

### 3. No changes needed

- `scripts/lib/sync-sheet.mjs` — `cell()`/`normalizeHeader()`/`validateHeaders()` are
  fully generic; no special-casing required for numbered columns.
- `src/types/event.ts`, `src/components/events/EventGallery.astro`,
  `src/lib/events/images.js`, `src/lib/img.js` — already operate on `galleryUrls: string[]`
  generically regardless of source column count.
- `.github/workflows/build.yml` — no column-name coupling.
- `scripts/process-event-photos.mjs` — unrelated static local-asset pipeline, not
  Sheet-driven.

### 4. Migration of the currently-live sheet data

The live Events tab presently has ~8 events with 1-3 gallery links each, packed into the
single `galleryUrls` cell. Migration is a one-time manual step on the sheet, done in one
sitting so there's never a window where the sheet has neither the complete old shape nor
the complete new shape:

1. Before touching the sheet, generate a small paste-ready reference (event title +
   `Gallery URL 1`…`Gallery URL 8` columns, values redistributed left-to-right from each
   event's current multi-line cell) — same style as the paste-ready TSV used for the
   earlier menu price migration, so the redistribution is copy-paste rather than manual
   retyping.
2. In the sheet: add the 8 new `Gallery URL 1`–`8` columns, paste the redistributed
   values, spot-check each row, then delete the old `galleryUrls` column — as one
   uninterrupted edit.
3. Deploy the `sync-events.mjs` + docs change immediately after (same day), then trigger
   a manual sync (`workflow_dispatch`, as used previously) rather than waiting for the
   next scheduled/cron sync, to confirm success right away.

**Why sequencing matters:** both the old code (expects `galleryUrls`) and the new code
(expects the 8 `galleryUrls*` headers) run `validateHeaders()` before touching row data,
so any mismatch between sheet shape and deployed code shape produces a **hard build
failure with a named missing-column error** — never a silent loss of photos on the live
site. The sequencing above just avoids ever triggering that failure, rather than being a
safety requirement (the fail-loud design already prevents silent breakage either order).

**Rollback:** if something looks wrong after migrating, undo is a straightforward reverse
of the same steps — not because failure is likely, but because every migration should
document its own undo path:
1. Re-add the old `galleryUrls` column to the sheet and re-paste the original multi-line
   values (the pre-migration paste-ready reference from step 1 doubles as this backup —
   keep it until the migration is confirmed stable).
2. Revert the `sync-events.mjs` + docs commit (`git revert`).
3. Trigger a manual `workflow_dispatch` sync to confirm the site is back to the old
   single-column behavior.

## Verification (once implemented)

1. Local dry run of `sync-events.mjs` against a scratch copy of the sheet (or a mocked
   row object) covering: all 8 filled; a gapped subset (e.g. 1 & 3 only) → confirms
   compaction to `[url1, url3]`; all 8 blank → confirms `[]`; whitespace-padded cell →
   confirms trimming; a leftover multi-line paste in one cell → confirms it still
   splits into separate trimmed entries, with a warning logged naming the row/column.
2. Rename/delete one required gallery header in the scratch sheet → confirm the build
   fails with `Missing required columns: galleryurl4` (or whichever), not a silent
   partial sync.
3. **Duplicate URLs** — same link pasted into two different columns → confirm the
   output array contains it once, at the position of its first occurrence.
4. **Header-normalization variants** — try `Gallery URL1`, `Gallery_URL_1`, and
   `gallery url 1` as the header for column 1 → confirm all three are accepted
   identically (via `normalizeHeader()`).
5. **A 9th extra column** (e.g. someone adds `Gallery URL 9` to the sheet by mistake) →
   confirm it's silently ignored — no crash, no warning, no error, since it's outside
   `GALLERY_URL_HEADERS`.
6. **Invalid URL text** — a column containing plain text (e.g. `"see whatsapp"` instead
   of a link) → confirm it's dropped with a warning, not passed through as a broken
   `<img>` src.
7. **Overflow** — a single cell with 10+ newline-joined legacy links → confirm the
   result is truncated to 8 with a warning, not all 10+ kept.
8. Regression check: redistribute `src/data/events.seed.json`'s current gallery values
   into 8-column form in a scratch sheet, run the sync, and confirm the resulting
   `galleryUrls` arrays exactly match today's seed data (same URLs, same order, same
   length) — proves the migration doesn't lose or reorder any existing photos.
9. `npm run dev` → open an event with photos and confirm `EventGallery.astro` renders
   the same grid/tilt behavior as before, plus check an event with 0 photos and a
   synthetic test event with all 8 filled to confirm the grid and tilt-cycling still
   look correct beyond 6 photos.
10. `npm run build` — clean build, no TypeScript/Astro errors, no missing-header warnings.
11. After deploying and migrating the live sheet, trigger a manual `workflow_dispatch`
    sync and confirm `src/data/events.json` picks up the new shape correctly, then check
    the live `/events/[slug]/` pages for a couple of real events.
