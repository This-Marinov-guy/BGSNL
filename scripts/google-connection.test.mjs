import assert from "node:assert/strict";
import test, { beforeEach } from "node:test";
import { primeCsrf } from "./fixtures/cookie-transport.mjs";
beforeEach(primeCsrf);
import { readFile } from "node:fs/promises";
import { mountGoogleCredentialControl, GOOGLE_PROMPT_WAIT_MS, GOOGLE_POPUP_GUIDANCE } from "../src/elements/authentication/google-credential-control.mjs";
import { requestGoogleAuth, GOOGLE_REQUEST_TIMEOUT_MS } from "../src/elements/authentication/google-request.mjs";
import { createGoogleFeedbackGate } from "../src/elements/authentication/google-feedback.mjs";

function harness(t, { autoPrompt = true, sdk = {}, challenge = {} } = {}) {
  t.mock.timers.enable({ apis: ["setTimeout", "Date"], now: 1000 });
  const calls = { prompts: 0, cancellations: 0, clears: 0, interactions: 0, credentials: [], errors: [], notices: [] };
  const googleId = {
    initialize: (options) => { calls.config = options; },
    renderButton: (_target, options) => { calls.button = options; },
    prompt: (listener) => { calls.prompts++; calls.moment = listener; },
    cancel: () => { calls.cancellations++; },
    ...sdk,
  };
  const options = {
    googleId, autoPrompt, target: { clientWidth: 320, replaceChildren: () => { calls.clears++; } },
    challenge: { clientId: "test-client", nonce: "test-nonce", loginHint: "owner@gmail.com", expiresAt: new Date(301000).toISOString(), ...challenge },
    onCredential: (value) => calls.credentials.push(value),
    onError: (value) => calls.errors.push(value), onNotice: (value) => calls.notices.push(value),
    onInteraction: () => { calls.interactions++; },
  };
  const dispose = mountGoogleCredentialControl(options);
  t.after(dispose);
  return { calls, options, dispose };
}

test("password-confirmed linking automatically prompts with the server-provided email and nonce", (t) => {
  const { calls } = harness(t);
  assert.equal(calls.config.login_hint, "owner@gmail.com"); assert.equal(calls.config.nonce, "test-nonce");
  assert.equal(calls.config.auto_select, false); assert.equal(calls.config.button_auto_select, false);
  assert.equal(calls.button.width, 320);
  t.mock.timers.tick(1); assert.equal(calls.prompts, 1);
});
test("normal Google login renders the button without starting an automatic prompt", (t) => {
  const { calls } = harness(t, { autoPrompt: false, challenge: { loginHint: undefined } });
  t.mock.timers.tick(GOOGLE_PROMPT_WAIT_MS + 1);
  assert.equal(calls.config.login_hint, undefined); assert.equal(calls.prompts, 0); assert.deepEqual(calls.notices, []);
  assert.equal(calls.interactions, 0);
});
test("Google sign-in retains the original large white outlined button", (t) => {
  const { calls } = harness(t, { autoPrompt: false });
  assert.equal(calls.button.theme, "outline");
  assert.equal(calls.button.size, "large");
  assert.equal(calls.button.shape, "rectangular");
  assert.equal(calls.button.text, "continue_with");
});
test("Google retains personalized-button sizing when resized without reinitializing sign-in", (t) => {
  let resized, disconnected = false;
  const previousObserver = globalThis.ResizeObserver;
  globalThis.ResizeObserver = class {
    constructor(callback) { resized = callback; }
    observe() {}
    disconnect() { disconnected = true; }
  };
  t.after(() => {
    if (previousObserver === undefined) delete globalThis.ResizeObserver;
    else globalThis.ResizeObserver = previousObserver;
  });
  const { calls, options, dispose } = harness(t, { autoPrompt: false });
  const config = calls.config;
  options.target.clientWidth = 140;
  resized();
  assert.equal(calls.button.width, 200);
  assert.equal(calls.button.type, "standard");
  assert.equal(calls.button.size, "large");
  assert.equal(calls.button.text, "continue_with");
  assert.equal(calls.button.theme, "outline");
  assert.equal(calls.config, config);
  const clears = calls.clears;
  resized();
  assert.equal(calls.clears, clears);
  options.target.clientWidth = 320;
  resized();
  assert.equal(calls.button.text, "continue_with");
  dispose();
  assert.equal(disconnected, true);
  resized();
  assert.equal(calls.config, config);
});

test("passkey shares Google's button styling and the login options share one row", async () => {
  const passkey = await readFile(new URL("../src/elements/authentication/PasskeyLogin.jsx", import.meta.url), "utf8");
  const login = await readFile(new URL("../src/screens/authentication/Login.jsx", import.meta.url), "utf8");
  const styles = await readFile(new URL("../src/elements/authentication/google-auth.module.scss", import.meta.url), "utf8");
  assert.match(passkey, /className=\{authStyles.googleButton\}/);
  assert.match(passkey, /aria-label="Sign in with passkey"/);
  assert.match(passkey, /<svg[\s\S]*<path/);
  assert.match(passkey, /className=\{authStyles.passkeyLabel\}/);
  assert.doesNotMatch(passkey, /FiLock|rn-button-style/);
  assert.match(login, /className=\{authStyles.loginProviders\}[\s\S]*<GoogleLogin[^>]*\/>\s*<PasskeyLogin[^>]*\/>\s*<\/div>/);
  assert.match(styles, /grid-template-columns: minmax\(200px, 1fr\) minmax\(0, 0.55fr\)/);
});
test("Google uses a user-clicked popup instead of requiring browser FedCM support", (t) => {
  const { calls } = harness(t, { autoPrompt: false });
  assert.equal(calls.config.use_fedcm_for_button, false);
  assert.equal(calls.config.ux_mode, "popup");
  assert.equal(calls.config.auto_select, false);
  assert.equal(calls.config.button_auto_select, false);
  assert.equal(calls.config.nonce, "test-nonce");
  assert.equal(calls.prompts, 0);
  assert.deepEqual(calls.notices, []);
});
test("Google feedback becomes interactive only after its actual button is clicked", (t) => {
  const { calls, dispose } = harness(t, { autoPrompt: false });
  assert.equal(calls.interactions, 0);
  calls.button.click_listener(); assert.equal(calls.interactions, 1);
  dispose(); calls.button.click_listener(); assert.equal(calls.interactions, 1);
});
test("Strict Mode setup replay does not open two prompts", (t) => {
  const { calls, options, dispose } = harness(t);
  dispose();
  const cleanup = mountGoogleCredentialControl(options); t.after(cleanup);
  t.mock.timers.tick(1); assert.equal(calls.prompts, 1);
});
test("waiting for a prompt gives neutral status without claiming popups are blocked", (t) => {
  const { calls } = harness(t);
  t.mock.timers.tick(1); t.mock.timers.tick(GOOGLE_PROMPT_WAIT_MS);
  assert.equal(calls.notices.length, 1); assert.match(calls.notices[0], /Still waiting/);
  assert.doesNotMatch(calls.notices[0], /pop-up|blocked|could not open/);
  assert.deepEqual(calls.errors, []);
  calls.config.callback({ credential: "verified-test-token" });
  assert.deepEqual(calls.credentials, ["verified-test-token"]);
});
test("prompt failures retain the Google button and show recovery instructions", (t) => {
  const { calls } = harness(t, { sdk: { prompt: () => { throw new Error("blocked"); } } });
  t.mock.timers.tick(1); assert.equal(calls.notices.length, 1); assert.match(calls.notices[0], /browser.*Google automatically/);
  assert.ok(calls.notices[0].includes(GOOGLE_POPUP_GUIDANCE));
  assert.ok(calls.button); assert.deepEqual(calls.errors, []);
  t.mock.timers.tick(GOOGLE_PROMPT_WAIT_MS); assert.equal(calls.notices.length, 1);
});
for (const method of ["isNotDisplayed", "isSkippedMoment"]) {
  test(`Google's ${method} notification shows one recovery message`, (t) => {
    const { calls } = harness(t);
    t.mock.timers.tick(1);
    calls.moment({ [method]: () => true }); calls.moment({ [method]: () => true });
    t.mock.timers.tick(GOOGLE_PROMPT_WAIT_MS);
    assert.equal(calls.notices.length, 1); assert.deepEqual(calls.errors, []);
  });
}
test("Google button clicks and time spent choosing an account do not show popup guidance", (t) => {
  const { calls } = harness(t, { autoPrompt: false });
  calls.button.click_listener();
  assert.deepEqual(calls.notices, []);
  t.mock.timers.tick(GOOGLE_PROMPT_WAIT_MS);
  assert.deepEqual(calls.notices, []);
  calls.button.click_listener();
  assert.deepEqual(calls.notices, []);
  t.mock.timers.tick(GOOGLE_PROMPT_WAIT_MS);
  assert.equal(calls.notices.length, 0);
  calls.config.callback({ credential: "test-token" });
  assert.deepEqual(calls.credentials, ["test-token"]);
  assert.deepEqual(calls.errors, []);
});
test("using the popup button cancels the automatic prompt waiting notice", (t) => {
  const { calls } = harness(t);
  t.mock.timers.tick(1);
  calls.button.click_listener();
  // A delayed failure from One Tap must not warn about the new popup attempt.
  calls.moment({ isNotDisplayed: () => true });
  t.mock.timers.tick(GOOGLE_PROMPT_WAIT_MS);
  assert.deepEqual(calls.notices, []);
});
test("cancel ignores late Google callbacks and clears prompt and waiting timers", (t) => {
  const { calls, dispose } = harness(t);
  t.mock.timers.tick(1); dispose();
  calls.config.callback({ credential: "late-token" });
  calls.moment({ isSkippedMoment: () => true });
  t.mock.timers.tick(400000);
  assert.deepEqual(calls.credentials, []); assert.deepEqual(calls.notices, []); assert.deepEqual(calls.errors, []);
  assert.ok(calls.cancellations > 0);
});
test("a successful Google response is delivered once without later error or waiting messages", (t) => {
  const { calls } = harness(t);
  calls.config.callback({ credential: "test-token" }); calls.config.callback({ credential: "test-token" });
  t.mock.timers.tick(400000);
  assert.deepEqual(calls.credentials, ["test-token"]); assert.deepEqual(calls.errors, []); assert.deepEqual(calls.notices, []);
});
test("expired requests stop accepting credentials and show a retry message", (t) => {
  const { calls } = harness(t);
  t.mock.timers.tick(300001); calls.config.callback({ credential: "expired-token" });
  assert.deepEqual(calls.credentials, []); assert.equal(calls.errors.length, 1); assert.match(calls.errors[0], /expired/);
});
for (const challenge of [{ expiresAt: "invalid" }, { expiresAt: new Date(0).toISOString() }, { loginHint: undefined }, { nonce: undefined }]) {
  test(`invalid challenge ${JSON.stringify(challenge)} is rejected before Google opens`, (t) => {
    const { calls } = harness(t, { challenge });
    t.mock.timers.tick(1);
    assert.equal(calls.prompts, 0); assert.equal(calls.errors.length, 1); assert.equal(calls.config, undefined);
  });
}
test("a missing SDK produces a recoverable message instead of hanging", (t) => {
  const { calls } = harness(t, { sdk: { initialize: undefined } });
  assert.equal(calls.errors.length, 1); assert.match(calls.errors[0], /Google could not start/);
  t.mock.timers.tick(400000); assert.equal(calls.errors.length, 1);
});
test("a malformed callback cannot cause duplicate errors or account linking", (t) => {
  const { calls } = harness(t);
  calls.config.callback(null); calls.config.callback({ credential: "late-token" });
  assert.equal(calls.errors.length, 1); assert.deepEqual(calls.credentials, []);
});

const endpoint = "/api/security/google/link";
test("Google requests keep credentials in POST bodies, never URLs, and are not retried", async (t) => {
  const fetchMock = t.mock.method(globalThis, "fetch", async (url, options) => {
    assert.equal(url, endpoint); assert.equal(options.method, "POST"); assert.equal(options.cache, "no-store");
    assert.equal(options.credentials, "same-origin"); assert.equal(options.redirect, "error");
    assert.equal(options.headers.get("Authorization"), null);
    assert.equal(JSON.parse(options.body).credential, "test-google-token");
    return { headers: new Headers(), ok: true, json: async () => ({ google: { connected: true } }) };
  });
  assert.deepEqual(await requestGoogleAuth(endpoint, { credential: "test-google-token" }, "test-session"), { google: { connected: true } });
  assert.equal(fetchMock.mock.callCount(), 1);
});
test("password and wrong-account API errors retain their actionable messages", async (t) => {
  t.mock.method(globalThis, "fetch", async () => ({ headers: new Headers(), ok: false, status: 403, json: async () => ({ message: "Use the Google account with the same email address as your BGSNL account." }) }));
  await assert.rejects(requestGoogleAuth(endpoint, {}), /same email address/);
});
test("offline and blocked network errors show recovery instructions", async (t) => {
  t.mock.method(globalThis, "fetch", async () => { throw new TypeError("Failed to fetch"); });
  await assert.rejects(requestGoogleAuth(endpoint, {}), /Check your internet connection and browser privacy/);
});
for (const [status, message] of [[401, /expired/], [403, /denied/], [429, /15 minutes/], [502, /temporarily unavailable/]]) {
  test(`non-JSON HTTP ${status} responses show useful text, not a JSON parser error`, async (t) => {
    t.mock.method(globalThis, "fetch", async () => ({ headers: new Headers(), ok: false, status, json: async () => { throw new SyntaxError("Unexpected token <"); } }));
    await assert.rejects(requestGoogleAuth(endpoint, {}), message);
  });
}
test("malformed success responses cannot be mistaken for a connection", async (t) => {
  t.mock.method(globalThis, "fetch", async () => ({ headers: new Headers(), ok: true, json: async () => null }));
  await assert.rejects(requestGoogleAuth(endpoint, {}), /unexpected server response/);
});
test("a stalled API request times out with recovery instructions", async (t) => {
  t.mock.timers.enable({ apis: ["setTimeout"] });
  t.mock.method(globalThis, "fetch", (_url, { signal }) => new Promise((_resolve, reject) => {
    signal.addEventListener("abort", () => reject(new DOMException("Aborted", "AbortError")), { once: true });
  }));
  const request = requestGoogleAuth(endpoint, {});
  const rejected = assert.rejects(request, /timed out.*check your connection/);
  t.mock.timers.tick(GOOGLE_REQUEST_TIMEOUT_MS);
  await rejected;
});

test("Google background setup and idle expiry never produce a toast", () => {
  const feedback = createGoogleFeedbackGate();
  assert.equal(feedback.error("Could not reach the sign-in service."), null);
  assert.equal(feedback.error("This Google sign-in request expired."), null);
  assert.equal(feedback.notice("Still waiting for Google."), null);
});
test("an explicit Google attempt shows one error and can retry with a fresh attempt", () => {
  const feedback = createGoogleFeedbackGate();
  feedback.begin();
  assert.deepEqual(feedback.error("Could not reach the sign-in service."), { severity: "error", detail: "Could not reach the sign-in service." });
  assert.equal(feedback.error("A late background failure."), null);
  feedback.begin();
  assert.deepEqual(feedback.error("Google is unavailable."), { severity: "error", detail: "Google is unavailable." });
});
test("waiting notices are visible only during a Google attempt and stop on cleanup", () => {
  const feedback = createGoogleFeedbackGate();
  feedback.begin();
  assert.deepEqual(feedback.notice("Still waiting for Google."), { severity: "warn", detail: "Still waiting for Google." });
  feedback.clear();
  assert.equal(feedback.notice("Still waiting for Google."), null);
  assert.equal(feedback.error("An old request failed."), null);
});
test("a background network failure is silent but the same failure after a click is reported", async (t) => {
  const feedback = createGoogleFeedbackGate();
  t.mock.method(globalThis, "fetch", async () => { throw new TypeError("Failed to fetch"); });
  const attempt = async () => {
    try { await requestGoogleAuth(endpoint); }
    catch (error) { return feedback.error(error.message); }
    return null;
  };
  assert.equal(await attempt(), null);
  feedback.begin();
  assert.match((await attempt()).detail, /Could not reach the sign-in service/);
});
test("Google retries reuse Continue with Google and account preloading errors are gated", async () => {
  const login = await readFile(new URL("../src/elements/authentication/GoogleLogin.jsx", import.meta.url), "utf8");
  const connected = await readFile(new URL("../src/elements/authentication/ConnectedAccounts.jsx", import.meta.url), "utf8");
  assert.doesNotMatch(login, /Try Google again/);
  assert.match(login, /Continue with Google/);
  assert.match(login, /<GoogleButton\s/);
  assert.doesNotMatch(login, /rn-btn-reverse-green|FaGoogle/);
  assert.match(login, /onInteraction=\{feedback\.begin\}/);
  assert.match(connected, /if \(interactive\) notifyError/);
});
test("settings and login share the branded Google button without changing account eligibility", async () => {
  const connected = await readFile(new URL("../src/elements/authentication/ConnectedAccounts.jsx", import.meta.url), "utf8");
  const button = await readFile(new URL("../src/elements/authentication/GoogleButton.jsx", import.meta.url), "utf8");
  assert.match(connected, /<GoogleButton disabled=\{busy \|\| editing \|\| !google\.enabled \|\| google\.eligible !== true\}/);
  assert.match(connected, /onClick=\{\(\) => setEditing\(true\)\}>\s+Connect Google\s+<\/GoogleButton>/);
  assert.match(connected, /google\.connected \? <button type="button" className=\{danger\}/);
  assert.match(button, /className=\{styles\.googleButton\}/);
  assert.match(button, /disabled=\{disabled \|\| busy\} aria-busy=\{busy\}/);
  assert.match(button, /aria-hidden="true" focusable="false"/);
});
test("Google password panels animate both ways without keeping hidden controls active", async () => {
  const connected = await readFile(new URL("../src/elements/authentication/ConnectedAccounts.jsx", import.meta.url), "utf8");
  const styles = await readFile(new URL("../src/elements/authentication/google-auth.module.scss", import.meta.url), "utf8");
  assert.doesNotMatch(connected, /\{editing && <div className=\{styles\.connectionForm\}/);
  assert.match(connected, /data-open=\{editing\} aria-hidden=\{!editing\} inert=\{!editing \? true : undefined\}/);
  assert.match(connected, /data-open=\{editing && !challenge\}/);
  assert.match(connected, /disabled=\{busy \|\| !editing \|\| Boolean\(challenge\)\}/);
  assert.match(connected, /if \(submitting\.current \|\| !editing \|\| !google \|\| challenge\) return/);
  assert.match(connected, /editing && <GoogleCredentialButton/);
  assert.match(connected, /setEditing\(false\); setChallenge\(null\); setPassword\(""\)/);
  assert.match(styles, /grid-template-rows: 0fr/);
  assert.match(styles, /grid-template-rows: 1fr/);
  assert.match(styles, /transition: grid-template-rows 240ms ease, opacity 180ms ease/);
  assert.match(styles, /prefers-reduced-motion: reduce/);
});
test("warning toasts use a non-shrinking warning triangle matching the danger icon size", async () => {
  const layout = await readFile(new URL("../src/layouts/MainLayout.jsx", import.meta.url), "utf8");
  const styles = await readFile(new URL("../src/styles/globals.scss", import.meta.url), "utf8");
  assert.match(layout, /warn: <FiAlertTriangle className="bgsnl-toast__icon" size=\{25\}/);
  assert.match(styles, /\.bgsnl-toast > \.bgsnl-toast__icon\s*\{\s*flex: 0 0 25px;\s*width: 25px;\s*height: 25px;/);
  assert.match(styles, /\.bgsnl-toast > :first-child\s*\{\s*flex-shrink: 0;/);
});
