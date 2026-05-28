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
//
// Usage:
//   node --env-file=.env scripts/sync-menu.mjs    (local with .env)
//   node scripts/sync-menu.mjs                    (CI — vars from environment)

import { writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

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

// Minimal RFC 4180 CSV parser — handles quoted fields, embedded commas,
// embedded newlines, and "" escapes. Sheets gviz output is well-formed.
function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = '';
  let inQuotes = false;
  let i = 0;
  while (i < text.length) {
    const ch = text[i];
    if (inQuotes) {
      if (ch === '"' && text[i + 1] === '"') {
        field += '"';
        i += 2;
        continue;
      }
      if (ch === '"') {
        inQuotes = false;
        i++;
        continue;
      }
      field += ch;
      i++;
      continue;
    }
    if (ch === '"') {
      inQuotes = true;
      i++;
      continue;
    }
    if (ch === ',') {
      row.push(field);
      field = '';
      i++;
      continue;
    }
    if (ch === '\r') {
      i++;
      continue;
    }
    if (ch === '\n') {
      row.push(field);
      rows.push(row);
      row = [];
      field = '';
      i++;
      continue;
    }
    field += ch;
    i++;
  }
  // flush final field/row if file doesn't end with a newline
  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  return rows;
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
    return {
      id: Number(r[idx.id]?.trim()) || n + 1,
      category: r[idx.category]?.trim() || 'Uncategorised',
      itemName: r[idx.itemname]?.trim() || '(unnamed)',
      price: Number.isFinite(priceNum) ? priceNum : 0,
      description: r[idx.description]?.trim() || '',
    };
  });

if (items.length === 0) {
  console.error('✗ menu sync: no valid items found after parsing');
  process.exit(1);
}

await writeFile(OUT_PATH, JSON.stringify(items, null, 2) + '\n');
console.log(`✓ menu sync: wrote ${items.length} items to src/data/mockMenuData.json`);
