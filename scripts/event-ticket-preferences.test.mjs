import assert from "node:assert/strict";
import test from "node:test";
import { createTicketEntryHandler, createTicketPaymentHandler } from "../src/util/payments/event-ticket-handlers.mjs";
import { eventTicketCookieName, isEventTicketPage } from "../src/util/payments/event-ticket-policy.mjs";
const id = "a".repeat(24), token = `e1.${"b".repeat(80)}`;
const entry = createTicketEntryHandler({ randomId: () => id, secure: true });
const params = { params: Promise.resolve({ checkout: id }) };
const request = (body = {}, origin = "https://example.test") => new Request(`https://example.test/payment/event-ticket/${id}/pay`, { method: "POST", headers: { "Content-Type": "application/json", ...(origin ? { Origin: origin } : {}) }, body: JSON.stringify(body) });

test("email handoff removes the bearer token before rendering and sets only a scoped cookie", async () => {
  const response = entry(new Request(`https://example.test/payment/event-ticket/start?token=${token}`));
  assert.equal(response.status, 303);
  assert.equal(response.headers.get("Location"), `https://example.test/payment/event-ticket/${id}`);
  assert.equal(await response.text(), "");
  const cookie = response.headers.get("Set-Cookie");
  assert.match(cookie, /HttpOnly/); assert.match(cookie, /Secure/); assert.match(cookie, /SameSite=Lax/); assert.match(cookie, /Max-Age=1800/);
  assert.ok(cookie.includes(`Path=/payment/event-ticket/${id};`));
  assert.ok(cookie.startsWith(`${eventTicketCookieName(id)}=`));
  assert.equal(response.headers.get("Referrer-Policy"), "no-referrer");
});

test("mail-scanner HEAD and malformed tokens never set a capability cookie", () => {
  const head = entry(new Request(`https://example.test/payment/event-ticket/start?token=${token}`, { method: "HEAD" }));
  assert.equal(head.status, 204); assert.equal(head.headers.get("Set-Cookie"), null);
  const invalid = entry(new Request("https://example.test/payment/event-ticket/start?token=bad"));
  assert.equal(invalid.headers.get("Set-Cookie"), null);
});

test("cross-origin and missing-origin submissions cannot reach checkout", async () => {
  const handler = createTicketPaymentHandler({ checkoutRequest: () => { throw new Error("Must not be called"); } });
  for (const origin of [null, "https://attacker.test"]) assert.equal((await handler(request({}, origin), params)).status, 403);
});

test("submission forwards only preferences using the server-side cookie lookup", async () => {
  let called;
  const handler = createTicketPaymentHandler({ checkoutRequest: async (...args) => { called = args; return { url: "https://checkout.stripe.com/c/pay/test" }; } });
  const body = { addOns: ["addon"], preferences: { Meal: "Vegetarian" }, revision: "revision", token: "forged", memberId: "another", eventId: "another", quantity: 10, price: 0, origin_url: "https://attacker.test" };
  const response = await handler(request(body), params);
  assert.equal(response.status, 200);
  assert.deepEqual(called, [id, "checkout", { addOns: body.addOns, preferences: body.preferences, revision: body.revision }]);
});

test("oversized or invalid bodies never call the API", async () => {
  const handler = createTicketPaymentHandler({ checkoutRequest: () => { throw new Error("Must not be called"); } });
  for (const body of [null, [], { preferences: { answer: "x".repeat(20000) } }]) assert.equal((await handler(request(body), params)).status, 422);
});

test("only trusted Stripe destinations can be returned to the browser", async () => {
  for (const url of ["https://attacker.test", "https://checkout.stripe.com.attacker.test", "https://user:pass@checkout.stripe.com/c/pay/test", "javascript:alert(1)"]) {
    const handler = createTicketPaymentHandler({ checkoutRequest: async () => ({ url }) });
    assert.equal((await handler(request(), params)).status, 503);
  }
});

test("missing scoped cookie or expired capability stays an error, never a login", async () => {
  const handler = createTicketPaymentHandler({ checkoutRequest: async () => { throw Object.assign(new Error("Expired"), { status: 410 }); } });
  const response = await handler(request(), params);
  assert.equal(response.status, 410); assert.equal(response.headers.get("Set-Cookie"), null);
  assert.equal(eventTicketCookieName("../account"), null);
  assert.equal(isEventTicketPage(`/payment/event-ticket/${id}`), true); assert.equal(isEventTicketPage("/user"), false);
});
