// Segment (a) of the Events section — the cafe's own upcoming events carousel
// plus a small static collaboration invite below it. EventsCarousel stays as a
// pure carousel; this wrapper owns the CTA strip.

import { motion } from 'framer-motion';
import EventsCarousel from './EventsCarousel.jsx';
import { cafeUpcomingEvents } from '../../../lib/events/events';

const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0 },
};

export default function CafeEvents({ onBack }) {
  return (
    <div>
      {onBack && (
        <div className="bg-[#EDE2CB] px-5 pt-6 sm:px-8">
          <div className="mx-auto max-w-6xl">
            <button
              type="button"
              onClick={onBack}
              className="font-typewriter text-sm uppercase tracking-[0.38em] text-[#5E3820]/75 hover:text-[#5E3820] transition-colors px-3 py-2"
            >
              ← back to events
            </button>
          </div>
        </div>
      )}
      <EventsCarousel events={cafeUpcomingEvents} variant="light" />

      {/* Collaboration invite — static strip that sits flush below the board */}
      <motion.div
        variants={fadeUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.9 }}
        className="bg-[#EDE2CB] bg-paper px-5 pb-16 sm:px-8"
      >
        <div className="mx-auto max-w-6xl border-t border-dashed border-[#7A4A2A]/30 pt-10">
          <p className="font-typewriter text-[9px] uppercase tracking-[0.42em] text-[#5E3820]/55">
            Bring your event to us
          </p>
          <p className="mt-3 font-hand text-2xl leading-snug text-[#3B2418] sm:text-3xl">
            Want to host something here?
          </p>
          <p className="mt-3 max-w-prose font-body text-base leading-7 text-[#5E3820]/80">
            We welcome performances, readings, screenings, and conversations that fit the spirit of
            this space — theatre, books, music, or just an interesting idea worth sharing.
          </p>
          <a
            href="mailto:Art.teas.tree.cafe@gmail.com"
            className="mt-6 inline-flex items-center gap-2 font-typewriter text-[10px] uppercase tracking-[0.32em] text-[#6B2D2D] underline underline-offset-4 hover:text-[#3B2418]"
          >
            Art.teas.tree.cafe@gmail.com ↗
          </a>
        </div>
      </motion.div>
    </div>
  );
}
