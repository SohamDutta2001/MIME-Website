// Build-time menu sync — pulls the live menu from a Google Sheet (CSV
// export of a public sheet) and rewrites src/data/mockMenuData.json so the
// React island bundles the fresh data into the static site.
//
// Configured via environment variables:
//   MENU_SHEET_ID   — required, the sheet's id from its URL
//                     (https://docs.google.com/spreadsheets/d/THIS_BIT/edit...)
//   MENU_SHEET_GID  — optional, the tab/gid (default: 0 = first tab)
//
// Behaviour:
//   - no env vars set      → log, exit 0, leave the existing JSON alone.
//                            Lets local dev work without any setup.
//   - env vars set + ok    → overwrite the JSON, exit 0.
//   - env vars set + fail  → log error, exit 1 (so the build fails loudly
//                            instead of silently deploying stale data).
//
// The expected sheet columns (header row, case-insensitive):
//   id, category, itemName, price, description
//   addMilk  — optional numeric; upcharge for adding milk (e.g. 10 → renders "Milk +10")
//   addLarge — optional numeric; upcharge for large size  (e.g. 10 → renders "Large +10")
//
// Usage:
//   node --env-file=.env scripts/sync-menu.mjs    (local with .env)
//   node scripts/sync-menu.mjs                    (CI — vars from environment)

import { writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { parseCsv } from './lib/parse-csv.mjs';

const OUT_PATH = resolve(process.cwd(), 'src/data/mockMenuData.json');

const sheetId = process.env.MENU_SHEET_ID?.trim();
const sheetGid = process.env.MENU_SHEET_GID?.trim() || '0';

if (!sheetId) {
  console.log(
    '• menu sync: MENU_SHEET_ID not set — keeping existing src/data/mockMenuData.json',
  );
  process.exit(0);
}

const url = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv&gid=${sheetGid}`;
console.log(`• menu sync: fetching ${url}`);

let csv;
try {
  const res = await fetch(url, { redirect: 'follow' });
  if (!res.ok) {
    throw new Error(`HTTP ${res.status} ${res.statusText}`);
  }
  csv = await res.text();
} catch (err) {
  console.error(`✗ menu sync failed: ${err.message}`);
  console.error('  (sheet must be shared as "Anyone with the link can view")');
  process.exit(1);
}

const rows = parseCsv(csv);
if (rows.length < 2) {
  console.error('✗ menu sync: sheet has no data rows');
  process.exit(1);
}

const header = rows[0].map((h) => h.trim().toLowerCase());
const required = ['id', 'category', 'itemname', 'price', 'description'];
const missing = required.filter((c) => !header.includes(c));
if (missing.length) {
  console.error(`✗ menu sync: sheet missing required columns: ${missing.join(', ')}`);
  console.error(`  expected: ${required.join(', ')}`);
  console.error(`  found:    ${header.join(', ')}`);
  process.exit(1);
}

const idx = Object.fromEntries(header.map((h, i) => [h, i]));

const items = rows
  .slice(1)
  // drop fully-empty rows (Sheets often emits trailing blanks)
  .filter((r) => r.some((cell) => cell.trim() !== ''))
  .map((r, n) => {
    const rawPrice = r[idx.price]?.trim() ?? '';
    const priceNum = Number(rawPrice.replace(/[^\d.]/g, ''));

    const addLarge = Number(r[idx.addlarge]?.trim());
    const addMilk  = Number(r[idx.addmilk]?.trim());
    const modifiers = [];
    if (!isNaN(addLarge) && addLarge > 0) modifiers.push({ label: 'Large', priceString: `+${addLarge}` });
    if (!isNaN(addMilk)  && addMilk  > 0) modifiers.push({ label: 'Milk',  priceString: `+${addMilk}`  });
    const sizes = modifiers.length > 0 ? modifiers : null;

    return {
      id: Number(r[idx.id]?.trim()) || n + 1,
      category: r[idx.category]?.trim() || 'Uncategorised',
      itemName: r[idx.itemname]?.trim() || '(unnamed)',
      price: Number.isFinite(priceNum) ? priceNum : 0,
      description: r[idx.description]?.trim() || '',
      sizes,
    };
  });

if (items.length === 0) {
  console.error('✗ menu sync: no valid items found after parsing');
  process.exit(1);
}

await writeFile(OUT_PATH, JSON.stringify(items, null, 2) + '\n');
console.log(`✓ menu sync: wrote ${items.length} items to src/data/mockMenuData.json`);
