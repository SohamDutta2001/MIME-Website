import { chromium } from 'playwright';
const b = await chromium.launch();
const p = await b.newPage();
await p.goto('http://localhost:4321/', { waitUntil: 'networkidle' });
await p.getByRole('button', { name: 'Café Events' }).click();
await p.waitForTimeout(1000);

// Look at the actual DOM structure of the first card
const firstCard = await p.locator('a[href*="/events/drama"]').first();
const html = await firstCard.innerHTML();

// Extract img src
const srcMatch = html.match(/src="([^"]+)"/);
console.log('IMG_SRC_IN_DOM:', srcMatch ? srcMatch[1] : 'NO SRC');

// Check for data attributes or other indicators
const href = await firstCard.getAttribute('href');
console.log('CARD_HREF:', href);

await b.close();
