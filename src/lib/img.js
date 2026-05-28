// Image URL helpers — Cloudinary delivery with graceful local fallback.
//
// CLOUDINARY_CLOUD_NAME starts empty so the site runs out-of-the-box against
// the files in /public/cafe-assets/. The moment you paste your Cloudinary
// cloud name into the constant below, every photo on the site starts
// flowing through Cloudinary's CDN with auto-format and auto-quality.
//
// See docs/SETUP.md for the full Cloudinary onboarding walkthrough.

// ─── config ──────────────────────────────────────────────────────────────────

// Your Cloudinary cloud name. Find it on the Cloudinary dashboard, top-left
// — looks like a slug (e.g. "dxx7eqxxx" or "art-teas-tree"). Leave empty to
// keep using local /public/cafe-assets/ images.
export const CLOUDINARY_CLOUD_NAME = '';

// Default transforms applied to every Cloudinary URL when caller doesn't
// override them. `f_auto` lets Cloudinary pick the best format per browser
// (AVIF / WebP / JPEG). `q_auto` lets it pick the right quality. We do NOT
// set a default width — the caller decides per use-case (hero vs. thumbnail).
const DEFAULT_TRANSFORMS = ['f_auto', 'q_auto'];

// ─── path helpers ────────────────────────────────────────────────────────────

// Astro's import.meta.env.BASE_URL is "/" in dev and "/MIME-Website/" on
// GitHub Pages. We need this prefix on every local-asset path so links work
// in both places. Matches the helper that previously lived in CafeApp.jsx.
const assetBase = import.meta.env.BASE_URL.endsWith('/')
  ? import.meta.env.BASE_URL
  : `${import.meta.env.BASE_URL}/`;

/**
 * Resolve a path under /public for the current deploy base.
 * Use this for non-photo assets (SVG textures, the wicker pattern, etc.).
 *
 * @param {string} path  Path starting at /public root (e.g. "/grain.svg")
 * @returns {string}     Browser-ready URL
 */
export function assetPath(path) {
  return `${assetBase}${path.replace(/^\/+/, '')}`;
}

// ─── Cloudinary image URL builder ────────────────────────────────────────────

/**
 * Build an image URL for a café photo.
 *
 * - When CLOUDINARY_CLOUD_NAME is set: returns a Cloudinary delivery URL with
 *   the requested transforms. Cloudinary serves the optimal format and
 *   quality automatically.
 * - When CLOUDINARY_CLOUD_NAME is empty: falls back to /public/cafe-assets/
 *   with the original filename. The site keeps working with whatever's on
 *   disk — useful in dev and before the Cloudinary account is set up.
 *
 * The `filename` argument is the file name in /public/cafe-assets/ AND the
 * Cloudinary public_id (with the extension stripped). To migrate to
 * Cloudinary, upload each image with public_id = filename-without-extension.
 *
 * @param {string} filename  e.g. "hero-01.webp"
 * @param {object} [opts]
 * @param {number} [opts.width]    Pixel width to render at (Cloudinary only)
 * @param {string} [opts.crop]     Cloudinary crop mode (e.g. "fill", "limit")
 * @param {string[]} [opts.extra]  Extra raw transforms (e.g. ["e_grayscale"])
 * @returns {string}               Browser-ready URL
 */
export function cldImg(filename, opts = {}) {
  // Local fallback — preserve the filename verbatim under /cafe-assets/.
  if (!CLOUDINARY_CLOUD_NAME) {
    return assetPath(`/cafe-assets/${filename}`);
  }

  // Build transform string. Width is optional (omitted = serve original size).
  const transforms = [...DEFAULT_TRANSFORMS];
  if (opts.width) transforms.push(`w_${opts.width}`);
  if (opts.crop) transforms.push(`c_${opts.crop}`);
  if (opts.extra) transforms.push(...opts.extra);

  // Cloudinary public_id = filename minus the extension.
  const publicId = filename.replace(/\.[^.]+$/, '');

  return `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload/${transforms.join(',')}/${publicId}`;
}
