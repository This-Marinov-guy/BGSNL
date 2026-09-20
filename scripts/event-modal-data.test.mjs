import assert from "node:assert/strict";
import test from "node:test";
import { eventModalData } from "../src/util/functions/event-modal-data.mjs";

test("published settings use stored promotions and promo codes", () => {
  const event = {
    id: "published", status: "open", region: "groningen",
    product: { guest: { price: 20, priceId: "internal" }, promoCodes: [{ code: "WELCOME", discount: 10, active: false }] },
    promotion: { guest: { isEnabled: true, discount: 15 }, member: { isEnabled: false } },
    earlyBird: { isEnabled: true, price: 10 },
    lateBird: { isEnabled: true, price: 25 },
    addOns: { isEnabled: true, items: [{ title: "Drink", price: 2 }] },
    extraInputsForm: [{ placeholder: "Meal", options: ["Vegetarian", "Other"] }],
    subEvent: { links: [{ name: "Dinner", href: "/event-details/dinner", poster: "/dinner.jpg" }] },
    draftData: { title: "Stale draft", guestPrice: 999 },
  };
  const before = structuredClone(event);
  const result = eventModalData(event);
  assert.deepEqual(result.guestPromotion, event.promotion.guest);
  assert.deepEqual(result.memberPromotion, event.promotion.member);
  assert.deepEqual(result.promoCodes, { isEnabled: true, codes: event.product.promoCodes });
  for (const key of ["product", "earlyBird", "lateBird", "addOns", "extraInputsForm", "subEvent"]) assert.deepEqual(result[key], event[key]);
  assert.equal(result.title, undefined);
  assert.deepEqual(event, before);
});

test("draft details use form values while preserving stored identity and uploaded media", () => {
  const event = {
    id: "draft", status: "draft", region: "groningen", readyToPublish: false,
    poster: "/uploaded.jpg", ticketImg: "/ticket.jpg", images: ["/extra.jpg"],
    draftData: {
      id: "wrong", status: "open", region: "utrecht", readyToPublish: true,
      title: "Dinner", guestPrice: "20", memberPrice: "15", activeMemberPrice: 0,
      poster: {}, ticketImg: {}, images: [{}],
      guestPromotion: { isEnabled: true, discount: 10 },
      promoCodes: { isEnabled: false, codes: [{ code: "DISABLED" }] },
      earlyBird: { isEnabled: true, price: 12 }, addOns: { isEnabled: true, items: [] },
    },
  };
  const result = eventModalData(event);
  assert.equal(result.id, "draft");
  assert.equal(result.status, "draft");
  assert.equal(result.region, "groningen");
  assert.equal(result.readyToPublish, false);
  assert.equal(result.title, "Dinner");
  assert.equal(result.product.guest.price, "20");
  assert.equal(result.product.activeMember.price, 0);
  assert.equal(result.poster, "/uploaded.jpg");
  assert.equal(result.ticketImg, "/ticket.jpg");
  assert.deepEqual(result.images, ["/extra.jpg"]);
  for (const key of ["guestPromotion", "promoCodes", "earlyBird", "addOns"]) assert.deepEqual(result[key], event.draftData[key]);
});

test("minimal drafts and events without upsells remain readable", () => {
  assert.equal(eventModalData({ _id: "draft", status: "draft" }).id, "draft");
  assert.deepEqual(eventModalData({ status: "open" }).promoCodes, { isEnabled: false, codes: [] });
  assert.equal(eventModalData({ status: "draft", draftData: { isTicketLink: true } }).isTicketLink, true);
  assert.equal(eventModalData({ status: "open", ticketLink: "https://example.com" }).isTicketLink, true);
});
