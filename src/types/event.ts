// Event domain model — the typed shape of one row of the owner's Events
// sheet after the build-time sync (scripts/sync-events.mjs) has parsed it.
// Sheet columns and formats are documented in docs/SETUP.md §3.

// The three category values the sheet may use. Each one maps to a page
// template (PerformanceTemplate / WorkshopTemplate / ExhibitionTemplate):
//   Performance — music, drama, stand-up, poetry, storytelling
//   Workshop    — acting / music / art workshops, educational sessions
//   Exhibition  — art, photography, installations, book exhibitions
export const EVENT_CATEGORIES = ['Performance', 'Workshop', 'Exhibition'] as const;

export type EventCategory = (typeof EVENT_CATEGORIES)[number];

export function isEventCategory(value: string): value is EventCategory {
  return (EVENT_CATEGORIES as readonly string[]).includes(value);
}

export interface CafeEvent {
  /** URL path segment under /events/, generated from the title. */
  slug: string;
  /** Hidden everywhere when false (sheet column `active` = FALSE). */
  active: boolean;
  category: EventCategory;
  title: string;
  /** ISO date, e.g. "2026-07-04". Drives sorting and the upcoming/past split. */
  date: string;
  /** Free text shown as-is, e.g. "6:00 PM". May be empty. */
  time: string;
  /** May be empty; the UI falls back to the café's name. */
  venue: string;
  /**
   * Hero image — either a full URL (Cloudinary) or a bare filename resolved
   * against /public/cafe-assets/ (the pre-Cloudinary fallback). Empty string
   * means no banner; templates render a textured placeholder instead.
   */
  bannerUrl: string;
  /** Main description. Blank lines separate paragraphs. */
  description: string;
  /**
   * Category-specific copy: artist bios (Performance), learning outcomes
   * (Workshop), curator notes (Exhibition). Blank lines separate paragraphs.
   */
  additionalInfo: string;
  /** Gallery images, same URL-or-filename convention as bannerUrl. */
  galleryUrls: string[];
  /** External registration link (Google Form, wa.me, ticketing…). Empty = walk-in. */
  registrationUrl: string;
}
