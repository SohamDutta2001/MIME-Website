// Segment (d) — Our Roots: what National Mime Institute does in the world.
// Static intro copy + an accordion of programmes sourced from Google Sheets
// (build-time JSON at src/data/instituteData.json).

import { motion } from 'framer-motion';
import programmes from '../../../data/instituteData.json';
import ProgrammeAccordion from './ProgrammeAccordion.jsx';

const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0 },
};

export default function OurRoots({ onBack }) {
  return (
    <section className="relative overflow-hidden bg-[#F5EDD6] bg-paper px-5 py-24 sm:px-8 lg:py-32">
      <div className="pointer-events-none absolute inset-0 bg-paper opacity-60 mix-blend-multiply" aria-hidden="true" />

      <div className="relative mx-auto max-w-6xl">
        {onBack && (
          <div className="mb-10">
            <button
              type="button"
              onClick={onBack}
              className="font-typewriter text-sm uppercase tracking-[0.38em] text-[#5E3820]/75 hover:text-[#5E3820] transition-colors px-3 py-2"
            >
              ← back to events
            </button>
          </div>
        )}
        {/* Header */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.9 }}
          className="grid gap-10 lg:grid-cols-2 lg:items-start lg:gap-16"
        >
          <div>
            <p className="font-bn text-3xl text-[#6B2D2D]/60">আমাদের শিকড়</p>
            <p className="mt-0.5 font-hand text-2xl leading-none text-[#5A6B3E] sm:text-3xl">
              Theatre in the world
            </p>
            <h2 className="mt-4 font-serif text-5xl font-medium leading-tight text-[#1C1410] sm:text-6xl">
              Our Roots.
            </h2>
          </div>

          <div className="self-center space-y-5 font-body text-lg leading-8 text-[#5E3820]/80">
            <p>
              We are theatre practitioners dedicated to creating meaningful artistic experiences
              through performance, education, and community engagement.
            </p>
            <p>
              Our team collaborates with schools, NGOs, communities, cultural organisations, and
              institutions, offering customised theatre workshops for different age groups and
              diverse learning environments — from one-day introductory sessions to
              production-oriented programmes designed to culminate in a live performance.
            </p>
            <p>
              Alongside our educational initiatives, we present a range of performances including
              non-verbal performances, mime skits, clown performances, physical theatre, and verbal
              theatre productions, tailored for festivals, educational institutions, community
              events, and cultural programmes.
            </p>
            <p>
              If you are looking to bring theatre into your organisation, school, or community, we
              would be delighted to collaborate and create an engaging, meaningful, and memorable
              artistic experience together.
            </p>
          </div>
        </motion.div>

        {/* Programme accordion */}
        {programmes.length > 0 && (
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.9, delay: 0.2 }}
            className="mt-16"
          >
            <p className="mb-6 font-typewriter text-[9px] uppercase tracking-[0.42em] text-[#5E3820]/50">
              What we do
            </p>
            <ProgrammeAccordion programmes={programmes} />
          </motion.div>
        )}

        {/* Contact CTA */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.9, delay: 0.3 }}
          className="mt-14 border-t border-dashed border-[#7A4A2A]/25 pt-10"
        >
          <p className="font-hand text-2xl text-[#3B2418]">
            Bring theatre to your community.
          </p>
          <a
            href="mailto:hello@artteastreecafe.com"
            className="mt-4 inline-flex items-center gap-2 font-typewriter text-[10px] uppercase tracking-[0.32em] text-[#6B2D2D] underline underline-offset-4 hover:text-[#3B2418]"
          >
            hello@artteastreecafe.com ↗
          </a>
        </motion.div>
      </div>
    </section>
  );
}
