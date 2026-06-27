# Art-Teas-Tree Event Management System

## Final Implementation Roadmap

### Project Goal

Build a self-service event management system for Art-Teas-Tree Cafe and the Mime Institute that allows non-technical staff to:

* Create new events
* Update existing events
* Upload event banners
* Upload gallery images
* Publish events to the homepage
* Manage registrations

without requiring developer involvement.

---

# Final Architecture

## Content Management

### Google Sheets

Stores:

* Event metadata
* Event content
* Event category
* Event descriptions
* Registration links

### Cloudinary

Stores:

* Event banners
* Event galleries
* Future media assets

### Next.js

Responsible for:

* Homepage rendering
* Event routing
* Template rendering
* Gallery rendering

---

# Data Flow

Cloudinary
↓
Image URLs

Google Sheets
↓
Event Data

Next.js
↓
Homepage Carousel
↓
Event Pages
↓
Category Templates

---

# Folder Structure

```text
src/
│
├── app/
│   ├── page.tsx
│   ├── events/
│   │   └── [slug]/
│   │       └── page.tsx
│
├── components/
│   ├── events/
│   │   ├── EventCarousel.tsx
│   │   ├── EventCard.tsx
│   │   ├── EventGallery.tsx
│   │   ├── EventMeta.tsx
│   │   └── RegistrationCTA.tsx
│   │
│   └── templates/
│       ├── PerformanceTemplate.tsx
│       ├── WorkshopTemplate.tsx
│       └── ExhibitionTemplate.tsx
│
├── lib/
│   ├── events/
│   │   ├── events.ts
│   │   ├── eventParser.ts
│   │   ├── slug.ts
│   │   ├── gallery.ts
│   │   └── categories.ts
│
└── types/
    └── event.ts
```

---

# Event Categories

## Performance

Includes:

* Music
* Drama
* Stand-Up
* Poetry
* Storytelling

Template:

PerformanceTemplate

---

## Workshop

Includes:

* Acting Workshop
* Music Workshop
* Art Workshop
* Educational Sessions

Template:

WorkshopTemplate

---

## Exhibition

Includes:

* Art Exhibitions
* Photography
* Installations
* Book Exhibitions

Template:

ExhibitionTemplate

---

# Events Sheet Structure

Create a second sheet called:

```text
Events
```

Columns:

| Active | Category | Title | Date | Time | Venue | Banner URL | Description | Additional Info | Gallery URLs | Registration URL |
| ------ | -------- | ----- | ---- | ---- | ----- | ---------- | ----------- | --------------- | ------------ | ---------------- |

---

# Column Definitions

## Active

TRUE / FALSE

Controls visibility.

---

## Category

Allowed values:

```text
Performance
Workshop
Exhibition
```

---

## Title

Event title.

Example:

```text
Rabindra Sangeet Evening
```

---

## Date

Format:

```text
2026-06-12
```

---

## Time

Format:

```text
6:00 PM
```

---

## Venue

Example:

```text
Art-Teas-Tree Cafe
Mime Hall
```

---

## Banner URL

Cloudinary image URL.

Example:

```text
https://res.cloudinary.com/...
```

---

## Description

Main event description.

---

## Additional Info

Category-specific information.

Examples:

### Performance

Artist bios.

### Workshop

Learning outcomes.

### Exhibition

Curator notes.

---

## Gallery URLs

Store one URL per line.

Example:

```text
https://...
https://...
https://...
```

---

## Registration URL

Can point to:

* Google Form
* WhatsApp
* Ticketing platform
* External website
* Instagram

---

# Phase 0 — Project Setup

Goal:

Finalize architecture.

Tasks:

1. Create Events sheet.
2. Create Cloudinary account.
3. Create Cloudinary folders.
4. Define categories.
5. Define template requirements.

Validation:

* Architecture approved.
* Spreadsheet finalized.

Commit:

```bash
chore: finalize event architecture
```

---

# Phase 1 — Event Types

Goal:

Create event models.

Tasks:

1. Create Event interface.
2. Create category enums.
3. Create validation schema.

Validation:

Type checking passes.

Commit:

```bash
feat(events): create event types
```

---

# Phase 2 — Google Sheets Integration

Goal:

Fetch event data.

Tasks:

1. Create event fetcher.
2. Parse sheet rows.
3. Validate rows.
4. Handle missing values.

Validation Route:

```text
/debug/events
```

Display raw JSON.

Success Criteria:

* All events load.
* No parsing errors.

Commit:

```bash
feat(events): fetch events from sheets
```

---

# Phase 3 — Event Utilities

Goal:

Build supporting utilities.

Tasks:

### Slug Generator

Generate automatically from title.

Example:

```text
Rabindra Sangeet Evening
↓
rabindra-sangeet-evening
```

### Gallery Parser

Convert newline-separated URLs into arrays.

### Event Sorting

Sort by date.

### Event Filtering

Only show active events.

Validation:

Unit tests pass.

Commit:

```bash
feat(events): add utilities
```

---

# Phase 4 — Cloudinary Integration

Goal:

Verify image delivery.

Tasks:

1. Configure Cloudinary domain.
2. Render banner images.
3. Render gallery images.

Validation Route:

```text
/debug/images
```

Display:

* Banner
* Gallery

Success Criteria:

Images load correctly.

Commit:

```bash
feat(images): integrate cloudinary
```

---

# Phase 5 — Homepage Event Carousel

Goal:

Display upcoming events.

Library:

```text
Embla Carousel
```

Tasks:

1. Create EventCarousel.
2. Create EventCard.
3. Display active events.
4. Sort by upcoming date.

Validation:

Homepage works with:

* No events
* One event
* Multiple events

Commit:

```bash
feat(homepage): add event carousel
```

---

# Phase 6 — Event Routing

Goal:

Generate event pages.

Route:

```text
/events/[slug]
```

Tasks:

1. Generate slugs.
2. Match event by slug.
3. Create event route.

Validation:

Visit event URL.

Correct event loads.

Commit:

```bash
feat(events): add routing
```

---

# Phase 7 — Base Event Layout

Goal:

Create shared page structure.

Sections:

1. Hero Banner
2. Event Information
3. Description
4. Registration CTA
5. Gallery

Validation:

All event data renders.

Commit:

```bash
feat(events): create base layout
```

---

# Phase 8 — Template Engine

Goal:

Render category-specific layouts.

Logic:

```text
Category
↓
Template Selector
↓
Template Component
```

Validation:

Correct template selected.

Commit:

```bash
feat(events): template engine
```

---

# Phase 9 — Performance Template

Supports:

* Music
* Drama
* Stand-Up
* Poetry

Sections:

* Hero
* Description
* About Artists
* Gallery
* Registration

Validation:

Performance events render correctly.

Commit:

```bash
feat(events): performance template
```

---

# Phase 10 — Workshop Template

Supports:

* Workshops
* Training Sessions

Sections:

* Hero
* Overview
* Learning Outcomes
* Schedule
* Gallery
* Registration

Validation:

Workshop events render correctly.

Commit:

```bash
feat(events): workshop template
```

---

# Phase 11 — Exhibition Template

Supports:

* Art Exhibitions
* Photography
* Installations

Sections:

* Hero
* Curator Notes
* Exhibition Details
* Gallery
* Registration

Validation:

Exhibition events render correctly.

Commit:

```bash
feat(events): exhibition template
```

---

# Phase 12 — Gallery System

Goal:

Professional gallery experience.

Tasks:

1. Responsive grid.
2. Lightbox.
3. Mobile gestures.

Validation:

Works on desktop and mobile.

Commit:

```bash
feat(gallery): add image gallery
```

---

# Phase 13 — Registration System

Goal:

Support external registrations.

Supported:

* Google Forms
* WhatsApp
* Ticketing
* External websites

Validation:

Links open correctly.

Commit:

```bash
feat(events): registration actions
```

---

# Phase 14 — Empty States

Handle:

* No events
* Missing image
* Missing gallery
* Missing registration URL

Validation:

No broken pages.

Commit:

```bash
feat(events): add fallbacks
```

---

# Phase 15 — Mobile Optimization

Devices:

* iPhone
* Android
* Tablet

Tasks:

1. Carousel optimization.
2. Gallery optimization.
3. Event page optimization.

Validation:

Responsive audit complete.

Commit:

```bash
feat(ui): responsive optimization
```

---

# Phase 16 — Documentation

Create:

```text
HOW_TO_UPDATE_EVENTS.pdf
```

Include:

## Adding an Event

1. Upload images to Cloudinary.
2. Copy image URLs.
3. Open Events sheet.
4. Add a new row.
5. Paste information.
6. Save.

## Editing an Event

Update row values.

## Hiding an Event

Set:

```text
Active = FALSE
```

Validation:

Non-technical user can follow instructions.

Commit:

```bash
docs: add owner documentation
```

---

# Phase 17 — Final QA

Checklist:

* Event fetching
* Cloudinary images
* Carousel
* Routing
* Templates
* Gallery
* Registration
* Mobile responsiveness
* Lighthouse audit

Release:

```bash
v1.0 Event Management System
```

---

# Claude Development Workflow

For every phase:

1. Ask Claude to implement only that phase.
2. Review file changes.
3. Run application.
4. Test manually.
5. Fix issues.
6. Commit.
7. Proceed to next phase.

Never allow Claude to implement more than one phase at a time.

Every phase must pass validation before moving forward.