import assert from "node:assert/strict";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { compile } from "sass";
import postcss from "postcss";

function stylesheet(path) {
  return postcss.parse(compile(fileURLToPath(new URL(path, import.meta.url))).css);
}

const workspace = stylesheet("../public/assets/scss/elements/_user-sidebar.scss");
const tabs = stylesheet("../public/assets/scss/elements/_user-tabs.scss");
const support = stylesheet("../src/elements/support/support.module.scss");

function declarations(root, selector, property) {
  const values = [];
  root.walkRules((rule) => {
    if (rule.selectors.includes(selector)) {
      rule.nodes.filter((node) => node.type === "decl" && node.prop === property)
        .forEach((node) => values.push(node.value));
    }
  });
  return values;
}

function assertContentHeight(root, selector) {
  for (const property of ["height", "min-height"]) {
    // Inspect every breakpoint, not just the desktop declaration.
    for (const value of declarations(root, selector, property)) {
      assert.ok(["auto", "0", "max-content", "fit-content"].includes(value), `${selector}: ${property}: ${value}`);
    }
  }
}

test("account workspace and shared tab panel have no forced height at any breakpoint", () => {
  assertContentHeight(workspace, ".user-page-container");
  assertContentHeight(workspace, ".user-content-area .content-container");
});

test("embedded Help and staff inbox follow their content, including the desk wrapper", () => {
  assertContentHeight(support, ".embedded");
  assertContentHeight(support, ".embedded > .desk");
});

test("short inline conversations shrink while long message histories remain scrollable", () => {
  assert.deepEqual(declarations(support, ".embedded .messages", "min-height"), ["0"]);
  assert.deepEqual(declarations(support, ".embedded .messages", "flex"), ["0 1 auto"]);
  assert.deepEqual(declarations(support, ".embedded .messages", "max-height"), ["min(32rem, 65dvh)"]);
  assert.ok(declarations(support, ".messages", "overflow-y").includes("auto"));
});

test("account cards are not stretched to equal heights", () => {
  assertContentHeight(tabs, ".settings-card");
  assert.ok(declarations(tabs, ".settings-card", "align-self").includes("start"));
  for (const selector of [".user-page-container .internships-grid", ".user-page-container .promotions-grid"]) {
    assert.ok(declarations(tabs, selector, "align-items").includes("start"));
  }
});

test("intentional fullscreen mobile navigation and floating Help widget are preserved", () => {
  assert.ok(declarations(workspace, ".user-sidebar.mobile", "height").includes("100dvh"));
  assert.ok(declarations(support, ".widgetPanel", "height").includes("100dvh"));
  assert.ok(declarations(support, ".widgetPanel", "height").includes("min(43rem, 100dvh - 7rem)"));
});
