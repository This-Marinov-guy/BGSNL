import test from "node:test";
import assert from "node:assert/strict";
import {
  CONTACT_DUPLICATE_WINDOW_MS,
  contactPayloadFingerprint,
  contactPayloadIdentity,
  rememberContactSubmission,
  wasContactSubmissionSentRecently,
} from "../src/util/contact-submission.mjs";

const payload = {
  name: " Ada Lovelace ",
  email: "ADA@EXAMPLE.COM",
  subject: " Volunteering ",
  message: "I would like   to help.",
  region: "Groningen",
};

const memoryStorage = () => {
  const values = new Map();
  return {
    getItem: key => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
  };
};

test("equivalent contact payloads receive the same privacy-safe fingerprint", async () => {
  const first = contactPayloadIdentity(payload);
  const second = contactPayloadIdentity({
    ...payload,
    name: "ada lovelace",
    email: "ada@example.com",
    message: "I would like to help.",
    region: "groningen",
  });
  assert.equal(first, second);
  const fingerprint = await contactPayloadFingerprint(first);
  assert.match(fingerprint, /^[a-f0-9]{64}$/);
  assert.equal(fingerprint.includes("ada"), false);
});

test("a successful message is blocked only during the duplicate window", async () => {
  const storage = memoryStorage();
  const fingerprint = await contactPayloadFingerprint(contactPayloadIdentity(payload));
  const sentAt = 1_000_000;
  rememberContactSubmission(storage, fingerprint, sentAt);
  assert.equal(wasContactSubmissionSentRecently(storage, fingerprint, sentAt + 1), true);
  assert.equal(wasContactSubmissionSentRecently(storage, fingerprint, sentAt + CONTACT_DUPLICATE_WINDOW_MS), false);
  const changed = await contactPayloadFingerprint(contactPayloadIdentity({ ...payload, message: "A different message" }));
  assert.equal(wasContactSubmissionSentRecently(storage, changed, sentAt + 1), false);
});

test("unavailable or malformed browser storage fails open for legitimate retries", () => {
  assert.equal(wasContactSubmissionSentRecently(null, "fingerprint"), false);
  assert.equal(wasContactSubmissionSentRecently({ getItem: () => "broken" }, "fingerprint"), false);
  assert.doesNotThrow(() => rememberContactSubmission({ setItem: () => { throw new Error("blocked"); } }, "fingerprint"));
});
