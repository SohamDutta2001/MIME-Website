# Plan: Photo Selection via Gemini + Wiring into the Website

> **Save this file as `photo_selection_plan.md` after exiting plan mode.**

---

## Context

The café stakeholder has shared a Google Drive folder with a structured set of photos, organised into sub-folders by where they should go (Hero, Reel, etc.). The goal is to give Gemini the full aesthetic brief and the Drive folder so it can curate the best photos for each section, then return a structured JSON blob. That blob gets pasted back here, and Claude wires the filenames into `HERO_IMAGES` / `REEL_FRAMES` in `CafeApp.jsx`, crops + converts them to `.webp`, and places them in `public/cafe-assets/`.

---

## Workflow

```
Stakeholder Drive folder
        ↓
  [User adds link + this prompt to Gemini]
        ↓
  Gemini returns structured JSON
        ↓
  [User pastes JSON here]
        ↓
  Claude: crops → .webp → public/cafe-assets/ → wires CafeApp.jsx → commits
```

---

## The Gemini Prompt

Paste this prompt into Gemini along with the Drive folder link.

---

```
You are a photo curator and creative director working on the website for Art-Teas-Tree Café
(Salt Lake, Kolkata) — an artistic social space run in association with the National Mime
Institute. The site has a very specific retro-Kolkata cinematic aesthetic, described in full
below. You have access to a Google Drive folder with photos organised into sub-folders
corresponding to website sections. Your job is to pick the best photos for each section and
return a structured JSON output I can feed directly to the developer.

─────────────────────────────────────────────
ABOUT THE CAFÉ & WEBSITE AESTHETIC
─────────────────────────────────────────────

The café is not a generic coffee shop. It is a cultural space — a cha-er dokan (roadside
tea stall) reimagined as a theatre for everyday life. The brand language draws from:

• Satyajit Ray's Apur Sansar / Charulata: intimate domestic warmth, slow light, quiet rooms
• Kolkata's College Street / Boipara culture: stacked books, worn tables, afternoon adda
• Bengali handcraft: clay bhars (terracotta cups), handwoven ceilings, kantha patterns
• 1960s–70s Indian cinema: film grain, warm tungsten light, sepia-washed shadows

Colour palette: warm amber (#C9A87A), burnt sepia (#7A4A2A), deep ink brown (#1C1410),
moss green (#5A6B3E), cream/paper (#F4ECD8 / #EDE2CB). No cold whites, no neon, no
sterile modern café vibes.

Typography on the site uses: Cormorant Garamond (headlines), Lora (body), Caveat
(handwritten annotations), Courier Prime (typewriter labels), Hind Siliguri (Bengali).

The overall feel: warm, unhurried, literary, intimate, slightly nostalgic. Every photo
should feel like a still from a quiet Bengali art film.

─────────────────────────────────────────────
PHOTO SECTIONS THAT NEED FILLING
─────────────────────────────────────────────

SECTION 1 — HERO CAROUSEL (full-bleed cinematic)
• Purpose: The first thing a visitor sees. Full-screen, 16:9. Sets the entire mood.
• Ideal shots: wide/medium shots of the café interior or entrance — atmospheric, moody,
  showing the space. Think: low light, warm lamps, string lights, interesting ceiling or
  architecture, a visitor silhouetted at a table, the café sign at dusk.
• Avoid: close-up food shots, bright daylight with harsh shadows, empty tables with no
  warmth, photos where any person is the clear subject (faces are fine if incidental/
  atmospheric, not portrait-style).
• Count needed: exactly 5 photos.
• Currently in use (DO NOT re-pick these):
  - mime-cafe-neon-sign (entrance CAFÉ neon sign)
  - mime-cafe-evening-seating (string lights, evening seating)
  - mime-cafe-lamplit-table (single lamp over quiet table)
  - mime-cafe-adda-reading (visitor reading, afternoon)
  - mime-cafe-hanging-lamps (handwoven ceiling with hanging lamps)

SECTION 2 — REEL FILMSTRIP (contact-sheet close-ups)
• Purpose: A horizontal filmstrip of 8 "stills" that the visitor flips through like a
  film contact sheet. Each has a caption, Bengali subtitle, cinematic metadata (lens,
  timecode, location), and a one-line director's note.
• Ideal shots: close-up detail shots — food, drinks, hands on a cup, an open book beside
  tea, a candle, a menu being studied, a plate arriving. Warm, textured, intimate.
  Portrait orientation is acceptable here (they're cropped to 16:9 viewfinder frames).
• Avoid: generic stock-food photography feel, over-bright or over-saturated, anything
  that doesn't feel like a still from a personal film journal.
• Count needed: exactly 8 photos.
• Currently in use (DO NOT re-pick these):
  - mime-cafe-tea-cups (two clay cups, morning)
  - mime-cafe-green-tea (clay-green cups, warm table)
  - mime-cafe-fries-skewer (fries and skewer, interval snack)
  - mime-cafe-skewer-plate (plated supper)
  - mime-cafe-menu-adda (hands over menu, cold coffee)
  - mime-cafe-mac-cheese (mac and cheese bowl)
  - mime-cafe-wooden-sign (wooden Art-Teas-Tree sign)
  - mime-cafe-lantern-glow (lantern, closing hour)

─────────────────────────────────────────────
AESTHETIC SCORING CRITERIA (apply to every photo)
─────────────────────────────────────────────

Score each photo mentally on these axes. Only pick photos that score HIGH on most:

WARMTH — Does the light source feel warm (tungsten, candle, lamp)? Or cold (flash, neon, daylight)?
GRAIN/TEXTURE — Does the photo have film-like texture, or is it clinical and clean?
INTIMACY — Does the framing feel close and personal, or wide and impersonal?
TONAL FIT — Does the palette map to amber/sepia/moss/cream? Or does it have jarring blues, cool greys, or oversaturated colours?
NARRATIVE — Does the photo tell a small story (hands doing something, a moment in time)? Or is it a static object shot?
BENGALI SOUL — Does it feel Kolkata — old wood, clay, crowded warmth, literary vibe?

REJECT any photo that has:
• Visible browser chrome, timestamps, or watermarks
• Harsh direct flash lighting
• Very low resolution (blurry at web size)
• A cold/blue colour cast
• A person as the obvious portrait subject (candid/atmospheric human presence is fine)
• Bright white walls or sterile modern décor

─────────────────────────────────────────────
OUTPUT FORMAT — RETURN THIS EXACT JSON
─────────────────────────────────────────────

Return ONLY valid JSON in this exact structure. No prose before or after.
For the Reel frames, write the metadata in the same cinematic voice as the examples:
  - caption: one quiet sentence describing the moment, present tense
  - bn: 2–4 Bengali words naming the scene (use Bengali script)
  - lens: fictional but plausible film-camera metadata e.g. "35mm · f/2.8 · ISO 400"
  - timecode: timecode in HH:MM:SS:FF format suggesting where in a film this falls
  - location: short location tag e.g. "window table", "entrance wall", "kitchen pass"
  - note: a short director's annotation e.g. "hold the silence ↘" or "cut on the crunch"

{
  "hero": [
    {
      "drive_filename": "exact filename as it appears in the Drive folder",
      "suggested_slug": "kebab-case-descriptive-name (without extension)",
      "alt": "One sentence describing the photo for screen readers — specific, atmospheric",
      "why": "One sentence on why this fits the Hero section aesthetics"
    }
    // × 5 entries
  ],
  "reel": [
    {
      "drive_filename": "exact filename as it appears in the Drive folder",
      "suggested_slug": "kebab-case-descriptive-name (without extension)",
      "caption": "The morning shift — two cups poured, before the adda begins.",
      "bn": "সকালের চা",
      "lens": "35mm · f/2.8 · ISO 400",
      "timecode": "00:01:24:12",
      "location": "interior, counter",
      "note": "hold the silence ↘",
      "why": "One sentence on why this fits the Reel section aesthetics"
    }
    // × 8 entries
  ]
}

─────────────────────────────────────────────
IMPORTANT NOTES
─────────────────────────────────────────────

• The Drive folder may be organised into sub-folders (e.g. /hero, /reel, /general). Use
  the folder hints as guidance, but apply your own aesthetic judgement — a photo in /general
  might be a better hero shot than something in /hero.
• If there are not enough good photos to fill a section (5 hero / 8 reel) without
  compromising quality, pick the best available and note how many slots are unfilled with
  a `"unfilled_slots": N` key at the top level.
• Every `drive_filename` must be the exact name of the file as it appears in Drive, so the
  developer can locate and download it without guessing.
• The `suggested_slug` becomes the output filename: `mime-cafe-{suggested_slug}.webp`.
  Keep it under 40 characters. No spaces. No uppercase.
```

---

## What Claude Does When You Paste the JSON Back

Once you paste Gemini's JSON output into this conversation, Claude will:

1. **Download / locate** each file by `drive_filename` (you'll need to share or download them into `/photos/` or another staging folder in the repo, since Claude can't access Drive directly).
2. **Process with `sharp`**: crop to 1600×900 (16:9), `fit: 'cover'`, `position: 'attention'` for food/detail shots and `position: 'centre'` for sign/logo shots; convert to `.webp`; output to `public/cafe-assets/mime-cafe-{slug}.webp`.
3. **Update `HERO_IMAGES`** in `src/components/islands/CafeApp.jsx` with the 5 hero entries (src = `mime-cafe-{slug}.webp`, alt from JSON).
4. **Update `REEL_FRAMES`** with the 8 reel entries (all metadata fields from JSON).
5. **Verify** the existing 5 hero + 8 reel slots are fully replaced/refreshed with no broken image paths.
6. **Build check**: `npm run build` — confirm no errors before committing.

---

## Files That Will Change

| File | What changes |
|---|---|
| `src/components/islands/CafeApp.jsx` | `HERO_IMAGES` and `REEL_FRAMES` arrays updated |
| `public/cafe-assets/mime-cafe-*.webp` | New processed images added |

Nothing else changes. The image pipeline (`cldImg()` in `src/lib/img.js`) already resolves filenames to `/cafe-assets/` — no plumbing changes needed.

---

## Verification After Wiring

1. `npm run dev` → open in browser, hero carousel cycles through all 5 new photos without broken images
2. Reel filmstrip shows all 8 frames with correct captions + Bengali text
3. `npm run build` → no errors
4. All new `.webp` files are ≤ 500 KB each (sharp output at quality 82 default)
