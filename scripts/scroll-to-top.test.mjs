import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import vm from "node:vm";
import { loadBindings, transform } from "next/dist/build/swc/index.js";

const require = createRequire(import.meta.url);
await loadBindings();
const { code } = await transform(await readFile(new URL("../src/component/common/ScrollToTop.jsx", import.meta.url), "utf8"), {
  filename: "ScrollToTop.jsx",
  jsc: { parser: { syntax: "ecmascript", jsx: true }, transform: { react: { runtime: "automatic" } } },
  module: { type: "commonjs" },
});

function render(pathname, props = { children: "up-icon" }) {
  const effects = [];
  const scrolls = [];
  const listeners = [];
  const exports = {};
  vm.runInNewContext(code, {
    exports,
    window: {
      scrollY: 500,
      scrollTo: (...args) => scrolls.push(args),
      addEventListener: (...args) => listeners.push(args),
      removeEventListener: () => {},
    },
    require: name => {
      if (name === "react") return { useState: () => [true, () => {}], useEffect: effect => effects.push(effect) };
      if (name === "next/navigation") return { usePathname: () => pathname };
      return require(name);
    },
  });
  const element = exports.default(props);
  effects.forEach(effect => effect());
  return { element, scrolls, listeners };
}

test("user routes never render a scroll-to-top button or register its scroll listener", () => {
  for (const pathname of ["/user", "/user/", "/user/dashboard", "/user/dashboard/events", "/user/dashboard/ticket-scanner", "/nl/user/settings"]) {
    const result = render(pathname);
    assert.equal(result.element, null, pathname);
    assert.equal(result.listeners.length, 0, pathname);
    assert.deepEqual(result.scrolls, [[0, 0]], "navigation still resets scroll");
  }
});

test("public pages retain their scroll-to-top control", () => {
  for (const pathname of ["/", "/events", "/future-events", "/user-guide", null]) {
    const result = render(pathname);
    assert.equal(result.element.type, "button");
    assert.equal(result.element.props["aria-label"], "Scroll to top");
    assert.equal(result.listeners.length, 1);
    result.element.props.onClick();
    assert.equal(result.scrolls[1][0].top, 0);
    assert.equal(result.scrolls[1][0].behavior, "smooth");
  }
});

test("the global navigation-only instance remains invisible", () => {
  const result = render("/events", {});
  assert.equal(result.element, null);
  assert.equal(result.listeners.length, 0);
  assert.deepEqual(result.scrolls, [[0, 0]]);
});
