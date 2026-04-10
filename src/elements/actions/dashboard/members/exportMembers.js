import moment from "moment";

export const exportMembersCSV = (members) => {
  if (!members || members.length === 0) return;

  const headers = [
    "Name",
    "Surname",
    "Email",
    "Role",
    "Region",
    "Status",
    "Tickets",
    "Start Date",
    "Expire Date",
    "Has Subscription",
    "Next Billing",
  ];

  const rows = members.map((m) => [
    m.name,
    m.surname,
    m.email,
    m.role?.replace(/_/g, " ") || "",
    m.region?.replace(/_/g, " ") || "",
    m.isPaid ? "Active" : "Expired",
    m.ticketsCount,
    moment(m.startDate).format("DD/MM/YYYY"),
    moment(m.expireDate).format("DD/MM/YYYY"),
    m.hasSubscription ? "Yes" : "No",
    m.nextBilling ? moment(m.nextBilling).format("DD/MM/YYYY") : "-",
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
  link.download = `members_report_${moment().format("YYYY-MM-DD")}.csv`;
  link.click();
  URL.revokeObjectURL(url);
};
