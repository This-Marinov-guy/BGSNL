import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import vm from "node:vm";
import { loadBindings, transform } from "next/dist/build/swc/index.js";

const require = createRequire(import.meta.url);
await loadBindings();
const { code } = await transform(await readFile(new URL("../src/elements/ui/loading/LoadState.jsx", import.meta.url), "utf8"), {
  filename: "LoadState.jsx", jsc: { parser: { syntax: "ecmascript", jsx: true }, transform: { react: { runtime: "automatic" } } }, module: { type: "commonjs" },
});
const exports = {};
vm.runInNewContext(code, { exports, require: name => {
  if (["react/jsx-runtime", "prop-types"].includes(name)) return require(name);
  if (name.endsWith("IconlyIcons")) return { FiAlertCircle: "alert-icon", FiAlertTriangle: "warning-icon", IconlyHome: "home-icon" };
  return { __esModule: true, default: name.endsWith(".scss") ? new Proxy({}, { get: (_, key) => key }) : "retry-icon" };
} });

test("content skeletons reserve the requested cards with accessible loading status", () => {
  const skeleton = exports.LoadingSkeleton({ label: "Loading subscription options", variant: "tiers", count: 4 });
  assert.equal(skeleton.props.role, "status");
  assert.equal(skeleton.props["aria-label"], "Loading subscription options");
  assert.equal(skeleton.props["aria-busy"], "true");
  assert.equal(skeleton.props.children.length, 4);
  assert.ok(skeleton.props.children.every(child => child.props["aria-hidden"] === "true"));
  assert.equal(exports.LoadingSkeleton({ variant: "inline", count: 4 }).props.children.length, 1);
});

test("retry is icon-only, named, non-submitting and calls the supplied handler", () => {
  let called = 0;
  const button = exports.RetryButton({ onClick: () => called++, label: "Retry subscription options" });
  assert.equal(button.props.type, "button");
  assert.equal(button.props["aria-label"], "Retry subscription options");
  assert.equal(button.props.children.type, "retry-icon");
  button.props.onClick();
  assert.equal(called, 1);
  assert.equal(exports.RetryButton({ onClick: () => {}, disabled: true }).props.disabled, true);
});

test("failure banner announces its message and wires the matching retry", () => {
  const onRetry = () => {};
  const banner = exports.LoadErrorBanner({ message: "Plans unavailable", onRetry, retryLabel: "Retry plans", disabled: true });
  assert.equal(banner.props.role, "alert");
  assert.equal(banner.props.children[0].props.children[1], "Plans unavailable");
  const retry = banner.props.children[1].props.children[0];
  assert.equal(retry.type, exports.RetryButton);
  assert.equal(retry.props.onClick, onRetry);
  assert.equal(retry.props.label, "Retry plans");
  assert.equal(retry.props.disabled, true);
});

test("slow-loading notice uses warning styling and a non-urgent status", () => {
  const banner = exports.LoadErrorBanner({ message: "This is taking longer than expected.", severity: "warning", onRetry: () => {} });
  assert.equal(banner.props.className, "error warning");
  assert.equal(banner.props.role, "status");
  assert.equal(banner.props.children[0].props.children[0].type, "warning-icon");
});

test("page and account loaders retain their visible labels as exceptions", async () => {
  const page = await readFile(new URL("../src/elements/ui/loading/PageLoading.jsx", import.meta.url), "utf8");
  const account = await readFile(new URL("../src/elements/ui/errors/HeaderLoadingError.jsx", import.meta.url), "utf8");
  assert.match(page, />Loading\.\.\.<\/h3>/);
  assert.match(account, /"Loading your account" : "Loading"/);
  assert.doesNotMatch(page, /LoadingSkeleton/);
  assert.doesNotMatch(account, /LoadingSkeleton/);
});

test("slow-loading banners offer an accessible icon-only home link without changing other banners", async () => {
  const props = { onRetry: () => {} };
  assert.equal(exports.LoadErrorBanner(props).props.children[1].props.children[1], false);
  const home = exports.LoadErrorBanner({ ...props, showHome: true }).props.children[1].props.children[1];
  assert.equal(home.type, "a");
  assert.equal(home.props.href, "/");
  assert.equal(home.props["aria-label"], "Go to home page");
  assert.equal(home.props.title, "Go to home page");
  assert.equal(home.props.className, "retry");
  assert.equal(home.props.children.type, "home-icon");
  assert.equal(home.props.children.props["aria-hidden"], "true");
  const source = await readFile(new URL("../src/elements/ui/loading/LoadingRecovery.jsx", import.meta.url), "utf8");
  assert.match(source, /<LoadErrorBanner[^>]*severity="warning"[^>]*message="This is taking longer than expected\."[^>]*\bonRetry=/);
  assert.match(source, /showHome\s*\/>/);
});

test("compact preview errors give the message its own row without changing standard banners", async () => {
  const props = { message: "Card preview unavailable.", onRetry: () => {}, retryLabel: "Retry card preview" };
  assert.equal(exports.LoadErrorBanner(props).props.className, "error");
  const compact = exports.LoadErrorBanner({ ...props, compact: true });
  assert.equal(compact.props.className, "error compact");
  assert.equal(compact.props.children[0].props.children[1], props.message);
  assert.equal(compact.props.children[1].props.children[0].props.label, "Retry card preview");
  const css = await readFile(new URL("../src/elements/ui/loading/load-state.module.scss", import.meta.url), "utf8");
  assert.match(css, /\.error\.compact\s*\{\s*display: grid;\s*grid-template-columns: minmax\(0, 1fr\)/);
  const source = await readFile(new URL("../src/elements/wallet/MembershipCardThumbnail.jsx", import.meta.url), "utf8");
  assert.match(source, /<LoadErrorBanner compact/);
  assert.doesNotMatch(source, /No preview/);
});

test("retry has no background or border and skeleton motion respects reduced motion", async () => {
  const css = await readFile(new URL("../src/elements/ui/loading/load-state.module.scss", import.meta.url), "utf8");
  assert.match(css, /background: transparent !important/);
  assert.match(css, /border: 0 !important/);
  assert.match(css, /focus-visible/);
  assert.match(css, /prefers-reduced-motion: reduce/);
});
