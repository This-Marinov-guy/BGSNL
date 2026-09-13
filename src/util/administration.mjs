const admins = ["super_admin", "admin", "society_board_member"];
const board = [...admins, "board_member"];
export const administrationAreas = [
  { id: "events", title: "Events", description: "Create events, manage tickets and update event details.", roles: [...board, "committee_member", "active_member"] },
  { id: "internships", title: "Internships", description: "Publish opportunities and manage internship listings.", roles: admins },
  { id: "members", title: "Members", description: "Manage member and alumni accounts in your permitted regions.", roles: board },
  { id: "support", title: "Support tickets", description: "Review reports and help members resolve their questions.", roles: ["super_admin", "admin", "support"] },
  { id: "event-analytics", title: "Event analytics", description: "Review ticket sales, attendance and event revenue.", roles: board },
  { id: "member-statistics", title: "Member statistics", description: "View membership totals and regional reports.", roles: board },
];
export const canAdminister = (area, roles = []) => area.roles.some((role) => roles.includes(role));
