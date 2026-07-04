// One playbill-style event card for the notice board. Looks like a small theatre
// poster pinned to the wall. `variant` themes it light (café) or dark (Third Space).

import { useCallback, useRef } from 'react';
import { Clock, MapPin } from 'lucide-react';
import { WashiTape } from '../Scraps.jsx';
import { assetPath } from '../../../lib/img.js';
import { resolveEventImage } from '../../../lib/events/images.js';
import { formatEventDate } from '../../../lib/events/utils.js';

// A poster this close to the viewport edge should grow *inward* instead of off the
// side, so the expanded card is never clipped by the carousel's overflow-hidden.
const EDGE_THRESHOLD_PX = 24;

// Rubber-stamp ink per category — deep inks for the light card.
const CATEGORY_INK = {
  Performance: '#6B2D2D',
  Workshop: '#5A6B3E',
  Exhibition: '#7A4A2A',
};

// Chalky, lifted inks for the dark card so stamps read like chalk on a green-room
// board rather than muddy badges.
const CATEGORY_INK_DARK = {
  Performance: '#D89B8F',
  Workshop: '#9CAE7B',
  Exhibition: '#D6B98C',
};

const CATEGORY_BN = {
  Performance: 'পরিবেশনা',
  Workshop: 'কর্মশালা',
  Exhibition: 'প্রদর্শনী',
};

const CARD_THEME = {
  light: {
    surface: 'border-[#5E3820]/25 bg-[#F5F0E6]',
    restShadow: 'shadow-polaroid',
    hoverShadow:
      'hover:shadow-[0_22px_44px_-16px_rgba(28,20,16,0.5)] focus-visible:shadow-[0_22px_44px_-16px_rgba(28,20,16,0.5)]',
    ring: 'focus-visible:ring-[#7A4A2A]/50 focus-visible:ring-offset-[#EDE2CB]',
    innerRule: 'border-[#5E3820]/15',
    bannerBorder: 'border-[#5E3820]/20',
    dateText: 'text-[#7A4A2A]',
    title: 'text-[#1C1410]',
    meta: 'text-[#3B2418]/75',
    metaIcon: 'text-[#7A4A2A]',
    nudge: 'text-[#6B2D2D] group-hover:text-[#8B4040]',
    ink: CATEGORY_INK,
    stampBg: 'rgba(245,240,230,0.82)',
  },
  dark: {
    surface: 'border-[#C9A87A]/25 bg-[#2A1A10]',
    // Rest + hover shadows go near-black so the lift reads on the dark panel.
    restShadow: 'shadow-[0_10px_30px_-12px_rgba(0,0,0,0.7)]',
    hoverShadow:
      'hover:shadow-[0_26px_50px_-14px_rgba(0,0,0,0.75)] focus-visible:shadow-[0_26px_50px_-14px_rgba(0,0,0,0.75)]',
    ring: 'focus-visible:ring-[#C9A87A]/70 focus-visible:ring-offset-[#3B2418]',
    innerRule: 'border-[#C9A87A]/15',
    bannerBorder: 'border-[#C9A87A]/20',
    dateText: 'text-[#C9A87A]',
    title: 'text-[#F5F0E6]',
    meta: 'text-[#F5F0E6]/70',
    metaIcon: 'text-[#C9A87A]',
    nudge: 'text-[#C9A87A] group-hover:text-[#F5F0E6]',
    ink: CATEGORY_INK_DARK,
    stampBg: 'rgba(20,14,8,0.55)',
  },
};

export default function EventCard({ event, index, viewportRef, variant = 'light' }) {
  const theme = CARD_THEME[variant] ?? CARD_THEME.light;
  const ink = theme.ink[event.category] ?? theme.ink.Performance;
  // Alternate the pin-up tilt so the board reads hand-arranged, not printed.
  const tilt = [-1.4, 1.1, -0.7, 1.6][index % 4];
  const cardRef = useRef(null);

  // Before the poster is pulled forward, decide which way it should grow. Measured
  // once per hover/focus (ref-only, no React state) against the live viewport rect.
  const setOriginFromEdge = useCallback(() => {
    const el = cardRef.current;
    const viewport = viewportRef?.current;
    if (!el || !viewport) return;
    const card = el.getBoundingClientRect();
    const vp = viewport.getBoundingClientRect();
    let originX = 'center';
    if (card.left - vp.left < EDGE_THRESHOLD_PX) originX = 'left';
    else if (vp.right - card.right < EDGE_THRESHOLD_PX) originX = 'right';
    el.style.transformOrigin = `${originX} center`;
  }, [viewportRef]);

  return (
    <a
      ref={cardRef}
      href={assetPath(`/events/${event.slug}/`)}
      onMouseEnter={setOriginFromEdge}
      onFocus={setOriginFromEdge}
      style={{ '--rest-rotate': `${tilt}deg` }}
      className={`group relative block h-full border ${theme.surface} ${theme.restShadow} transition-[transform,box-shadow] duration-500 ease-ink [transform:rotate(var(--rest-rotate))] ${theme.hoverShadow} focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${theme.ring} motion-safe:hover:will-change-transform motion-safe:hover:[transform:rotate(0deg)_translateY(-10px)_scale(1.07)] motion-safe:focus-visible:will-change-transform motion-safe:focus-visible:[transform:rotate(0deg)_translateY(-10px)_scale(1.07)]`}
    >
      <WashiTape className="-top-3 left-1/2 -translate-x-1/2" rotate={index % 2 ? 2.5 : -3} width={96} />

      {/* Playbill inner rule */}
      <div className={`pointer-events-none absolute inset-2 z-10 border ${theme.innerRule}`} />

      {/* Banner photo — sepia at rest, colour breathes in on hover */}
      <div className={`relative aspect-[3/2] overflow-hidden border-b ${theme.bannerBorder} bg-[#1C1208]`}>
        {event.bannerUrl ? (
          <img
            src={resolveEventImage(event.bannerUrl, { width: 800 })}
            alt={event.title}
            loading="lazy"
            className="h-full w-full object-cover sepia-[0.45] transition-all duration-700 ease-ink group-hover:scale-[1.04] group-hover:sepia-0"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-[#3B2418]">
            <span className="font-bn text-4xl text-[#C9A87A]/40">{CATEGORY_BN[event.category] ?? 'অনুষ্ঠান'}</span>
          </div>
        )}

        {/* Category rubber stamp */}
        <div
          className="absolute right-3 top-3 border-2 px-2 py-1 font-typewriter text-[9px] uppercase tracking-[0.3em]"
          style={{
            color: ink,
            borderColor: ink,
            backgroundColor: theme.stampBg,
            transform: 'rotate(3deg)',
            opacity: 0.9,
          }}
        >
          {event.category}
        </div>
      </div>

      <div className="relative px-5 pb-6 pt-4">
        {/* Typewriter date line, like the corner of a playbill */}
        <p className={`font-typewriter text-[10px] uppercase tracking-[0.22em] ${theme.dateText}`}>
          {formatEventDate(event.date)}
        </p>

        <h3 className={`mt-2 font-serif text-2xl font-medium leading-snug ${theme.title}`}>
          {event.title}
        </h3>

        <div className={`mt-3 space-y-1 font-body text-sm ${theme.meta}`}>
          {event.time && (
            <p className="flex items-center gap-2">
              <Clock size={13} className={`shrink-0 ${theme.metaIcon}`} /> {event.time}
            </p>
          )}
          {event.venue && (
            <p className="flex items-center gap-2">
              <MapPin size={13} className={`shrink-0 ${theme.metaIcon}`} /> {event.venue}
            </p>
          )}
        </div>

        {/* Hand-written nudge */}
        <p className={`mt-4 font-hand text-lg transition-colors ${theme.nudge}`}>
          the full story <span aria-hidden="true">↦</span>
        </p>
      </div>
    </a>
  );
}
