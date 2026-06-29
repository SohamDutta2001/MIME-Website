// One playbill-style event card for the homepage notice board. Looks like a
// small theatre poster pinned to the wall: washi tape, sepia photo, rubber
// category stamp, typewriter date line.

import { useCallback, useRef } from 'react';
import { Clock, MapPin } from 'lucide-react';
import { WashiTape } from '../Scraps.jsx';
import { assetPath } from '../../../lib/img.js';
import { resolveEventImage } from '../../../lib/events/images.js';
import { formatEventDate } from '../../../lib/events/utils.js';

// A poster this close to the viewport edge should grow *inward* instead of off the
// side, so the expanded card is never clipped by the carousel's overflow-hidden.
const EDGE_THRESHOLD_PX = 24;

// Rubber-stamp ink per category — maroon for performances, moss for
// workshops, tea-brown for exhibitions. Matches the site palette.
const CATEGORY_INK = {
  Performance: '#6B2D2D',
  Workshop: '#5A6B3E',
  Exhibition: '#7A4A2A',
};

const CATEGORY_BN = {
  Performance: 'পরিবেশনা',
  Workshop: 'কর্মশালা',
  Exhibition: 'প্রদর্শনী',
};

export default function EventCard({ event, index, viewportRef }) {
  const ink = CATEGORY_INK[event.category] ?? '#6B2D2D';
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
      className="group relative block h-full border border-[#5E3820]/25 bg-[#F5F0E6] shadow-polaroid transition-[transform,box-shadow] duration-500 ease-ink [transform:rotate(var(--rest-rotate))] hover:shadow-[0_22px_44px_-16px_rgba(28,20,16,0.5)] focus-visible:shadow-[0_22px_44px_-16px_rgba(28,20,16,0.5)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7A4A2A]/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#EDE2CB] motion-safe:hover:will-change-transform motion-safe:hover:[transform:rotate(0deg)_translateY(-10px)_scale(1.07)] motion-safe:focus-visible:will-change-transform motion-safe:focus-visible:[transform:rotate(0deg)_translateY(-10px)_scale(1.07)]"
    >
      <WashiTape className="-top-3 left-1/2 -translate-x-1/2" rotate={index % 2 ? 2.5 : -3} width={96} />

      {/* Playbill inner rule */}
      <div className="pointer-events-none absolute inset-2 z-10 border border-[#5E3820]/15" />

      {/* Banner photo — sepia at rest, colour breathes in on hover */}
      <div className="relative aspect-[3/2] overflow-hidden border-b border-[#5E3820]/20 bg-[#1C1208]">
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
            backgroundColor: 'rgba(245,240,230,0.82)',
            transform: 'rotate(3deg)',
            opacity: 0.9,
          }}
        >
          {event.category}
        </div>
      </div>

      <div className="relative px-5 pb-6 pt-4">
        {/* Typewriter date line, like the corner of a playbill */}
        <p className="font-typewriter text-[10px] uppercase tracking-[0.22em] text-[#7A4A2A]">
          {formatEventDate(event.date)}
        </p>

        <h3 className="mt-2 font-serif text-2xl font-medium leading-snug text-[#1C1410]">
          {event.title}
        </h3>

        <div className="mt-3 space-y-1 font-body text-sm text-[#3B2418]/75">
          {event.time && (
            <p className="flex items-center gap-2">
              <Clock size={13} className="shrink-0 text-[#7A4A2A]" /> {event.time}
            </p>
          )}
          {event.venue && (
            <p className="flex items-center gap-2">
              <MapPin size={13} className="shrink-0 text-[#7A4A2A]" /> {event.venue}
            </p>
          )}
        </div>

        {/* Hand-written nudge */}
        <p className="mt-4 font-hand text-lg text-[#6B2D2D] transition-colors group-hover:text-[#8B4040]">
          the full story <span aria-hidden="true">↦</span>
        </p>
      </div>
    </a>
  );
}
