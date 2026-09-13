const protectedRoles = new Set(["admin", "super_admin"]);
const accountTypes = new Set(["member", "alumni"]);

export const isEditableAccountRole = (role) =>
  typeof role === "string" && !accountTypes.has(role) && !protectedRoles.has(role);

export const protectedAccountRoles = (roles) =>
  Array.isArray(roles) ? roles.filter((role) => protectedRoles.has(role)) : [];
