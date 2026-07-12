// Typed event loader — binds the synced JSON to the CafeEvent type and the
// pure helpers in utils.js. Pages and islands import from here; nothing
// else should touch src/data/events.json directly.

import eventsFile from '../../data/events.json';
import type { CafeEvent } from '../../types/event';
import { filterActive, findBySlug, splitUpcomingPast, bySection } from './utils.js';

const SUPPORTED_SCHEMA_VERSION = 1;
if ((eventsFile as any).schemaVersion !== SUPPORTED_SCHEMA_VERSION) {
  throw new Error(
    `events.json: expected schemaVersion ${SUPPORTED_SCHEMA_VERSION}, got ${(eventsFile as any).schemaVersion}. ` +
    `Update all consumers before deploying a new schema version.`
  );
}

export const allEvents: CafeEvent[] = filterActive((eventsFile as any).data as CafeEvent[]);

const split = splitUpcomingPast(allEvents);

/** Active events dated today or later, soonest first. */
export const upcomingEvents: CafeEvent[] = split.upcoming;

/** Active events that have already happened, most recent first. */
export const pastEvents: CafeEvent[] = split.past;

/** Upcoming Café Events, soonest first. */
export const cafeUpcomingEvents: CafeEvent[] = bySection(upcomingEvents, 'cafe');

/** Upcoming Third Space events, soonest first. */
export const thirdSpaceUpcomingEvents: CafeEvent[] = bySection(upcomingEvents, 'third-space');

export function getEvent(slug: string): CafeEvent | undefined {
  return findBySlug(allEvents, slug);
}
