const formulaPrefix = /^[=+\-@]/;

const safeCell = (value) => {
  const text = String(value ?? "");
  return formulaPrefix.test(text) ? `'${text}` : text;
};

const csvCell = (value) => `"${safeCell(value).replace(/"/g, '""')}"`;
const dateOnly = (value) => String(value || "").slice(0, 10);
const displayCity = (value) => String(value || "").replaceAll("_", " ");
const displayStatus = (value) => String(value || "").replaceAll("_", " ");
const displayRoles = (roles) => Array.isArray(roles) ? roles.map(displayStatus).join(", ") : "";

export function exportAccountsCsv(accounts, type) {
  if (!Array.isArray(accounts) || accounts.length === 0) return;

  const headers = [
    "First name", "Last name", "Email", "Phone", "City",
    "Date of birth", "Account type", "Account status", "Administrative roles",
    "Joined", "Purchase date", "Membership expiry", "Subscription period (months)",
    "University", "Other university", "Study programme", "Graduation year",
    "Student number", "Profession",
  ];
  const rows = accounts.map((account) => [
    account.name,
    account.surname,
    account.email,
    account.phone,
    displayCity(account.region),
    dateOnly(account.birth),
    account.type === "alumni" ? "Alumni" : "Member",
    displayStatus(account.status),
    displayRoles(account.roles),
    dateOnly(account.joinDate),
    dateOnly(account.purchaseDate),
    account.nonExpiring || account.roles?.includes("vip") ? "Non-expiring" : dateOnly(account.expireDate),
    account.subscription?.period,
    account.university,
    account.otherUniversityName,
    account.course,
    account.graduationDate,
    account.studentNumber,
    account.profession,
  ]);
  const csv = [headers, ...rows].map((row) => row.map(csvCell).join(",")).join("\r\n");
  const blob = new Blob(["\uFEFF", csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${type === "alumni" ? "alumni" : "members"}_directory_${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
