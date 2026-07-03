import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import SectionCards from './SectionCards.jsx';
import CafeEvents from './CafeEvents.jsx';
import FirstStage from './FirstStage.jsx';
import ThirdSpace from './ThirdSpace.jsx';
import OurRoots from './OurRoots.jsx';

const PANELS = {
  cafe: CafeEvents,
  'first-stage': FirstStage,
  'third-space': ThirdSpace,
  'our-roots': OurRoots,
};

export default function EventsSection() {
  const [active, setActive] = useState(null);

  // Close on Escape
  useEffect(() => {
    if (!active) return;
    const onKey = (e) => { if (e.key === 'Escape') setActive(null); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [active]);

  const Panel = active ? PANELS[active] : null;

  return (
    <div>
      <AnimatePresence mode="wait">
        {!active ? (
          <motion.div
            key="cards"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <SectionCards onSelect={setActive} />
          </motion.div>
        ) : (
          <motion.div
            key={active}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Panel onBack={() => setActive(null)} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
