// Demo 3 — artists.artteastree.com (the dedicated directory subdomain).
// Designed to live INSIDE the mockup deck and screenshot cleanly, so it's
// stateless and renders the search/filter chrome as if pre-applied.

import { Search, ChevronDown, MapPin } from 'lucide-react';
import { MOCKUP_ARTISTS, MOCKUP_CRAFTS } from '../../../data/mockupData.js';

export default function DirectoryMockup({ activeFilter = 'All', searchValue = '' }) {
  // For the filtered-view mockup we narrow visually; the homepage view passes
  // 'All' so all twelve artists render.
  const visible =
    activeFilter === 'All'
      ? MOCKUP_ARTISTS
      : MOCKUP_ARTISTS.filter((a) => a.craft === activeFilter);

  return (
    <div className="relative min-h-screen bg-[#F5EDD6] bg-paper text-[#1C1410]">
      {/* Browser chrome — sets the "this is a webapp at a subdomain" context */}
      <div className="border-b border-[#7A4A2A]/22 bg-[#EDE2CB] px-5 py-2 sm:px-8">
        <div className="mx-auto flex max-w-6xl items-center gap-2">
          <div className="flex gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-[#C73A2D]/55" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#C9A87A]/65" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#5A6B3E]/65" />
          </div>
          <div className="ml-3 flex flex-1 items-center gap-2 rounded-sm border border-[#7A4A2A]/22 bg-[#F5EDD6] px-3 py-1 font-typewriter text-[10px] uppercase tracking-[0.18em] text-[#7A4A2A]">
            <span className="text-[#5A6B3E]">●</span>
            artists.artteastree.com
            <span className="ml-auto text-[#7A4A2A]/45">secure · live</span>
          </div>
        </div>
      </div>

      {/* Header band — Bengali title + cafe affiliation */}
      <header className="relative border-b border-[#7A4A2A]/22 px-5 py-12 sm:px-8 sm:py-16">
        <div className="mx-auto max-w-6xl">
          <p className="font-typewriter text-[10px] uppercase tracking-[0.42em] text-[#7A4A2A]/70">
            Mime Institute of Calcutta · directory
          </p>
          <div className="mt-4 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="font-bn text-4xl text-[#5E3820]">নাট্যমঞ্চ</p>
              <h1 className="mt-1 font-serif text-5xl font-medium leading-[0.95] text-[#1C1410] sm:text-6xl">
                The Stage <span className="font-serif italic text-[#7A4A2A]">— every voice</span>
              </h1>
            </div>
            <div className="flex items-center gap-2 self-start lg:self-end">
              <a
                href="#"
                className="border border-[#7A4A2A]/30 px-4 py-2 font-typewriter text-[10px] uppercase tracking-[0.22em] text-[#3B2418] transition-colors hover:bg-[#7A4A2A]/10"
              >
                ← back to cafe
              </a>
              <a
                href="#"
                className="bg-[#6B2D2D] px-4 py-2 font-body text-xs font-semibold uppercase tracking-[0.18em] text-[#F5EDD6] transition-colors hover:bg-[#4A1E1E]"
              >
                Apply to the stage
              </a>
            </div>
          </div>

          <p className="mt-6 max-w-2xl font-body text-base leading-7 text-[#5E3820]">
            A growing roster of artists in residence at Art-Teas-Tree Cafe. Search by craft,
            language, or availability. Reach out directly — or let our concierge introduce you.
          </p>

          {/* Stats line */}
          <div className="mt-6 flex flex-wrap items-center gap-x-8 gap-y-2 font-typewriter text-[10px] uppercase tracking-[0.28em] text-[#7A4A2A]">
            <span>
              <strong className="text-[#3B2418]">{String(MOCKUP_ARTISTS.length).padStart(2, '0')}</strong> artists
            </span>
            <span>·</span>
            <span>
              <strong className="text-[#3B2418]">09</strong> crafts
            </span>
            <span>·</span>
            <span>
              <strong className="text-[#3B2418]">04</strong> languages
            </span>
            <span>·</span>
            <span className="text-[#5A6B3E]">roster open</span>
          </div>
        </div>
      </header>

      {/* Search + filter bar */}
      <div className="sticky top-0 z-20 border-b border-[#7A4A2A]/22 bg-[#F5EDD6]/95 px-5 py-4 backdrop-blur sm:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            {/* Search */}
            <label className="flex flex-1 items-center gap-3 border border-[#7A4A2A]/30 bg-[#FFF9EC] px-4 py-2.5">
              <Search size={16} className="text-[#7A4A2A]" />
              <input
                readOnly
                value={searchValue}
                placeholder="Search by name, craft, or language…"
                className="w-full bg-transparent font-body text-sm text-[#1C1410] outline-none placeholder:font-typewriter placeholder:text-[10px] placeholder:uppercase placeholder:tracking-[0.18em] placeholder:text-[#7A4A2A]/55"
              />
              <span className="font-typewriter text-[9px] uppercase tracking-[0.22em] text-[#7A4A2A]/50">
                ⌘K
              </span>
            </label>

            {/* Sort */}
            <button
              type="button"
              className="flex shrink-0 items-center gap-2 border border-[#7A4A2A]/30 bg-[#FFF9EC] px-4 py-2.5 font-typewriter text-[10px] uppercase tracking-[0.22em] text-[#3B2418] transition-colors hover:bg-[#7A4A2A]/10"
            >
              Sort · recently added
              <ChevronDown size={14} />
            </button>
          </div>

          {/* Craft chips */}
          <div className="mt-3 flex gap-1.5 overflow-x-auto pb-1">
            {MOCKUP_CRAFTS.map((c) => {
              const isActive = c === activeFilter;
              return (
                <button
                  key={c}
                  type="button"
                  className={`shrink-0 border px-3 py-1.5 font-typewriter text-[10px] uppercase tracking-[0.22em] transition-colors ${
                    isActive
                      ? 'border-[#3B2418] bg-[#3B2418] text-[#F5EDD6]'
                      : 'border-[#7A4A2A]/30 bg-transparent text-[#3B2418] hover:bg-[#7A4A2A]/10'
                  }`}
                >
                  {c}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Result strip */}
      <div className="px-5 pt-6 sm:px-8">
        <div className="mx-auto flex max-w-6xl items-baseline justify-between">
          <p className="font-hand text-xl text-[#5E3820]">
            {visible.length === MOCKUP_ARTISTS.length
              ? `Showing all ${visible.length} artists`
              : `${visible.length} of ${MOCKUP_ARTISTS.length} match`}
          </p>
          <p className="font-typewriter text-[10px] uppercase tracking-[0.24em] text-[#7A4A2A]/55">
            updated weekly
          </p>
        </div>
      </div>

      {/* Artist grid */}
      <main className="px-5 pb-16 pt-6 sm:px-8 sm:pb-24">
        <div className="mx-auto grid max-w-6xl gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((a) => (
            <article
              key={a.id}
              className="group flex flex-col border border-[#7A4A2A]/22 bg-[#EDE2CB] transition-shadow hover:shadow-[0_18px_45px_-15px_rgba(0,0,0,0.45)]"
            >
              <div className="relative aspect-[4/3] overflow-hidden border-b border-[#3B2418]/10">
                <img
                  src={a.imageUrl}
                  alt=""
                  loading="lazy"
                  className="h-full w-full object-cover sepia"
                />
                <span className="absolute left-2 top-2 bg-[#1C1208]/82 px-2 py-0.5 font-typewriter text-[9px] uppercase tracking-[0.22em] text-[#C9A87A]">
                  {a.craft}
                </span>
                {a.available && (
                  <span className="absolute right-2 top-2 border border-[#5A6B3E] bg-[#F5EDD6]/92 px-2 py-0.5 font-typewriter text-[9px] uppercase tracking-[0.18em] text-[#5A6B3E]">
                    free · {a.available}
                  </span>
                )}
              </div>
              <div className="flex flex-1 flex-col gap-3 p-4">
                <div>
                  <h3 className="font-serif text-xl font-medium leading-tight text-[#1C1410]">
                    {a.name}
                  </h3>
                  <p className="mt-0.5 flex items-center gap-1.5 font-typewriter text-[9px] uppercase tracking-[0.22em] text-[#7A4A2A]/70">
                    <MapPin size={11} /> {a.location} · {a.languages.join(' · ')}
                  </p>
                </div>
                <p className="line-clamp-3 font-body text-sm leading-6 text-[#5E3820]">
                  {a.bio}
                </p>
                <div className="mt-auto flex items-center justify-between pt-2">
                  <div className="flex flex-wrap gap-1">
                    {a.tags.slice(0, 2).map((t) => (
                      <span
                        key={t}
                        className="border border-[#7A4A2A]/22 px-1.5 py-0.5 font-typewriter text-[8px] uppercase tracking-[0.18em] text-[#7A4A2A]"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                  <a
                    href={`/artists/${a.slug}`}
                    className="font-hand text-base text-[#7A4A2A] transition-colors hover:text-[#3B2418]"
                  >
                    view →
                  </a>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* Pagination */}
        <div className="mx-auto mt-12 flex max-w-6xl items-center justify-between border-t border-[#7A4A2A]/22 pt-6">
          <p className="font-typewriter text-[10px] uppercase tracking-[0.22em] text-[#7A4A2A]/55">
            page 01 of 04
          </p>
          <div className="flex items-center gap-1">
            {['01', '02', '03', '04'].map((p, i) => (
              <button
                key={p}
                type="button"
                className={`h-8 w-8 border font-typewriter text-[10px] tracking-[0.18em] transition-colors ${
                  i === 0
                    ? 'border-[#3B2418] bg-[#3B2418] text-[#F5EDD6]'
                    : 'border-[#7A4A2A]/30 text-[#3B2418] hover:bg-[#7A4A2A]/10'
                }`}
              >
                {p}
              </button>
            ))}
            <button
              type="button"
              className="ml-2 border border-[#7A4A2A]/30 px-3 py-1.5 font-typewriter text-[10px] uppercase tracking-[0.22em] text-[#3B2418] transition-colors hover:bg-[#7A4A2A]/10"
            >
              next →
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
