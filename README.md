# Art Teas Tree Cafe

A modern artistic cafe website concept for **Art Teas Tree Cafe**, a Kolkata-based cafe associated with the **Mime Institute of Calcutta**.

This is not a luxury cafe brand. It is an emotionally warm, artistic, human space built around conversation, adda culture, books, tea, cigarettes, friendship, creativity, and slow social living.

## Project Philosophy

Art Teas Tree Cafe reimagines the familiar experience of hanging out at a roadside tea stall, or **cha er dokan**, and transforms it into a beautiful artistic social space with seating, books, ambience, curated snacks, and thoughtful beverages.

The heart of the cafe is simple:

> Human connection over digital isolation.

The website should feel like a rainy evening conversation over tea and cigarettes: warm, imperfect, textured, literary, and deeply human.

---

## Getting Started

Anyone cloning this repo on a fresh machine should be able to follow these steps and have the site running locally in about two minutes.

### Prerequisites

- **Node.js 20 or newer** ([download](https://nodejs.org/)). Run `node --version` to check; if it prints `v20.x.x` or higher, you're set. Anything below 20 will fail to install Astro.
- **npm 10 or newer** ships with Node. Run `npm --version` to verify.
- **Git** ([download](https://git-scm.com/)). Only needed to clone the repo.

If you don't have Node, the cleanest install is via [nvm](https://github.com/nvm-sh/nvm) (macOS / Linux) or [nvm-windows](https://github.com/coreybutler/nvm-windows). Then:

```bash
nvm install 22
nvm use 22
```

### Clone and install

```bash
git clone https://github.com/SohamDutta2001/Mine-Website.git
cd Mine-Website
npm install
```

`npm install` pulls Astro, React, Tailwind, the four `@fontsource` font packages, and the rest. First install is ~3 minutes; subsequent installs are seconds. Lockfile-aware (`package-lock.json`) so installs are deterministic across machines.

### Available scripts

| Command | What it does |
|---|---|
| `npm run dev` | Starts the Astro dev server at [http://localhost:4321](http://localhost:4321). Hot reload on every save. |
| `npm run build` | Runs `astro check` (type + content schema validation) then builds the static site to `dist/`. This is what CI runs. |
| `npm run preview` | Serves the `dist/` folder so you can inspect the production build locally before deploying. |
| `npm run astro -- <cmd>` | Runs an arbitrary Astro CLI command (e.g. `npm run astro -- add mdx`). |
| `npm test` | Runs the unit tests for the event utilities (`node --test`). |
| `npm run sync:menu:local` | Pulls the live menu from Google Sheets into `src/data/mockMenuData.json` (needs `MENU_SHEET_ID` in `.env`; see [docs/SETUP.md](docs/SETUP.md)). |
| `npm run sync:events:local` | Pulls the Events tab from Google Sheets into `src/data/events.json` (needs `EVENTS_SHEET_GID` in `.env`; see [docs/SETUP.md](docs/SETUP.md)). |

### First-run checklist

1. `npm install` — should finish with `added N packages`.
2. `npm run dev` — terminal should print `Local: http://localhost:4321/`.
3. Open that URL. You should see the Art Teas Tree Cafe homepage with placeholder gradient images, warm typography, and the navigation.
4. Click through `/experience`, `/menu`, `/adda`, `/visit`. Page transitions should fade smoothly.
5. `Ctrl+C` to stop the dev server. Run `npm run build` once to confirm the static build also succeeds.

### Adding your own photos

Drop real photos into the `photos/` folder, then edit `src/data/photos.ts` to import from the new file instead of the placeholder. Astro's `<Image>` component handles AVIF/WebP/responsive sizing automatically. See [photos/README.md](photos/README.md) for the full naming convention.

### Deploying

The site builds to a static `dist/` folder, so it deploys to any static host:

- **Vercel / Netlify:** connect the GitHub repo and accept defaults. They auto-detect Astro.
- **GitHub Pages / Cloudflare Pages:** point at the `dist/` folder, build command `npm run build`.
- **Any other host:** `npm run build`, then upload `dist/` contents to the web root.

### Troubleshooting

- **`npm install` fails on Windows with a sharp / native module error.** Make sure Node is 20 or newer. Older Node versions can't compile sharp.
- **`npm run build` complains about a missing photo.** You edited `src/data/photos.ts` to point at a file that doesn't exist in `photos/`. Either add the file or revert the import to a placeholder.
- **Fonts look wrong in dev but right in build (or vice versa).** Clear the Astro cache: delete the `.astro/` folder and re-run.
- **Port 4321 is taken.** Run `npm run dev -- --port 4322` (or any free port).

### Project documentation

- [docs/design.md](docs/design.md) — full design doc, locked architecture, and what's deliberately not in scope. Read this before making structural changes.
- [photos/README.md](photos/README.md) — naming convention for adding café photos.
- [photos/CREDITS.md](photos/CREDITS.md) — track attribution for every real photo that ships.

---

## Brand Identity

The cafe is inspired by:

- Kolkata adda culture
- Theatre, mime, and artistic expression
- Hand-crafted human touch
- Imperfection and warmth
- Nostalgia
- Intellectual socialisation
- Books, tea, smoke, and conversation
- Slow living and offline friendship

The experience should feel Bengali, artistic, intimate, intellectual, and conversational, not corporate or glossy.

## Target Audience

- College students
- Artists
- Theatre people
- Writers
- Readers
- Smokers
- Friend groups
- People seeking calm social spaces
- Intellectually curious young adults

## Website Mood

The website should feel:

- Warm
- Handcrafted
- Artistic
- Analog
- Intimate
- Literary
- Conversational
- Textured
- Emotionally human

Avoid:

- Corporate cafe aesthetics
- Overly polished startup design
- Sterile minimalism
- Glossy luxury branding

## Visual Direction

Use:

- Textured paper backgrounds
- Warm earthy tones
- Tea-brown palette
- Muted greens
- Sepia
- Charcoal black
- Handwritten typography accents
- Sketch illustrations
- Notebook and journal-inspired UI elements
- Subtle grain textures
- Soft shadows
- Warm ambient lighting effects

The visual atmosphere should suggest:

> If Satyajit Ray designed a modern adda cafe website.

## Typography Direction

The website should mix:

- Elegant serif fonts
- Handwritten accent fonts
- Editorial magazine-style layouts

Typography should feel literary and expressive, with enough warmth and imperfection to avoid looking sterile.

## Website Sections

### 1. Hero Section

A large emotional landing section with:

- Artistic typography
- Warm cafe imagery
- A poetic tagline
- CTA buttons

Possible tagline directions:

- Where conversations steep slowly.
- More human than modern.
- Adda. Art. Tea.
- A tea stall, reimagined.

### 2. About Section

This section should explain the philosophy of the cafe:

- Inspired by Kolkata tea stalls
- Focused on human interaction
- Connected to mime and artistic culture
- Built around books, tea, smoke, conversation, and community

### 3. Experience Section

Highlight the lived experience of the cafe:

- Seating space unlike normal tea stalls
- Curated books
- Fresh tea and coffee
- Smoking-friendly social environment
- Relaxed ambience
- Space for long conversations

### 4. Menu Section

Create a beautifully designed menu experience using artistic cards or handwritten menu styling.

Menu categories:

- Teas
- Coffees
- Snacks
- Quick bites

### 5. Gallery Section

Use a masonry-style artistic image layout.

The imagery should feel documentary and candid rather than commercial, showing real warmth, texture, people, tables, books, cups, smoke, and conversation.

### 6. Book Corner Section

A dedicated section for:

- Bookshelves
- Reading corners
- Quiet moments
- Literary atmosphere

### 7. Community / Adda Section

This section should emphasize:

- Friendships
- Conversations
- Artists gathering
- Intellectual exchange
- Offline human connection

### 8. Footer

Include:

- Location
- Instagram link
- Timings
- Contact info
- Subtle artistic elements

## Technical Direction

Shipped build stack (revised from the original brief during eng review — see [docs/design.md](docs/design.md)):

- **Astro 4** with static export (ships HTML by default, React only where it earns its weight)
- **React 18** islands for the menu filter and gallery lightbox
- **Tailwind CSS 3** with a custom design-token palette
- **TypeScript** in strict mode
- **`@fontsource`** self-hosted woff2 fonts (Cormorant Garamond, Lora, Caveat, Hind Siliguri) — no Google Fonts CDN
- **Astro Content Collections** (Zod-validated) for the menu
- **Astro View Transitions** for the ink-fade page transitions — built-in, no Framer Motion

Implementation qualities delivered:

- Fully responsive, mobile-first
- Three of five pages ship zero JavaScript
- Auto-optimized images (AVIF / WebP / responsive srcset) via Astro `<Image>`
- Lazy-loaded images below the fold
- Editorial typography hierarchy, 4-size display scale
- Subtle ink-fade view transitions between pages
- Soft hover interactions (warm-amber underlines, polaroid tilt-on-rest)
- Warm earthy palette ready to be re-tuned once real café photos arrive

## Creative Note

The emotional atmosphere matters more than flashy UI.

This should not become a generic cafe website. It should feel rooted in Kolkata, adda, theatre, literature, tea, cigarettes, friendship, and the handmade beauty of imperfect human spaces.
