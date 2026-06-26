// Event image resolution — sheet cells may hold either a full Cloudinary
// delivery URL (the normal case once Cloudinary is set up) or a bare
// filename that lives in /public/cafe-assets/ (the out-of-the-box fallback
// used by the committed sample data). Kept separate from utils.js because
// cldImg pulls in import.meta.env, which node --test can't evaluate.

import { cldImg } from '../img.js';

/**
 * Rewrite a Google Drive *share* link into a direct-image URL an <img> tag
 * can actually load. Share links (…/file/d/ID/view, …/open?id=ID, …/uc?id=ID)
 * point at Drive's HTML viewer, not the image bytes, so they render broken.
 * The thumbnail endpoint serves the image directly and honours a size hint.
 *
 * The file must be shared as "Anyone with the link can view" for this to work.
 *
 * @param {string} url
 * @param {number} [width]  Desired pixel width (maps to Drive's sz=w… hint).
 * @returns {string|null}   Direct URL, or null if `url` isn't a Drive link.
 */
function driveDirectUrl(url, width) {
  if (!/(?:drive|docs)\.google\.com/.test(url)) return null;
  const id =
    url.match(/\/file\/d\/([\w-]+)/)?.[1] ?? // …/file/d/ID/view
    url.match(/[?&]id=([\w-]+)/)?.[1];        // …/open?id=ID, …/uc?id=ID
  if (!id) return null;
  const sz = `w${Math.round(width) || 1600}`;
  return `https://drive.google.com/thumbnail?id=${id}&sz=${sz}`;
}

/**
 * @param {string} value          Sheet cell: URL or bare filename. May be ''.
 * @param {object} [opts]         Passed to cldImg for local-name resolution
 *                                (width/crop only apply when the configured
 *                                Cloudinary account serves the file).
 * @returns {string}              Browser-ready URL, or '' if value is empty.
 */
export function resolveEventImage(value, opts = {}) {
  const v = value.trim();
  if (!v) return '';
  if (/^https?:\/\//i.test(v)) {
    return driveDirectUrl(v, opts.width) ?? v;
  }
  return cldImg(v, opts);
}
