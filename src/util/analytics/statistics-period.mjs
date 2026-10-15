const AMSTERDAM = "Europe/Amsterdam";
const DAY_FORMAT = new globalThis.Intl.DateTimeFormat("en-GB", {
  timeZone: AMSTERDAM,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

const localParts = (value) => {
  const parts = Object.fromEntries(DAY_FORMAT.formatToParts(value).map(({ type, value: part }) => [type, part]));
  return { year: Number(parts.year), month: Number(parts.month), day: Number(parts.day) };
};

const pad = (value) => String(value).padStart(2, "0");
export const dayKey = (value) => {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const { year, month, day } = localParts(date);
  return `${year}-${pad(month)}-${pad(day)}`;
};

export const validDayKey = (value) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value || "")) return false;
  const date = new Date(`${value}T12:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
};

export const academicYearToDate = (today = new Date()) => {
  const { year, month, day } = localParts(today);
  const startYear = month > 8 || (month === 8 && day >= 25) ? year : year - 1;
  return { from: `${startYear}-08-25`, to: dayKey(today) };
};

export const monthBuckets = (from, to) => {
  if (!validDayKey(from) || !validDayKey(to) || from > to) return [];
  const [firstYear, firstMonth] = from.split("-").map(Number);
  const [lastYear, lastMonth] = to.split("-").map(Number);
  const buckets = [];
  for (let year = firstYear, month = firstMonth; year < lastYear || (year === lastYear && month <= lastMonth);) {
    buckets.push({
      key: `${year}-${pad(month)}`,
      label: new Date(Date.UTC(year, month - 1, 1)).toLocaleDateString("en-GB", { month: "short", year: "2-digit", timeZone: "UTC" }),
    });
    month += 1;
    if (month === 13) { year += 1; month = 1; }
  }
  return buckets;
};

export const inDateRange = (date, from, to) => {
  const key = dayKey(date);
  return Boolean(key && key >= from && key <= to);
};

export const eventRevenueByEvent = (events, from, to) => [...events]
  .filter(event => inDateRange(event.date, from, to))
  .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  .map((event) => {
    const title = event.title || "Untitled event";
    const revenue = Number(event.revenue) || 0;
    return {
      id: event._id,
      title,
      date: dayKey(event.date),
      label: title.length > 16 ? `${title.slice(0, 15)}…` : title,
      revenue: Math.round(revenue * 100) / 100,
    };
  });

export const eventGuestCapacity = (events) => [...events]
  .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  .map((event) => {
    const title = event.title || "Untitled event";
    const limit = Number(event.ticketLimit);
    return {
      id: event._id,
      title,
      date: dayKey(event.date),
      label: title.length > 16 ? `${title.slice(0, 15)}…` : title,
      guests: Number(event.totalGuests) || 0,
      limit: Number.isFinite(limit) && limit > 0 ? limit : null,
    };
  });

export const memberTimeline = (members, from, to) => {
  const buckets = monthBuckets(from, to).map((bucket) => ({ ...bucket, members: 0 }));
  const byMonth = new Map(buckets.map((bucket) => [bucket.key, bucket]));
  for (const member of members) {
    const key = dayKey(member.joinDate || member.startDate);
    if (key < from || key > to) continue;
    const bucket = byMonth.get(key.slice(0, 7));
    if (bucket) bucket.members += 1;
  }
  return buckets;
};
