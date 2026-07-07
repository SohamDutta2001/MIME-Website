import { chromium } from 'playwright';
const b = await chromium.launch();
const p = await b.newPage();
p.on('pageerror', e => console.log('ERR:', e.message));
await p.goto('http://localhost:4321/', { waitUntil: 'networkidle' });
await p.getByRole('button', { name: 'Café Events' }).click();
await p.waitForTimeout(800);

// Inject a script to check component props
const urls = await p.evaluate(() => {
  const imgs = document.querySelectorAll('div.flex.touch-pan-y img');
  return Array.from(imgs).slice(0, 2).map(img => ({
    src: img.src,
    alt: img.alt
  }));
});

console.log('IMG_SRCS:', JSON.stringify(urls, null, 2));
await b.close();
