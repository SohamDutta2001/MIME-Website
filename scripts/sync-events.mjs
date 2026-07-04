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
// section (optional): "Café Events" or "Third Space" — which carousel the
// event appears in. An absent column or a blank cell defaults to Café
// Events, so existing sheets and historical rows need no changes; only a
// misspelled non-empty value fails the build.
//
// Rows with active ≠ TRUE are dropped here, at build time, so draft or
// retired events never reach the public bundle. Only active rows are
// validated — a half-filled draft row with active=FALSE can't break deploys.
//
// Category aliases: the sheet may use plain names (Drama, Music, Eating…)
// which are mapped to the canonical templates (Performance / Workshop /
// Exhibition) via CATEGORY_ALIASES. Add new names there as needed.
//
// Date formats accepted: YYYY-MM-DD (canonical) and M/D/YYYY or MM/DD/YYYY.
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

// Map your sheet's category names to the canonical templates above.
// Keys are case-insensitive; add any new names here as needed.
const CATEGORY_ALIASES = {
  'drama':          'Performance',
  'music':          'Performance',
  'standup comedy': 'Performance',
  'stand-up comedy':'Performance',
  'stand up comedy':'Performance',
  'poetry':         'Performance',
  'storytelling':   'Performance',
  'eating':         'Exhibition',
  'food':           'Exhibition',
  'tasting':        'Exhibition',
  'art':            'Exhibition',
  'photography':    'Exhibition',
  'acting workshop':'Workshop',
  'cooking workshop':'Workshop',
};

// Which carousel the event belongs to. Blank/absent → 'cafe' (the common case).
const SECTIONS = ['cafe', 'third-space'];
const SECTION_ALIASES = {
  'cafe': 'cafe', 'cafe event': 'cafe', 'cafe events': 'cafe',
  'café': 'cafe', 'café event': 'cafe', 'café events': 'cafe',
  'third space': 'third-space', 'third-space': 'third-space',
  'the third space': 'third-space',
};

// Accept YYYY-MM-DD (canonical) and slash dates. Slash dates are read as
// D/M/YYYY — the day-first convention used in India (this is a Kolkata café),
// so "1/7/2026" means 1 July 2026, not 7 January. When one component is > 12
// it can only be the day, so we disambiguate automatically and tolerate a
// sheet typed the other way round. Always stored as YYYY-MM-DD.
function parseDate(raw) {
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw; // already canonical
  const slash = raw.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (slash) {
    const a = Number(slash[1]);
    const b = Number(slash[2]);
    const year = slash[3];
    let day, month;
    if (a > 12) {        // first part can't be a month → D/M/YYYY
      day = a; month = b;
    } else if (b > 12) { // second part can't be a month → M/D/YYYY
      month = a; day = b;
    } else {             // ambiguous → day-first (Indian convention)
      day = a; month = b;
    }
    if (month < 1 || month > 12 || day < 1 || day > 31) return null;
    return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  }
  return null; // unparseable
}

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
    // Resolve canonical name: exact match first, then alias map.
    const category =
      CATEGORIES.find((c) => c.toLowerCase() === rawCategory.toLowerCase()) ??
      CATEGORY_ALIASES[rawCategory.toLowerCase()];
    const rawDate = cell('date');
    const date = parseDate(rawDate);

    const rawSection = cell('section'); // '' when the column is absent or empty
    const section =
      rawSection === ''
        ? 'cafe'
        : SECTIONS.find((s) => s === rawSection.toLowerCase()) ??
          SECTION_ALIASES[rawSection.toLowerCase()];

    if (!title) problems.push(`row ${rowNum}: missing title`);
    if (!category) {
      problems.push(
        `row ${rowNum}: category "${rawCategory}" is not one of ${CATEGORIES.join(' / ')} and has no alias — add it to CATEGORY_ALIASES in scripts/sync-events.mjs`,
      );
    }
    if (!date) {
      problems.push(`row ${rowNum}: date "${rawDate}" could not be parsed — use YYYY-MM-DD or D/M/YYYY`);
    }
    if (rawSection !== '' && !section) {
      problems.push(
        `row ${rowNum}: section "${rawSection}" is not one of Café Events / Third Space — leave blank for a café event`,
      );
    }
    if (!title || !category || !date || (rawSection !== '' && !section)) return;

    events.push({
      slug: slugify(title),
      active: true,
      category,
      section,
      title,
      date, // already YYYY-MM-DD after parseDate()
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
