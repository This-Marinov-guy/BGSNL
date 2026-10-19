import test from "node:test";
import assert from "node:assert/strict";
import { readEventDashboardQuery } from "../src/util/event-dashboard-query.mjs";

test("guest list wins when a refreshed dashboard URL contains older modal markers", () => {
  const params = new URLSearchParams("event=6acbcc5677e27a1b8b3ee0ec&modal=opened-folklore-halloween-night&modal=guest-list&modal=guest-list-folklore-halloween-night");
  const query = readEventDashboardQuery(params);
  assert.equal(query.openEventId, "6acbcc5677e27a1b8b3ee0ec");
  assert.equal(query.modalView, "guest-list");
  assert.equal(readEventDashboardQuery(new URLSearchParams("event=1&modal=event")).modalView, "event");
});
