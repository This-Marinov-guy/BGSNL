import test from "node:test";
import assert from "node:assert/strict";
import { requestErrorNotice } from "../src/util/auth/request-error-notice.mjs";

test("system failures never create a toast", () => {
  for (const status of [undefined, 404, 408, 429, 500, 502, 503, 504]) {
    assert.equal(requestErrorNotice({ response: status ? { status, data: { message: "secret" } } : undefined,
      message: "provider secret" }), null);
  }
});

test("access failures and validation retain safe feedback", () => {
  assert.equal(requestErrorNotice({ response: { status: 401, data: {} } }).detail,
    "You cannot complete this action with this account.");
  assert.equal(requestErrorNotice({ response: { status: 403, data: { message: "No access" } } }).detail, "No access");
  assert.equal(requestErrorNotice({ response: { status: 422, data: { message: "Choose a region" } } }).detail, "Choose a region");
  assert.equal(requestErrorNotice({ response: { status: 422, data: { message: "x".repeat(301) } } }).detail,
    "We could not complete your request. Please check your input and try again.");
  assert.equal(requestErrorNotice({ response: { status: 422, data: { message: "token=private@example.org" } } }).detail,
    "We could not complete your request. Please check your input and try again.");
});
