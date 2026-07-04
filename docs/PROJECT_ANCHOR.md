# Project Anchor Summary — Art Teas Tree Cafe / MIME Website

**What it is:** Marketing website for **Art Teas Tree Cafe**, a real café in Salt Lake, Kolkata, affiliated with the **National Mime Institute (MIME) of Calcutta**. Brand identity: Kolkata adda (hangout/conversation) culture, tea-stall nostalgia, theatre/mime heritage, books, conversation — deliberately warm/handcrafted/literary, explicitly *not* glossy-startup or luxury-café aesthetic. Repo: `SohamDutta2001/Mine-Website`.

**Tech stack:** Astro 4 (static site generator) + a single React island for the whole page (`CafeApp.jsx`, mounted with `client:load`) + Tailwind CSS 3 + TypeScript (strict) + Framer Motion + Embla Carousel. Self-hosted `@fontsource` fonts (Cormorant Garamond, Lora, Caveat, Hind Siliguri) plus Courier Prime via Google Fonts CDN.

**Important nuance:** `docs/design.md` describes an original plan for a **5-page** editorial Astro site (`/`, `/experience`, `/menu`, `/adda`, `/visit`) with mostly-zero-JS pages. The site actually shipped as a **single page** (`src/pages/index.astro`) that just renders one big React component, `CafeApp.jsx`, containing all sections (Hero, Ticker, Philosophy, Reel/gallery, Menu, Books, Footer) as in-page anchors (`#home`, `#philosophy`, `#reel`, `#menu`, `#books`). Treat `docs/design.md` and the root `README.md` (which still references `/experience`, `/adda`, `/visit` pages) as **partially stale** — the real routes today are just `/`, `/menu`, `/events`, `/events/[slug]`.

**Content/CMS pipeline (no backend/database):**
- **Menu**: lives in `src/data/mockMenuData.json`, refreshed at build time from a public Google Sheet via `scripts/sync-menu.mjs` (`npm run sync:menu`). Falls back to the checked-in JSON if `MENU_SHEET_ID` env var isn't set.
- **Events**: lives in `src/data/events.json`, refreshed via `scripts/sync-events.mjs` from a Google Sheet tab (`EVENTS_SHEET_GID`). Each event has a category (Performance/Workshop/Exhibition, with alias mapping), renders on `/events` and a per-event page `src/pages/events/[slug].astro` using template components in `src/components/events/templates/`.
- **Photos**: optional Cloudinary CDN integration via `src/lib/img.js` (`cldImg()` helper) — falls back to local files in `public/cafe-assets/` if `CLOUDINARY_CLOUD_NAME` is unset.
- Both syncs run automatically on `npm run build` (via `prebuild` script) and are designed to fail loudly (exit 1) on bad data rather than silently deploy stale content.

**Deployment model:** Dockerized "rebuild loop" — a `builder` container (`Dockerfile`, `docker/rebuild-loop.sh`) periodically re-runs the Sheets sync + `astro build` on an interval (`REBUILD_INTERVAL`, default 300s) and publishes into a shared volume; an nginx container serves the published `dist/`. This means café-owner edits to Google Sheets go live automatically without a manual deploy, per `docker-compose.yml`.

**Key directories:**
- `src/components/islands/` — all React interactivity: `CafeApp.jsx` (the whole homepage), `MenuFilter.tsx`, `GalleryLightbox.tsx`, `Scraps.jsx` (decorative UI bits like washi tape/coffee rings), `events/` (event carousel, cards, accordion, "Our Roots"/"First Stage"/"Third Space" institute-history sections).
- `src/components/` (top-level, `.astro`) — server-rendered scaffolding: `Layout.astro`, `Nav.astro`, `Footer.astro`, `Section.astro`, `MenuCard.astro`, `Seo.astro`.
- `src/lib/events/` — event data loading/parsing/slug/image helpers.
- `src/data/` — `site.ts` (brand/contact/hours config), `mockMenuData.json`, `events.json`, `instituteData.json` (currently empty `[]`), `photos.ts`.
- `docs/` — `design.md` (original design doc, now partly superseded), `SETUP.md` (Cloudinary + Sheets setup walkthrough), `HOW_TO_UPDATE_EVENTS.md`, `SHEET_AUTO_REBUILD.md`, plus client-facing `PROPOSAL.md`/`CLIENT_PROPOSAL.md`.
- `tests/events.test.mjs` — Node's built-in test runner (`npm test`) covers event utility functions.
- `plans/` and root `changes.md` / `changes_plan.md` — working notes from prior sessions (not authoritative docs).

**Brand config source of truth:** `src/data/site.ts` — name, tagline, address (CK-7, CK Block, Sector II, Salt Lake), hours, contact, and the National Mime Institute affiliation blurb. Nav only has Home / Events / Menu (anchor).

**Scripts:** `npm run dev` (localhost:4321), `npm run build` (runs `astro check` + sheet syncs + `astro build`), `npm run preview`, `npm test`, `npm run sync:menu:local` / `sync:events:local` (need `.env`, see `docs/SETUP.md`).
