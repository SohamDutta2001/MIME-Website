# Plan: Integrating Web Gallery Photos into the Events Section

> **Status:** Ready for implementation. Reviewed and updated per ChatGPT feedback.  
> **Intended audience:** Engineering review / implementation guide.  
> **Scope:** Static photo galleries for three events sub-panels — no Sheet dependency, no event metadata involved.

---

## 1. Context & Motivation

The Art-Teas-Tree website's events section has four sub-panels — **Café Events**, **First Stage**, **The Third Space**, and **Our Roots** — but three of the four are currently photo-free. The stakeholder has provided a structured `Web gallery /` folder at the repo root with sub-folders that map directly to these sections:

| Folder | Section | Photos |
|---|---|---|
| `Web gallery /First stage /` | `FirstStage.jsx` | 9 images (children's theatre, stage, clay/body workshop) |
| `Web gallery /Workshop/` | `OurRoots.jsx` | 7 images (drawing, movement, group learning) |
| `Web gallery /Performance /` | `ThirdSpace.jsx` | 7 images (clown, mime, productions, outdoor festivals) |
| `Web gallery /Third space_/` | *(empty)* | — |
| `Web gallery /Our roots_/` | *(empty)* | — |
| `Web gallery /Cafe/` + `Top/` | Already used in Hero + Reel | — |

The goal: process these photos and weave them into the three currently photo-less sections in a way that is coherent with the existing retro-Kolkata cinematic aesthetic, matches each section's colour palette, and feels documentary rather than corporate.

---

## 2. Design Principles

> Concise constraints that govern every implementation decision. Non-negotiable.

- **Sepia at rest, colour on hover** — the definitive cinematic rule of this site. Every photo reveals full colour only when the user pauses on it. Match `EventCard.jsx` exactly for sepia values, scale, duration, and easing — do not invent independent values.
- **Use the curated selections from Section 3** — they have already been reviewed for visual consistency with the site. Do not substitute other photos from the source folders.
- **Handmade placement varies by section** — FirstStage: WashiTape and slight tilt (craft-board). ThirdSpace: still, structured strip (architectural). OurRoots: editorial grid with captions below (measured, institutional).
- **Typewriter captions, oblique voice** — `font-typewriter`, small, uppercase, widely tracked. Tone: "Hands in clay · art & craft session" not "Art & Craft Workshop Activity."
- **No new motion patterns** — reuse `fadeUp` and Framer Motion `whileInView`. The site already has consistent scroll-reveal; a new variant introduces incoherence.
- **Additions only** — new photo blocks are inserted as new `<motion.div>` elements. Existing copy, cards, tag clouds, accordions, and carousels are untouched.
- **Respect `prefers-reduced-motion`** — follow the exact pattern in `EventsCarousel.jsx` line ~124: check `window.matchMedia('(prefers-reduced-motion: reduce)').matches` before any auto-scroll or non-fade animation. CSS hover transitions are fine — they are user-initiated.
- **Hover is an enhancement, not a requirement** — on touch devices the gallery must look complete without hover. Sepia at rest + caption below is the baseline; hover colour-reveal is progressive enhancement.

---

## 3. Photo Inventory & Curation Rationale

### 3a. First Stage folder → `FirstStage.jsx`

| File | Subject | Suitability |
|---|---|---|
| `IMG-20240818-WA0058.jpg` | Two children on stage, blue theatrical lighting | ✅ Strong — theatrical, intimate |
| `IMG-20240818-WA0059.jpg` | Child with colourful face paint, stage | ✅ Strong — close-up character |
| `IMG-20240818-WA0061.jpg` | Large ensemble, coloured ribbons, stage lighting | ✅ Strong — use `position: centre` (subject fills frame) |
| `IMG-20260523-WA0045.jpg` | Outdoor yoga on grass, daylight | ⚠️ Skip — daylight flat, cold cast |
| `IMG-20260523-WA0056.jpg` | Indoor celebration, arms raised | ✅ Good — joyful, communal |
| `IMG-20260523-WA0072.jpg` | Children dancing, dark stage | ✅ Strong — movement, dark bg matches section |
| `IMG-20260523-WA0153.jpg` | Bird's-eye circle discussion | ✅ Strong — use `position: centre` (circular composition) |
| `IMG-20260524-WA0008.jpg` | Clay workshop, children's hands | ✅ Excellent — hands + craft = site soul |
| `IMG-20260531-WA0238.jpg` | Full stage production, professional lighting | ✅ Excellent — use `position: centre` (wide ensemble) |

**Recommended selection (6 of 9):** `WA0058`, `WA0059`, `WA0061`, `WA0072`, `WA0008`, `WA0238`  
**Alternates:** `WA0056`, `WA0153`

**Processing target:** `3:2` proportion (e.g. 800×533 px), `.webp` quality 84.  
**Crop position:** `attention` by default; `centre` for ensemble/wide shots (marked above). If `attention` systematically decapitates subjects for a given photo, fall back to `centre`.  
**Slug convention:** `mime-first-stage-{subject-descriptor}.webp` — exact filename is the implementer's call; the slug pattern is the constraint.

---

### 3b. Workshop folder → `OurRoots.jsx`

| File | Subject | Suitability |
|---|---|---|
| `IMG-20260515-WA0053.jpg` | Student drawing horse, instructor guiding | ✅ Excellent — hands + paper |
| `IMG-20260515-WA0082.jpg` | Movement/acrobatics, bright studio | ✅ Good — energetic; `position: attention` |
| `IMG-20260515-WA0101.jpg` | Floor discussion circle, facilitator in teal | ✅ Strong — communal; `position: centre` |
| `IMG20230614180251.jpg` | Group gathering, Bengali signage, instructor | ✅ Strong — cultural context; `position: centre` |
| `IMG20240223161935.jpg` | Group movement/acrobatics on floor | ✅ Good — collective energy; `position: centre` |
| `IMG20240223161935(1).jpg` | Duplicate | Skip |
| `IMG_3922.HEIC` | Unknown (HEIC format) | ⚠️ Attempt conversion; skip if sharp fails |

**Recommended selection (5 of 7):** `WA0053`, `WA0101`, `IMG20230614`, `IMG20240223`, `WA0082`

**Processing target:** `4:3` proportion (e.g. 800×600 px), `.webp` quality 84. Slightly taller — feels like documentary print photography.  
**Crop position:** per notes above.  
**Slug convention:** `mime-workshop-{subject-descriptor}.webp`

---

### 3c. Performance folder → `ThirdSpace.jsx`

| File | Subject | Suitability |
|---|---|---|
| `Cl06.jpg` | Outdoor festival, traditional costumes, acrobatics | ✅ Strong — cultural, vibrant |
| `DSC03177.JPG` | Two performers in costume, dark bg, close-up | ✅ Excellent — cinematic, dark matches section |
| `DSC08134 - Copy.JPG` | Full ensemble, warm orange/red stage lighting | ✅ Excellent — theatrical warmth; `position: centre` |
| `FB_IMG_1679716648071.jpg` | Aerial performance, purple/blue lighting | ✅ Strong — dramatic choreography; `position: attention` |
| `IMG20251203105405.jpg` | Clown performers, white background | ⚠️ Skip — white bg clashes with dark ThirdSpace palette |
| `IMG_6390.JPG` | Outdoor festival, patchwork costumes, VW Beetle | ✅ Strong — colour, community energy; `position: attention` |
| `IMG_6390(1).JPG` | Duplicate | Skip |

**Recommended selection (5 of 7):** `DSC03177`, `DSC08134`, `FB_IMG_1679716648071`, `Cl06`, `IMG_6390`

**Processing target:** `16:9` proportion (e.g. 1200×675 px), `.webp` quality 84. Cinematic wide-strip format.  
**Crop position:** per notes above.  
**Slug convention:** `mime-performance-{subject-descriptor}.webp`

---

## 4. Data Layer — `src/data/gallery.ts`

Rather than scattering filename strings and caption copy directly into JSX, centralize gallery metadata in a typed file. This separates copy from layout and keeps JSX clean.

```ts
// src/data/gallery.ts

// Intentionally minimal. Add fields as needed (e.g. featured, orientation)
// without breaking existing consumers — all fields beyond src/alt are optional.
export type GalleryPhoto = {
  src: string;      // filename in public/cafe-assets/
  alt: string;      // descriptive alt text (required — see §7 Accessibility)
  caption?: string; // short display caption — example copy, not immutable
};

export const firstStagePhotos: GalleryPhoto[] = [
  {
    src: 'mime-first-stage-stage-moment.webp',
    alt: 'Two children performing on a theatre stage under blue dramatic lighting',
    caption: 'On stage · First Bell',
  },
  {
    src: 'mime-first-stage-face-paint.webp',
    alt: 'A child with colourful face paint in character before a performance',
    caption: 'Before the curtain · character in the making',
  },
  {
    src: 'mime-first-stage-ribbons.webp',
    alt: 'A large ensemble of children performing with coloured ribbons under stage lighting',
    caption: 'Colour and choreography',
  },
  {
    src: 'mime-first-stage-dark-dance.webp',
    alt: 'Children dancing on a dark stage during a movement workshop',
    caption: 'Movement workshop · Saturdays',
  },
  {
    src: 'mime-first-stage-clay-hands.webp',
    alt: "Children's hands working with clay in an art and craft session",
    caption: 'Hands in clay · art & craft session',
  },
  {
    src: 'mime-first-stage-full-production.webp',
    alt: 'A full stage production with professional lighting at the annual Durga Puja showcase',
    caption: 'Annual showcase · Durga Puja',
  },
];

export const workshopPhotos: GalleryPhoto[] = [
  {
    src: 'mime-workshop-drawing-guidance.webp',
    alt: 'An instructor guiding a student drawing a horse on paper',
    caption: 'Drawing · with guidance',
  },
  {
    src: 'mime-workshop-circle-discussion.webp',
    alt: 'Participants sitting in a circle on the floor with a facilitator',
    caption: 'Learning in circle',
  },
  {
    src: 'mime-workshop-community-gathering.webp',
    alt: 'A community workshop group with Bengali signage visible behind the instructor',
    caption: 'Community workshop',
  },
  {
    src: 'mime-workshop-group-movement.webp',
    alt: 'A group of participants practising acrobatic movement together on the floor',
    caption: 'Body movement · ensemble',
  },
  {
    src: 'mime-workshop-acrobatics.webp',
    alt: 'Physical theatre training — participants in movement and acrobatic exercise',
    caption: 'Physical theatre training',
  },
];

export const performancePhotos: GalleryPhoto[] = [
  {
    src: 'mime-performance-duo-costume.webp',
    alt: 'Two MIME performers in elaborate costumes against a dark background',
    caption: 'The space in use',
  },
  {
    src: 'mime-performance-ensemble-stage.webp',
    alt: 'A full ensemble on stage under warm orange and red theatrical lighting',
    caption: 'Ensemble · full stage',
  },
  {
    src: 'mime-performance-aerial-blue.webp',
    alt: 'An aerial performer under dramatic purple and blue stage lighting',
    caption: 'Aerial · dramatic light',
  },
  {
    src: 'mime-performance-outdoor-festival.webp',
    alt: 'Performers in traditional costumes doing acrobatics at an outdoor festival',
    caption: 'Outdoor festival · in the city',
  },
  {
    src: 'mime-performance-vw-festival.webp',
    alt: 'Performers in patchwork costumes at an outdoor festival, a VW Beetle visible behind',
    caption: 'The city as stage',
  },
];
```

> **Captions are example copy, not immutable.** The stakeholder or copywriter should review and adjust them. Alt text must remain descriptive and accurate.

---

## 5. Asset Processing Pipeline (Phase 0 — Decoupled from UI)

> This phase is independent. UI implementation (Phases 1–3 below) can proceed before or after processing by pointing at source files or placeholder images. The asset pipeline does not block code review or UI work.

Note: This script is a developer utility — run once (or as needed) to populate `public/cafe-assets/`. It is not part of the Astro build pipeline and should not be invoked by CI.

Create `scripts/process-event-photos.mjs`:

```js
import sharp from 'sharp';
import path from 'path';
import fs from 'fs';

const SRC_BASE = 'Web gallery /';
const OUT_DIR = 'public/cafe-assets/';

const jobs = [
  // FIRST STAGE — 3:2, 800×533
  { in: 'First stage /IMG-20240818-WA0058.jpg', out: 'mime-first-stage-stage-moment.webp',    w: 800, h: 533, pos: 'attention' },
  { in: 'First stage /IMG-20240818-WA0059.jpg', out: 'mime-first-stage-face-paint.webp',      w: 800, h: 533, pos: 'attention' },
  { in: 'First stage /IMG-20240818-WA0061.jpg', out: 'mime-first-stage-ribbons.webp',          w: 800, h: 533, pos: 'centre'    },
  { in: 'First stage /IMG-20260523-WA0072.jpg', out: 'mime-first-stage-dark-dance.webp',       w: 800, h: 533, pos: 'attention' },
  { in: 'First stage /IMG-20260524-WA0008.jpg', out: 'mime-first-stage-clay-hands.webp',       w: 800, h: 533, pos: 'attention' },
  { in: 'First stage /IMG-20260531-WA0238.jpg', out: 'mime-first-stage-full-production.webp',  w: 800, h: 533, pos: 'centre'    },

  // WORKSHOP — 4:3, 800×600
  { in: 'Workshop/IMG-20260515-WA0053.jpg',  out: 'mime-workshop-drawing-guidance.webp',     w: 800, h: 600, pos: 'attention' },
  { in: 'Workshop/IMG-20260515-WA0101.jpg',  out: 'mime-workshop-circle-discussion.webp',    w: 800, h: 600, pos: 'centre'    },
  { in: 'Workshop/IMG20230614180251.jpg',    out: 'mime-workshop-community-gathering.webp',  w: 800, h: 600, pos: 'centre'    },
  { in: 'Workshop/IMG20240223161935.jpg',    out: 'mime-workshop-group-movement.webp',       w: 800, h: 600, pos: 'centre'    },
  { in: 'Workshop/IMG-20260515-WA0082.jpg',  out: 'mime-workshop-acrobatics.webp',           w: 800, h: 600, pos: 'attention' },

  // PERFORMANCE — 16:9, 1200×675
  { in: 'Performance /DSC03177.JPG',            out: 'mime-performance-duo-costume.webp',      w: 1200, h: 675, pos: 'attention' },
  { in: 'Performance /DSC08134 - Copy.JPG',     out: 'mime-performance-ensemble-stage.webp',   w: 1200, h: 675, pos: 'centre'    },
  { in: 'Performance /FB_IMG_1679716648071.jpg',out: 'mime-performance-aerial-blue.webp',      w: 1200, h: 675, pos: 'attention' },
  { in: 'Performance /Cl06.jpg',                out: 'mime-performance-outdoor-festival.webp', w: 1200, h: 675, pos: 'attention' },
  { in: 'Performance /IMG_6390.JPG',            out: 'mime-performance-vw-festival.webp',      w: 1200, h: 675, pos: 'attention' },
];

for (const job of jobs) {
  const inPath = path.join(SRC_BASE, job.in);
  const outPath = path.join(OUT_DIR, job.out);
  if (!fs.existsSync(inPath)) { console.warn(`SKIP (missing): ${inPath}`); continue; }
  await sharp(inPath)
    .rotate()                                              // auto-orient from EXIF (critical for WhatsApp images)
    .resize(job.w, job.h, { fit: 'cover', position: job.pos })
    .webp({ quality: 84 })
    .toFile(outPath);
  console.log(`OK  ${outPath}`);
}
```

**Notes on processing:**
- **`IMG_3922.HEIC`** — HEIC is supported by `sharp` on macOS via libheif/vips. If conversion throws, skip it — there are 5 adequate Workshop photos without it.
- **Preferred output dimensions** — the sizes in the jobs array are targets, not hard requirements. If a crop produces systematically poor results for a particular photo (subjects cut off, composition destroyed), adjust dimensions proportionally rather than forcing the target ratio.
- **Output filenames are conventions** (slug pattern: `mime-{section}-{subject}.webp`). The slug pattern is the constraint; the exact name is the implementer's call. `src/data/gallery.ts` is the source of truth for what the application renders — the processing script should generate files whose names match those entries, but is itself an implementation detail, not part of the rendering contract.

---

## 6. UI Implementation Per Section

### 6a. FirstStage.jsx — Pinned Photo Strip

**Where:** New `<motion.div>` block after the existing two-column grid (copy + details card), before the section's closing `</div>`.

**Layout:**
- Horizontal flex strip, `overflow-x-auto` on mobile, `flex gap-5 sm:gap-6`
- Set `touch-action: pan-x` on the scroll container to hand vertical page scroll back to the browser — this prevents nested scroll conflicts on iOS Safari
- Each card: `aspect-[3/2]`, `relative overflow-hidden`, `border border-[#C9A87A]/20`
- Alternating tilt: `rotate(-1.2deg)` / `rotate(0.8deg)` — same hand-arranged language as the existing details card (`style={{ transform: 'rotate(-0.6deg)' }}`)
- **`WashiTape`** — import from `src/components/islands/Scraps.jsx` (already exists; do not recreate). Pin to top-centre of each card. Alternate copper and moss-green tape.
- **Photo hover** — reuse the same utility classes and Tailwind transition patterns from `EventCard.jsx`. Do not copy values in isolation — if EventCard changes, these galleries should change with it automatically.
- Caption: `font-typewriter text-[9px] uppercase tracking-[0.3em] text-[#C9A87A]/55` below the card (not overlaid). Captions should fit on one line; two lines maximum — use `truncate` or `line-clamp-2` if necessary.
- Images: `loading="lazy" decoding="async"` with explicit `width` and `height` attributes

**Section label (above strip):**
```jsx
<p className="font-typewriter text-[9px] uppercase tracking-[0.4em] text-[#C9A87A]/45">
  from the studio · in pictures
</p>
```

---

### 6b. ThirdSpace.jsx — Performance Evidence Strip

**Where:** New `<motion.div>` block between the existing tag-cloud grid and the conditional `EventsCarousel`. If the carousel is absent (no upcoming events), the photo strip is the section's final element.

**Layout:**
- Horizontal photo strip, `3` cards visible on desktop, `1.2` on mobile (crop signals more to scroll)
- `overflow-x-auto` with `touch-action: pan-x` — no nested scroll conflicts with vertical page scroll
- Each card: `aspect-[16/9]`, no rotation — this section is architectural, not craft-board
- `border border-[#C9A87A]/25`, dark `bg-[#1C1208]` behind each frame as letterbox fallback
- **Photo hover** — reuse the same utility classes and Tailwind transition patterns from `EventCard.jsx`. Do not copy values in isolation — if EventCard changes, these galleries should change with it automatically.
- No `WashiTape` — ThirdSpace is institutional, not craft-board
- Ghosted text overlay at bottom of each photo: `font-typewriter text-[9px] text-[#C9A87A]/60` reading the caption from `gallery.ts`. Captions should fit on one line; two lines maximum — use `truncate` or `line-clamp-2` if necessary.
- Images: `loading="lazy" decoding="async"` with explicit `width` and `height`

**Section label (above strip):**
```jsx
<p className="font-typewriter text-[9px] uppercase tracking-[0.42em] text-[#F5F0E6]/35">
  performances · workshops · the space in use
</p>
```

---

### 6c. OurRoots.jsx — Workshop Grid

**Where:** New `<motion.div>` block between the existing two-column header and the programme accordion, at `mt-16` to match the accordion's own spacing.

**Layout:**
- `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5` — single column mobile, 2–3 column desktop
- Each cell: `aspect-[4/3]` aspect box, no border on the photo itself — a faint `bg-[#C9A87A]/8` behind the entire grid creates a collective mounting-board feel
- **Photo hover** — reuse the same utility classes and Tailwind transition patterns from `EventCard.jsx` (lighter sepia at rest — `sepia-[0.35]` — since OurRoots is on cream). Implement via className, not inline style, so Tailwind can purge correctly. Do not copy transition values in isolation — if EventCard changes, these galleries should change with it.
- Caption: `font-typewriter text-[8px] uppercase tracking-[0.3em] text-[#5E3820]/50` below each photo (not overlaid), consistent with the paper-white editorial feel. Captions should fit on one line; two lines maximum — use `truncate` or `line-clamp-2` if necessary.
- No `WashiTape` — OurRoots is measured and editorial
- Images: `loading="lazy" decoding="async"` with explicit `width` and `height`

**Section label (above grid):**
```jsx
<p className="font-typewriter text-[9px] uppercase tracking-[0.42em] text-[#5E3820]/45">
  the work · out in the world
</p>
```

---

## 7. Accessibility

Every new photo block must satisfy these requirements before shipping:

**Alt text**
- Every `<img>` gets the `alt` from `gallery.ts`. Alt text describes the actual photo content — not the caption, not the section title.
- WashiTape, decorative overlays, tilt wrappers: `aria-hidden="true"`.

**Keyboard access**
- Prefer native keyboard scrolling. Ensure the `overflow-x-auto` container can receive focus (`tabIndex={0}`). Add custom ArrowLeft/ArrowRight handling only if accessibility testing shows native scrolling is insufficient.
- Caption text and tape decorations must not receive focus (`tabIndex={-1}` or `aria-hidden`).

**Touch**
- `touch-action: pan-x` on every horizontal scroll container — prevents blocking vertical page scroll on touch.
- No interactive element inside a strip smaller than 44×44 px tap target.

**Reduced motion**
- CSS `transition-all` on hover is fine under reduced motion (it is user-initiated). Add `motion-reduce:transition-none` to any transition class on elements that animate on mount/scroll (not on hover).
- Any future auto-scroll in these strips must check `prefers-reduced-motion` before playing, exactly as `EventsCarousel.jsx` does.

---

## 8. Performance & Mobile

**Lazy loading**
- All new `<img>` elements: `loading="lazy" decoding="async" fetchpriority="low"`. Gallery images are well below the fold and should yield priority to above-fold content.
- Set explicit `width` and `height` attributes matching processed output dimensions so the browser reserves layout space before load.

**CLS prevention**
- Wrap every image in an aspect-ratio box (`aspect-[3/2]`, `aspect-[4/3]`, `aspect-[16/9]`). Never use `height: auto` on a container holding a lazy-loaded image.
- Horizontal strip containers must have a fixed or aspect-bounded height so they do not collapse before images load — `overflow-x-auto` on a flex container with fixed-aspect children achieves this automatically.

**Mobile scroll conflicts**
- `touch-action: pan-x` on horizontal strip containers (both FirstStage and ThirdSpace). Test on iOS Safari — a downward swipe on the strip must scroll the page, not get absorbed.
- Do not combine `overflow-x: scroll` and `overflow-y: scroll` on the same container; this creates scroll traps on some mobile browsers.

**File size**
- Confirm all processed `.webp` files are under 120 KB. If quality 84 produces a file above this, reduce to quality 78. `srcset` is out of scope for this phase.

---

## 9. File Changes

| File | Change |
|---|---|
| `scripts/process-event-photos.mjs` | **New** — sharp processing script (Phase 0, decoupled from UI) |
| `src/data/gallery.ts` | **New** — centralized gallery metadata (filenames, alt text, captions) |
| `public/cafe-assets/mime-first-stage-*.webp` | **New** — 6 processed First Stage photos |
| `public/cafe-assets/mime-performance-*.webp` | **New** — 5 processed Performance photos |
| `public/cafe-assets/mime-workshop-*.webp` | **New** — 5 processed Workshop photos |
| `src/components/islands/events/FirstStage.jsx` | Add pinned photo strip after existing 2-col grid |
| `src/components/islands/events/ThirdSpace.jsx` | Add performance photo strip between tag clouds and carousel |
| `src/components/islands/events/OurRoots.jsx` | Add workshop photo grid between header and accordion |

**No changes to:**
- `EventCard.jsx` — sepia/scale/transition values here are the reference standard; referenced, not copied
- `EventsCarousel.jsx` — `prefers-reduced-motion` pattern here is the model for new motion guards
- `Scraps.jsx` — `WashiTape` is imported, not modified
- `src/lib/events/images.js` — `resolveEventImage()` already handles Drive links and local filenames
- `src/lib/img.js` — `cldImg()` already resolves local filenames
- `events.json` — event banner images come from Drive links; this plan covers static gallery sections only

---

## 10. Verification

1. **`npm run build`** — clean build, no TypeScript, Astro, or ESLint errors.
2. **`npm run dev`** — all three sections render their photos:
   - FirstStage: 6 pinned cards with WashiTape visible, horizontal scroll on mobile
   - ThirdSpace: 5 wide-frame performance photos in horizontal strip
   - OurRoots: 2–3 column grid above accordion
3. **Hover** — sepia lifts to full colour on hover; scale and duration match EventCard exactly.
4. **Mobile ≤ 640px** — no overflow beyond designated strip containers; downward swipe over strips scrolls the page (not the strip); OurRoots stacks to 1 column.
5. **Keyboard** — Tab reaches each strip container; arrow keys scroll horizontally; no focus trap.
6. **Reduced motion** — with OS reduced-motion enabled, mount/scroll animations are suppressed; CSS hover transitions still work.
7. **Broken asset check** — DevTools Network → Images: zero 404s for new filenames. Cross-check filenames in `gallery.ts` against files in `public/cafe-assets/`.
8. **CLS check** — record a page scroll through all three events sections in DevTools Performance; confirm no significant layout shift on image load.
9. **Visual check** — no caption invisible against its background; no photo has a jarring cold or white cast after sepia is applied.
10. **Existing sections unaffected** — Café Events carousel, back button navigation, and EventsSection panel-toggle all behave as before.
11. **Lighthouse** — run Lighthouse on the events page after implementation. Target: Performance ≥ 90, Accessibility ≥ 95. Gallery images should not appear in LCP candidates.

---

## 11. Out of Scope

- `events.json` `bannerUrl` / `galleryUrls` — driven by Google Sheet, separate concern.
- `Third space_/` and `Our roots_/` folders are empty. If photos arrive later, the strips/grids added here accept them as additions to `gallery.ts`.
- `IMG_3922.HEIC` — include only if `sharp` converts it without error.
- Photo lightboxes or modal popups — the sepia-to-colour hover is the full interaction for this phase.
- `srcset` / responsive images — single output size per section is sufficient for this release.
- Cloudinary upload — `cldImg()` falls back to `/cafe-assets/` locally; Cloudinary migration is a separate infra decision.
