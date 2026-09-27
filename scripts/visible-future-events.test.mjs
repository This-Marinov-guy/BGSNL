import test from "node:test";
import assert from "node:assert/strict";
import { visibleFutureEvents } from "../src/util/functions/visible-future-events.mjs";

const events = {
  amsterdam: [
    { id: "public" },
    { id: "explicit-public", hidden: false },
    { id: "hidden", hidden: true },
    { id: "members", memberOnly: true },
  ],
  groningen: [{ id: "other-region", region: "groningen" }],
};

test("regional pages include public events even when hidden is omitted, and only their region", () => {
  const result = visibleFutureEvents(events, ["amsterdam"]);
  assert.deepEqual(result.map(event => event.id), ["public", "explicit-public"]);
  assert.ok(result.every(event => event.region === "amsterdam"));
  assert.equal(events.amsterdam[0].region, undefined);
});

test("member visibility stays scoped to the selected region and excludes hidden events", () => {
  assert.deepEqual(visibleFutureEvents(events, ["amsterdam"], true).map(event => event.id),
    ["public", "explicit-public", "members"]);
});

test("homepage can show every region while empty regions never fall back to all events", () => {
  assert.deepEqual(visibleFutureEvents(events, ["amsterdam", "groningen"]).map(event => event.id),
    ["public", "explicit-public", "other-region"]);
  assert.deepEqual(visibleFutureEvents(events, ["rotterdam"]), []);
  assert.deepEqual(visibleFutureEvents(undefined, ["amsterdam"]), []);
});
