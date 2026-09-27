import test from "node:test";
import assert from "node:assert/strict";
import { sortFutureEvents } from "../src/util/functions/future-events-sort.mjs";

test("events flow by upcoming date across regions without changing the source", () => {
  const events = [
    { id: "late", region: "amsterdam", title: "Dinner", date: "2026-11-01T18:00:00Z" },
    { id: "soon", region: "groningen", title: "Quiz", date: "2026-10-01T18:00:00Z" },
    { id: "corrected", region: "eindhoven", title: "Party", date: "2026-12-01T18:00:00Z", correctedDate: "2026-09-30T18:00:00Z" },
  ];
  assert.deepEqual(sortFutureEvents(events).map(event => event.id), ["corrected", "soon", "late"]);
  assert.deepEqual(events.map(event => event.id), ["late", "soon", "corrected"]);
});

test("region and name sorts retain every event and use date as a tiebreaker", () => {
  const events = [
    { id: "b", region: "groningen", title: "Quiz", date: "2026-11-01" },
    { id: "a", region: "amsterdam", title: "Dinner", date: "2026-10-01" },
    { id: "c", region: "groningen", title: "quiz", date: "2026-09-30" },
  ];
  for (const sort of ["region", "name"]) {
    assert.deepEqual(sortFutureEvents(events, sort).map(event => event.id), ["a", "c", "b"]);
  }
});

test("invalid or missing dates sort last and invalid corrections fall back to original dates", () => {
  const events = [
    { title: "Undated" },
    { title: "Known", date: "2026-10-01", correctedDate: "invalid" },
    { title: "Invalid", date: "invalid" },
  ];
  assert.deepEqual(sortFutureEvents(events).map(event => event.title), ["Known", "Invalid", "Undated"]);
  assert.deepEqual(sortFutureEvents([]), []);
});
