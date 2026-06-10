// Slug helpers — turn event titles into /events/<slug> path segments.
//
// Plain JS with no Vite/Astro dependencies on purpose: this module is
// imported both by the site (src/) and by the Node build-time sync
// (scripts/sync-events.mjs), which runs outside the bundler.

/**
 * "Rabindra Sangeet Evening" → "rabindra-sangeet-evening".
 * Diacritics are folded to ASCII; anything left that isn't [a-z0-9]
 * (including Bengali script) collapses into hyphens. A title with no
 * ASCII at all falls back to "event" (dedupeSlugs disambiguates).
 *
 * @param {string} title
 * @returns {string}
 */
export function slugify(title) {
  const slug = title
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return slug || 'event';
}

/**
 * Make a list of slugs unique by suffixing repeats with -2, -3, …
 * Keeps the first occurrence unsuffixed so existing URLs stay stable
 * when a duplicate title is added later in the sheet.
 *
 * @param {string[]} slugs
 * @returns {string[]}
 */
export function dedupeSlugs(slugs) {
  const seen = new Map();
  return slugs.map((slug) => {
    const count = (seen.get(slug) ?? 0) + 1;
    seen.set(slug, count);
    return count === 1 ? slug : `${slug}-${count}`;
  });
}
