// Typed event loader — binds the synced JSON to the CafeEvent type and the
// pure helpers in utils.js. Pages and islands import from here; nothing
// else should touch src/data/events.json directly.

import rawEvents from '../../data/events.json';
import type { CafeEvent } from '../../types/event';
import { filterActive, findBySlug, splitUpcomingPast } from './utils.js';

export const allEvents: CafeEvent[] = filterActive(rawEvents as CafeEvent[]);

const split = splitUpcomingPast(allEvents);

/** Active events dated today or later, soonest first. */
export const upcomingEvents: CafeEvent[] = split.upcoming;

/** Active events that have already happened, most recent first. */
export const pastEvents: CafeEvent[] = split.past;

export function getEvent(slug: string): CafeEvent | undefined {
  return findBySlug(allEvents, slug);
}
