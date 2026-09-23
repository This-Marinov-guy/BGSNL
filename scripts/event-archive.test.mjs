import assert from "node:assert/strict";
import test from "node:test";
import { ARCHIVE_AFTER_MS, isActiveEvent, isPastOrArchivedEvent, shouldArchiveEvent } from "../src/util/functions/event-archive.mjs";

const now = Date.UTC(2026, 8, 22, 12);
const dated = (offset, status = "opened") => ({ date: new Date(now + offset).toISOString(), status });

test("active and past archive views partition non-draft events", () => {
  assert.equal(isActiveEvent(dated(60_000), now), true);
  assert.equal(isPastOrArchivedEvent(dated(-60_000), now), true);
  assert.equal(isPastOrArchivedEvent({ status: "archived" }, now), true);
  assert.equal(isPastOrArchivedEvent({ status: "ARCHIVED" }, now), true);
  assert.equal(isActiveEvent({ status: "draft" }, now), false);
  assert.equal(isPastOrArchivedEvent({ status: "draft" }, now), false);
});

test("only events older than a full week are scheduled for archival", () => {
  assert.equal(shouldArchiveEvent(dated(-ARCHIVE_AFTER_MS + 1), now), false);
  assert.equal(shouldArchiveEvent(dated(-ARCHIVE_AFTER_MS, "opened"), now), true);
  assert.equal(shouldArchiveEvent({ ...dated(-ARCHIVE_AFTER_MS - 1), correctedDate: new Date(now + 60_000).toISOString() }, now), false);
  assert.equal(shouldArchiveEvent(dated(-ARCHIVE_AFTER_MS - 1, "cancelled"), now), false);
  assert.equal(shouldArchiveEvent(dated(-ARCHIVE_AFTER_MS - 1, "archived"), now), false);
});
