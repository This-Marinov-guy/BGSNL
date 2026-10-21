import test from "node:test";
import assert from "node:assert/strict";
import { scannerTicketDetailRows } from "../src/util/functions/scanner-ticket-details.mjs";

test("scanner details omit absent fields and empty legacy preference JSON", () => {
  const rows = scannerTicketDetailRows({
    name: "  Ada  ", email: " ", phone: null, type: "member", timestamp: "invalid",
    transactionId: "-", addOns: [], preferences: "{}",
  });
  assert.deepEqual(rows, [{ label: "Name", value: "Ada" }, { label: "Type", value: "Member" }]);
  assert.deepEqual(scannerTicketDetailRows({ preferences: "not JSON", addOns: [{ title: " " }] }), []);
});

test("scanner details format real add-ons and custom answers without metadata", () => {
  const rows = scannerTicketDetailRows({
    addOns: [{ title: " Welcome drink " }, { title: "" }, { title: "Dinner" }],
    preferences: JSON.stringify({
      Diet: "Vegetarian", Accessibility: ["Wheelchair access", ""], Guests: 0,
      Confirmed: false, Blank: "  ", Empty: [], Missing: null, Internal: {},
      fixture: "mock", pricingTier: "member", 0: "{",
    }),
  });
  assert.deepEqual(rows, [
    { label: "Add-ons", value: "Welcome drink, Dinner" },
    { label: "Diet", value: "Vegetarian" },
    { label: "Accessibility", value: "Wheelchair access" },
    { label: "Guests", value: "0" },
    { label: "Confirmed", value: "No" },
  ]);
});
