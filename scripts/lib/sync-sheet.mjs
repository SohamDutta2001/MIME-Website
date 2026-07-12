// Shared primitives for sync-menu.mjs and sync-events.mjs.
// Each sync script imports what it needs from here.

import { copyFile, rename, unlink, writeFile } from 'node:fs/promises';
import { parse as parseCsv } from 'csv-parse/sync';

export const REQUEST_TIMEOUT_MS = 10_000;
export const MAX_RETRIES        = 2;  // additional attempts after the first (3 total)
export const MAX_LOG_ROWS       = 1000;
export const THROTTLE_MS        = 45_000;

export const RETRYABLE_CODES    = new Set([429, 502, 503, 504]);

// ─── Fetch CSV from URL with timeout and retry on 429/5xx ─────────────────────

export async function fetchCsvWithRetry(url, label) {
  let lastErr;
  for (let attempt = 1; attempt <= MAX_RETRIES + 1; attempt++) {
    try {
      const res = await fetch(url, {
        redirect: 'follow',
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      });
      if (!res.ok) {
        if (RETRYABLE_CODES.has(res.status) && attempt <= MAX_RETRIES) {
          const wait = Math.pow(2, attempt - 1) * 1000;
          console.warn(`[${label}] HTTP ${res.status} on attempt ${attempt} — retrying in ${wait}ms`);
          await sleep(wait);
          continue;
        }
        throw new Error(`HTTP ${res.status} ${res.statusText}`);
      }
      const contentType = res.headers.get('content-type') ?? '';
      const text = await res.text();
      return { text, contentType, attempt };
    } catch (err) {
      if (err.name === 'TimeoutError' || err.name === 'AbortError') {
        lastErr = new Error(`request timed out after ${REQUEST_TIMEOUT_MS}ms`);
      } else {
        lastErr = err;
      }
      if (attempt <= MAX_RETRIES) {
        const wait = Math.pow(2, attempt - 1) * 1000;
        console.warn(`[${label}] ${lastErr.message} on attempt ${attempt} — retrying in ${wait}ms`);
        await sleep(wait);
      }
    }
  }
  throw lastErr;
}

// ─── Content-Type guard ───────────────────────────────────────────────────────

export function assertCsvContentType(contentType, label) {
  if (contentType && contentType.startsWith('text/html')) {
    throw new Error(
      `Expected text/csv, got ${contentType} — Google may have returned an error page. ` +
      `Check that the sheet is public and the GID is correct.`
    );
  }
}

// ─── CSV parsing (csv-parse) ──────────────────────────────────────────────────

export function parseCsvText(text, label) {
  return parseCsv(text, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
    bom: true,
  });
}

// ─── Header validation with normalization ─────────────────────────────────────
// Normalizes: trim, lowercase, strip internal spaces/underscores.
// Returns the normalized→original index so callers can still read cells.

export function normalizeHeader(h) {
  return h.trim().toLowerCase().replace(/[\s_]+/g, '');
}

export function validateHeaders(rows, required, label) {
  if (rows.length === 0) throw new Error('sheet has no data rows');
  const found = Object.keys(rows[0]).map(normalizeHeader);
  const missing = required.filter((r) => !found.includes(r));
  if (missing.length) {
    throw new Error(`Missing required column${missing.length > 1 ? 's' : ''}: ${missing.join(', ')}`);
  }
}

// Get a cell value from a csv-parse row using normalized key lookup
export function cell(row, normalizedKey) {
  const rawKey = Object.keys(row).find((k) => normalizeHeader(k) === normalizedKey);
  return rawKey !== undefined ? (row[rawKey]?.trim() ?? '') : '';
}

// ─── Atomic write ─────────────────────────────────────────────────────────────

export async function atomicWrite(outPath, content) {
  const tmp = outPath + '.tmp';
  try {
    await writeFile(tmp, content);
    await rename(tmp, outPath);
  } catch (err) {
    await unlink(tmp).catch(() => {});
    throw err;
  }
}

// ─── Seed fallback ────────────────────────────────────────────────────────────

export async function copySeed(seedPath, outPath, label, reason) {
  try {
    await copyFile(seedPath, outPath);
    console.warn(`[${label}] Using seed fallback: ${seedPath}`);
  } catch (copyErr) {
    console.error(`[${label}] CRITICAL: seed fallback also failed: ${copyErr.message}`);
    throw copyErr;
  }
}

// ─── Build ID ─────────────────────────────────────────────────────────────────

export function buildId() {
  return process.env.GITHUB_RUN_ID ?? process.env.VERCEL_GIT_COMMIT_SHA ?? 'local';
}

// ─── Internal ────────────────────────────────────────────────────────────────

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}
