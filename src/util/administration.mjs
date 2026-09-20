const admins = ["super_admin", "admin", "national_board_member", "society_board_member"];
const board = [...admins, "regional_board_member", "board_member", "national_committee_member"];
export const administrationAreas = [
  { id: "events", title: "Events", description: "Create events, manage tickets and update event details.", roles: [...board, "regional_committee_member", "committee_member", "active_member"] },
  { id: "members", title: "Members", description: "Manage member and alumni accounts in your permitted regions.", roles: board },
  { id: "internships", title: "Internships", description: "Publish opportunities and manage internship listings.", roles: admins },
  { id: "support", title: "Support tickets", description: "Review reports and help members resolve their questions.", roles: ["super_admin", "admin", "support"] },
];
export const canAdminister = (area, roles = []) => area.roles.some((role) => roles.includes(role));
