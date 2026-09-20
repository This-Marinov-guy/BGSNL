import moment from "moment";

const csvCell = (value) => `"${String(value ?? "").replace(/"/g, '""')}"`;

const ageBand = (birth) => {
  if (!birth || !moment(birth).isValid()) return "Not provided";
  const age = moment().diff(moment(birth), "years");
  if (age < 18) return "Under 18";
  if (age < 25) return "18–24";
  if (age < 35) return "25–34";
  if (age < 45) return "35–44";
  return "45+";
};

const educationStatus = (member) => {
  if (member.university === "working" || member.profession) return "Working";
  if (member.university) return "Student";
  return "Not provided";
};

const downloadCsv = (headers, rows, filename) => {
  const csvContent = [
    headers.map(csvCell).join(","),
    ...rows.map((row) => row.map(csvCell).join(",")),
  ].join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
};

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

  downloadCsv(headers, rows, `members_report_${moment().format("YYYY-MM-DD")}.csv`);
};

// This export is deliberately aggregate-ready: it contains no name, email,
// phone number or student number, so regional teams can analyse demographics
// without creating an additional personal-data report.
export const exportMemberDemographicsCSV = (members) => {
  if (!members || members.length === 0) return;

  const headers = [
    "Region",
    "Membership status",
    "Age band",
    "Student or working",
    "University",
    "Study programme",
    "Graduation year",
    "Profession",
    "Membership started",
  ];
  const rows = members.map((member) => [
    member.region?.replace(/_/g, " ") || "Not assigned",
    member.isPaid ? "Active" : "Inactive",
    ageBand(member.birth),
    educationStatus(member),
    member.university === "other" ? member.otherUniversityName || "Other" : member.university || "Not provided",
    member.course || "Not provided",
    member.graduationDate || "Not provided",
    member.profession || "Not provided",
    member.startDate ? moment(member.startDate).format("YYYY-MM") : "Not provided",
  ]);
  downloadCsv(headers, rows, `member_demographics_${moment().format("YYYY-MM-DD")}.csv`);
};
