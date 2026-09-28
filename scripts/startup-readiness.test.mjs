import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { startupContentReady } from "../src/elements/ui/loading/startup-readiness.mjs";

const documentState = { readyState: "interactive", fonts: { status: "loaded" } };
const root = (pending = false, images = []) => ({ querySelector: () => pending, querySelectorAll: () => images });
const image = (complete, top = 0, width = 100) => ({ complete, getBoundingClientRect: () => ({ top, bottom: top + 100, width, height: 100 }) });
test("initial content waits for document, fonts and page loading states", () => {
  assert.equal(startupContentReady(null, documentState, 800), false);
  assert.equal(startupContentReady(root(), { readyState: "loading" }, 800), false);
  assert.equal(startupContentReady(root(), { ...documentState, fonts: { status: "loading" } }, 800), false);
  assert.equal(startupContentReady(root(true), documentState, 800), false);
  assert.equal(startupContentReady(root(), documentState, 800), true);
});
test("only unfinished visible images delay startup, not below-fold or hidden images", () => {
  assert.equal(startupContentReady(root(false, [image(false)]), documentState, 800), false);
  assert.equal(startupContentReady(root(false, [image(true), image(false, 1000), image(false, 0, 0)]), documentState, 800), true);
});
test("overlay preserves unconditional page content and offers no-JS and timeout recovery", async () => {
  const source = await readFile(new URL("../src/elements/ui/loading/StartupOverlay.jsx", import.meta.url), "utf8");
  assert.match(source, /<div ref=\{content\} className="initial-page-content">\{children\}<\/div>/);
  assert.match(source, /<noscript>/);
  assert.match(source, /setTimeout\(finish, 10000\)/);
  assert.match(source, /data-nosnippet/);
  assert.doesNotMatch(source, /userAgent|ssr:\s*false|return\s+ready\s*\?/);
});
