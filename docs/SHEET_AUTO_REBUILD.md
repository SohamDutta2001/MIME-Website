# Auto-rebuild the site when the Google Sheet is edited

The website is static, so a rebuild is what makes a sheet edit go live. This
setup makes that rebuild happen **automatically, ~2-3 minutes after you finish
editing** the menu/events sheet — no manual "Run workflow", no waiting for the
daily build. SEO is unaffected (the content is still baked into the HTML).

How it works: a Google Apps Script on the sheet calls GitHub's
`repository_dispatch` API on edit; the deploy workflow listens for that
(`types: [sheet-edit]`) and rebuilds + redeploys.

---

## One-time setup (~5 minutes)

### 1. Create a GitHub token
- GitHub → **Settings → Developer settings → Personal access tokens →
  Fine-grained tokens → Generate new token**.
- **Repository access:** Only select repositories → `SohamDutta2001/MIME-Website`.
- **Permissions:** Repository permissions → **Contents: Read and write**.
- Generate and **copy the token** (starts with `github_pat_…`). You won't see it again.

### 2. Open the sheet's Apps Script
- In the Google Sheet: **Extensions → Apps Script**.
- Delete any placeholder code, paste the script from the section below, **Save**.

### 3. Store the token (not in the code)
- In Apps Script: **Project Settings (gear icon) → Script properties → Add script property**.
- Property name: `GH_TOKEN`  ·  Value: *(paste the token)*  → **Save**.

### 4. Install the trigger
- Back in the editor, choose the function **`installTrigger`** in the toolbar and click **Run**.
- Approve the authorization prompt (Google will warn it's an unverified app —
  that's normal for your own script; continue).
- Done. Edit any cell, wait ~2-3 min, and check the repo's **Actions** tab — a
  "Deploy to GitHub Pages" run should appear, then the live site updates.

> Tip: run **`testDispatch`** once to fire a build immediately and confirm the
> token works (a run should appear in the Actions tab within seconds).

---

## The script

```javascript
/**
 * Auto-rebuild the Art-Teas-Tree website when this sheet changes.
 * On edit it (re)schedules a single dispatch ~45s after you stop typing, so a
 * burst of edits = one rebuild that captures the final state. Live in ~2-3 min.
 */
const GITHUB_OWNER = 'SohamDutta2001';
const GITHUB_REPO  = 'MIME-Website';
const EVENT_TYPE   = 'sheet-edit';
const DEBOUNCE_MS  = 45 * 1000;

function onSheetEdit(e) {
  clearPendingDispatch();
  ScriptApp.newTrigger('dispatchRebuild').timeBased().after(DEBOUNCE_MS).create();
}

function dispatchRebuild() {
  clearPendingDispatch();
  const token = PropertiesService.getScriptProperties().getProperty('GH_TOKEN');
  if (!token) { console.error('Missing GH_TOKEN script property'); return; }
  const res = UrlFetchApp.fetch(
    'https://api.github.com/repos/' + GITHUB_OWNER + '/' + GITHUB_REPO + '/dispatches',
    {
      method: 'post',
      contentType: 'application/json',
      headers: { Authorization: 'Bearer ' + token, Accept: 'application/vnd.github+json' },
      payload: JSON.stringify({ event_type: EVENT_TYPE }),
      muteHttpExceptions: true,
    });
  if (res.getResponseCode() !== 204) {
    console.error('GitHub dispatch failed: ' + res.getResponseCode() + ' ' + res.getContentText());
  }
}

function clearPendingDispatch() {
  ScriptApp.getProjectTriggers().forEach(function (t) {
    if (t.getHandlerFunction() === 'dispatchRebuild') ScriptApp.deleteTrigger(t);
  });
}

/** Run ONCE to authorize + install the on-edit trigger. */
function installTrigger() {
  ScriptApp.getProjectTriggers().forEach(function (t) {
    if (t.getHandlerFunction() === 'onSheetEdit') ScriptApp.deleteTrigger(t);
  });
  ScriptApp.newTrigger('onSheetEdit').forSpreadsheet(SpreadsheetApp.getActive()).onEdit().create();
  console.log('Auto-rebuild installed. Edit a cell, then watch the GitHub Actions tab.');
}

/** Optional: run to fire a rebuild right now and verify the token. */
function testDispatch() { dispatchRebuild(); }
```

---

## Notes & troubleshooting
- **Both tabs covered.** The trigger fires on any edit to the spreadsheet, and
  the build re-syncs both the menu and the events tabs.
- **It batches edits.** Editing several cells in a row triggers a single
  rebuild ~45s after the last change, not one per cell.
- **If nothing happens:** check Apps Script → **Executions** for errors. A 401/403
  means the `GH_TOKEN` is wrong or missing the *Contents: write* permission; a 404
  usually means the owner/repo names don't match.
- **The daily 7 AM IST build still runs** as a safety net if a dispatch is ever missed.
- **Sheet must stay** shared "Anyone with the link can view" (and event Drive
  images public), or the build keeps the previous data.
- **Token security:** it lives only in Script Properties, never in the code or repo.
  Revoke it in GitHub settings if it's ever exposed.
