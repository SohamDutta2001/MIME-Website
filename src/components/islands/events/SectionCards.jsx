import { motion } from 'framer-motion';

const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0 },
};

const CARDS = [
  {
    key: 'cafe',
    bn: 'অনুষ্ঠান',
    title: 'Café Events',
    teaser: 'Upcoming performances, workshops, and exhibitions at Art-Teas-Tree.',
    accent: '#6B2D2D',
    bg: '#F5EDD6',
    text: '#1C1410',
    sub: '#5E3820',
  },
  {
    key: 'first-stage',
    bn: 'প্রথম মঞ্চ',
    title: 'First Stage',
    teaser: "Children's theatre wing — ages 6–14, every Saturday.",
    accent: '#C9A87A',
    bg: '#1C1208',
    text: '#F5F0E6',
    sub: '#C9A87A',
  },
  {
    key: 'third-space',
    bn: 'তৃতীয় স্থান',
    title: 'The Third Space',
    teaser: 'Our black box venue, available for performances, workshops & more.',
    accent: '#C9A87A',
    bg: '#3B2418',
    text: '#F5F0E6',
    sub: '#C9A87A',
  },
  {
    key: 'our-roots',
    bn: 'আমাদের শিকড়',
    title: 'Our Roots',
    teaser: 'Theatre in the world — workshops, performances, community work.',
    accent: '#5A6B3E',
    bg: '#F5EDD6',
    text: '#1C1410',
    sub: '#5E3820',
  },
];

export default function SectionCards({ onSelect }) {
  return (
    <section id="events" className="bg-[#EDE2CB] px-5 py-20 sm:px-8 lg:py-28">
      <div className="mx-auto max-w-6xl">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.9 }}
          className="mb-14"
        >
          <p className="font-bn text-3xl text-[#5E3820]/60">অনুষ্ঠান ও কর্মশালা</p>
          <p className="mt-0.5 font-hand text-2xl leading-none text-[#7A4A2A] sm:text-3xl">
            Events &amp; Programmes
          </p>
          <h2 className="mt-4 font-serif text-5xl font-medium leading-tight text-[#1C1410] sm:text-6xl">
            What's on.
          </h2>
        </motion.div>

        <div className="grid gap-4 sm:grid-cols-2">
          {CARDS.map((card, i) => (
            <motion.button
              key={card.key}
              type="button"
              onClick={() => onSelect(card.key)}
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.7, delay: i * 0.08 }}
              whileHover={{ y: -4 }}
              className="group relative overflow-hidden border border-[#7A4A2A]/20 p-8 text-left transition-shadow hover:shadow-[0_14px_40px_rgba(28,18,8,0.18)]"
              style={{ backgroundColor: card.bg }}
            >
              <p className="font-bn text-2xl" style={{ color: card.sub + 'aa' }}>
                {card.bn}
              </p>
              <h3
                className="mt-1 font-serif text-3xl font-medium leading-tight sm:text-4xl"
                style={{ color: card.text }}
              >
                {card.title}
              </h3>
              <p
                className="mt-3 font-body text-base leading-7"
                style={{ color: card.sub }}
              >
                {card.teaser}
              </p>

              {/* Expand arrow */}
              <p
                className="mt-6 font-typewriter text-[9px] uppercase tracking-[0.38em] transition-transform duration-300 group-hover:translate-x-1"
                style={{ color: card.accent }}
              >
                Open →
              </p>

              {/* Accent bottom-left corner rule */}
              <div
                className="pointer-events-none absolute bottom-0 left-0 h-[3px] w-12 transition-all duration-500 group-hover:w-24"
                style={{ backgroundColor: card.accent }}
                aria-hidden="true"
              />
            </motion.button>
          ))}
        </div>
      </div>
    </section>
  );
}
