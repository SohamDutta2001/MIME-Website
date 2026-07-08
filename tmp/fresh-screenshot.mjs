import { chromium } from 'playwright';
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1280, height: 800 } });
await p.goto('http://localhost:4321/', { waitUntil: 'networkidle' });
await p.locator('[id=events]').scrollIntoViewIfNeeded();
await p.waitForTimeout(1200);
await p.screenshot({ path: 'tmp/fresh-carousel.png' });
console.log('Screenshot saved to tmp/fresh-carousel.png');
await b.close();
