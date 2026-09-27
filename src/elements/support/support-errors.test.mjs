import test from "node:test";
import assert from "node:assert/strict";
import { isTemporarySupportError } from "./support-errors.mjs";

test("background service failures are quiet, while access and validation errors remain visible", () => {
  for (const status of [undefined, 408, 429, 500, 502, 503, 504]) assert.equal(isTemporarySupportError({ status }), true);
  for (const status of [400, 401, 403, 404, 409, 422]) assert.equal(isTemporarySupportError({ status }), false);
});
