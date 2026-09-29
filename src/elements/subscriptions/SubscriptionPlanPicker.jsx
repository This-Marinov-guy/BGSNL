"use client";

import { LoadingSkeleton, LoadErrorBanner } from "@/elements/ui/loading/LoadState";
import { FiCheck, FiChevronRight, FiPlus, FiX } from "@/elements/ui/icons/IconlyIcons";
import { ALUMNI_MEMBERSHIP_SPECIFICS } from "@/util/defines/ALUMNI";
import { SelectInput } from "@/compat/primereact";

import { useEffect, useId, useRef, useState } from "react";
import PropTypes from "prop-types";
import { motion, useReducedMotion } from "framer-motion";
import { useHttpClient } from "@/hooks/common/http-hook";
import styles from "./subscriptions.module.scss";
/* global Intl */

const tierHighlights = {
  1: "Alumni events and tree entry",
  2: "Discounts and promotions",
  3: "Private channel access",
  4: "Voting rights and merchandise",
};
const formatPrice = (plan) => new Intl.NumberFormat("en-NL", { style: "currency", currency: plan.currency, maximumFractionDigits: 2 }).format(plan.amount / 100);
const formatPeriod = (plan) => plan?.interval ? `per ${plan.intervalCount > 1 ? `${plan.intervalCount} ` : ""}${plan.interval}${plan.intervalCount > 1 ? "s" : ""}` : "";

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
  const [informationOpen, setInformationOpen] = useState(false);
  const [benefitsOpen, setBenefitsOpen] = useState(false);
  const reducedMotion = useReducedMotion();
  useEffect(() => {
    let mounted = true;
    setError(false);
    setPlans(null);
    request.current("payment/subscription/plans", "GET", null, {}, false, false).then((response) => {
      if (!mounted) return;
      if (!Array.isArray(response?.plans)) { setError(true); return; }
      const available = response.plans.filter((plan) => !alumniOnly || plan.type === "alumni");
      if (!available.length) { setError(true); return; }
      setPlans(available);
    }).catch(() => { if (mounted) setError(true); });
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
  const selectedPlan = plans?.find((plan) => plan.priceId === selected);
  const selectedTier = ALUMNI_MEMBERSHIP_SPECIFICS.find((tier) => tier.id === selectedPlan?.tier);

  return (
    <form className={styles.planPicker} onSubmit={submit} aria-busy={pending}>
      <p>{alumniOnly ? "Pick a tier. Compare the full benefits whenever you need." : "Choose your membership plan."}</p>
      {error ? (
        <LoadErrorBanner message="We could not load the available plans." onRetry={() => setAttempt((value) => value + 1)} />
      ) : !plans ? <LoadingSkeleton label="Loading subscription options" variant={alumniOnly ? "tiers" : "lines"} count={alumniOnly ? 4 : 3} /> : (
        <>
          {alumniOnly ? (
            <div className={`signup-plan-grid signup-plan-grid--alumni ${styles.tierGrid}`} role="group" aria-label="Alumni membership tiers">
              {ALUMNI_MEMBERSHIP_SPECIFICS.map((tier) => {
                const plan = plans.find((option) => option.tier === tier.id);
                const current = Boolean(plan && user?.isSubscribed && user?.subscription?.priceId === plan.priceId);
                const chosen = Boolean(plan && selected === plan.priceId);
                return (
                  <button key={tier.id} type="button" aria-pressed={chosen}
                    aria-label={`${tier.title}${current ? " (current)" : ""}`}
                    aria-describedby={`${id}-tier-${tier.id}`}
                    className={`signup-plan-card signup-plan-card--alumni ${styles.tierCard}`}
                    disabled={!plan || pending || blocked || current}
                    onClick={() => setSelected(plan.priceId)}>
                    <span className="signup-plan-card__topline">
                      <span className="signup-plan-card__icon" aria-hidden="true">{tier.icon}</span>
                      <span className={styles.tierCheck} aria-hidden="true">{chosen && <FiCheck />}</span>
                    </span>
                    <span className="signup-plan-card__title">{tier.title}</span>
                    <span id={`${id}-tier-${tier.id}`} className="signup-plan-card__price">
                      <strong>{plan ? formatPrice(plan) : "—"}</strong>
                      <span>{plan ? formatPeriod(plan) : "Unavailable"}</span>
                    </span>
                    <span className={styles.tierHighlight}><FiPlus aria-hidden="true" /><span>{tierHighlights[tier.id]}</span></span>
                    {current && <span className={styles.tierSelection}>Current tier</span>}
                  </button>
                );
              })}
            </div>
          ) : <div className={`rn-form-group ${styles.checkoutField}`}>
            <label htmlFor={id}>Membership plan</label>
            <SelectInput className="bgsnl-form-control" id={id} value={selected} onChange={(event) => setSelected(event.target.value)} disabled={pending} required>
              <option value="">Select a plan</option>
              {plans.map((plan) => (
                <option key={plan.priceId} value={plan.priceId} disabled={(blocked && plan.tier !== 0) || (user?.subscription?.priceId === plan.priceId && user?.isSubscribed) || (plan.tier === 0 && user?.isAlumni && user?.tier === 0)}>
                  {plan.label} — {new Intl.NumberFormat("en-NL", { style: "currency", currency: plan.currency }).format(plan.amount / 100)}{plan.interval ? ` / ${plan.intervalCount > 1 ? `${plan.intervalCount} ` : ""}${plan.interval}${plan.intervalCount > 1 ? "s" : ""}` : ""}
                  {user?.subscription?.priceId === plan.priceId && user?.isSubscribed ? " (current)" : ""}
                </option>
              ))}
            </SelectInput>
          </div>}
          {alumniOnly && <div className={styles.planInformation}>
            <button type="button" id={`${id}-benefits-toggle`} className={styles.planInformationToggle}
              aria-expanded={benefitsOpen} aria-controls={`${id}-benefits`}
              onClick={() => setBenefitsOpen((open) => !open)}>
              <FiChevronRight aria-hidden="true" />Compare all benefits
            </button>
            <motion.div id={`${id}-benefits`} role="region" aria-labelledby={`${id}-benefits-toggle`}
              aria-hidden={!benefitsOpen} inert={!benefitsOpen} className={styles.planInformationPanel}
              initial={false} animate={{ height: benefitsOpen ? "auto" : 0, opacity: benefitsOpen ? 1 : 0 }}
              transition={{ duration: reducedMotion ? 0 : 0.22, ease: [0.22, 1, 0.36, 1] }}>
              <div className={styles.tierComparison}>
                {ALUMNI_MEMBERSHIP_SPECIFICS.map((tier) => <section key={tier.id} aria-label={`${tier.title} benefits`}>
                  <h3>{tier.title}</h3>
                  <ul>{tier.benefits.map((benefit) => <li key={benefit.text} className={benefit.strike ? styles.benefitUnavailable : undefined}>
                    {benefit.strike ? <FiX aria-label="Not included" /> : <FiCheck aria-label="Included" />}
                    <span>{benefit.text}</span>
                  </li>)}</ul>
                </section>)}
              </div>
            </motion.div>
          </div>}
          {(freeSelected || blocked) && <p id={`${id}-help`} className={styles.planWarning}>
            {freeSelected ? user?.isSubscribed
              ? "Tier 0 has no paid benefits. Cancel your paid subscription first; Tier 0 starts when your current billing period ends."
              : "Tier 0 is free and does not include paid Alumni benefits."
              : blocked ? "Open Payments to resolve the payment issue, pending change or scheduled cancellation before switching."
              : "You’ll review the price before confirming payment."}
          </p>}
          <div className={styles.planInformation}>
            <button type="button" id={`${id}-information-toggle`} className={styles.planInformationToggle}
              aria-expanded={informationOpen} aria-controls={`${id}-information`}
              onClick={() => setInformationOpen((open) => !open)}>
              <FiChevronRight aria-hidden="true" />
              How billing and tier changes work
            </button>
            <motion.div id={`${id}-information`} role="region" aria-labelledby={`${id}-information-toggle`}
              aria-hidden={!informationOpen} inert={!informationOpen} className={styles.planInformationPanel}
              initial={false} animate={{ height: informationOpen ? "auto" : 0, opacity: informationOpen ? 1 : 0 }}
              transition={{ duration: reducedMotion ? 0 : 0.22, ease: [0.22, 1, 0.36, 1] }}>
              <div className={styles.planInformationBody}>
              <p><strong>Your account stays with you.</strong> Changing your {alumniOnly ? "Alumni tier" : "membership plan"} keeps your profile and saved details.</p>
              <p><strong>Review before paying.</strong> Any prorated charge or credit will be shown before payment. Paid benefits require a successful payment.</p>
              <p><strong>Free Alumni.</strong> Tier 0 has no paid benefits. If you have a paid subscription, cancel it first; the free tier starts at the end of the current billing period.</p>
              </div>
            </motion.div>
          </div>
          <div className={styles.planPickerFooter}>
            <div className={styles.planPickerSummary}>
              <p aria-live="polite"><strong>{selectedPlan
                ? `${selectedTier?.title || selectedPlan.label} · ${formatPrice(selectedPlan)} ${formatPeriod(selectedPlan)}`
                : "Select a tier to continue"}</strong></p>
              <p id={`${id}-payment-help`}>You’ll review the price before confirming payment.</p>
            </div>
            <button aria-describedby={`${id}-payment-help${freeSelected || blocked ? ` ${id}-help` : ""}`} className="rn-button-style--2 rn-btn-reverse-green rn-btn-small" disabled={!selected || pending || (blocked && !freeSelected)} type="submit">
              {pending ? (freeSelected ? "Switching…" : "Opening payment…") : freeSelected && !user?.isSubscribed ? "Switch to free Alumni" : "Continue to payment"}
            </button>
          </div>
        </>
      )}
    </form>
  );
}

SubscriptionPlanPicker.propTypes = { user: PropTypes.object, alumniOnly: PropTypes.bool };
