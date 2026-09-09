// Presentation only: account status and benefit eligibility come from the API.
export function getAccountStatusNotice(user) {
  if (!user) return null;

  // Administrative restrictions take priority over payment/verification issues.
  if (user.status === "frozen") {
    return {
      title: "Your account is frozen",
      description: "We are investigating your account. Your membership benefits are unavailable while we review it. Please contact support if you need help.",
      href: "/user#help",
      actionLabel: "Contact support",
    };
  }

  if (user.status === "suspended") {
    return {
      title: "Your account is suspended",
      description: "Your account is suspended and we are going to close it. Please contact support for help.",
      href: "/user#help",
      actionLabel: "Contact support",
    };
  }

  if (user.billingVerificationUnavailable) {
    return {
      title: "We could not verify your subscription",
      description: "Billing is temporarily unavailable. Your profile and settings are still accessible, but benefits cannot be used until we verify your subscription. Please try again shortly.",
      href: "/user#settings",
      actionLabel: "Go to settings",
    };
  }

  if (!user.billingLocked && !["locked", "payment_awaiting"].includes(user.status)) {
    if (!user.status || user.status === "active") return null;

    return {
      title: "Your account is restricted",
      description: "Your membership benefits are unavailable while your account is restricted.",
      href: "/user#help",
      actionLabel: "Contact support",
    };
  }

  return {
    title: "Your membership is locked",
    description: "Your subscription needs attention. Go to settings, change your payment method, subscription type or cancel your membership.",
    href: "/user#settings",
    actionLabel: "Go to settings",
    paymentNote: user.lockReason === "payment_failed"
      ? "Benefits return after payment is confirmed. Cancelling does not restore paid benefits or automatically settle an outstanding invoice."
      : null,
  };
}
