import moment from "moment";

export const exportEventsCSV = (events) => {
  if (!events || events.length === 0) return;

  const headers = [
    "Event Name",
    "Region",
    "Date",
    "Location",
    "Ticket Cost",
    "Tickets Sold",
    "Ticket Limit",
    "Attended",
    "Presence %",
    "Revenue (€)",
    "Status",
  ];

  const rows = events.map((e) => [
    e.title,
    e.region?.replace(/_/g, " ") || "",
    moment(e.date).format("DD/MM/YYYY HH:mm"),
    e.location || "",
    e.ticketCost,
    e.totalTickets,
    e.ticketLimit,
    e.attended,
    `${e.presence}%`,
    e.revenue,
    e.status,
  ]);

  const csvContent = [
    headers.join(","),
    ...rows.map((row) =>
      row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")
    ),
  ].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `events_analytics_${moment().format("YYYY-MM-DD")}.csv`;
  link.click();
  URL.revokeObjectURL(url);
};
