import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import vm from "node:vm";
import test from "node:test";
import { NextRequest, NextResponse } from "next/server.js";
import * as policy from "../src/util/payments/return-policy.mjs";

// Execute the real Next route handlers with isolated cookie/API/Stripe doubles.
// No development bypass, real account, live Stripe call or database is needed.
async function moduleUnderTest(path, dependencies, globals = {}) {
  const context = vm.createContext({ URL, Request, Response, AbortSignal, process: { env: { NODE_ENV: "production" } }, ...globals });
  const source = await readFile(new URL(`../${path}`, import.meta.url), "utf8");
  const module = new vm.SourceTextModule(source, { context });
  await module.link((specifier) => {
    const exports = dependencies[specifier];
    if (!exports) throw new Error(`Unexpected dependency: ${specifier}`);
    return new vm.SyntheticModule(Object.keys(exports), function () {
      for (const [name, value] of Object.entries(exports)) this.setExport(name, value);
    }, { context });
  });
  await module.evaluate();
  return module.namespace;
}
const token = "a".repeat(64);
const checkout = createHash("sha256").update(token).digest("hex").slice(0, 24);
const origin = "https://www.bulgariansociety.nl";
const paymentPrivacyHeaders = { "Cache-Control": "private, no-store, max-age=0", "Referrer-Policy": "no-referrer", "X-Robots-Tag": "noindex, nofollow" };

test("payment previews use URL options without visible controls or a home action", async () => {
  const preview = await readFile(new URL("../src/screens/private/PaymentResultPreview.jsx", import.meta.url), "utf8");
  const result = await readFile(new URL("../src/screens/redirects/PaymentResult.jsx", import.meta.url), "utf8");
  const route = await readFile(new URL("../app/(dev)/dev/[devPage]/page.jsx", import.meta.url), "utf8");
  assert.doesNotMatch(preview, /Preview outcome|Free booking|<select|<input/);
  assert.doesNotMatch(result, /Back to home|styles\.home/);
  assert.match(route, /await searchParams/);
  assert.match(route, /query\.status/);
  assert.match(route, /query\?\.free === "true"/);
  assert.match(route, /process\.env\.NODE_ENV === "production"\) return \[\]/);
});
const dependencies = (getPaymentResult) => ({
  "@/util/payments/return-policy.mjs": policy,
  "@/util/payments/server": { getPaymentResult, paymentPrivacyHeaders },
  "next/server": { NextResponse },
  "node:crypto": { createHash },
});

test("receipt exchange strips secret/Stripe parameters and sets a scoped secure HttpOnly cookie", async () => {
  const route = await moduleUnderTest("app/payment/return/route.js", dependencies());
  const response = route.GET(new Request(`${origin}/payment/return?token=${token}&payment_intent_client_secret=secret`));
  assert.equal(response.status, 303);
  assert.equal(response.headers.get("location"), `${origin}/success?checkout=${checkout}`);
  const cookie = response.cookies.get(policy.paymentCookieName(checkout));
  assert.equal(cookie.value, token); assert.equal(cookie.httpOnly, true); assert.equal(cookie.secure, true); assert.equal(cookie.sameSite, "lax");
  assert.equal(cookie.maxAge, policy.PAYMENT_COOKIE_SECONDS);
  assert.match(response.headers.get("cache-control"), /no-store/);
  assert.equal(response.headers.get("referrer-policy"), "no-referrer");
});

test("missing and malformed return tokens never set a receipt cookie", async () => {
  const route = await moduleUnderTest("app/payment/return/route.js", dependencies());
  for (const query of ["", "?token=forged", "?token=cs_known", `?token=${token}x`]) {
    const response = route.GET(new Request(`${origin}/payment/return${query}`));
    assert.equal(response.headers.get("location"), `${origin}/`);
    assert.equal(response.headers.get("set-cookie"), null);
  }
});

for (const [status, retryUrl, expected] of [
  ["success", "https://checkout.stripe.com/should-not-open", `/success?checkout=${checkout}`],
  ["processing", "https://checkout.stripe.com/should-not-open", `/payment/pending?checkout=${checkout}`],
  ["failed", "https://checkout.stripe.com/existing", "https://checkout.stripe.com/existing"],
  ["cancelled", "https://checkout.stripe.com/existing", "https://checkout.stripe.com/existing"],
  ["expired", null, "/groningen/purchase-ticket/event"],
]) test(`retry verifies current ${status} state before choosing a destination`, async () => {
  let checked = 0;
  const route = await moduleUnderTest("app/payment/retry/route.js", dependencies(async (requested) => {
    checked++; assert.equal(requested, checkout);
    return { status, checkout, retryUrl, returnPath: "/groningen/purchase-ticket/event" };
  }));
  const response = await route.POST(new Request(`${origin}/payment/retry`, { method: "POST", headers: { origin }, body: JSON.stringify({ checkout, status: "failed", url: "https://evil.test" }) }));
  assert.equal(checked, 1); assert.equal((await response.json()).url, expected);
  assert.match(response.headers.get("cache-control"), /no-store/);
});

test("retry rejects cross-origin requests before fetching payment details", async () => {
  const route = await moduleUnderTest("app/payment/retry/route.js", dependencies(() => assert.fail("Must not query payment")));
  for (const headers of [{}, { origin: "https://evil.test" }]) {
    const response = await route.POST(new Request(`${origin}/payment/retry`, { method: "POST", headers, body: JSON.stringify({ checkout }) }));
    assert.equal(response.status, 403);
  }
});

for (const status of [404, 503]) test(`retry fails closed on lookup error ${status}`, async () => {
  const route = await moduleUnderTest("app/payment/retry/route.js", dependencies(async () => { throw Object.assign(new Error("private server information"), { status }); }));
  const response = await route.POST(new Request(`${origin}/payment/retry`, { method: "POST", headers: { origin }, body: JSON.stringify({ checkout }) }));
  assert.equal(response.status, status);
  const result = await response.json(); assert.equal(result.url, undefined); assert.equal(result.message.includes("private"), false);
});

test("invoice download re-verifies payment and sends a private PDF attachment", async () => {
  let checks = 0, downloads = 0;
  const route = await moduleUnderTest("app/payment/document/route.js", dependencies(async () => {
    checks++; return { status: "success", checkout, invoiceUrl: "https://pay.stripe.com/invoice/test/pdf" };
  }), { fetch: async (url, options) => {
    downloads++; assert.equal(url, "https://pay.stripe.com/invoice/test/pdf"); assert.equal(options.cache, "no-store");
    assert.equal(options.redirect, "manual");
    return new Response("%PDF-test-fixture", { headers: { "Content-Type": "application/pdf" } });
  } });
  const response = await route.GET(new Request(`${origin}/payment/document?checkout=${checkout}`));
  assert.equal(checks, 1); assert.equal(downloads, 1); assert.equal(response.headers.get("content-type"), "application/pdf");
  assert.match(response.headers.get("content-disposition"), /^attachment; filename="BGSNL-invoice-/);
  assert.match(response.headers.get("cache-control"), /no-store/); assert.equal(await response.text(), "%PDF-test-fixture");
});

test("unpaid payments cannot download a document", async () => {
  const route = await moduleUnderTest("app/payment/document/route.js", dependencies(async () => ({ status: "failed", checkout, invoiceUrl: "https://pay.stripe.com/invoice/pdf" })),
    { fetch: () => assert.fail("Must not download unpaid invoice") });
  const response = await route.GET(new Request(`${origin}/payment/document?checkout=${checkout}`));
  assert.equal(response.headers.get("location"), `${origin}/fail?checkout=${checkout}`);
});

test("invoice downloads follow Stripe CDN redirects but reject arbitrary hosts", async () => {
  for (const [nextUrl, allowed] of [["https://invoice.stripecdn.com/test.pdf", true], ["http://127.0.0.1/private", false], ["https://evil.test/document", false]]) {
    let calls = 0;
    const route = await moduleUnderTest("app/payment/document/route.js", dependencies(async () => ({ status: "success", checkout, invoiceUrl: "https://pay.stripe.com/invoice/pdf" })),
      { fetch: async () => ++calls === 1 ? new Response(null, { status: 302, headers: { location: nextUrl } }) : new Response("%PDF", { headers: { "content-type": "application/pdf" } }) });
    const response = await route.GET(new Request(`${origin}/payment/document?checkout=${checkout}`));
    assert.equal(calls, allowed ? 2 : 1);
    assert.equal(response.status, allowed ? 200 : 303);
  }
});

test("payment pages reject unauthorised visits at the routing boundary before HTML streaming", async () => {
  const route = await moduleUnderTest("proxy.js", { ...dependencies(), "@/util/seo/site": { articleSlug: (value) => value } });
  for (const path of ["/success", "/fail", "/donation/success", "/payment/pending"]) {
    for (const query of ["", `?checkout=${checkout}`, "?checkout=forged"]) {
      const response = route.default(new NextRequest(`${origin}${path}${query}`));
      assert.equal(response.status, 307); assert.equal(response.headers.get("location"), `${origin}/`);
    }
    const response = route.default(new NextRequest(`${origin}${path}?checkout=${checkout}`, { headers: { cookie: `${policy.paymentCookieName(checkout)}=${token}` } }));
    assert.equal(response.headers.get("x-middleware-next"), "1");
  }
});

test("a paid receipt is offered without creating an invoice", async () => {
  const route = await moduleUnderTest("app/payment/document/route.js", dependencies(async () => ({ status: "success", checkout, receiptUrl: "https://pay.stripe.com/receipts/test" })),
    { fetch: () => assert.fail("No invoice creation or fetch is needed") });
  const response = await route.GET(new Request(`${origin}/payment/document?checkout=${checkout}`));
  assert.equal(response.headers.get("location"), "https://pay.stripe.com/receipts/test");
});

test("document failures return to confirmation with a notification, never an error/secret dump", async () => {
  const route = await moduleUnderTest("app/payment/document/route.js", dependencies(async () => ({ status: "success", checkout, invoiceUrl: "https://pay.stripe.com/invoice/pdf" })),
    { fetch: async () => new Response("private error", { status: 503 }) });
  const response = await route.GET(new Request(`${origin}/payment/document?checkout=${checkout}`));
  assert.equal(response.headers.get("location"), `${origin}/success?checkout=${checkout}&document=unavailable`);
});

async function serverHarness({ cookieToken = token, replyCheckout = checkout, replyStatus = 200, networkError = false } = {}) {
  let calls = 0;
  const module = await moduleUnderTest("src/util/payments/server.js", {
    "server-only": {}, "next/headers": { cookies: async () => ({ get: () => ({ value: cookieToken }) }) },
    "@/util/api/server": { API_URL: "https://api.example.test/api", API_HEADERS: { "x-bgsnl-server-key": "server-only-test-key" } },
    "./return-policy.mjs": policy,
  }, { fetch: async (url, options) => {
    calls++; assert.equal(url, "https://api.example.test/api/payment/result");
    assert.equal(options.cache, "no-store"); assert.equal(JSON.parse(options.body).token, token);
    assert.equal(options.headers["x-bgsnl-server-key"], "server-only-test-key");
    if (networkError) throw new Error("API offline");
    return Response.json({ checkout: replyCheckout, status: "success" }, { status: replyStatus });
  } });
  return { ...module, calls: () => calls };
}

test("SSR denies missing receipt cookies without calling the API", async () => {
  const server = await serverHarness({ cookieToken: null });
  await assert.rejects(server.getPaymentResult(checkout), (error) => error.status === 404);
  assert.equal(server.calls(), 0);
});

test("SSR requires the API to verify the same receipt and fails closed for errors", async () => {
  const good = await serverHarness(); assert.equal((await good.getPaymentResult(checkout)).status, "success");
  for (const [options, expected] of [[{ replyCheckout: "b".repeat(24) }, 404], [{ replyStatus: 404 }, 404], [{ replyStatus: 503 }, 503], [{ networkError: true }, 503]]) {
    const server = await serverHarness(options);
    await assert.rejects(server.getPaymentResult(checkout), (error) => error.status === expected);
  }
});

test("client props never contain receipt capabilities, document URLs or metadata", () => {
  const result = policy.publicPaymentResult({ status: "success", kind: "ticket", token, transactionId: "ch_verified", paymentIntentId: "pi_verified", client_secret: "private-intent-secret", metadata: { private: true }, invoiceUrl: "secret-pdf", receiptUrl: "secret-receipt", retryUrl: "secret-checkout" });
  assert.equal(result.hasInvoice, true); assert.equal(result.canResume, true);
  assert.equal(result.transactionId, "ch_verified"); assert.equal(result.paymentIntentId, "pi_verified");
  for (const field of ["token", "metadata", "client_secret", "invoiceUrl", "receiptUrl", "retryUrl"]) assert.equal(result[field], undefined);
});
