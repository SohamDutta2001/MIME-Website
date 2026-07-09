// Segment (b) — First Stage: the children's theatre wing of National Mime Institute.
// Fully static — no Sheet dependency.

import { motion } from 'framer-motion';
import { WashiTape } from '../Scraps.jsx';
import { firstStagePhotos } from '../../../data/gallery.ts';
import { cldImg } from '../../../lib/img.js';

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
              className="font-typewriter text-sm uppercase tracking-[0.38em] text-[#F5F0E6]/80 hover:text-[#F5F0E6] transition-colors px-3 py-2"
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
                href="mailto:Art.teas.tree.cafe@gmail.com"
                className="inline-block font-typewriter text-[9px] uppercase tracking-[0.3em] text-[#C9A87A] underline underline-offset-4 hover:text-[#F5F0E6]"
              >
                Art.teas.tree.cafe@gmail.com
              </a>
            </div>
          </motion.div>
        </motion.div>

        {/* Photo strip — pinned documentary cards from the studio */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.9, delay: 0.2 }}
          className="mt-16"
        >
          <p className="font-typewriter text-[9px] uppercase tracking-[0.4em] text-[#C9A87A]/45">
            from the studio · in pictures
          </p>
          <div
            className="mt-6 flex gap-5 overflow-x-auto pb-6 sm:gap-6"
            style={{ touchAction: 'pan-x' }}
            tabIndex={0}
            role="region"
            aria-label="First Stage photo gallery"
          >
            {firstStagePhotos.map((photo, i) => {
              const tilts = [-1.2, 0.8, -1.5, 1.0, -0.7, 1.3];
              const tapeColors = ['#C9A87A', '#5A6B3E', '#C9A87A', '#5A6B3E', '#C9A87A', '#5A6B3E'];
              return (
                <div
                  key={photo.src}
                  className="group relative shrink-0 w-[260px] sm:w-[300px]"
                  style={{ transform: `rotate(${tilts[i % tilts.length]}deg)` }}
                >
                  <WashiTape
                    className="-top-3 left-1/2 -translate-x-1/2"
                    color={tapeColors[i % tapeColors.length]}
                    width={80}
                    rotate={i % 2 ? 2 : -2}
                  />
                  <div className="relative aspect-[3/2] overflow-hidden border border-[#C9A87A]/20 bg-[#1C1208]">
                    <img
                      src={cldImg(photo.src)}
                      alt={photo.alt}
                      width={800}
                      height={533}
                      loading="lazy"
                      decoding="async"
                      fetchpriority="low"
                      className="h-full w-full object-cover sepia-[0.45] transition-all duration-700 ease-ink group-hover:scale-[1.04] group-hover:sepia-0"
                    />
                  </div>
                  {photo.caption && (
                    <p className="mt-2 truncate font-typewriter text-[9px] uppercase tracking-[0.3em] text-[#C9A87A]/55">
                      {photo.caption}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
