import { getAccountStatusNotice } from "../../subscriptions/account-status-notice.mjs";

// Presentation only. The application endpoint independently checks the current
// account and its benefits before accepting files or submitting an application.
export function getInternshipApplyAccess(user) {
  if (!user) return { mode: "guest" };

  const statusNotice = getAccountStatusNotice(user);
  if (!statusNotice && user.status === "active" && user.hasBenefits === true) {
    return { mode: "apply" };
  }

  return {
    mode: "account",
    notice: statusNotice || {
      title: "Activate your membership",
      description: "Your account does not currently have membership benefits. Go to settings to review your subscription or start a Member or Alumni subscription before applying.",
      href: "/user#settings",
      actionLabel: "Go to settings",
    },
  };
}
