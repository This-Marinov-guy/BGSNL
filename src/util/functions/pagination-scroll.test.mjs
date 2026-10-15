import assert from "node:assert/strict";
import test from "node:test";
import { scrollToListStart } from "./pagination-scroll.mjs";

test("pagination scrolls to the list start in the page or its scroll container", () => {
  const previousWindow = globalThis.window;
  const previousDocument = globalThis.document;
  const pageScrolls = [];
  const containerScrolls = [];
  const body = {};
  globalThis.document = { body };
  globalThis.window = {
    scrollY: 200,
    matchMedia: () => ({ matches: false }),
    getComputedStyle: (element) => ({ overflowY: element.overflowY || "visible" }),
    scrollTo: (options) => pageScrolls.push(options),
  };

  try {
    const pageElement = { parentElement: body, getBoundingClientRect: () => ({ top: 500 }) };
    scrollToListStart({ current: pageElement });
    assert.deepEqual(pageScrolls, [{ top: 604, behavior: "smooth" }]);

    const container = {
      parentElement: body, overflowY: "auto", scrollHeight: 500, clientHeight: 200,
      scrollTop: 100, getBoundingClientRect: () => ({ top: 30 }),
      scrollTo: (options) => containerScrolls.push(options),
    };
    const modalElement = { parentElement: container, getBoundingClientRect: () => ({ top: 150 }) };
    scrollToListStart({ current: modalElement });
    assert.deepEqual(containerScrolls, [{ top: 204, behavior: "smooth" }]);
    assert.equal(pageScrolls.length, 1);

    scrollToListStart({ current: null });
    assert.equal(pageScrolls.length, 1);

    globalThis.window.matchMedia = () => ({ matches: true });
    scrollToListStart({ current: pageElement });
    assert.deepEqual(pageScrolls[1], { top: 604, behavior: "auto" });
  } finally {
    globalThis.window = previousWindow;
    globalThis.document = previousDocument;
  }
});
