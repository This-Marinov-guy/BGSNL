"use client";

import { useCallback, useRef, useState } from "react";
import PropTypes from "prop-types";
import { useHttpClient } from "@/hooks/common/http-hook";
import { hasBillingReference, hasSubscriptionId } from "@/elements/subscriptions/subscription-checkout.mjs";
import AppModal from "@/elements/ui/modals/AppModal";

export default function SubscriptionManage({ canCancel = true, subscription }) {
  const { sendRequest } = useHttpClient();
  const [pending, setPending] = useState(null);
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [error, setError] = useState("");
  const inFlight = useRef(false);
  const showCancel = canCancel && hasSubscriptionId(subscription);
  const closeConfirmation = useCallback(() => {
    if (!inFlight.current) { setConfirmCancel(false); setError(""); }
  }, []);
  const openPortal = async (action) => {
    if (inFlight.current || (action === "cancel" && (!showCancel || !confirmCancel))) return;
    inFlight.current = true;
    setPending(action || "manage");
    setError("");
    try {
      const response = await sendRequest("payment/subscription/customer-portal", "POST", {
        url: window.location.href, ...(action ? { action } : {}),
      }, {}, false, false);
      const url = new URL(response?.url);
      if (url.protocol !== "https:" || url.hostname !== "billing.stripe.com" || url.username || url.password || url.port) throw new Error("Invalid billing destination");
      window.location.assign(url.href);
    } catch {
      setError("We could not open billing. No cancellation was made here. Please try again.");
    } finally { inFlight.current = false; setPending(null); }
  };
  if (!hasBillingReference(subscription)) return null;
  return (
    <>
    <div className="subscription-actions" aria-busy={!!pending}>
      <button className="settings-action rn-button-style--2 rn-btn-reverse-green rn-btn-small"
        onClick={() => openPortal()} disabled={!!pending} type="button">
        {pending === "manage" ? "Opening billing…" : "Manage billing"}
      </button>
      {showCancel && <button className="settings-action rn-button-style--2 rn-btn-reverse-red rn-btn-small"
        onClick={() => { setError(""); setConfirmCancel(true); }} disabled={!!pending} type="button" aria-haspopup="dialog">
        Cancel subscription
      </button>}
    </div>
    {error && !confirmCancel && <p role="alert">{error}</p>}
    <AppModal open={confirmCancel && showCancel} onClose={closeConfirmation} title="Cancel your subscription?"
      closable={!pending} dismissableMask={!pending}
      actions={<>
        <button className="rn-button-style--2 rn-btn-reverse-green rn-btn-small" type="button" disabled={!!pending} onClick={closeConfirmation}>Keep subscription</button>
        <button className="rn-button-style--2 rn-btn-reverse-red rn-btn-small" type="button" disabled={!!pending} onClick={() => openPortal("cancel")}>
          {pending === "cancel" ? "Opening cancellation…" : "Continue to Stripe"}
        </button>
      </>}>
      <p>You will review the cancellation date and confirm in Stripe. Your subscription will not change until you confirm there.</p>
      <p>Cancelling does not settle outstanding invoices or restore locked membership benefits.</p>
      {error && <p role="alert">{error}</p>}
    </AppModal>
    </>
  );
}
SubscriptionManage.propTypes = { canCancel: PropTypes.bool, subscription: PropTypes.object };
