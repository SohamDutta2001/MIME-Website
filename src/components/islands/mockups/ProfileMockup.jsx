// Demo 3 — single artist profile page.
// Reads /artists/anirban-chatterjee in spirit. Pulls Anirban from the mockup
// roster so the chat-booking script and this page agree on details.

import { Mail, MapPin, Calendar, Languages, Sparkles, ArrowLeft } from 'lucide-react';
import { MOCKUP_FEATURED_ARTIST, MOCKUP_ARTISTS } from '../../../data/mockupData.js';

export default function ProfileMockup() {
  const artist = MOCKUP_FEATURED_ARTIST;
  // Related artists: same craft, excluding self. Fall back to first three others.
  const related = MOCKUP_ARTISTS.filter(
    (a) => a.id !== artist.id && a.craft === artist.craft,
  )
    .slice(0, 3)
    .concat(MOCKUP_ARTISTS.filter((a) => a.id !== artist.id))
    .slice(0, 3);

  return (
    <div className="min-h-screen bg-[#F5EDD6] bg-paper text-[#1C1410]">
      {/* Browser chrome */}
      <div className="border-b border-[#7A4A2A]/22 bg-[#EDE2CB] px-5 py-2 sm:px-8">
        <div className="mx-auto flex max-w-6xl items-center gap-2">
          <div className="flex gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-[#C73A2D]/55" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#C9A87A]/65" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#5A6B3E]/65" />
          </div>
          <div className="ml-3 flex flex-1 items-center gap-2 rounded-sm border border-[#7A4A2A]/22 bg-[#F5EDD6] px-3 py-1 font-typewriter text-[10px] uppercase tracking-[0.18em] text-[#7A4A2A]">
            <span className="text-[#5A6B3E]">●</span>
            artists.artteastree.com/{artist.slug}
            <span className="ml-auto text-[#7A4A2A]/45">profile</span>
          </div>
        </div>
      </div>

      {/* Breadcrumb */}
      <div className="border-b border-[#7A4A2A]/22 px-5 py-3 sm:px-8">
        <div className="mx-auto flex max-w-6xl items-center gap-2 font-typewriter text-[10px] uppercase tracking-[0.22em] text-[#7A4A2A]/65">
          <a href="#" className="flex items-center gap-1 hover:text-[#3B2418]">
            <ArrowLeft size={11} /> directory
          </a>
          <span>/</span>
          <span>{artist.craft}</span>
          <span>/</span>
          <span className="text-[#3B2418]">{artist.name}</span>
        </div>
      </div>

      <main className="mx-auto max-w-6xl px-5 py-10 sm:px-8 sm:py-14">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.4fr] lg:gap-14">
          {/* Left column — portrait + identity card */}
          <div>
            {/* Portrait */}
            <div className="relative">
              <div className="absolute -left-2 -top-2 h-full w-full border border-[#7A4A2A]/25" aria-hidden="true" />
              <img
                src={artist.imageUrl}
                alt=""
                className="relative w-full border border-[#7A4A2A]/30 object-cover sepia"
                style={{ aspectRatio: '4/5' }}
              />
              <span className="absolute right-3 top-3 border border-[#5A6B3E] bg-[#F5EDD6]/92 px-2 py-1 font-typewriter text-[10px] uppercase tracking-[0.18em] text-[#5A6B3E]">
                free · {artist.available}
              </span>
            </div>

            {/* Identity panel */}
            <div className="mt-6 border border-[#7A4A2A]/22 bg-[#FFF9EC]/85 p-5">
              <p className="font-typewriter text-[10px] uppercase tracking-[0.32em] text-[#7A4A2A]">
                in residence · profile no. {String(artist.id).padStart(3, '0')}
              </p>
              <ul className="mt-4 space-y-3 font-body text-sm text-[#3B2418]">
                <li className="flex items-start gap-2">
                  <MapPin size={14} className="mt-0.5 shrink-0 text-[#7A4A2A]" />
                  {artist.location}, West Bengal
                </li>
                <li className="flex items-start gap-2">
                  <Languages size={14} className="mt-0.5 shrink-0 text-[#7A4A2A]" />
                  {artist.languages.join(' · ')}
                </li>
                <li className="flex items-start gap-2">
                  <Calendar size={14} className="mt-0.5 shrink-0 text-[#7A4A2A]" />
                  Open for bookings in <strong className="text-[#3B2418]">{artist.available}</strong>
                </li>
                <li className="flex items-start gap-2">
                  <Mail size={14} className="mt-0.5 shrink-0 text-[#7A4A2A]" />
                  via Art-Teas-Tree concierge
                </li>
              </ul>

              <a
                href="#"
                className="mt-5 flex items-center justify-center gap-2 bg-[#3B2418] px-5 py-3 font-body text-xs font-semibold uppercase tracking-[0.2em] text-[#F5EDD6] transition-colors hover:bg-[#1C1208]"
              >
                <Mail size={14} /> Inquire about availability
              </a>
              <a
                href="#"
                className="mt-2 flex items-center justify-center gap-2 border border-[#6B2D2D] px-5 py-3 font-body text-xs font-semibold uppercase tracking-[0.2em] text-[#6B2D2D] transition-colors hover:bg-[#6B2D2D] hover:text-[#F5EDD6]"
              >
                <Sparkles size={14} /> Let the concierge book
              </a>
            </div>
          </div>

          {/* Right column — bio + portfolio */}
          <div className="flex flex-col gap-10">
            {/* Header */}
            <div>
              <p className="font-typewriter text-[10px] uppercase tracking-[0.32em] text-[#7A4A2A]">
                {artist.craft} · Mime Institute of Calcutta
              </p>
              <h1 className="mt-2 font-serif text-5xl font-medium leading-[0.95] text-[#1C1410] sm:text-6xl">
                {artist.name}
              </h1>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {artist.tags.map((t) => (
                  <span
                    key={t}
                    className="border border-[#7A4A2A]/30 px-2 py-0.5 font-typewriter text-[9px] uppercase tracking-[0.2em] text-[#5E3820]"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>

            {/* Bio */}
            <article className="border-l-2 border-[#7A4A2A]/35 pl-5">
              <p className="font-serif text-xl italic leading-relaxed text-[#3B2418]">
                "Silence has a grammar. I am still learning it."
              </p>
              <div className="mt-5 space-y-4 font-body text-base leading-7 text-[#3B2418]">
                <p>{artist.bio}</p>
                <p>
                  Trained at the Mime Institute of Calcutta from 2011 to 2014. Founding member
                  of the Saturday rehearsal collective that meets weekly at Art-Teas-Tree Cafe.
                  Performs in Bengali, English, and Hindi audiences with equal ease — the art
                  is wordless, but the cultural register is not.
                </p>
                <p>
                  Past corporate engagements include Wipro, Tata Steel, and an ITC Diwali
                  evening last October. For private events, prefers intimate rooms over large
                  ballrooms — believes mime asks more from a quiet audience.
                </p>
              </div>
            </article>

            {/* Portfolio — small reel of past work */}
            <section>
              <header className="mb-3 flex items-baseline justify-between">
                <h2 className="font-serif text-2xl font-medium text-[#1C1410]">
                  <span className="font-bn text-lg text-[#7A4A2A]">কাজ</span>{' '}
                  · selected work
                </h2>
                <p className="font-typewriter text-[10px] uppercase tracking-[0.22em] text-[#7A4A2A]/55">
                  04 of 18
                </p>
              </header>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {[0, 1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="relative aspect-square overflow-hidden border border-[#7A4A2A]/22"
                  >
                    <img
                      src={MOCKUP_ARTISTS[(artist.id + i) % MOCKUP_ARTISTS.length].imageUrl}
                      alt=""
                      className="h-full w-full object-cover sepia"
                    />
                    <span className="absolute bottom-1 left-1 bg-[#1C1208]/82 px-1.5 py-0.5 font-typewriter text-[8px] uppercase tracking-[0.18em] text-[#C9A87A]">
                      0{i + 1}
                    </span>
                  </div>
                ))}
              </div>
            </section>

            {/* Availability strip */}
            <section className="border border-[#7A4A2A]/22 bg-[#FFF9EC]/85 p-5">
              <header className="mb-3 flex items-baseline justify-between">
                <h2 className="font-serif text-xl font-medium text-[#1C1410]">
                  Availability — next 90 days
                </h2>
                <p className="font-typewriter text-[10px] uppercase tracking-[0.22em] text-[#5A6B3E]">
                  18 open days
                </p>
              </header>
              <div className="grid grid-cols-7 gap-1">
                {Array.from({ length: 28 }).map((_, i) => {
                  // deterministic spread of open/booked cells
                  const state = i % 4 === 0 ? 'booked' : i % 5 === 0 ? 'tentative' : 'open';
                  return (
                    <div
                      key={i}
                      className={`aspect-square border text-center ${
                        state === 'open'
                          ? 'border-[#5A6B3E]/55 bg-[#5A6B3E]/12'
                          : state === 'tentative'
                            ? 'border-[#C9A87A] bg-[#C9A87A]/35'
                            : 'border-[#6B2D2D]/40 bg-[#6B2D2D]/22'
                      }`}
                    >
                      <span className="block py-1 font-typewriter text-[9px] text-[#3B2418]">
                        {(i % 30) + 1}
                      </span>
                    </div>
                  );
                })}
              </div>
              <div className="mt-3 flex gap-4 font-typewriter text-[9px] uppercase tracking-[0.22em] text-[#7A4A2A]/70">
                <span><span className="mr-1 inline-block h-2 w-2 bg-[#5A6B3E]/40 align-middle" /> open</span>
                <span><span className="mr-1 inline-block h-2 w-2 bg-[#C9A87A]/55 align-middle" /> tentative</span>
                <span><span className="mr-1 inline-block h-2 w-2 bg-[#6B2D2D]/40 align-middle" /> booked</span>
              </div>
            </section>

            {/* Related */}
            <section>
              <h2 className="mb-3 font-serif text-2xl font-medium text-[#1C1410]">
                Other artists in residence
              </h2>
              <div className="grid gap-3 sm:grid-cols-3">
                {related.map((r) => (
                  <a
                    key={r.id}
                    href={`/artists/${r.slug}`}
                    className="group flex gap-3 border border-[#7A4A2A]/22 bg-[#EDE2CB] p-2 transition-colors hover:bg-[#FFF9EC]"
                  >
                    <img
                      src={r.imageUrl}
                      alt=""
                      className="h-16 w-16 shrink-0 border border-[#7A4A2A]/22 object-cover sepia"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-serif text-base font-medium text-[#1C1410]">
                        {r.name}
                      </p>
                      <p className="mt-0.5 font-typewriter text-[9px] uppercase tracking-[0.22em] text-[#5A6B3E]">
                        {r.craft}
                      </p>
                      <p className="mt-1.5 line-clamp-2 font-body text-xs text-[#5E3820]">
                        {r.bio}
                      </p>
                    </div>
                  </a>
                ))}
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
