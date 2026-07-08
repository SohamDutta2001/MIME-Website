// Reusable events carousel — playbill cards in an Embla marquee that pauses on
// hover/focus and pulls the hovered poster forward. Driven by the `events` prop so
// it can back both the Café Events board (light) and The Third Space (dark).

import { useCallback, useEffect, useRef } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import AutoScroll from 'embla-carousel-auto-scroll';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import EventCard from './EventCard.jsx';

// How long the marquee waits after the pointer/focus leaves before it starts
// gliding again — long enough that a quick mouse-out doesn't restart it under you.
const RESUME_DELAY_MS = 1200;

// embla-carousel-auto-scroll's loop math throws ("Cannot read properties of
// undefined (reading 'seek')") when the slides don't add up to more than one
// viewport width — at our widest slide (31.5% + gap), that's anything under 4
// slides. Below this count we skip the plugin and loop mode entirely and fall
// back to a plain, arrow-driven (non-looping) strip — a still board reads fine
// when there are only a couple of posters anyway.
const MIN_SLIDES_FOR_AUTOSCROLL = 4;

const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0 },
};

const THEME = {
  light: {
    section: 'bg-[#EDE2CB] bg-paper',
    arrow:
      'border-[#7A4A2A]/35 bg-[#F5F0E6]/70 text-[#5E3820] hover:border-[#7A4A2A]/70 hover:bg-[#F5F0E6] disabled:hover:border-[#7A4A2A]/35',
    note: 'text-[#5E3820]/50',
    emptyBorder: 'border-[#7A4A2A]/40',
    emptyText: 'text-[#6B2D2D]',
    emptySub: 'text-[#5E3820]/60',
  },
  dark: {
    section: 'bg-[#3B2418]',
    arrow:
      'border-[#C9A87A]/40 bg-[#2A1A10]/60 text-[#F5F0E6] hover:border-[#C9A87A]/80 hover:bg-[#2A1A10] disabled:hover:border-[#C9A87A]/40',
    note: 'text-[#F5F0E6]/45',
    emptyBorder: 'border-[#C9A87A]/30',
    emptyText: 'text-[#C9A87A]',
    emptySub: 'text-[#F5F0E6]/50',
  },
};

function ArrowButton({ onClick, disabled, direction, label, theme }) {
  const Icon = direction === 'prev' ? ChevronLeft : ChevronRight;
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      disabled={disabled}
      className={`grid place-content-center border p-2.5 transition-all disabled:cursor-default disabled:opacity-25 ${theme.arrow}`}
    >
      <Icon size={18} strokeWidth={1.5} />
    </button>
  );
}

export default function EventsCarousel({
  events,
  variant = 'light',
  showChrome = true,
  ariaLabel = 'Events',
}) {
  const theme = THEME[variant] ?? THEME.light;
  const canAutoScroll = events.length >= MIN_SLIDES_FOR_AUTOSCROLL;

  // Continuous marquee: a slow, constant glide that loops seamlessly. Started
  // manually (playOnInit:false) so it stays still until we know motion is allowed,
  // and so all stop/play is ours — the carousel owns pause, never the cards.
  const autoScroll = useRef(
    AutoScroll({
      playOnInit: false,
      speed: 1.2,
      startDelay: 0,
      stopOnInteraction: false,
      stopOnMouseEnter: false,
      stopOnFocusIn: false,
    }),
  );
  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: canAutoScroll, align: 'start' },
    canAutoScroll ? [autoScroll.current] : [],
  );

  // The viewport element, shared with cards so they can measure their distance to
  // the edges (for the inward expansion). Composed with Embla's own ref callback.
  const viewportRef = useRef(null);
  const setViewportRef = useCallback(
    (node) => {
      viewportRef.current = node;
      emblaRef(node);
    },
    [emblaRef],
  );

  const resumeTimerRef = useRef(null);
  const hoveringRef = useRef(false);
  const getAutoScroll = useCallback(() => emblaApi?.plugins()?.autoScroll, [emblaApi]);

  const pause = useCallback(() => {
    if (resumeTimerRef.current) {
      clearTimeout(resumeTimerRef.current);
      resumeTimerRef.current = null;
    }
    getAutoScroll()?.stop();
  }, [getAutoScroll]);

  const scheduleResume = useCallback(() => {
    if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
    resumeTimerRef.current = setTimeout(() => {
      resumeTimerRef.current = null;
      if (!hoveringRef.current) getAutoScroll()?.play();
    }, RESUME_DELAY_MS);
  }, [getAutoScroll]);

  // Start the glide once mounted — unless the visitor prefers reduced motion.
  useEffect(() => {
    if (!emblaApi) return undefined;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!reduce) getAutoScroll()?.play();
    return () => {
      if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
    };
  }, [emblaApi, getAutoScroll]);

  const onMouseEnter = useCallback(() => {
    hoveringRef.current = true;
    pause();
  }, [pause]);
  const onMouseLeave = useCallback(() => {
    hoveringRef.current = false;
    scheduleResume();
  }, [scheduleResume]);
  const onFocusCapture = useCallback(() => {
    pause();
  }, [pause]);
  const onBlurCapture = useCallback(
    (event) => {
      if (!event.currentTarget.contains(event.relatedTarget)) scheduleResume();
    },
    [scheduleResume],
  );

  const handleArrow = useCallback(
    (direction) => {
      pause();
      if (direction === 'prev') emblaApi?.scrollPrev();
      else emblaApi?.scrollNext();
      if (!hoveringRef.current) scheduleResume();
    },
    [emblaApi, pause, scheduleResume],
  );

  // The moving track + cards. Shared by both chrome and chrome-less layouts.
  const track = (
    <div
      className="overflow-hidden pb-7 pt-6"
      ref={setViewportRef}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onFocusCapture={onFocusCapture}
      onBlurCapture={onBlurCapture}
    >
      <div className="flex touch-pan-y gap-7">
        {events.map((event, i) => (
          <div
            key={event.slug}
            className="relative z-0 min-w-0 flex-[0_0_86%] hover:z-30 focus-within:z-30 sm:flex-[0_0_46%] lg:flex-[0_0_31.5%]"
          >
            <motion.div
              className="h-full"
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.8, delay: i * 0.12, ease: [0.22, 0.61, 0.36, 1] }}
            >
              <EventCard event={event} index={i} viewportRef={viewportRef} variant={variant} />
            </motion.div>
          </div>
        ))}
      </div>
    </div>
  );

  const arrows = events.length > 1 && (
    <div className="flex items-center gap-2">
      <ArrowButton direction="prev" label="Previous events" onClick={() => handleArrow('prev')} theme={theme} />
      <ArrowButton direction="next" label="More events" onClick={() => handleArrow('next')} theme={theme} />
    </div>
  );

  // Chrome-less (e.g. The Third Space): a bare, labelled region the host section wraps.
  if (!showChrome) {
    if (events.length === 0) return null;
    return (
      <div role="region" aria-roledescription="carousel" aria-label={ariaLabel}>
        {arrows && <div className="mb-6 flex justify-end">{arrows}</div>}
        {track}
      </div>
    );
  }

  // Full chrome (Café Events board): header + empty-state + arrows.
  return (
    <motion.section
      id="events"
      variants={fadeUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-100px' }}
      transition={{ duration: 1, ease: [0.22, 0.61, 0.36, 1] }}
      className={`relative overflow-hidden ${theme.section} px-5 py-24 sm:px-8 lg:py-28`}
      aria-roledescription="carousel"
      aria-labelledby="events-heading"
    >
      {/* Cork-board shadow strip along the top edge */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-10 bg-gradient-to-b from-[#5E3820]/12 to-transparent" aria-hidden="true" />

      <div className="relative mx-auto max-w-6xl">
        {/* Section header */}
        <div className="grid gap-6 sm:flex sm:items-end sm:justify-between">
          <div>
            <p className="font-bn text-3xl text-[#6B2D2D]/75">অনুষ্ঠান</p>
            <p className="mt-0.5 font-hand text-2xl leading-none text-[#5A6B3E] sm:text-3xl">
              Events · pinned to the board this season
            </p>
            <h2 id="events-heading" className="mt-3 font-serif text-5xl font-medium leading-tight text-[#1C1410] sm:text-6xl">
              Café events.
            </h2>
          </div>

          {arrows}
        </div>

        {events.length === 0 ? (
          /* Empty board — the café still talks to you */
          <div className={`mt-14 border border-dashed ${theme.emptyBorder} px-8 py-16 text-center`}>
            <p className={`font-hand text-3xl ${theme.emptyText}`}>
              এখন কিছু নেই — the board is bare, the kettle is not.
            </p>
            <p className={`mt-4 font-typewriter text-[10px] uppercase tracking-[0.35em] ${theme.emptySub}`}>
              new performances · workshops · exhibitions appear here
            </p>
          </div>
        ) : (
          <div className="mt-12">{track}</div>
        )}

        {/* Margin note */}
        <p className={`mt-10 font-typewriter text-[9px] uppercase tracking-[0.4em] ${theme.note}`}>
          drag the posters · every event ends with tea
        </p>
      </div>
    </motion.section>
  );
}
