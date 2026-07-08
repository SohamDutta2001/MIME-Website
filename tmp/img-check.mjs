import { chromium } from 'playwright';
const b = await chromium.launch();
const p = await b.newPage();
await p.goto('http://localhost:4321/', { waitUntil: 'networkidle' });
await p.locator('[id=events]').scrollIntoViewIfNeeded();
await p.waitForTimeout(800);

const imgs = await p.locator('div.flex.touch-pan-y img').all();
console.log('Images found:', imgs.length);
for (let i = 0; i < Math.min(2, imgs.length); i++) {
  const src = await imgs[i].getAttribute('src');
  console.log(`  img${i+1}: ${(src || 'NO SRC').substring(0, 80)}`);
}
await b.close();
