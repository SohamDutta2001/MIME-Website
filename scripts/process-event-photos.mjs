// Developer utility — run once to process Web gallery event photos into public/cafe-assets/.
// Not part of the Astro build pipeline. Do not invoke from CI.
// Usage: node scripts/process-event-photos.mjs

import sharp from 'sharp';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const SRC_BASE = path.join(ROOT, 'Web gallery ');
const OUT_DIR = path.join(ROOT, 'public', 'cafe-assets');

const jobs = [
  // FIRST STAGE — 3:2, 800×533
  { in: 'First stage /IMG-20240818-WA0058.jpg', out: 'mime-first-stage-stage-moment.webp',   w: 800, h: 533, pos: 'attention' },
  { in: 'First stage /IMG-20240818-WA0059.jpg', out: 'mime-first-stage-face-paint.webp',     w: 800, h: 533, pos: 'attention' },
  { in: 'First stage /IMG-20240818-WA0061.jpg', out: 'mime-first-stage-ribbons.webp',         w: 800, h: 533, pos: 'centre'    },
  { in: 'First stage /IMG-20260523-WA0072.jpg', out: 'mime-first-stage-dark-dance.webp',      w: 800, h: 533, pos: 'attention' },
  { in: 'First stage /IMG-20260524-WA0008.jpg', out: 'mime-first-stage-clay-hands.webp',      w: 800, h: 533, pos: 'attention' },
  { in: 'First stage /IMG-20260531-WA0238.jpg', out: 'mime-first-stage-full-production.webp', w: 800, h: 533, pos: 'centre'    },

  // WORKSHOP — 4:3, 800×600
  { in: 'Workshop /IMG-20260515-WA0053.jpg', out: 'mime-workshop-drawing-guidance.webp',    w: 800, h: 600, pos: 'attention' },
  { in: 'Workshop /IMG-20260515-WA0101.jpg', out: 'mime-workshop-circle-discussion.webp',   w: 800, h: 600, pos: 'centre'    },
  { in: 'Workshop /IMG20230614180251.jpg',   out: 'mime-workshop-community-gathering.webp', w: 800, h: 600, pos: 'centre'    },
  { in: 'Workshop /IMG20240223161935.jpg',   out: 'mime-workshop-group-movement.webp',      w: 800, h: 600, pos: 'centre'    },
  { in: 'Workshop /IMG-20260515-WA0082.jpg', out: 'mime-workshop-acrobatics.webp',          w: 800, h: 600, pos: 'attention' },

  // PERFORMANCE — 16:9, 1200×675
  { in: 'Performance /DSC03177.JPG',             out: 'mime-performance-duo-costume.webp',      w: 1200, h: 675, pos: 'attention' },
  { in: 'Performance /DSC08134 - Copy.JPG',      out: 'mime-performance-ensemble-stage.webp',   w: 1200, h: 675, pos: 'centre'    },
  { in: 'Performance /FB_IMG_1679716648071.jpg', out: 'mime-performance-aerial-blue.webp',      w: 1200, h: 675, pos: 'attention' },
  { in: 'Performance /Cl06.jpg',                 out: 'mime-performance-outdoor-festival.webp', w: 1200, h: 675, pos: 'attention' },
  { in: 'Performance /IMG_6390.JPG',             out: 'mime-performance-vw-festival.webp',      w: 1200, h: 675, pos: 'attention' },
];

let ok = 0;
let skipped = 0;

for (const job of jobs) {
  const inPath = path.join(SRC_BASE, job.in);
  const outPath = path.join(OUT_DIR, job.out);
  if (!fs.existsSync(inPath)) {
    console.warn(`SKIP (missing): ${job.in}`);
    skipped++;
    continue;
  }
  try {
    await sharp(inPath)
      .rotate()
      .resize(job.w, job.h, { fit: 'cover', position: job.pos })
      .webp({ quality: 84 })
      .toFile(outPath);
    const stat = fs.statSync(outPath);
    const kb = Math.round(stat.size / 1024);
    const flag = kb > 120 ? ' ⚠ >120KB' : '';
    console.log(`OK  ${job.out}  (${kb} KB)${flag}`);
    ok++;
  } catch (err) {
    console.error(`FAIL ${job.in}: ${err.message}`);
    skipped++;
  }
}

console.log(`\nDone: ${ok} processed, ${skipped} skipped.`);
