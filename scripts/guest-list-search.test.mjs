import test from "node:test";
import assert from "node:assert/strict";
import { filterGuestList } from "../src/util/functions/guest-list-search.mjs";

const guests = [
  { name: "José Member", email: "jose@example.invalid", phone: "+31 (6) 1234-5678", transactionId: "pi_TestABC" },
  { name: "Mock Guest", email: "guest@example.invalid", phone: null, transactionId: null },
];
test("searches all four fields case-insensitively, including normalized names and phones", () => {
  for (const query of ["JOSE", "jose@", "31612345678", "PI_TEST", "  member  "]) {
    assert.deepEqual(filterGuestList(guests, query), [guests[0]]);
  }
});
test("empty queries preserve rows; no matches and missing fields are safe", () => {
  assert.equal(filterGuestList(guests, "  "), guests);
  assert.deepEqual(filterGuestList(guests, "unknown"), []);
  assert.deepEqual(filterGuestList([{}], "phone"), []);
});
