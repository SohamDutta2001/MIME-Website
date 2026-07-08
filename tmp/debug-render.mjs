import { chromium } from 'playwright';
const b = await chromium.launch();
const p = await b.newPage();
await p.goto('http://localhost:4321/', { waitUntil: 'networkidle' });
await p.getByRole('button', { name: 'Café Events' }).click();
await p.waitForTimeout(1000);

// Get the carousel track div and look for all images
const trackImgs = await p.locator('div[class*="flex touch-pan-y"] img').count();
console.log('Images in carousel track:', trackImgs);

// Get alt texts to see if they're event-related
const alts = await p.locator('div[class*="flex touch-pan-y"] img').evaluateAll(els =>
  els.map(e => e.alt)
);
console.log('ALT_TEXTS:', JSON.stringify(alts.slice(0, 2)));

// Check if there are any <a> tags with /events/ hrefs 
const eventLinks = await p.locator('a[href*="/events/drama"], a[href*="/events/music"]').count();
console.log('Event card links found:', eventLinks);

await b.close();
