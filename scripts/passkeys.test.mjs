import assert from "node:assert/strict";
import test, { beforeEach } from "node:test";
import { primeCsrf } from "./fixtures/cookie-transport.mjs";
beforeEach(primeCsrf);
import { readFile } from "node:fs/promises";
import { createPasskeyFlow, PASSKEY_DEVICE_TIMEOUT_MS } from "../src/elements/authentication/passkey-flow.mjs";
import { requestPasskey, passkeyErrorNotice, PasskeyRequestError, PASSKEY_REQUEST_TIMEOUT_MS } from "../src/elements/authentication/passkey-request.mjs";

const challenge = () => ({ challengeId: "challenge-id", options: { challenge: "random-server-challenge" }, expiresAt: new Date(Date.now() + 300000).toISOString() });
const deferred = () => { let resolve, reject; const promise = new Promise((yes, no) => { resolve = yes; reject = no; }); return { promise, resolve, reject }; };
const tick = async () => { for (let i = 0; i < 8; i++) await Promise.resolve(); };
function harness(overrides = {}) {
  const calls = { requests: [], phases: [], success: [], errors: [], devices: [], cancellations: 0 };
  const device = async (options) => { calls.devices.push(options); return { id: "test-key" }; };
  const flow = createPasskeyFlow({
    request: async (...args) => { calls.requests.push(args); return args[0].endsWith("/options") ? challenge() : { token: "test-session", passkeys: [] }; },
    register: device, authenticate: device, createProof: () => "browser-proof",
    cancelCeremony: () => { calls.cancellations++; }, onPhase: (value) => calls.phases.push(value),
    onSuccess: (...args) => calls.success.push(args), onError: (error) => calls.errors.push(error), ...overrides,
  });
  return { flow, calls };
}
test("mounting a passkey flow makes no network calls, prompts or error notices", async () => {
  const { flow, calls } = harness(); await tick(); flow.cancel(false);
  assert.deepEqual(calls, { requests: [], phases: [], success: [], errors: [], devices: [], cancellations: 0 });
});
test("explicit login uses the server options and verifies the signed result before issuing a login", async () => {
  const { flow, calls } = harness(); await flow.run({ purpose: "login" });
  assert.deepEqual(calls.requests[0].slice(0, 2), ["login/options", { proof: "browser-proof" }]);
  assert.deepEqual(calls.devices, [{ optionsJSON: { challenge: "random-server-challenge" } }]);
  assert.deepEqual(calls.requests[1].slice(0, 2), ["login", { credential: { id: "test-key" }, proof: "browser-proof", challengeId: "challenge-id" }]);
  assert.deepEqual(calls.phases, ["preparing", "device", "verifying", "idle"]); assert.equal(calls.success.length, 1);
});
test("registration confirms the password first and does not resend it with the credential", async () => {
  const { flow, calls } = harness(); await flow.run({ purpose: "register", name: "My phone", password: "test-password" });
  assert.deepEqual(calls.requests[0].slice(0, 2), ["register/options", { proof: "browser-proof", password: "test-password", name: "My phone" }]);
  assert.equal(calls.requests[1][1].password, undefined); assert.equal(calls.success[0][1], "register");
});
test("password or server rejection prevents the device prompt", async () => {
  const { flow, calls } = harness({ request: async () => { throw new PasskeyRequestError("Confirm your password."); } });
  await flow.run({ purpose: "register" }); assert.equal(calls.devices.length, 0); assert.equal(calls.errors.length, 1); assert.equal(calls.success.length, 0);
});
test("double clicks only start one ceremony", async () => {
  const pending = deferred(); const { flow, calls } = harness({ authenticate: () => pending.promise });
  const first = flow.run({ purpose: "login" }); await tick(); await flow.run({ purpose: "login" });
  assert.equal(calls.requests.length, 1); pending.resolve({ id: "test-key" }); await first;
  assert.equal(calls.success.length, 1); assert.equal(calls.requests.length, 2);
});
test("cancel while preparing aborts the request and ignores a late options response", async () => {
  const pending = deferred(); let signal;
  const { flow, calls } = harness({ request: (_path, _data, value) => { signal = value; return pending.promise; } });
  const task = flow.run({ purpose: "login" }); flow.cancel(); pending.resolve(challenge()); await task;
  assert.ok(signal.aborted); assert.equal(calls.devices.length, 0); assert.equal(calls.success.length, 0); assert.equal(calls.errors.length, 0);
});
test("cancel closes the owned device prompt and ignores a late credential", async () => {
  const pending = deferred(); const { flow, calls } = harness({ authenticate: () => pending.promise });
  const task = flow.run({ purpose: "login" }); await tick(); flow.cancel(); pending.resolve({ id: "late-key" }); await task;
  assert.equal(calls.cancellations, 1); assert.equal(calls.requests.length, 1); assert.equal(calls.success.length, 0); assert.equal(calls.errors.length, 0);
});
test("unmount after sending verification cannot log in or replace a token", async () => {
  const pending = deferred(); const { flow, calls } = harness({ request: async (path) => path.endsWith("/options") ? challenge() : pending.promise });
  const task = flow.run({ purpose: "login" }); await tick(); flow.cancel(false); pending.resolve({ token: "late-token" }); await task;
  assert.equal(calls.success.length, 0); assert.equal(calls.errors.length, 0);
});
test("a cancelled attempt cannot deliver results into a new attempt", async () => {
  const pending = deferred(); let count = 0;
  const { flow, calls } = harness({ authenticate: async () => ++count === 1 ? pending.promise : { id: "new-key" } });
  const old = flow.run({ purpose: "login" }); await tick(); flow.cancel();
  await flow.run({ purpose: "login" }); pending.resolve({ id: "old-key" }); await old;
  assert.equal(calls.success.length, 1); assert.equal(calls.requests.at(-1)[1].credential.id, "new-key");
});
test("device cancellation returns to idle with one warning and no verification request", async () => {
  const error = Object.assign(new Error("Device details must not leak"), { name: "NotAllowedError" });
  const { flow, calls } = harness({ authenticate: async () => { throw error; } });
  await flow.run({ purpose: "login" }); assert.equal(calls.requests.length, 1); assert.equal(calls.errors.length, 1);
  assert.equal(calls.phases.at(-1), "idle"); assert.equal(passkeyErrorNotice(error).severity, "warn");
  assert.ok(!passkeyErrorNotice(error).detail.includes(error.message));
});
test("a stalled device prompt times out and can be retried", async (t) => {
  t.mock.timers.enable({ apis: ["setTimeout"] });
  const { flow, calls } = harness({ authenticate: () => new Promise(() => {}) });
  const task = flow.run({ purpose: "login" }); await tick(); t.mock.timers.tick(PASSKEY_DEVICE_TIMEOUT_MS + 1); await task;
  assert.equal(calls.cancellations, 1); assert.equal(calls.success.length, 0); assert.match(calls.errors[0].message, /Still waiting/);
  assert.equal(calls.phases.at(-1), "idle");
});
for (const invalid of [{}, { ...challenge(), expiresAt: "bad-date" }, { ...challenge(), expiresAt: new Date(0).toISOString() }, { ...challenge(), options: {} }]) {
  test(`malformed or expired server options never reach the authenticator: ${JSON.stringify(invalid)}`, async () => {
    const { flow, calls } = harness({ request: async () => invalid }); await flow.run({ purpose: "login" });
    assert.equal(calls.devices.length, 0); assert.equal(calls.errors.length, 1);
  });
}
test("removal uses password-confirmed server deletion without a device ceremony", async () => {
  const { flow, calls } = harness(); await flow.run({ purpose: "remove", credentialId: "test-key", password: "test-password" });
  assert.deepEqual(calls.requests[0].slice(0, 2), ["remove", { credentialId: "test-key", password: "test-password" }]);
  assert.equal(calls.devices.length, 0); assert.equal(calls.success[0][1], "remove");
});
test("SimpleWebAuthn wrapped cancellations and duplicate keys retain helpful warning toasts", () => {
  const wrapped = (name, code) => ({ name: "WebAuthnError", cause: { name }, code, message: "raw provider details" });
  assert.equal(passkeyErrorNotice(wrapped("NotAllowedError", "ERROR_PASSTHROUGH_SEE_CAUSE_PROPERTY")).severity, "warn");
  assert.match(passkeyErrorNotice(wrapped("InvalidStateError", "ERROR_AUTHENTICATOR_PREVIOUSLY_REGISTERED")).detail, /already has a passkey/);
  assert.match(passkeyErrorNotice(wrapped("ConstraintError")).detail, /screen lock/);
  assert.match(passkeyErrorNotice(wrapped("SecurityError")).detail, /up-to-date browser/);
});
test("requests keep credentials out of URLs, use same-origin cookies, reject redirects and never retry", async (t) => {
  const url = "/api/security/passkeys/login";
  const mocked = t.mock.method(globalThis, "fetch", async (target, options) => {
    assert.equal(target, url); assert.equal(options.method, "POST"); assert.equal(options.cache, "no-store");
    assert.equal(options.credentials, "same-origin"); assert.equal(options.redirect, "error");
    assert.equal(options.headers.get("Authorization"), null); assert.equal(JSON.parse(options.body).credential.id, "test-key");
    return { headers: new Headers(), ok: true, json: async () => ({ token: "verified" }) };
  });
  assert.deepEqual(await requestPasskey(url, { credential: { id: "test-key" } }, "session"), { token: "verified" });
  assert.equal(mocked.mock.callCount(), 1);
});
test("API errors are actionable while raw HTML and network errors are not exposed", async (t) => {
  const mocked = t.mock.method(globalThis, "fetch", async () => ({ headers: new Headers(), ok: false, status: 403, json: async () => ({ message: "Confirm your current password." }) }));
  await assert.rejects(requestPasskey("/api/security/passkeys/login"), /Confirm your current password/);
  mocked.mock.mockImplementation(async () => { throw new TypeError("sensitive URL payload"); });
  await assert.rejects(requestPasskey("/api/security/passkeys/login"), /Could not reach the sign-in service/);
  await primeCsrf();
  mocked.mock.mockImplementation(async () => ({ headers: new Headers(), ok: false, status: 502, json: async () => { throw new Error("<html>proxy details</html>"); } }));
  await assert.rejects(requestPasskey("/api/security/passkeys/login"), /temporarily unavailable/);
});
test("stalled fetches have a bounded timeout", async (t) => {
  t.mock.timers.enable({ apis: ["setTimeout"] });
  t.mock.method(globalThis, "fetch", (_url, { signal }) => new Promise((_resolve, reject) => signal.addEventListener("abort", () => reject(new Error("Aborted")))));
  const task = requestPasskey("/api/security/passkeys/login"); const result = assert.rejects(task, /timed out/);
  t.mock.timers.tick(PASSKEY_REQUEST_TIMEOUT_MS + 1); await result;
});
test("navigation aborts pending fetches", async (t) => {
  const controller = new AbortController(); let fetchSignal;
  t.mock.method(globalThis, "fetch", async (_url, { signal }) => { fetchSignal = signal; return new Promise((_resolve, reject) => signal.addEventListener("abort", () => reject(new Error("Aborted")))); });
  const task = requestPasskey("/api/security/passkeys/login", undefined, undefined, controller.signal); const result = assert.rejects(task, /timed out/);
  await tick(); controller.abort(); await result; assert.ok(fetchSignal.aborted);
});
test("global inputs, animated setup and mutually disabled login methods remain connected", async () => {
  const settings = await readFile(new URL("../src/elements/authentication/PasskeySettings.jsx", import.meta.url), "utf8");
  const login = await readFile(new URL("../src/screens/authentication/LogIn.jsx", import.meta.url), "utf8");
  assert.match(settings, /inputClassName="bgsnl-form-control"/); assert.match(settings, /className="bgsnl-form-control"/);
  assert.match(settings, /connectionReveal/); assert.match(settings, /inert=/); assert.match(settings, /refreshSession\(result.session\)/);
  assert.match(login, /disabled=\{loading \|\| googlePending \|\| passkeyPending\}/);
  assert.match(login, /<PasskeyLogin/); assert.match(login, /<GoogleLogin/);
});

test("passkey login replaces its fingerprint with an in-button spinner without extra controls", async () => {
  const login = await readFile(new URL("../src/elements/authentication/PasskeyLogin.jsx", import.meta.url), "utf8");
  const styles = await readFile(new URL("../src/elements/authentication/passkeys.module.scss", import.meta.url), "utf8");
  assert.match(login, /\{busy \? <svg className=\{`\$\{authStyles.googleLogo\} \$\{styles.loginSpinner\}`\}/);
  assert.match(login, /aria-busy=\{busy\}/);
  assert.match(login, /className=\{styles.screenReaderStatus\} role="status"/);
  assert.doesNotMatch(login, /Check your device|>Cancel<|cancel\(\)|phase ===/);
  assert.equal((login.match(/<button\b/g) || []).length, 1);
  assert.match(styles, /animation: passkey-spin 800ms linear infinite/);
});

test("saved passkeys and confirmation stay inside the panel with accessible icon-only removal", async () => {
  const settings = await readFile(new URL("../src/elements/authentication/PasskeySettings.jsx", import.meta.url), "utf8");
  // The outer settings list must enclose both the registered keys and form.
  const panel = settings.slice(settings.indexOf('<ul className="settings-list">'), settings.lastIndexOf("</ul>"));
  assert.match(panel, /className=\{styles.panelBody\}/);
  assert.match(panel, /aria-label="Registered passkeys"/);
  assert.match(panel, /formStyles.connectionReveal/);
  assert.match(panel, /Current BGSNL password/);
  assert.match(settings, /aria-label=\{`Remove \$\{passkey.name\}`\}/);
  assert.match(settings, /title=\{`Remove \$\{passkey.name\}`\}/);
  assert.match(settings, /<IconlyDelete size=\{24\} aria-hidden="true" focusable="false" \/>/);
  assert.doesNotMatch(settings, />Remove<\/button>/);
  assert.match(settings, /setEditing\(\{ purpose: "remove", credentialId: passkey.id/);
});
