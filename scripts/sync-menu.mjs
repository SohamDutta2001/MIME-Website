// Build-time sheet sync — pulls live data from Google Sheets (CSV export of
// public sheets) and rewrites JSON files that React islands import at build time.
//
// ─── Environment variables ────────────────────────────────────────────────────
//
//   MENU_SHEET_ID        — required for menu sync; the sheet's id from its URL
//   MENU_SHEET_GID       — optional; tab gid for the menu tab (default: 0)
//
//   INSTITUTE_SHEET_GID  — optional; tab gid for the "Institute Programmes" tab
//                          in the same sheet (MENU_SHEET_ID). If omitted, the
//                          institute sync is skipped and the existing JSON is kept.
//
// ─── Behaviour ────────────────────────────────────────────────────────────────
//
//   - env var missing / not set → skip that tab, exit 0, keep existing JSON.
//   - env var set + fetch ok    → overwrite the JSON, exit 0.
//   - env var set + fetch fails → log error, exit 1 (build fails loudly).
//
// ─── Sheet column expectations ────────────────────────────────────────────────
//
//   Menu tab (id, category, itemName, price — required):
//     id, category, subcategory, itemName, price, priceDisplay, description
//
//   Institute Programmes tab (title — required):
//     title, shortDesc, fullDesc, type
//
// ─── Adding a new tab ─────────────────────────────────────────────────────────
//
//   1. Add a new entry to the TABS array below.
//   2. Set the corresponding env var in CI / .env.
//   3. Done — no other code changes needed.
//
// Usage:
//   node --env-file=.env scripts/sync-menu.mjs    (local with .env)
//   node scripts/sync-menu.mjs                    (CI — vars from environment)

import { writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { parseCsv } from './lib/parse-csv.mjs';

// ─── helpers ─────────────────────────────────────────────────────────────────

function sheetCsvUrl(sheetId, gid) {
  return `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv&gid=${gid}`;
}

async function fetchCsv(url, label) {
  const res = await fetch(url, { redirect: 'follow' });
  if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);
  return res.text();
}

function buildIndex(headerRow) {
  return Object.fromEntries(headerRow.map((h, i) => [h.trim().toLowerCase(), i]));
}

function cell(row, idx, key) {
  return row[idx[key]]?.trim() ?? '';
}

// ─── tab definitions ──────────────────────────────────────────────────────────
//
// Each entry describes one Sheet tab → JSON file mapping. Add new tabs here.

const sheetId = process.env.MENU_SHEET_ID?.trim();

const TABS = [
  // ── Menu ──────────────────────────────────────────────────────────────────
  {
    label: 'menu',
    enabled: !!sheetId,
    url: sheetId
      ? sheetCsvUrl(sheetId, process.env.MENU_SHEET_GID?.trim() || '0')
      : null,
    outPath: resolve(process.cwd(), 'src/data/mockMenuData.json'),
    required: ['id', 'category', 'itemname', 'price'],
    parse(rows) {
      const header = rows[0].map((h) => h.trim().toLowerCase());
      const idx = buildIndex(rows[0]);
      const required = ['id', 'category', 'itemname', 'price'];
      const missing = required.filter((c) => !header.includes(c));
      if (missing.length) throw new Error(`missing required columns: ${missing.join(', ')}`);

      return rows
        .slice(1)
        .filter((r) => r.some((c) => c.trim() !== ''))
        .map((r, n) => {
          const rawPrice = cell(r, idx, 'price');
          const priceNum = Number(rawPrice.replace(/[^\d.]/g, ''));
          const price = Number.isFinite(priceNum) && rawPrice !== '' ? priceNum : null;
          const rawDisplay = cell(r, idx, 'pricedisplay');
          return {
            id: Number(cell(r, idx, 'id')) || n + 1,
            category: cell(r, idx, 'category') || 'Uncategorised',
            subcategory: cell(r, idx, 'subcategory'),
            itemName: cell(r, idx, 'itemname') || '(unnamed)',
            price,
            priceDisplay: rawDisplay || (price != null ? `₹${price}` : ''),
            description: cell(r, idx, 'description'),
          };
        });
    },
  },

  // ── Institute Programmes (Our Roots) ──────────────────────────────────────
  {
    label: 'institute programmes',
    enabled: !!(sheetId && process.env.INSTITUTE_SHEET_GID?.trim()),
    url:
      sheetId && process.env.INSTITUTE_SHEET_GID?.trim()
        ? sheetCsvUrl(sheetId, process.env.INSTITUTE_SHEET_GID.trim())
        : null,
    outPath: resolve(process.cwd(), 'src/data/instituteData.json'),
    parse(rows) {
      const idx = buildIndex(rows[0]);
      if (!('title' in idx)) throw new Error('missing required column: title');

      return rows
        .slice(1)
        .filter((r) => r.some((c) => c.trim() !== ''))
        .map((r) => ({
          title: cell(r, idx, 'title'),
          shortDesc: cell(r, idx, 'shortdesc'),
          fullDesc: cell(r, idx, 'fulldesc'),
          type: cell(r, idx, 'type'),
        }))
        .filter((p) => p.title);
    },
  },
];

// ─── sync runner ──────────────────────────────────────────────────────────────

let anyFailed = false;

for (const tab of TABS) {
  if (!tab.enabled) {
    const reason =
      tab.label === 'menu' ? 'MENU_SHEET_ID not set' : 'INSTITUTE_SHEET_GID not set';
    console.log(`• ${tab.label} sync: ${reason} — keeping existing JSON`);
    continue;
  }

  console.log(`• ${tab.label} sync: fetching ${tab.url}`);
  try {
    const csv = await fetchCsv(tab.url, tab.label);
    const rows = parseCsv(csv);
    if (rows.length < 2) throw new Error('sheet has no data rows');

    const items = tab.parse(rows);
    if (items.length === 0) throw new Error('no valid items found after parsing');

    await writeFile(tab.outPath, JSON.stringify(items, null, 2) + '\n');
    console.log(`✓ ${tab.label} sync: wrote ${items.length} items`);
  } catch (err) {
    console.error(`✗ ${tab.label} sync failed: ${err.message}`);
    console.error('  (sheet must be shared as "Anyone with the link can view")');
    anyFailed = true;
  }
}

if (anyFailed) process.exit(1);
