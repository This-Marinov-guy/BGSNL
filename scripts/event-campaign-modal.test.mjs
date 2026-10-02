import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import vm from "node:vm";
import { randomUUID } from "node:crypto";
import { loadBindings, transform } from "next/dist/build/swc/index.js";
const require = createRequire(import.meta.url);
await loadBindings();
const { code } = await transform(await readFile(new URL("../src/elements/actions/dashboard/open-events/EventCampaignModal.jsx", import.meta.url), "utf8"), {
  filename: "EventCampaignModal.jsx", jsc: { parser: { syntax: "ecmascript", jsx: true }, transform: { react: { runtime: "automatic" } } }, module: { type: "commonjs" },
});
const nodes = node => !node || typeof node !== "object" ? [] : Array.isArray(node) ? node.flatMap(nodes) : [node, ...nodes(node.props?.children)];
const text = node => typeof node === "string" || typeof node === "number" ? String(node) : Array.isArray(node) ? node.map(text).join("") : text(node?.props?.children ?? "");
const preview = { total: 2, blocked: false, warnings: [], counts: { members: 1, guests: 1 }, regions: ["groningen", "leeuwarden"], review: { signature: "signed", expiresAt: 100 }, previews: [{ audience: "members", subject: "An invitation", html: "<h1>An invitation</h1>" }] };
function render(overrides = {}) {
  const values = ["announcement", "both", "", overrides.step || "choose", overrides.preview === undefined ? preview : overrides.preview,
    overrides.enabled ?? true, overrides.pending || false, overrides.sending || false, overrides.error || "", overrides.confirmation || "", 0, overrides.campaign || null, false, 0];
  let index = 0; const calls = [], exports = {};
  vm.runInNewContext(code, { exports, crypto: { randomUUID }, require: name => {
    if (name === "react") return { useState: initial => [index < values.length ? values[index++] : initial, () => {}], useRef: value => ({ current: value }), useEffect: () => {} };
    if (["react/jsx-runtime", "prop-types"].includes(name)) return require(name);
    if (name.endsWith("http-hook")) return { useHttpClient: () => ({ sendRequest: async (...args) => { calls.push(args); return { campaign: { id: "queued" } }; } }) };
    if (name.endsWith("LoadState")) return { LoadingSkeleton: "skeleton", LoadErrorBanner: "error-banner" };
    if (name.endsWith("IconlyIcons")) return { FiInfo: "info-icon" };
    return { __esModule: true, default: name.endsWith(".scss") ? {} : "app-modal" };
  } });
  const view = exports.default({ event: { id: "event-id", title: "Autumn event" }, open: true, onClose: () => {} });
  return { view, calls, actions: nodes(view.props.actions).filter(node => node.type === "button"), content: nodes(view) };
}
test("campaign selection cannot advance during loading, empty audience or blocked sales", () => {
  for (const overrides of [{ pending: true, preview: null }, { preview: { ...preview, total: 0 } }, { preview: { ...preview, blocked: true } }]) {
    const { actions } = render(overrides); assert.equal(actions.find(node => text(node) === "Review campaign").props.disabled, true);
  }
  assert.equal(render().actions.find(node => text(node) === "Review campaign").props.disabled, false);
});
test("confirmation needs typed SEND, sending enabled and no request in flight", () => {
  for (const overrides of [{}, { confirmation: "send" }, { confirmation: "SEND", enabled: false }, { confirmation: "SEND", sending: true }]) {
    assert.equal(render({ step: "review", ...overrides }).actions.at(-1).props.disabled, true);
  }
  assert.equal(render({ step: "review", confirmation: "SEND" }).actions.at(-1).props.disabled, false);
});
test("confirm sends the reviewed selection and stable request identifier, never recipient content", async () => {
  const { actions, calls } = render({ step: "review", confirmation: "SEND" });
  await actions.at(-1).props.onClick();
  assert.equal(calls[0][0], "event/event-id/campaigns/confirm");
  assert.equal(calls[0][2].review.signature, "signed");
  assert.equal(calls[0][2].audience, "both");
  assert.match(calls[0][2].requestId, /^[a-f\d-]{36}$/);
  assert.equal("recipients" in calls[0][2], false);
});
test("email previews are sandboxed, and loading/error/success states stay explicit", () => {
  const frame = render({ step: "review" }).content.find(node => node.type === "iframe");
  assert.equal(frame.props.sandbox, ""); assert.match(frame.props.srcDoc, /default-src 'none'/);
  assert.ok(render({ pending: true, preview: null }).content.some(node => node.type === "skeleton"));
  assert.ok(render({ error: "Review failed" }).content.some(node => node.type === "error-banner"));
  const success = render({ campaign: { id: "queued", status: "queued", total: 2 } });
  assert.match(text(success.view), /Campaign queued/);
  assert.deepEqual(success.actions.map(text), ["Done"]);
});
