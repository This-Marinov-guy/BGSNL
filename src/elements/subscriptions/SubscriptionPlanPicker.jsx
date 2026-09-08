"use client";

import { useEffect, useId, useRef, useState } from "react";
import PropTypes from "prop-types";
import { useHttpClient } from "@/hooks/common/http-hook";
import styles from "./subscriptions.module.scss";
/* global Intl */

export default function SubscriptionPlanPicker({ user, alumniOnly = false }) {
  const { sendRequest } = useHttpClient();
  const request = useRef(sendRequest);
  request.current = sendRequest;
  const id = useId();
  const [plans, setPlans] = useState(null);
  const [selected, setSelected] = useState("");
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [pending, setPending] = useState(false);
  useEffect(() => {
    let mounted = true;
    setError(false);
    request.current("payment/subscription/plans", "GET", null, {}, false, false).then((response) => {
      if (!mounted) return;
      if (!response?.plans) { setError(true); return; }
      setPlans(response.plans.filter((plan) => !alumniOnly || plan.type === "alumni"));
    });
    return () => { mounted = false; };
  }, [alumniOnly, attempt]);

  const submit = async (event) => {
    event.preventDefault();
    if (!selected || pending) return;
    setPending(true);
    try {
      const response = await request.current("payment/subscription/change", "POST", {
        itemId: selected, origin_url: window.location.origin,
      });
      if (response?.url) window.location.assign(response.url);
    } finally { setPending(false); }
  };
  const blocked = user?.isSubscribed && (user?.billingLocked || user?.subscription?.pendingUpdate || user?.subscription?.cancelAtPeriodEnd);
  const freeSelected = selected === "alumni_free";

  return (
    <form className={styles.planPicker} onSubmit={submit} aria-busy={pending}>
      <div>
        <h3>Choose your subscription</h3>
        <p>Switch between member and alumni, change your membership period or choose a different alumni tier. Your account and saved details stay with you.</p>
      </div>
      {error ? (
        <div role="status">
          <p>We could not load the available plans.</p>
          <button className="rn-button-style--2 rn-btn-reverse-green rn-btn-small" type="button" onClick={() => setAttempt((value) => value + 1)}>Try again</button>
        </div>
      ) : !plans ? <p role="status">Loading subscription options…</p> : (
        <>
          <label htmlFor={id}>Membership plan</label>
          <select id={id} value={selected} onChange={(event) => setSelected(event.target.value)} disabled={pending} required>
            <option value="">Select a plan</option>
            {plans.map((plan) => (
              <option key={plan.priceId} value={plan.priceId} disabled={(blocked && plan.tier !== 0) || (user?.subscription?.priceId === plan.priceId && user?.isSubscribed) || (plan.tier === 0 && user?.isAlumni && user?.tier === 0)}>
                {plan.label} — {new Intl.NumberFormat("en-NL", { style: "currency", currency: plan.currency }).format(plan.amount / 100)}{plan.interval ? ` / ${plan.intervalCount > 1 ? `${plan.intervalCount} ` : ""}${plan.interval}${plan.intervalCount > 1 ? "s" : ""}` : ""}
                {user?.subscription?.priceId === plan.priceId && user?.isSubscribed ? " (current)" : ""}
              </option>
            ))}
          </select>
          <p id={`${id}-help`}>
            {freeSelected ? "Tier 0 has no paid benefits. If you have a running subscription, confirm its cancellation in Stripe first. You become a free alumni when it ends."
              : blocked ? "Open Manage billing to resolve the payment issue, pending change or cancellation first."
              : "You will review and confirm the change in Stripe before it takes effect. Stripe shows any prorated charge or credit. Paid benefits require a successful payment."}
          </p>
          <button aria-describedby={`${id}-help`} className="rn-button-style--2 rn-btn-reverse-green rn-btn-small" disabled={!selected || pending || (blocked && !freeSelected)} type="submit">
            {pending ? "Please wait…" : freeSelected && !user?.isSubscribed ? "Switch to free alumni" : "Review in Stripe"}
          </button>
        </>
      )}
    </form>
  );
}

SubscriptionPlanPicker.propTypes = { user: PropTypes.object, alumniOnly: PropTypes.bool };
