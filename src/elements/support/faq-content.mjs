import { administrationAreas } from "../../util/administration.mjs";
import { normalizeRoleNames, NATIONAL_ACCOUNT_ROLES } from "../../util/account-roles.mjs";
import { accountRouteState } from "../../util/functions/account-route-state.mjs";

// Display guidance only, never an authorization boundary. Private operations
// remain protected by their existing page/API checks. Keep FAQ copy and its
// visibility rules together here; do not put confidential information here.
export const FAQ_SECTIONS = [
  { id: "events", label: "Events", questions: [
    { id: "find-events", question: "Where can I find upcoming events?", answer: "Open Future Events to browse upcoming gatherings. A regional page shows events from that region.", link: { href: "/events/future-events", label: "Browse future events" } },
    { id: "event-tickets", question: "Where do I find my tickets?", answer: "Open Tickets in your account to view your event tickets. If this section is locked, check your membership status in Settings.", link: { href: "/user#tickets", label: "Open Tickets" } },
    { id: "manage-events", access: "events", question: "Where can I manage events and scan tickets?", answer: "Open Manage Events in Administration to work with the events available to your role. Ticket Scanner is a separate tool where you can select an event and scan ticket QR codes.", link: { href: "/user/dashboard/events", label: "Manage events" } },
    { id: "regional-events", access: "events", scope: "regional", question: "Why can I only manage events in my region?", answer: "Regional event access is limited to your assigned region. Contact the team if your assigned region or role needs correcting." },
    { id: "national-events", access: "events", scope: "national", question: "Can I manage events across regions?", answer: "Your national event permissions allow access across regions. Use the region filters in Manage Events to narrow the list.", link: { href: "/user/dashboard/events", label: "Open event administration" } },
  ] },
  { id: "memberships", label: "Memberships", questions: [
    { id: "membership-settings", question: "Where can I manage my membership?", answer: "Go to Settings and find Membership. The available billing actions depend on your current membership and account status.", link: { href: "/user#settings", label: "Open Settings" } },
    { id: "membership-card", question: "Where is my membership card?", answer: "Your card is available in Profile and Settings when your account is eligible. You can open or share it, and add it to a supported wallet when that option is available.", link: { href: "/user#profile", label: "Open Profile" } },
    { id: "alumni-card", audience: "alumni", question: "Where do I find my alumni card?", answer: "The card panel in Profile or Settings shows your alumni card. If access is locked, review the membership notice in Settings first.", link: { href: "/user#profile", label: "View my card" } },
    { id: "manage-members", access: "members", question: "Where can I manage member and alumni accounts?", answer: "Open Manage Members in Administration. The profiles and actions available there follow your assigned role and regional access.", link: { href: "/user/dashboard/members", label: "Manage members" } },
  ] },
  { id: "payments", label: "Payments", questions: [
    { id: "billing-settings", question: "How do I manage billing or payment methods?", answer: "Open Settings, then Membership → Billing. Use the billing actions available for your account to manage payment methods or your subscription.", link: { href: "/user#settings", label: "Open billing settings" } },
    { id: "payment-help", question: "What should I do if a payment needs attention?", answer: "Check the notice in Settings and follow its instructions. If you still need help, create a support report below and describe the issue. Do not include card numbers, passwords or security codes." },
  ] },
  { id: "access", label: "Access", questions: [
    { id: "locked-features", question: "Why are some account features locked?", answer: "Feature availability depends on your membership, account status and assigned roles. Check Settings for any membership or billing notice. Contact support if you believe your access is incorrect.", link: { href: "/user#settings", label: "Check account settings" } },
    { id: "profile-details", question: "How do I update my profile details?", answer: "Open Settings → Profile information → Edit profile to update your personal details, contact information and profile photo.", link: { href: "/user#settings", label: "Open Settings" } },
  ] },
  { id: "support", label: "Support tickets", questions: [
    { id: "new-report", question: "How do I report a problem or suggest an improvement?", answer: "Use Report a problem or Recommend improvement above your ticket list. Explain what happened and include relevant details so the team can help." },
    { id: "support-replies", question: "Where can I read replies to my report?", answer: "Return to Help and open the report in your ticket list. You can read replies and continue the conversation there." },
    { id: "support-inbox", access: "support", question: "Where can I respond to support tickets?", answer: "Open Support Tickets in Administration. Select a conversation to reply and update its status. This inbox is available to support staff and administrators.", link: { href: "/user/dashboard/support", label: "Open support inbox" } },
  ] },
  { id: "terms", label: "Terms", questions: [
    { id: "read-terms", question: "Where can I read the society’s terms and policies?", answer: "Use the Terms and policy page for the published terms and policies. Refer to that page for the full wording.", link: { href: "/terms-and-legals", label: "Read terms and policies" } },
    { id: "terms-question", question: "Who can help with a question about the terms?", answer: "Create a support report below and tell us which part of the terms you need help understanding." },
  ] },
];

export const normalizeFaqSearch = value => String(value ?? "").toLocaleLowerCase().replace(/\s+/g, "");

export function searchFaqSections(user, query, sections = FAQ_SECTIONS) {
  const normalized = normalizeFaqSearch(query);
  // Apply access rules before searching so hidden answers never affect results.
  return getFaqSections(user, sections).map(section => ({ ...section,
    questions: section.questions.filter(item => normalizeFaqSearch(`${section.label} ${item.question} ${item.answer}`).includes(normalized)),
  })).filter(section => section.questions.length > 0);
}

export function getFaqSections(user, sections = FAQ_SECTIONS) {
  const roles = normalizeRoleNames(user?.roles);
  const currentUser = { ...user, roles };
  const national = roles.some(role => ["admin", "super_admin", ...NATIONAL_ACCOUNT_ROLES].includes(role));
  return sections.map(section => ({ ...section, questions: section.questions.filter(item => {
    if (item.audience && (item.audience !== "alumni" || !roles.includes("alumni"))) return false;
    if (item.access) {
      const area = administrationAreas.find(area => area.id === item.access);
      if (!area || accountRouteState(currentUser, area.roles, `/user/dashboard/${area.id}`) !== "allowed") return false;
    }
    if (item.scope === "national" && !national) return false;
    if (item.scope === "regional" && national) return false;
    return true;
  }) }));
}
