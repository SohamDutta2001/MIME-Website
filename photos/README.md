# photos/

This folder holds the original master photos for the website.

## How to add a photo

1. Drop the file in this folder.
2. Name it after where it appears (see *Naming convention* below).
3. Astro's `<Image>` component will optimize it automatically (AVIF, WebP, responsive sizes) at build time. You don't need to resize or compress before adding.
4. JPEGs are preferred for photographs. PNG is fine for graphics. SVGs pass through as-is.
5. Originals can be large — 3000px+ on the long edge is fine. The build will downscale.

## Naming convention

| Filename | Where it appears | Aspect ratio target |
|---|---|---|
| `hero.jpg` | Homepage hero | 16:9 (landscape) |
| `experience-cha.jpg` | `/experience` — *Cha er Dokan* movement | 16:9 |
| `experience-books.jpg` | `/experience` — *The Books* movement | 16:9 |
| `experience-smoke.jpg` | `/experience` — *The Smoke* movement | 16:9 |
| `experience-hours.jpg` | `/experience` — *The Hours* movement | 16:9 |
| `gallery-01.jpg` ... `gallery-12.jpg` | `/adda` masonry gallery | mixed (3:4, 4:5, 1:1, 5:7 OK) |
| `bookshelf.jpg` | `/adda` book corner header | 21:9 panoramic if available |
| `map-sketch.svg` | `/visit` location | hand-drawn line art |
| `signature.svg` | Footer flourish | small line drawing |

## Replacing a placeholder

Just drop the real file in with the same filename and run `npm run build`. The placeholder will be replaced everywhere automatically. No code changes needed.

## Credits

When adding photos from photographers (real, stock, or commissioned), record attribution in [CREDITS.md](./CREDITS.md). Especially important if any photo carries CC or unsplash-license terms.

## What's currently here

Only SVG placeholders. They show their target filename and a "PLACEHOLDER" label so you can see what's missing in the build. Real photos replace them one-to-one.
