import test from "node:test";
import assert from "node:assert/strict";
import { parseTicketScan } from "../src/util/functions/ticket-scan.mjs";

test("short QR and manual token resolve to the same identity", () => {
  const token = "abcdefghijklmnopqrstuv";
  assert.deepEqual(parseTicketScan(`https://bulgariansociety.nl/t/${token}`), { token });
  assert.deepEqual(parseTicketScan(token), { token });
});
test("both old paths work but URL counts cannot auto-admit a group", () => {
  for (const path of ["/user/check-guest-list", "/user/dashboard/guest-list"]) {
    assert.deepEqual(parseTicketScan(`https://www.bulgariansociety.nl${path}?event=0123456789abcdef01234567&code=1770000000000&count=9`),
      { eventId: "0123456789abcdef01234567", code: "1770000000000" });
  }
});
test("unrelated URLs, membership cards, invalid IDs and credentials fail closed", () => {
  for (const value of ["https://evil.test/t/abcdefghijklmnopqrstuv", "https://bulgariansociety.nl/c/abcdefghijklmnopqrstuv", "javascript:alert(1)", "https://user@bulgariansociety.nl/t/abcdefghijklmnopqrstuv", "/user/check-guest-list?event=bad&code=123"]) assert.throws(() => parseTicketScan(value));
});
