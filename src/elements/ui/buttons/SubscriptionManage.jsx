"use client";

import { useCallback, useRef, useState } from "react";
import PropTypes from "prop-types";
import { useHttpClient } from "@/hooks/common/http-hook";
import { canSwitchSubscription, hasBillingReference, hasCustomerId, hasEndedSubscription, hasScheduledCancellation, hasSubscriptionId, requestSubscriptionCheckout } from "@/elements/subscriptions/subscription-checkout.mjs";
import { SubscriptionCheckoutForm } from "@/elements/subscriptions/SubscriptionStart";
import AppModal from "@/elements/ui/modals/AppModal";

export default function SubscriptionManage({ canCancel = true, portalOnly = false, portalLabel = "Payments", hideSwitch = false, switchOnly = false, subscription, user }) {
  const { sendRequest } = useHttpClient();
  const request = useRef(sendRequest);
  request.current = sendRequest;
  const [pending, setPending] = useState(null);
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [switchOpen, setSwitchOpen] = useState(false);
  const [guideOpen, setGuideOpen] = useState(false);
  const [error, setError] = useState("");
  const inFlight = useRef(false);
  const showCancel = !switchOnly && !portalOnly && canCancel && hasSubscriptionId(subscription) && !hasEndedSubscription(subscription) && !hasScheduledCancellation(subscription);
  const showSwitch = !hideSwitch && !portalOnly && hasSubscriptionId(subscription) && !hasEndedSubscription(subscription);
  const showPayments = !switchOnly && hasCustomerId(subscription);
  const canSwitch = canSwitchSubscription(user);
  const closeConfirmation = useCallback(() => {
    if (!inFlight.current) { setConfirmCancel(false); setError(""); }
  }, []);
  const closeSwitch = useCallback(() => { if (!inFlight.current) setSwitchOpen(false); }, []);
  const updateSwitchPending = useCallback(value => {
    inFlight.current = value;
    setPending(value ? "switch" : null);
  }, []);
  const loadPlans = useCallback(async () => {
    const response = await request.current("payment/subscription/plans", "GET", null, {}, false, false);
    return response?.plans;
  }, []);
  const loadQuote = useCallback(async priceId => {
    const response = await request.current("payment/subscription/preview", "POST", { itemId: priceId, origin_url: window.location.origin }, {}, false, false);
    return response?.quote;
  }, []);
  const switchPlan = useCallback(async (priceId, region) => {
    const url = await requestSubscriptionCheckout(request.current, priceId, window.location.origin, region);
    if (url) window.location.assign(url);
    else window.location.reload();
  }, []);
  const openPortal = async (action) => {
    if (inFlight.current || (action === "cancel" && (!showCancel || !confirmCancel))) return;
    if (action !== "cancel" && !showPayments) return;
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
      setError(action === "cancel" ? "We could not open cancellation. Your subscription has not changed. Please try again." : "We could not open payments. Please try again.");
    } finally { inFlight.current = false; setPending(null); }
  };
  if (!hasBillingReference(subscription)) return null;
  return (
    <>
    <div className="subscription-actions" aria-busy={!!pending}>
      {showCancel && <button className="settings-action rn-button-style--2 rn-btn-reverse-red rn-btn-small"
        onClick={() => { setError(""); setConfirmCancel(true); }} disabled={!!pending} type="button" aria-haspopup="dialog">
        Cancel
      </button>}
      {showSwitch && <button className="settings-action rn-button-style--2 rn-btn-reverse-green rn-btn-small"
        onClick={() => { setError(""); setSwitchOpen(true); }} disabled={!!pending} type="button" aria-haspopup="dialog">
        Switch
      </button>}
      {showPayments && <button className="settings-action rn-button-style--2 rn-btn-reverse-green rn-btn-small"
        onClick={() => openPortal()} disabled={!!pending} type="button">
        {pending === "manage" ? "Opening payments…" : portalLabel}
      </button>}
    </div>
    {!portalOnly && !hideSwitch && subscription.scheduledChange && <p role="status">Your change to Alumni Tier {subscription.scheduledChange.tier} is scheduled for your next billing date. You keep your current tier and benefits until then.</p>}
    {error && !confirmCancel && <p role="alert">{error}</p>}
    <AppModal open={switchOpen && showSwitch} onClose={closeSwitch} title="Switch subscription"
      closable={!pending && !guideOpen} dismissableMask={!pending && !guideOpen} suspended={guideOpen}>
      {switchOpen && (canSwitch ? <SubscriptionCheckoutForm initialType={user?.isAlumni || user?.roles?.includes("alumni") ? "alumni" : "member"}
        initialRegion={user?.region} currentPriceId={subscription.priceId} currentTier={user?.tier} loadPlans={loadPlans} loadQuote={loadQuote} onCheckout={switchPlan}
        onPendingChange={updateSwitchPending} onMembershipGuideChange={setGuideOpen} /> :
        <p>{subscription.scheduledChange ? "Your Alumni downgrade is already scheduled for your next billing date. Contact support if you need to change this request." : "Resolve any payment issue, pending change or scheduled cancellation in Payments before switching. If billing cannot be verified, try again shortly or contact support."}</p>)}
    </AppModal>
    <AppModal open={confirmCancel && showCancel} onClose={closeConfirmation} title="Cancel your subscription?"
      closable={!pending} dismissableMask={!pending}
      actions={<>
        <button className="rn-button-style--2 rn-btn-reverse-green rn-btn-small" type="button" disabled={!!pending} onClick={closeConfirmation}>Keep subscription</button>
        <button className="rn-button-style--2 rn-btn-reverse-red rn-btn-small" type="button" disabled={!!pending} onClick={() => openPortal("cancel")}>
          {pending === "cancel" ? "Opening cancellation…" : "Review cancellation"}
        </button>
      </>}>
      <p>Review the cancellation date on our secure billing page. Your subscription will not change until you confirm.</p>
      <p>Cancelling does not settle outstanding invoices or restore locked membership benefits.</p>
      {error && <p role="alert">{error}</p>}
    </AppModal>
    </>
  );
}
SubscriptionManage.propTypes = { canCancel: PropTypes.bool, portalOnly: PropTypes.bool, portalLabel: PropTypes.string, hideSwitch: PropTypes.bool, switchOnly: PropTypes.bool, subscription: PropTypes.object, user: PropTypes.object };
