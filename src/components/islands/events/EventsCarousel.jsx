// Homepage events section — "the notice board". Upcoming events from the
// owner's sheet, rendered as playbill cards in an Embla carousel. With no
// upcoming events the board doesn't disappear: it leaves a handwritten note.

import { useCallback, useEffect, useState } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { upcomingEvents } from '../../../lib/events/events';
import EventCard from './EventCard.jsx';

const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0 },
};

function ArrowButton({ onClick, disabled, direction, label }) {
  const Icon = direction === 'prev' ? ChevronLeft : ChevronRight;
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      disabled={disabled}
      className="grid place-content-center border border-[#7A4A2A]/35 bg-[#F5F0E6]/70 p-2.5 text-[#5E3820] transition-all hover:border-[#7A4A2A]/70 hover:bg-[#F5F0E6] disabled:cursor-default disabled:opacity-25 disabled:hover:border-[#7A4A2A]/35"
    >
      <Icon size={18} strokeWidth={1.5} />
    </button>
  );
}

export default function EventsCarousel() {
  const [emblaRef, emblaApi] = useEmblaCarousel({ align: 'start', containScroll: 'trimSnaps' });
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);

  const onSelect = useCallback((api) => {
    setCanPrev(api.canScrollPrev());
    setCanNext(api.canScrollNext());
  }, []);

  useEffect(() => {
    if (!emblaApi) return undefined;
    onSelect(emblaApi);
    emblaApi.on('select', onSelect).on('reInit', onSelect);
    return () => {
      emblaApi.off('select', onSelect).off('reInit', onSelect);
    };
  }, [emblaApi, onSelect]);

  return (
    <motion.section
      id="events"
      variants={fadeUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-100px' }}
      transition={{ duration: 1, ease: [0.22, 0.61, 0.36, 1] }}
      className="relative overflow-hidden bg-[#EDE2CB] bg-paper px-5 py-24 sm:px-8 lg:py-28"
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
            <h2 className="mt-3 font-serif text-5xl font-medium leading-tight text-[#1C1410] sm:text-6xl">
              The notice board.
            </h2>
          </div>

          {upcomingEvents.length > 1 && (
            <div className="flex items-center gap-2">
              <ArrowButton direction="prev" label="Previous events" onClick={() => emblaApi?.scrollPrev()} disabled={!canPrev} />
              <ArrowButton direction="next" label="More events" onClick={() => emblaApi?.scrollNext()} disabled={!canNext} />
            </div>
          )}
        </div>

        {upcomingEvents.length === 0 ? (
          /* Empty board — the café still talks to you */
          <div className="mt-14 border border-dashed border-[#7A4A2A]/40 px-8 py-16 text-center">
            <p className="font-hand text-3xl text-[#6B2D2D]" style={{ transform: 'rotate(-1.5deg)' }}>
              এখন কিছু নেই — the board is bare, the kettle is not.
            </p>
            <p className="mt-4 font-typewriter text-[10px] uppercase tracking-[0.35em] text-[#5E3820]/60">
              new performances · workshops · exhibitions appear here
            </p>
          </div>
        ) : (
          <div className="mt-14 overflow-hidden pb-2 pt-4" ref={emblaRef}>
            <div className="flex touch-pan-y gap-7">
              {upcomingEvents.map((event, i) => (
                <div
                  key={event.slug}
                  className="min-w-0 flex-[0_0_86%] sm:flex-[0_0_46%] lg:flex-[0_0_31.5%]"
                >
                  {/* Posters settle onto the board one after another */}
                  <motion.div
                    className="h-full"
                    variants={fadeUp}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: '-60px' }}
                    transition={{ duration: 0.8, delay: i * 0.12, ease: [0.22, 0.61, 0.36, 1] }}
                  >
                    <EventCard event={event} index={i} />
                  </motion.div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Margin note */}
        <p className="mt-10 font-typewriter text-[9px] uppercase tracking-[0.4em] text-[#5E3820]/50">
          drag the posters · every event ends with tea
        </p>
      </div>
    </motion.section>
  );
}
