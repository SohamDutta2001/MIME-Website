import { chromium } from 'playwright';
const b = await chromium.launch();
const p = await b.newPage();
await p.goto('http://localhost:4321/', { waitUntil: 'networkidle' });
await p.getByRole('button', { name: 'Café Events' }).click();
await p.waitForTimeout(1000);

const imgs = await p.locator('div.flex.touch-pan-y img').all();
for (let i = 0; i < Math.min(2, imgs.length); i++) {
  const src = await imgs[i].getAttribute('src');
  console.log(`img${i+1} src: ${src}`);
}
await b.close();
