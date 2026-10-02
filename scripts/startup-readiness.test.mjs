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
test("homepage waits for its hero image while ignoring loading elsewhere on the page", () => {
  const hero = root(true, [image(false)]);
  hero.querySelector = selector => selector.startsWith("main, h1") ? {} : null;
  const page = { querySelector: selector => selector === ".slider-activation" ? hero : null };
  const wrapper = { querySelector: selector => selector === ".site-page-transition" ? page : null };
  const options = { publicPage: true, homePage: true };
  assert.equal(startupContentReady({ querySelector: () => null }, documentState, 800, options), false);
  assert.equal(startupContentReady(wrapper, documentState, 800, options), false);
  hero.querySelectorAll = () => [image(true)];
  assert.equal(startupContentReady(wrapper, documentState, 800, options), true);
});
test("other public pages wait for page content, then ignore session and section loading", () => {
  const page = {
    heading: false,
    eagerImage: image(false),
    querySelector(selector) {
      if (selector.startsWith("main, h1")) return this.heading ? {} : null;
      return null;
    },
    querySelectorAll(selector) {
      assert.match(selector, /fetchpriority/);
      return [this.eagerImage];
    },
  };
  const fallback = {
    querySelector: selector => selector === ".page-loading" || selector.startsWith("main, h1") ? {} : null,
  };
  const wrapper = { querySelector: selector => selector === ".site-page-transition" ? page
    : selector === ".global-site-content" ? fallback : null };
  const options = { publicPage: true };
  assert.equal(startupContentReady(wrapper, documentState, 800, options), false);
  page.heading = true;
  assert.equal(startupContentReady(wrapper, documentState, 800, options), false);
  page.eagerImage = image(true);
  assert.equal(startupContentReady(wrapper, documentState, 800, options), true);
  wrapper.querySelector = selector => selector === ".global-site-content" ? fallback : null;
  assert.equal(startupContentReady(wrapper, documentState, 800, options), false);
});
test("ordinary public images do not delay readable page content", () => {
  const page = { querySelector: selector => selector.startsWith("main, h1") ? {} : null,
    querySelectorAll: selector => selector === "img" ? [image(false)] : [] };
  const wrapper = { querySelector: selector => selector === ".site-page-transition" ? page : null };
  assert.equal(startupContentReady(wrapper, documentState, 800, { publicPage: true }), true);
});
test("overlay preserves unconditional page content and offers no-JS and timeout recovery", async () => {
  const source = await readFile(new URL("../src/elements/ui/loading/StartupOverlay.jsx", import.meta.url), "utf8");
  assert.match(source, /<div ref=\{content\} className="initial-page-content">\{children\}<\/div>/);
  assert.match(source, /<noscript>/);
  assert.match(source, /setTimeout\(finish, 10000\)/);
  assert.match(source, /data-nosnippet/);
  assert.doesNotMatch(source, /userAgent|ssr:\s*false|return\s+ready\s*\?/);
  assert.doesNotMatch(source, /if\s*\(skipForHome\)\s*return/);
});
