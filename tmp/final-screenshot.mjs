import { chromium } from 'playwright';
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1280, height: 900 } });
await p.goto('http://localhost:4321/', { waitUntil: 'networkidle' });
await p.getByRole('button', { name: 'Café Events' }).click();
await p.waitForTimeout(1500);
await p.screenshot({ path: 'tmp/current-carousel.png', fullPage: true });

// Check network errors for the image
const failed = [];
p.on('response', res => {
  if (res.url().includes('thumbnail') && !res.ok()) {
    failed.push(res.url() + ' → ' + res.status());
  }
});

await b.close();
console.log('Failed image loads:', failed.length ? failed : 'none detected');
