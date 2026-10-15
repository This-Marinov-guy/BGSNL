import test from "node:test";
import assert from "node:assert/strict";
import { newestToastIdsToRemove } from "../src/util/functions/toast-limit.mjs";

const visible = (id) => ({ id, visible: true, dismissed: false });

test("a fourth toast replaces the newest visible one", () => {
  assert.deepEqual(newestToastIdsToRemove([visible("third"), visible("second"), visible("first")]), ["third"]);
});

test("expired toasts and updates do not consume a new slot", () => {
  const toasts = [
    { ...visible("expired"), visible: false },
    visible("third"),
    visible("second"),
    visible("first"),
  ];
  assert.deepEqual(newestToastIdsToRemove(toasts, "third"), []);
  assert.deepEqual(newestToastIdsToRemove(toasts), ["third"]);
});

test("an already overfull stack is trimmed to three before a new toast", () => {
  assert.deepEqual(newestToastIdsToRemove([
    visible("fourth"), visible("third"), visible("second"), visible("first"),
  ]), ["fourth", "third"]);
});
