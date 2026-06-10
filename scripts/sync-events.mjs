// Build-time events sync — pulls the Events tab from a Google Sheet (CSV
// export of a public sheet) and rewrites src/data/events.json so the static
// site bundles fresh event data on every deploy. Mirrors sync-menu.mjs.
//
// Configured via environment variables:
//   EVENTS_SHEET_GID — required to activate the sync: the Events tab's gid
//                      (the number after `gid=` in the sheet URL with the
//                      tab selected). Without it the script is a no-op, so
//                      local dev needs no setup.
//   EVENTS_SHEET_ID  — optional, the spreadsheet id. Defaults to
//                      MENU_SHEET_ID (events tab in the menu spreadsheet).
//
// Behaviour:
//   - no EVENTS_SHEET_GID      → log, exit 0, leave the existing JSON alone.
//   - configured + ok          → overwrite the JSON, exit 0.
//   - configured + fetch/parse → log error, exit 1 (build fails loudly
//     failure                    instead of silently deploying stale data).
//
// Expected sheet columns (header row; case, spaces, and underscores are
// ignored, so "Banner URL" / "bannerUrl" / "bannerurl" all match):
//   active, category, title, date, time, venue, bannerUrl, description,
//   additionalInfo, galleryUrls, registrationUrl
//
// Rows with active ≠ TRUE are dropped here, at build time, so draft or
// retired events never reach the public bundle. Only active rows are
// validated — a half-filled draft row with active=FALSE can't break deploys.
//
// Usage:
//   node --env-file=.env scripts/sync-events.mjs   (local with .env)
//   node scripts/sync-events.mjs                   (CI — vars from environment)

import { writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { parseCsv } from './lib/parse-csv.mjs';
import { slugify, dedupeSlugs } from '../src/lib/events/slug.js';

const OUT_PATH = resolve(process.cwd(), 'src/data/events.json');

const sheetGid = process.env.EVENTS_SHEET_GID?.trim();
const sheetId = (process.env.EVENTS_SHEET_ID ?? process.env.MENU_SHEET_ID)?.trim();

if (!sheetGid) {
  console.log(
    '• events sync: EVENTS_SHEET_GID not set — keeping existing src/data/events.json',
  );
  process.exit(0);
}
if (!sheetId) {
  console.error('✗ events sync: EVENTS_SHEET_GID is set but no sheet id found');
  console.error('  set EVENTS_SHEET_ID (or MENU_SHEET_ID if the Events tab lives in the menu spreadsheet)');
  process.exit(1);
}

const url = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv&gid=${sheetGid}`;
console.log(`• events sync: fetching ${url}`);

let csv;
try {
  const res = await fetch(url, { redirect: 'follow' });
  if (!res.ok) {
    throw new Error(`HTTP ${res.status} ${res.statusText}`);
  }
  csv = await res.text();
} catch (err) {
  console.error(`✗ events sync failed: ${err.message}`);
  console.error('  (sheet must be shared as "Anyone with the link can view")');
  process.exit(1);
}

const rows = parseCsv(csv);
if (rows.length < 2) {
  console.error('✗ events sync: sheet has no data rows');
  process.exit(1);
}

// Normalise headers so "Banner URL", "bannerUrl", "banner_url" all match.
const header = rows[0].map((h) => h.trim().toLowerCase().replace(/[\s_]+/g, ''));
const required = [
  'active', 'category', 'title', 'date', 'time', 'venue', 'bannerurl',
  'description', 'additionalinfo', 'galleryurls', 'registrationurl',
];
const missing = required.filter((c) => !header.includes(c));
if (missing.length) {
  console.error(`✗ events sync: sheet missing required columns: ${missing.join(', ')}`);
  console.error(`  expected: ${required.join(', ')}`);
  console.error(`  found:    ${header.join(', ')}`);
  process.exit(1);
}

const idx = Object.fromEntries(header.map((h, i) => [h, i]));

const CATEGORIES = ['Performance', 'Workshop', 'Exhibition'];
const problems = [];
const events = [];

rows
  .slice(1)
  .forEach((r, n) => {
    if (r.every((cell) => cell.trim() === '')) return; // trailing blank rows
    const rowNum = n + 2; // 1-based, after the header row
    const cell = (key) => r[idx[key]]?.trim() ?? '';

    if (!/^(true|yes|1)$/i.test(cell('active'))) return; // drafts stay out

    const title = cell('title');
    const rawCategory = cell('category');
    // Accept any casing in the sheet; store canonical capitalised form.
    const category = CATEGORIES.find(
      (c) => c.toLowerCase() === rawCategory.toLowerCase(),
    );
    const date = cell('date');

    if (!title) problems.push(`row ${rowNum}: missing title`);
    if (!category) {
      problems.push(
        `row ${rowNum}: category "${rawCategory}" is not one of ${CATEGORIES.join(' / ')}`,
      );
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      problems.push(`row ${rowNum}: date "${date}" must look like 2026-07-04 (YYYY-MM-DD)`);
    }
    if (!title || !category) return;

    events.push({
      slug: slugify(title),
      active: true,
      category,
      title,
      date,
      time: cell('time'),
      venue: cell('venue'),
      bannerUrl: cell('bannerurl'),
      description: cell('description'),
      additionalInfo: cell('additionalinfo'),
      galleryUrls: cell('galleryurls')
        .split(/\r?\n/)
        .map((u) => u.trim())
        .filter(Boolean),
      registrationUrl: cell('registrationurl'),
    });
  });

if (problems.length) {
  console.error('✗ events sync: problems in the Events sheet:');
  for (const p of problems) console.error(`    ${p}`);
  console.error('  fix the rows above (or set their active column to FALSE) and redeploy');
  process.exit(1);
}

// Two events with the same title get -2, -3… suffixed slugs.
const slugs = dedupeSlugs(events.map((e) => e.slug));
events.forEach((e, i) => { e.slug = slugs[i]; });

await writeFile(OUT_PATH, JSON.stringify(events, null, 2) + '\n');
console.log(`✓ events sync: wrote ${events.length} active events to src/data/events.json`);
