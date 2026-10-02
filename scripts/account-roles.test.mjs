import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { administrationAreas } from "../src/util/administration.mjs";
import { accountRoleOptions, normalizeRoleNames } from "../src/util/account-roles.mjs";
import { canManageAccountType, canEditAccount, protectedAccountRoles, assignableAccountRoles, assignedEditableRoles, readOnlyAccountRoles } from "../src/elements/backoffice/role-policy.mjs";

test("national board may only assign national committee to Alumni", () => {
  assert.deepEqual(accountRoleOptions("alumni"), ["national_board_member", "national_committee_member"]);
  assert.deepEqual(assignableAccountRoles(["national_board_member"], "alumni"), ["national_committee_member"]);
  for (const role of ["regional_board_member", "regional_committee_member", "support", "vip", "active_member", "admin", "super_admin", "alumni"]) {
    assert.equal(assignableAccountRoles(["national_board_member"], "alumni").includes(role), false);
  }
});
test("legacy assignments render as canonical names and do not duplicate", () => {
  assert.deepEqual(normalizeRoleNames(["member", "board_member", "regional_board_member", "committee_member", "society_board_member"]),
    ["member", "regional_board_member", "regional_committee_member", "national_board_member"]);
  assert.deepEqual(assignedEditableRoles(["alumni", "society_board_member", "board_member", "admin"], "alumni", ["super_admin"]), ["national_board_member", "admin"]);
});
test("only super admins may assign admin roles", () => {
  assert.deepEqual(protectedAccountRoles(["alumni", "admin", "super_admin"]), ["admin", "super_admin"]);
  for (const type of ["member", "alumni"]) {
    assert.equal(assignableAccountRoles(["admin"], type).includes("admin"), false);
    assert.equal(assignableAccountRoles(["super_admin"], type).includes("admin"), true);
  }
});
test("page guards and dashboard cards preserve renamed role permissions", async () => {
  const source = await readFile(new URL("../src/util/defines/common.js", import.meta.url), "utf8");
  const block = source.slice(source.indexOf("// member roles"), source.indexOf("// A billing hold"));
  const frontend = await import(`data:text/javascript,${encodeURIComponent(block)}`);
  const expected = { events: frontend.ACCESS_4, members: frontend.MEMBER_ADMIN_ACCESS, internships: frontend.ACCESS_2,
    "monthly-summary": [...frontend.ACCESS_2, frontend.NATIONAL_COMMITTEE_MEMBER], support: frontend.SUPPORT_ACCESS,
    monitoring: frontend.MONITORING_ACCESS };
  for (const area of administrationAreas) assert.deepEqual([...area.roles].sort(), [...expected[area.id]].sort());
  for (const access of ["ACCESS_1", "ACCESS_2", "ACCESS_3"]) assert.equal(frontend[access].includes("national_committee_member"), false);
  for (const access of ["ACCESS_4", "ALL_EVENT_REGIONS_ACCESS", "MEMBER_ADMIN_ACCESS", "ALL_MEMBER_REGIONS_ACCESS", "EVENT_MANAGEMENT_ACCESS"]) assert.equal(frontend[access].includes("national_committee_member"), true);
  for (const [oldRole, newRole] of [["board_member", "regional_board_member"], ["committee_member", "regional_committee_member"], ["society_board_member", "national_board_member"]]) {
    for (const access of ["ACCESS_1", "ACCESS_2", "ACCESS_3", "ACCESS_4"]) assert.equal(frontend[access].includes(oldRole), frontend[access].includes(newRole));
  }
});


test("VIP can be assigned by administrators and stays read-only to boards", () => {
  for (const type of ["member", "alumni"]) {
    assert.equal(assignableAccountRoles(["admin"], type).includes("vip"), true);
    assert.equal(assignableAccountRoles(["national_board_member"], type).includes("vip"), false);
  }
  assert.deepEqual(protectedAccountRoles(["member", "vip"]), ["vip"]);
  assert.deepEqual(assignedEditableRoles(["member", "vip", "board_member"], "member", ["regional_board_member"]), ["regional_board_member"]);
});


test("protected account editing follows the administrator hierarchy", () => {
  for (const type of ["member", "alumni"]) for (const role of ["admin", "super_admin", "vip", "developer"]) {
    for (const actorRole of ["admin", "national_board_member", "regional_board_member", "board_member", "support"]) {
      assert.equal(canEditAccount([actorRole], [type, role]), actorRole === "admin" && ["vip", "developer"].includes(role));
    }
    assert.equal(canEditAccount(undefined, [type, role]), false);
    assert.equal(canEditAccount(["super_admin"], [type, role]), true);
  }
  assert.equal(canEditAccount(["admin"], ["member"]), true);
  assert.equal(canEditAccount(["regional_board_member"], ["alumni", "national_committee_member"]), true);
});

test("role picker shows only roles the actor may assign and retains others", () => {
  assert.deepEqual(assignableAccountRoles(["regional_board_member"], "member"), ["regional_board_member", "regional_committee_member"]);
  assert.deepEqual(assignableAccountRoles(["national_board_member"], "member"), ["regional_board_member", "national_committee_member"]);
  assert.deepEqual(assignableAccountRoles(["national_board_member"], "alumni"), ["national_committee_member"]);
  assert.deepEqual(assignableAccountRoles(["regional_committee_member"], "member"), []);
  for (const role of ["vip", "support", "developer"]) assert.ok(assignableAccountRoles(["admin"], "member").includes(role));
  assert.ok(!assignableAccountRoles(["admin"], "member").includes("admin"));
  assert.ok(assignableAccountRoles(["super_admin"], "member").includes("admin"));
  assert.deepEqual(assignedEditableRoles(["member", "active_member", "regional_board_member"], "member", ["regional_board_member"]), ["regional_board_member"]);
  assert.deepEqual(readOnlyAccountRoles(["member", "active_member", "regional_board_member"], "member", ["regional_board_member"]), ["active_member"]);
});


test("Alumni directory is limited to national board and administrators", () => {
  for (const role of ["regional_board_member", "board_member", "national_committee_member"]) {
    assert.equal(canManageAccountType([role], "alumni"), false);
    assert.equal(canManageAccountType([role], "member"), true);
  }
  for (const role of ["admin", "super_admin", "national_board_member", "society_board_member"]) assert.equal(canManageAccountType([role], "alumni"), true);
});
