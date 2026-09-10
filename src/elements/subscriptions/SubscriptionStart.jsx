"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import PropTypes from "prop-types";
import { useHttpClient } from "@/hooks/common/http-hook";
import AppModal from "@/elements/ui/modals/AppModal";
import { IconlyQuestion } from "@/elements/ui/icons/IconlyIcons";
import MembershipTypeCard from "./MembershipTypeCard";
import { paidSubscriptionPlans, requestSubscriptionCheckout, subscriptionPlanLabel } from "./subscription-checkout.mjs";
import styles from "./subscriptions.module.scss";

const ACTION_CLASS = "rn-button-style--2 rn-btn-reverse-green rn-btn-small";

const MEMBERSHIP_TYPES = [
  {
    type: "member",
    title: "Member",
    description: "Join the society during your academic years, get event discounts, explore internship options and get the chance to enter a society's committee or a board.",
    image: "/assets/images/alumni/members.jpg",
  },
  {
    type: "alumni",
    title: "Alumni",
    description: "Support the society as a postgraduate alumnus. Network with our community, take part in alumni events and help us carry out our mission.",
    image: "/assets/images/alumni/alumni.jpeg",
  },
];

function SubscriptionOptionsSkeleton() {
  return (
    <div role="status" aria-label="Loading subscription options" className={styles.checkoutSkeleton}>
      <div aria-hidden="true" className={styles.checkoutSkeletonFields}>
        {["type", "plan"].map((field) => (
          <div className={styles.checkoutField} key={field}>
            <span className={`${styles.skeletonBlock} ${styles.checkoutSkeletonLabel}`} />
            <span className={`${styles.skeletonBlock} ${styles.checkoutSkeletonControl}`} />
          </div>
        ))}
        <div className={styles.checkoutMessage}>
          <span className={`${styles.skeletonBlock} ${styles.skeletonLine}`} />
          <span className={`${styles.skeletonBlock} ${styles.skeletonLine}`} />
          <span className={`${styles.skeletonBlock} ${styles.skeletonLine} ${styles.skeletonLineShort}`} />
        </div>
        <span className={`${styles.skeletonBlock} ${styles.checkoutSkeletonButton}`} />
      </div>
    </div>
  );
}

// Kept independent of account/API state so the checkout interaction can be
// verified with an in-memory catalog, without touching a real Stripe customer.
export function SubscriptionCheckoutForm({
  loadPlans,
  onCheckout,
  onPendingChange,
  onMembershipGuideChange = () => {},
}) {
  const id = useId();
  const [plans, setPlans] = useState(null);
  const [loadError, setLoadError] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [type, setType] = useState("");
  const [priceId, setPriceId] = useState("");
  const [pending, setPending] = useState(false);
  const [checkoutError, setCheckoutError] = useState("");
  const [membershipGuideOpen, setMembershipGuideOpen] = useState(false);
  const submitting = useRef(false);
  const mounted = useRef(false);
  const form = useRef(null);

  useEffect(() => {
    mounted.current = true;
    form.current?.focus({ preventScroll: true });
    return () => { mounted.current = false; };
  }, []);

  useEffect(() => {
    let current = true;
    setLoadError(false);
    setPlans(null);
    async function load() {
      try {
        const available = paidSubscriptionPlans(await loadPlans());
        if (current) setPlans(available);
      } catch {
        if (current) setLoadError(true);
      }
    }
    load();
    return () => { current = false; };
  }, [attempt, loadPlans]);

  const options = plans?.filter((plan) => plan.type === type) ?? [];
  const selected = options.find((plan) => plan.priceId === priceId);

  const setMembershipGuideVisible = (visible) => {
    setMembershipGuideOpen(visible);
    onMembershipGuideChange(visible);
  };

  const chooseMembershipType = (nextType) => {
    if (pending || !plans?.some((plan) => plan.type === nextType)) return;
    setType(nextType);
    setPriceId("");
    setCheckoutError("");
    setMembershipGuideVisible(false);
  };

  const submit = async (event) => {
    event.preventDefault();
    if (!selected || submitting.current) return;
    submitting.current = true;
    setPending(true);
    setCheckoutError("");
    onPendingChange(true);
    try {
      await onCheckout(selected.priceId);
      // Stay disabled after success while the browser leaves for Stripe.
    } catch {
      if (!mounted.current) return;
      submitting.current = false;
      setPending(false);
      onPendingChange(false);
      setCheckoutError("We could not open the payment page. Please try again or contact support if the problem continues.");
    }
  };

  return (
    <form ref={form} tabIndex={-1} className={styles.checkoutForm} onSubmit={submit} aria-busy={pending || (!plans && !loadError)}>
      <p>Choose Member or Alumni, then select your subscription. You will review the price and payment details securely before confirming.</p>
      {loadError || plans?.length === 0 ? (
        <div role="status" className={styles.checkoutMessage}>
          <p>{loadError ? "We could not load the available subscriptions." : "No paid subscriptions are available right now."}</p>
          <button className={ACTION_CLASS} type="button" onClick={() => setAttempt((value) => value + 1)}>Try again</button>
        </div>
      ) : !plans ? <SubscriptionOptionsSkeleton /> : (
        <>
          <div className={`rn-form-group ${styles.checkoutField}`}>
            <div className={styles.checkoutLabelRow}>
              <label htmlFor={`${id}-type`}>Membership type</label>
              <button
                aria-expanded={membershipGuideOpen}
                aria-haspopup="dialog"
                aria-label="Help me choose a membership type"
                className={styles.membershipHelpButton}
                disabled={pending}
                onClick={() => setMembershipGuideVisible(true)}
                type="button"
              >
                <IconlyQuestion aria-hidden />
              </button>
            </div>
            <select autoFocus className="bgsnl-form-control" id={`${id}-type`} value={type} disabled={pending} required
              onChange={(event) => { setType(event.target.value); setPriceId(""); setCheckoutError(""); }}>
              <option value="">Choose Member or Alumni</option>
              <option value="member" disabled={!plans.some((plan) => plan.type === "member")}>Member</option>
              <option value="alumni" disabled={!plans.some((plan) => plan.type === "alumni")}>Alumni</option>
            </select>
          </div>
          <div className={`rn-form-group ${styles.checkoutField}`}>
            <label htmlFor={`${id}-plan`}>{type === "alumni" ? "Alumni tier" : "Membership period"}</label>
            <select className="bgsnl-form-control" id={`${id}-plan`} value={priceId} disabled={!type || pending} required
              aria-describedby={`${id}-help`} onChange={(event) => { setPriceId(event.target.value); setCheckoutError(""); }}>
              <option value="">{type === "alumni" ? "Select a tier" : "Select a period"}</option>
              {options.map((plan) => <option key={plan.priceId} value={plan.priceId}>{subscriptionPlanLabel(plan)}</option>)}
            </select>
          </div>
          <p id={`${id}-help`}>Subscriptions renew automatically. Paid benefits become available after your payment is confirmed. You can manage or cancel your subscription in Billing.</p>
          {checkoutError && <p role="alert">{checkoutError}</p>}
          <button aria-describedby={`${id}-help`} className={ACTION_CLASS} type="submit" disabled={!selected || pending}>
            {pending ? "Opening payment…" : "Continue to payment"}
          </button>
        </>
      )}

      <AppModal
        className={styles.membershipGuideModal}
        contentClassName={styles.membershipGuideBody}
        dismissableMask
        maskClassName={styles.membershipGuideMask}
        onClose={() => setMembershipGuideVisible(false)}
        open={membershipGuideOpen}
        title="Member or Alumni?"
      >
        <div className={styles.membershipTypeGrid}>
          {MEMBERSHIP_TYPES.map((membership) => (
            <MembershipTypeCard
              disabled={pending || !plans?.some((plan) => plan.type === membership.type)}
              key={membership.type}
              membership={membership}
              onChoose={chooseMembershipType}
              selected={type === membership.type}
            />
          ))}
        </div>
      </AppModal>
    </form>
  );
}

SubscriptionCheckoutForm.propTypes = {
  loadPlans: PropTypes.func.isRequired,
  onCheckout: PropTypes.func.isRequired,
  onPendingChange: PropTypes.func.isRequired,
  onMembershipGuideChange: PropTypes.func,
};

export default function SubscriptionStart() {
  const { sendRequest } = useHttpClient();
  const request = useRef(sendRequest);
  request.current = sendRequest;
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [membershipGuideOpen, setMembershipGuideOpen] = useState(false);
  const pendingRef = useRef(false);
  const updatePending = useCallback((value) => {
    pendingRef.current = value;
    setPending(value);
  }, []);
  const close = useCallback(() => {
    if (!pendingRef.current) setOpen(false);
  }, []);
  const loadPlans = useCallback(async () => {
    const response = await request.current("payment/subscription/plans", "GET", null, {}, false, false);
    return response?.plans;
  }, []);
  const checkout = useCallback(async (priceId) => {
    const url = await requestSubscriptionCheckout(request.current, priceId, window.location.origin);
    window.location.assign(url);
  }, []);

  return (
    <>
      <button className={`settings-action ${ACTION_CLASS}`} type="button" onClick={() => setOpen(true)}>Start subscription</button>
      <AppModal open={open} onClose={close} title="Choose your subscription" closable={!pending && !membershipGuideOpen} dismissableMask={!pending && !membershipGuideOpen} suspended={membershipGuideOpen}>
        {open && <SubscriptionCheckoutForm loadPlans={loadPlans} onCheckout={checkout} onPendingChange={updatePending} onMembershipGuideChange={setMembershipGuideOpen} />}
      </AppModal>
    </>
  );
}
