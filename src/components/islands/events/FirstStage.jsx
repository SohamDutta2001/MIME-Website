// Segment (b) — First Stage: the children's theatre wing of National Mime Institute.
// Fully static — no Sheet dependency.

import { motion } from 'framer-motion';

const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0 },
};

export default function FirstStage({ onBack }) {
  return (
    <section className="relative overflow-hidden bg-[#1C1208] px-5 py-24 text-[#F5F0E6] sm:px-8 lg:py-32">
      {/* Subtle paper texture overlay */}
      <div className="pointer-events-none absolute inset-0 bg-paper opacity-[0.04] mix-blend-screen" aria-hidden="true" />

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
          className="grid gap-12 lg:grid-cols-[1fr_380px] lg:gap-20 lg:items-start"
        >
          {/* Left — copy */}
          <div>
            <p className="font-bn text-3xl text-[#C9A87A]/60">প্রথম মঞ্চ</p>
            <p className="mt-0.5 font-hand text-2xl leading-none text-[#C9A87A] sm:text-3xl">
              Children's Theatre Wing
            </p>
            <h2 className="mt-4 font-serif text-5xl font-medium leading-tight text-[#F5F0E6] sm:text-6xl">
              First Stage.
            </h2>

            <div className="mt-8 space-y-5 font-body text-lg leading-8 text-[#F5F0E6]/75">
              <p>
                First Stage is the children's theatre wing of National Mime Institute, offering
                theatre training for children aged 6–14 years.
              </p>
              <p>
                Through acting, body movement, mime, art&nbsp;&amp;&nbsp;craft, stage design,
                puppetry, music, rhythm, and creative expression, children develop confidence,
                imagination, teamwork, and artistic sensibility in a joyful,
                process-based learning environment.
              </p>
              <p>
                Every year, First Stage presents its Annual Theatre Showcase during the Durga Puja
                season, celebrating each child's creative journey and growth through performance.
              </p>
            </div>
          </div>

          {/* Right — details card */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.9, delay: 0.15 }}
            className="border border-[#C9A87A]/25 px-7 py-8"
            style={{ transform: 'rotate(-0.6deg)' }}
          >
            <p className="font-typewriter text-[9px] uppercase tracking-[0.42em] text-[#C9A87A]/55">
              Schedule &amp; details
            </p>

            <dl className="mt-6 space-y-5">
              <div className="border-b border-dashed border-[#F5F0E6]/15 pb-4">
                <dt className="font-typewriter text-[9px] uppercase tracking-[0.3em] text-[#F5F0E6]/40">
                  Age group
                </dt>
                <dd className="mt-1 font-body text-base text-[#F5F0E6]/85">6 – 14 years</dd>
              </div>
              <div className="border-b border-dashed border-[#F5F0E6]/15 pb-4">
                <dt className="font-typewriter text-[9px] uppercase tracking-[0.3em] text-[#F5F0E6]/40">
                  Classes
                </dt>
                <dd className="mt-1 font-body text-base text-[#F5F0E6]/85">
                  Every Saturday · 5:00 PM – 7:00 PM
                </dd>
              </div>
              <div className="border-b border-dashed border-[#F5F0E6]/15 pb-4">
                <dt className="font-typewriter text-[9px] uppercase tracking-[0.3em] text-[#F5F0E6]/40">
                  Venue
                </dt>
                <dd className="mt-1 font-body text-base text-[#F5F0E6]/85">
                  National Mime Institute
                </dd>
              </div>
              <div className="border-b border-dashed border-[#F5F0E6]/15 pb-4">
                <dt className="font-typewriter text-[9px] uppercase tracking-[0.3em] text-[#F5F0E6]/40">
                  Annual showcase
                </dt>
                <dd className="mt-1 font-body text-base text-[#F5F0E6]/85">
                  Durga Puja season · every year
                </dd>
              </div>
            </dl>

            <div className="mt-7 space-y-2">
              <p className="font-hand text-lg text-[#C9A87A]">Walk-ins welcome.</p>
              <p className="font-body text-sm text-[#F5F0E6]/55">
                Questions? Come by during class hours or write to us:
              </p>
              <a
                href="mailto:hello@artteastreecafe.com"
                className="inline-block font-typewriter text-[9px] uppercase tracking-[0.3em] text-[#C9A87A] underline underline-offset-4 hover:text-[#F5F0E6]"
              >
                hello@artteastreecafe.com
              </a>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
