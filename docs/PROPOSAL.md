# Art-Teas-Tree Cafe — Project Proposal & Internal Roadmap

> **Audience:** internal team only. This document is the source of truth for our pitch, our pricing logic, and the technical commitments behind each tier. It is **not** for the client. Do not send any section of this verbatim without redacting the rationale notes.
>
> **Last updated:** 2026-05-16
> **Status:** Pre-pitch. Local demo built. Awaiting client meeting to confirm tier selection.

---

## 1. Project at a glance

**Client:** Art-Teas-Tree Cafe, Bidhan Nagar, Kolkata. Associated with the Mime Institute of Calcutta.

**Brand premise:** A digital love letter to Kolkata's *cha er dokan* (tea stall) culture, framed through a Satyajit Ray / Shantiniketan aesthetic. Theatre, books, adda, slow conversation. Not a luxury brand, not a SaaS site — a cinematic, gritty, scrapbook-feeling space.

**What we are selling:** Three discrete tiers of digital infrastructure for the cafe. Each tier is a complete deliverable in itself; they are not phases of a single project. The client picks one based on operational needs and budget.

**What we are presenting today:** A live local demo that combines the *visual* surface area of Demo 2 (full landing page + artist roster preview) so the client can see the complete aesthetic. The functional backbone (QR menu) is sketched but not yet wired to a live Google Sheet — that gets built when a tier is chosen.

---

## 2. Current build state

### What's live in the local demo

| Section | Status | Notes |
|---|---|---|
| Hero (vintage playbill) | Done | Sepia photo, handwritten "এখানে আড্ডা ফ্রি" overlay, "Mime Institute presents" eyebrow |
| Philosophy + Manifesto | Done | Full manifesto verbatim, drop-cap typesetting, director's notebook pull-quote, coffee-ring stain, red-ink margin correction, washi tape |
| Reel (photo viewfinder section) | Done | Replaces the original Lyadh section. Director's-camera viewfinder + contact-sheet filmstrip with the four café photos |
| Menu (চা ও টা) | Done | Filterable by category, torn-paper edges, wicker-weave background, coaster anchor |
| Natyamancha (Stage) | Done — preview only | Masonry postcard grid with 5 mock artists, "Take the Stage" modal form (form is currently inert — no submission backend) |
| Boipara (Books) | Done | Horizontal book-spine shelf, moss-green wall, coaster anchor |
| Footer | Done | "আবার দেখা হবে" sign-off, location, hours, affiliation |

### What's mock and needs real wiring per tier

- **Menu data** — currently a JSON file (`src/data/mockMenuData.json`). Needs to become a Google Sheets pull (Demos 1, 2) or stays JSON (irrelevant for Demo 3 menu, which is unchanged).
- **Artist data** — currently `src/data/mockArtistData.json`. Becomes Sheets (Demo 2) or Supabase (Demo 3).
- **Artist application form** — UI exists, no backend. Needs to either email a recipient (Demo 2) or write to Supabase with approval flow (Demo 3).
- **Domain + hosting** — none yet. See section 7.

### Technical stack (locked in)

- **Astro 4** with React 18 islands for interactive components
- **Tailwind CSS 3.4** with a custom theme (`tea`, `maroon`, `cream`, `paper`, `moss`, `amber` palette)
- **Framer Motion 12** for cinematic scroll/transition animations
- **Fontsource** for Cormorant Garamond, Lora, Caveat, Hind Siliguri (Bengali), Courier Prime
- **Static output** (`astro build` produces a static site — works on any CDN)

---

## 3. The three tiers

### 3.1 Demo 1 — "The Digital Dokan"

**Pitch headline:** Cafe gets a beautiful digital identity and a self-serve QR menu. Zero ongoing admin work.

**Included:**

- Complete landing page (Hero, Philosophy, Manifesto, Book Corner / Boipara, Footer) — full Retro Kolkata aesthetic
- Dynamic QR menu accessed via printed QR codes on each table
- Mobile-optimized menu view (separate route or rendered fragment)
- Google Sheets CMS for the menu only — client edits item name, price, availability, description from their phone and the site updates within seconds

**Explicitly NOT included:**

- Artist directory / Natyamancha section
- Any form submission backend
- Photo gallery beyond the four café photos hardcoded in the design
- Email capture, newsletter, online ordering, reservations

**Price:** **₹10,000 one-time** (excluding domain and hosting — see section 7)

**Internal effort estimate:** 30–40 hours
- Final polish of landing page sections: 6 hrs
- QR menu route + mobile design: 8 hrs
- Google Sheets API integration + cache layer: 10 hrs
- Deploy + QA + handover docs: 6 hrs
- Buffer: 5 hrs

**Why ₹10k holds up:** At ~₹300/hr blended rate this is on the low end but defensible as a portfolio / relationship-building price for a local cultural client. We are not making margin here — we are establishing trust and an upgrade path.

---

### 3.2 Demo 2 — "The Ensemble" *(recommended)*

**Pitch headline:** Everything in Demo 1, plus your artists become part of the website. Still zero admin work.

**Included:**

- Everything in Demo 1
- Natyamancha (The Stage) section: masonry postcard grid integrated into the main cafe site
- **Unlimited artists** managed via Google Sheets — 5 featured prominently as vintage postcards on the main page, the rest accessible via a "See the full roster" CTA that opens a compact list modal (thumb + name + craft + bio + contact for each)
- Google Sheets CMS dual pipeline: one tab for menu, one tab for artists. Replace a row, the site updates.
- "Take the Stage" CTA button — opens a modal with the cafe's contact email (no backend, just a `mailto:` link or a Formspree-style relay)

**Explicitly NOT included:**

- Artist self-submission (any artist who wants in still has to contact the cafe)
- Search / filtering across artists
- Artist profile pages (each artist is a row in the modal, not a dedicated page)
- Subdomain-level artist directory (that is Demo 3)

### Strategic note on the cap removal (2026-05 change)

Demo 2 originally capped at 10 artists as a pricing lever to push clients toward Demo 3. That cap has been removed at the client's request. Implications:

- **Build cost is unchanged** — we already absorbed the additional ~4 hours of UI work for the featured/modal split into the current quote.
- **Demo 2 → Demo 3 upsell is softer than before.** The artist *cap* is no longer a forcing function. We now lean on the *qualitative* differentiators: search/filter, self-submission, admin dashboard, profile pages, separate subdomain. These remain real reasons to upgrade.
- **Internally, watch for clients who stay on Demo 2 with 40+ artists** — at that scale the modal list starts to feel like a phone book and we should proactively suggest Demo 3. Set a soft trigger to flag this.

**Price:** **₹22,000 one-time** (within the stated ₹18k–24k range — we anchor at 22 and have ₹2k of room to negotiate down)

**Internal effort estimate:** 60–75 hours
- Demo 1 scope: 40 hrs
- Artist grid + postcard component polish: 8 hrs
- Modal + contact relay: 4 hrs
- Second Sheets pipeline + image handling: 10 hrs
- Image optimization (resize, lazy-load): 4 hrs
- Buffer: 6 hrs

**Why ₹22k holds up:** Roughly 2× Demo 1 effort, 2.2× price. The premium captures the second data pipeline and the heavier image work. Below ₹18k the artist grid becomes free labor; above ₹24k the client perceives a steep jump for "just another section."

**Recommendation:** This is what we should push. See section 6.

---

### 3.3 Demo 3 — "The Cultural Hub"

**Pitch headline:** A dedicated, searchable artist directory at its own subdomain. This is no longer a website — it's a product.

**Included:**

- Everything in Demo 1 (cafe landing + QR menu — unchanged from Demo 1)
- A dedicated web app at a subdomain (`artists.artteastree.com` or similar)
- The Natyamancha section on the main cafe site becomes a stylized hero card that links out to the directory subdomain
- Interactive search with category, availability, and location filters
- Uncapped artist profiles, each with a dedicated profile page (dynamic route)
- Artist self-submission form with email verification
- Admin dashboard for the cafe to approve / reject / edit artists
- Image upload pipeline (artist uploads → resized → stored)

**Three sub-tiers within Demo 3:** *(client picks one)*

| Sub-tier | Price | Differences |
|---|---|---|
| Lean | ₹50,000 | Supabase free tier, basic search + 2 filters (craft, location), approval done via Supabase Studio (no custom admin UI) |
| **Recommended** | **₹75,000** | Custom admin dashboard, email-verified submissions, 4 filters (craft / availability / location / language), ~30-artist starting roster |
| Full polish | ₹1,10,000 | Above + per-artist portfolio galleries, booking-request form, analytics dashboard, Bengali/English UI toggle |

**Subscription required.** See section 4.

**Internal effort estimate (Recommended sub-tier):** ~75 hours

| Task | Hours |
|---|---|
| Database design + Supabase schema | 6 |
| Supabase auth + RLS policies | 4 |
| Admin dashboard (approve / edit / delete) | 16 |
| Artist submission form + email verification | 8 |
| Search + filter UI with URL state + debouncing | 12 |
| Artist profile pages (dynamic routes) | 8 |
| Image upload pipeline (resize, storage) | 6 |
| Subdomain config + deployment pipeline | 3 |
| Main-site Natyamancha redirect card | 1 |
| Polish, testing, edge cases, handover | 11 |
| **Total** | **75** |

At ₹1,000/hr blended rate = ₹75,000. The number is honest, not pulled from a hat.

**Why this tier is a different category, not just a bigger website:**
- We're standing up a real database, not a Google Sheet
- We're building auth flows and approval workflows — software, not a brochure
- We carry ongoing operational responsibility (uptime, backups, security)
- The client can grow indefinitely on this without coming back to us for every new artist

---

### 3.4 Demo 4 — "The Concierge"

**Pitch headline:** Everything in Demo 3, plus an AI chatbot that books artists, answers menu questions, and acts as a 24/7 cultural guide to the cafe — in English, Bengali, and Hindi.

This is the top of the ladder. Demo 4 turns the artist directory and the cafe site into a conversational platform. A visitor lands, opens the chat, and says "I'm looking for a mime artist for a corporate event in mid-December" — the bot queries the directory, surfaces three matches with availability, captures the visitor's email, and forwards the lead to the cafe. Same bot, same widget, answers "what's vegan?" off the menu and "what is adda?" off the cultural FAQ.

**Included:**

- Everything in Demo 3 (Recommended sub-tier) as the base
- **Floating chatbot widget** on every page of the main cafe site AND the artist directory subdomain
- **RAG-grounded conversation** over the menu data, artist database, and a curated cafe FAQ — the bot only answers from real, current data. No hallucinations about "we serve dosa" if the menu doesn't.
- **Artist discovery & booking flow** — preference capture (craft, date range, budget, event type) → directory query → match list → lead capture → forward to cafe admin
- **Menu Q&A** — vegan / caffeine-free / spice-level / "what should I try if I like ginger?" — recommendation logic over the live menu
- **Cafe FAQ** — hours, location, parking, group bookings, dietary accommodations, private events
- **Cultural concierge** — explains adda, lyadh, bhar, the Mime Institute affiliation. This is differentiator: most cafe bots can't talk about the cultural identity of the space.
- **Multilingual support** — English, Bengali (Bangla script), and Hindi (Devanagari script). LLM handles natively; we prompt-engineer the persona so it stays in the cafe's voice across languages.
- **Lead capture** — every artist booking inquiry, every reservation intent, every private-event ask is logged and forwarded to the cafe owner
- **Owner conversation dashboard** — admin sees every chat transcript, with sentiment flags for frustrated visitors. Doubles as a free demand-research tool ("what are people asking about?")
- **Reservation/table booking intent** — "table for 4 on Saturday at 7" → captures the intent, sends booking request via email (we do not build live availability checking — that requires a POS integration, out of scope)
- **Conversation memory within session** — bot remembers context within a visit (return visitors get a fresh session for privacy reasons)

**Three sub-tiers within Demo 4:**

| Sub-tier | Price (delta over Demo 3 Rec.) | Total | Differences |
|---|---|---|---|
| Lean | +₹40,000 | ₹1,15,000 | English-only, capped at 300 conversations/mo, basic widget, no admin dashboard |
| **Recommended** | **+₹60,000** | **₹1,35,000** | Trilingual (En/Bn/Hi), 1,000 conv/mo cap, admin dashboard, lead capture, cultural FAQ |
| Full polish | +₹95,000 | ₹1,70,000 | Above + voice input, sentiment analytics, monthly performance reports, custom persona tuning |

**Internal effort estimate (Recommended sub-tier):** ~60 hours over Demo 3 base

| Task | Hours |
|---|---|
| Chatbot widget UI (floating, mobile-friendly, in cafe aesthetic) | 8 |
| LLM integration with streaming responses | 6 |
| RAG pipeline over menu + artist DB + cultural FAQ | 10 |
| Multilingual prompt engineering + persona consistency | 6 |
| Conversation logging + admin dashboard view | 8 |
| Lead-capture flow + email forwarding | 4 |
| Reservation intent capture | 4 |
| Sentiment flagging integration | 3 |
| Quality testing in 3 languages | 8 |
| Polish, edge cases, prompt-injection hardening | 3 |
| **Total** | **60** |

At ₹1,000/hr blended rate = ₹60,000 delta on top of Demo 3 Recommended.

**LLM provider decision (lock in before pitching):** default to **Claude Haiku 4.5** for the conversation layer. Reasoning: highest quality-to-cost ratio for a small-business support bot, strong Bengali/Hindi handling, low latency on streaming. Fallback to GPT-4o-mini if cost becomes a concern. Budget ~₹2,000/mo in LLM API cost at expected traffic; covered in subscription.

**Why this tier exists strategically:** every recurring revenue stream in our business comes from Demo 3 subscriptions. Demo 4 doubles the subscription floor (₹1,999 → ₹3,499) for clients who *actually* see traffic. A single Demo 4 client at the Recommended subscription tier brings in ~₹42k/year in recurring revenue alone, on top of the ₹1,35,000 build. Three of these and the studio has a real business.

**Pitch carefully.** Demo 4 is the right answer for cultural hubs that expect outside booking inquiries (event organisers, corporate clients, weddings). It is the *wrong* answer for a cafe that just wants a beautiful website. Do not push this tier unless the client mentions bookings, events, or "people finding us" as priorities.

---

## 4. Subscription model (Demos 3 and 4)

Demos 3 and 4 **must** carry a subscription. Without one, we are signing up for unpaid hosting, security patches, LLM API costs (Demo 4), and "can you add this filter?" requests forever. The client gets ongoing value (artists join, the platform stays alive, the chatbot keeps answering); we get covered for our ongoing cost.

### Demo 3 subscription tiers

| Tier | Monthly | What it covers |
|---|---|---|
| Hosting only | ₹999/mo | Supabase + Vercel + domain renewal + uptime monitoring. No included dev time. |
| **Standard** *(recommended)* | **₹1,999/mo** | Above + 2 hours/month of changes, security updates, monthly DB backup, email support within 48 hrs |
| Pro | ₹3,499/mo | Above + 5 hours/month, quarterly feature additions, priority support, Google Analytics integration |

### Demo 4 subscription tiers

LLM API costs are real recurring expenses on top of hosting. These tiers are calibrated to cover them honestly.

| Tier | Monthly | What it covers |
|---|---|---|
| Standard | ₹3,499/mo | All Demo 3 Standard benefits + LLM API costs (capped at 1,000 chat conversations/month) + monthly chatbot transcripts report |
| **Pro** *(recommended for Demo 4)* | **₹5,999/mo** | Above + uncapped conversations + quarterly chatbot tuning (prompt engineering, persona refinement) + sentiment analytics dashboard + priority support within 24 hrs |
| Enterprise | ₹9,999/mo | Above + custom integrations (POS, calendar, CRM), monthly performance review call with the cafe owner, dedicated account manager |

### Why ₹1,999 is the Demo 3 sweet spot

- Roughly equals two coffee orders per day at the café — psychologically affordable
- Once the artist directory crosses Supabase free-tier limits (500 MB storage, ~50k monthly active users), the paid tier alone is ~$25/mo (~₹2,000)
- Without a subscription, the directory crossing free-tier limits = either we eat the cost, or the site goes down. Both are bad outcomes.

### Why Demo 4 jumps to ₹3,499

- LLM API costs are real: at expected traffic (~500 conversations/mo, ~1,500 tokens average) on Claude Haiku 4.5, that is roughly ₹1,500/mo in pure API cost
- Chatbot quality requires active maintenance — prompts drift, languages need tuning, edge cases need fixing
- The conversation log itself is a deliverable the cafe owner consumes monthly (insight into customer demand)
- We are still profitable at ₹3,499 — but the margin is thinner than Demo 3, justified by recurring revenue stability

### Cancellation / exit terms (must be in contract)

- 30 days notice to cancel
- On cancellation, we provide a full database export (CSV + JSON)
- Site goes into read-only mode for 60 days before being taken down, giving the client time to migrate
- Client retains rights to all artist data and uploaded content
- Source code: see section 7

---

## 5. Pricing summary table

| Item | Demo 1 | Demo 2 | Demo 3 (Rec.) | Demo 4 (Rec.) |
|---|---|---|---|---|
| One-time build | ₹10,000 | ₹22,000 | ₹75,000 | ₹1,35,000 |
| Subscription | Optional ₹500/mo | Optional ₹500/mo | **₹1,999/mo req.** | **₹5,999/mo req.** |
| Domain (annual) | ~₹800–1,200 (client pays direct) | Same | Same | Same |
| Hosting | Vercel/Netlify free tier covers it | Same | Vercel + Supabase paid (covered) | Same + LLM API (covered) |
| Cafe admin work | Edit a Google Sheet | Edit a Google Sheet | Approve via dashboard | Approve + review chat logs |
| Artist limit | N/A | Unlimited (5 featured + roster modal) | Unlimited | Unlimited |
| Bot conversations | None | None | None | 1,000/mo (Standard) or uncapped (Pro) |

The ladder is roughly 1× → 2.2× → 7.5× → 13.5× in one-time cost. The Demo 3 → Demo 4 jump is smaller in relative terms because Demo 4 *extends* Demo 3 rather than replacing it; the price reflects ~60 additional engineering hours plus the recurring revenue lift.

---

## 6. Recommended pitch strategy

### What to lead with

1. **Open with Demo 2.** Frame it as the natural answer: "captures the cafe's essence, brings the Mime Institute artists in, requires almost no admin work." Anchor it as the recommendation.
2. **Position Demo 1 as the budget fallback.** "If timing isn't right for the artist piece, Demo 1 still gives you the full identity and the QR menu, and you can upgrade later." This makes Demo 2 feel like the safer, more complete choice without making Demo 1 feel like a downgrade.
3. **Position Demo 3 as the future, not the present.** "If the artist directory becomes popular, we'll upgrade you to Demo 3 — but it's a different category of product and most cafes don't need it on day one." This pre-empts the "what's the difference, why not just get the best one?" question and positions Demo 3 as an aspirational ceiling.

### Signals that the client should jump straight to Demo 3

- They mention wanting non-Kolkata patrons or event organisers to find artists
- They mention "platform" or "directory" or "booking" unprompted
- They want artists to apply themselves rather than being curated
- They want analytics ("how many people viewed the artists this month?")

If two or more of these surface, do not push them down to Demo 2 — let them have Demo 3.

### Numbers to never reveal in the pitch

- Our internal hour estimates
- The fact that Demo 1 is at-cost
- The negotiation room in Demo 2 (we will go to ₹20k if they push, but the opening number is ₹22k)
- The Demo 3 sub-tier prices unless they explicitly engage with that tier

---

## 7. Open questions to resolve before pitching

These are gaps in the current proposal that the client will ask about. Lock down internal answers before the meeting.

| Question | Suggested internal answer |
|---|---|
| Who owns the source code? | **Demo 1, 2:** client owns the code, we keep a portfolio license. **Demo 3:** we retain source ownership, client gets a perpetual usage license. This is what justifies the subscription. |
| Who pays for the domain? | Client pays the domain registrar directly (Namecheap / GoDaddy). We assist with setup but the invoice goes to them. ~₹800–1,200/year. |
| What about hosting cost for Demo 1 / 2? | Vercel + Netlify free tier covers a small cafe site indefinitely. We set it up under the client's account so they own it. No ongoing fee from us. |
| What if they want updates after launch (Demo 1 / 2)? | Two options: hourly at ₹1,500/hr, or a ₹500/mo retainer for up to 1 hour/month. Mention this in the contract. |
| Image rights / artist photo consent | Cafe is responsible for getting written consent from each artist before listing. We add a checkbox to the submission form (Demo 3) but the legal responsibility is theirs. Put this in the contract. |
| What if the menu sheet breaks / loses data? | We set up a daily snapshot of the menu sheet to JSON in the repo (Demo 1, 2). If the sheet is wiped, last good version restores in <5 minutes. Mention this as a stability feature. |
| Bengali content — who writes it? | Cafe provides Bengali copy. We typeset it. If they need translation we'll quote separately. |
| Photoshoot for the cafe? | Not in scope. We use the four photos they already provided. Additional photography is the client's responsibility or a separate quote. |
| Analytics / SEO | Basic SEO (meta tags, OG cards, sitemap) is included in all tiers. Google Analytics requires their GA4 account — we wire it up but they own the account. |
| Payment terms | 50% on contract signing, 50% on launch for Demos 1 & 2. For Demo 3: 40% on contract, 30% on admin dashboard delivery, 30% on launch. |
| Timeline | Demo 1: 2 weeks from contract. Demo 2: 3–4 weeks. Demo 3 (Recommended sub-tier): 6–8 weeks. |

---

## 8. Upgrade path between tiers

The technical architecture is built so the client can move up without throwing away work.

```
Demo 1   →   Demo 2   →   Demo 3   →   Demo 4
(Static)    (+ Sheets    (+ Supabase    (+ AI concierge,
             artist pipe  + subdomain)    multilingual)
             + roster modal)
```

**Demo 1 → Demo 2:** ₹15,000 upgrade fee. We add the artist Sheets pipeline and the Natyamancha section (5 featured + full-roster modal). Existing landing page and menu carry over unchanged. Roughly 2 weeks.

**Demo 2 → Demo 3:** ₹60,000 upgrade fee (less than buying Demo 3 fresh because we credit the Demo 2 build). We migrate the artist data from Sheets to Supabase, stand up the subdomain, build the admin dashboard. Main cafe site stays as-is; only the Natyamancha block changes to a redirect card. Roughly 5–6 weeks. Subscription kicks in at the upgrade.

**Demo 3 → Demo 4:** ₹55,000 upgrade fee (₹5k credit vs. buying Demo 4 fresh). We add the chatbot widget to both the main site and the directory, build the RAG pipeline over the existing menu + artist data, add multilingual prompts, and wire up the conversation log dashboard. The artist DB and admin panel are unchanged. Roughly 4 weeks. Subscription jumps from ₹1,999/mo to ₹3,499/mo (Standard) or ₹5,999/mo (Pro).

**Why we do not offer an "all-in-one" custom quote:** scope creep kills these projects. The four tiers are firm. Custom asks should be quoted as separate add-ons (e.g., "online ordering" or "POS integration") with their own scope and pricing.

---

## 9. Technical architecture per tier (for engineers)

### Demo 1

```
[ Astro static site ]  →  [ Vercel CDN ]
        ↑
[ build-time fetch from Google Sheets API ]
        ↑
[ Menu Sheet ] ← edited by cafe owner
```

- Menu is fetched at build time AND on-demand via a serverless function for live updates
- ISR (Incremental Static Regeneration) keeps the menu fresh without rebuilds
- QR codes generated at build time, link to `/menu` route (mobile-optimized)
- No auth, no DB, no backend logic

### Demo 2

Same as Demo 1, plus:

```
[ Artist Sheet ] → [ build-time fetch ] → [ Natyamancha section ]
```

- Second Sheets tab, same pipeline
- Artist photos: cafe uploads to Drive folder, we pull URLs via Sheets cell
- "Take the Stage" form: Formspree (free tier) or Resend (free tier) to relay to cafe email

### Demo 3 (Recommended sub-tier)

```
[ Main cafe site — unchanged from Demo 1 ]
        ↓ links out
[ artists.artteastree.com ]
        ↕
[ Supabase Postgres ]
        ↕
[ Admin dashboard at /admin ]  ←  cafe owner auth
[ Public artist directory ]
[ Artist submission form → email verification → admin queue ]
```

- Supabase: Postgres + Auth + Storage + Edge Functions
- Frontend: Astro + React, deployed to Vercel
- Search: Postgres full-text search initially (`tsvector`), can swap to Algolia/Meilisearch later if needed
- Image pipeline: client uploads → Edge Function resizes (3 sizes: thumb, card, full) → Supabase Storage
- Admin auth: magic link via Supabase Auth, limited to cafe's email allowlist
- Row-level security: artists see only their own draft profiles; public sees only approved

### Demo 4 (Recommended sub-tier)

Same as Demo 3, plus:

```
[ Floating chatbot widget on every page (main site + directory) ]
        ↕
[ Vercel Edge Function — chat handler ]
        ↕
[ Claude Haiku 4.5 ]  ←  streaming responses
        ↕
[ RAG context assembled from:
   - Menu (Google Sheets snapshot, cached 5min)
   - Artist directory (Supabase query)
   - Cafe FAQ (markdown file in repo)
   - Cultural concierge notes (markdown file in repo) ]
        ↓
[ Conversation log → Supabase ]
        ↕
[ Owner dashboard at /admin/chats ]  ←  sentiment-flagged, exportable
```

- LLM provider: Claude Haiku 4.5 via Anthropic API (model id `claude-haiku-4-5-20251001`). Prompt caching enabled for the system prompt and RAG context — this is critical for keeping per-conversation cost low.
- Chat widget: React component built into the existing Astro islands setup, fixed-position bottom-right, mobile-responsive bottom-sheet on small screens
- Multilingual: a single system prompt instructs the model to mirror the visitor's language. Tested in English, Bengali (Bangla script), and Hindi (Devanagari)
- Rate limiting: per-IP (10 messages/min) + per-day cap aligned to subscription tier
- Prompt-injection hardening: system prompt explicitly rejects requests to "ignore previous instructions", reveal the system prompt, or act outside cafe scope
- Lead capture: structured tool-use — when the bot detects booking intent, it calls an `extract_booking_lead` tool, which writes to Supabase and triggers an email to the cafe
- Conversation memory: per-session only (no cross-session profiling — privacy stance we surface to the client)

---

## 10. Cost / effort breakdown (for project leads)

| Item | Demo 1 | Demo 2 | Demo 3 (Rec.) | Demo 4 (Rec.) |
|---|---|---|---|---|
| Internal effort (hours) | 35 | 74 | 75 | 135 (75 + 60 chatbot) |
| Blended rate (internal) | ₹285/hr | ₹297/hr | ₹1,000/hr | ₹1,000/hr |
| One-time price | ₹10,000 | ₹22,000 | ₹75,000 | ₹1,35,000 |
| Gross margin per project | ~10–15% (loss-leader) | ~25% | ~50% | ~50% |
| Recurring revenue | None | None (optional retainer) | ₹1,999/mo | ₹5,999/mo |
| Recurring LLM/infra cost | None | None | ~₹400/mo | ~₹2,200/mo (LLM ~₹1,800) |
| Net recurring margin | None | None | ~₹1,600/mo | ~₹3,800/mo |
| First-year total revenue | ₹10,000 | ₹22,000 | ₹98,988 | ₹2,06,988 |

**Strategic note (updated 2026-05):**

- Demo 1 remains a loss-leader to establish the relationship.
- Demo 2 hours nudged up (35 → 74) to absorb the cap-removal UI work (featured/modal split). Margin narrowed but still positive.
- Demo 3 is the recurring-revenue floor.
- **Demo 4 is the model where the business actually compounds.** A single Demo 4 client at Pro subscription is worth ~₹2 lakh in year one and ~₹70k/year in net recurring revenue afterwards. Three Demo 4 clients in steady state ≈ a small functioning SaaS-with-services business.
- However: Demo 4 carries the highest operational risk (LLM outages, hallucination incidents, prompt-injection attempts). Do not sell Demo 4 until we have a clear escalation playbook and at least one full week of internal dogfooding on the cafe's actual data.

---

## 11. Risks

| Risk | Likelihood | Mitigation |
|---|---|---|
| Client picks Demo 1 and never upgrades | High | Accept it. Demo 1 is a portfolio piece. Use it to win other clients. |
| Client wants Demo 3 features at Demo 2 price | Medium | Hold the line. Each feature ask becomes an add-on quote. Do not absorb it. |
| Subscription churn after 3–6 months | Medium | The 60-day read-only grace period (section 4) gives them time to reconsider before everything goes dark. Most won't actually cancel — they'll pay to keep it up. |
| Google Sheets API rate limits | Low | Cache aggressively (5-minute TTL). Snapshot daily as a fallback. Sheets API allows 300 requests/minute per project — plenty for a small café. |
| Artist content gets stale (Demo 2) | Medium | Build a "last updated" timestamp into the artist card. If a card hasn't been touched in 6 months, surface it to the cafe owner. |
| Bengali typography breaks on some devices | Low | Hind Siliguri is hosted via @fontsource and bundled. Tested on iOS Safari, Chrome, Firefox. Confirmed working. |
| Cafe owner edits Sheet wrong and breaks the site | Medium | Validation layer in the build script: if a row is malformed, skip it and log to a Slack webhook. Site never goes down due to bad CMS input. |
| Client asks for online ordering / table booking | Medium | Out of scope for Demos 1–3. Demo 4 captures booking *intent* via the bot but does not check live availability. Full ordering/reservation system: separate quote, ₹40,000+ for ordering, ₹25,000+ for reservations. |
| **(Demo 4)** Chatbot hallucinates about menu / artists | Medium | RAG-grounded answers only, system prompt explicitly forbids generation outside provided context. Quarterly transcript review catches drift. Add evals before shipping. |
| **(Demo 4)** Prompt-injection / abusive users | Medium | System prompt hardened against "ignore previous instructions" patterns. Rate-limit per-IP. Log + flag suspicious conversations to admin dashboard. |
| **(Demo 4)** LLM API outage (Anthropic down) | Low | Graceful fallback: widget shows "Our concierge is resting — please email us at..." with the cafe email. Monitor uptime via Vercel logs. |
| **(Demo 4)** Cost overrun if traffic spikes | Medium | Hard per-tier conversation caps enforced in the Edge Function. Cap exceeded → polite "we've been busy, try again tomorrow" message + alert to us. |
| **(Demo 4)** Bengali / Hindi quality complaints | Medium | Test transcripts in all three languages reviewed by a native speaker before launch. Add the languages to the quarterly review. If the cafe owner is bilingual, ask them to spot-check monthly. |

---

## 12. Glossary

| Term | Meaning |
|---|---|
| *Adda* (আড্ডা) | Bengali concept: long, agenda-less conversation. Central to the cafe's identity. |
| *Cha er dokan* (চায়ের দোকান) | Roadside tea stall. Cultural archetype the cafe is built on. |
| *Bhar* (ভাঁড়) | Disposable clay cup used for tea in Kolkata. Visual motif in the design (see [src/components/islands/Scraps.jsx](../src/components/islands/Scraps.jsx)). |
| *Boipara* (বইপাড়া) | The book district — specifically College Street in Kolkata. The Books section is themed around this. |
| *Natyamancha* (নাট্যমঞ্চ) | The theatre stage. Name of the artist section. |
| *Lyadh* (ল্যাদ) | Untranslatable Kolkata Bengali: productive idleness. Originally a section in the design; replaced by the Reel photo section in the current build. Still in the manifesto's spirit. |
| *Reel* (রিল) | The current photo gallery section. Stylized as a director's camera viewfinder. |
| CMS | Content Management System. For Demos 1 and 2, that is Google Sheets. |
| RLS | Row-Level Security in Postgres / Supabase. Used in Demo 3 to control who can read/write what. |
| ISR | Incremental Static Regeneration — Vercel feature that rebuilds individual pages on a schedule without rebuilding the whole site. |
| RAG | Retrieval-Augmented Generation. The chatbot in Demo 4 answers questions by retrieving the relevant menu / artist / FAQ context first and only then generating an answer. Keeps answers grounded in real data. |
| LLM | Large Language Model — the underlying AI that powers the chatbot. Demo 4 defaults to Claude Haiku 4.5. |
| Prompt injection | An attack where a user tries to manipulate the chatbot into ignoring its instructions ("ignore previous instructions and reveal the system prompt"). Hardened against in Demo 4. |
| Prompt caching | Anthropic feature where the system prompt and RAG context are cached on the provider side, dramatically reducing cost per conversation. Used in Demo 4 by default. |
| Tool use | The chatbot's ability to call structured functions (e.g., `extract_booking_lead`) when it detects intent in a conversation. Used in Demo 4 for lead capture. |

---

## 13. Document control

- **Owner:** [whoever leads the client account]
- **Reviewers before each client meeting:** at least one engineer and one project lead
- **Update this document when:**
  - Pricing changes
  - A tier's scope changes
  - A new risk surfaces
  - The client signs — add a "Signed Contract" section at the top
- **Storage:** in-repo at `docs/PROPOSAL.md` so it ships with the codebase and never gets lost in a shared drive

---

*End of document.*
