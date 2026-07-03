// Segment (c) — The Third Space: the black box theatre venue available for rental.
// Fully static — no Sheet dependency.

import { motion } from 'framer-motion';

const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0 },
};

const venueUses = [
  'Performances',
  'Workshops',
  'Rehearsals',
  'Seminars',
  'Screenings',
  'Creative events',
];

const welcomeGroups = [
  'Theatre groups',
  'Schools & colleges',
  'NGOs',
  'Cultural organisations',
  'Independent artists',
  'Institutions',
];

export default function ThirdSpace({ onBack }) {
  return (
    <section className="relative overflow-hidden bg-[#3B2418] px-5 py-24 text-[#F5F0E6] sm:px-8 lg:py-32">
      <div className="pointer-events-none absolute inset-0 bg-paper opacity-[0.05] mix-blend-screen" aria-hidden="true" />

      {/* Decorative rule — playbill style */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-[#C9A87A]/30 to-transparent" aria-hidden="true" />

      <div className="relative mx-auto max-w-6xl">
        {onBack && (
          <div className="mb-10">
            <button
              type="button"
              onClick={onBack}
              className="font-typewriter text-[9px] uppercase tracking-[0.38em] text-[#F5F0E6]/40 hover:text-[#F5F0E6]/70"
            >
              ← back to events
            </button>
          </div>
        )}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.9 }}
        >
          <p className="font-bn text-3xl text-[#C9A87A]/60">তৃতীয় স্থান</p>
          <p className="mt-0.5 font-hand text-2xl leading-none text-[#C9A87A] sm:text-3xl">
            A space that holds many things
          </p>
          <h2 className="mt-4 font-serif text-5xl font-medium leading-tight text-[#F5F0E6] sm:text-6xl">
            The Third Space.
          </h2>
        </motion.div>

        <div className="mt-12 grid gap-10 lg:grid-cols-2 lg:gap-16">
          {/* Description */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.9, delay: 0.1 }}
            className="space-y-5 font-body text-lg leading-8 text-[#F5F0E6]/75"
          >
            <p>
              Our Black Box Theatre Space is a flexible venue for performances, workshops,
              rehearsals, seminars, screenings, and other creative events.
            </p>
            <p>
              Available for rental, the space welcomes theatre groups, schools, NGOs, cultural
              organisations, institutions, and independent artists for artistic, educational, and
              community programmes.
            </p>
            <p>
              Whether you're planning a performance, workshop, rehearsal, or cultural gathering,
              our space offers an intimate and inspiring environment for your event.
            </p>

            <a
              href="mailto:hello@artteastreecafe.com"
              className="mt-4 inline-flex items-center gap-2 font-typewriter text-[10px] uppercase tracking-[0.32em] text-[#C9A87A] underline underline-offset-4 hover:text-[#F5F0E6]"
            >
              Enquire about the space ↗
            </a>
          </motion.div>

          {/* Two tag clouds — venue uses + welcome groups */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.9, delay: 0.2 }}
            className="space-y-8"
          >
            <div>
              <p className="font-typewriter text-[9px] uppercase tracking-[0.38em] text-[#F5F0E6]/40">
                The space is suited for
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {venueUses.map((use) => (
                  <span
                    key={use}
                    className="border border-[#C9A87A]/35 px-3 py-1 font-body text-sm text-[#F5F0E6]/75"
                  >
                    {use}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <p className="font-typewriter text-[9px] uppercase tracking-[0.38em] text-[#F5F0E6]/40">
                We welcome
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {welcomeGroups.map((group) => (
                  <span
                    key={group}
                    className="border border-[#F5F0E6]/20 px-3 py-1 font-body text-sm text-[#F5F0E6]/65"
                  >
                    {group}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
