"use client";

import { useState } from "react";
import PropTypes from "prop-types";
import { useHttpClient } from "@/hooks/common/http-hook";
import { hasBillingReference } from "@/elements/subscriptions/subscription-checkout.mjs";

export default function SubscriptionManage({ canCancel = true, subscription }) {
  const { sendRequest } = useHttpClient();
  const [pending, setPending] = useState(null);
  const openPortal = async (action) => {
    if (pending) return;
    setPending(action || "manage");
    try {
      const response = await sendRequest("payment/subscription/customer-portal", "POST", {
        url: window.location.href, ...(action ? { action } : {}),
      });
      if (response?.url) window.location.assign(response.url);
    } finally { setPending(null); }
  };
  if (!hasBillingReference(subscription)) return null;
  return (
    <div className="subscription-actions" aria-busy={!!pending}>
      <button className="settings-action rn-button-style--2 rn-btn-reverse-green rn-btn-small"
        onClick={() => openPortal()} disabled={!!pending} type="button">
        {pending === "manage" ? "Opening billing…" : "Manage billing"}
      </button>
      {canCancel && <button className="settings-action rn-button-style--2 rn-btn-reverse-red rn-btn-small"
        onClick={() => openPortal("cancel")} disabled={!!pending} type="button">
        {pending === "cancel" ? "Opening billing…" : "Cancel subscription"}
      </button>}
    </div>
  );
}
SubscriptionManage.propTypes = { canCancel: PropTypes.bool, subscription: PropTypes.object };
