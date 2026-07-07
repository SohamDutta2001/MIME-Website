import { chromium } from 'playwright';

const browser = await chromium.launch();
const page = await browser.newPage();
const errors = [];
const requests = [];

page.on('pageerror', (e) => errors.push('PAGEERROR: ' + e.message));
page.on('console', (msg) => { if (msg.type() === 'error') errors.push('CONSOLE: ' + msg.text()); });

page.on('response', (res) => {
  if (res.url().includes('drive.google.com') || res.url().includes('thumbnail')) {
    requests.push({ url: res.url(), status: res.status() });
  }
});

await page.goto('http://localhost:4321/', { waitUntil: 'networkidle' });
await page.locator('[id="events"]').scrollIntoViewIfNeeded();
await page.waitForTimeout(1500);

console.log('GOOGLE_DRIVE_REQUESTS:', JSON.stringify(requests.slice(0, 3)));
console.log('ERRORS:', JSON.stringify(errors));

// Check if images actually have src
const imgs = await page.locator('img[src*="drive.google"]').count();
console.log('DRIVE_IMAGES_IN_DOM:', imgs);

// Check actual img src values
const srcs = await page.locator('a[href*="/events/"] img').evaluate((els) =>
  els.slice(0, 2).map((e) => e.src)
);
console.log('FIRST_TWO_IMG_SRCS:', JSON.stringify(srcs));

await browser.close();
