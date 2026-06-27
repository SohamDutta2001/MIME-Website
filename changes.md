# Art-Teas-Tree Café — Project Anchor Summary

> This document is a complete end-to-end engineering briefing on the project. Share it as-is with any AI assistant to give full context and define implementation tasks.

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

Every design decision is filtered through a single cohesive metaphor: **a handmade, cinematic, Bengali cultural artifact.**

### The Visual Language

**1. Physical materials as metaphors**
- The site feels like a collection of physical objects: paper menus pinned to wicker boards with washi tape, coffee ring stains, coaster stamps, hand-corrected pencil marks, worn film reels, torn paper edges.
- CSS/SVG components: `WashiTape`, `CoffeeRing`, `CoasterStamp`, `TornEdge`, `PencilUnderline`, `InkCorrection`, `BharCup` — all in `src/components/islands/Scraps.jsx`

**2. Cinematic / film aesthetic**
- The hero section reads like a film title card — letters animate up out of a clipped line, one character at a time.
- A hair-thin "scroll progress" bar at the top mimics a film reel advancing through a projector.
- A film grain overlay (`position: fixed`, animated SVG) runs on desktop.
- The photo gallery section uses film-strip / contact-sheet metaphors with timecodes, lens data, and film notes.

**3. Bengali cultural roots**
- Bengali script (Hind Siliguri font) appears throughout — section headings, category labels, decorative text.
- Concepts like "adda" (আড্ডা), "cha" (চা), "bhar" (ভাঁড় — the clay cup) are woven into copy and UI.
- The clay bhar cup is an SVG illustration used as a section anchor.
- Event categories use Bengali names; menu category headers show Bengali translations.

**4. Handmade / artisanal typography**
- Cormorant Garamond for display headings (classical, literary).
- Caveat for handwriting annotations (margin notes, kickers).
- Courier New / monospace for typewriter-stamped labels (item IDs, lens metadata, tracking info).
- Mix of sizes creates a layered, typeset-page feeling — not digital minimalism.

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
- Animations are "ink drying on paper" — slow, deliberate, ease-in-out (custom `ease-ink` cubic bezier).
- `useCalmMotion()` hook disables ALL continuous animations on mobile and under `prefers-reduced-motion`.
- Scroll-reveal: elements slide up 26px and fade in as they enter the viewport.
- No frivolous motion; every animation has a physical-world analogy.

---

## Data Architecture

### Menu
- **Source**: Google Sheet (tab: "Menu"), columns: `id`, `category`, `itemName`, `price`, `description`
- **Sync**: `scripts/sync-menu.mjs` fetches the sheet as CSV at build time, writes to `src/data/mockMenuData.json`
- **Usage**: Imported directly in `CafeApp.jsx` and `src/pages/menu.astro` — no API calls at runtime.

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
| `public/images/mime_logo.webp` | Circular logo placeholder (shown in nav top-left) |

---

## Work Done on This Project (Session Log)

- **Events board rename**: "notice board" → "events board" across all template pages and islands.
- **Auto-scroll**: Implemented 3-second auto-advance loop on the Embla engine in `EventsCarousel.jsx`.
- **Menu Category wrap**: Updated layout classes from `overflow-x-auto` to `flex-wrap` in `CafeApp.jsx`.
- **CoasterStamp curved text**: Added `curvedLabel` engine to `Scraps.jsx` passing text arcs around the outer ring.
- **Circular logo in nav**: Integrated `mime_logo.webp` across both React and Astro navigation headers.

---

## Technical Specifications for Pending Work

Implement the following targeted features, fixes, and structural changes. Maintain strict adherence to the visual language, technical stack limits, and stability constraints detailed below.

### 1. Scroll Performance Optimization (Fixing Android & Desktop Lag)

**Context:** The site experiences heavy scroll jank and stuttering on desktop browsers and Android/Chromium mobile phones. The root cause is `background-attachment: fixed` on line 33 of `src/styles/global.css` forcing full-screen repaints on every scroll frame, alongside high compositor overhead from the full-screen animated film grain.

#### Action Plan
1. **GPU-Accelerated Background Layer:** Remove all `background-attachment: fixed` definitions from `html` or `body` inside `src/styles/global.css`. Instead, isolate the multi-layered background to a hardware-accelerated fixed pseudo-element on the body to keep the parallax depth smooth without repaints.
2. **Slowing & Disabling Film Grain:** Scale down the film grain animation speed for desktops, and strictly hide it via layout flags on mobile screens to free up GPU cycles on lower-end devices.
3. **Viewport Inspection:** Ensure `src/layouts/Layout.astro` contains the correct hardware viewport tags.

#### Implementation Target Details

Modify `src/styles/global.css`:
```css
/* Replace old html/body background-attachment setup with this GPU-friendly compositor layer */
body {
  position: relative;
}

body::before {
  content: "";
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: -1;
  background-image: var(--paper-texture), var(--gradient-1), var(--gradient-2); /* Reference your existing background tokens here */
  background-size: cover;
  background-repeat: no-repeat;
  will-change: transform; /* Mandates an isolated GPU compositor layer */
}

/* Tweak the film grain duration for better desktop performance */
.film-grain {
  animation: filmGrain 20s steps(6) infinite;
}

/* Explicitly terminate the film grain layer processing on mobile viewports */
@media (max-width: 768px) {
  .film-grain {
    display: none !important;
    animation: none !important;
  }
}

### 2. Task: Add "Events" Cross-Link Inside the Menu

## Context & Design Rules
We need to add a link to the `#events` section inside the Menu section (`id="menu"`). 
* **Design Metaphor:** It must look like a handwritten margin note ("pinned" to the menu) rather than a digital button. 
* **Placement:** It must go at the **top** of the menu card so users see it immediately before scrolling through the long menu list.
* **UX Requirement:** Because we have a fixed navigation bar, clicking the anchor link must smoothly scroll to the section *without* the fixed header covering the section title.

Please implement the following two steps exactly as specified.

---

### Step 1: Fix Anchor Scroll Behavior
**File:** `src/styles/global.css`

Add the following rules to the `html` selector. (If `html` already exists, just add these properties to it).

```css
html {
  scroll-behavior: smooth;
  /* This prevents the fixed nav from covering the section header when clicking an anchor link. */
  /* Note: Adjust the '5rem' value if the actual fixed nav height is different. */
  scroll-padding-top: 5rem; 
}

# Task: Add "Letterhead" Café Branding to Menu Card

## Context & Design Rules
Currently, the café name ("Art-Teas-Tree · Cafe") only appears inside a decorative `CoasterStamp` component which is hidden on mobile screens (`hidden lg:block`). We need the café name visible on all devices. 

Instead of injecting the name into the already heavy typographic title cluster (Bengali text -> Kicker -> H2), we want to treat the cream paper menu card like **pre-printed physical stationery**. We will add a typewriter-style watermark pinned to the absolute top-center of the paper.

Please implement the following step exactly as specified.

---

### 3. Café Name in the Menu

### Step 1: Inject the Absolute-Positioned Letterhead
**File:** `src/components/islands/CafeApp.jsx`

1. Locate the `Menu` function/component.
2. Find the main layout container that acts as the "cream paper card" (the div with the cream background that holds the menu categories and items). 
3. Ensure this parent container has the `relative` positioning class (add it if missing).
4. Inject the following JSX as the **very first child** inside that cream paper container:

```jsx
{/* Absolute top alignment mimics an official physical letterhead watermark layout */}
<div className="absolute top-6 left-1/2 -translate-x-1/2 pointer-events-none select-none w-full text-center">
  <p className="font-typewriter text-[9px] uppercase tracking-[0.45em] text-[#5E3820]/40 whitespace-nowrap">
    Art-Teas-Tree · Café
  </p>
</div>

# Task: Implement Multi-Size Menu Pricing (S / M / L)

## Context
We need to support multiple prices per item (e.g., Small: ₹40, Large: ₹70). The data pipeline is Google Sheets -> CSV parser (`sync-menu.mjs`) -> JSON -> UI. This must be 100% backward compatible with items that only have a single price.

Please implement the following three steps exactly as specified.

---

### 4. Multi-Size Menu

### Step 1: Update the Parser Script
**File:** `scripts/sync-menu.mjs`

Replace the naive CSV parsing logic for sizes with this defensive, robust version. It handles data-entry errors gracefully (like users typing dashes instead of colons, or accidentally typing letters instead of numbers).

```javascript
const rawSizes = row.sizes?.trim();
let processedSizes = null;

if (rawSizes) {
  try {
    processedSizes = rawSizes.split('|').map(sizeToken => {
      // Intentionally capture variants using both colons and dashes
      const tokenDelimiter = sizeToken.includes(':') ? ':' : '-';
      const segments = sizeToken.split(tokenDelimiter);
      
      if (segments.length !== 2) {
        throw new Error(`Formatting mismatch: "${sizeToken}"`);
      }
      
      const parsedLabel = segments[0].trim();
      const calculatedPrice = Number(segments[1].trim());
      
      if (isNaN(calculatedPrice)) {
        throw new Error(`Price is not a number: "${segments[1]}"`);
      }
      
      return { label: parsedLabel, price: calculatedPrice };
    });
  } catch (parsingException) {
    console.warn(`[Pipeline Warning] Bypassing multi-size for item ${row.id}: ${parsingException.message}`);
    processedSizes = null; // Revert cleanly to standard single-price fallback
  }
}

// Ensure processedSizes is injected into the final item JSON output

# Update: Expand Size Abbreviations in the Data Parser

## Context
The Google Sheet contains abbreviated size labels (e.g., "Reg" and "Lrg") to keep data entry clean. However, the UI must display these fully spelled out (e.g., "Regular" and "Large"). 

Please update the `sync-menu.mjs` script to intercept and expand these specific abbreviations during the build process so the frontend receives the full words.

---

### Implementation Task
**File:** `scripts/sync-menu.mjs`

Update the size parsing logic to include a regex replacement step on the `parsedLabel` before it is saved to the JSON object.

```javascript
const rawSizes = row.sizes?.trim();
let processedSizes = null;

if (rawSizes) {
  try {
    processedSizes = rawSizes.split('|').map(sizeToken => {
      const tokenDelimiter = sizeToken.includes(':') ? ':' : '-';
      const segments = sizeToken.split(tokenDelimiter);
      
      if (segments.length !== 2) {
        throw new Error(`Formatting mismatch: "${sizeToken}"`);
      }
      
      let parsedLabel = segments[0].trim();
      
      // Expand abbreviations for the frontend UI
      parsedLabel = parsedLabel
        .replace(/\bReg\b/ig, 'Regular')
        .replace(/\bLrg\b/ig, 'Large');
      
      const calculatedPrice = Number(segments[1].trim());
      
      if (isNaN(calculatedPrice)) {
        throw new Error(`Price is not a number: "${segments[1]}"`);
      }
      
      return { label: parsedLabel, price: calculatedPrice };
    });
  } catch (parsingException) {
    console.warn(`[Pipeline Warning] Bypassing multi-size for item ${row.id}: ${parsingException.message}`);
    processedSizes = null; 
  }
}

### Fixing sizing in menu

# Task: Move Sizes and Modifiers (Milk) to the Price Block (Out of Description)

## Context
The user wants to streamline the pricing UI. Instead of stacking every permutation (Black Reg, Black Lrg, Milk Reg, etc.), we want to display a base price, and show sizes or modifiers (like "Milk +10" or "Large +10") right next to the price on the right side of the menu layout. 

This must be completely separated from the item `description`. The description should only contain the poetic description of the item itself.

Please implement the following updates to the data parser and the UI.

---

### Step 1: Update the Data Parser to Support "Modifier" Syntax
**File:** `scripts/sync-menu.mjs`

We need the `sizes` (or modifiers) parser to cleanly accept string labels and relative prices (like `+10`). 

Update the parsing logic so it captures these modifiers exactly as typed in the sheet (e.g., `Milk: +10 | Large: +10`) and passes the raw string to the UI so we can display the `+` sign.

```javascript
const rawSizes = row.sizes?.trim();
let processedSizes = null;

if (rawSizes) {
  try {
    processedSizes = rawSizes.split('|').map(sizeToken => {
      const tokenDelimiter = sizeToken.includes(':') ? ':' : '-';
      const segments = sizeToken.split(tokenDelimiter);
      
      if (segments.length !== 2) throw new Error(`Formatting mismatch`);
      
      const parsedLabel = segments[0].trim();
      // Keep the price as a string to preserve "+" signs (e.g., "+10")
      const rawPriceStr = segments[1].trim(); 
      
      // Basic validation to ensure it's a number-like string (allows + or - prefixes)
      if (isNaN(Number(rawPriceStr))) {
        throw new Error(`Price modifier is invalid: "${rawPriceStr}"`);
      }
      
      return { label: parsedLabel, priceString: rawPriceStr };
    });
  } catch (parsingException) {
    console.warn(`[Pipeline Warning] Bypassing modifiers for item ${row.id}: ${parsingException.message}`);
    processedSizes = null; 
  }
}