const eventTime = event => {
  for (const value of [event.correctedDate, event.date]) {
    if (!value) continue;
    const time = new Date(value).getTime();
    if (Number.isFinite(time)) return time;
  }
  return Infinity;
};

export function sortFutureEvents(events, order = "date") {
  const text = (a, b) => String(a ?? "").localeCompare(String(b ?? ""), "en", { sensitivity: "base", numeric: true });
  return [...events].sort((a, b) => {
    if (order === "region") {
      const regionOrder = text(a.region, b.region);
      if (regionOrder) return regionOrder;
    }
    if (order === "name") {
      const nameOrder = text(a.title, b.title);
      if (nameOrder) return nameOrder;
    }
    const aTime = eventTime(a);
    const bTime = eventTime(b);
    return (aTime === bTime ? 0 : aTime < bTime ? -1 : 1) || text(a.title, b.title);
  });
}
