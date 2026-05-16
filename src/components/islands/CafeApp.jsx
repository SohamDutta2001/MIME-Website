import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  BookOpen,
  ChevronDown,
  Clock,
  Coffee,
  MapPin,
  Mic2,
  Send,
  Sparkles,
  Theater,
  Users,
  X,
} from 'lucide-react';
import menuRows from '../../data/mockMenuData.json';
import artistRows from '../../data/mockArtistData.json';
import {
  WashiTape,
  CoffeeRing,
  InkCorrection,
  BharCup,
  CoasterStamp,
  PencilUnderline,
} from './Scraps.jsx';

// ─── constants ───────────────────────────────────────────────────────────────

const CATEGORIES = ['All', 'Tea', 'Coffee', 'Quick Bites'];

// Bengali rendering of menu categories — used as the small caligraphic label
// above each grouped category section when viewing "All". Fall back to the
// English name if a new category is added without a Bengali entry.
const CATEGORY_BN = {
  Tea: 'চা',
  Coffee: 'কফি',
  'Quick Bites': 'টা',
};

// When the visible item count crosses this, the menu body switches to an
// internal max-height scroll instead of growing the page indefinitely.
const MENU_SCROLL_THRESHOLD = 20;

// Number of artists shown prominently as vintage postcards on the main page.
// Any beyond this surface inside the full-roster modal — keeps the page
// scannable while letting the cafe grow the roster indefinitely.
const FEATURED_ARTIST_COUNT = 5;

// Deterministic card tilts — avoids Math.random() hydration mismatch
const CARD_TILTS = [-1.2, 0.8, -0.5, 1.0, -0.7, 0.4, -0.9, 0.6];

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

const REEL_FRAMES = [
  {
    id: 1,
    src: '/cafe-assets/art-teas-tree-cafe-kolkata-coffee-shops-riqhhggeu0.webp',
    caption: 'The morning shift, before the doors swing open.',
    bn: 'সকালের চা',
    lens: '35mm · f/2.8 · ISO 400',
    timecode: '00:01:24:12',
    location: 'Bidhan Nagar · interior',
    note: 'hold the silence ↘',
  },
  {
    id: 2,
    src: '/cafe-assets/art-teas-tree-cafe-kolkata-coffee-shops-fzkrcnggvx.webp',
    caption: 'Books, tea, a slow afternoon — the table forgets the time.',
    bn: 'বইপাড়ার বিকেল',
    lens: '50mm · f/1.8 · ISO 200',
    timecode: '00:14:08:22',
    location: 'reading corner',
    note: 'cut on the page turn',
  },
  {
    id: 3,
    src: '/cafe-assets/art-teas-tree-cafe-kolkata-coffee-shops-h3gejc5rf6-250.jpg',
    caption: 'Steam rising from the bhar — a small public theatre.',
    bn: 'ভাঁড়ের ধোঁয়া',
    lens: '85mm · f/2.0 · ISO 800',
    timecode: '00:22:41:03',
    location: 'counter, eye-level',
    note: 'closer next take',
  },
  {
    id: 4,
    src: '/cafe-assets/art-teas-tree-cafe-kolkata-coffee-shops-lxs22xc0rr-250.webp',
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
    { href: '#reel', label: 'রিল' },
    { href: '#menu', label: 'Menu' },
    { href: '#stage', label: 'মঞ্চ' },
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

function Hero() {
  return (
    <section id="home" className="relative min-h-screen overflow-hidden bg-[#1C1208]">
      {/* Actual café photo — sepia-tinted */}
      <img
        src="/cafe-assets/art-teas-tree-cafe-kolkata-coffee-shops-riqhhggeu0.webp"
        alt="Warm interior of Art-Teas-Tree Café, Kolkata"
        className="absolute inset-0 h-full w-full object-cover sepia"
        style={{ opacity: 0.55 }}
      />

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
              href="#stage"
              className="inline-flex items-center gap-2 rounded-full border border-[#F5F0E6]/35 px-6 py-3 font-body text-sm font-semibold uppercase tracking-[0.16em] text-[#F5F0E6] transition-colors hover:bg-[#F5F0E6]/10"
            >
              <Theater size={17} /> The stage
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
                  src={frame.src}
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
                          src={f.src}
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
          backgroundImage: "url('/wicker.svg')",
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

// ─── Artist Modal ─────────────────────────────────────────────────────────────

/**
 * FullRosterModal — the "see everyone" overlay. Holds the entire artist
 * roster in a compact list view (thumb + name + craft + contact). Used
 * because the masonry only surfaces FEATURED_ARTIST_COUNT artists; the rest
 * live here. Designed to feel like flipping through a director's casting
 * binder rather than a sterile data table.
 */
function FullRosterModal({ open, onClose, artists }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 grid place-items-center bg-[#1C1208]/82 px-4 py-8 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-label="Full artist roster"
          onClick={(e) => e.target === e.currentTarget && onClose()}
        >
          <motion.div
            initial={{ opacity: 0, y: 24, rotate: -0.6 }}
            animate={{ opacity: 1, y: 0, rotate: 0 }}
            exit={{ opacity: 0, y: 16 }}
            transition={{ duration: 0.4, ease: [0.22, 0.61, 0.36, 1] }}
            className="relative flex max-h-[88vh] w-full max-w-3xl flex-col border border-[#7A4A2A]/28 bg-[#F5EDD6] bg-paper text-[#1C1410] shadow-[0_28px_90px_rgba(0,0,0,0.5)]"
          >
            {/* Tape strip — pinned to the wall */}
            <WashiTape className="-top-3 left-12 z-10" color="#6B2D2D" rotate={-5} width={110} />
            <WashiTape className="-top-3 right-16 z-10" color="#5A6B3E" rotate={6} width={92} />

            {/* Header */}
            <div className="flex shrink-0 items-start justify-between border-b border-[#7A4A2A]/22 px-6 py-5 sm:px-8">
              <div>
                <p className="font-typewriter text-[9px] uppercase tracking-[0.42em] text-[#7A4A2A]/70">
                  Natyamancha — full roster
                </p>
                <h3 className="mt-2 font-serif text-3xl font-medium sm:text-4xl">
                  <span className="font-bn text-[#5E3820]">নাট্যমঞ্চ</span>
                  <span className="ml-3 italic">· every voice</span>
                </h3>
                <p className="chalk-pencil mt-2 font-hand text-base text-chalk-ink">
                  {artists.length} artists currently in residence
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="border border-[#7A4A2A]/22 p-2 transition-colors hover:bg-[#7A4A2A]/10"
                aria-label="Close roster"
              >
                <X size={17} />
              </button>
            </div>

            {/* Scrollable list */}
            <ul className="flex-1 overflow-y-auto px-3 py-4 sm:px-5">
              {artists.map((artist, i) => (
                <li
                  key={artist.id}
                  className={`flex gap-4 px-3 py-4 ${
                    i < artists.length - 1 ? 'border-b border-[#7A4A2A]/14' : ''
                  }`}
                >
                  {/* Thumb */}
                  <img
                    src={artist.imageUrl}
                    alt=""
                    loading="lazy"
                    className="h-16 w-16 shrink-0 border border-[#7A4A2A]/22 object-cover sepia sm:h-20 sm:w-20"
                  />
                  {/* Body */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline justify-between gap-3">
                      <h4 className="truncate font-serif text-xl font-medium text-[#1C1410]">
                        {artist.name}
                      </h4>
                      <span className="shrink-0 border border-[#7A4A2A]/30 px-2 py-0.5 font-typewriter text-[9px] uppercase tracking-[0.25em] text-[#5A6B3E]">
                        {artist.craft}
                      </span>
                    </div>
                    <p className="mt-1.5 line-clamp-2 font-body text-sm leading-6 text-[#5E3820]">
                      {artist.bio}
                    </p>
                    <a
                      href={artist.contactLink}
                      className="mt-2 inline-block font-hand text-base text-[#7A4A2A] transition-colors hover:text-[#3B2418]"
                    >
                      → contact artist
                    </a>
                  </div>
                </li>
              ))}
            </ul>

            {/* Footer note */}
            <div className="shrink-0 border-t border-[#7A4A2A]/22 px-6 py-4 sm:px-8">
              <p className="chalk-pencil text-center font-hand text-lg text-chalk-ink">
                ↑ the roster changes with the seasons. drop by the cafe to meet them.
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function ArtistModal({ open, onClose }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 grid place-items-center bg-[#1C1208]/78 px-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          onClick={(e) => e.target === e.currentTarget && onClose()}
        >
          <motion.div
            initial={{ opacity: 0, y: 28, rotate: -1.2 }}
            animate={{ opacity: 1, y: 0, rotate: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.45, ease: [0.22, 0.61, 0.36, 1] }}
            className="relative w-full max-w-xl border border-[#7A4A2A]/28 bg-[#F5EDD6] bg-paper p-6 text-[#1C1410] shadow-[0_28px_90px_rgba(0,0,0,0.48)] sm:p-8"
          >
            <button
              type="button"
              onClick={onClose}
              className="absolute right-4 top-4 border border-[#7A4A2A]/22 p-2 transition-colors hover:bg-[#7A4A2A]/10"
              aria-label="Close"
            >
              <X size={17} />
            </button>

            {/* Casting notice header */}
            <div className="border-b border-[#7A4A2A]/20 pb-4">
              <p className="font-typewriter text-[9px] uppercase tracking-[0.42em] text-[#7A4A2A]/70">
                Casting notice — Natyamancha
              </p>
              <SectionKicker className="mt-2">Take the Stage</SectionKicker>
              <h3 className="mt-1 font-serif text-4xl font-medium">Artist application</h3>
            </div>

            <form className="mt-6 grid gap-4">
              {['Name', 'Craft', 'Contact link'].map((label) => (
                <label key={label} className="grid gap-1.5 font-body text-sm text-[#5E3820]">
                  {label}
                  <input
                    className="border border-[#7A4A2A]/22 bg-[#FFF9EC]/75 px-4 py-3 font-body text-sm outline-none transition-colors focus:border-[#5A6B3E]"
                    placeholder={
                      label === 'Craft' ? 'Mime, poet, guitarist, painter…' : ''
                    }
                  />
                </label>
              ))}
              <label className="grid gap-1.5 font-body text-sm text-[#5E3820]">
                Tell us about your act
                <textarea
                  rows="4"
                  className="border border-[#7A4A2A]/22 bg-[#FFF9EC]/75 px-4 py-3 font-body text-sm outline-none transition-colors focus:border-[#5A6B3E]"
                />
              </label>
              <button
                type="button"
                className="mt-2 inline-flex w-fit items-center gap-2 bg-[#3B2418] px-5 py-3 font-body text-sm font-semibold uppercase tracking-[0.16em] text-[#F5F0E6] transition-colors hover:bg-[#1C1208]"
              >
                <Send size={15} /> Send application
              </button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─── Stage / Natyamancha ──────────────────────────────────────────────────────

function Stage() {
  const [applicationOpen, setApplicationOpen] = useState(false);
  const [rosterOpen, setRosterOpen] = useState(false);

  // Featured set surfaces as postcards on the page; the remainder lives in
  // the full-roster modal. Slicing here keeps the page scannable as the
  // roster grows past five.
  const featured = artistRows.slice(0, FEATURED_ARTIST_COUNT);
  const remaining = Math.max(0, artistRows.length - FEATURED_ARTIST_COUNT);

  return (
    <section id="stage" className="mx-auto max-w-7xl px-5 py-24 sm:px-8 lg:py-36">
      {/* Section header — Bengali first */}
      <div className="mb-12 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="font-bn text-3xl text-[#7A4A2A]">নাট্যমঞ্চ</p>
          <SectionKicker className="mt-0.5" style={{ display: 'inline-block', transform: 'rotate(-0.8deg)' }}>
            Natyamancha · The Stage
          </SectionKicker>
          <h2 className="mt-3 font-serif text-5xl font-medium text-[#1C1410] sm:text-6xl">
            Artists in residence
          </h2>
        </div>
        <button
          type="button"
          onClick={() => setApplicationOpen(true)}
          className="inline-flex w-fit shrink-0 items-center gap-2 bg-[#6B2D2D] px-5 py-3 font-body text-sm font-semibold uppercase tracking-[0.16em] text-[#F5F0E6] transition-colors hover:bg-[#4A1E1E]"
        >
          <Mic2 size={17} /> Take the Stage
        </button>
      </div>

      {/* Masonry postcard grid — featured artists only */}
      <div className="columns-1 gap-5 sm:columns-2 lg:columns-3">
        {featured.map((artist, i) => (
          <motion.article
            key={artist.id}
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.7, delay: i * 0.06 }}
            className="mb-5 break-inside-avoid"
            style={{ transform: `rotate(${CARD_TILTS[i % CARD_TILTS.length]}deg)` }}
          >
            {/* Vintage postcard anatomy */}
            <div className="border border-[#7A4A2A]/22 bg-[#EDE2CB] shadow-polaroid">
              <img
                src={artist.imageUrl}
                alt={`${artist.name}, ${artist.craft}`}
                className="block h-auto w-full border-b border-[#3B2418]/10 object-cover sepia"
              />
              <div className="p-4">
                {/* Postcard header */}
                <div className="flex items-start justify-between border-b border-[#7A4A2A]/18 pb-3">
                  <div>
                    <p className="font-typewriter text-[9px] uppercase tracking-[0.3em] text-[#5A6B3E]">
                      {artist.craft}
                    </p>
                    <h3 className="mt-0.5 font-serif text-2xl font-medium text-[#1C1410]">
                      {artist.name}
                    </h3>
                  </div>
                  <p className="font-typewriter text-[9px] text-[#7A4A2A]/50">
                    No. {String(artist.id).padStart(2, '0')}
                  </p>
                </div>
                <p className="mt-3 font-body text-sm leading-6 text-[#5E3820]">{artist.bio}</p>
                <a
                  href={artist.contactLink}
                  className="mt-4 inline-block font-hand text-xl text-[#7A4A2A] transition-colors hover:text-[#3B2418]"
                >
                  → contact artist
                </a>
              </div>
            </div>
          </motion.article>
        ))}
      </div>

      {/* See full roster CTA — only renders when there are artists beyond
          the featured five. Doubles as a count indicator so visitors know
          how much more is behind the modal. */}
      {remaining > 0 && (
        <div className="mt-10 flex flex-col items-center gap-3">
          <button
            type="button"
            onClick={() => setRosterOpen(true)}
            className="group inline-flex items-center gap-3 border-2 border-[#3B2418] bg-transparent px-6 py-3 font-body text-sm font-semibold uppercase tracking-[0.18em] text-[#3B2418] transition-colors hover:bg-[#3B2418] hover:text-[#F5EDD6]"
          >
            <Users size={17} />
            See the full roster
            <span className="ml-1 font-typewriter text-[10px] tracking-[0.2em] text-[#7A4A2A] group-hover:text-[#C9A87A]">
              · {String(remaining).padStart(2, '0')} more
            </span>
          </button>
          <p
            className="chalk-pencil font-hand text-lg text-chalk-ink"
            style={{ transform: 'rotate(-1deg)' }}
            aria-hidden="true"
          >
            ↑ everyone currently on our wall
          </p>
        </div>
      )}

      <ArtistModal open={applicationOpen} onClose={() => setApplicationOpen(false)} />
      <FullRosterModal
        open={rosterOpen}
        onClose={() => setRosterOpen(false)}
        artists={artistRows}
      />
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
          src="/cafe-assets/art-teas-tree-cafe-kolkata-coffee-shops-fzkrcnggvx.webp"
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
        <Reel />
        <Menu />
        <Stage />
        <Books />
      </main>

      <Footer />
    </div>
  );
}
