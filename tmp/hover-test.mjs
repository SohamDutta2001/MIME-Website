import { chromium } from 'playwright';
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1280, height: 900 } });
await p.goto('http://localhost:4321/', { waitUntil: 'networkidle' });
await p.getByRole('button', { name: 'Café Events' }).click();
await p.waitForTimeout(800);

// Get first card and hover
const card = p.locator('a[href*="/events/drama"]').first();
await card.hover();
await p.waitForTimeout(600);

// Check if sepia was removed on hover
const img = card.locator('img').first();
const transform = await img.evaluate(el => {
  const computed = window.getComputedStyle(el);
  return {
    filter: computed.filter,
    transform: computed.transform,
  };
});
console.log('HOVER_STATE:', JSON.stringify(transform));

// Take screenshot
await p.screenshot({ path: 'tmp/hover-state.png' });
await b.close();
