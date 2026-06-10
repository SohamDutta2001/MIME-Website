import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  BookOpen,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock,
  Coffee,
  MapPin,
  Sparkles,
  Theater,
} from 'lucide-react';
import menuRows from '../../data/mockMenuData.json';
import {
  WashiTape,
  CoffeeRing,
  InkCorrection,
  CoasterStamp,
  PencilUnderline,
} from './Scraps.jsx';
import { assetPath, cldImg } from '../../lib/img.js';
import EventsCarousel from './events/EventsCarousel.jsx';

// ─── constants ───────────────────────────────────────────────────────────────

// Menu categories are derived from the data at module load — that way the
// café owner can add a new category in the Sheet (say "Sweets" or
// "Cold Drinks") and the filter chip appears automatically, in the order
// it first appears in the sheet.
const CATEGORIES = ['All', ...Array.from(new Set(menuRows.map((r) => r.category)))];

// Bengali rendering of menu categories — used as the small caligraphic label
// above each grouped category section when viewing "All". Categories without
// a Bengali entry fall back to the English name (see CATEGORY_BN[cat] ?? cat).
const CATEGORY_BN = {
  Tea: 'চা',
  Coffee: 'কফি',
  'Quick Bites': 'টা',
  Sweets: 'মিষ্টি',
  'Cold Drinks': 'ঠাণ্ডা',
};

// When the visible item count crosses this, the menu body switches to an
// internal max-height scroll instead of growing the page indefinitely.
const MENU_SCROLL_THRESHOLD = 20;

// Hero carousel — the four café photos, in display order. Each entry is just
// a filename (matching what's in /public/cafe-assets/) plus alt text. The
// cldImg helper turns the filename into a Cloudinary CDN URL when
// CLOUDINARY_CLOUD_NAME is configured in src/lib/img.js, or falls back to
// the local file otherwise. To swap a photo, replace the file (or upload a
// new image to Cloudinary with public_id matching the filename minus ext).
const HERO_IMAGES = [
  {
    src: 'art-teas-tree-cafe-kolkata-coffee-shops-riqhhggeu0.webp',
    alt: 'Warm interior of Art-Teas-Tree Café, Kolkata',
  },
  {
    src: 'art-teas-tree-cafe-kolkata-coffee-shops-fzkrcnggvx.webp',
    alt: 'Books and tea on a wooden table at Art-Teas-Tree Café',
  },
  {
    src: 'art-teas-tree-cafe-kolkata-coffee-shops-h3gejc5rf6-250.jpg',
    alt: 'Bhar of tea steaming on the café counter',
  },
  {
    src: 'art-teas-tree-cafe-kolkata-coffee-shops-lxs22xc0rr-250.webp',
    alt: 'Soft light through the café in the late afternoon',
  },
];

// Auto-advance every 6 seconds — slow enough to feel like a film cut, not a
// slide carousel. Paused on hover and when the user clicks an arrow.
const HERO_AUTO_ADVANCE_MS = 6000;

// Book spines for the College Street shelf — inline to keep CafeApp self-contained
const SHELF_BOOKS = [
  { title: 'পথের পাঁচালী', author: 'বিভূতিভূষণ', color: '#7a4a2a', h: 228, w: 42 },
  { title: 'Gora', author: 'Tagore', color: '#3b2418', h: 248, w: 44 },
  { title: 'Chowringhee', author: 'Sankar', color: '#5e3820', h: 208, w: 38 },
  { title: 'The Hungry Tide', author: 'Ghosh', color: '#7a4a2a', h: 236, w: 40 },
  { title: 'আরণ্যক', author: 'বিভূতিভূষণ', color: '#5a6b3e', h: 218, w: 40 },
  { title: 'On Photography', author: 'Sontag', color: '#1c1410', h: 222, w: 38 },
  { title: 'Letters — Rilke', author: 'Rilke', color: '#a87b4a', h: 196, w: 36 },
  { title: 'The Lowland', author: 'Lahiri', color: '#3b2418', h: 214, w: 38 },
  { title: 'Charulata', author: 'Tagore', color: '#5e3820', h: 202, w: 36 },
  { title: 'My Days', author: 'Narayan', color: '#caa173', h: 192, w: 34 },
  { title: 'Em & the Big Hoom', author: 'Jerry Pinto', color: '#5a6b3e', h: 226, w: 40 },
  { title: 'Strange Address', author: 'Chaudhuri', color: '#6a4729', h: 210, w: 38 },
];

// Reel section — `src` is just a filename now; cldImg() resolves it to a
// Cloudinary URL when configured, or to /public/cafe-assets/ otherwise.
const REEL_FRAMES = [
  {
    id: 1,
    src: 'art-teas-tree-cafe-kolkata-coffee-shops-riqhhggeu0.webp',
    caption: 'The morning shift, before the doors swing open.',
    bn: 'সকালের চা',
    lens: '35mm · f/2.8 · ISO 400',
    timecode: '00:01:24:12',
    location: 'Bidhan Nagar · interior',
    note: 'hold the silence ↘',
  },
  {
    id: 2,
    src: 'art-teas-tree-cafe-kolkata-coffee-shops-fzkrcnggvx.webp',
    caption: 'Books, tea, a slow afternoon — the table forgets the time.',
    bn: 'বইপাড়ার বিকেল',
    lens: '50mm · f/1.8 · ISO 200',
    timecode: '00:14:08:22',
    location: 'reading corner',
    note: 'cut on the page turn',
  },
  {
    id: 3,
    src: 'art-teas-tree-cafe-kolkata-coffee-shops-h3gejc5rf6-250.jpg',
    caption: 'Steam rising from the bhar — a small public theatre.',
    bn: 'ভাঁড়ের ধোঁয়া',
    lens: '85mm · f/2.0 · ISO 800',
    timecode: '00:22:41:03',
    location: 'counter, eye-level',
    note: 'closer next take',
  },
  {
    id: 4,
    src: 'art-teas-tree-cafe-kolkata-coffee-shops-lxs22xc0rr-250.webp',
    caption: 'After the last conversation, before the lights go down.',
    bn: 'শেষ আলো',
    lens: '24mm · f/4 · ISO 1600',
    timecode: '00:46:55:18',
    location: 'closing hour',
    note: 'fade out — soft',
  },
];

// ─── animation variants ───────────────────────────────────────────────────────

const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0 },
};

// ─── sub-components ───────────────────────────────────────────────────────────

function SectionKicker({ children, className = '' }) {
  return (
    <p className={`font-hand text-2xl leading-none text-[#7A4A2A] sm:text-3xl ${className}`}>
      {children}
    </p>
  );
}

/** Ragged wave that simulates a torn paper edge between two sections */
function TornEdge({ fill = '#F5F0E6', flip = false }) {
  return (
    <div
      className="pointer-events-none w-full overflow-hidden leading-none"
      style={{ transform: flip ? 'scaleY(-1)' : undefined, marginBottom: '-1px' }}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 1440 38"
        preserveAspectRatio="none"
        className="block h-5 w-full sm:h-8"
        fill={fill}
      >
        <path d="M0,38 L0,20 C72,8 144,34 216,20 C288,6 360,28 432,16 C504,4 576,26 648,14 C720,2 792,30 864,18 C936,6 1008,26 1080,14 C1152,2 1224,28 1296,16 C1368,4 1404,22 1440,12 L1440,38 Z" />
      </svg>
    </div>
  );
}

// ─── Nav ─────────────────────────────────────────────────────────────────────

function Nav() {
  const links = [
    { href: '#philosophy', label: 'Philosophy' },
    { href: '#events', label: 'Events' },
    { href: '#reel', label: 'রিল' },
    { href: '#menu', label: 'Menu' },
    { href: '#books', label: 'বইপাড়া' },
  ];

  return (
    <header className="fixed inset-x-0 top-0 z-40 border-b border-[#5E3820]/15 bg-[#F5F0E6]/88 backdrop-blur-md">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-8">
        <a href="#home" className="flex flex-col leading-none">
          <span className="font-serif text-xl font-semibold text-[#1C1410] sm:text-2xl">
            Art-Teas-Tree
          </span>
          <span className="font-hand text-sm text-[#5A6B3E] sm:text-base">
            Mime Institute of Calcutta &mdash;{' '}
            <span className="font-bn">কলকাতা</span>
          </span>
        </a>

        <div className="hidden items-center gap-0.5 rounded-full border border-[#7A4A2A]/20 bg-[#EDE2CB]/65 px-2 py-1 md:flex">
          {links.map(({ href, label }) => (
            <a
              key={href}
              href={href}
              className="rounded-full px-4 py-2 text-sm text-[#3B2418] transition-colors hover:bg-[#7A4A2A]/10 font-body"
            >
              {label}
            </a>
          ))}
        </div>
      </nav>
    </header>
  );
}

// ─── Hero ─────────────────────────────────────────────────────────────────────

/**
 * HeroCarousel — cinematic cross-fade through the four café photos.
 * Auto-advances every HERO_AUTO_ADVANCE_MS milliseconds. Pauses on hover so
 * a reader isn't jolted while taking in the headline. Manual arrows + dot
 * indicators give explicit control. Honors prefers-reduced-motion by holding
 * on a single still frame (no auto-advance, no fade).
 */
function HeroCarousel() {
  const [index, setIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const reduceMotion = useRef(false);

  // Capture the reduced-motion preference once on mount.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    reduceMotion.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }, []);

  // Auto-advance timer. Pauses when the user is hovering, or when the OS
  // tells us not to animate. Cleared on unmount / dependency change.
  useEffect(() => {
    if (isPaused || reduceMotion.current) return undefined;
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % HERO_IMAGES.length);
    }, HERO_AUTO_ADVANCE_MS);
    return () => window.clearInterval(id);
  }, [isPaused]);

  const go = (delta) =>
    setIndex((i) => (i + delta + HERO_IMAGES.length) % HERO_IMAGES.length);

  const current = HERO_IMAGES[index];

  return (
    <div
      className="absolute inset-0"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Cross-fading image layer — old fades out while new fades in. */}
      <AnimatePresence initial={false} mode="sync">
        <motion.img
          key={current.src}
          src={cldImg(current.src, { width: 2400 })}
          alt={current.alt}
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.55 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2, ease: [0.22, 0.61, 0.36, 1] }}
          className="absolute inset-0 h-full w-full object-cover sepia"
        />
      </AnimatePresence>

      {/* Manual nav arrows — copper-tinted, sit on the inner playbill margin.
          Hidden on the smallest screens where the dot indicators are enough. */}
      <button
        type="button"
        aria-label="Previous photo"
        onClick={() => go(-1)}
        className="absolute left-3 top-1/2 z-20 hidden -translate-y-1/2 place-content-center border border-[#C9A87A]/25 bg-[#1C1208]/55 p-2 text-[#C9A87A]/70 backdrop-blur-sm transition-all hover:border-[#C9A87A]/65 hover:bg-[#1C1208]/80 hover:text-[#F5F0E6] sm:left-6 sm:grid sm:p-3"
      >
        <ChevronLeft size={20} strokeWidth={1.5} />
      </button>
      <button
        type="button"
        aria-label="Next photo"
        onClick={() => go(1)}
        className="absolute right-3 top-1/2 z-20 hidden -translate-y-1/2 place-content-center border border-[#C9A87A]/25 bg-[#1C1208]/55 p-2 text-[#C9A87A]/70 backdrop-blur-sm transition-all hover:border-[#C9A87A]/65 hover:bg-[#1C1208]/80 hover:text-[#F5F0E6] sm:right-6 sm:grid sm:p-3"
      >
        <ChevronRight size={20} strokeWidth={1.5} />
      </button>

      {/* Dot indicators — also direct-jump buttons. Active dot is a longer
          bar, copper-filled; inactive dots are short and faded. */}
      <div className="absolute bottom-20 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2 sm:bottom-24">
        {HERO_IMAGES.map((img, i) => {
          const isActive = i === index;
          return (
            <button
              key={img.src}
              type="button"
              aria-label={`Show photo ${i + 1} of ${HERO_IMAGES.length}`}
              aria-pressed={isActive}
              onClick={() => setIndex(i)}
              className={`h-[3px] rounded-none transition-all duration-500 ${
                isActive ? 'w-8 bg-[#C9A87A]' : 'w-4 bg-[#C9A87A]/30 hover:bg-[#C9A87A]/55'
              }`}
            />
          );
        })}
      </div>
    </div>
  );
}

function Hero() {
  return (
    <section id="home" className="relative min-h-screen overflow-hidden bg-[#1C1208]">
      {/* Auto-advancing photo carousel — replaces the previous single image */}
      <HeroCarousel />

      {/* Cinematic gradient — heavy left, soft right, bottom vignette */}
      <div className="absolute inset-0 bg-[linear-gradient(100deg,rgba(28,18,8,0.97)_0%,rgba(28,18,8,0.78)_48%,rgba(28,18,8,0.38)_100%)]" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#1C1208]/95 via-transparent to-[#1C1208]/50" />

      {/* Theatre playbill double-border frame */}
      <div className="pointer-events-none absolute inset-4 border border-[#C9A87A]/18 sm:inset-8" />
      <div className="pointer-events-none absolute inset-[1.65rem] border border-[#C9A87A]/8 sm:inset-[2.75rem]" />

      <motion.div
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        transition={{ duration: 1.3, ease: [0.22, 0.61, 0.36, 1] }}
        className="relative z-10 mx-auto flex min-h-screen max-w-7xl flex-col justify-end px-6 pb-24 pt-36 sm:px-10 lg:pb-32"
      >
        <div className="relative max-w-3xl">

          {/* Handwritten Bengali annotation — overlaps the heading, rotated.
              Pastel chalk treatment so it reads like aged pencil on the playbill paper. */}
          <div
            className="chalk-pencil-dark absolute -right-2 top-0 font-hand text-[1.6rem] text-chalk-sage sm:-right-8 sm:text-4xl select-none"
            style={{ transform: 'rotate(-4deg) translateY(-3rem)' }}
            aria-hidden="true"
          >
            এখানে আড্ডা ফ্রি ↙
          </div>

          {/* Playbill rule line */}
          <div className="mb-7 flex items-center gap-4">
            <div className="h-px w-10 bg-[#C9A87A]/55" />
            <p className="font-typewriter text-[9px] uppercase tracking-[0.48em] text-[#C9A87A]/70 sm:text-[10px]">
              Mime Institute of Calcutta presents
            </p>
            <div className="h-px flex-1 bg-[#C9A87A]/55" />
          </div>

          {/* Main title */}
          <h1 className="font-serif leading-[0.88] text-[#F5F0E6]">
            <span className="block text-[3.6rem] sm:text-[5.5rem] lg:text-[7.5rem]">
              Art-Teas-Tree
            </span>
            <span className="mt-3 block text-[2.4rem] italic text-[#C9A87A] sm:text-[3.5rem] lg:text-[4.5rem]">
              Café
            </span>
          </h1>

          {/* Ornamental divider */}
          <div className="my-8 flex items-center gap-4">
            <div className="h-px flex-1 bg-[#C9A87A]/22" />
            <span className="text-[#C9A87A]/45">✦</span>
            <div className="h-px flex-1 bg-[#C9A87A]/22" />
          </div>

          {/* Tagline */}
          <p className="font-serif text-2xl italic text-[#F5F0E6]/78 sm:text-3xl">
            "Where conversations steep slowly."
          </p>

          {/* Bengali subtitle */}
          <p className="mt-4 font-bn text-sm text-[#F5F0E6]/42 sm:text-base">
            চা, থিয়েটার, আড্ডা &mdash; Bidhan Nagar, Kolkata
          </p>

          {/* CTAs */}
          <div className="mt-10 flex flex-wrap gap-3">
            <a
              href="#menu"
              className="inline-flex items-center gap-2 rounded-full bg-[#F5F0E6] px-6 py-3 font-body text-sm font-semibold uppercase tracking-[0.16em] text-[#1C1410] transition-colors hover:bg-[#EDE2CB]"
            >
              <Coffee size={17} /> Open menu
            </a>
            <a
              href="#reel"
              className="inline-flex items-center gap-2 rounded-full border border-[#F5F0E6]/35 px-6 py-3 font-body text-sm font-semibold uppercase tracking-[0.16em] text-[#F5F0E6] transition-colors hover:bg-[#F5F0E6]/10"
            >
              <Theater size={17} /> The reel
            </a>
          </div>
        </div>
      </motion.div>

      {/* Scroll nudge */}
      <motion.div
        animate={{ y: [0, 9, 0] }}
        transition={{ repeat: Infinity, duration: 2.6, ease: 'easeInOut' }}
        className="absolute bottom-8 left-1/2 z-20 flex -translate-x-1/2 flex-col items-center gap-1.5 text-[#C9A87A]/45"
        aria-hidden="true"
      >
        <span className="font-typewriter text-[8px] uppercase tracking-[0.45em]">scroll</span>
        <ChevronDown size={14} />
      </motion.div>
    </section>
  );
}

// ─── Philosophy / Manifesto ───────────────────────────────────────────────────

function Philosophy() {
  return (
    <motion.section
      id="philosophy"
      variants={fadeUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-100px' }}
      transition={{ duration: 1, ease: [0.22, 0.61, 0.36, 1] }}
      className="relative overflow-hidden bg-[#F5EDD6] bg-paper"
    >
      {/* Red-soil stamp — overlaps top-right corner */}
      <div
        className="absolute right-5 top-8 z-10 border-2 border-[#6B2D2D]/70 px-4 py-2 text-center sm:right-14 sm:top-10"
        style={{ transform: 'rotate(2.2deg)' }}
        aria-hidden="true"
      >
        <p className="font-typewriter text-[9px] uppercase tracking-[0.35em] text-[#6B2D2D]/80">
          Mime Institute
        </p>
        <p className="font-typewriter text-[9px] uppercase tracking-[0.35em] text-[#6B2D2D]/80">
          of Calcutta
        </p>
      </div>

      <div className="mx-auto grid max-w-7xl gap-12 px-5 py-24 sm:px-8 lg:grid-cols-[1.1fr_0.9fr] lg:gap-20 lg:py-36">

        {/* Left — the full manifesto, typeset like a printed page */}
        <article className="relative border-t border-[#7A4A2A]/22 pt-10">

          {/* Coffee-ring stain — someone left a cup on this page */}
          <CoffeeRing className="-top-4 right-2 sm:right-8" size={150} rotate={-12} />

          {/* Vertical margin annotation — visible on large screens.
              Pastel sage chalk, soaked into paper via multiply blend. */}
          <div
            className="chalk-pencil absolute -left-6 top-1/3 hidden select-none font-hand text-sm text-chalk-sage lg:block"
            style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg) translateX(1.8rem)' }}
            aria-hidden="true"
          >
            silence is the stage. adda is the medium.
          </div>

          <div className="relative">
            <p className="drop-cap font-serif text-3xl leading-[1.35] text-[#1C1410] sm:text-4xl">
              "If Satyajit Ray lingered at a cha er dokan after rehearsal&hellip; that is the
              emotional neighborhood of Art-Teas-Tree Cafe.
            </p>
            {/* a red-pencil approving underline beneath the opening */}
            <PencilUnderline
              className="left-12 -bottom-1 sm:left-16"
              width={210}
              style={{ transform: 'rotate(-1.2deg)' }}
            />
          </div>

          <div className="mt-8 space-y-6 font-body text-base leading-8 text-[#5E3820] sm:text-lg sm:leading-9">
            <p>
              Rooted in the spirit of the Mime Institute of Calcutta, this is a place where silence
              is not emptiness, but attention.
            </p>
            <p className="relative">
              Kolkata's tea stalls have always been tiny public theatres. Someone enters with a
              folded newspaper, someone leaves with a new philosophy, and the clay cup in the middle
              conducts the whole scene. We built this café to carry that exact
              warmth&mdash;without turning nostalgia into a museum.
              {/* margin pastel-pencil correction — faded rose, blends into paper */}
              <InkCorrection
                className="chalk-pencil -right-4 top-1 hidden text-base sm:text-lg lg:block"
                rotate={-7}
                color="#C99A93"
                style={{ transform: 'rotate(-7deg) translateX(110%)' }}
              >
                ← keep this line ✓
              </InkCorrection>
            </p>
            <p>
              In an age of digital isolation, consider this a rehearsal space for human connection.
              The tea steeps slowly. The bookshelves are open. Artists test unfinished thoughts.
              Here, Adda is a culture, not a distraction.
            </p>
          </div>

          {/* Final line — handwritten, slightly tilted */}
          <p
            className="mt-10 inline-block font-hand text-3xl text-[#3B2418] sm:text-4xl"
            style={{ transform: 'rotate(-1.2deg)' }}
          >
            Stay for one cup. Leave after the third conversation."
          </p>
        </article>

        {/* Right — scrapbook supporting elements */}
        <div className="flex flex-col gap-8 lg:pt-10">
          <div>
            <SectionKicker>A small manifesto</SectionKicker>
            <h2 className="mt-4 font-serif text-4xl font-medium leading-tight text-[#1C1410] sm:text-5xl">
              If Satyajit Ray lingered at a cha er dokan after rehearsal.
            </h2>
          </div>

          {/* Director's notebook — dark card, tilted, taped to the page */}
          <div
            className="relative bg-[#2A1812] p-6 text-[#F5F0E6] shadow-[0_14px_45px_rgba(0,0,0,0.38)]"
            style={{ transform: 'rotate(-0.9deg)' }}
          >
            {/* Washi tape — pinning the notebook to the wall */}
            <WashiTape className="-top-3 left-4" color="#6B2D2D" rotate={-8} width={96} />
            <WashiTape className="-top-3 right-6" color="#5A6B3E" rotate={6} width={84} />
            {/* Paper-clip deco */}
            <div
              className="absolute -top-3 left-1/2 h-7 w-3 -translate-x-1/2 rounded-t-full border-2 border-[#C9A87A]/55 border-b-0"
              aria-hidden="true"
            />
            <p className="font-typewriter text-[9px] uppercase tracking-[0.38em] text-[#C9A87A]/58">
              from the director's notebook
            </p>
            <p className="mt-4 font-hand text-2xl leading-relaxed text-[#C9A87A] sm:text-3xl">
              "Silence is not emptiness. It is attention."
            </p>
            <p className="mt-4 font-typewriter text-[10px] text-[#F5F0E6]/38">
              — Mime Institute of Calcutta, founding note
            </p>
          </div>

          {/* Affiliation badge */}
          <div className="flex items-center gap-4">
            <div className="shrink-0 rounded-full border-2 border-[#6B2D2D]/55 p-4">
              <Theater size={22} className="text-[#6B2D2D]" />
            </div>
            <div>
              <p className="font-typewriter text-[10px] uppercase tracking-[0.28em] text-[#7A4A2A]">
                Est. Bidhan Nagar, Kolkata
              </p>
              <p className="font-body text-sm text-[#5E3820]">
                Associated with the Mime Institute of Calcutta
              </p>
            </div>
          </div>

          {/* Bengali pull-quote */}
          <div className="border-l-2 border-[#5A6B3E] pl-5">
            <p className="font-bn text-xl leading-relaxed text-[#1C1410]">
              আড্ডা একটি সংস্কৃতি, বিক্ষেপ নয়।
            </p>
            <p className="mt-1.5 font-body text-xs italic text-[#7A4A2A]">
              Adda is a culture, not a distraction.
            </p>
          </div>
        </div>
      </div>
    </motion.section>
  );
}

// ─── Reel — Through the director's viewfinder ───────────────────────────────
// Replaces Lyadh. A retro-Kolkata-cinema photo section: featured viewfinder
// on top, contact-sheet filmstrip below.

function ViewfinderCorners() {
  return (
    <>
      <div className="pointer-events-none absolute -left-3 -top-3 h-7 w-7 border-l-2 border-t-2 border-[#C9A87A]/55 sm:-left-4 sm:-top-4 sm:h-10 sm:w-10" />
      <div className="pointer-events-none absolute -right-3 -top-3 h-7 w-7 border-r-2 border-t-2 border-[#C9A87A]/55 sm:-right-4 sm:-top-4 sm:h-10 sm:w-10" />
      <div className="pointer-events-none absolute -bottom-3 -left-3 h-7 w-7 border-b-2 border-l-2 border-[#C9A87A]/55 sm:-bottom-4 sm:-left-4 sm:h-10 sm:w-10" />
      <div className="pointer-events-none absolute -bottom-3 -right-3 h-7 w-7 border-b-2 border-r-2 border-[#C9A87A]/55 sm:-bottom-4 sm:-right-4 sm:h-10 sm:w-10" />
    </>
  );
}

function SprocketRow({ count = 18 }) {
  return (
    <div className="flex h-3 items-center justify-between gap-0.5 px-1">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="h-2 w-3 shrink-0 rounded-[1px] bg-[#0A0604]" />
      ))}
    </div>
  );
}

function Reel() {
  const [active, setActive] = useState(0);
  const frame = REEL_FRAMES[active];
  const total = REEL_FRAMES.length;

  return (
    <section
      id="reel"
      className="relative overflow-hidden bg-[#0E0805] px-5 py-24 text-[#F5F0E6] sm:px-8 lg:py-32"
    >
      {/* faint sepia vignette */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_30%,_rgba(28,18,8,0.7)_85%)]" />

      <div className="relative mx-auto max-w-6xl">
        {/* Section header */}
        <div className="grid gap-6 sm:flex sm:items-end sm:justify-between">
          <div>
            <p className="font-bn text-3xl text-[#C9A87A]/75">রিল</p>
            <SectionKicker className="mt-0.5 text-[#5A6B3E]">
              Reel · The café in frames
            </SectionKicker>
            <h2 className="mt-3 font-serif text-5xl font-medium leading-tight text-[#F5F0E6] sm:text-6xl">
              Through the<br />director's viewfinder.
            </h2>
          </div>

          {/* Director's slate stripes */}
          <div className="flex items-center gap-3">
            <div className="flex h-6 overflow-hidden border border-[#C9A87A]/35">
              {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
                <div
                  key={i}
                  className="w-3"
                  style={{
                    backgroundColor: i % 2 === 0 ? '#F5F0E6' : '#1C1410',
                  }}
                />
              ))}
            </div>
            <p className="font-typewriter text-[9px] uppercase tracking-[0.4em] text-[#C9A87A]/55">
              scene 03<br />take 01
            </p>
          </div>
        </div>

        {/* ── Viewfinder ───────────────────────────────────────────── */}
        <div className="relative mx-auto mt-12 max-w-5xl">
          <ViewfinderCorners />

          {/* Film cell — black frame with sprocket holes on left + right */}
          <div className="relative aspect-[16/9] overflow-hidden border border-[#3B2418] bg-[#0A0604]">
            {/* Left sprocket column */}
            <div className="absolute inset-y-2 left-0 flex w-4 flex-col items-center justify-around sm:w-5">
              {Array.from({ length: 9 }).map((_, i) => (
                <div
                  key={i}
                  className="h-3 w-2 rounded-[1px] bg-[#1C1208] shadow-[inset_0_0_0_1px_rgba(245,240,230,0.06)]"
                />
              ))}
            </div>
            {/* Right sprocket column */}
            <div className="absolute inset-y-2 right-0 flex w-4 flex-col items-center justify-around sm:w-5">
              {Array.from({ length: 9 }).map((_, i) => (
                <div
                  key={i}
                  className="h-3 w-2 rounded-[1px] bg-[#1C1208] shadow-[inset_0_0_0_1px_rgba(245,240,230,0.06)]"
                />
              ))}
            </div>

            {/* Photo window — inset between sprocket columns */}
            <div className="absolute inset-y-1 left-5 right-5 overflow-hidden sm:left-6 sm:right-6">
              <AnimatePresence mode="wait" initial={false}>
                <motion.img
                  key={frame.id}
                  src={cldImg(frame.src, { width: 1600 })}
                  alt={frame.caption}
                  initial={{ opacity: 0, scale: 1.04 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.45, ease: [0.22, 0.61, 0.36, 1] }}
                  className="h-full w-full object-cover"
                  style={{
                    filter: 'sepia(0.55) contrast(1.05) saturate(0.78) brightness(0.95)',
                  }}
                />
              </AnimatePresence>

              {/* Rule-of-thirds grid + crosshair */}
              <div className="pointer-events-none absolute inset-0">
                <div className="absolute inset-y-0 left-1/3 w-px bg-[#C9A87A]/22" />
                <div className="absolute inset-y-0 left-2/3 w-px bg-[#C9A87A]/22" />
                <div className="absolute inset-x-0 top-1/3 h-px bg-[#C9A87A]/22" />
                <div className="absolute inset-x-0 top-2/3 h-px bg-[#C9A87A]/22" />
                {/* center crosshair */}
                <div className="absolute left-1/2 top-1/2 h-6 w-6 -translate-x-1/2 -translate-y-1/2">
                  <div className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-[#C9A87A]/55" />
                  <div className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-[#C9A87A]/55" />
                </div>
              </div>

              {/* Subtle scanlines — gives it a CRT-like director-monitor texture */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 opacity-[0.08] mix-blend-overlay"
                style={{
                  backgroundImage:
                    'repeating-linear-gradient(0deg, rgba(0,0,0,0.6) 0 1px, transparent 1px 3px)',
                }}
              />

              {/* HUD — top row */}
              <div className="pointer-events-none absolute inset-x-3 top-3 flex items-center justify-between font-typewriter text-[10px] uppercase tracking-[0.22em] text-[#C9A87A]/85 sm:inset-x-4 sm:top-4">
                <div className="flex items-center gap-2">
                  <motion.div
                    animate={{ opacity: [1, 0.25, 1] }}
                    transition={{ repeat: Infinity, duration: 1.4, ease: 'easeInOut' }}
                    className="h-2 w-2 rounded-full bg-[#C73A2D] shadow-[0_0_8px_rgba(199,58,45,0.7)]"
                  />
                  <span>REC</span>
                </div>
                <span>{frame.timecode}</span>
              </div>

              {/* HUD — bottom row */}
              <div className="pointer-events-none absolute inset-x-3 bottom-3 flex items-end justify-between font-typewriter text-[10px] uppercase tracking-[0.22em] text-[#C9A87A]/85 sm:inset-x-4 sm:bottom-4">
                <span>
                  FRAME {String(active + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
                </span>
                <span className="hidden sm:inline">{frame.lens}</span>
              </div>

              {/* Director's margin scribble — pastel chalk on the viewfinder glass */}
              <p
                aria-hidden="true"
                className="chalk-pencil-dark pointer-events-none absolute right-6 top-1/2 -translate-y-1/2 font-hand text-xl text-chalk-butter/0 sm:text-2xl lg:text-chalk-butter"
                style={{ transform: 'translateY(-50%) rotate(-3deg)' }}
              >
                {frame.note}
              </p>
            </div>
          </div>

          {/* Caption beneath the viewfinder */}
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={frame.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.35 }}
              className="mt-8 grid gap-6 lg:grid-cols-[1fr_auto] lg:gap-12"
            >
              <div>
                <p className="font-bn text-2xl text-[#C9A87A]">{frame.bn}</p>
                <p className="mt-2 font-serif text-xl italic leading-snug text-[#F5F0E6]/85 sm:text-2xl">
                  "{frame.caption}"
                </p>
                <p className="mt-3 font-typewriter text-[10px] uppercase tracking-[0.3em] text-[#C9A87A]/50">
                  {frame.location} &middot; {frame.lens}
                </p>
              </div>
              <div className="chalk-pencil-dark border-l-2 border-[#C9A87A]/30 pl-5 font-hand text-lg leading-tight text-chalk-sage">
                — Mime Inst.<br />
                frame log
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* ── Contact sheet filmstrip ─────────────────────────────── */}
        <div className="mx-auto mt-14 max-w-5xl">
          <div className="mb-3 flex items-center justify-between">
            <p className="font-typewriter text-[10px] uppercase tracking-[0.4em] text-[#C9A87A]/50">
              contact sheet · click frame to load
            </p>
            <p className="chalk-pencil-dark font-hand text-base text-chalk-sage" aria-hidden="true">
              ↓ developed today
            </p>
          </div>

          <div className="relative overflow-x-auto pb-2">
            <div className="inline-block min-w-full bg-[#1C1208] p-2">
              {/* Top sprocket row */}
              <SprocketRow count={REEL_FRAMES.length * 5} />

              {/* Frame row */}
              <div className="flex items-stretch gap-2 px-1 py-2">
                {REEL_FRAMES.map((f, i) => {
                  const isActive = i === active;
                  return (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => setActive(i)}
                      aria-label={`Load frame ${i + 1}: ${f.caption}`}
                      aria-pressed={isActive}
                      className={`group relative shrink-0 border bg-[#0A0604] p-1 transition-colors ${
                        isActive
                          ? 'border-[#C9A87A]'
                          : 'border-[#3B2418] hover:border-[#C9A87A]/55'
                      }`}
                      style={{
                        width: 168,
                        boxShadow: isActive
                          ? '0 0 0 1px rgba(201,168,122,0.45), 0 14px 30px -10px rgba(0,0,0,0.6)'
                          : undefined,
                      }}
                    >
                      <div className="relative aspect-[16/10] overflow-hidden">
                        <img
                          src={cldImg(f.src, { width: 320 })}
                          alt=""
                          className="h-full w-full object-cover transition-opacity"
                          style={{
                            filter: isActive
                              ? 'sepia(0.4) contrast(1.05) saturate(0.85)'
                              : 'sepia(0.65) contrast(0.95) saturate(0.6) brightness(0.78)',
                          }}
                          loading="lazy"
                        />
                        {/* active overlay — "now loaded" indicator */}
                        {isActive && (
                          <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-[#C9A87A]/40">
                            <p className="absolute right-1 top-1 bg-[#C73A2D]/85 px-1.5 py-0.5 font-typewriter text-[8px] uppercase tracking-[0.2em] text-[#F5F0E6]">
                              live
                            </p>
                          </div>
                        )}
                      </div>
                      <p
                        className={`mt-1 text-center font-typewriter text-[8px] uppercase tracking-[0.25em] ${
                          isActive ? 'text-[#C9A87A]' : 'text-[#C9A87A]/40'
                        }`}
                      >
                        FR {String(i + 1).padStart(2, '0')}
                      </p>
                    </button>
                  );
                })}
              </div>

              {/* Bottom sprocket row */}
              <SprocketRow count={REEL_FRAMES.length * 5} />
            </div>
          </div>
        </div>

        {/* Closing margin scribble — pastel chalk on dark, faded as if pencilled */}
        <p
          className="chalk-pencil-dark mt-10 inline-block font-hand text-xl text-chalk-butter"
          style={{ transform: 'rotate(-1.2deg)' }}
        >
          ↑ developed in-house. processed with chai and patience.
        </p>
      </div>
    </section>
  );
}

// ─── Menu ────────────────────────────────────────────────────────────────────

function Menu() {
  const [active, setActive] = useState('All');

  // Per-category counts, computed once. Used to stamp counts on the filter
  // chips ("Tea · 4") so a long menu still reads as scannable.
  const counts = useMemo(() => {
    const c = { All: menuRows.length };
    for (const row of menuRows) c[row.category] = (c[row.category] || 0) + 1;
    return c;
  }, []);

  const filtered = useMemo(
    () => (active === 'All' ? menuRows : menuRows.filter((r) => r.category === active)),
    [active],
  );

  // Group filtered items by their category so we can render section sub-headers
  // when the user is viewing "All". Keys are ordered by the CATEGORIES array so
  // the menu always reads top-to-bottom in the same order the chips appear in.
  const grouped = useMemo(() => {
    const groups = {};
    for (const item of filtered) {
      if (!groups[item.category]) groups[item.category] = [];
      groups[item.category].push(item);
    }
    return groups;
  }, [filtered]);

  const orderedGroupKeys = CATEGORIES.filter((c) => c !== 'All' && grouped[c]?.length);
  const showGroupHeaders = active === 'All' && orderedGroupKeys.length > 1;
  const isLong = filtered.length > MENU_SCROLL_THRESHOLD;

  return (
    <section id="menu" className="relative overflow-hidden bg-[#2A1812] px-4 py-20 text-[#F5F0E6] sm:px-8 lg:py-28">
      {/* Wicker chair texture peeking through behind the paper menu */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.18]"
        style={{
          backgroundImage: `url('${assetPath('/wicker.svg')}')`,
          backgroundSize: '64px 64px',
          mixBlendMode: 'overlay',
        }}
      />
      <motion.div
        variants={fadeUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-100px' }}
        transition={{ duration: 0.85 }}
        className="relative mx-auto max-w-5xl"
      >
        {/* Section heading — Bengali layered above English */}
        <div className="mb-10">
          <p className="font-bn text-2xl text-[#C9A87A]/80">চা ও টা</p>
          <SectionKicker className="mt-0.5" style={{ transform: 'rotate(-0.7deg)' }}>
            Cha, Ta, and Menu
          </SectionKicker>
          <h2 className="mt-3 font-serif text-5xl font-medium text-[#F5F0E6] sm:text-6xl">
            What's steeping today
          </h2>
        </div>

        {/* Physical paper menu card */}
        <div className="relative">
          {/* Washi tape — pinning the menu to the wicker chair */}
          <WashiTape className="-top-2 left-8 z-30" color="#C9A87A" rotate={-6} width={120} />
          <WashiTape className="-top-2 right-12 z-30" color="#5A6B3E" rotate={5} width={100} />

          {/* Coffee ring on the paper margin — someone set their bhar here */}
          <CoffeeRing className="-top-6 -right-4 z-30" size={100} rotate={18} color="#3B2418" />

          {/* Handmade coaster anchor — pinned to the upper-left corner */}
          <CoasterStamp
            className="absolute -left-10 -top-10 z-30 hidden lg:block"
            size={108}
            label="cha · 2024"
            bn="চা"
            style={{ transform: 'rotate(-8deg)' }}
          />

          {/* Torn top edge — cream paper appearing from the dark bg */}
          <TornEdge fill="#F5EDD6" />

          <div className="bg-[#F5EDD6] bg-paper px-5 py-8 text-[#1C1410] shadow-[0_22px_65px_rgba(0,0,0,0.42)] sm:px-8 sm:py-10">

            {/* Category filters — ink-stamped labels with item counts.
                Counts let the cafe grow the menu indefinitely without the chips
                becoming opaque. */}
            <div className="mb-8 flex gap-2 overflow-x-auto border-b border-[#7A4A2A]/18 pb-5">
              {CATEGORIES.map((cat) => {
                const count = counts[cat] ?? 0;
                const isActive = active === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setActive(cat)}
                    aria-pressed={isActive}
                    className={`group flex shrink-0 items-baseline gap-2 rounded-none border px-4 py-2 font-typewriter text-xs uppercase tracking-[0.2em] transition-colors ${
                      isActive
                        ? 'border-[#3B2418] bg-[#3B2418] text-[#F5EDD6]'
                        : 'border-[#7A4A2A]/30 bg-transparent text-[#3B2418] hover:bg-[#7A4A2A]/10'
                    }`}
                  >
                    <span>{cat}</span>
                    <span
                      className={`text-[9px] tracking-[0.15em] ${
                        isActive ? 'text-[#C9A87A]' : 'text-[#7A4A2A]/55'
                      }`}
                    >
                      · {String(count).padStart(2, '0')}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Menu body. When the active filter holds more than
                MENU_SCROLL_THRESHOLD items, the body becomes a soft-capped
                scroll region so the section never grows unbounded. */}
            <div
              className={
                isLong
                  ? 'relative max-h-[640px] overflow-y-auto pr-2 [scrollbar-color:#7A4A2A_transparent]'
                  : ''
              }
            >
              <AnimatePresence mode="popLayout">
                <motion.div key={active} layout className="space-y-6">
                  {orderedGroupKeys.map((cat) => (
                    <motion.section
                      layout
                      key={cat}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: 0.35 }}
                    >
                      {showGroupHeaders && (
                        <header className="mb-2 flex items-baseline gap-3 border-b border-[#7A4A2A]/22 pb-2">
                          <p className="font-bn text-xl text-[#5E3820]">
                            {CATEGORY_BN[cat] ?? cat}
                          </p>
                          <h3 className="font-serif text-2xl italic text-[#3B2418]">
                            {cat}
                          </h3>
                          <p className="ml-auto font-typewriter text-[9px] uppercase tracking-[0.28em] text-[#7A4A2A]/60">
                            {grouped[cat].length} {grouped[cat].length === 1 ? 'item' : 'items'}
                          </p>
                        </header>
                      )}
                      <div className="grid gap-0 sm:grid-cols-2 sm:gap-x-8">
                        {grouped[cat].map((item) => (
                          <motion.article
                            layout
                            key={item.id}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -6 }}
                            transition={{ duration: 0.3 }}
                            className="border-b border-[#7A4A2A]/14 py-5 last:border-b-0"
                          >
                            <div className="flex items-start justify-between gap-4">
                              <h4 className="font-serif text-2xl text-[#1C1410]">
                                {item.itemName}
                              </h4>
                              <p className="shrink-0 font-typewriter text-xl text-[#7A4A2A]">
                                ₹{item.price}
                              </p>
                            </div>
                            <p className="mt-2 font-body text-sm leading-6 text-[#5E3820]">
                              {item.description}
                            </p>
                          </motion.article>
                        ))}
                      </div>
                    </motion.section>
                  ))}
                </motion.div>
              </AnimatePresence>

              {/* Empty-state — defensive in case a category gets filtered to zero */}
              {filtered.length === 0 && (
                <p className="py-12 text-center font-hand text-2xl text-[#7A4A2A]/60">
                  Nothing in this category yet — ask us what's brewing.
                </p>
              )}
            </div>

            {/* Soft scroll cue when the body is capped */}
            {isLong && (
              <p className="mt-2 text-right font-typewriter text-[9px] uppercase tracking-[0.3em] text-[#7A4A2A]/50">
                scroll for more &darr;
              </p>
            )}

            {/* Handwritten footer note — pastel chalk, soaked into the paper */}
            <p
              className="chalk-pencil mt-8 inline-block font-hand text-xl text-chalk-ink"
              style={{ transform: 'rotate(-1.1deg)' }}
            >
              আজকের বিশেষ ✦ ask us what's fresh today
            </p>
          </div>

          {/* Torn bottom edge */}
          <TornEdge fill="#F5EDD6" flip />
        </div>
      </motion.div>
    </section>
  );
}


// ─── Book Corner / Boipara ────────────────────────────────────────────────────

function Books() {
  const features = [
    { label: 'Little library', Icon: BookOpen },
    { label: 'Evening readings', Icon: Sparkles },
    { label: 'Bidhan Nagar', Icon: MapPin },
  ];

  return (
    <section
      id="books"
      className="relative overflow-hidden bg-[#5A6B3E] px-5 py-24 text-[#F5F0E6] sm:px-8 lg:py-32"
    >
      <div className="absolute inset-0 bg-paper opacity-12 mix-blend-multiply" />

      <div className="relative mx-auto max-w-7xl">
        {/* Coaster anchor — pinned to the top-right corner of the Boipara wall */}
        <CoasterStamp
          className="absolute right-0 -top-6 z-20 hidden md:block"
          size={132}
          label="boipara · open"
          bn="বই"
          style={{ transform: 'rotate(8deg)', filter: 'drop-shadow(0 10px 18px rgba(0,0,0,0.35))' }}
        />

        {/* Header */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.9 }}
          className="mb-12 grid gap-10 lg:grid-cols-2 lg:items-start"
        >
          <div>
            <p className="font-bn text-3xl text-[#F5F0E6]/60">বইপাড়া</p>
            <SectionKicker className="mt-0.5 text-[#F5F0E6]/80">
              College Street &amp; Adda
            </SectionKicker>
            <h2 className="mt-4 font-serif text-5xl font-medium leading-tight text-[#F5F0E6] sm:text-6xl">
              Old books, open tables,<br />unfinished arguments.
            </h2>
          </div>

          <div className="self-center">
            <p className="font-body text-lg leading-8 text-[#F5F0E6]/78">
              The library is meant to be touched. Pick up a book, leave a pencilled note, trade a
              recommendation with the next table. Our shelf is a small public weather — it changes
              weekly. Adda here is not background noise; it is the main performance.
            </p>
            <div className="mt-8 grid gap-5 sm:grid-cols-3">
              {features.map(({ label, Icon }) => (
                <div key={label} className="border-l border-[#F5F0E6]/30 pl-4">
                  <Icon size={20} />
                  <p className="mt-3 font-serif text-xl">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* The College Street shelf — horizontal book spines */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.9, delay: 0.2 }}
          className="overflow-x-auto"
          aria-label="Café bookshelf"
        >
          <div className="flex min-w-max items-end gap-1 border-b-2 border-[#F5F0E6]/20 pb-0">
            {SHELF_BOOKS.map((book, i) => (
              <div
                key={i}
                className="relative flex shrink-0 cursor-default select-none items-end justify-center overflow-hidden"
                style={{
                  height: `${book.h}px`,
                  width: `${book.w}px`,
                  backgroundColor: book.color,
                }}
                title={`${book.title} — ${book.author}`}
              >
                {/* Vertical title text */}
                <p
                  className="absolute inset-0 flex items-center justify-center px-1 font-body text-[9px] leading-tight text-[#F5F0E6]/80"
                  style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
                >
                  {book.title}
                </p>
                {/* Subtle spine highlight */}
                <div className="absolute inset-y-0 left-0 w-px bg-[#F5F0E6]/10" />
              </div>
            ))}
          </div>
          <p className="chalk-pencil-dark mt-3 font-hand text-sm text-chalk-butter">
            ↑ a sliver of what's there today. the shelf changes weekly.
          </p>
        </motion.div>

        {/* Café photo */}
        <motion.img
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.9, delay: 0.35 }}
          src={cldImg('art-teas-tree-cafe-kolkata-coffee-shops-fzkrcnggvx.webp', { width: 2000 })}
          alt="Warm books and tea inside the café corner"
          className="mt-12 max-h-[520px] w-full border border-[#F5F0E6]/15 object-cover sepia shadow-[0_22px_65px_rgba(0,0,0,0.32)] lg:max-h-[420px]"
        />
      </div>
    </section>
  );
}

// ─── Footer ───────────────────────────────────────────────────────────────────

function Footer() {
  return (
    <footer className="bg-[#1C1208] px-5 py-14 text-[#F5F0E6] sm:px-8 lg:py-20">
      <div className="mx-auto grid max-w-7xl gap-10 border-t border-[#C9A87A]/12 pt-14 md:grid-cols-3">
        {/* Identity */}
        <div>
          <p className="font-serif text-3xl font-medium text-[#F5F0E6]">Art-Teas-Tree</p>
          <p
            className="mt-2 inline-block font-hand text-2xl text-[#C9A87A]"
            style={{ transform: 'rotate(-1deg)' }}
          >
            where conversations steep slowly
          </p>
          <p className="mt-4 font-bn text-base text-[#F5F0E6]/40">
            মাইম ইনস্টিটিউট অফ ক্যালকাটা
          </p>
        </div>

        {/* Info */}
        <div className="space-y-3 font-body text-sm leading-7 text-[#F5F0E6]/68">
          <p className="flex items-start gap-3">
            <MapPin size={16} className="mt-1 shrink-0" />
            Bidhan Nagar, Kolkata, West Bengal
          </p>
          <p className="flex items-start gap-3">
            <Clock size={16} className="mt-1 shrink-0" />
            Open daily &mdash; 10:00 AM to 10:00 PM
            <br />
            <span className="font-typewriter text-[10px] text-[#F5F0E6]/38">
              (Fri–Sat until 11:30 PM)
            </span>
          </p>
          <p className="flex items-start gap-3">
            <Theater size={16} className="mt-1 shrink-0" />
            Associated with the Mime Institute of Calcutta
          </p>
        </div>

        {/* Sign-off */}
        <div className="md:text-right">
          <p
            className="inline-block font-hand text-4xl text-[#C9A87A]"
            style={{ transform: 'rotate(-1.5deg)' }}
          >
            আবার দেখা হবে
          </p>
          <p className="mt-2 font-hand text-xl text-[#F5F0E6]/50">abar dekha hobe</p>
          <p className="mt-6 font-typewriter text-[9px] uppercase tracking-[0.28em] text-[#F5F0E6]/28">
            Built for tea, theatre, books &amp; adda
          </p>
        </div>
      </div>
    </footer>
  );
}

// ─── CafeApp (root) ───────────────────────────────────────────────────────────

export default function CafeApp() {
  return (
    <div className="relative min-h-screen font-body text-[#1C1410]">
      {/* Animated cinematic film grain — fixed overlay, sits above everything */}
      <div className="film-grain" aria-hidden="true" />

      <Nav />

      <main>
        <Hero />
        <Philosophy />
        <EventsCarousel />
        <Reel />
        <Menu />
        <Books />
      </main>

      <Footer />
    </div>
  );
}
