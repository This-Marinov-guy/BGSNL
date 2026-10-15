import test from "node:test";
import assert from "node:assert/strict";
import { academicYearToDate, eventGuestCapacity, eventRevenueByEvent, inDateRange, memberTimeline, monthBuckets, validDayKey } from "./statistics-period.mjs";

test("academic year starts on 25 August in Amsterdam", () => {
  assert.deepEqual(academicYearToDate(new Date("2026-08-24T12:00:00Z")), { from: "2025-08-25", to: "2026-08-24" });
  assert.deepEqual(academicYearToDate(new Date("2026-08-25T12:00:00Z")), { from: "2026-08-25", to: "2026-08-25" });
});

test("date range rejects invalid dates and includes both boundaries", () => {
  assert.equal(validDayKey("2026-02-30"), false);
  assert.equal(inDateRange("2026-08-25T10:00:00Z", "2026-08-25", "2026-09-01"), true);
  assert.equal(inDateRange("2026-09-01T10:00:00Z", "2026-08-25", "2026-09-01"), true);
  assert.equal(inDateRange("2026-09-02T10:00:00Z", "2026-08-25", "2026-09-01"), false);
  assert.deepEqual(monthBuckets("2026-09-01", "2026-08-31"), []);
});

test("event revenue keeps each event separate in date order", () => {
  const events = eventRevenueByEvent([
    { _id: "outside", title: "Earlier", date: "2026-08-24T10:00:00Z", revenue: 99 },
    { _id: "later", title: "Autumn social", date: "2026-09-02T10:00:00Z", revenue: 20 },
    { _id: "first", title: "Welcome night", date: "2026-08-25T10:00:00Z", revenue: 12.5 },
    { _id: "same-month", title: "Second September event", date: "2026-09-03T10:00:00Z", revenue: 15 },
  ], "2026-08-25", "2026-09-30");
  assert.deepEqual(events.map(({ id, revenue }) => [id, revenue]), [["first", 12.5], ["later", 20], ["same-month", 15]]);
  assert.equal(events[2].label, "Second Septembe…");
});

test("member timeline groups joins by month", () => {
  const members = memberTimeline([
    { joinDate: "2026-08-25T10:00:00Z" },
    { joinDate: "2026-09-02T10:00:00Z" },
    { joinDate: "2026-09-03T10:00:00Z" },
  ], "2026-08-25", "2026-09-30");
  assert.deepEqual(members.map(({ members: count }) => count), [1, 2]);
});

test("event guest chart compares non-refunded guests with each event limit", () => {
  const data = eventGuestCapacity([
    { _id: "later", title: "Later event", date: "2026-09-20T12:00:00Z", totalGuests: 80, ticketLimit: 100 },
    { _id: "earlier", title: "Earlier event", date: "2026-09-10T12:00:00Z", totalGuests: 12, ticketLimit: 20 },
  ]);
  assert.deepEqual(data.map(({ id, guests, limit }) => [id, guests, limit]), [["earlier", 12, 20], ["later", 80, 100]]);
});
