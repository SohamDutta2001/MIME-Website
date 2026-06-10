// Unit tests for the event utilities (roadmap Phase 3). Run with: npm test
import { test } from 'node:test';
import assert from 'node:assert/strict';

import { slugify, dedupeSlugs } from '../src/lib/events/slug.js';
import {
  filterActive,
  sortByDate,
  splitUpcomingPast,
  findBySlug,
  paragraphs,
  formatEventDate,
} from '../src/lib/events/utils.js';

const ev = (overrides) => ({
  slug: 'x',
  active: true,
  category: 'Performance',
  title: 'X',
  date: '2026-01-01',
  time: '',
  venue: '',
  bannerUrl: '',
  description: '',
  additionalInfo: '',
  galleryUrls: [],
  registrationUrl: '',
  ...overrides,
});

test('slugify: title → url segment', () => {
  assert.equal(slugify('Rabindra Sangeet Evening'), 'rabindra-sangeet-evening');
  assert.equal(slugify('  Mime & Movement: Workshop!  '), 'mime-movement-workshop');
  assert.equal(slugify('Café Évening'), 'cafe-evening');
});

test('slugify: non-ASCII-only titles fall back to "event"', () => {
  assert.equal(slugify('ভাঁড়ের ধোঁয়া'), 'event');
});

test('dedupeSlugs: repeats get -2, -3 and the first stays stable', () => {
  assert.deepEqual(dedupeSlugs(['a', 'a', 'b', 'a']), ['a', 'a-2', 'b', 'a-3']);
});

test('filterActive drops hidden events', () => {
  const events = [ev({ slug: 'on' }), ev({ slug: 'off', active: false })];
  assert.deepEqual(filterActive(events).map((e) => e.slug), ['on']);
});

test('sortByDate: asc and desc, input untouched', () => {
  const events = [ev({ date: '2026-07-20' }), ev({ date: '2026-05-09' }), ev({ date: '2026-07-04' })];
  assert.deepEqual(sortByDate(events).map((e) => e.date), ['2026-05-09', '2026-07-04', '2026-07-20']);
  assert.deepEqual(sortByDate(events, 'desc').map((e) => e.date), ['2026-07-20', '2026-07-04', '2026-05-09']);
  assert.equal(events[0].date, '2026-07-20');
});

test('splitUpcomingPast: today counts as upcoming; past is most-recent-first', () => {
  const events = [
    ev({ slug: 'past-old', date: '2026-01-01' }),
    ev({ slug: 'past-recent', date: '2026-06-01' }),
    ev({ slug: 'today', date: '2026-06-11' }),
    ev({ slug: 'soon', date: '2026-07-04' }),
  ];
  const { upcoming, past } = splitUpcomingPast(events, '2026-06-11');
  assert.deepEqual(upcoming.map((e) => e.slug), ['today', 'soon']);
  assert.deepEqual(past.map((e) => e.slug), ['past-recent', 'past-old']);
});

test('findBySlug', () => {
  const events = [ev({ slug: 'a' }), ev({ slug: 'b' })];
  assert.equal(findBySlug(events, 'b'), events[1]);
  assert.equal(findBySlug(events, 'nope'), undefined);
});

test('paragraphs: blank-line splitting, whitespace trimmed', () => {
  assert.deepEqual(paragraphs('one\n\ntwo\n \nthree'), ['one', 'two', 'three']);
  assert.deepEqual(paragraphs('single line'), ['single line']);
  assert.deepEqual(paragraphs('  \n \n '), []);
});

test('formatEventDate: readable date, invalid passthrough', () => {
  assert.equal(formatEventDate('2026-07-04'), 'Saturday 4 July 2026');
  assert.equal(formatEventDate('soon™'), 'soon™');
});
