# Plan: Content Fixes — Email, Book Donation CTA, Address Consistency

> **Status:** Ready for ChatGPT review. Do not implement until approved.  
> **Scope:** Three surgical content-only fixes across 7 files. Zero layout changes, zero new dependencies.

---

## Context

Three categories of factual/content errors exist in the live site:

1. **Wrong email address** — `hello@artteastreecafe.com` is a placeholder; the real operational email is `Art.teas.tree.cafe@gmail.com`. It appears in 5 files (hardcoded in event sub-panels and as the root value in `site.ts` which propagates to the Footer).
2. **No book donation CTA in the Menu page** — The homepage Books section already has a donation callout; the Menu page (`/menu`) has no such prompt, missing an opportunity to capture donations from visitors who arrive directly at the menu.
3. **Address inconsistency** — The correct form is "Sector II, Bidhannagar" (Sector II first). Two instances in `CafeApp.jsx` have the order reversed and use inconsistent spelling ("Bidhan Nagar" two words vs the official one-word "Bidhannagar").

---

## Fix 1 — Email Address: Replace everywhere with `Art.teas.tree.cafe@gmail.com`

### Complete audit of `hello@artteastreecafe.com`

| File | Line | Type | Action |
|---|---|---|---|
| `src/data/site.ts` | 31 | Root config — `contact.email` | **Change** — propagates to Footer.astro automatically |
| `src/components/Footer.astro` | 38 | Reads `site.contact.email` | No direct edit — fixed by site.ts change |
| `src/components/islands/events/FirstStage.jsx` | 121, 124 | Hardcoded `mailto:` + display text | **Change** both |
| `src/components/islands/events/OurRoots.jsx` | 144, 147 | Hardcoded `mailto:` + display text | **Change** both |
| `src/components/islands/events/CafeEvents.jsx` | 53, 56 | Hardcoded `mailto:` + display text | **Change** both |
| `src/components/islands/events/ThirdSpace.jsx` | 94 | Hardcoded `mailto:` only | **Change** href only — display text is "Enquire about the space ↗", leave it |

**Already correct — do not touch:**
- `src/components/islands/CafeApp.jsx` lines 1679 & 1683 — Book donation section already uses `Art.teas.tree.cafe@gmail.com`

### Changes

**`src/data/site.ts`** (one line, fixes Footer.astro automatically):
```ts
// BEFORE
email: 'hello@artteastreecafe.com',
// AFTER
email: 'Art.teas.tree.cafe@gmail.com',
```

**`src/components/islands/events/FirstStage.jsx`:**
```jsx
// BEFORE
href="mailto:hello@artteastreecafe.com"  →  hello@artteastreecafe.com
// AFTER
href="mailto:Art.teas.tree.cafe@gmail.com"  →  Art.teas.tree.cafe@gmail.com
```

**`src/components/islands/events/OurRoots.jsx`:**
```jsx
// BEFORE
href="mailto:hello@artteastreecafe.com"  →  hello@artteastreecafe.com ↗
// AFTER
href="mailto:Art.teas.tree.cafe@gmail.com"  →  Art.teas.tree.cafe@gmail.com ↗
```

**`src/components/islands/events/CafeEvents.jsx`:**
```jsx
// BEFORE
href="mailto:hello@artteastreecafe.com"  →  hello@artteastreecafe.com ↗
// AFTER
href="mailto:Art.teas.tree.cafe@gmail.com"  →  Art.teas.tree.cafe@gmail.com ↗
```

**`src/components/islands/events/ThirdSpace.jsx`:**
```jsx
// BEFORE
href="mailto:hello@artteastreecafe.com"
// AFTER
href="mailto:Art.teas.tree.cafe@gmail.com"
// display text unchanged: "Enquire about the space ↗"
```

**Aesthetic risk:** None. Email links use existing classes; only string values change.

---

## Fix 2 — Book Donation CTA in the Menu Page

### Current state
`src/pages/menu.astro` structure: page header → `MenuFilter` island → multiple `Section` blocks per menu category → Footer. No book donation callout exists here.

### Placement
**Bottom of the page**, after the last menu category `Section` and before `</Layout>`. A visitor who has browsed the full menu is the most natural audience for this prompt.

### Design approach
The Menu page is a **static Astro page** using the site's `tea-*` Tailwind color tokens (`text-tea-900`, `bg-cream`, `shadow-soft`, etc.), not the hex colors used in `CafeApp.jsx`. It must not import React components.

The washi-tape pin is replicated with a pure CSS `<div>` using the exact same `clip-path` and `background-image` as the `WashiTape` component in `Scraps.jsx` — visually identical, no JS required.

```astro
<!-- Book Donation Callout — end of menu page, before </Layout> -->
<section class="px-5 pb-24 pt-8 sm:px-8 sm:pb-32">
  <div class="mx-auto max-w-6xl">
    <div class="ink-divider mb-14" aria-hidden="true" />

    <div class="relative mx-auto max-w-2xl">

      <!-- Washi tape pin — pure CSS, no React -->
      <div
        aria-hidden="true"
        class="pointer-events-none absolute -top-3 left-1/2 z-10 h-6 w-28 -translate-x-1/2 select-none opacity-75"
        style="background-color: #C9A87A; background-image: repeating-linear-gradient(135deg, rgba(255,255,255,0.10) 0 4px, transparent 4px 9px); clip-path: polygon(2% 12%, 12% 0%, 28% 14%, 44% 2%, 60% 16%, 76% 4%, 92% 14%, 100% 6%, 98% 86%, 90% 100%, 74% 88%, 58% 100%, 42% 86%, 26% 100%, 10% 88%, 0% 96%); transform: rotate(2deg);"
      ></div>

      <!-- Card -->
      <div
        class="relative bg-[#F5F0E6] px-8 py-10 shadow-[0_26px_60px_-18px_rgba(0,0,0,0.18)] sm:px-10"
        style="transform: rotate(-0.8deg);"
      >
        <!-- Typewriter label -->
        <p class="font-typewriter text-[10px] uppercase tracking-[0.32em] text-tea-500">
          Donate a book
        </p>

        <!-- Headline -->
        <h2 class="mt-2 font-hand text-3xl leading-snug text-tea-900 sm:text-4xl">
          Have a book looking for a new reader?
        </h2>

        <!-- Body copy -->
        <p class="mt-4 font-body text-base leading-7 text-tea-700">
          Bring it in. The shelf is always open to a new arrival — leave it at the
          counter, or write to us first and it finds its place on our wall.
        </p>

        <!-- Footer row: email + walk-in -->
        <div class="mt-6 flex flex-col gap-3 border-t border-tea-900/10 pt-5 sm:flex-row sm:items-center sm:justify-between">
          <a
            href="mailto:Art.teas.tree.cafe@gmail.com"
            class="inline-flex items-center gap-2 font-typewriter text-sm tracking-wide text-tea-600 underline decoration-tea-500/40 underline-offset-4 transition-colors hover:text-tea-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tea-600"
          >
            Art.teas.tree.cafe@gmail.com
          </a>
          <p class="font-typewriter text-[10px] uppercase tracking-[0.28em] text-tea-900/40">
            Walk in · Sector II, Bidhannagar, Kolkata
          </p>
        </div>
      </div>

    </div>
  </div>
</section>
```

### Why this approach

| Decision | Reason |
|---|---|
| No React island | `menu.astro` is static; a React component for a contact card would add bundle weight with no benefit |
| Pure CSS washi tape | Replicates `WashiTape` from `Scraps.jsx` exactly (same `clip-path`, same `background-image`) — identical look, zero JS |
| `tea-*` tokens not hex | Matches the rest of `menu.astro`; hex colors are confined to React islands in `CafeApp.jsx` |
| `ink-divider` before card | Consistent with how the menu page separates sections; no new pattern introduced |
| `rotate(-0.8deg)` | Matches the hand-placed aesthetic of the homepage book donation card (`rotate(-1deg)`) |
| Copy voice | "Have a book looking for a new reader?" mirrors the homepage version for brand consistency |

**Files changed: 1** — `src/pages/menu.astro`

---

## Fix 3 — Address: "Sector II, Bidhannagar" order and spelling

### Requirement
Correct form: **Sector II, Bidhannagar** — Sector II always first. Spelling: **Bidhannagar** (one word, official municipal name) not "Bidhan Nagar" (two words, informal).

### Complete audit

| File | Line | Current text | Issue | Action |
|---|---|---|---|---|
| `src/data/site.ts` | 14 | `CK-7, CK Block, Sector II` | ✅ Correct | No change |
| `src/data/site.ts` | 15 | `Salt Lake City, Bidhannagar, Kolkata…` | ✅ Correct spelling | No change |
| `src/data/site.ts` | 16 | `Sector II, Bidhannagar.` | ✅ Correct order | No change |
| `src/data/site.ts` | 18 | `CK-7, CK Block, Sector II, Salt Lake City` | ✅ Correct | No change |
| `CafeApp.jsx` | 647 | `Bidhan Nagar, Kolkata` | ⚠️ Two-word spelling | → `Bidhannagar, Kolkata` |
| `CafeApp.jsx` | 868 | `Est. Bidhan Nagar, Kolkata` | ⚠️ Two-word spelling | → `Est. Bidhannagar, Kolkata` |
| `CafeApp.jsx` | 1536 | `'Bidhan Nagar, Sector-II'` | ❌ Wrong order + spelling + hyphen | → `'Sector II, Bidhannagar'` |
| `CafeApp.jsx` | 1686 | `Sector-II, Salt Lake City, Kolkata` | ⚠️ Hyphen in Sector-II | → `Sector II, Salt Lake City, Kolkata` |
| `CafeApp.jsx` | 1729 | `Sector II, Salt Lake City, Bidhannagar, Kolkata 700091` | ✅ Correct | No change |
| `Seo.astro` | 49–56 | PostalAddress schema | ✅ Reads from site.ts | No change |

### Changes in `src/components/islands/CafeApp.jsx` (4 string replacements)

**Line 647 — hero Bengali subtitle:**
```
Bidhan Nagar, Kolkata  →  Bidhannagar, Kolkata
```

**Line 868 — affiliation badge:**
```
Est. Bidhan Nagar, Kolkata  →  Est. Bidhannagar, Kolkata
```

**Line 1536 — Books section map-pin feature label:**
```
'Bidhan Nagar, Sector-II'  →  'Sector II, Bidhannagar'
```

**Line 1686 — book donation walk-in text:**
```
Sector-II, Salt Lake City, Kolkata  →  Sector II, Salt Lake City, Kolkata
```
(Order already correct here — only the hyphen is removed.)

**Aesthetic risk:** None. Pure string replacements.

---

## File Change Summary

| File | Fix | Change type |
|---|---|---|
| `src/data/site.ts` | Fix 1 — email | 1 string |
| `src/components/islands/events/FirstStage.jsx` | Fix 1 — email | 2 strings |
| `src/components/islands/events/OurRoots.jsx` | Fix 1 — email | 2 strings |
| `src/components/islands/events/CafeEvents.jsx` | Fix 1 — email | 2 strings |
| `src/components/islands/events/ThirdSpace.jsx` | Fix 1 — email href only | 1 string |
| `src/pages/menu.astro` | Fix 2 — book donation CTA | ~40 new lines |
| `src/components/islands/CafeApp.jsx` | Fix 3 — address | 4 strings |

**Footer.astro** — no direct edit; auto-updates when `site.ts` changes.  
**Seo.astro** — no edit; already reads from `site.ts` which is correct.

---

## Verification

1. **`npm run build`** — clean build, no TypeScript or Astro errors.
2. **Email audit** — `grep -r "hello@artteastree" src/` returns zero results.
3. **Menu page** — navigate to `/menu`, scroll to bottom → donation card visible, tilted, washi-tape pin visible, email link resolves correctly.
4. **Address audit** — `grep -n "Bidhan Nagar" src/` returns zero results; `grep -rn "Sector-II" src/` returns zero results.
5. **Footer** — email shown as `Art.teas.tree.cafe@gmail.com` with correct `mailto:`.
6. **Event sub-panels** — open First Stage, Third Space, Café Events, Our Roots → all email links point to `Art.teas.tree.cafe@gmail.com`.
7. **Hero + affiliation badge** (homepage) — confirm "Bidhannagar" spelling (one word) in both locations.

---

## Out of Scope

- Phone number `+91 33 0000 0000` — placeholder in site.ts, not part of this fix.
- Instagram handle — not mentioned, no change.
- `CafeApp.jsx` line 1729 full address — already correct, untouched.
- SEO / schema.org — derives from `site.ts` which is already correct.
