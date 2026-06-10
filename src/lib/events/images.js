// Event image resolution — sheet cells may hold either a full Cloudinary
// delivery URL (the normal case once Cloudinary is set up) or a bare
// filename that lives in /public/cafe-assets/ (the out-of-the-box fallback
// used by the committed sample data). Kept separate from utils.js because
// cldImg pulls in import.meta.env, which node --test can't evaluate.

import { cldImg } from '../img.js';

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
  if (/^https?:\/\//i.test(v)) return v;
  return cldImg(v, opts);
}
