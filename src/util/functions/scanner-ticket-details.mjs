import { formatDisplayDateTime } from "./display-date.mjs";

const textValue = value => typeof value === "string" && value.trim() && value.trim() !== "-"
  ? value.trim() : "";

const answerValue = value => {
  if (Array.isArray(value)) return value.map(answerValue).filter(Boolean).join(", ");
  if (typeof value === "string") {
    const answer = value.trim();
    return answer && !["-", "{}", "[]", "null", "undefined"].includes(answer.toLowerCase()) ? answer : "";
  }
  if (typeof value === "number") return Number.isFinite(value) ? String(value) : "";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  return "";
};

const preferenceRows = value => {
  let preferences = value;
  if (typeof preferences === "string") {
    try { preferences = JSON.parse(preferences); }
    catch { return []; }
  }
  if (!preferences || typeof preferences !== "object" || Array.isArray(preferences)) return [];
  return Object.entries(preferences).flatMap(([key, answer]) => {
    const label = textValue(key);
    const formatted = answerValue(answer);
    return label && !/^\d+$/.test(label) && !["fixture", "pricingTier"].includes(label) && formatted
      ? [{ label, value: formatted }] : [];
  });
};

export function scannerTicketDetailRows(guest) {
  if (!guest || typeof guest !== "object") return [];
  const type = textValue(guest.type).replaceAll("_", " ");
  const addOns = Array.isArray(guest.addOns)
    ? guest.addOns.map(item => textValue(item?.title)).filter(Boolean).join(", ") : "";
  const rows = [
    ["Name", textValue(guest.name)],
    ["Email", textValue(guest.email)],
    ["Phone", textValue(guest.phone)],
    ["Type", type ? type.charAt(0).toUpperCase() + type.slice(1) : ""],
    ["Purchased", formatDisplayDateTime(guest.timestamp)],
    ["Transaction ID", textValue(guest.transactionId)],
    ["Add-ons", addOns],
  ];
  return [...rows.filter(([, value]) => value).map(([label, value]) => ({ label, value })),
    ...preferenceRows(guest.preferences)];
}
