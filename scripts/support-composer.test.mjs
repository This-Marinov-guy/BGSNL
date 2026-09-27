import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import vm from "node:vm";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { loadBindings, transform } from "next/dist/build/swc/index.js";
import * as state from "../src/elements/support/support-state.mjs";

const require = createRequire(import.meta.url);
const filename = "src/elements/support/Conversation.jsx";
await loadBindings();
const { code } = await transform(await readFile(new URL(`../${filename}`, import.meta.url), "utf8"), {
  filename, jsc: { parser: { syntax: "ecmascript", jsx: true }, transform: { react: { runtime: "automatic" } } },
  module: { type: "commonjs" },
});

function renderConversation(status, { staff = false, messageCount = 1 } = {}) {
  const record = { id: "test-ticket", reference: "TEST", subject: "Existing support request", type: "problem",
    status, revision: 1, messageCount, messages: [], before: null, contact: { name: "Client", email: "client@example.test" } };
  let stateIndex = 0;
  const Stub = () => null;
  const imports = (name) => {
    if (name === "react") return { ...React, useState: (initial) => React.useState(stateIndex++ === 0 ? record : initial) };
    if (["react/jsx-runtime", "prop-types"].includes(name)) return require(name);
    if (name.endsWith("support-state.mjs")) return state;
    if (name.endsWith("support.module.scss")) return { __esModule: true, default: new Proxy({}, { get: (_, key) => key }) };
    return new Proxy({ __esModule: true, default: Stub }, { get: (target, key) => target[key] ?? Stub });
  };
  const exports = {};
  vm.runInNewContext(code, { exports, require: imports });
  return renderToStaticMarkup(React.createElement(exports.default, { id: record.id, staff, active: true, onBack: () => {} }));
}

test("locked client chats render a reason instead of text, attachment and screenshot controls", () => {
  for (const status of ["rejected", "paused", "frozen"]) {
    const html = renderConversation(status);
    assert.match(html, /role="status"/);
    assert.match(html, status === "rejected" ? /ticket is rejected/ : /Support must reopen it/);
    assert.doesNotMatch(html, /<textarea|type="file"|Capture and send screenshot|Send reply/);
    assert.match(html, /Existing support request/);
  }
});

test("open and resolved chats keep the client composer available", () => {
  for (const status of ["open", "resolved"]) {
    const html = renderConversation(status);
    assert.match(html, /<textarea/);
    assert.match(html, /Attach images/);
    assert.match(html, /Send reply/);
  }
});

test("paused staff chats still allow support updates; message limits remain enforced", () => {
  assert.match(renderConversation("paused", { staff: true }), /<textarea/);
  assert.doesNotMatch(renderConversation("open", { messageCount: 200 }), /<textarea/);
  assert.doesNotMatch(renderConversation("paused", { staff: true, messageCount: 200 }), /<textarea/);
});
