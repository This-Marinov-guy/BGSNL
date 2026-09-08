import test from "node:test";
import assert from "node:assert/strict";
import { accountRouteState } from "../src/util/functions/account-route-state.mjs";

const staff = { authInitialized: true, token: "test-session", status: "active", roles: ["admin"] };

test("protected routes wait for a saved session before deciding staff access", () => {
  assert.equal(accountRouteState({ authInitialized: false }, ["admin"], "/user/support"), "restoring");
  assert.equal(accountRouteState({ ...staff, authInitialized: false }, ["admin"], "/user/support"), "restoring");
  assert.equal(accountRouteState(staff, ["admin"], "/user/support"), "allowed");
});

test("failed restoration or logout cannot render a private page", () => {
  assert.equal(accountRouteState({ authInitialized: true, version: 1 }, ["admin"], "/user/support"), "anonymous");
  assert.equal(accountRouteState({ ...staff, token: null }, ["admin"], "/user/support"), "anonymous");
});

test("role changes are reflected immediately, without rendering forbidden children", () => {
  assert.equal(accountRouteState({ ...staff, roles: ["member"] }, ["admin"], "/user/support"), "forbidden");
  assert.equal(accountRouteState({ ...staff, roles: undefined }, ["admin"], "/user/support"), "forbidden");
});

test("locked accounts keep account Help but cannot enter staff routes", () => {
  assert.equal(accountRouteState({ ...staff, status: "locked" }, [], "/user"), "allowed");
  assert.equal(accountRouteState({ ...staff, status: "locked" }, ["admin"], "/user/support"), "locked");
});
