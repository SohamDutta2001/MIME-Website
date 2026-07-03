// Accordion for Our Roots programme entries. Each row shows title + short
// description collapsed; clicking toggles full details open. Receives a
// `programmes` array prop — shape: { title, shortDesc, fullDesc, type? }.

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

export default function ProgrammeAccordion({ programmes = [] }) {
  const [openIndex, setOpenIndex] = useState(null);

  if (programmes.length === 0) {
    return (
      <div className="border border-dashed border-[#7A4A2A]/35 px-8 py-12 text-center">
        <p className="font-hand text-2xl text-[#6B2D2D]">
          More programmes — coming soon.
        </p>
        <p className="mt-3 font-typewriter text-[9px] uppercase tracking-[0.35em] text-[#5E3820]/50">
          write to us in the meantime
        </p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-[#7A4A2A]/20">
      {programmes.map((prog, i) => {
        const isOpen = openIndex === i;
        return (
          <div key={i}>
            <button
              type="button"
              onClick={() => setOpenIndex(isOpen ? null : i)}
              aria-expanded={isOpen}
              className="flex w-full items-start justify-between gap-4 py-6 text-left"
            >
              <div className="min-w-0">
                {prog.type && (
                  <p className="font-typewriter text-[9px] uppercase tracking-[0.3em] text-[#7A4A2A]/60">
                    {prog.type}
                  </p>
                )}
                <p className="mt-0.5 font-serif text-xl font-medium text-[#1C1410] sm:text-2xl">
                  {prog.title}
                </p>
                {!isOpen && prog.shortDesc && (
                  <p className="mt-1 line-clamp-1 font-body text-sm text-[#5E3820]/70">
                    {prog.shortDesc}
                  </p>
                )}
              </div>
              <motion.span
                animate={{ rotate: isOpen ? 180 : 0 }}
                transition={{ duration: 0.25, ease: [0.22, 0.61, 0.36, 1] }}
                className="mt-1 shrink-0 text-[#7A4A2A]"
                aria-hidden="true"
              >
                <ChevronDown size={20} strokeWidth={1.5} />
              </motion.span>
            </button>

            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  key="content"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.35, ease: [0.22, 0.61, 0.36, 1] }}
                  className="overflow-hidden"
                >
                  <p className="pb-8 font-body text-base leading-8 text-[#5E3820]/80">
                    {prog.fullDesc}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
