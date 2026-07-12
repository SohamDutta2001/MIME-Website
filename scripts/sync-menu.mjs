// Fetches the Menu and Institute Programmes tabs from Google Sheets (CSV export)
// and writes src/data/menu.json and src/data/instituteData.json at build time.
//
// Environment variables:
//   MENU_SHEET_ID       — required for menu sync (sheet id from its URL)
//   MENU_SHEET_GID      — optional; tab gid for the menu tab (default: 0)
//   INSTITUTE_SHEET_GID — optional; tab gid for the Institute Programmes tab
//
// If an env var is missing: seed fallback is used (menu.seed.json → menu.json).
// If fetch/parse/validation fails: seed fallback is used; build continues.
// Sheet must be public ("Anyone with the link can view").

import { resolve } from 'node:path';
import {
  REQUEST_TIMEOUT_MS, MAX_RETRIES,
  fetchCsvWithRetry, assertCsvContentType, parseCsvText,
  validateHeaders, cell, normalizeHeader,
  atomicWrite, copySeed, buildId,
} from './lib/sync-sheet.mjs';

const MENU_SEED  = resolve(process.cwd(), 'src/data/menu.seed.json');
const MENU_OUT   = resolve(process.cwd(), 'src/data/menu.json');
const INST_OUT   = resolve(process.cwd(), 'src/data/instituteData.json');

const sheetId = process.env.MENU_SHEET_ID?.trim();

// ─── Menu tab ─────────────────────────────────────────────────────────────────

const MENU_REQUIRED = ['id', 'category', 'itemname', 'price'];

async function syncMenu() {
  const label = 'sync-menu';
  const t0 = Date.now();

  if (!sheetId) {
    console.warn(`[${label}] MENU_SHEET_ID not set — copying seed fallback`);
    await copySeed(MENU_SEED, MENU_OUT, label);
    return;
  }

  const gid = process.env.MENU_SHEET_GID?.trim() || '0';
  const url = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv&gid=${gid}`;
  console.log(`[${label}] fetching ${url}`);

  let rows, csvSize;
  try {
    const { text, contentType, attempt } = await fetchCsvWithRetry(url, label);
    console.log(`[${label}] fetched (attempt ${attempt})`);

    assertCsvContentType(contentType, label);

    csvSize = text.length;
    rows = parseCsvText(text, label);
    console.log(`[${label}] CSV: ${(csvSize / 1024).toFixed(1)} KB (${rows.length} rows) — content-type: ${contentType || 'unknown'}`);
  } catch (err) {
    console.error(`[${label}] Fetch/parse failed: ${err.message} — using seed fallback`);
    await copySeed(MENU_SEED, MENU_OUT, label);
    return;
  }

  try {
    validateHeaders(rows, MENU_REQUIRED, label);
    console.log(`[${label}] Headers OK (normalized): ${Object.keys(rows[0]).join(', ')}`);
  } catch (err) {
    console.error(`[${label}] ${err.message} — using seed fallback`);
    await copySeed(MENU_SEED, MENU_OUT, label);
    return;
  }

  const items = [];
  const skipped = { invalidPrice: 0, duplicateId: 0, other: 0 };
  const seenIds = new Set();

  for (let i = 0; i < rows.length; i++) {
    const r = rows[i];
    const rowNum = i + 2;

    const rawId = cell(r, 'id');
    const id = Number(rawId) || (i + 1);
    const rawPrice = cell(r, 'price');
    const priceNum = Number(rawPrice.replace(/[^\d.]/g, ''));
    const price = Number.isFinite(priceNum) && rawPrice !== '' ? priceNum : null;

    if (rawPrice !== '' && price === null) {
      console.warn(`[${label}] row ${rowNum}: invalid price "${rawPrice}" — skipping`);
      skipped.invalidPrice++;
      continue;
    }

    if (seenIds.has(id)) {
      console.warn(`[${label}] row ${rowNum}: duplicate ID ${id} — skipping`);
      skipped.duplicateId++;
      continue;
    }
    seenIds.add(id);

    const rawDisplay = cell(r, 'pricedisplay');
    items.push({
      id,
      category: cell(r, 'category') || 'Uncategorised',
      subcategory: cell(r, 'subcategory'),
      itemName: cell(r, 'itemname') || '(unnamed)',
      price,
      priceDisplay: rawDisplay || (price != null ? `₹${price}` : ''),
      description: cell(r, 'description'),
    });
  }

  if (items.length === 0) {
    console.error(
      `[${label}] 0 valid rows after validation. ` +
      `Possible causes: wrong GID, columns missing, accidental delete. ` +
      `Using seed fallback. ACTION REQUIRED: check the sheet.`
    );
    await copySeed(MENU_SEED, MENU_OUT, label);
    return;
  }

  const totalSkipped = Object.values(skipped).reduce((a, b) => a + b, 0);
  const skipSummary = totalSkipped
    ? ` (${totalSkipped} skipped: ${skipped.invalidPrice} invalid price, ${skipped.duplicateId} duplicate ID)`
    : '';

  const categories = [...new Set(items.map((x) => x.category))];
  console.log(`[${label}] Wrote ${items.length} items across ${categories.length} categories${skipSummary}`);

  const output = {
    schemaVersion: 1,
    generatedAt: new Date().toISOString(),
    source: 'Google Sheets',
    sheetId,
    buildId: buildId(),
    activeRowCount: items.length,
    data: items,
  };

  console.log(`[${label}] Metadata: schemaVersion=${output.schemaVersion} buildId=${output.buildId} activeRowCount=${output.activeRowCount}`);

  try {
    await atomicWrite(MENU_OUT, JSON.stringify(output, null, 2) + '\n');
  } catch (err) {
    console.error(`[${label}] Atomic write failed: ${err.message} — using seed fallback`);
    await copySeed(MENU_SEED, MENU_OUT, label);
    return;
  }

  console.log(`[${label}] Completed in ${((Date.now() - t0) / 1000).toFixed(1)}s`);
}

// ─── Institute Programmes tab ─────────────────────────────────────────────────

const INST_REQUIRED = ['title'];

async function syncInstitute() {
  const label = 'sync-institute';
  const instGid = process.env.INSTITUTE_SHEET_GID?.trim();

  if (!sheetId || !instGid) {
    const reason = !sheetId ? 'MENU_SHEET_ID not set' : 'INSTITUTE_SHEET_GID not set';
    console.log(`[${label}] ${reason} — keeping existing instituteData.json`);
    return;
  }

  const url = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv&gid=${instGid}`;
  console.log(`[${label}] fetching ${url}`);

  let rows;
  try {
    const { text, contentType, attempt } = await fetchCsvWithRetry(url, label);
    assertCsvContentType(contentType, label);
    rows = parseCsvText(text, label);
    console.log(`[${label}] CSV: ${(text.length / 1024).toFixed(1)} KB (${rows.length} rows)`);
  } catch (err) {
    console.error(`[${label}] fetch failed: ${err.message} — keeping existing JSON`);
    return;
  }

  try {
    validateHeaders(rows, INST_REQUIRED, label);
  } catch (err) {
    console.error(`[${label}] ${err.message} — keeping existing JSON`);
    return;
  }

  const items = rows
    .map((r) => ({
      title: cell(r, 'title'),
      shortDesc: cell(r, 'shortdesc'),
      fullDesc: cell(r, 'fulldesc'),
      type: cell(r, 'type'),
    }))
    .filter((p) => p.title);

  if (items.length === 0) {
    console.warn(`[${label}] 0 valid rows — keeping existing JSON`);
    return;
  }

  try {
    await atomicWrite(INST_OUT, JSON.stringify(items, null, 2) + '\n');
    console.log(`[${label}] Wrote ${items.length} institute programmes`);
  } catch (err) {
    console.error(`[${label}] write failed: ${err.message}`);
  }
}

// ─── Run ──────────────────────────────────────────────────────────────────────

await syncMenu();
await syncInstitute();
