import { accountRoleOptions, normalizeRoleNames } from "../../util/account-roles.mjs";
const protectedRoles = new Set(["admin", "super_admin", "developer", "vip"]);
const privilegedRoles = ["vip", "support", "developer"];

export const assignableAccountRoles = (actorRoles, type) => {
  const roles = normalizeRoleNames(actorRoles);
  if (roles.includes("super_admin")) return [...new Set([...accountRoleOptions(type), ...privilegedRoles, "admin", "super_admin"])];
  if (roles.includes("admin")) return [...new Set([...accountRoleOptions(type), ...privilegedRoles])];
  if (roles.includes("national_board_member")) return type === "alumni"
    ? ["national_committee_member"] : ["regional_board_member", "national_committee_member"];
  if (roles.includes("regional_board_member")) return type === "member"
    ? ["regional_board_member", "regional_committee_member"] : [];
  return [];
};

export const assignedEditableRoles = (roles, type, actorRoles) => {
  const allowed = new Set(assignableAccountRoles(actorRoles, type));
  return normalizeRoleNames(roles).filter(role => allowed.has(role));
};

export const readOnlyAccountRoles = (roles, type, actorRoles) => {
  const allowed = new Set(assignableAccountRoles(actorRoles, type));
  return normalizeRoleNames(roles).filter(role => role !== type && !allowed.has(role));
};

export const protectedAccountRoles = (roles) =>
  Array.isArray(roles) ? roles.filter(role => protectedRoles.has(role)) : [];

// Other page/region guards still apply; this protects the target account.
export const canEditAccount = (actorRoles, targetRoles) =>
  normalizeRoleNames(actorRoles).includes("super_admin") ||
  (!normalizeRoleNames(targetRoles).some(role => ["admin", "super_admin"].includes(role)) &&
    (normalizeRoleNames(actorRoles).includes("admin") ||
      !normalizeRoleNames(targetRoles).some(role => ["developer", "vip"].includes(role))));

export const canManageAccountType = (actorRoles, type) => type !== "alumni" ||
  normalizeRoleNames(actorRoles).some(role => ["super_admin", "admin", "national_board_member"].includes(role));
