import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import vm from "node:vm";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { loadBindings, transform } from "next/dist/build/swc/index.js";
import * as administration from "../src/util/administration.mjs";

const require = createRequire(import.meta.url);
const files = ["src/elements/backoffice/AccessRequestBanner.jsx", "src/elements/ui/tabs/SettingsTab.jsx"];
await loadBindings();
const compiled = await Promise.all(files.map(async (filename) => {
  const source = await readFile(new URL(`../${filename}`, import.meta.url), "utf8");
  return (await transform(source, {
    filename,
    jsc: { parser: { syntax: "ecmascript", jsx: true }, transform: { react: { runtime: "automatic" } } },
    module: { type: "commonjs" },
  })).code;
}));

function renderSettings(roles) {
  const state = { roles };
  const Stub = () => null;
  let Banner;
  const imports = (name) => {
    if (["react", "react/jsx-runtime", "prop-types"].includes(name)) return require(name);
    if (name === "react-redux") return { useSelector: (select) => select(state), useDispatch: () => () => {} };
    if (name.endsWith("redux/user")) return { selectUser: (value) => value };
    if (name.endsWith("defines/common")) return { ACTIVE_MEMBER: "active_member" };
    if (name.endsWith("administration.mjs")) return administration;
    if (name.endsWith("AccessRequestBanner")) return { __esModule: true, default: Banner };
    if (name.endsWith("http-hook")) return { useHttpClient: () => ({ sendRequest: () => { throw new Error("Rendering must not submit a request"); } }) };
    return new Proxy({ __esModule: true, default: Stub }, { get: (target, key) => target[key] ?? Stub });
  };
  const load = (code) => {
    const exports = {};
    vm.runInNewContext(code, { exports, require: imports });
    return exports.default;
  };
  Banner = load(compiled[0]);
  return renderToStaticMarkup(React.createElement(load(compiled[1]), { user: {} }));
}

test("active members see the access banner within Membership settings", () => {
  const html = renderSettings(["member", "active_member"]);
  const membership = html.slice(html.indexOf('aria-labelledby="settings-membership"'), html.indexOf('aria-labelledby="settings-session"'));
  assert.match(membership, /Need access to another area\?/);
  assert.match(membership, /Request access/);
});

test("other roles alone do not show the membership access banner", () => {
  for (const roles of [[], ["member"], ["alumni"], ["admin"], ["regional_board_member"]]) {
    assert.doesNotMatch(renderSettings(roles), /Need access to another area\?/);
  }
});

test("active members with every permission retain the existing all-access message", () => {
  const html = renderSettings(["active_member", "admin"]);
  assert.match(html, /Your account already has access to every administration area/);
  assert.doesNotMatch(html, />Request access<\/button>/);
});
