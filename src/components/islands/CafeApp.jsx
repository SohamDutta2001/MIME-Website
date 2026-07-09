import { useEffect, useMemo, useRef, useState } from 'react';
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from 'framer-motion';
import useEmblaCarousel from 'embla-carousel-react';
import {
  BookOpen,
  CalendarDays,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock,
  Coffee,
  HeartHandshake,
  MapPin,
  Sparkles,
  Theater,
} from 'lucide-react';
import menuRows from '../../data/mockMenuData.json';
import { site } from '../../data/site.ts';
import {
  WashiTape,
  CoffeeRing,
  InkCorrection,
  CoasterStamp,
  PencilUnderline,
  TicketBooth,
  MenuIllustration,
} from './Scraps.jsx';
import { assetPath, cldImg } from '../../lib/img.js';
import EventsSection from './events/EventsSection.jsx';

// ─── constants ───────────────────────────────────────────────────────────────

// Menu categories are derived from the data at module load — that way the
// café owner can add a new category in the Sheet (say "Sweets" or
// "Cold Drinks") and the filter chip appears automatically, in the order
// it first appears in the sheet.
const CATEGORIES = ['All', ...Array.from(new Set(menuRows.map((r) => r.category)))];

// Category-level notes shown beside the section header.
const CATEGORY_NOTES = {
  'Second Bell':  'Add Milk +₹10',
  'Curtain Call': 'Homemade · No Preservatives',
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
    src: 'mime-cafe-interior-adda-lamps.webp',
    alt: 'The long interior of Art-Teas-Tree at night — hanging pendant lamps, a reader in the foreground, people gathered in adda behind',
  },
  {
    src: 'mime-cafe-exterior-night-signs.webp',
    alt: 'The café exterior after dark — the illuminated CAFÉ sign and circular logo visible past a tree trunk, string lights lining the orange patterned walls',
  },
  {
    src: 'mime-cafe-interior-evening-crowd.webp',
    alt: 'An evening gathering inside Art-Teas-Tree — warm pendant lights, orange walls, visitors in quiet conversation',
  },
  {
    src: 'mime-cafe-ceiling-lamps-lookup.webp',
    alt: 'Looking up at the handmade Edison bulb lamps hanging from the bamboo ceiling grid of the café',
  },
  {
    src: 'mime-cafe-sign-night-bulbs.webp',
    alt: 'The Art-Teas-Tree CAFÉ illuminated signboard at night, with a row of warm Edison bulbs hanging below on the bamboo fascia',
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
    src: 'mime-cafe-drinks-spread-table.webp',
    caption: 'Four glasses on a round table — the adda has already begun.',
    bn: 'পানীয়ের আসর',
    lens: '35mm · f/2.8 · ISO 800',
    timecode: '00:03:10:04',
    location: 'outdoor round table',
    note: 'let the menu breathe ↘',
  },
  {
    id: 2,
    src: 'mime-cafe-three-drinks-closeup.webp',
    caption: 'Three orders arrive together — tea, coffee, something cold.',
    bn: 'তিন কাপের সন্ধ্যা',
    lens: '50mm · f/2.0 · ISO 400',
    timecode: '00:09:44:18',
    location: 'wooden table, interior',
    note: 'hold — let them settle',
  },
  {
    id: 3,
    src: 'mime-cafe-drink-sip-moment.webp',
    caption: 'The first sip — unhurried, the glass still warm in his hand.',
    bn: 'প্রথম চুমুক',
    lens: '85mm · f/1.8 · ISO 1600',
    timecode: '00:16:22:09',
    location: 'amber corner, close',
    note: 'cut after the sip',
  },
  {
    id: 4,
    src: 'mime-cafe-hands-adda-food.webp',
    caption: 'A hand mid-gesture — the story pauses only when the food arrives.',
    bn: 'আড্ডার হাত',
    lens: '35mm · f/2.2 · ISO 1250',
    timecode: '00:24:08:14',
    location: 'round table, low angle',
    note: 'catch the gesture ↘',
  },
  {
    id: 5,
    src: 'mime-cafe-icecream-caramel.webp',
    caption: 'Caramel over kulfi — the evening orders something sweet.',
    bn: 'মিষ্টি শেষে',
    lens: '60mm · f/2.8 · ISO 640',
    timecode: '00:31:55:00',
    location: 'dessert pass',
    note: 'slow pour, slow cut',
  },
  {
    id: 6,
    src: 'mime-cafe-skewer-dips-plate.webp',
    caption: 'Skewer and two small bowls — the plate arrives before the conversation can finish.',
    bn: 'শিককাবাব পাত',
    lens: '50mm · f/2.8 · ISO 500',
    timecode: '00:38:12:22',
    location: 'round table, eye-level',
    note: 'steady the plate',
  },
  {
    id: 7,
    src: 'mime-cafe-wooden-sign-wall.webp',
    caption: 'The name in wood — three planks, one promise, an orange wall behind.',
    bn: 'আর্ট-টিজ-ট্রি',
    lens: '40mm · f/4 · ISO 400',
    timecode: '00:44:30:00',
    location: 'entrance wall',
    note: 'hold — the sign',
  },
  {
    id: 8,
    src: 'mime-cafe-sharing-meal-hands.webp',
    caption: 'A hand reaches across — the meal, like the evening, is meant to be shared.',
    bn: 'ভাগের খাবার',
    lens: '35mm · f/2.0 · ISO 1000',
    timecode: '00:51:18:06',
    location: 'round table, overhead',
    note: 'fade in the reach ↘',
  },
];

// ─── animation variants ───────────────────────────────────────────────────────

const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0 },
};

// Hero title — letters rise out of a clipped line like a film title card.
// Stagger sits in the 30–50ms band so the reveal reads as one gesture.
const titleContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.045, delayChildren: 0.35 } },
};

const titleLetter = {
  hidden: { y: '108%', rotate: 3 },
  visible: {
    y: '0%',
    rotate: 0,
    transition: { duration: 0.65, ease: [0.22, 0.61, 0.36, 1] },
  },
};

// ─── motion budget ────────────────────────────────────────────────────────────
// On phones — and whenever the OS asks for reduced motion — we drop the
// continuous, always-repainting flourishes (parallax, Ken Burns zoom, projector
// flicker, blinking REC dot, steam, the ticker crawl). The layout and one-shot
// scroll-reveal animations stay, so the cinematic feel survives on desktop
// without the scroll jank on a handset.
function useCalmMotion() {
  const reduce = useReducedMotion();
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    if (typeof window === 'undefined') return undefined;
    const mq = window.matchMedia('(max-width: 767px)');
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);
  return reduce || isMobile;
}

// ─── ScrollProgress ───────────────────────────────────────────────────────────
// A hair-thin copper strip across the very top — fills as the page plays out,
// like the progress of a reel through a projector. Sits above the nav (z-50).

function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  return (
    <motion.div
      className="fixed inset-x-0 top-0 z-50 h-[2px] origin-left bg-gradient-to-r from-[#7A4A2A] via-[#C9A87A] to-[#C73A2D]"
      style={{ scaleX: scrollYProgress }}
      aria-hidden="true"
    />
  );
}

// ─── Steam ────────────────────────────────────────────────────────────────────
// Three soft wisps rising and dissolving — the bhar is always hot somewhere.
// Pure transform/opacity, removed entirely under prefers-reduced-motion.

function Steam({ className = '' }) {
  const calm = useCalmMotion();
  if (calm) return null;
  return (
    <span
      className={`pointer-events-none inline-flex items-end gap-[5px] ${className}`}
      aria-hidden="true"
    >
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="block h-5 w-[3px] rounded-full bg-[#C9A87A]/60 blur-[1.5px]"
          animate={{ y: [4, -14], opacity: [0, 0.85, 0], scaleY: [0.6, 1.3] }}
          transition={{
            repeat: Infinity,
            duration: 2.2,
            delay: i * 0.45,
            ease: 'easeInOut',
          }}
        />
      ))}
    </span>
  );
}

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
  // Over the dark hero photo the bar is transparent with cream lettering;
  // once the reader scrolls past the hero's top edge it settles onto cream
  // paper with dark ink. Fixes the name disappearing into the first photo.
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const hero = document.getElementById('home');
    if (!hero) {
      const onScroll = () => setScrolled(window.scrollY > window.innerHeight * 0.8);
      onScroll();
      window.addEventListener('scroll', onScroll, { passive: true });
      return () => window.removeEventListener('scroll', onScroll);
    }
    const io = new IntersectionObserver(
      ([entry]) => setScrolled(!entry.isIntersecting),
      { threshold: 0 },
    );
    io.observe(hero);
    setScrolled(hero.getBoundingClientRect().bottom <= 0);
    return () => io.disconnect();
  }, []);

  const links = [
    { href: '#philosophy', label: 'Philosophy' },
    { href: '#events', label: 'Events' },
    { href: '#reel', label: 'রিল' },
    { href: '#menu', label: 'Menu' },
    { href: '#books', label: 'বইপাড়া' },
  ];

  return (
    <header
      className={`fixed inset-x-0 top-0 z-40 transition-all duration-500 ${
        scrolled
          ? 'border-b border-[#5E3820]/15 bg-[rgba(245,240,230,0.92)] shadow-[0_10px_35px_rgba(28,18,8,0.10)] backdrop-blur-md'
          : 'border-b border-transparent bg-gradient-to-b from-[#1C1208]/95 via-[#1C1208]/80 to-[#1C1208]/65 backdrop-blur-sm'
      }`}
    >
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-8">
        <a href="#home" className="flex items-center gap-3">
          <img
            src={assetPath('/images/mime_logo.png')}
            alt="Art-Teas-Tree Cafe logo"
            className="h-10 w-10 shrink-0 rounded-full object-cover"
          />
          <span className="flex flex-col gap-0.5">
            <span
              className={`font-serif text-xl font-semibold sm:text-2xl ${
                scrolled ? 'text-[#1C1410]' : 'text-[#F5F0E6]'
              }`}
              style={{
                textShadow: scrolled
                  ? '0 1px 4px rgba(10,6,4,0.18)'
                  : '0 1px 16px rgba(10,6,4,0.95), 0 0 6px rgba(10,6,4,0.6)',
                transition: 'color 500ms, text-shadow 500ms',
              }}
            >
              Art-Teas-Tree
            </span>
            <span
              className={`font-hand text-sm sm:text-base ${
                scrolled ? 'text-[#5A6B3E]' : 'text-[#C9A87A]'
              }`}
              style={{
                textShadow: scrolled
                  ? '0 1px 3px rgba(10,6,4,0.12)'
                  : '0 1px 10px rgba(10,6,4,0.85)',
                transition: 'color 500ms, text-shadow 500ms',
              }}
            >
              National Mime Institute &mdash;{' '}
              <span className="font-bn">কলকাতা</span>
            </span>
          </span>
        </a>

        <div
          className={`hidden items-center gap-0.5 rounded-full border px-2 py-1 transition-colors duration-500 md:flex ${
            scrolled
              ? 'border-[#7A4A2A]/20 bg-[#EDE2CB]/65'
              : 'border-[#C9A87A]/25 bg-[#1C1208]/35 backdrop-blur-sm'
          }`}
        >
          {links.map(({ href, label }) => (
            <a
              key={href}
              href={href}
              className={`rounded-full px-4 py-2 font-body text-sm transition-colors ${
                scrolled
                  ? 'text-[#3B2418] hover:bg-[#7A4A2A]/10'
                  : 'text-[#F5F0E6]/85 hover:bg-[#F5F0E6]/10'
              }`}
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
 * HeroCarousel — a drag/swipe-scrollable strip of the café photos, built on
 * Embla (same engine as the events board). Loops endlessly, auto-advances
 * every HERO_AUTO_ADVANCE_MS, and pauses while hovered or mid-drag. Arrows,
 * dot indicators, and a playbill frame counter give explicit control.
 * Honors prefers-reduced-motion by not auto-advancing.
 */
function HeroCarousel() {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, duration: 32 });
  const [index, setIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const reduceMotion = useRef(false);

  // Capture the "calm motion" preference once on mount — reduced-motion OR a
  // phone-sized viewport. When true we skip the Ken Burns zoom and the
  // auto-advance timer; the strip is still swipeable and arrow/dot driven.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    reduceMotion.current =
      window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
      window.matchMedia('(max-width: 767px)').matches;
  }, []);

  // Track the selected slide, and pause the auto-advance the moment the
  // reader grabs the strip — a drag should never be fought by a timer.
  useEffect(() => {
    if (!emblaApi) return undefined;
    const onSelect = () => setIndex(emblaApi.selectedScrollSnap());
    const onPointerDown = () => setIsPaused(true);
    emblaApi.on('select', onSelect);
    emblaApi.on('pointerDown', onPointerDown);
    onSelect();
    return () => {
      emblaApi.off('select', onSelect);
      emblaApi.off('pointerDown', onPointerDown);
    };
  }, [emblaApi]);

  // Auto-advance timer. Pauses on hover/drag, or when the OS says not to
  // animate. Cleared on unmount / dependency change.
  useEffect(() => {
    if (!emblaApi || isPaused || reduceMotion.current) return undefined;
    const id = window.setInterval(() => emblaApi.scrollNext(), HERO_AUTO_ADVANCE_MS);
    return () => window.clearInterval(id);
  }, [emblaApi, isPaused]);

  return (
    <div
      className="absolute inset-0"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Scrollable photo strip — grab it and pull, or swipe on touch. */}
      <div
        ref={emblaRef}
        className="h-full cursor-grab overflow-hidden active:cursor-grabbing"
      >
        <div className="flex h-full touch-pan-y">
          {HERO_IMAGES.map((img, i) => (
            <div
              key={img.src}
              className="relative h-full min-w-0 flex-[0_0_100%] overflow-hidden"
            >
              {/* Ken Burns — the frame in view drifts slowly into a zoom,
                  like a rostrum camera over a still. Transform-only. */}
              <motion.img
                src={cldImg(img.src, { width: 2400 })}
                alt={img.alt}
                draggable={false}
                animate={{
                  scale: i === index && !reduceMotion.current ? 1.1 : 1,
                }}
                transition={{ duration: 8, ease: 'linear' }}
                className="h-full w-full select-none object-cover opacity-90 will-change-transform sm:opacity-80"
                style={{ filter: 'sepia(0.38) brightness(1.18) contrast(1.03) saturate(0.9)' }}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Manual nav arrows — copper-tinted, sit on the inner playbill margin.
          Shown on every breakpoint; sized down on phones with a ≥40px tap target. */}
      <button
        type="button"
        aria-label="Previous photo"
        onClick={() => emblaApi?.scrollPrev()}
        className="absolute left-2 top-1/2 z-20 grid min-h-[40px] min-w-[40px] -translate-y-1/2 place-content-center border border-[#C9A87A]/25 bg-[#1C1208]/55 p-2 text-[#C9A87A]/70 backdrop-blur-sm transition-all hover:border-[#C9A87A]/65 hover:bg-[#1C1208]/80 hover:text-[#F5F0E6] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C9A87A] sm:left-6 sm:p-3"
      >
        <ChevronLeft size={18} strokeWidth={1.5} className="sm:h-5 sm:w-5" aria-hidden="true" />
      </button>
      <button
        type="button"
        aria-label="Next photo"
        onClick={() => emblaApi?.scrollNext()}
        className="absolute right-2 top-1/2 z-20 grid min-h-[40px] min-w-[40px] -translate-y-1/2 place-content-center border border-[#C9A87A]/25 bg-[#1C1208]/55 p-2 text-[#C9A87A]/70 backdrop-blur-sm transition-all hover:border-[#C9A87A]/65 hover:bg-[#1C1208]/80 hover:text-[#F5F0E6] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C9A87A] sm:right-6 sm:p-3"
      >
        <ChevronRight size={18} strokeWidth={1.5} className="sm:h-5 sm:w-5" aria-hidden="true" />
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
              onClick={() => emblaApi?.scrollTo(i)}
              className={`h-[3px] rounded-none transition-all duration-500 ${
                isActive ? 'w-8 bg-[#C9A87A]' : 'w-4 bg-[#C9A87A]/30 hover:bg-[#C9A87A]/55'
              }`}
            />
          );
        })}
      </div>

      {/* Playbill frame counter + drag hint — bottom-right margin. */}
      <div className="pointer-events-none absolute bottom-20 right-8 z-20 hidden text-right sm:bottom-24 sm:block">
        <p className="font-typewriter text-[10px] uppercase tracking-[0.4em] text-[#C9A87A]/75">
          {String(index + 1).padStart(2, '0')} / {String(HERO_IMAGES.length).padStart(2, '0')}
        </p>
        <p className="mt-1 font-hand text-base text-[#C9A87A]/45">
          drag · টানুন →
        </p>
      </div>
    </div>
  );
}

function Hero({ onEventsClick }) {
  // Cinematic parallax — the photo layer drifts slower than the page so the
  // hero recedes like a backdrop on rails. Scale hides the travelling edge.
  // Disabled on mobile/reduced-motion: a full-screen image moving on every
  // scroll frame is the worst offender for handset jank.
  const calm = useCalmMotion();
  const { scrollY } = useScroll();
  const photoY = useTransform(scrollY, [0, 900], calm ? [0, 0] : [0, 180]);
  const reduceTitleMotion = useReducedMotion();

  return (
    <section id="home" className="relative min-h-[100dvh] overflow-hidden bg-[#1C1208]">
      {/* Auto-advancing photo carousel — replaces the previous single image */}
      <motion.div className="absolute inset-0" style={{ y: photoY, scale: calm ? 1 : 1.12 }}>
        <HeroCarousel />
      </motion.div>

      {/* Cinematic gradient — pointer-events-none so the carousel underneath
          stays draggable. Phones get a light top-to-bottom vignette (the
          desktop left-heavy wash blacked out the whole photo on a narrow
          screen); sm+ gets the original heavy-left playbill gradient. */}
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(28,18,8,0.55)_0%,rgba(28,18,8,0.12)_42%,rgba(28,18,8,0.94)_88%)] sm:bg-[linear-gradient(100deg,rgba(28,18,8,0.97)_0%,rgba(28,18,8,0.78)_48%,rgba(28,18,8,0.38)_100%)]" />
      <div className="pointer-events-none absolute inset-0 hidden bg-gradient-to-t from-[#1C1208]/95 via-transparent to-[#1C1208]/50 sm:block" />

      <motion.div
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        transition={{ duration: 1.3, ease: [0.22, 0.61, 0.36, 1] }}
        className="pointer-events-none relative z-10 mx-auto flex min-h-[100dvh] max-w-7xl flex-col justify-end px-6 pb-28 pt-36 sm:px-10 sm:pb-24 lg:pb-32"
      >
        <div className="relative max-w-3xl">

          {/* Playbill rule line */}
          <div className="mb-7 flex items-center gap-4">
            <div className="h-px w-10 bg-[#C9A87A]/55" />
            <p className="font-typewriter text-[9px] uppercase tracking-[0.48em] text-[#C9A87A]/70 sm:text-[10px]">
              National Mime Institute presents
            </p>
            <div className="h-px flex-1 bg-[#C9A87A]/55" />
          </div>

          {/* Main title — film-title-card reveal: each letter rises out of a
              clipped line, then "Café" blurs in underneath. Falls back to a
              static title under prefers-reduced-motion. */}
          <h1 className="font-serif leading-[0.88] text-[#F5F0E6]">
            {reduceTitleMotion ? (
              <span className="block text-[3.6rem] sm:text-[5.5rem] lg:text-[7.5rem]">
                Art-Teas-Tree
              </span>
            ) : (
              <motion.span
                variants={titleContainer}
                className="block overflow-hidden pb-[0.08em] text-[3.6rem] sm:text-[5.5rem] lg:text-[7.5rem]"
              >
                {'Art-Teas-Tree'.split('').map((ch, i) => (
                  <motion.span
                    key={i}
                    variants={titleLetter}
                    className="inline-block will-change-transform"
                  >
                    {ch}
                  </motion.span>
                ))}
              </motion.span>
            )}
            <motion.span
              initial={
                reduceTitleMotion
                  ? false
                  : { opacity: 0, y: 26, filter: 'blur(10px)' }
              }
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              transition={{ delay: 1.15, duration: 0.9, ease: [0.22, 0.61, 0.36, 1] }}
              className="mt-3 block text-[2.4rem] italic text-[#C9A87A] sm:text-[3.5rem] lg:text-[4.5rem]"
            >
              Café
            </motion.span>
          </h1>

          {/* Ornamental divider */}
          <div className="my-8 flex items-center gap-4">
            <div className="h-px flex-1 bg-[#C9A87A]/22" />
            <span className="text-[#C9A87A]/45">✦</span>
            <div className="h-px flex-1 bg-[#C9A87A]/22" />
          </div>

          {/* Tagline — full-strength cream with a soft shadow so it stays
              readable over whichever photo is behind it on mobile. */}
          <p
            className="font-serif text-2xl italic text-[#F5F0E6] sm:text-3xl"
            style={{ textShadow: '0 2px 22px rgba(10,6,4,0.85)' }}
          >
            "Where conversations steep slowly."
          </p>

          {/* Bengali subtitle */}
          <p
            className="mt-4 font-bn text-sm text-[#F5F0E6]/70 sm:text-base"
            style={{ textShadow: '0 2px 16px rgba(10,6,4,0.85)' }}
          >
            চা, থিয়েটার, আড্ডা &mdash; Bidhan Nagar, Kolkata
          </p>

          {/* CTAs — pointer-events restored here since the parent column is
              click-through to keep the photo strip draggable. */}
          <div className="pointer-events-auto mt-10 flex flex-wrap gap-3">
            <a
              href="#menu"
              className="inline-flex items-center gap-2 rounded-full bg-[#F5F0E6] px-6 py-3 font-body text-sm font-semibold uppercase tracking-[0.16em] text-[#1C1410] transition-colors hover:bg-[#EDE2CB]"
            >
              <Coffee size={17} /> Open menu
            </a>
            <button
              type="button"
              onClick={() => {
                onEventsClick();
                document.getElementById('events')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="inline-flex items-center gap-2 rounded-full border border-[#F5F0E6]/35 px-6 py-3 font-body text-sm font-semibold uppercase tracking-[0.16em] text-[#F5F0E6] transition-colors hover:bg-[#F5F0E6]/10"
            >
              <CalendarDays size={17} /> Events
            </button>
          </div>
        </div>
      </motion.div>

      {/* Scroll nudge */}
      <motion.div
        animate={{ y: [0, 9, 0] }}
        transition={{ repeat: Infinity, duration: 2.6, ease: 'easeInOut' }}
        className="pointer-events-none absolute bottom-8 left-1/2 z-20 hidden -translate-x-1/2 flex-col items-center gap-1.5 text-[#C9A87A]/45 sm:flex"
        aria-hidden="true"
      >
        <span className="font-typewriter text-[8px] uppercase tracking-[0.45em]">scroll</span>
        <ChevronDown size={14} />
      </motion.div>
    </section>
  );
}

// ─── Marquee ticker ───────────────────────────────────────────────────────────
// A slow film-credit crawl between the hero and the manifesto — the kind of
// strip that runs under an old single-screen cinema's marquee. Decorative,
// hence aria-hidden; duplicated content + -50% travel makes the loop seamless.

const TICKER_ITEMS = [
  'চা · cha',
  'adda',
  'theatre',
  'বই · books',
  'mime',
  'bidhan nagar · kolkata',
  'slow conversations',
];

function Ticker() {
  // One "reel" of items; rendered twice so the -50% translate loops cleanly.
  // Holds still on mobile / under prefers-reduced-motion so the compositor
  // isn't kept awake by a never-ending crawl on a handset.
  const calm = useCalmMotion();
  const reel = [...TICKER_ITEMS, ...TICKER_ITEMS];
  return (
    <div
      className="relative overflow-hidden border-y border-[#C9A87A]/20 bg-[#1C1208] py-3"
      aria-hidden="true"
    >
      <motion.div
        className="flex w-max items-center whitespace-nowrap"
        animate={calm ? undefined : { x: ['0%', '-50%'] }}
        transition={{ repeat: Infinity, duration: 48, ease: 'linear' }}
      >
        {[...reel, ...reel].map((item, i) => (
          <span
            key={i}
            className="flex items-center font-typewriter text-[10px] uppercase tracking-[0.4em] text-[#C9A87A]/55"
          >
            <span className="px-6">{item}</span>
            <span className="text-[#C9A87A]/25">✦</span>
          </span>
        ))}
      </motion.div>
    </div>
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
          National Mime
        </p>
        <p className="font-typewriter text-[9px] uppercase tracking-[0.35em] text-[#6B2D2D]/80">
          Institute
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
              Rooted in the spirit of the National Mime Institute, this is a place where silence
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

          {/* Director's notebook — dark card, tilted, taped to the page.
              On hover it straightens and lifts, as if picked off the wall. */}
          <motion.div
            initial={{ rotate: -0.9 }}
            whileHover={{ rotate: 0, scale: 1.02, y: -5 }}
            transition={{ type: 'spring', stiffness: 220, damping: 16 }}
            className="relative bg-[#2A1812] p-6 text-[#F5F0E6] shadow-[0_14px_45px_rgba(0,0,0,0.38)]"
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
              — National Mime Institute, founding note
            </p>
          </motion.div>

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
                Associated with the National Mime Institute
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
  // Skip the continuously-looping projector flicker + blinking REC dot on
  // mobile/reduced-motion — they repaint every frame for the whole section.
  const calm = useCalmMotion();

  const stripRef = useRef(null);
  const frameRefs = useRef([]);
  const go = (dir) => setActive((a) => (a + dir + total) % total);

  // Keep the active thumbnail in view — but only scroll if it isn't already
  // fully visible, so repeated arrow taps don't jitter the strip.
  useEffect(() => {
    const strip = stripRef.current;
    const el = frameRefs.current[active];
    if (!strip || !el) return;
    const stripRect = strip.getBoundingClientRect();
    const elRect = el.getBoundingClientRect();
    if (elRect.left < stripRect.left || elRect.right > stripRect.right) {
      const target = el.offsetLeft - (strip.clientWidth - el.clientWidth) / 2;
      strip.scrollTo({ left: target, behavior: 'smooth' });
    }
  }, [active]);

  return (
    <section
      id="reel"
      className="relative overflow-hidden bg-[#0E0805] px-5 py-24 text-[#F5F0E6] sm:px-8 lg:py-32"
    >
      {/* faint sepia vignette */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_30%,_rgba(28,18,8,0.7)_85%)]" />

      <div className="relative mx-auto max-w-6xl">
        {/* Section header */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.9, ease: [0.22, 0.61, 0.36, 1] }}
          className="grid gap-6 sm:flex sm:items-end sm:justify-between"
        >
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
        </motion.div>

        {/* ── Viewfinder ───────────────────────────────────────────── */}
        <div className="relative mx-auto mt-12 max-w-5xl">
          <ViewfinderCorners />

          {/* Film cell — black frame with sprocket holes on left + right */}
          <div className="relative aspect-[16/9] overflow-hidden border border-[#3B2418] bg-[#0A0604]">
            {/* Prev / next overlaid on the viewfinder photo */}
            <button
              type="button"
              aria-label="Previous frame"
              onClick={() => go(-1)}
              className="absolute left-5 top-1/2 z-20 grid min-h-[40px] min-w-[40px] -translate-y-1/2 place-content-center border border-[#C9A87A]/25 bg-[#1C1208]/70 p-2 text-[#C9A87A]/70 backdrop-blur-sm transition-all hover:border-[#C9A87A]/65 hover:bg-[#1C1208]/95 hover:text-[#F5F0E6] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C9A87A] sm:left-6"
            >
              <ChevronLeft size={18} strokeWidth={1.5} aria-hidden="true" />
            </button>
            <button
              type="button"
              aria-label="Next frame"
              onClick={() => go(1)}
              className="absolute right-5 top-1/2 z-20 grid min-h-[40px] min-w-[40px] -translate-y-1/2 place-content-center border border-[#C9A87A]/25 bg-[#1C1208]/70 p-2 text-[#C9A87A]/70 backdrop-blur-sm transition-all hover:border-[#C9A87A]/65 hover:bg-[#1C1208]/95 hover:text-[#F5F0E6] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C9A87A] sm:right-6"
            >
              <ChevronRight size={18} strokeWidth={1.5} aria-hidden="true" />
            </button>
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

              {/* Projector flicker — an uneven lamp behind the gate. Barely
                  perceptible opacity wobble, never above 6%. Skipped when calm. */}
              {!calm && (
                <motion.div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 bg-[#F5F0E6] mix-blend-overlay"
                  animate={{ opacity: [0.015, 0.05, 0.02, 0.06, 0.01, 0.04, 0.015] }}
                  transition={{ repeat: Infinity, duration: 1.1, ease: 'linear' }}
                />
              )}

              {/* HUD — top row */}
              <div className="pointer-events-none absolute inset-x-3 top-3 flex items-center justify-between font-typewriter text-[10px] uppercase tracking-[0.22em] text-[#C9A87A]/85 sm:inset-x-4 sm:top-4">
                <div className="flex items-center gap-2">
                  <motion.div
                    animate={calm ? undefined : { opacity: [1, 0.25, 1] }}
                    transition={calm ? undefined : { repeat: Infinity, duration: 1.4, ease: 'easeInOut' }}
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

          <div className="relative">
            <div ref={stripRef} className="relative overflow-x-auto pb-2">
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
                        ref={(el) => (frameRefs.current[i] = el)}
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
        </div>

        {/* Closing margin scribble — pastel chalk on dark, faded as if pencilled */}
        <p
          className="chalk-pencil-dark mt-10 inline-block font-hand text-xl text-chalk-butter"
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

  // Per-category counts for the filter chips.
  const counts = useMemo(() => {
    const c = { All: menuRows.length };
    for (const row of menuRows) c[row.category] = (c[row.category] || 0) + 1;
    return c;
  }, []);

  // Flat item count per category (used in group headers).
  const catCount = (cat) => Object.values(grouped[cat] ?? {}).flat().length;

  const filtered = useMemo(
    () => (active === 'All' ? menuRows : menuRows.filter((r) => r.category === active)),
    [active],
  );

  // Group filtered items by category → subcategory, preserving sheet order.
  const grouped = useMemo(() => {
    const groups = {};
    for (const item of filtered) {
      if (!groups[item.category]) groups[item.category] = {};
      const sub = item.subcategory || '';
      if (!groups[item.category][sub]) groups[item.category][sub] = [];
      groups[item.category][sub].push(item);
    }
    return groups;
  }, [filtered]);

  const orderedGroupKeys = CATEGORIES.filter((c) => c !== 'All' && grouped[c]);
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
        {/* Section heading */}
        <div className="mb-10">
          <SectionKicker className="mt-0.5">
            Cha, Ta, and Menu
          </SectionKicker>
          <h2 className="mt-3 font-serif text-5xl font-medium text-[#F5F0E6] sm:text-6xl">
            What's steeping today
            <Steam className="ml-3 -translate-y-2" />
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
            curvedLabel="Art-Teas-Tree · Cafe"
            style={{ transform: 'rotate(-8deg)' }}
          />

          {/* Torn top edge — cream paper appearing from the dark bg */}
          <TornEdge fill="#F5EDD6" />

          <div className="relative bg-[#F5EDD6] bg-paper px-5 py-8 text-[#1C1410] shadow-[0_22px_65px_rgba(0,0,0,0.42)] sm:px-8 sm:py-10">

            {/* Letterhead: café name, then the ticket-booth motif hanging just
                beneath it — tight gap above, generous gap below before the tabs. */}
            <div className="select-none text-center">
              <p className="font-meta text-[9px] uppercase text-[#5E3820]/85 whitespace-nowrap">
                <span className="mr-[-0.45em] inline-block tracking-[0.45em]">Art-Teas-Tree · Café</span>
              </p>
              <TicketBooth className="mx-auto mt-2 mb-8 w-24 opacity-90 sm:mt-3 sm:mb-9 sm:w-32 md:mb-10 md:w-40" />
            </div>

            {/* Category filters — ink-stamped labels with item counts.
                Counts let the cafe grow the menu indefinitely without the chips
                becoming opaque. */}
            <div className="mb-8 flex flex-wrap gap-2 border-b border-[#7A4A2A]/18 pb-5">
              {CATEGORIES.map((cat) => {
                const count = counts[cat] ?? 0;
                const isActive = active === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setActive(cat)}
                    aria-pressed={isActive}
                    className={`group flex items-baseline gap-2 rounded-none border px-4 py-2 font-typewriter text-xs uppercase tracking-[0.2em] transition-colors ${
                      isActive
                        ? 'border-[#3B2418] bg-[#3B2418] text-[#F5EDD6]'
                        : 'border-[#7A4A2A]/30 bg-transparent text-[#3B2418] hover:bg-[#7A4A2A]/10'
                    }`}
                  >
                    <span>{cat}</span>
                    <span
                      className={`font-meta text-[9px] tracking-[0.15em] ${
                        isActive ? 'text-[#C9A87A]' : 'text-[#7A4A2A]/85'
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
                          <h3 className="font-serif text-2xl italic text-[#3B2418]">{cat}</h3>
                          {CATEGORY_NOTES[cat] && (
                            <span className="font-typewriter text-[9px] uppercase tracking-[0.2em] text-[#5A6B3E]/80">
                              {CATEGORY_NOTES[cat]}
                            </span>
                          )}
                          <p className="ml-auto font-meta text-[9px] uppercase tracking-[0.28em] text-[#7A4A2A]/85">
                            {catCount(cat)} {catCount(cat) === 1 ? 'item' : 'items'}
                          </p>
                        </header>
                      )}
                      {Object.entries(grouped[cat]).map(([sub, items]) => (
                        <div key={sub} className="mb-4">
                          {sub && (
                            <div className="mb-2 flex items-baseline gap-2 border-b border-[#7A4A2A]/12 pb-1">
                              <h4 className="font-serif text-lg italic text-[#7A4A2A]">{sub}</h4>
                            </div>
                          )}
                          <div className="grid gap-0 sm:grid-cols-2 sm:gap-x-8">
                            {items.map((item) => {
                              const pd = item.priceDisplay ?? (item.price != null ? `₹${item.price}` : '');
                              const longPrice = pd.length > 15;
                              return (
                              <motion.article
                                layout
                                key={item.id}
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -6 }}
                                transition={{ duration: 0.3 }}
                                className="border-b border-[#7A4A2A]/14 py-4 last:border-b-0"
                              >
                                {longPrice ? (
                                  <div>
                                    <h5 className="font-serif text-xl text-[#1C1410]">{item.itemName}</h5>
                                    <p className="mt-0.5 font-typewriter text-sm text-[#7A4A2A]">{pd}</p>
                                  </div>
                                ) : (
                                  <div className="flex items-start justify-between gap-4">
                                    <h5 className="font-serif text-xl text-[#1C1410]">{item.itemName}</h5>
                                    {pd && <span className="shrink-0 ml-4 font-typewriter text-base text-[#7A4A2A]">{pd}</span>}
                                  </div>
                                )}
                              </motion.article>
                              );
                            })}
                            {cat === 'Performance' && sub === 'Lead Role' && (
                              <MenuIllustration
                                src="/kebab-performer.png"
                                placement="grid"
                                rotate={-2}
                                width={400}
                                height={483}
                                // Widened from the sandwich performer's !w-24/32/40 baseline —
                                // this asset's aspect ratio (0.83 w/h) is less elongated, so
                                // matching those exact tokens would render ~17-20% shorter and
                                // break visual parity between the pair. Bumped to land on the
                                // same ~140/187/234px height budget instead. First illustration
                                // in the section, so it also gets extra rhythm spacing beyond
                                // the shared wrapper's own py-6 sm:py-2.
                                className="!w-28 opacity-95 my-8 sm:my-3 sm:!w-36 md:my-4 md:!w-48"
                                // Lighter than the default baked-in shadow — this illustration's
                                // open, gestural silhouette needs less separation from the paper.
                                style={{ filter: 'drop-shadow(0 1px 4px rgba(0,0,0,0.05))' }}
                              />
                            )}
                            {cat === 'Performance' && sub === 'Chicken in Cameo Role' && (
                              <MenuIllustration
                                src="/sandwich-performer.png"
                                placement="grid"
                                rotate={2}
                                width={420}
                                height={613}
                                // Sized by height, not the size-token width scale — this
                                // illustration's aspect ratio (0.68 w/h) means matching the
                                // usual `lg` width would render ~330px tall on desktop,
                                // dominating the subsection. !w-* pins the intended visual
                                // scale (roughly a 128/176/224px accent) by width instead.
                                className="!w-24 opacity-95 sm:!w-32 md:!w-40"
                              />
                            )}
                          </div>
                        </div>
                      ))}
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
              <p className="mt-2 text-right font-meta text-[9px] uppercase tracking-[0.3em] text-[#7A4A2A]/85">
                scroll for more &darr;
              </p>
            )}

            {/* Handwritten footer note — pastel chalk, soaked into the paper */}
            <p className="chalk-pencil mt-8 inline-block font-hand text-xl text-chalk-ink">
              ✦ ask us what's fresh today
            </p>

            {/* Margin-note cross-link to the events section */}
            <p className="mt-4 font-hand text-lg text-[#5A6B3E]/70">
              catching a show this week?{' '}
              <a href="#events" className="underline decoration-dotted underline-offset-2 hover:text-[#5A6B3E]">
                see what's on →
              </a>
            </p>

            {/* Curtain call — the performers have exited, only their shoes
                remain. Closing signature for the menu card itself, not tied
                to any category — renders identically regardless of which tab
                is active. Centered, with room either side for future footer
                content; asymmetric spacing anchors it to the closing edge. */}
            <MenuIllustration
              src="/curtain-call-legs.png"
              placement="closing-signature"
              rotate={0}
              width={220}
              height={214}
              className="!w-[72px] opacity-90 sm:!w-[88px] md:!w-[104px]"
            />
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
    { label: 'Bidhan Nagar, Sector-II', Icon: MapPin },
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
              <motion.div
                key={i}
                initial={{ y: 36, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ delay: i * 0.04, duration: 0.5, ease: [0.22, 0.61, 0.36, 1] }}
                whileHover={{
                  y: -14,
                  transition: { type: 'spring', stiffness: 320, damping: 18 },
                }}
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
              </motion.div>
            ))}
          </div>
          <p className="chalk-pencil-dark mt-3 font-hand text-sm text-chalk-butter">
            ↑ a sliver of what's there today. the shelf changes weekly.
          </p>
        </motion.div>

        {/* Book donation callout — a pinned handbill on the Boipara wall */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.9, delay: 0.3 }}
          className="mt-16 flex justify-center"
        >
          <div
            className="relative w-full max-w-2xl bg-[#F5F0E6] px-6 py-8 text-[#1C1410] shadow-[0_26px_60px_-18px_rgba(0,0,0,0.5)] sm:px-10 sm:py-10"
            style={{ transform: 'rotate(-1deg)' }}
          >
            {/* pinned with washi tape */}
            <WashiTape className="-top-3 left-1/2 -translate-x-1/2" width={132} rotate={2} />

            <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:gap-6">
              <span
                aria-hidden="true"
                className="grid h-14 w-14 shrink-0 place-content-center rounded-full border border-[#5A6B3E]/40 bg-[#5A6B3E]/10 text-[#5A6B3E]"
              >
                <HeartHandshake size={26} strokeWidth={1.6} />
              </span>
              <div>
                <p className="font-typewriter text-[10px] uppercase tracking-[0.32em] text-[#7A4A2A]">
                  Donate a book
                </p>
                <h3 className="mt-1 font-hand text-3xl leading-tight text-[#3B2418] sm:text-4xl">
                  Have a book looking for a new reader?
                </h3>
              </div>
            </div>

            <p className="mt-5 font-body text-base leading-7 text-[#3B2418]/80">
              Bring it in. The shelf is always open to a new arrival — leave it at the counter, or
              write to us first and it finds its place on the College Street wall.
            </p>

            <div className="mt-6 flex flex-col gap-3 border-t border-[#1C1410]/12 pt-5 sm:flex-row sm:items-center sm:justify-between">
              <a
                href="mailto:Art.teas.tree.cafe@gmail.com"
                className="inline-flex items-center gap-2 font-typewriter text-sm tracking-wide text-[#5E3820] underline decoration-[#5A6B3E]/40 underline-offset-4 transition-colors hover:text-[#5A6B3E] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5A6B3E]"
              >
                <BookOpen size={16} strokeWidth={1.6} aria-hidden="true" />
                Art.teas.tree.cafe@gmail.com
              </a>
              <p className="font-typewriter text-[10px] uppercase tracking-[0.28em] text-[#1C1410]/45">
                Walk in · Sector-II, Salt Lake City, Kolkata
              </p>
            </div>
          </div>
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
          <p className="mt-2 inline-block font-hand text-2xl text-[#C9A87A]">
            where conversations steep slowly
          </p>
          <p className="mt-4 font-bn text-base text-[#F5F0E6]/40">
            ন্যাশনাল মাইম ইনস্টিটিউট
          </p>
        </div>

        {/* Info */}
        <div className="space-y-3 font-body text-sm leading-7 text-[#F5F0E6]/68">
          <p className="flex items-start gap-3">
            <MapPin size={16} className="mt-1 shrink-0" />
            CK-7, CK Block, Sector II, Salt Lake City, Bidhannagar, Kolkata 700091
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
            <span>
              Associated with the{' '}
              <a
                href={site.affiliation.url}
                target="_blank"
                rel="noopener noreferrer"
                className="underline decoration-[#C9A87A]/40 underline-offset-4 transition-colors hover:text-[#C9A87A] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#C9A87A]"
              >
                {site.affiliation.name}
              </a>
            </span>
          </p>
        </div>

        {/* Sign-off */}
        <div className="md:text-right">
          <p className="inline-block font-hand text-4xl text-[#C9A87A]">
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
  const [activeEventPanel, setActiveEventPanel] = useState(null);

  return (
    <div className="relative min-h-screen font-body text-[#1C1410]">
      {/* Animated cinematic film grain — fixed overlay, sits above everything */}
      <div className="film-grain" aria-hidden="true" />

      <ScrollProgress />
      <Nav />

      <main>
        <Hero onEventsClick={() => setActiveEventPanel(null)} />
        <Ticker />
        {/* Notice board first — what's on at the café matters more to a
            visitor than the manifesto. */}
        <EventsSection active={activeEventPanel} onSetActive={setActiveEventPanel} />
        <Philosophy />
        <Reel />
        <Menu />
        <Books />
      </main>

      <Footer />
    </div>
  );
}
