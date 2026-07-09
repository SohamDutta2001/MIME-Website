# Plan: Events CTA Strip at Top of Menu Page
## (v5 — GPT review v1 + v2 + v3 + v4 incorporated)

> **Status:** Approved for implementation.
> **Scope:** One file changed — `src/pages/menu.astro`. Pure static Astro, no new dependencies, no custom CSS.

---

## Context

The `/menu` page currently has zero cross-promotion for the events programme. A visitor who arrives directly at `/menu` has no prompt to discover First Stage, The Third Space, workshops, or upcoming café events — all of which are the cultural core of Art-Teas-Tree.

The fix: a visually distinct "playbill" notice placed above the menu header, using the site's existing animation infrastructure. Two layers of motion only — entrance fade-up on page load, and hover — keeping continuous motion off the top of a page whose primary purpose is browsing food.

**Changes from v1:** CSS marquee ticker removed, pulsing dot removed, arrow animation removed, `aria-label` removed, `<style>` block eliminated.  
**Changes from v2:** Body copy made evocative (story, not list), CTA changed to "Explore upcoming events →", WashiTape moved inside `<a>` so both rotate together, bottom padding increased to `pb-6`, rotation committed, supporting programme-names line added, `ease-ink` confirmed as valid.  
**Changes from v3:** Body copy em-dash removed (replaced with "for"), supporting line "Workshops" deduped → "Café Events", `style="transform: rotate(-0.75deg);"` on `<a>` replaced with Tailwind `-rotate-[0.5deg]` to fix hover-translate conflict, `w-full` added to `<a>`, programme names line raised to `text-tea-400/55` + marked `aria-hidden="true"`, Safari added to verification checklist.  
**Changes from v4:** Rotation reduced from `0.75deg` to `0.5deg` (card is the first element visitors see — slightly more premium), supporting line "Community Programme" → "Café Events" (more concrete), body copy tightened to "gatherings all month long" to prevent awkward line wrapping, CTA spacing raised `mt-3` → `mt-4`, CTA copy "See" → "Explore", removed alarming Safari transform note.

---

## Placement

**Immediately inside `<Layout>`, before the existing `<header>` block.**

```
<Layout>
  ← NEW: events teaser strip (v5)
  <header class="pt-12 sm:pt-16">   ← existing "The Menu" header
    ...
```

The notice precedes the menu the way a theatre programme has an announcements column before the show listings — it contextualises, does not interrupt. The card fills `max-w-column` (54rem), which is the width constrained by `Layout.astro`'s `<main class="mx-auto max-w-column px-gutter">` wrapper. `w-full` on the `<a>` makes this explicit in the markup, not implicit. It is not a hero banner.

**WashiTape import:** Already present in `menu.astro` frontmatter — used by the book donation CTA at the bottom of the page. No import changes needed.

---

## Visual Design

### Anatomy

```
┌─────────────────────────────────────────────────────────────┐  ← rotates -0.5deg
│ ↑ WashiTape (maroon, -top-3 left-6, rotates with card)     │
│                                                             │
│  NOW ON STAGE                              মঞ্চ             │
│                                                             │
│  Beyond the menu, the café becomes a stage for             │
│  performances, readings, workshops and gatherings          │
│  all month long.                                           │
│                                                             │
│  FIRST STAGE · THIRD SPACE · CAFÉ EVENTS                   │  ← typewriter, muted
│                                                             │
│  Explore upcoming events →                                  │  ← font-hand CTA
└─────────────────────────────────────────────────────────────┘
```

- **Background:** `bg-tea-800` (#2a1812) — dark ink, instant contrast against the cream menu page
- **Border:** `border border-tea-700/40`, brightens on hover to `border-tea-500/60`
- **Card rotation:** `-rotate-[0.5deg]` (Tailwind class, not inline style — composes correctly with `hover:-translate-y-0.5`; see transform fix section below)
- **Shadow:** `shadow-[0_4px_24px_-8px_rgba(28,20,16,0.45)]`, deepens on hover
- **WashiTape pin:** Maroon (`#6B2D2D`), `-top-3 left-6`, positioned **inside** the `<a>` — amber tape is already used by the book donation callout at the bottom; maroon signals a different destination and is the theatre/performance colour on this site

### Typography

| Element | Font | Size / Tracking | Colour |
|---|---|---|---|
| Section label | `font-typewriter` | `text-[9px] tracking-[0.45em] uppercase` | `text-tea-400/60` |
| Body copy | `font-body` | `text-base leading-7` | `text-tea-200/70` |
| Programme names line | `font-typewriter` | `text-[10px] tracking-[0.3em] uppercase` | `text-tea-400/55` · `aria-hidden="true"` |
| CTA headline | `font-hand` | `text-2xl sm:text-3xl leading-tight` | `text-cream` → `text-tea-100` on hover |
| Bengali accent | `font-bn` | `text-4xl` | `text-tea-500/25` · hidden on mobile · `aria-hidden="true"` |

### Copy

```
NOW ON STAGE

Beyond the menu, the café becomes a stage for performances, readings,
workshops and gatherings all month long.

FIRST STAGE · THIRD SPACE · CAFÉ EVENTS

Explore upcoming events →
```

The body copy tells a story ("becomes a stage") rather than listing categories. "Café Events" replaces "Community Programme" — it's concrete and direct; people attend events, not programmes. "All month long" replaces "throughout the month" to shorten the final line and prevent awkward wrapping at narrow widths. "Explore" warms the CTA — you're already on a discovery page.

---

## Critical Fix: Inline Transform vs Tailwind Transform

### The problem (v3 code)

```astro
<a
  class="... hover:-translate-y-0.5 ..."
  style="transform: rotate(-0.75deg);"
>
```

Tailwind's `hover:-translate-y-0.5` generates `transform: translateY(-2px)` on hover — a new `transform` declaration that entirely overwrites the inline `transform: rotate(-0.75deg)`. On hover, the card snaps flat (unrotated) while lifting.

### The fix (v5 code)

```astro
<a
  class="... -rotate-[0.5deg] hover:-translate-y-0.5 ..."
>
  {/* no style attribute */}
```

Tailwind v3 implements all transform utilities (`rotate-*`, `translate-*`, `scale-*`, `skew-*`) via CSS custom properties (`--tw-rotate`, `--tw-translate-y`, etc.) composed into a single `transform` declaration. All values coexist — no override.

---

## Animation (Two Layers Only)

### Layer 1 — Entrance (page load, fires once, no new JS)

`data-reveal` on the outer `<div>`. `Layout.astro` already contains an IntersectionObserver that adds `.reveal` (opacity 0, translateY 26px) then `.revealed` (opacity 1, translateY 0) when the element enters the viewport. Above-fold elements fire on initial page load.

- Duration: 0.9s, `ease-ink` (`cubic-bezier(0.22, 0.61, 0.36, 1)`) — from `global.css`
- `--reveal-delay: 80ms` inline style staggers the strip slightly after the Nav
- `prefers-reduced-motion`: guarded in `Layout.astro` — no extra work needed

### Layer 2 — Hover (interactive, Tailwind only)

On `:hover` / `:focus-visible` via Tailwind `group` classes on the `<a>`:
- Card lifts: `hover:-translate-y-0.5` (composes with `-rotate-[0.5deg]`, no conflict)
- Shadow deepens: `hover:shadow-[0_10px_36px_-8px_rgba(28,20,16,0.55)]`
- Border lightens: `hover:border-tea-500/60`
- CTA headline brightens: `group-hover:text-tea-100`
- Transition: `duration-500 ease-ink`

No `<style>` block. No `@keyframes`. No continuous motion.

---

## Full Code Block

No `<style>` tag. No frontmatter changes — `WashiTape` is already imported. Insert before `<header class="pt-12 sm:pt-16">` inside `<Layout>`.

```astro
{/* Events teaser — playbill notice, above the menu header */}
<div class="pt-8 pb-6 sm:pt-10" data-reveal style="--reveal-delay: 80ms;">

  <a
    href="/events"
    class="group relative block w-full border border-tea-700/40 bg-tea-800
           -rotate-[0.5deg] px-7 py-6
           shadow-[0_4px_24px_-8px_rgba(28,20,16,0.45)]
           transition-all duration-500 ease-ink
           hover:-translate-y-0.5 hover:border-tea-500/60
           hover:shadow-[0_10px_36px_-8px_rgba(28,20,16,0.55)]
           focus-visible:outline focus-visible:outline-2
           focus-visible:outline-offset-2 focus-visible:outline-tea-300"
  >
    <WashiTape className="-top-3 left-6" color="#6B2D2D" width={72} rotate={-3} style={{}} />

    <div class="flex items-start justify-between gap-4">
      <div>
        <p class="font-typewriter text-[9px] uppercase tracking-[0.45em] text-tea-400/60">
          Now on stage
        </p>
        <p class="mt-4 font-body text-base leading-7 text-tea-200/70">
          Beyond the menu, the café becomes a stage for performances, readings,
          workshops and gatherings all month long.
        </p>
        <p class="mt-3 font-typewriter text-[10px] uppercase tracking-[0.3em] text-tea-400/55"
           aria-hidden="true">
          First Stage · Third Space · Café Events
        </p>
        <p class="mt-4 font-hand text-2xl leading-tight text-cream transition-colors
                   duration-300 ease-ink group-hover:text-tea-100 sm:text-3xl">
          Explore upcoming events →
        </p>
      </div>
      <p class="hidden shrink-0 select-none font-bn text-4xl text-tea-500/25 sm:block"
         aria-hidden="true">
        মঞ্চ
      </p>
    </div>

  </a>

</div>
```

---

## Why Each Decision Was Made

| Decision | Reason |
|---|---|
| **Placed above `<header>`** | Catches the visitor before they begin scanning prices; precedes the menu the way a programme cover precedes the listings |
| **`bg-tea-800` dark background** | Instant contrast against the cream page — signals "different kind of content" without a layout change |
| **Evocative body copy** | "Beyond the menu, the café becomes a stage" tells a story; previous list-style copy read like a brochure |
| **"for" not em-dash in body** | "becomes a stage for performances" flows naturally; the em-dash created an unnecessary pause |
| **"all month long" not "throughout the month"** | Shorter final clause; prevents awkward wrapping of "community gatherings throughout the month" at narrow widths |
| **"Café Events" not "Community Programme"** | People attend events, not programmes. "Café Events" is concrete and specific |
| **"Explore upcoming events →" CTA** | "Explore" is warmer than "See" on a discovery page; "upcoming events" has strong information scent |
| **Supporting typewriter line** | Communicates programme scale at a glance without motion |
| **`font-hand` for CTA** | Matches hand-lettered emotion on every other CTA on the site |
| **WashiTape inside `<a>`** | Both the tape and card rotate together — no misalignment between a straight tape and a tilted card |
| **`-rotate-[0.5deg]` not `0.75deg`** | First element visitors see; slightly less tilt feels more premium while still being legible as hand-placed |
| **`-rotate-[0.5deg]` Tailwind class** | Replaces `style="transform: rotate(…)"` — composes with `hover:-translate-y-0.5` via CSS custom properties; inline style would override the hover translate |
| **`w-full` on `<a>`** | Makes explicit that the card spans the full column width; not implicit from block formatting |
| **Card width = column width** | Layout.astro `<main class="mx-auto max-w-column px-gutter">` constrains to 54rem — no extra `max-w-*` on the card |
| **`mt-4` before CTA** | Slightly more breathing room above the CTA improves hierarchy; previous `mt-3` was tight |
| **`pb-6` bottom padding** | Gives the "The Menu" heading below breathing room |
| **Programme names `aria-hidden="true"`** | Decorative label; screen readers skip it |
| **No `<style>` block** | Zero custom CSS needed |
| **`data-reveal` entrance** | Reuses Layout.astro's IntersectionObserver — no new JS |
| **No `aria-label` on `<a>`** | Visible text is a complete, descriptive accessible label |
| **No marquee, pulse, arrow animation** | Continuous motion at the top of a menu page competes with the primary purpose |
| **WashiTape in maroon** | Amber tape is used at the bottom for book donation; maroon = theatre/performance colour |
| **Bengali `মঞ্চ`** (stage) | Every major section uses Bengali; "মঞ্চ" = stage, thematically exact; hidden on mobile |

---

## Accessibility Notes

- **Programme names line** — `aria-hidden="true"` (decorative metadata, WCAG contrast does not apply)
- **Meaningful text contrast** — `text-tea-200/70` body, `text-cream` CTA, `text-tea-400/60` label all have substantially higher contrast on `bg-tea-800`
- **Focus ring** — `focus-visible:outline-tea-300` on the `<a>`
- **Screen reader link label** — visible text within the `<a>` forms a complete description; programme names and Bengali accent are `aria-hidden="true"`

---

## What Stays Unchanged

- All menu category sections, prices, MenuFilter — untouched
- Book donation callout at the bottom — untouched
- `<header>` "The Menu" heading — untouched
- `WashiTape` import in frontmatter — already present, reused
- `Layout.astro` — no changes
- `global.css` — no additions

---

## Files Changed: 1

| File | Change |
|---|---|
| `src/pages/menu.astro` | Add events strip (~25 lines) before `<header>`. No `<style>` block. No other edits. |

---

## Verification Checklist

1. **`npm run build`** — 0 errors, 0 TypeScript errors.
2. **`npm run dev` → `/menu`** — dark ink strip appears above "The Menu" heading with correct top padding from the nav.
3. **Card width** — strip is the same width as the menu sections below it; matches `max-w-column` from Layout.
4. **Rotation** — card tilts at `-0.5deg`; WashiTape tilts with it (no misalignment). Visually verify `left-6` tape position looks correct after rotation.
5. **Hover — rotation preserved** — on hover, the card lifts AND stays rotated at `-0.5deg`. If it snaps flat, check for a stray `style` attribute on `<a>`.
6. **Entrance animation** — on page load, strip fades up. Refresh to verify.
7. **Hover effects** — border lightens, shadow deepens, CTA headline brightens. Cursor is pointer.
8. **Click → /events** — clicking anywhere on the card navigates to events page.
9. **Keyboard** — Tab focuses the link; focus ring (`outline-tea-300`) visible; Enter navigates.
10. **Mobile (≤640px)** — Bengali `মঞ্চ` hidden; all text readable; no overflow.
11. **Spacing** — `pb-6` gives clear separation between strip and "The Menu" heading below.
12. **Reduced motion** — devtools `prefers-reduced-motion: reduce` → entrance skips; hover transitions remain.
13. **Cross-browser** — verify in Chrome and Safari on both desktop and a narrow mobile viewport.

---

## Out of Scope

- Connecting body copy or programme names to live Sheet data — static copy only.
- Adding event thumbnails or a preview card — would require a React island.
- Modifying the nav Events link — already correct.
- A similar strip on other pages — not requested.
