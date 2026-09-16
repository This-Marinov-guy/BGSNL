"use client";

import { useCallback, useRef, useState } from "react";
import PropTypes from "prop-types";
import { useSearchParams } from "next/navigation";
import AppModal from "@/elements/ui/modals/AppModal";
import { useHttpClient } from "@/hooks/common/http-hook";
import { SubscriptionCheckoutForm } from "./SubscriptionStart";
import { requestSubscriptionCheckout } from "./subscription-checkout.mjs";

// A transfer link carries only a suggested type. All data and billing actions
// still use the account owner's authenticated session and existing checkout API.
export default function MembershipTransferPrompt({ user }) {
  const query = useSearchParams();
  const requestedType = query.get("transferTo");
  const targetType = ["member", "alumni"].includes(requestedType) ? requestedType : null;
  const [closed, setClosed] = useState(false);
  const [pending, setPending] = useState(false);
  const [guideOpen, setGuideOpen] = useState(false);
  const pendingRef = useRef(false);
  const { sendRequest } = useHttpClient();
  const request = useRef(sendRequest);
  request.current = sendRequest;
  const updatePending = useCallback(value => { pendingRef.current = value; setPending(value); }, []);
  const close = useCallback(() => {
    if (pendingRef.current) return;
    setClosed(true);
    const url = new URL(window.location.href);
    url.searchParams.delete("transferTo");
    window.history.replaceState(null, "", `${url.pathname}${url.search}${url.hash}`);
  }, []);
  const loadPlans = useCallback(async () => {
    const response = await request.current("payment/subscription/plans", "GET", null, {}, false, false);
    return response?.plans;
  }, []);
  const checkout = useCallback(async priceId => {
    window.location.assign(await requestSubscriptionCheckout(request.current, priceId, window.location.origin));
  }, []);
  if (!targetType || closed) return null;
  const currentType = user.roles?.includes("alumni") ? "alumni" : "member";
  const allowed = ["active", "locked", "payment_awaiting"].includes(user.status);
  return <AppModal open title={`Transfer to ${targetType === "alumni" ? "Alumni" : "Member"}`} onClose={close}
    closable={!pending && !guideOpen} dismissableMask={!pending && !guideOpen} suspended={guideOpen}>
    <p>You are signed in as <strong>{user.email}</strong>. Review your new plan before confirming a transfer.</p>
    {!allowed ? <p>This account is restricted. Contact support before changing membership.</p> : currentType === targetType ?
      <p>Your account is already on the requested membership type.</p> :
      <SubscriptionCheckoutForm initialType={targetType} loadPlans={loadPlans} onCheckout={checkout} onPendingChange={updatePending} onMembershipGuideChange={setGuideOpen} />}
  </AppModal>;
}
MembershipTransferPrompt.propTypes = { user: PropTypes.object.isRequired };
