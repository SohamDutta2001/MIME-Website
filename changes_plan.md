# Art-Teas-Tree Café — Project Anchor Summary

> This document is a complete end-to-end briefing on the project. Share it as-is with any AI assistant to give full context.

---

## What the Project Is

**Art-Teas-Tree Café** is the official website for a real café located at CK-7, CK Block, Sector II, Salt Lake City, Bidhannagar, Kolkata — West Bengal 700091. The café is affiliated with the **Mime Institute of Calcutta**, a theatre institution, and is conceptually positioned as a reimagining of the traditional Bengali "cha er dokan" (roadside tea stall) as an artistic social space — a place for tea, books, performances, and the slow art of adda (Bengali: আড্ডা — the culture of unhurried conversation).

**Tagline:** "Where conversations steep slowly."  
**Accent line:** "Adda. Art. Tea."  
**Core philosophy:** Human connection over digital isolation.

---

## Technical Stack

| Layer | Technology |
|-------|-----------|
| Framework | **Astro** (static site generation, islands architecture) |
| UI / Interactivity | **React** islands inside Astro (via `client:load`) |
| Animation | **Framer Motion** (scroll-driven, entrance reveals, carousel) |
| Styling | **Tailwind CSS** (custom config: tea palette, editorial fonts) |
| Fonts | Cormorant Garamond (serif), Lora (body), Caveat (handwriting), Hind Siliguri (Bengali) |
| Image CDN | **Cloudinary** (via `cldImg()` helper; falls back to `/public/cafe-assets/` locally) |
| Data (menu) | **Google Sheets → CSV → JSON** via `scripts/sync-menu.mjs` at build time |
| Data (events) | **Google Sheets → JSON** via `src/lib/events/events.ts` at build time |
| Deployment | **GitHub Pages** (current); moving to **Cloudflare Pages** (planned) |
| CI / rebuild | GitHub Actions: daily 7:00 AM IST + on-demand via `repository_dispatch` triggered by a Google Apps Script on sheet save |
| Base path | `/MIME-Website` on GitHub Pages; bare `/` on custom domain |

---

## Site Architecture

The site has two rendering contexts:

### 1. Homepage (`/`) — Full React island
The entire homepage is a single large React island `CafeApp.jsx` (`src/components/islands/CafeApp.jsx`). This is the primary experience. It contains the following sections in order:

| Section | ID | Description |
|---------|-----|-------------|
| **Nav** | — | Fixed header, dark-to-light on scroll, hash links |
| **Hero** | `#home` | Full-screen cinematic carousel (4 café photos), Ken Burns zoom, animated film-title entrance, parallax, two CTAs |
| **Ticker** | — | Scrolling marquee strip between hero and events |
| **Events Carousel** | `#events` | Upcoming events as playbill-style cards on a cork board, Embla carousel, auto-scrolls every 3s |
| **Philosophy** | `#philosophy` | Large drop-cap manifesto quote + body paragraphs about the café's founding spirit |
| **Reel** | `#reel` | Contact-sheet / film-strip gallery of café photos with cinematic metadata overlays |
| **Menu** | `#menu` | Dark wicker background with a cream paper menu card pinned by washi tape; category filter chips; animated item list |
| **Books** | `#books` | College Street bookshelf visual + exterior café photo |
| **Footer** | — | Address, hours, contact, socials |

### 2. Sub-pages — Astro + lightweight islands
- `/events/` — Events board listing (upcoming + past), Astro page
- `/events/[slug]/` — Individual event detail page, Astro page
- `/menu/` — Full standalone menu page, Astro page with `MenuFilter.tsx` island

---

## Design Theme & Aesthetic Philosophy

This is the most important thing to understand about the project. **Every design decision is filtered through a single cohesive metaphor: a handmade, cinematic, Bengali cultural artifact.**

### The Visual Language

**1. Physical materials as metaphors**
- The site feels like a collection of physical objects: paper menus pinned to wicker boards with washi tape, coffee ring stains, coaster stamps, hand-corrected pencil marks, worn film reels, torn paper edges.
- CSS/SVG components: `WashiTape`, `CoffeeRing`, `CoasterStamp`, `TornEdge`, `PencilUnderline`, `InkCorrection`, `BharCup` — all in `src/components/islands/Scraps.jsx`

**2. Cinematic / film aesthetic**
- The hero section reads like a film title card — letters animate up out of a clipped line, one character at a time
- A hair-thin "scroll progress" bar at the top mimics a film reel advancing through a projector
- A film grain overlay (`position: fixed`, animated SVG) runs on desktop
- The photo gallery section uses film-strip / contact-sheet metaphors with timecodes, lens data, and film notes

**3. Bengali cultural roots**
- Bengali script (Hind Siliguri font) appears throughout — section headings, category labels, decorative text
- Concepts like "adda" (আড্ডা), "cha" (চা), "bhar" (ভাঁড় — the clay cup) are woven into copy and UI
- The clay bhar cup is an SVG illustration used as a section anchor
- Event categories use Bengali names; menu category headers show Bengali translations

**4. Handmade / artisanal typography**
- Cormorant Garamond for display headings (classical, literary)
- Caveat for handwriting annotations (margin notes, kickers)
- Courier New / monospace for typewriter-stamped labels (item IDs, lens metadata, tracking info)
- Mix of sizes creates a layered, typeset-page feeling — not digital minimalism

**5. Colour palette**
All colours are custom Tailwind tokens under the `tea-` namespace:
- `cream` / `#F5EDD6` — paper background
- `tea-900` / `#1C1410` — near-black ink
- `tea-700` / `#3B2418` — dark brown
- `tea-500` / `#7A4A2A` — mid brown
- `tea-300` / `#C9A87A` — golden caramel
- `maroon` / `#6B2D2D` — deep red (Bengali cultural accent)
- `#5A6B3E` — sage green (handwriting annotations)
- `#2A1812` — very dark brown (wicker board / dark section backgrounds)

**6. Motion philosophy**
- Animations are "ink drying on paper" — slow, deliberate, ease-in-out (custom `ease-ink` cubic bezier)
- `useCalmMotion()` hook disables ALL continuous animations on mobile and under `prefers-reduced-motion`
- Scroll-reveal: elements slide up 26px and fade in as they enter the viewport
- No frivolous motion; every animation has a physical-world analogy

---

## Data Architecture

### Menu
- **Source**: Google Sheet (tab: "Menu"), columns: `id`, `category`, `itemName`, `price`, `description`
- **Sync**: `scripts/sync-menu.mjs` fetches the sheet as CSV at build time, writes to `src/data/mockMenuData.json`
- **Usage**: Imported directly in `CafeApp.jsx` and `src/pages/menu.astro` — no API calls at runtime
- **Categories**: Auto-derived from the data in sheet order; adding a new category in the sheet automatically creates a filter tab in the UI
- **Bengali labels**: `CATEGORY_BN` map in `CafeApp.jsx` provides Bengali translations; falls back to English

### Events
- **Source**: Google Sheet (tab: "Events"), columns: `slug`, `title`, `date`, `category`, `description`, `image`, `location`
- **Sync**: `src/lib/events/events.ts` reads from `src/data/eventsData.json` (synced at build time)
- **Usage**: `upcomingEvents` and `pastEvents` exported arrays; used in `EventsCarousel.jsx` (homepage) and `src/pages/events/`
- **Detail pages**: Generated statically via `src/pages/events/[slug].astro`

---

## Key Source Files

| File | Role |
|------|------|
| `src/components/islands/CafeApp.jsx` | The entire homepage (Nav, Hero, Events, Philosophy, Reel, Menu, Books, Footer) — ~1550 lines |
| `src/components/islands/Scraps.jsx` | Reusable decorative SVG components (WashiTape, CoasterStamp, CoffeeRing, etc.) |
| `src/components/islands/events/EventsCarousel.jsx` | Homepage events section (Embla carousel, auto-scroll) |
| `src/components/Nav.astro` | Navigation for sub-pages (events, menu pages) |
| `src/components/Layout.astro` | Page shell for sub-pages |
| `src/components/events/BaseEventLayout.astro` | Individual event detail page layout |
| `src/styles/global.css` | Global CSS: fonts, paper texture, drop-cap, ink-link, scroll-reveal, film grain |
| `src/data/site.ts` | Single source of truth for site name, tagline, address, hours, contact |
| `src/data/mockMenuData.json` | Build-time synced menu data |
| `scripts/sync-menu.mjs` | Google Sheets → JSON sync script |
| `astro.config.mjs` | Astro config; base path `/MIME-Website` for GitHub Pages, bare `/` for custom domain |
| `public/images/mime_logo.webp` | Circular logo placeholder (shown in nav top-left); swap file to update logo |

---

## Work Done on This Project (Session Log)

The following changes were made in the most recent development session:

### Content / Copy
- **Events board rename**: "notice board" → "events board" in all occurrences (`pages/events/index.astro`, `BaseEventLayout.astro`, `EventsCarousel.jsx`)

### Events Carousel
- **Auto-scroll**: Added 3-second auto-advance to the Embla carousel in `EventsCarousel.jsx` (loops back to start when it reaches the end)

### Menu (CafeApp.jsx)
- **Category wrap**: Fixed horizontal scroll on the category filter bar — switched from `overflow-x-auto` (horizontal scroll) to `flex-wrap` so categories wrap to a new line on small screens
- **CoasterStamp curved text**: Added `curvedLabel` prop to `CoasterStamp` in `Scraps.jsx`; passes `"Art-Teas-Tree · Cafe"` as text that arcs around the outer ring of the decorative coaster stamp in the menu section (visible on `lg` screens)

### Navigation / Branding
- **Circular logo in nav**: Added `mime_logo.webp` (40×40, `rounded-full`) to both navs:
  - `CafeApp.jsx` homepage nav (the primary nav, found inside the React island)
  - `Nav.astro` sub-page nav
  - File lives at `public/images/mime_logo.webp`; replace the file to update the logo without code changes

### Git
- Merged `main` branch into `tatha` branch (fast-forward, no conflicts; main had 2 new commits: CI auto-rebuild trigger and removal of unfinished event-parser WIP)

---

## Pending / Planned Work

---

### 1. Scroll Performance (Choppy Scrolling)

#### Root Causes

**A. `background-attachment: fixed` — primary culprit**
- File: `src/styles/global.css`, line 33
- The `<html>` element has three simultaneous fixed backgrounds: a paper texture SVG, and two radial gradients.
- `background-attachment: fixed` tells the browser to repaint the entire page background on every single scroll frame — it cannot be GPU-composited. This is the most well-known cause of scroll jank in browsers.
- It is already disabled on mobile via a media query at line 213 (`background-attachment: scroll` for `max-width: 768px`), but desktop still suffers.

**B. Film grain overlay — secondary culprit**
- File: `src/styles/global.css`, lines 167–180
- A full-screen `position: fixed` `<div>` (200%×200%) runs an infinite CSS keyframe animation (`filmGrain`) at 10 steps / 10 seconds.
- It has `will-change: transform` which promotes it to its own GPU layer, but the continuous animation still creates compositor pressure.
- Already hidden on mobile and under `prefers-reduced-motion`.

**C. Framer Motion scroll listeners — minor**
- `useScroll()` is used in two places: the scroll progress bar and the hero parallax.
- Framer Motion handles these via RAF (requestAnimationFrame), so they are well-optimised, but they do add to the total work per frame.

**Note:** Moving to Cloudflare will not fix scroll jank — it is a browser rendering issue, not a network issue. Cloudflare will improve initial load time only.

#### Solutions

**Solution A (recommended — highest impact, one line)**
In `src/styles/global.css`, change:
```css
/* line 33 — change this */
background-attachment: fixed, fixed, fixed;
/* to this */
background-attachment: scroll, scroll, scroll;
```
Then delete the mobile media-query override (lines 212–213) since it's no longer needed.
- The paper texture and gradient will now scroll with the page rather than staying fixed.
- Visually almost identical in practice — the texture is subtle and the gradient covers the full page height.
- Eliminates the repaint entirely.

**Solution B — Slow the film grain**
In `src/styles/global.css`, change the `.film-grain` animation:
```css
/* from */
animation: filmGrain 10s steps(10) infinite;
/* to */
animation: filmGrain 20s steps(6) infinite;
```
- Halves the frame rate of the animation and doubles the cycle time.
- Barely perceptible visually but meaningfully reduces compositor work.

**Solution C (optional, for later)**
Add `contain: layout paint` to the `<section>` wrapper of each homepage section in `CafeApp.jsx`. This tells the browser that repaints inside one section cannot affect other sections, reducing the repaint area when something changes.

**Recommended order of implementation:** A first (biggest gain, zero visual change), then B, then measure before doing C.

---

### 2. Events Link Inside the Menu

#### Context
The menu section (`id="menu"`) is styled as a physical paper menu card pinned to a dark wicker board. It has no link to the events section. The events section sits above the menu in the page scroll order.

The menu card ends with a small margin note (line ~1336 in `CafeApp.jsx`):
```jsx
<p className="mt-10 font-typewriter text-[9px] uppercase tracking-[0.4em] text-[#5E3820]/50">
  আজকের বিশেষ ✦ ask us what's fresh today
</p>
```

#### Solution (recommended — "pinned handwritten note")
Add a second line after the existing margin note, styled as a handwritten annotation pointing to the events section:

```jsx
<p className="mt-4 font-hand text-base text-[#5A6B3E]/70">
  catching a show this week?{' '}
  <a href="#events" className="underline decoration-dotted underline-offset-2 hover:text-[#5A6B3E]">
    see what's on →
  </a>
</p>
```

- `font-hand` (Caveat) matches the handwriting style used for kickers and annotations throughout the site
- `text-[#5A6B3E]` is the sage green used for all handwriting annotations — consistent with the existing design language
- Dotted underline feels hand-drawn rather than digital
- Sits at the very bottom of the cream paper card, below all menu items — feels like a note scrawled at the bottom of a real café menu
- File to edit: `src/components/islands/CafeApp.jsx`, inside the `Menu` function, after the menu list and before the closing of the paper card `<div>`

No new components needed — reuses existing font and colour tokens.

---

### 3. Café Name in the Menu

#### Context
Currently "Art-Teas-Tree · Cafe" only appears on the decorative `CoasterStamp` component at the top-left corner of the menu card — and only on `lg` screens (`hidden lg:block`). On mobile the café name is invisible inside the menu section.

The menu card header currently reads (top to bottom):
```
চা ও টা          ← Bengali, maroon, font-bn text-2xl
Cha, Ta, and Menu ← kicker, font-hand, sage green
What's steeping today  ← h2, font-serif text-5xl/6xl
```

#### Solution (recommended — typewriter colophon line)
Insert a single line between "চা ও টা" and the kicker:

```jsx
<p className="mt-1 font-typewriter text-[9px] uppercase tracking-[0.45em] text-[#5E3820]/40">
  Art-Teas-Tree · Café
</p>
```

- `font-typewriter` (Courier New) + `uppercase` + wide `tracking` matches the "stamp" aesthetic used throughout — identical to the margin note style at the bottom of the menu
- Opacity `0.40` makes it feel like a printer's colophon or a light watermark — present but not competing with the heading
- Visible on all screen sizes, unlike the CoasterStamp
- File to edit: `src/components/islands/CafeApp.jsx`, inside the `Menu` function, inside `<div className="mb-10">` (the section heading block, around line 1188)

---

### 4. Item Sizes (S / M / L) in Google Sheets + App

#### Context
The current menu schema has a single `price` field (one number per item). Some items come in multiple sizes (e.g., small / medium / large) at different price points. There is no way to represent this today.

The data pipeline is: Google Sheet → `scripts/sync-menu.mjs` (CSV parser) → `src/data/mockMenuData.json` → imported statically into `CafeApp.jsx` and `src/pages/menu.astro`.

#### Schema Change (Google Sheet)

Add one new column named **`sizes`** to the Menu tab.

| Column | Format | Example |
|--------|--------|---------|
| `sizes` | `Label:Price` pairs separated by `\|` | `S:40\|M:55\|L:70` |

Rules:
- If `sizes` is filled, it overrides the `price` column for that item — the `price` cell can be left blank or used as a fallback
- If `sizes` is empty, the existing `price` field is used as-is — **fully backward compatible**
- Any number of sizes (not limited to three); any label text works (`Half:30|Full:55`, `Regular:60|Large:80`, etc.)

#### Sync Script Change (`scripts/sync-menu.mjs`)

After the existing field parsing, add:
```js
const rawSizes = row.sizes?.trim();
const sizes = rawSizes
  ? rawSizes.split('|').map(s => {
      const [label, price] = s.split(':');
      return { label: label.trim(), price: Number(price.trim()) };
    })
  : null;
```

Output JSON shape per item:
```json
// Single-price item (unchanged):
{ "id": 1, "category": "Tea", "itemName": "Bharer Cha", "price": 25, "description": "...", "sizes": null }

// Multi-size item:
{ "id": 2, "category": "Tea", "itemName": "Special Cha", "price": null, "description": "...",
  "sizes": [{"label":"S","price":40},{"label":"M","price":55},{"label":"L","price":70}] }
```

#### Rendering Change (`src/components/islands/CafeApp.jsx`)

In the menu item render (inside the `Menu` function), replace the plain `₹{item.price}` display:

```jsx
{/* Replace the existing price display with: */}
{item.sizes ? (
  <span className="flex flex-wrap gap-x-3 font-typewriter text-[9px] uppercase tracking-[0.2em] text-[#5E3820]/70">
    {item.sizes.map(({ label, price }) => (
      <span key={label}>{label} ₹{price}</span>
    ))}
  </span>
) : (
  <span className="font-typewriter text-xs text-[#5E3820]/70">₹{item.price}</span>
)}
```

- `font-typewriter` + `uppercase` + wide tracking matches the stamp/label aesthetic of the rest of the menu
- Size labels and prices sit in a small horizontal row beneath the item name
- Wraps gracefully if there are many sizes

Also apply the same change to `src/components/MenuCard.astro` (the standalone `/menu` page card component) so both views are consistent.

#### Docs Update
Add the `sizes` column to the owner's guide in `docs/sheets-template.md` with a worked example so the café owner knows how to use it.

#### Files to Change Summary

| File | Change |
|------|--------|
| `src/styles/global.css` | Remove `background-attachment: fixed`; slow film grain |
| `src/components/islands/CafeApp.jsx` | Events link (bottom of menu card); café name watermark (menu header); sizes rendering (item display) |
| `scripts/sync-menu.mjs` | Parse `sizes` column from CSV |
| `src/data/mockMenuData.json` | Automatically updated by sync script |
| `src/components/MenuCard.astro` | Sizes rendering on `/menu` page |
| `docs/sheets-template.md` | Document new `sizes` column for owner |