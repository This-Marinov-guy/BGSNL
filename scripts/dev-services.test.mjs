import test from "node:test";
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { once } from "node:events";
import net from "node:net";
import { EventEmitter } from "node:events";
import { PassThrough } from "node:stream";
import { fileURLToPath } from "node:url";
import { setTimeout as delay } from "node:timers/promises";
import { clearPorts, listeners, localEnvironments, waitForReady } from "./dev-services.mjs";
import { applySigningSecret, checkStripeCli, configureTestStripe, stripeService, waitForStripeReady, STRIPE_FORWARD_URL } from "./local-stripe.mjs";

const testStripe = { STRIPE_NL_SECRET_KEY: "sk_test_fixture", STRIPE_NL_PUBLISHABLE_KEY: "pk_test_fixture" };

test("local Stripe uses one test account for every region and preserves the source env", () => {
  const original = { ...testStripe, STRIPE_RTM_SECRET_KEY: "sk_live_existing", STRIPE_NL_WEBHOOK_CH_KEY: "whsec_old" };
  const env = configureTestStripe(original);
  for (const region of ["NL", "GRO", "AMS", "EIN", "RTM", "LWD", "LDHG"]) {
    assert.equal(env[`STRIPE_${region}_SECRET_KEY`], testStripe.STRIPE_NL_SECRET_KEY);
    assert.equal(env[`STRIPE_${region}_PUBLISHABLE_KEY`], testStripe.STRIPE_NL_PUBLISHABLE_KEY);
    assert.equal(env[`STRIPE_${region}_WEBHOOK_CH_KEY`], "");
  }
  applySigningSecret(env, "whsec_fixture");
  assert.equal(env.STRIPE_NL_WEBHOOK_CH_KEY, "whsec_fixture");
  assert.equal(env.STRIPE_RTM_WEBHOOK_CH_KEY, "whsec_fixture");
  assert.equal(env.STRIPE_WEBHOOK_CH_KEY, "whsec_fixture");
  assert.equal(original.STRIPE_NL_WEBHOOK_CH_KEY, "whsec_old");
  assert.equal(original.STRIPE_RTM_SECRET_KEY, "sk_live_existing");
  assert.throws(() => configureTestStripe({ ...testStripe, STRIPE_NL_SECRET_KEY: "sk_live_bad" }), /test keys/);
  assert.throws(() => configureTestStripe({ ...testStripe, STRIPE_NL_PUBLISHABLE_KEY: "pk_live_bad" }), /test keys/);
  assert.throws(() => configureTestStripe({}), /test keys/);
});

test("explicit test credentials override regional credentials; CLI never exposes the key in args", () => {
  const api = { cwd: "/fixture", env: configureTestStripe({ ...testStripe, STRIPE_SECRET_KEY_TEST: "sk_test_override", STRIPE_PUBLISHABLE_KEY_TEST: "pk_test_override" }) };
  const listener = stripeService(api, { STRIPE_API_KEY: "sk_live_wrong" });
  assert.equal(listener.env.STRIPE_API_KEY, "sk_test_override");
  assert.ok(listener.args.includes(STRIPE_FORWARD_URL));
  assert.ok(!listener.args.some((arg) => arg.includes("sk_test_") || arg === "--live"));
});

const fakeStripe = () => Object.assign(new EventEmitter(), { stdout: new PassThrough(), stderr: new PassThrough() });

test("listener readiness injects split signing secrets without logging credentials", async () => {
  const child = fakeStripe();
  const api = { env: configureTestStripe(testStripe) };
  const service = stripeService(api, {});
  const output = [];
  const ready = waitForStripeReady(service, { child, log: (line) => output.push(line) });
  child.stderr.write('> Ready! Your webhook signing secret is whsec_');
  assert.equal(api.env.STRIPE_NL_WEBHOOK_CH_KEY, "");
  child.stderr.write('fixture (^C to quit)\n');
  await ready;
  assert.equal(api.env.STRIPE_NL_WEBHOOK_CH_KEY, "whsec_fixture");
  child.stdout.write('200 checkout.session.completed\n');
  assert.match(output.join("\n"), /200 checkout.session.completed/);
  assert.doesNotMatch(output.join("\n"), /whsec_/);
});

test("listener fails promptly on exit, spawn error, timeout or cancellation", async () => {
  for (const failure of ["exit", "error", "timeout", "abort"]) {
    const child = fakeStripe();
    const abort = new AbortController();
    const ready = waitForStripeReady({ name: "stripe", onSecret() {} }, { child, signal: abort.signal, timeoutMs: 10, log() {} });
    const rejected = assert.rejects(ready, /Stripe/);
    if (failure === "abort") abort.abort();
    else if (failure !== "timeout") child.emit(failure);
    await rejected;
  }
});

test("Stripe preflight reports missing CLI without leaking command output", async () => {
  await assert.rejects(checkStripeCli("missing", async () => { throw new Error("sk_test_hidden"); }), /Stripe CLI is required/);
});

const api = { DB: "example.test", DB_USER: "test", DB_PASS: "test-password", SSR_SERVER_KEY: "private-ssr-key", APP_ENV: "prod" };
const mailer = { MAILER_ADMIN_SECRET: "admin-secret", BULGARIANSOCIETY_EMAIL_DATABASE_URL: "postgres://localhost/test", APP_ENV: "prod" };

test("runtime overrides connect the local stack without modifying or exposing credentials", () => {
  const result = localEnvironments(api, mailer, { NODE_ENV: "production", NEXT_PUBLIC_TEST_SERVER_URL: "https://wrong.example/api", PORT: "9999" });
  assert.equal(result.api.MAILER_API_URL, "http://127.0.0.1:6000/api");
  assert.equal(result.api.BGSNL_EMAIL_PROVIDER, "domakin");
  assert.equal(result.api.MAILER_BULGARIANSOCIETY_SECRET, result.mailer.MAILER_BULGARIANSOCIETY_SECRET);
  assert.equal(result.api.MAILER_BULGARIANSOCIETY_SECRET.length, 64);
  assert.notEqual(result.api.MAILER_BULGARIANSOCIETY_SECRET, localEnvironments(api, mailer, {}).api.MAILER_BULGARIANSOCIETY_SECRET);
  assert.equal(result.website.BGSNL_SERVER_KEY, api.SSR_SERVER_KEY);
  assert.equal(result.website.MAILER_ADMIN_SECRET, undefined);
  assert.equal(result.website.DB_PASS, undefined);
  assert.equal(result.website.NEXT_PUBLIC_TEST_SERVER_URL, "http://localhost:8080/api/");
  assert.equal(result.api.BILLING_WORKER_ENABLED, "false");
  assert.equal(result.api.BGSNL_REDIS_URL, "redis://127.0.0.1:6380/0");
  assert.equal(result.api.BGSNL_REDIS_PREFIX, "bgsnl:development:v1:");
  const configured = localEnvironments({ ...api, BGSNL_REDIS_URL: "redis://127.0.0.1:6390/0", BGSNL_REDIS_PREFIX: "custom:" }, mailer, {});
  assert.equal(configured.api.BGSNL_REDIS_URL, "redis://127.0.0.1:6390/0");
  assert.equal(configured.api.BGSNL_REDIS_PREFIX, "custom:");
  assert.equal(result.mailer.EMAIL_EVENT_MAINTENANCE_ENABLED, "false");
  assert.equal(result.mailer.EMAIL_SES_EVENT_CONSUMER_ENABLED, "false");
  for (const env of Object.values(result)) { assert.equal(env.NODE_ENV, "development"); assert.equal(env.APP_ENV, "dev"); }
  assert.equal(api.APP_ENV, "prod");
  assert.equal(mailer.MAILER_BULGARIANSOCIETY_SECRET, undefined);
});

test("missing prerequisites fail before any process changes", () => {
  assert.throws(() => localEnvironments({ ...api, DB_PASS: "" }, mailer, {}), /DB_PASS/);
  assert.throws(() => localEnvironments(api, {}, {}), /BULGARIANSOCIETY_EMAIL_DATABASE_URL/);
});

test("all ports are inspected before sending signals", async () => {
  const signals = [];
  await assert.rejects(clearPorts([{ port: 8080 }, { port: 6000 }], {
    find: async (port) => { if (port === 6000) throw new Error("Cannot inspect"); return [42]; }, kill: (...args) => signals.push(args),
  }), /Cannot inspect/);
  assert.deepEqual(signals, []);
});

test("SIGTERM targets only inspected listeners and SIGKILL never targets a replacement", async () => {
  let current = [42];
  const signals = [];
  await assert.rejects(clearPorts([{ port: 8080 }], {
    find: async () => current, ancestors: async () => [], graceMs: 0, log: () => {}, sleep: async () => {},
    kill: (...args) => { signals.push(args); current = [43]; },
  }), /new process occupied port/);
  assert.deepEqual(signals, [[42, "SIGTERM"]]);
});

test("stubborn original listeners receive a bounded forced stop", async () => {
  let current = [42];
  const signals = [];
  await clearPorts([{ port: 8080 }], {
    find: async () => current, ancestors: async () => [], graceMs: 0, log: () => {}, sleep: async () => {},
    kill: (...args) => { signals.push(args); if (args[1] === "SIGKILL") current = []; },
  });
  assert.deepEqual(signals, [[42, "SIGTERM"], [42, "SIGKILL"]]);
});

test("readiness rejects a not-ready provider instead of announcing successful startup", async () => {
  await assert.rejects(waitForReady({ name: "domakin-mailer", port: 6000, health: "/health" }, {
    timeoutMs: 10, request: async () => new Response("unavailable", { status: 503 }),
  }), /did not become ready/);
  await waitForReady({ name: "domakin-mailer", port: 6000, health: "/health" }, {
    request: async () => new Response(JSON.stringify({ service: "domakin-mailer" })),
  });
  await assert.rejects(waitForReady({ name: "domakin-mailer", port: 6000, health: "/health" }, {
    request: async () => new Response(JSON.stringify({ service: "other" })),
  }), /Unexpected service/);
});

const fixture = fileURLToPath(new URL("./fixtures/dev-service.mjs", import.meta.url));
async function freePort() {
  const server = net.createServer();
  server.listen(0, "127.0.0.1");
  await once(server, "listening");
  const port = server.address().port;
  await new Promise((resolve) => server.close(resolve));
  return port;
}

test("integration: an occupied fixture port is freed without touching another listener", async (t) => {
  const port = await freePort();
  const other = await freePort();
  const children = [port, other].map((value) => spawn(process.execPath, [fixture, String(value)], { stdio: ["ignore", "pipe", "pipe"] }));
  t.after(() => { for (const child of children) { try { child.kill("SIGKILL"); } catch { /* Fixture already exited. */ } } });
  await Promise.all(children.map((child) => once(child.stdout, "data")));
  await clearPorts([{ port }], { graceMs: 1500, log: () => {}, ancestors: async () => [] });
  assert.deepEqual(await listeners(port), []);
  assert.deepEqual(await listeners(other), [children[1].pid]);
});

for (const fail of [false, true]) {
  test(`integration: launcher ${fail ? "cleans up after readiness failure" : "starts all services and Ctrl+C cleans up"}`, { timeout: 15000 }, async (t) => {
    const ports = await Promise.all([freePort(), freePort(), freePort()]);
    const services = ports.map((port, index) => ({ name: `fixture-${index}`, port, health: "/", command: process.execPath, args: [fixture, String(port)], env: { NODE_ENV: "test", FIXTURE_REQUIRE_STRIPE: "true", FIXTURE_STATUS: fail && index === 1 ? "503" : "200" } }));
    const moduleUrl = new URL("./dev-services.mjs", import.meta.url).href;
    const stripeModule = new URL("./local-stripe.mjs", import.meta.url).href;
    const stripeFixture = fileURLToPath(new URL("./fixtures/stripe-listener.mjs", import.meta.url));
    const code = `import { runServices, waitForReady } from ${JSON.stringify(moduleUrl)};
      import { waitForStripeReady, applySigningSecret } from ${JSON.stringify(stripeModule)};
      const services = ${JSON.stringify(services)};
      const stripe = { name: "stripe-webhooks", command: process.execPath, args: [${JSON.stringify(stripeFixture)}],
        env: { NODE_ENV: "test" }, ready: waitForStripeReady,
        onSecret: (secret) => services.forEach(service => applySigningSecret(service.env, secret)) };
      process.exitCode = await runServices([stripe, ...services], { shutdownMs: 1500, ready: (s, options) => waitForReady(s, { ...options, timeoutMs: 1000 }) });`;
    const child = spawn(process.execPath, ["--input-type=module", "-e", code], { stdio: ["ignore", "pipe", "pipe"] });
    const exited = once(child, "exit");
    t.after(() => { try { child.kill("SIGTERM"); } catch { /* Launcher already exited. */ } });
    let output = "";
    child.stdout.on("data", (chunk) => { output += chunk; });
    child.stderr.on("data", (chunk) => { output += chunk; });
    if (!fail) {
      const deadline = Date.now() + 7000;
      while (!output.includes("All services ready") && Date.now() < deadline && child.exitCode === null) await delay(50);
      assert.match(output, /All services ready/);
      for (const port of ports) assert.equal((await listeners(port)).length, 1);
      child.kill("SIGINT");
    }
    const [exitCode] = await exited;
    assert.equal(exitCode, fail ? 1 : 0, output);
    assert.doesNotMatch(output, /whsec_/);
    for (const port of ports) assert.deepEqual(await listeners(port), [], output);
  });
}
