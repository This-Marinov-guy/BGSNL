const DATE_ONLY = /^(\d{4})-(\d{2})-(\d{2})$/;

const dateParts = (value, timeZone) => {
  if (typeof value === "string") {
    const match = DATE_ONLY.exec(value);
    if (match) {
      const [, year, month, day] = match;
      const parsed = new Date(`${value}T00:00:00.000Z`);
      const valid = Number.isFinite(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
      return valid ? { day, month, year } : null;
    }
  }
  if (value == null || value === "") return null;
  const date = value instanceof Date ? value : new Date(value);
  if (!Number.isFinite(date.getTime())) return null;
  return Object.fromEntries(new globalThis.Intl.DateTimeFormat("en-GB", {
    day: "2-digit", month: "2-digit", year: "numeric", timeZone,
  }).formatToParts(date).map(({ type, value: part }) => [type, part]));
};

export const formatDisplayDate = (value, timeZone = "Europe/Amsterdam") => {
  const parts = dateParts(value, timeZone);
  return parts ? `${parts.day}-${parts.month}-${parts.year}` : "";
};

export const formatDisplayDateTime = (value, timeZone = "Europe/Amsterdam") => {
  const day = formatDisplayDate(value, timeZone);
  if (!day) return "";
  const date = value instanceof Date ? value : new Date(value);
  if (!Number.isFinite(date.getTime())) return day;
  const time = new globalThis.Intl.DateTimeFormat("en-GB", {
    hour: "2-digit", minute: "2-digit", hourCycle: "h23", timeZone,
  }).format(date);
  return `${day} ${time}`;
};
