# Events Board — Hover-Pause + Card Expansion

Implementation record for the "pull a poster forward" interaction on the homepage
**Events board** (`#events`).

## Summary

The Events board renders upcoming events as playbill-style posters in a horizontal
carousel. This feature:

1. Replaces the old "snap one card every 3 seconds" auto-advance with a **continuous
   smooth marquee** that loops seamlessly.
2. **Pauses** the marquee when the visitor hovers or keyboard-focuses anywhere in the
   board, and **resumes** ~1.2s after they leave.
3. **Expands** the hovered/focused poster — it scales up, lifts, un-tilts, and gains a
   deeper shadow, so it reads like a physical poster pulled off the wall for a closer
   look. Same content, just more prominent.
4. Does all of this with **zero layout shift** — neighbours never move.

Mobile is intentionally unchanged: a tap navigates straight to the event page (no
expansion state). Expansion is a pointer/keyboard affordance only.

## Design decisions

| Decision | Choice | Why |
| --- | --- | --- |
| Scroll style | Continuous marquee via `embla-carousel-auto-scroll` | Constant-speed glide that loops seamlessly; the plugin handles the loop seam, momentum, and tab-visibility for us instead of a hand-rolled `requestAnimationFrame`. |
| Mobile interaction | Tap = navigate directly (no expand) | The expanded state reveals no new content, so a "tap to expand, tap again to open" model would add friction for zero payoff. Direct navigation is the fastest path to the actual goal. This also let us delete all touch-interaction state. |
| Expansion trigger | Pure CSS `:hover` / `:focus-visible` | No React state, no re-renders during mouse movement — scales cleanly to 20–50 cards. |
| Pause ownership | Carousel level, not per-card | Hovering anywhere in the board pauses once; moving between cards causes no pause/resume churn or flicker. |
| Animation properties | `transform`, `box-shadow`, `opacity` only | Composited, 60fps, zero layout shift. No width/height/margin/flex changes. |
| Edge clipping | Adaptive `transform-origin` (grow inward) | Edge posters scale toward the centre so they're never clipped by the viewport's `overflow-hidden`. |

## Tech stack touched

Astro 4 + React islands + Tailwind 3 + Embla carousel + Framer Motion. Only the two
React island files for the events board changed, plus one new dependency.

## Files changed

### 1. `package.json`

Added the official, version-matched Embla plugin:

```
embla-carousel-auto-scroll@^8   (resolves to 8.6.0, matches embla-carousel-react 8.6.0)
```

Install: `npm i embla-carousel-auto-scroll`

### 2. `src/components/islands/events/EventsCarousel.jsx`

Owns the marquee engine and all pause/resume logic.

- **Marquee plugin.** Created an `AutoScroll` plugin instance in a `useRef` (stable
  identity) and passed it to `useEmblaCarousel({ loop: true, align: 'start' }, [autoScroll.current])`.
  Options: `playOnInit: false`, `speed: 1.2`, `startDelay: 0`, and crucially
  `stopOnInteraction: false`, `stopOnMouseEnter: false`, `stopOnFocusIn: false` — we
  drive every stop/play ourselves so we control the resume delay.
- **Manual control.** `getAutoScroll()` reads `emblaApi.plugins().autoScroll`.
  - `pause()` clears any pending resume timer and calls `autoScroll.stop()`.
  - `scheduleResume()` clears the timer, then `setTimeout(RESUME_DELAY_MS = 1200)` →
    resumes only if not still hovering.
- **Start on mount.** An effect calls `play()` once Embla is ready, unless
  `matchMedia('(prefers-reduced-motion: reduce)')` matches (then the board stays still
  and only the arrows move it). The effect's cleanup clears the resume timer.
- **Carousel-level pause wiring.** The viewport wrapper gets
  `onMouseEnter` (set `hoveringRef`, `pause()`), `onMouseLeave` (clear `hoveringRef`,
  `scheduleResume()`), `onFocusCapture` (`pause()`), and `onBlurCapture` (resume only
  when focus actually left the viewport, checked via `currentTarget.contains(relatedTarget)`).
- **Removed** the old `setInterval` auto-advance and the `canPrev`/`canNext` +
  `onSelect` arrow-gating (with `loop: true` both directions are always available).
  Arrows now call `handleArrow()`, which nudges then schedules a resume so manual nav
  doesn't fight the marquee.
- **Shared viewport ref.** A combined ref callback (`setViewportRef`) stores the
  viewport DOM node and forwards it to Embla's own ref, so cards can measure their
  distance to the edges. Passed to each `EventCard` as `viewportRef`.
- **z-lift on the slide wrapper.** The flex-child wrapper (the real sibling) got
  `relative z-0 hover:z-30 focus-within:z-30`, so the expanded poster stacks above its
  neighbours despite the Framer `motion.div` wrappers.
- **Vertical breathing room.** The viewport padding went from `pb-2 pt-4` to
  `pb-7 pt-6` (and `mt-14` → `mt-12`) so a lifted, scaled poster isn't clipped at the
  top/bottom by `overflow-hidden`.

### 3. `src/components/islands/events/EventCard.jsx`

Presentational. Expansion visuals are CSS; only edge measurement uses a ref.

- **Tilt via CSS variable (the key fix).** The card previously set
  `style={{ transform: 'rotate(<tilt>deg)' }}` inline, which *overrode* any Tailwind
  hover transform (inline style wins). Changed to `style={{ '--rest-rotate': '<tilt>deg' }}`
  with a base class `[transform:rotate(var(--rest-rotate))]`, so the rest tilt and the
  expanded transform live in one cascade and compose correctly.
- **Expanded state (CSS only).** Added, gated behind `motion-safe:` so reduced-motion
  users are exempt:
  - `motion-safe:hover:[transform:rotate(0deg)_translateY(-10px)_scale(1.07)]`
  - `motion-safe:focus-visible:[transform:...]` (same)
  - deeper shadow on `hover`/`focus-visible`
  - `motion-safe:*:will-change-transform` only while interacting (no permanent layers)
  - an on-brand focus ring (`focus-visible:ring-2 ring-[#7A4A2A]/50 ...`) so keyboard
    focus is visible even when motion is reduced.
  - transition widened from `transition-transform` to `transition-[transform,box-shadow]`.
- **Adaptive transform-origin (edge handling).** New `setOriginFromEdge` runs on
  `onMouseEnter`/`onFocus` (ref-only, no React state): it measures the card's
  `getBoundingClientRect()` against the live viewport rect and sets
  `transform-origin` to `left center` / `right center` / `center center` when the card
  is within `EDGE_THRESHOLD_PX` (24px) of the left/right edge. Edge posters therefore
  grow **inward** and stay fully visible. The marquee is already paused by the time
  this runs, so the card is stationary when measured.
- New prop: `viewportRef`. The card remains a plain `<a href="/events/{slug}/">` — no
  tap interception, no `data-active`.

## Interaction flows

**Desktop / keyboard**
1. Pointer or focus enters the viewport → carousel `pause()`.
2. Pointer/focus on a card → card sets its `transform-origin`; CSS applies the expand.
   Only one card is hovered/focused at a time, so single-expansion is automatic.
3. Moving between cards keeps the viewport-level pause on → no flicker, no churn.
4. Pointer/focus leaves the viewport → `scheduleResume()` (~1.2s) → marquee resumes.

**Mobile**
- Tap → browser navigates to the event page. Swipe → native Embla drag (auto-scroll
  resumes after). No expansion, no JS interception.

**Reduced motion**
- No auto-play, no scale/lift; the focus ring + shadow still give an affordance, and
  the arrows still navigate.

## Accessibility

- Cards are focusable `<a>` elements; `:focus-visible` mirrors hover, and the
  viewport's `onFocusCapture`/`onBlurCapture` give keyboard users the same pause/resume.
- `prefers-reduced-motion` is honoured for both the marquee and the expansion.
- Auto-moving content is pausable on hover/focus and always navigable via arrows
  (WCAG 2.2.2).

## Performance

- Only `transform` / `box-shadow` / `opacity` animate → composited, no layout shift.
- Hover/focus expansion is CSS-only → no re-renders on mouse movement.
- `will-change-transform` applied only while interacting.
- `transform-origin` measured once per enter/focus, never on scroll frames.

## How to run / verify

```bash
npm run dev        # Astro dev server; uses src/data/events.json as-is (no content sync)
```

Open the printed URL (usually http://localhost:4321/, or the next free port) and scroll
to the Events board.

Checks:
- **Hover** a poster → marquee pauses, card scales + lifts + shadows; leave → resumes after ~1.2s.
- **Tab** to a card → same pause + expand; **Enter** opens the event page.
- **Edge cards** grow inward and stay fully visible.
- **Mobile** (DevTools device toolbar): tap opens the event page directly.
- **Reduced motion** (OS setting): no glide, no scale; arrows still work.

Type/build check:

```bash
npx astro check        # type + template check
npx astro build        # production build (skips the network content-sync prebuild)
```

> Note: plain `npm run build` runs a `prebuild` that syncs menu/events from Google
> Sheets and needs env vars; use `npx astro build` for a local build.

## Verification performed during implementation

Run live in a headless browser against the dev server:

- `astro check` and `astro build` passed; no console errors on load.
- Marquee glides at constant speed (container translateX stepped -685 → -741 → -799).
- Focus/hover paused it (translateX held at -187); leaving + blur resumed it
  (-187 → -226.6 after the delay).
- Hover expansion measured exactly `matrix(1.07, 0, 0, 1.07, 0, -10)` (scale 1.07,
  -10px lift, rotation 0).
- Adaptive origin confirmed: left-edge card origin `0px`, middle `181px` (centre),
  right-edge `362px` (full card width).
- Screenshot showed the expanded poster lifted above un-moved neighbours (zero layout
  shift).

## Notes / follow-ups

- `marquee speed` (`1.2`) and `RESUME_DELAY_MS` (`1200`) are the two knobs to tune the
  feel; both live at the top of `EventsCarousel.jsx`.
- Scale (`1.07`) and lift (`-10px`) live in the expanded-transform classes in
  `EventCard.jsx`.
- The board needs at least 2 events for arrows to show; the marquee needs enough
  slides to fill the viewport to loop visibly.
