import { accountRoleOptions, normalizeRoleNames } from "../../util/account-roles.mjs";
const protectedRoles = new Set(["admin", "super_admin", "vip"]);

export const isEditableAccountRole = (role, type = "member") => accountRoleOptions(type).includes(role);
export const editableAccountRoles = (roles, type) => normalizeRoleNames(roles).filter(role => isEditableAccountRole(role, type));
export const protectedAccountRoles = (roles) =>
  Array.isArray(roles) ? roles.filter(role => protectedRoles.has(role)) : [];

// Other page/region guards still apply; this protects the target account.
export const canEditAccount = (actorRoles, targetRoles) =>
  normalizeRoleNames(actorRoles).includes("super_admin") ||
  protectedAccountRoles(targetRoles).length === 0;

export const canManageAccountType = (actorRoles, type) => type !== "alumni" ||
  normalizeRoleNames(actorRoles).some(role => ["super_admin", "admin", "national_board_member"].includes(role));
