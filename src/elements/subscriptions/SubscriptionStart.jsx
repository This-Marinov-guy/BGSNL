"use client";

import { LoadErrorBanner } from "@/elements/ui/loading/LoadState";
import { SelectInput } from "@/compat/primereact";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import PropTypes from "prop-types";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useHttpClient } from "@/hooks/common/http-hook";
import AppModal from "@/elements/ui/modals/AppModal";
import { IconlyDanger, IconlyQuestion } from "@/elements/ui/icons/IconlyIcons";
import { ANALYTICS_EVENTS, ANALYTICS_PROPERTIES } from "@/util/analytics/events.mjs";
import { clarityEvent } from "@/util/functions/helpers";
import MembershipTypeCard from "./MembershipTypeCard";
import { chargeAmountLabel, paidSubscriptionPlans, planChangeChargesImmediately, requestSubscriptionCheckout, subscriptionPlanLabel, validChargeQuote } from "./subscription-checkout.mjs";
import styles from "./subscriptions.module.scss";
import { REGIONS } from "@/util/defines/REGIONS_DESIGN";

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
  loadQuote,
  initialType = "",
  initialRegion = "",
  currentPriceId = "",
  currentTier,
  renewalPriceId = null,
  onCheckout,
  onPendingChange,
  onMembershipGuideChange = () => {},
}) {
  const id = useId();
  const reduceMotion = useReducedMotion();
  const [plans, setPlans] = useState(null);
  const [loadError, setLoadError] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [type, setType] = useState(["member", "alumni"].includes(initialType) ? initialType : "");
  const [priceId, setPriceId] = useState("");
  const [region, setRegion] = useState(REGIONS.includes(initialRegion) ? initialRegion : "");
  const [pending, setPending] = useState(false);
  const [checkoutError, setCheckoutError] = useState("");
  const [membershipGuideOpen, setMembershipGuideOpen] = useState(false);
  const [quoteState, setQuoteState] = useState(null);
  const [quoteAttempt, setQuoteAttempt] = useState(0);
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
  const renewing = renewalPriceId !== null;
  const selected = renewing ? plans?.find(plan => plan.priceId === renewalPriceId)
    : options.find((plan) => plan.priceId === priceId && plan.priceId !== currentPriceId);
  const selectedType = renewing ? selected?.type : type;
  const currentPlan = currentPriceId ? plans?.find(plan => plan.priceId === currentPriceId) || { type: initialType, tier: currentTier } : null;
  const chargeNow = planChangeChargesImmediately(currentPlan, selected);
  const billsAtRenewal = !!currentPriceId && !!selected && !chargeNow;
  const scheduledDowngrade = billsAtRenewal && selected.type === "alumni";
  const quote = validChargeQuote(quoteState?.quote, selected?.priceId) ? quoteState.quote : null;
  const quoteError = quoteState?.priceId === selected?.priceId && quoteState?.error;
  const selectedPriceId = selected?.priceId;

  useEffect(() => {
    let current = true;
    setQuoteState(null);
    if (!chargeNow || !selectedPriceId) return () => { current = false; };
    async function preview() {
      try {
        const nextQuote = await loadQuote(selectedPriceId);
        if (!validChargeQuote(nextQuote, selectedPriceId)) throw new Error("Invalid payment estimate");
        if (current) setQuoteState({ priceId: selectedPriceId, quote: nextQuote });
      } catch {
        if (current) setQuoteState({ priceId: selectedPriceId, error: true });
      }
    }
    preview();
    return () => { current = false; };
  }, [chargeNow, selectedPriceId, loadQuote, quoteAttempt]);

  const setMembershipGuideVisible = (visible) => {
    setMembershipGuideOpen(visible);
    onMembershipGuideChange(visible);
  };

  const chooseMembershipType = (nextType) => {
    if (pending || (nextType && !plans?.some((plan) => plan.type === nextType))) return;
    if (nextType) clarityEvent(ANALYTICS_EVENTS.MEMBERSHIP_TYPE_SELECTED, {
      [ANALYTICS_PROPERTIES.MEMBERSHIP_TYPE]: nextType,
    });
    setType(nextType);
    setPriceId("");
    setCheckoutError("");
    setMembershipGuideVisible(false);
  };

  const submit = async (event) => {
    event.preventDefault();
    if (!selected || submitting.current || (selectedType === "member" && !REGIONS.includes(region)) || (chargeNow && !quote)) return;
    submitting.current = true;
    setPending(true);
    setCheckoutError("");
    onPendingChange(true);
    clarityEvent(ANALYTICS_EVENTS.MEMBERSHIP_CHECKOUT_STARTED, {
      [ANALYTICS_PROPERTIES.MEMBERSHIP_TYPE]: selected.type,
      [ANALYTICS_PROPERTIES.MEMBERSHIP_PLAN]: subscriptionPlanLabel(selected),
    });
    try {
      await onCheckout(selected.priceId, selectedType === "member" ? region : undefined);
      // Stay disabled while redirecting to Stripe or refreshing the saved plan.
    } catch {
      if (!mounted.current) return;
      submitting.current = false;
      setPending(false);
      onPendingChange(false);
      clarityEvent(ANALYTICS_EVENTS.MEMBERSHIP_PAYMENT_FAILED, {
        [ANALYTICS_PROPERTIES.PAYMENT_STATUS]: "checkout_launch_failed",
      });
      setCheckoutError(currentPriceId ? "We could not confirm the plan change. Refresh your account to check its status before trying again." : "We could not open the payment page. Please try again or contact support if the problem continues.");
    }
  };

  return (
    <form ref={form} tabIndex={-1} className={styles.checkoutForm} onSubmit={submit} aria-busy={pending || (!plans && !loadError)}>
      <p id={`${id}-help`}>{renewing ? "Confirm your plan to start a new subscription. You will review the final price in our secure checkout before paying." : currentPriceId ? "Choose your new plan. Alumni upgrades and changes between Member and Alumni require payment now. Other changes are billed at your next renewal." : "Choose Member or Alumni, then select your subscription. You will review the price and payment details securely before confirming."}</p>
      {loadError || plans?.length === 0 ? (
        <LoadErrorBanner message={loadError ? "We could not load the available subscriptions." : "No paid subscriptions are available right now."} onRetry={() => setAttempt((value) => value + 1)} />
      ) : !plans ? <SubscriptionOptionsSkeleton /> : renewing && !selected ? (
        <p role="alert">Your previous subscription plan is no longer available. Close this confirmation and use Switch to choose an available subscription.</p>
      ) : (
        <>
          {renewing ? <div className={styles.checkoutMessage}>
            <p><strong>{selected.type === "alumni" ? "Alumni" : "Member"} subscription</strong></p>
            <p>{subscriptionPlanLabel(selected)}</p>
            <p>The subscription renews automatically until you cancel.</p>
          </div> : <div className={`rn-form-group ${styles.checkoutField}`}>
            <div className={`rn-form-label-row ${styles.checkoutLabelRow}`}>
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
            <SelectInput className="bgsnl-form-control" id={`${id}-type`} value={type} disabled={pending} required
              onChange={(event) => chooseMembershipType(event.target.value)}>
              <option value="" disabled>Choose Member or Alumni</option>
              <option value="member" disabled={!plans.some((plan) => plan.type === "member")}>Member</option>
              <option value="alumni" disabled={!plans.some((plan) => plan.type === "alumni")}>Alumni</option>
            </SelectInput>
          </div>}
          {selectedType === "member" && <div className={`rn-form-group ${styles.checkoutField}`}>
            <label htmlFor={`${id}-region`}>Region</label>
            <SelectInput className="bgsnl-form-control" id={`${id}-region`} value={region} disabled={pending} required
              onChange={event => setRegion(event.target.value)}>
              <option value="">Select your region</option>
              {REGIONS.map(value => <option key={value} value={value}>{value === "breda_tilburg" ? "Breda–Tilburg" : value === "leiden_hague" ? "Leiden–The Hague" : value.charAt(0).toUpperCase() + value.slice(1)}</option>)}
            </SelectInput>
          </div>}
          {!renewing && <div className={`rn-form-group ${styles.checkoutField}`}>
            <label htmlFor={`${id}-plan`}>{type === "alumni" ? "Alumni tier" : "Membership period"}</label>
            <SelectInput className="bgsnl-form-control" id={`${id}-plan`} value={priceId} disabled={!type || pending} required
              aria-describedby={`${id}-help`} onChange={(event) => {
                const nextPlan = options.find((plan) => plan.priceId === event.target.value);
                setPriceId(event.target.value);
                setCheckoutError("");
                if (nextPlan) clarityEvent(ANALYTICS_EVENTS.MEMBERSHIP_PLAN_SELECTED, {
                  [ANALYTICS_PROPERTIES.MEMBERSHIP_TYPE]: type,
                  [ANALYTICS_PROPERTIES.MEMBERSHIP_PLAN]: subscriptionPlanLabel(nextPlan),
                });
              }}>
              <option value="">{type === "alumni" ? "Select a tier" : "Select a period"}</option>
              {options.map((plan) => <option key={plan.priceId} value={plan.priceId} disabled={plan.priceId === currentPriceId}>
                {subscriptionPlanLabel(plan)}{plan.priceId === currentPriceId ? " (current)" : ""}
              </option>)}
            </SelectInput>
          </div>}
          {checkoutError && <p role="alert">{checkoutError}</p>}
          <div className={styles.checkoutActions}>
          <AnimatePresence initial={false}>
            {chargeNow && <motion.div key="charge-warning" className={styles.chargeWarning} role="status" id={`${id}-charge-warning`}
              initial={{ opacity: 0, y: reduceMotion ? 0 : 6 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: reduceMotion ? 0 : -4, transition: { duration: reduceMotion ? 0 : 0.12 } }}
              transition={{ duration: reduceMotion ? 0 : 0.2 }}>
              {(!quoteError || quote) && <IconlyDanger aria-hidden />}
              {!quote ? quoteError ? <LoadErrorBanner message="We couldn’t check the amount due. Please retry before continuing." retryLabel="Retry amount" onRetry={() => setQuoteAttempt(value => value + 1)} /> : <div className={styles.chargeQuoteSkeleton} role="status" aria-label="Calculating payment amount">
                <span className={`${styles.skeletonBlock} ${styles.skeletonLine}`} aria-hidden />
                <span className={`${styles.skeletonBlock} ${styles.skeletonLineShort} ${styles.skeletonLine}`} aria-hidden />
              </div> : <p>{quote.amountDue > 0 ? <><strong>We will charge {chargeAmountLabel(quote)} to your payment method</strong> when you confirm. This estimate includes applicable credits. You will see the final amount before paying.</> : <><strong>{chargeAmountLabel(quote)} due now.</strong> No payment is currently due. Review and confirm the change in our secure billing page.</>}</p>}
            </motion.div>}
          </AnimatePresence>
          <button aria-describedby={`${id}-help${chargeNow ? ` ${id}-charge-warning` : ""}`} className={ACTION_CLASS} type="submit" disabled={!selected || pending || (selectedType === "member" && !region) || (chargeNow && !quote)}>
            {pending ? billsAtRenewal ? "Updating subscription…" : "Opening payment…" : renewing ? "Confirm renewal" : scheduledDowngrade ? "Schedule downgrade" : billsAtRenewal ? "Confirm switch" : "Continue to payment"}
          </button>
          </div>
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
  loadQuote: PropTypes.func.isRequired,
  initialType: PropTypes.oneOf(["", "member", "alumni"]),
  initialRegion: PropTypes.string,
  currentPriceId: PropTypes.string,
  currentTier: PropTypes.number,
  renewalPriceId: PropTypes.string,
  onCheckout: PropTypes.func.isRequired,
  onPendingChange: PropTypes.func.isRequired,
  onMembershipGuideChange: PropTypes.func,
};

export default function SubscriptionStart({ linkStyle = false, user, buttonLabel, modalTitle, renewal = false }) {
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
  const loadQuote = useCallback(async priceId => {
    const response = await request.current("payment/subscription/preview", "POST", { itemId: priceId, origin_url: window.location.origin }, {}, false, false);
    return response?.quote;
  }, []);
  const checkout = useCallback(async (priceId, region) => {
    const url = await requestSubscriptionCheckout(request.current, priceId, window.location.origin, region);
    if (url) window.location.assign(url);
    else window.location.reload();
  }, []);

  return (
    <>
      <button className={linkStyle ? styles.textButton : `settings-action ${ACTION_CLASS}`} type="button" onClick={() => {
        clarityEvent(ANALYTICS_EVENTS.MEMBERSHIP_CTA_CLICKED, { [ANALYTICS_PROPERTIES.SOURCE]: "subscription_start" });
        setOpen(true);
      }}>{buttonLabel || (renewal ? "Renew" : "Start subscription")}</button>
      <AppModal open={open} onClose={close} title={modalTitle || (renewal ? "Renew subscription" : "Choose your subscription")} closable={!pending && !membershipGuideOpen} dismissableMask={!pending && !membershipGuideOpen} suspended={membershipGuideOpen}>
        {open && <SubscriptionCheckoutForm initialRegion={user?.region} initialType={user?.isAlumni || user?.roles?.includes("alumni") ? "alumni" : "member"}
          renewalPriceId={renewal ? user?.subscription?.priceId || "" : null} loadPlans={loadPlans} loadQuote={loadQuote} onCheckout={checkout} onPendingChange={updatePending} onMembershipGuideChange={setMembershipGuideOpen} />}
      </AppModal>
    </>
  );
}

SubscriptionStart.propTypes = { linkStyle: PropTypes.bool, user: PropTypes.object, renewal: PropTypes.bool, buttonLabel: PropTypes.string, modalTitle: PropTypes.string };
