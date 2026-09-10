import test from "node:test";
import assert from "node:assert/strict";
import { accountRouteState } from "../src/util/functions/account-route-state.mjs";

const staff = { authInitialized: true, session: "test-session", status: "active", roles: ["admin"] };

test("protected routes wait for a saved session before deciding staff access", () => {
  assert.equal(accountRouteState({ authInitialized: false }, ["admin"], "/user/support"), "restoring");
  assert.equal(accountRouteState({ ...staff, authInitialized: false }, ["admin"], "/user/support"), "restoring");
  assert.equal(accountRouteState(staff, ["admin"], "/user/support"), "allowed");
});

test("failed restoration or logout cannot render a private page", () => {
  assert.equal(accountRouteState({ authInitialized: true, version: 1 }, ["admin"], "/user/support"), "anonymous");
  assert.equal(accountRouteState({ ...staff, session: null }, ["admin"], "/user/support"), "anonymous");
});

test("role changes are reflected immediately, without rendering forbidden children", () => {
  assert.equal(accountRouteState({ ...staff, roles: ["member"] }, ["admin"], "/user/support"), "forbidden");
  assert.equal(accountRouteState({ ...staff, roles: undefined }, ["admin"], "/user/support"), "forbidden");
});

test("restricted accounts keep account Settings and Help but cannot enter staff routes", () => {
  for (const status of ["locked", "payment_awaiting", "frozen", "suspended"]) {
    assert.equal(accountRouteState({ ...staff, status }, [], "/user"), "allowed");
    assert.equal(accountRouteState({ ...staff, status }, ["admin"], "/user/support"), "locked");
  }
});
