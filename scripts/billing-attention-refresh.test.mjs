import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import vm from "node:vm";
import { loadBindings, transform } from "next/dist/build/swc/index.js";
import { needsBillingAttention } from "../src/elements/subscriptions/account-status-notice.mjs";

const require = createRequire(import.meta.url);
const filename = "src/elements/subscriptions/BillingAttentionProvider.jsx";
await loadBindings();
const { code } = await transform(await readFile(new URL(`../${filename}`, import.meta.url), "utf8"), {
  filename,
  jsc: { parser: { syntax: "ecmascript", jsx: true }, transform: { react: { runtime: "automatic" } } },
  module: { type: "commonjs" },
});

function harness() {
  const slots = [];
  const effects = [];
  const requests = [];
  let cursor = 0;
  const hooks = {
    createContext: () => ({ Provider: "billing-context" }),
    useContext: () => null,
    useRef(initial) {
      const index = cursor++;
      if (!Object.hasOwn(slots, index)) slots[index] = { current: initial };
      return slots[index];
    },
    useState(initial) {
      const index = cursor++;
      if (!Object.hasOwn(slots, index)) slots[index] = initial;
      return [slots[index], value => { slots[index] = typeof value === "function" ? value(slots[index]) : value; }];
    },
    useEffect(callback, deps) {
      const index = cursor++;
      const previous = effects[index];
      if (!previous || deps.some((value, i) => value !== previous.deps[i])) {
        effects[index] = { callback, deps, cleanup: previous?.cleanup, pending: true };
      }
    },
  };
  const exports = {};
  vm.runInNewContext(code, { exports, clearTimeout, setTimeout, require: name => {
    if (name === "react") return hooks;
    if (["react/jsx-runtime", "prop-types"].includes(name)) return require(name);
    if (name.endsWith("http-hook")) return { useHttpClient: () => ({ sendRequest: () => new Promise(resolve => requests.push(resolve)) }) };
    if (name.endsWith("account-status-notice.mjs")) return { needsBillingAttention };
    throw new Error(`Unexpected import: ${name}`);
  } });
  return {
    requests,
    render(user) { cursor = 0; return exports.default({ user, children: null }).props.value; },
    flushEffects() {
      for (const effect of effects) {
        if (!effect?.pending) continue;
        effect.cleanup?.();
        effect.cleanup = effect.callback();
        effect.pending = false;
      }
    },
  };
}

const settleRequest = () => new Promise(resolve => setImmediate(resolve));

test("background billing checks retain the banner; explicit reloads show the skeleton", async () => {
  const h = harness();
  const user = { _id: "member-1", status: "locked", subscription: { id: "sub-1", status: "canceled", syncedAt: "first" } };
  const ended = { reason: "subscription_ended", title: "No active subscription", description: "Renew your subscription." };
  const paused = { reason: "subscription_paused", title: "Subscription paused", description: "Resume your subscription." };

  assert.equal(h.render(user).loading, true);
  h.flushEffects();
  h.requests.shift()({ billing: ended });
  await settleRequest();
  assert.equal(h.render(user).loading, false);
  assert.equal(h.render(user).notice.reason, "subscription_ended");

  const synced = { ...user, subscription: { ...user.subscription, syncedAt: "second" } };
  assert.equal(h.render(synced).loading, false);
  assert.equal(h.render(synced).notice.reason, "subscription_ended");
  h.flushEffects();
  h.requests.shift()({ billing: ended });
  await settleRequest();
  assert.equal(h.render(synced).loading, false);
  assert.equal(h.render(synced).notice.reason, "subscription_ended");

  const changed = { ...synced, subscription: { ...synced.subscription, syncedAt: "third" } };
  assert.equal(h.render(changed).notice.reason, "subscription_ended");
  h.flushEffects();
  h.requests.shift()({ billing: paused });
  await settleRequest();
  assert.equal(h.render(changed).notice.reason, "subscription_paused");

  h.render(changed).retry();
  assert.equal(h.render(changed).loading, true);
  h.flushEffects();
  h.requests.shift()({ billing: paused });
  await settleRequest();
  assert.equal(h.render(changed).loading, false);
});
