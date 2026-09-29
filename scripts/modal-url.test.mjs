import test from "node:test";
import assert from "node:assert/strict";
import { modalKey, updateModalUrl } from "../src/elements/ui/modals/modal-url.mjs";

test("modal query values are stable and readable", () => {
  assert.equal(modalKey("Update your details"), "update-your-details");
  assert.equal(modalKey("Member or Alumni?"), "member-or-alumni");
});

test("opening and closing a modal preserve existing query values and hash", () => {
  const original = "https://bgsnl.example/user?transferTo=alumni#settings";
  const opened = updateModalUrl(original, "update-your-details", true);
  assert.equal(opened, "/user?transferTo=alumni&modal=update-your-details#settings");
  assert.equal(updateModalUrl(`https://bgsnl.example${opened}`, "update-your-details", true), opened);
  assert.equal(updateModalUrl(`https://bgsnl.example${opened}`, "update-your-details", false), "/user?transferTo=alumni#settings");
});

test("nested modal values close independently", () => {
  const parent = "https://bgsnl.example/user?modal=switch-subscription";
  const child = updateModalUrl(parent, "member-or-alumni", true);
  assert.equal(child, "/user?modal=switch-subscription&modal=member-or-alumni");
  assert.equal(updateModalUrl(`https://bgsnl.example${child}`, "member-or-alumni", false), "/user?modal=switch-subscription");
});
