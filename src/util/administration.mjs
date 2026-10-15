const admins = ["super_admin", "admin", "national_board_member", "society_board_member"];
const board = [...admins, "regional_board_member", "board_member", "national_committee_member"];
const dashboard = [...new Set([...board, "regional_committee_member", "committee_member", "active_member", "support", "developer"])];
export const administrationAreas = [
  { id: "event-statistics", title: "Event metrics", section: "metrics", description: "Review revenue, guests and event activity over time.", roles: dashboard },
  { id: "member-statistics", title: "Member metrics", section: "metrics", description: "Review membership totals, recurring revenue and joins over time.", roles: dashboard },
  { id: "events", title: "Events", description: "Create events, manage tickets and update event details.", roles: [...board, "regional_committee_member", "committee_member", "active_member"] },
  { id: "members", title: "Members", description: "Manage member and alumni accounts in your permitted regions.", roles: board },
  { id: "internships", title: "Internships", description: "Publish opportunities and manage internship listings.", roles: admins },
  { id: "support", title: "Support tickets", description: "Review reports and help members resolve their questions.", roles: ["super_admin", "admin", "support"] },
  { id: "monitoring", title: "System manager", description: "Review jobs, errors, traffic and service health.", roles: ["developer", "admin", "super_admin"] },
];
export const canAdminister = (area, roles = []) => area.roles.some((role) => roles.includes(role));
export const TREASURY_URL = "https://dashboard.bulgariansociety.nl/";

export const statisticsRedirectPath = (kind, params = {}) => {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (key === "view") continue;
    for (const item of Array.isArray(value) ? value : [value]) {
      if (typeof item === "string") query.append(key, item);
    }
  }
  const path = `/user/dashboard/metrics/${kind === "event" ? "events" : "members"}`;
  return query.size ? `${path}?${query}` : path;
};
