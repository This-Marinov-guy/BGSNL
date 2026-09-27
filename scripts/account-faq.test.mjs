import test from "node:test";
import assert from "node:assert/strict";
import { FAQ_SECTIONS, getFaqSections, searchFaqSections } from "../src/elements/support/faq-content.mjs";

const account = (roles, status = "active") => ({ authInitialized: true, session: { userId: "test" }, roles, status });
const ids = user => getFaqSections(user).flatMap(section => section.questions.map(item => item.id));

test("FAQ search ignores case and whitespace and searches answers and category labels", () => {
  const user = account(["member"]);
  const resultIds = query => searchFaqSections(user, query).flatMap(section => section.questions.map(item => item.id));
  assert.deepEqual(resultIds("MY TICKETS"), resultIds(" mY\t t i c k e t s "));
  assert.ok(resultIds("mytickets").includes("event-tickets"));
  assert.ok(resultIds("SECURITY CODES").includes("payment-help"));
  assert.equal(searchFaqSections(user, "p a y m e n t s")[0].id, "payments");
  assert.deepEqual(searchFaqSections(user, "no-matching-faq-123"), []);
});

test("search never exposes hidden answers and empty queries return permitted FAQs", () => {
  assert.deepEqual(searchFaqSections(account(["member"]), "national event permissions"), []);
  assert.equal(searchFaqSections(account(["admin"]), "national event permissions").length, 1);
  assert.deepEqual(searchFaqSections(account(["admin"], "frozen"), "national event permissions"), []);
  assert.deepEqual(searchFaqSections(account(["member"]), " ").map(section => section.questions), getFaqSections(account(["member"])).map(section => section.questions));
});

test("all six topics are available to ordinary members without staff FAQs", () => {
  assert.deepEqual(getFaqSections(account(["member"])).map(item => item.id), ["events", "memberships", "payments", "access", "support", "terms"]);
  assert.ok(ids(account(["member"])).includes("read-terms"));
  for (const item of FAQ_SECTIONS.flatMap(section => section.questions).filter(item => item.access)) {
    assert.ok(!ids(account(["member"])).includes(item.id));
  }
});

test("alumni guidance is shown only to alumni", () => {
  assert.ok(ids(account(["alumni"])).includes("alumni-card"));
  assert.ok(!ids(account(["member"])).includes("alumni-card"));
});

test("regional event and member permissions follow existing administration access", () => {
  const committee = ids(account(["regional_committee_member"]));
  assert.ok(committee.includes("regional-events"));
  assert.ok(committee.includes("manage-events"));
  assert.ok(!committee.includes("manage-members"));
  assert.ok(!committee.includes("national-events"));
  assert.ok(ids(account(["board_member"])).includes("manage-members"));
});

test("national staff see cross-region guidance but not the support inbox", () => {
  for (const role of ["national_board_member", "society_board_member", "national_committee_member"]) {
    const visible = ids(account([role]));
    assert.ok(visible.includes("national-events"));
    assert.ok(visible.includes("manage-members"));
    assert.ok(!visible.includes("regional-events"));
    assert.ok(!visible.includes("support-inbox"));
  }
});

test("support and administrator FAQs respect role and status gates", () => {
  assert.ok(ids(account(["support"])).includes("support-inbox"));
  assert.ok(!ids(account(["support"])).includes("manage-events"));
  assert.ok(!ids(account(["support"], "locked")).includes("support-inbox"));
  for (const role of ["admin", "super_admin"]) {
    assert.ok(ids(account([role], "locked")).includes("support-inbox"));
    assert.ok(!ids(account([role], "frozen")).includes("support-inbox"));
  }
});

test("missing/restoring sessions and role changes cannot retain staff questions", () => {
  for (const user of [undefined, {}, { ...account(["admin"]), session: null }, { ...account(["admin"]), authInitialized: false }]) {
    assert.ok(!ids(user).includes("support-inbox"));
  }
  assert.ok(ids(account(["admin"])).includes("support-inbox"));
  assert.ok(!ids(account(["member"])).includes("support-inbox"));
});

test("empty topics remain available and unknown access rules fail closed", () => {
  const sections = getFaqSections(account(["admin"]), [{ id: "empty", questions: [] }, { id: "unknown", questions: [{ id: "restricted", access: "invalid" }] }]);
  assert.deepEqual(sections.map(item => item.questions), [[], []]);
});
