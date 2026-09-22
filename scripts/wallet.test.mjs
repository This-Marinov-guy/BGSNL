import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { TEST_CASES, walletPreviewEnabled, getTestCard, testCardUrl, buildPassDrafts } from "../src/util/wallet/test-card.mjs";
import { detectWalletDevice, availableWalletProvider, validGoogleWalletSaveUrl } from "../src/util/wallet/device-support.mjs";
import { browserApiPath } from "../src/util/auth/proxy-policy.mjs";

const base = new URL("../public/assets/wallet-cards/v1/", import.meta.url);
const spec = JSON.parse(readFileSync(new URL("specifications.json", base)));

test("mock wallet access fails closed outside development", () => {
  assert.equal(walletPreviewEnabled({ NODE_ENV: "development" }), true);
  for (const NODE_ENV of ["production", "test", "", undefined]) assert.equal(walletPreviewEnabled({ NODE_ENV }), false);
});

test("only explicitly known mock cards are returned", () => {
  assert.equal(getTestCard("real-user-id", spec), null);
  assert.equal(getTestCard("../../private", spec), null);
  for (const id of TEST_CASES) {
    const card = getTestCard(id, spec);
    assert.equal(card.mocked, true);
    assert.equal(card.status, id.endsWith("locked") ? "locked" : "active");
    assert.equal(card.membershipLabel, id.startsWith("alumni") ? "Alumni Tier II" : "Member of Groningen");
    assert.equal(Object.hasOwn(card, "email"), false);
  }
});

test("QR links point to the configured test origin and reject unsafe URLs", () => {
  assert.equal(testCardUrl("member-active", "https://test.example/path"), "https://test.example/dev/wallet-card?card=member-active");
  for (const url of ["javascript:alert(1)", "file:///tmp/a", "https://user:pass@test.example"]) assert.throws(() => testCardUrl("member-active", url));
  assert.throws(() => testCardUrl("unknown", "http://localhost:3000"));
});

test("native drafts share QR URL and membership label, with locked mapped inactive", () => {
  for (const id of TEST_CASES) {
    const card = getTestCard(id, spec);
    const url = testCardUrl(id, "http://localhost:3000");
    const drafts = buildPassDrafts(card, url);
    assert.equal(drafts.apple.barcodes[0].message, url);
    assert.equal(drafts.google.genericObjects[0].barcode.value, url);
    assert.equal(drafts.apple.voided, card.status === "locked");
    assert.equal(drafts.google.genericObjects[0].state, card.status === "locked" ? "INACTIVE" : "ACTIVE");
    assert.equal(drafts.apple.generic.secondaryFields[0].value, card.membershipLabel);
    assert.match(drafts.apple.description, /TEST ONLY/);
  }
  assert.throws(() => buildPassDrafts({ mocked: false }, "https://example.com"));
});

test("v1 assets and local fonts exist", () => {
  for (const file of [spec.assets.example, spec.assets.background, ...Object.values(spec.assets.fonts).flatMap((font) => [font.file, font.ttfFile].filter(Boolean))]) {
    assert.equal(existsSync(new URL(file, base)), true, file);
  }
});

const iphone = { userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 Version/18.0 Mobile/15E148 Safari/604.1", platform: "iPhone", maxTouchPoints: 5, secureContext: true, topLevel: true };
const android = { ...iphone, platform: "Linux armv8l", userAgent: "Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 Chrome/130.0.0.0 Mobile Safari/537.36" };

test("device checks distinguish Apple, Google and unsupported contexts", () => {
  assert.equal(detectWalletDevice(iphone).provider, "apple");
  assert.equal(detectWalletDevice(android).provider, "google");
  for (const device of [undefined, { ...iphone, secureContext: false }, { ...iphone, topLevel: false },
    { ...iphone, platform: "MacIntel" },
    { ...android, userAgent: android.userAgent.replace("Android 14", "Android 8") }]) {
    assert.equal(detectWalletDevice(device).provider, null);
  }
});

test("wallet downloads are not restricted by browser brand", () => {
  for (const brand of ["Version/18.0 Safari/605.1", "Chrome/130.0", "Firefox/130.0", "Edg/130.0", "Brave/130.0"]) {
    assert.equal(detectWalletDevice({ ...iphone, platform: "MacIntel", maxTouchPoints: 0,
      userAgent: `Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) ${brand}` }).provider, "apple");
    assert.equal(detectWalletDevice({ ...iphone, userAgent: iphone.userAgent.replace("Version/18.0", brand) }).provider, "apple");
  }
  assert.equal(detectWalletDevice({ ...iphone, userAgent: `${iphone.userAgent} Instagram` }).provider, "apple");
  assert.equal(detectWalletDevice({ ...android, userAgent: "Android 14; CustomBrowser/1" }).provider, "google");
  assert.equal(detectWalletDevice({ ...android, userAgent: "Windows NT 10.0; Firefox/130" }).provider, "google");
});

test("a compatible device alone never enables a wallet badge", () => {
  const device = detectWalletDevice(iphone);
  for (const data of [undefined, {}, { eligible: true }, { eligible: false, providers: { apple: { available: true } } },
    { eligible: true, providers: { apple: { available: "true" } } },
    { eligible: true, providers: { google: { available: true } } }]) assert.equal(availableWalletProvider(device, data), null);
  assert.equal(availableWalletProvider(device, { eligible: true, providers: { apple: { available: true } } }), "apple");
  assert.equal(availableWalletProvider(null, { eligible: true, providers: { apple: { available: true } } }), null);
});

test("Google navigation accepts only official save URLs", () => {
  assert.equal(validGoogleWalletSaveUrl("https://pay.google.com/gp/v/save/abc.def.ghi"), true);
  for (const value of [null, "javascript:alert(1)", "https://evil.test/gp/v/save/a.b.c", "https://pay.google.com.evil.test/gp/v/save/a.b.c",
    "https://user@pay.google.com/gp/v/save/a.b.c", "http://pay.google.com/gp/v/save/a.b.c",
    "https://pay.google.com/gp/v/save/a.b.c?redirect=evil", "https://pay.google.com/gp/v/save/a.b.c#evil",
    "https://pay.google.com/other/a.b.c"]) assert.equal(validGoogleWalletSaveUrl(value), false);
});

test("wallet proxy routes only allow intended methods", () => {
  for (const [path, method] of [["availability", "GET"], ["apple", "GET"], ["google", "POST"]]) {
    assert.equal(browserApiPath(["user", "wallet", path], method), `user/wallet/${path}`);
    assert.equal(browserApiPath(["user", "wallet", path], "DELETE"), null);
  }
  assert.equal(browserApiPath(["user", "wallet", "google"], "GET"), null);
  assert.equal(browserApiPath(["user", "wallet", "availability"], "POST"), null);
});

test("both official English badge files exist", () => {
  for (const file of ["wallet-cards/buttons/add-to-apple-wallet.svg", "commercial/enUS_add_to_google_wallet_wallet-button.svg"]) {
    assert.match(readFileSync(new URL(`../public/assets/${file}`, import.meta.url), "utf8"), /<svg/);
  }
});
