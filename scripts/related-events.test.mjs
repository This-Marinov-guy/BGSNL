import test from 'node:test';
import assert from 'node:assert/strict';
import { relatedEventOptions, relatedEventLink, isRelatedEventSelected, visibleRelatedEvents } from '../src/util/functions/related-events.mjs';

test('recommendations exclude the current event, drafts and archived events across merged lists', () => {
  const event = { id: 'dinner', region: 'amsterdam', title: 'Dinner' };
  assert.deepEqual(relatedEventOptions([event, event, { ...event, id: 'self' }, { ...event, id: 'draft', status: 'draft' }, { ...event, id: 'archived', status: 'archived' }], 'self'), [event]);
});
test('selecting an event creates the existing public-link payload and detects saved ID or slug links', () => {
  const event = { id: '123', slug: 'spring-dinner', title: 'Spring dinner', region: 'amsterdam' };
  const link = relatedEventLink(event, 'https://www.bulgariansociety.nl');
  assert.deepEqual(link, { name: 'Spring dinner', href: 'https://www.bulgariansociety.nl/amsterdam/event-details/123' });
  assert.equal(isRelatedEventSelected(event, [link]), true);
  assert.equal(isRelatedEventSelected(event, [{ href: 'https://kanatitsa.bulgariansociety.nl/amsterdam/event-details/spring-dinner' }]), true);
  assert.equal(isRelatedEventSelected(event, [{ href: 'invalid' }]), false);
});

test('shows at most three events, prioritizing the selected city without mutating the source', () => {
  const events = [
    { id: 'a', title: 'Dinner', region: 'amsterdam' },
    { id: 'b', title: 'Social', region: 'groningen' },
    { id: 'c', title: 'Workshop', region: 'amsterdam' },
    { id: 'd', title: 'Party', region: 'groningen' },
    { id: 'e', title: 'Lecture', region: 'groningen' },
  ];
  assert.deepEqual(visibleRelatedEvents(events, 'groningen').map(event => event.id), ['b', 'd', 'e']);
  assert.deepEqual(visibleRelatedEvents(events, 'amsterdam').map(event => event.id), ['a', 'c', 'b']);
  assert.deepEqual(events.map(event => event.id), ['a', 'b', 'c', 'd', 'e']);
});
test('search can find events outside the first three recommendations', () => {
  const events = Array.from({ length: 5 }, (_, index) => ({ id: String(index), title: `Event ${index}`, region: 'groningen' }));
  assert.deepEqual(visibleRelatedEvents(events, 'groningen', 'event 4').map(event => event.id), ['4']);
  assert.deepEqual(visibleRelatedEvents(events, 'groningen', 'not found'), []);
});
