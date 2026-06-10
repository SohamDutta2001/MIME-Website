# Setup — Cloudinary (photos) & Google Sheets (menu + events)

This guide walks through wiring the two CMS surfaces:

- **Cloudinary** for photos. The café owner uploads images via Cloudinary's web app; the site picks them up instantly through a CDN.
- **Google Sheets** for the menu. The café owner edits a private/public sheet; a build-time sync pulls the latest data into the site whenever it deploys.

The site works out-of-the-box without either — local images and a checked-in menu JSON act as the defaults. You can ship Cloudinary and Sheets independently; do whichever first.

---

## 1. Cloudinary (photos)

### Step 1 — sign up

1. Go to [cloudinary.com](https://cloudinary.com) → sign up. The free tier is generous and will not cost the café anything until they cross ~25 GB / month of bandwidth.
2. On the dashboard (top-left of the Cloudinary UI), copy your **Cloud Name**. It looks like a slug — e.g. `dxx7eqxxx` or `art-teas-tree`.

### Step 2 — upload the four café photos

In the Cloudinary Media Library, upload the same four photos that live in [`public/cafe-assets/`](../public/cafe-assets/). For each upload:

- Click **Upload** → choose the file
- In the upload dialog, set **Public ID** to the filename *without the extension*. E.g. for `art-teas-tree-cafe-kolkata-coffee-shops-riqhhggeu0.webp`, the public ID is `art-teas-tree-cafe-kolkata-coffee-shops-riqhhggeu0`.
- Click **Upload**

Repeat for all four files. (You can drag them all in at once and edit the public IDs after.)

> **Why the public ID matters:** the code in [`src/lib/img.js`](../src/lib/img.js) builds Cloudinary URLs by stripping the extension off the filename. If the public IDs don't match, the URLs will 404.

### Step 3 — flip the switch

Open [`src/lib/img.js`](../src/lib/img.js). Find:

```js
export const CLOUDINARY_CLOUD_NAME = '';
```

Paste your cloud name in:

```js
export const CLOUDINARY_CLOUD_NAME = 'art-teas-tree';
```

That's it. Every image on the site (hero carousel, Reel section, Books section) now flows through Cloudinary with automatic format selection (`f_auto`) and quality (`q_auto`). Each image specifies its own width: 2400px for the hero, 1600px for the Reel, 2000px for the Books photo. Cloudinary delivers the right size for the user's device.

To verify: load the site and inspect a hero image's `src`. It should be a `https://res.cloudinary.com/...` URL.

### Step 4 — adding new photos later

1. Upload the new image to Cloudinary with any public ID.
2. Open [`src/components/islands/CafeApp.jsx`](../src/components/islands/CafeApp.jsx), find `HERO_IMAGES` (around line 50), add an entry — `src` is `<public-id>.<ext>` (the extension is just for the local fallback; Cloudinary ignores it).
3. Commit, push, redeploy.

### Falling back without Cloudinary

While `CLOUDINARY_CLOUD_NAME` is empty, every `cldImg('foo.webp')` resolves to `/public/cafe-assets/foo.webp`. The site renders identically to before — useful for offline dev and for committing without breaking deploys.

---

## 2. Google Sheets (menu)

### Step 1 — create the sheet

1. Open [Google Sheets](https://sheets.google.com) → new sheet.
2. Name it something obvious, e.g. **"Art-Teas-Tree — Menu"**.
3. Import the template at [`docs/menu-template.csv`](menu-template.csv):
   - **File → Import → Upload** → drop the CSV → **Replace current sheet**.
   - You'll get 11 rows with the current menu, ready to edit.

The columns the sync expects (case-insensitive, must all be present):

| Column        | Type    | Notes |
|---------------|---------|-------|
| `id`          | number  | A stable identifier. New items get the next number. |
| `category`    | text    | "Tea", "Coffee", "Quick Bites", or any new category. New categories appear as filter chips automatically. |
| `itemName`    | text    | Display name. Bengali characters are fine — write them directly in the cell. |
| `price`       | number  | Just the rupee amount (e.g. `45`). The site renders `₹45`. Currency symbols or non-numeric characters are stripped. |
| `description` | text    | One-line description. Commas inside descriptions are handled correctly (Sheets exports them quoted). |

### Step 2 — share the sheet

1. Click **Share** (top-right).
2. **General access** → **Anyone with the link** → **Viewer**.
3. Copy the link.

> **Why public?** The sync uses Google's `gviz/tq?tqx=out:csv` CSV-export endpoint, which only works on sheets shared this way. No API key needed, no service account, no auth dance. Trade-off: anyone with the URL can read the menu, but this is a public menu anyway, so this is fine. If the menu ever needs to be private, switch to the Google Sheets API + service account (~3 extra hours of work).

### Step 3 — grab the sheet ID

From the URL you copied:

```
https://docs.google.com/spreadsheets/d/1Abc...XyZ/edit?gid=0#gid=0
                                       ^^^^^^^^^^
                                       this part = sheet ID
```

### Step 4 — configure locally (for testing)

Create a `.env` file at the repo root (not committed — `.gitignore` should already cover it):

```bash
MENU_SHEET_ID=1Abc...XyZ
# Optional: pull from a specific tab instead of the first one
# MENU_SHEET_GID=123456789
```

Then run:

```bash
npm run sync:menu:local
```

You should see `✓ menu sync: wrote 11 items to src/data/mockMenuData.json`. The site is now reading your live sheet.

### Step 5 — configure on GitHub (for the deployed site)

1. Go to your GitHub repo → **Settings** → **Secrets and variables** → **Actions**.
2. Click **New repository secret**.
3. Name: `MENU_SHEET_ID`. Value: the sheet ID from Step 3.
4. Save.

Optional: also add `MENU_SHEET_GID` if you want a non-default tab.

Now update [`.github/workflows/build.yml`](../.github/workflows/build.yml) so the workflow forwards the secret to the build step. Find the `Astro check + build` step and add to its `env:` block:

```yaml
- name: Astro check + build
  env:
    GITHUB_PAGES: 'true'
    MENU_SHEET_ID: ${{ secrets.MENU_SHEET_ID }}
    # MENU_SHEET_GID: ${{ secrets.MENU_SHEET_GID }}
  run: npm run build
```

That's the last bit of wiring. Every push to `main` → GitHub Actions runs the menu sync → builds → deploys. The committed `src/data/mockMenuData.json` is now just a stale snapshot used as fallback when the sync can't reach the sheet.

### Step 6 — café owner workflow

Once everything's set up, the café owner's flow is:

1. Edit the Google Sheet (price change, mark something out of stock, add new item).
2. Wait for the next deploy. Two ways:
   - **Manual**: someone runs **Actions → Deploy to GitHub Pages → Run workflow** in the GitHub UI.
   - **Scheduled (recommended)**: add a cron trigger to the workflow so it re-deploys every hour. See "Next steps" below.

### Behaviour

| Scenario | What happens |
|---|---|
| No `MENU_SHEET_ID` set | Script logs and exits 0. Site uses the committed JSON. |
| `MENU_SHEET_ID` set, sheet reachable, valid | Overwrites the JSON. Build proceeds with fresh data. |
| `MENU_SHEET_ID` set, sheet unreachable | Script exits 1. **Deploy fails loudly** instead of silently shipping stale data. |
| `MENU_SHEET_ID` set, sheet missing required columns | Script exits 1 with which columns are missing. |

---

## 3. Google Sheets (events)

Events follow the same pattern as the menu: the café owner edits a tab in
Google Sheets, and a build-time sync (`scripts/sync-events.mjs`) pulls the
latest rows into `src/data/events.json`. The committed JSON acts as fallback
sample data, so the site works without any setup.

### Step 1 — create the Events tab

In the same spreadsheet as the menu (or a separate one), add a tab named
**Events** and import [`docs/events-template.csv`](events-template.csv)
(**File → Import → Upload** → **Insert new sheet(s)**).

| Column            | Format                                          | Notes |
|-------------------|--------------------------------------------------|-------|
| `active`          | `TRUE` / `FALSE`                                 | Controls visibility. Set `FALSE` to hide an event without deleting the row. |
| `category`        | `Performance` / `Workshop` / `Exhibition`        | Picks the page template. Performance covers music, drama, stand-up, poetry, storytelling; Workshop covers classes and training sessions; Exhibition covers art, photography, installations, books. |
| `title`           | text                                             | Event title. The page URL (slug) is generated from this automatically. |
| `date`            | `2026-07-04` (YYYY-MM-DD)                        | Used for sorting and the upcoming/past split. |
| `time`            | `6:00 PM`                                        | Free text, shown as-is. |
| `venue`           | text                                             | e.g. `Art-Teas-Tree Cafe` or `Mime Hall`. |
| `bannerUrl`       | Cloudinary URL                                   | The hero image. A bare filename (no `https://`) is treated as a file in `/public/cafe-assets/` — handy before Cloudinary is set up. |
| `description`     | text                                             | Main description. Blank lines split paragraphs. |
| `additionalInfo`  | text                                             | Category-specific: artist bios (Performance), learning outcomes (Workshop), curator notes (Exhibition). |
| `galleryUrls`     | one URL per line (Alt+Enter inside the cell)     | Optional gallery images. |
| `registrationUrl` | any link                                         | Google Form, WhatsApp (`https://wa.me/…`), ticketing site, Instagram… Leave blank for walk-in events. |

Header matching is forgiving — `Banner URL`, `bannerUrl`, and `bannerurl` all
work (spaces and case are ignored).

### Step 2 — share the sheet and grab the ids

Share exactly like the menu sheet ("Anyone with the link can view"). Then,
with the Events tab selected, copy from the URL:

```text
https://docs.google.com/spreadsheets/d/SHEET_ID/edit?gid=TAB_GID#gid=TAB_GID
```

`.env` for local syncs:

```bash
EVENTS_SHEET_ID=...   # optional — defaults to MENU_SHEET_ID
EVENTS_SHEET_GID=...  # required — the Events tab's gid
```

For CI, add the same names as GitHub repo secrets and they're passed through
in [`build.yml`](../.github/workflows/build.yml). Failure behaviour matches
the menu sync: no vars → keep committed JSON; vars set but sheet unreachable
or malformed → build fails loudly.

### Step 3 — Cloudinary folders for event images

In the Cloudinary media library create two folders:

```text
events/banners     ← one hero image per event
events/galleries   ← event photos
```

Upload, click an image → **Copy URL**, paste into the sheet. Any Cloudinary
delivery URL works verbatim; the site does not transform event URLs.

---

## Next steps (not done by default)

### Scheduled menu refresh

Add a cron trigger to [`.github/workflows/build.yml`](../.github/workflows/build.yml) so the site rebuilds (and re-pulls the sheet) on a schedule:

```yaml
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]
  workflow_dispatch:
  schedule:
    - cron: '0 * * * *' # every hour, on the hour
```

Update lag drops to ≤1 hour. Free, no extra infra.

### Instant menu refresh (~2 minutes)

Add a [Google Apps Script](https://script.google.com) bound to the sheet that fires the GitHub Actions workflow on every edit. Effort: ~30 min once you've done it once. Worth the lift only if the café updates prices multiple times a day.

### Private menu sheet

If the café ever needs the sheet private (sensitive prices, internal notes):

1. Create a Google Cloud project + service account.
2. Share the sheet with the service account's email.
3. Add the service-account JSON as a GitHub secret.
4. Rewrite `scripts/sync-menu.mjs` to use the Sheets API instead of the public CSV endpoint.

Adds ~3 hours of work and ongoing credential management.

### Cloudinary upload presets

For the simplest café-owner image workflow: create an [unsigned upload preset](https://cloudinary.com/documentation/upload_presets) on Cloudinary that auto-applies `f_auto,q_auto`. Then build a tiny admin page in the site that accepts uploads via the preset. The café owner drags an image into the page, and the new URL is live within seconds. (~4 hours.)

---

## Quick reference

| Thing | Where |
|---|---|
| Cloudinary cloud name | [`src/lib/img.js`](../src/lib/img.js) → `CLOUDINARY_CLOUD_NAME` |
| Menu sheet ID (local) | `.env` → `MENU_SHEET_ID` |
| Menu sheet ID (CI) | GitHub repo secret `MENU_SHEET_ID` |
| Menu fallback data | [`src/data/mockMenuData.json`](../src/data/mockMenuData.json) (auto-overwritten by sync) |
| Menu sync script | [`scripts/sync-menu.mjs`](../scripts/sync-menu.mjs) |
| Menu CSV template | [`docs/menu-template.csv`](menu-template.csv) |
| Events sheet ID (local) | `.env` → `EVENTS_SHEET_ID` (falls back to `MENU_SHEET_ID`) + `EVENTS_SHEET_GID` |
| Events sheet ID (CI) | GitHub repo secrets `EVENTS_SHEET_ID` / `EVENTS_SHEET_GID` |
| Events fallback data | [`src/data/events.json`](../src/data/events.json) (auto-overwritten by sync) |
| Events sync script | [`scripts/sync-events.mjs`](../scripts/sync-events.mjs) |
| Events CSV template | [`docs/events-template.csv`](events-template.csv) |
| Build command | `npm run build` (runs `prebuild` → `sync:menu` first) |
| Local sync command | `npm run sync:menu:local` (reads from `.env`) |
