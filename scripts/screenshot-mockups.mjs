// Screenshot pipeline for the mockup deck.
//
// Usage:
//   1. start the dev server in another terminal:  npm run dev
//   2. run this script:                            node scripts/screenshot-mockups.mjs
//
// What it does:
//   - opens /mockups in a headless Chromium browser at 1440x900
//   - scrolls each <section id="slide-XX"> into view and captures it as a PNG
//   - writes the PNGs to docs/mockups/
//
// Notes:
//   - the script auto-detects the dev server port (4321 → 4322 → 4323) so it
//     doesn't break if you already have something on 4321
//   - first run on a fresh machine may need: npx playwright install chromium

import { chromium } from 'playwright';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const SLIDES = [
  { id: 'slide-01', filename: '01-directory-home.png' },
  { id: 'slide-02', filename: '02-directory-filtered.png' },
  { id: 'slide-03', filename: '03-artist-profile.png' },
  { id: 'slide-04', filename: '04-chat-booking.png' },
  { id: 'slide-05', filename: '05-chat-multilingual.png' },
  { id: 'slide-06', filename: '06-chat-menu.png' },
];

const VIEWPORT = { width: 1440, height: 900 };
const OUT_DIR = resolve(process.cwd(), 'docs/mockups');

async function findDevServer() {
  // Try the common Astro/Vite ports in order.
  for (const port of [4321, 4322, 4323, 4324]) {
    try {
      const res = await fetch(`http://localhost:${port}/mockups`);
      if (res.ok) return `http://localhost:${port}`;
    } catch {
      // port not listening — keep trying
    }
  }
  throw new Error(
    'No dev server found on 4321-4324. Start it first with `npm run dev`.',
  );
}

async function main() {
  console.log('• locating dev server...');
  const baseUrl = await findDevServer();
  console.log(`  → found at ${baseUrl}`);

  await mkdir(OUT_DIR, { recursive: true });

  console.log('• launching Chromium...');
  const browser = await chromium.launch();
  const ctx = await browser.newContext({
    viewport: VIEWPORT,
    deviceScaleFactor: 2, // retina-quality PNGs
  });
  const page = await ctx.newPage();

  console.log('• loading /mockups...');
  await page.goto(`${baseUrl}/mockups`, { waitUntil: 'networkidle' });

  // Give Framer Motion / images / fonts a moment to settle before screenshotting.
  await page.waitForTimeout(1500);

  // Hide the sticky deck-navigation header so it doesn't appear in every shot.
  await page.addStyleTag({
    content: `header.sticky { display: none !important; }`,
  });

  for (const { id, filename } of SLIDES) {
    console.log(`  → capturing #${id} -> docs/mockups/${filename}`);
    const locator = page.locator(`#${id}`);
    await locator.scrollIntoViewIfNeeded();
    await page.waitForTimeout(450); // settle scroll + lazy images
    await locator.screenshot({ path: resolve(OUT_DIR, filename) });
  }

  await browser.close();
  console.log(`✓ wrote ${SLIDES.length} screenshots to ${OUT_DIR}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
