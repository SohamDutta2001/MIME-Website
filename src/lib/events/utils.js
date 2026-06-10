// Pure event helpers — no data imports, no Vite/Astro dependencies, so the
// same code runs in the site bundle and under `node --test`. The typed
// loader that binds these to src/data/events.json lives in events.ts.

/** @typedef {import('../../types/event').CafeEvent} CafeEvent */

/**
 * Only events the owner has marked visible. The sync script already drops
 * inactive rows, but the committed fallback JSON goes through this too.
 *
 * @param {CafeEvent[]} events
 * @returns {CafeEvent[]}
 */
export function filterActive(events) {
  return events.filter((e) => e.active);
}

/**
 * Sort by date. ISO dates (YYYY-MM-DD) compare correctly as strings.
 * Returns a new array; ties keep sheet order.
 *
 * @param {CafeEvent[]} events
 * @param {'asc' | 'desc'} [direction]
 * @returns {CafeEvent[]}
 */
export function sortByDate(events, direction = 'asc') {
  const sign = direction === 'desc' ? -1 : 1;
  return [...events].sort((a, b) => sign * a.date.localeCompare(b.date));
}

/**
 * Today as YYYY-MM-DD in the build machine's timezone. For a static site
 * this is frozen at build time — the scheduled rebuild keeps it honest.
 * @returns {string}
 */
export function todayISO() {
  const now = new Date();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  return `${now.getFullYear()}-${mm}-${dd}`;
}

/**
 * Split into { upcoming, past }: upcoming (today included) soonest-first,
 * past most-recent-first.
 *
 * @param {CafeEvent[]} events
 * @param {string} [today] YYYY-MM-DD; defaults to todayISO()
 * @returns {{ upcoming: CafeEvent[], past: CafeEvent[] }}
 */
export function splitUpcomingPast(events, today = todayISO()) {
  return {
    upcoming: sortByDate(events.filter((e) => e.date >= today), 'asc'),
    past: sortByDate(events.filter((e) => e.date < today), 'desc'),
  };
}

/**
 * @param {CafeEvent[]} events
 * @param {string} slug
 * @returns {CafeEvent | undefined}
 */
export function findBySlug(events, slug) {
  return events.find((e) => e.slug === slug);
}

/**
 * Split sheet-cell text into paragraphs on blank lines.
 * "a\n\nb" → ["a", "b"]; whitespace-only text → [].
 *
 * @param {string} text
 * @returns {string[]}
 */
export function paragraphs(text) {
  return text
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
}

/**
 * "2026-07-04" → "Saturday 4 July 2026". Invalid input is returned as-is
 * (the sync validates format, but the fallback JSON is hand-edited).
 *
 * @param {string} isoDate
 * @returns {string}
 */
export function formatEventDate(isoDate) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(isoDate)) return isoDate;
  // Noon UTC keeps the calendar day stable in every build timezone. Names
  // are spelled out (not toLocaleDateString) so output is identical across
  // Node/browser ICU versions.
  const d = new Date(`${isoDate}T12:00:00Z`);
  if (Number.isNaN(d.getTime())) return isoDate;
  const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const months = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];
  return `${weekdays[d.getUTCDay()]} ${d.getUTCDate()} ${months[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}
