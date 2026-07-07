import { chromium } from 'playwright';
const b = await chromium.launch();
const p = await b.newPage();
const logs = [];
p.on('console', m => logs.push(m.text()));
p.on('pageerror', e => logs.push('ERR: ' + e.message));

await p.goto('http://localhost:4321/', { waitUntil: 'networkidle' });
await p.getByRole('button', { name: 'Café Events' }).click();
await p.waitForTimeout(1200);

// Manually check if images loaded by examining naturalWidth
const imageData = await p.evaluate(() => {
  const imgs = Array.from(document.querySelectorAll('div[class*="flex touch-pan-y"] img'));
  return imgs.slice(0, 2).map(img => ({
    src: img.getAttribute('src'),
    naturalWidth: img.naturalWidth,
    naturalHeight: img.naturalHeight,
    complete: img.complete,
  }));
});

console.log('IMAGE_LOAD_STATUS:', JSON.stringify(imageData, null, 2));
console.log('CONSOLE_LOGS:', logs.slice(0, 5));
await b.close();
