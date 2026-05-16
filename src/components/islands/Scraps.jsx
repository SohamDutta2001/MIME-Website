// Reusable scrapbook + cultural-motif fragments.
// Pure SVG / Tailwind, no Framer dependency — drop them anywhere in CafeApp.

export function WashiTape({
  className = '',
  color = '#C9A87A',
  width = 110,
  height = 26,
  rotate = -3,
  style,
}) {
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute z-20 select-none ${className}`}
      style={{
        width,
        height,
        transform: `rotate(${rotate}deg)`,
        backgroundColor: color,
        opacity: 0.78,
        boxShadow: '0 2px 6px -2px rgba(0,0,0,0.25)',
        backgroundImage:
          'repeating-linear-gradient(135deg, rgba(255,255,255,0.10) 0 4px, transparent 4px 9px)',
        clipPath:
          'polygon(2% 12%, 12% 0%, 28% 14%, 44% 2%, 60% 16%, 76% 4%, 92% 14%, 100% 6%, 98% 86%, 90% 100%, 74% 88%, 58% 100%, 42% 86%, 26% 100%, 10% 88%, 0% 96%)',
        ...style,
      }}
    />
  );
}

export function CoffeeRing({
  className = '',
  size = 130,
  color = '#5E3820',
  rotate = 0,
  style,
}) {
  // Imperfect ring — a coffee cup left a stain. Two arcs, slight wobble.
  return (
    <svg
      aria-hidden="true"
      className={`pointer-events-none absolute z-10 select-none ${className}`}
      width={size}
      height={size}
      viewBox="0 0 100 100"
      style={{
        opacity: 0.22,
        transform: `rotate(${rotate}deg)`,
        mixBlendMode: 'multiply',
        ...style,
      }}
    >
      <defs>
        <filter id="ringRough">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="3" />
          <feDisplacementMap in="SourceGraphic" scale="2.4" />
        </filter>
      </defs>
      <g filter="url(#ringRough)" stroke={color} fill="none" strokeLinecap="round">
        <path
          d="M 12 50 a 38 38 0 1 0 76 0 a 38 38 0 1 0 -76 0"
          strokeWidth="3.2"
          strokeDasharray="180 18 80 24 60"
        />
        <path
          d="M 18 50 a 32 32 0 1 0 64 0 a 32 32 0 1 0 -64 0"
          strokeWidth="1.4"
          strokeDasharray="60 18 120 14"
          opacity="0.55"
        />
      </g>
    </svg>
  );
}

export function InkCorrection({
  children = 'edit ↘',
  className = '',
  rotate = -4,
  // Pastel rose default — feels like aged red pencil rather than fresh ink.
  // Override with `color` prop when a specific shade is needed.
  color = '#C99A93',
  style,
}) {
  return (
    <span
      aria-hidden="true"
      className={`pointer-events-none absolute z-20 select-none font-hand ${className}`}
      style={{
        transform: `rotate(${rotate}deg)`,
        color,
        // Soft halo instead of hard shadow — the mark feels absorbed by paper
        textShadow: '0 0 1px rgba(255, 248, 232, 0.4)',
        ...style,
      }}
    >
      {children}
    </span>
  );
}

/**
 * Side-view of a Kolkata clay bhar (চায়ের ভাঁড়).
 * Terracotta-toned, rough-edged, with a steam wisp.
 * Used as a section divider/anchor.
 */
export function BharCup({ size = 96, className = '', style }) {
  return (
    <svg
      aria-hidden="true"
      className={`select-none ${className}`}
      width={size}
      height={size * 1.15}
      viewBox="0 0 100 115"
      style={style}
    >
      <defs>
        <linearGradient id="bharBody" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#A85A3A" />
          <stop offset="55%" stopColor="#7A3A22" />
          <stop offset="100%" stopColor="#4A1E12" />
        </linearGradient>
        <filter id="bharRough">
          <feTurbulence type="fractalNoise" baseFrequency="1.4" numOctaves="2" seed="5" />
          <feDisplacementMap in="SourceGraphic" scale="1.2" />
        </filter>
      </defs>

      {/* steam — three soft wisps */}
      <g stroke="#5E3820" strokeOpacity="0.32" strokeWidth="1.2" fill="none" strokeLinecap="round">
        <path d="M 38 20 C 34 14, 42 10, 38 4" />
        <path d="M 50 18 C 46 12, 54 8, 50 2" />
        <path d="M 62 20 C 58 14, 66 10, 62 4" />
      </g>

      {/* rim (slightly elliptical) */}
      <ellipse cx="50" cy="34" rx="32" ry="5" fill="#8C4528" />
      <ellipse cx="50" cy="33" rx="32" ry="4.5" fill="#5A2A18" />

      {/* body — flared cup */}
      <g filter="url(#bharRough)">
        <path
          d="M 18 34 C 22 70, 30 100, 50 110 C 70 100, 78 70, 82 34 Z"
          fill="url(#bharBody)"
        />
        {/* throwing-wheel rings */}
        <path d="M 22 50 Q 50 56, 78 50" stroke="#3B1A10" strokeOpacity="0.35" fill="none" strokeWidth="0.8" />
        <path d="M 24 64 Q 50 70, 76 64" stroke="#3B1A10" strokeOpacity="0.30" fill="none" strokeWidth="0.8" />
        <path d="M 26 80 Q 50 86, 74 80" stroke="#3B1A10" strokeOpacity="0.28" fill="none" strokeWidth="0.8" />
      </g>

      {/* highlight */}
      <path
        d="M 22 38 C 26 60, 32 84, 44 98"
        stroke="#D88860"
        strokeOpacity="0.35"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
      />
    </svg>
  );
}

/**
 * A handmade coaster — concentric ink rings on rough card, with a small handwritten label.
 * Used as a section anchor / decorative interruption.
 */
export function CoasterStamp({
  size = 130,
  className = '',
  label = 'adda · est.',
  bn = 'আড্ডা',
  style,
}) {
  return (
    <div
      aria-hidden="true"
      className={`relative shrink-0 select-none ${className}`}
      style={{ width: size, height: size, ...style }}
    >
      <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full">
        <defs>
          <filter id="coasterRough">
            <feTurbulence type="fractalNoise" baseFrequency="1.1" numOctaves="2" seed="9" />
            <feDisplacementMap in="SourceGraphic" scale="1.4" />
          </filter>
          <radialGradient id="coasterFill" cx="0.5" cy="0.45" r="0.6">
            <stop offset="0%" stopColor="#EDE2CB" />
            <stop offset="100%" stopColor="#C9A87A" />
          </radialGradient>
        </defs>

        {/* card body — slightly off-round */}
        <g filter="url(#coasterRough)">
          <circle cx="50" cy="50" r="46" fill="url(#coasterFill)" opacity="0.92" />
        </g>

        {/* concentric ink rings */}
        <g fill="none" stroke="#3B2418" strokeOpacity="0.55">
          <circle cx="50" cy="50" r="42" strokeWidth="0.7" strokeDasharray="2 3" />
          <circle cx="50" cy="50" r="34" strokeWidth="1.1" />
          <circle cx="50" cy="50" r="26" strokeWidth="0.6" strokeDasharray="3 2" />
        </g>

        {/* tiny corner crack */}
        <path d="M 8 56 L 14 52 L 12 60 Z" fill="#1C1410" opacity="0.18" />
      </svg>

      {/* labels — overlap with handwriting */}
      <p
        className="absolute inset-0 grid place-content-center text-center font-hand text-[#3B2418]"
        style={{ transform: 'rotate(-3deg)', lineHeight: 1.05 }}
      >
        <span className="font-bn text-2xl">{bn}</span>
        <span className="mt-0.5 font-typewriter text-[8px] uppercase tracking-[0.3em] text-[#7A4A2A]">
          {label}
        </span>
      </p>
    </div>
  );
}

/**
 * A thin red wavy underline — like a teacher's pencil edit.
 * Drop near any phrase you want to feel "marked up".
 */
export function PencilUnderline({ width = 140, className = '', color = '#8B2D2D', style }) {
  return (
    <svg
      aria-hidden="true"
      className={`pointer-events-none absolute z-10 select-none ${className}`}
      width={width}
      height="10"
      viewBox="0 0 140 10"
      style={style}
    >
      <path
        d="M 2 6 Q 14 1, 28 6 T 56 6 T 84 6 T 112 6 T 138 6"
        fill="none"
        stroke={color}
        strokeOpacity="0.65"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}
