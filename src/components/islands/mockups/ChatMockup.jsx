// Demo 4 — AI concierge chat widget.
// Renders an open chat window with a scripted conversation. Designed to sit
// inside a faux cafe-site backdrop so the screenshot reads as "this is what
// the chatbot looks like on the live site."

import { MessageCircle, Send, Sparkles, X, Minus } from 'lucide-react';

function MessageBubble({ msg }) {
  const isUser = msg.from === 'user';
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[80%] border px-4 py-3 font-body text-sm leading-6 shadow-sm ${
          isUser
            ? 'border-[#3B2418] bg-[#3B2418] text-[#F5EDD6]'
            : 'border-[#7A4A2A]/22 bg-[#FFF9EC] text-[#1C1410]'
        }`}
      >
        {msg.text && <p>{msg.text}</p>}

        {/* Inline attachments — surfaced artist cards */}
        {msg.attachments && (
          <div className="mt-3 space-y-2">
            {msg.attachments.map((a) => (
              <div
                key={a.name}
                className="border border-[#7A4A2A]/30 bg-[#F5EDD6] p-2.5 text-[#1C1410]"
              >
                <div className="flex items-baseline justify-between gap-3">
                  <p className="font-serif text-base font-medium leading-tight">{a.name}</p>
                  <span className="border border-[#5A6B3E] px-1.5 py-0.5 font-typewriter text-[8px] uppercase tracking-[0.18em] text-[#5A6B3E]">
                    {a.available}
                  </span>
                </div>
                <p className="mt-0.5 font-typewriter text-[9px] uppercase tracking-[0.2em] text-[#7A4A2A]">
                  {a.craft}
                </p>
                <p className="mt-1.5 font-body text-xs leading-5 text-[#5E3820]">{a.bio}</p>
              </div>
            ))}
          </div>
        )}

        {/* Tag pill — used to mark e.g. "lead-captured" */}
        {msg.tag === 'lead-captured' && (
          <div className="mt-2 inline-flex items-center gap-1.5 border border-[#5A6B3E] bg-[#5A6B3E]/12 px-2 py-0.5 font-typewriter text-[9px] uppercase tracking-[0.22em] text-[#5A6B3E]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#5A6B3E]" />
            lead captured · forwarded to cafe
          </div>
        )}
      </div>
    </div>
  );
}

export default function ChatMockup({
  script,
  caption = 'Concierge — live on every page of the cafe site',
}) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#1C1208] text-[#F5F0E6]">
      {/* Faux cafe-site backdrop — sepia photo + heavy gradient so the chat
          window pops as the focus */}
      <img
        src="/cafe-assets/art-teas-tree-cafe-kolkata-coffee-shops-riqhhggeu0.webp"
        alt=""
        className="absolute inset-0 h-full w-full object-cover sepia"
        style={{ opacity: 0.32 }}
      />
      <div className="absolute inset-0 bg-[linear-gradient(115deg,rgba(28,18,8,0.95)_0%,rgba(28,18,8,0.70)_45%,rgba(28,18,8,0.40)_100%)]" />
      <div className="pointer-events-none absolute inset-4 border border-[#C9A87A]/15 sm:inset-8" />

      {/* Caption / pretend-browser-chrome at top */}
      <div className="relative z-10 px-5 pt-8 sm:px-10">
        <div className="mx-auto flex max-w-6xl items-baseline justify-between">
          <div>
            <p className="font-typewriter text-[10px] uppercase tracking-[0.42em] text-[#C9A87A]/65">
              Art-Teas-Tree Cafe · concierge
            </p>
            <p className="mt-2 font-hand text-2xl text-[#C9A87A] sm:text-3xl">{caption}</p>
          </div>
          <p className="hidden font-typewriter text-[10px] uppercase tracking-[0.22em] text-[#C9A87A]/45 sm:block">
            {script.title} · {script.language}
          </p>
        </div>
      </div>

      {/* Bottom-right floating chat window */}
      <div className="relative z-10 mx-auto mt-10 flex max-w-6xl justify-end px-5 pb-12 sm:px-10 sm:pb-16">
        <div className="flex w-full max-w-md flex-col border border-[#C9A87A]/35 bg-[#F5EDD6] text-[#1C1410] shadow-[0_28px_85px_rgba(0,0,0,0.55)] sm:max-w-lg">
          {/* Window header */}
          <header className="flex items-center justify-between border-b border-[#7A4A2A]/22 bg-[#3B2418] px-4 py-3 text-[#F5EDD6]">
            <div className="flex items-center gap-3">
              <div className="grid h-8 w-8 place-content-center rounded-full border border-[#C9A87A]/55 bg-[#1C1208]">
                <Sparkles size={14} className="text-[#C9A87A]" />
              </div>
              <div className="leading-tight">
                <p className="font-serif text-base font-medium">Concierge</p>
                <p className="flex items-center gap-1.5 font-typewriter text-[9px] uppercase tracking-[0.22em] text-[#C9A87A]/75">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#5A6B3E]" />
                  online · usually replies instantly
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-[#C9A87A]/70">
              <Minus size={15} />
              <X size={15} />
            </div>
          </header>

          {/* Conversation body */}
          <div className="flex max-h-[70vh] flex-col gap-3 overflow-y-auto bg-[#F5EDD6] bg-paper px-4 py-5">
            {/* Date line */}
            <div className="self-center border-b border-[#7A4A2A]/22 pb-1 font-typewriter text-[9px] uppercase tracking-[0.28em] text-[#7A4A2A]/55">
              today · {script.language}
            </div>
            {script.messages.map((m, i) => (
              <MessageBubble key={i} msg={m} />
            ))}

            {/* Typing indicator — pinned to the end if last message was user */}
            {script.messages.at(-1)?.from === 'user' && (
              <div className="flex justify-start">
                <div className="flex gap-1 border border-[#7A4A2A]/22 bg-[#FFF9EC] px-3 py-2">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#7A4A2A]/60" />
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#7A4A2A]/40 [animation-delay:0.15s]" />
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#7A4A2A]/25 [animation-delay:0.3s]" />
                </div>
              </div>
            )}
          </div>

          {/* Composer */}
          <div className="border-t border-[#7A4A2A]/22 bg-[#EDE2CB] px-3 py-2.5">
            <div className="flex items-center gap-2 border border-[#7A4A2A]/22 bg-[#FFF9EC] px-3 py-2">
              <input
                readOnly
                placeholder="Reply in English, বাংলা, or हिन्दी…"
                className="flex-1 bg-transparent font-body text-sm text-[#1C1410] outline-none placeholder:font-typewriter placeholder:text-[10px] placeholder:uppercase placeholder:tracking-[0.18em] placeholder:text-[#7A4A2A]/55"
              />
              <button
                type="button"
                aria-label="Send"
                className="grid h-8 w-8 place-content-center bg-[#3B2418] text-[#F5EDD6] transition-colors hover:bg-[#1C1208]"
              >
                <Send size={13} />
              </button>
            </div>
            <p className="mt-1.5 px-1 font-typewriter text-[9px] uppercase tracking-[0.22em] text-[#7A4A2A]/55">
              powered by claude haiku 4.5 · grounded in cafe data only
            </p>
          </div>
        </div>
      </div>

      {/* Tiny floating chat button — shown collapsed in the bottom-right
          corner of mockup 04 only. Other slides keep the window open. */}
      {script.id === 'closed-state' && (
        <button
          type="button"
          aria-label="Open concierge"
          className="absolute bottom-8 right-8 z-20 flex items-center gap-3 border border-[#C9A87A]/55 bg-[#3B2418] px-5 py-4 text-[#F5EDD6] shadow-[0_18px_45px_-15px_rgba(0,0,0,0.6)]"
        >
          <span className="grid h-9 w-9 place-content-center rounded-full bg-[#1C1208]">
            <MessageCircle size={17} className="text-[#C9A87A]" />
          </span>
          <span className="flex flex-col leading-tight">
            <span className="font-serif text-base">Ask the concierge</span>
            <span className="font-typewriter text-[9px] uppercase tracking-[0.22em] text-[#C9A87A]/70">
              English · বাংলা · हिन्दी
            </span>
          </span>
        </button>
      )}
    </div>
  );
}
