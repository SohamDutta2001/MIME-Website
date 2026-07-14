// Fetches the Events tab from Google Sheets (CSV export) and writes
// src/data/events.json at build time.
//
// Environment variables:
//   EVENTS_SHEET_GID — required to activate live sync (tab gid after gid= in URL)
//   EVENTS_SHEET_ID  — optional; defaults to MENU_SHEET_ID
//
// If EVENTS_SHEET_GID is missing: seed fallback is used (events.seed.json → events.json).
// If fetch/parse/validation fails: seed fallback is used; build continues.
// Sheet must be public ("Anyone with the link can view").
//
// Sheet columns (header names are normalized — case, spaces, underscores ignored):
//   active, category, title, date, time, venue, bannerUrl, description,
//   additionalInfo, Gallery URL 1..8, registrationUrl, section (optional)
//
// Gallery URL 1 through Gallery URL 8: one photo link per column (replaces the old
// single "galleryUrls" cell that required Alt+Enter for multiple links). Column
// order determines display order; any subset can be left blank. Values are
// deduplicated, validated as http(s) links, and capped at 8 — see
// collectGalleryUrls() below.
//
// Zero-row policy:
//   0 active events  → valid; writes empty data array (off-season / between programmes)
//   0 total rows     → error; seed fallback used
//
// Date formats accepted: YYYY-MM-DD, D/M/YYYY, DD/MM/YYYY, D-MMM-YYYY.
// US locale M/D/YYYY triggers a specific warning; serial numbers are rejected.

import { resolve } from 'node:path';
import { parse as dateParse, isValid as dateIsValid } from 'date-fns';
import { slugify, dedupeSlugs } from '../src/lib/events/slug.js';
import {
  fetchCsvWithRetry, assertCsvContentType, parseCsvText,
  validateHeaders, cell, normalizeHeader,
  atomicWrite, copySeed, buildId,
} from './lib/sync-sheet.mjs';

const EVENTS_SEED = resolve(process.cwd(), 'src/data/events.seed.json');
const EVENTS_OUT  = resolve(process.cwd(), 'src/data/events.json');

const sheetGid = process.env.EVENTS_SHEET_GID?.trim();
const sheetId  = (process.env.EVENTS_SHEET_ID ?? process.env.MENU_SHEET_ID)?.trim();

const label = 'sync-events';
const t0 = Date.now();

// ─── Resolve sheet ID ─────────────────────────────────────────────────────────

if (!sheetGid) {
  console.warn(`[${label}] EVENTS_SHEET_GID not set — copying seed fallback`);
  await copySeed(EVENTS_SEED, EVENTS_OUT, label);
  process.exit(0);
}

if (!sheetId) {
  console.error(`[${label}] EVENTS_SHEET_GID set but no sheet id found (set EVENTS_SHEET_ID or MENU_SHEET_ID)`);
  await copySeed(EVENTS_SEED, EVENTS_OUT, label);
  process.exit(0);
}

const url = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv&gid=${sheetGid}`;
console.log(`[${label}] fetching ${url}`);

// ─── Fetch ────────────────────────────────────────────────────────────────────

let rows;
try {
  const { text, contentType, attempt } = await fetchCsvWithRetry(url, label);
  console.log(`[${label}] fetched (attempt ${attempt})`);

  assertCsvContentType(contentType, label);

  const csvSize = text.length;
  rows = parseCsvText(text, label);
  console.log(`[${label}] CSV: ${(csvSize / 1024).toFixed(1)} KB (${rows.length} rows) — content-type: ${contentType || 'unknown'}`);
} catch (err) {
  console.error(`[${label}] Fetch/parse failed: ${err.message} — using seed fallback`);
  await copySeed(EVENTS_SEED, EVENTS_OUT, label);
  process.exit(0);
}

// ─── Header validation ────────────────────────────────────────────────────────

if (rows.length === 0) {
  console.error(`[${label}] Sheet appears completely empty. Accidental delete? Using seed fallback. ACTION REQUIRED.`);
  await copySeed(EVENTS_SEED, EVENTS_OUT, label);
  process.exit(0);
}

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
try {
  validateHeaders(rows, REQUIRED_HEADERS, label);
  console.log(`[${label}] Headers OK (normalized): ${Object.keys(rows[0]).join(', ')}`);
} catch (err) {
  console.error(`[${label}] ${err.message} — using seed fallback`);
  await copySeed(EVENTS_SEED, EVENTS_OUT, label);
  process.exit(0);
}

// ─── Constants ────────────────────────────────────────────────────────────────

const CATEGORIES = ['Performance', 'Workshop', 'Exhibition'];
const CATEGORY_ALIASES = {
  'drama':           'Performance',
  'music':           'Performance',
  'standup comedy':  'Performance',
  'stand-up comedy': 'Performance',
  'stand up comedy': 'Performance',
  'poetry':          'Performance',
  'storytelling':    'Performance',
  'eating':          'Exhibition',
  'food':            'Exhibition',
  'tasting':         'Exhibition',
  'art':             'Exhibition',
  'photography':     'Exhibition',
  'acting workshop': 'Workshop',
  'cooking workshop':'Workshop',
};

const SECTIONS = ['cafe', 'third-space'];
const SECTION_ALIASES = {
  'cafe': 'cafe', 'cafe event': 'cafe', 'cafe events': 'cafe',
  'café': 'cafe', 'café event': 'cafe', 'café events': 'cafe',
  'third space': 'third-space', 'third-space': 'third-space',
  'the third space': 'third-space',
};

// Multi-format date parser using date-fns.
// Accepted: YYYY-MM-DD, D/M/YYYY, DD/MM/YYYY, D-MMM-YYYY.
// US locale M/D/YYYY is detected and warned on explicitly.
const ACCEPTED_FORMATS = ['yyyy-MM-dd', 'd/M/yyyy', 'dd/MM/yyyy', 'd-MMM-yyyy'];

function parseDateStr(raw, rowNum) {
  for (const fmt of ACCEPTED_FORMATS) {
    const d = dateParse(raw, fmt, new Date());
    if (dateIsValid(d)) {
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${y}-${m}-${day}`;
    }
  }
  // US locale detection: matches M/D/YYYY where M <= 12 and D <= 12 (ambiguous)
  // or where M > 12 (impossible month — definitely swapped)
  const usMatch = raw.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (usMatch) {
    console.warn(
      `[${label}] row ${rowNum}: date "${raw}" looks like US locale (M/D/YYYY). ` +
      `Did the sheet locale change from English (India)?`
    );
  }
  return null;
}

// Collects one event row's gallery links from its 8 columns into an ordered,
// deduplicated array (first occurrence wins). Column order == display order.
// Tolerates a leftover Alt+Enter multi-line paste in any single cell (old habit)
// by splitting it too, but warns so we can tell if that's still happening.
function collectGalleryUrls(row, rowNum) {
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

// ─── Row validation ───────────────────────────────────────────────────────────

const events = [];
const problems = [];
const seenKeys = new Set(); // (title|date|time) dedup keys
let totalRows = 0;
let inactiveRows = 0;
let dupRows = 0;
let invalidRows = 0;

for (let i = 0; i < rows.length; i++) {
  const r = rows[i];
  const rowNum = i + 2;
  totalRows++;

  if (!/^(true|yes|1)$/i.test(cell(r, 'active'))) {
    inactiveRows++;
    continue;
  }

  const title       = cell(r, 'title');
  const rawDate     = cell(r, 'date');
  const time        = cell(r, 'time');
  const rawCategory = cell(r, 'category');
  const rawSection  = cell(r, 'section');

  const date = rawDate ? parseDateStr(rawDate, rowNum) : null;

  const category =
    CATEGORIES.find((c) => c.toLowerCase() === rawCategory.toLowerCase()) ??
    CATEGORY_ALIASES[rawCategory.toLowerCase()];

  const section =
    rawSection === ''
      ? 'cafe'
      : SECTIONS.find((s) => s === rawSection.toLowerCase()) ??
        SECTION_ALIASES[rawSection.toLowerCase()];

  const rowProblems = [];
  if (!title) rowProblems.push('missing title');
  if (!date) rowProblems.push(`date "${rawDate}" could not be parsed — use YYYY-MM-DD or D/M/YYYY`);
  if (!category) {
    rowProblems.push(
      `category "${rawCategory}" is not one of ${CATEGORIES.join(' / ')} — add an alias in sync-events.mjs`
    );
  }
  if (rawSection !== '' && !section) {
    rowProblems.push(`section "${rawSection}" is not one of Café Events / Third Space — leave blank for a café event`);
  }
  if (rowProblems.length > 0) {
    for (const p of rowProblems) console.warn(`[${label}] row ${rowNum}: ${p} — skipping`);
    invalidRows++;
    continue;
  }

  // Deduplicate by (title, date, time) triple
  const dedupKey = `${title}|${date}|${time}`;
  if (seenKeys.has(dedupKey)) {
    console.warn(`[${label}] row ${rowNum}: duplicate event "${title}" on ${date} at ${time} — skipping`);
    dupRows++;
    continue;
  }
  seenKeys.add(dedupKey);

  events.push({
    slug: slugify(title),
    active: true,
    category,
    section,
    title,
    date,
    time,
    venue: cell(r, 'venue'),
    bannerUrl: cell(r, 'bannerurl'),
    description: cell(r, 'description'),
    additionalInfo: cell(r, 'additionalinfo'),
    galleryUrls: collectGalleryUrls(r, rowNum),
    registrationUrl: cell(r, 'registrationurl'),
  });
}

// Zero-row policies
if (totalRows === 0) {
  console.error(`[${label}] Sheet appears completely empty (0 total rows). Accidental delete? Using seed fallback. ACTION REQUIRED.`);
  await copySeed(EVENTS_SEED, EVENTS_OUT, label);
  process.exit(0);
}

// 0 active events is valid — off-season, between programmes
if (events.length === 0) {
  console.warn(`[${label}] No active events found. Writing empty events list (off-season is valid).`);
}

// Dedup slugs for same-title events
const slugs = dedupeSlugs(events.map((e) => e.slug));
events.forEach((e, i) => { e.slug = slugs[i]; });

const skipSummary = `${inactiveRows} inactive, ${dupRows} duplicate-skipped, ${invalidRows} invalid`;
console.log(`[${label}] Wrote ${events.length} active events (${totalRows} total, ${skipSummary})`);

const output = {
  schemaVersion: 1,
  generatedAt: new Date().toISOString(),
  source: 'Google Sheets',
  sheetId,
  buildId: buildId(),
  activeRowCount: events.length,
  data: events,
};

console.log(
  `[${label}] Metadata: schemaVersion=${output.schemaVersion} buildId=${output.buildId} activeRowCount=${output.activeRowCount} generatedAt=${output.generatedAt}`
);

try {
  await atomicWrite(EVENTS_OUT, JSON.stringify(output, null, 2) + '\n');
} catch (err) {
  console.error(`[${label}] Atomic write failed: ${err.message} — using seed fallback`);
  await copySeed(EVENTS_SEED, EVENTS_OUT, label);
  process.exit(0);
}

console.log(`[${label}] Completed in ${((Date.now() - t0) / 1000).toFixed(1)}s`);
