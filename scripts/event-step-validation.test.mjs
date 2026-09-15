import test from "node:test";
import assert from "node:assert/strict";
import { blockingEventStep, eventDraftProgress } from "../src/util/functions/event-step-validation.mjs";

test("details cannot advance with missing required fields", () => {
  assert.deepEqual(blockingEventStep({ title: "Required", date: "Required", poster: "Required" }, 1), { step: 0, paths: ["title", "date"] });
});
test("later-step errors do not block a complete details step", () => {
  assert.equal(blockingEventStep({ poster: "Required", guestPrice: "Required", extraInputsForm: "Required" }, 1), null);
});
test("ticket and media errors block the extras step", () => {
  assert.deepEqual(blockingEventStep({ guestPrice: "Invalid", poster: "Required" }, 2), { step: 1, paths: ["guestPrice", "poster"] });
});
test("jumping to a visited step still checks earlier fields", () => {
  assert.deepEqual(blockingEventStep({ region: "Required", ticketLimit: "Required" }, 2), { step: 0, paths: ["region"] });
});
test("complete steps advance without upsell validation or errors", () => {
  assert.equal(blockingEventStep({ addOns: { title: "Required" } }, 2), null);
  assert.equal(blockingEventStep({}, 2), null);
});


test("draft progress restores the last step while retaining later visited steps", () => {
  const saved = JSON.parse(JSON.stringify({ currentStep: 1, furthestStep: 2 }));
  assert.deepEqual(eventDraftProgress(saved, 3), { currentStep: 1, furthestStep: 2 });
  assert.deepEqual(eventDraftProgress({ currentStep: 2, furthestStep: 0 }, 3), { currentStep: 2, furthestStep: 2 });
});
test("legacy drafts and invalid indexes safely start at event details", () => {
  for (const progress of [undefined, null, {}, { currentStep: -1 }, { currentStep: 3 }, { currentStep: 1.5 }, { currentStep: "2" }]) {
    assert.deepEqual(eventDraftProgress(progress, 3), { currentStep: 0, furthestStep: 0 });
  }
});
test("resuming later steps retains validation of earlier fields", () => {
  const { currentStep } = eventDraftProgress({ currentStep: 1, furthestStep: 2 }, 3);
  assert.deepEqual(blockingEventStep({ title: "Required" }, currentStep + 1), { step: 0, paths: ["title"] });
});

test("collect-data errors return to Tickets & media before Upsell", () => {
  assert.deepEqual(blockingEventStep({ extraInputsForm: [{ placeholder: "Required" }] }, 2), { step: 1, paths: ["extraInputsForm.0.placeholder"] });
});
