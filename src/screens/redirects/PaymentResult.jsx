"use client";

/* global Intl */

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import PropTypes from "prop-types";
import { useDispatch } from "react-redux";
import HeaderTwo from "@/component/header/HeaderTwo";
import Footer from "@/component/footer/Footer";
import { FiArrowRight, FiClock, FiDownload, IconlyCopy } from "@/elements/ui/icons/IconlyIcons";
import { showNotification } from "@/redux/notification";
import styles from "./payment-result.module.scss";

const money = (amount, currency = "eur") => amount == null ? "—" : new Intl.NumberFormat("en-NL", { style: "currency", currency }).format(amount / 100);
const messages = {
  success: { title: "Payment received", text: "Thank you for being part of our community. Your payment has been confirmed." },
  cancelled: { title: "Checkout not completed", text: "You left checkout before it was completed. You can return to the same checkout when you’re ready." },
  failed: { title: "Let’s try that again", text: "Your payment could not be completed. Return to checkout to review your details or choose another payment method." },
  expired: { title: "This checkout has expired", text: "Your checkout session is no longer available. Start again to review the current availability and price." },
  processing: { title: "Confirming your payment", text: "Your payment is still being confirmed. Please don’t start another checkout. We’ll check for an update automatically." },
  unavailable: { title: "We’re having trouble checking your payment", text: "This doesn’t mean your payment failed. Please check again before making another payment, or contact us for help." },
};

export default function PaymentResult({ result, checkout, unavailable = false, documentUnavailable = false }) {
  const router = useRouter();
  const dispatch = useDispatch();
  const [retrying, setRetrying] = useState(false);
  const retryInFlight = useRef(false);
  const [refreshing, refresh] = useTransition();
  const state = unavailable ? "unavailable" : result.status;
  const successful = state === "success";
  const pending = state === "processing";
  const free = successful && result.amount === 0;
  const content = messages[state];
  const title = free ? "You’re all set" : successful && result.kind === "donation" ? "Thank you for your support" : content.title;
  const identifier = successful && !free ? result.transactionId
    : !successful && !pending && !unavailable ? result.paymentIntentId : null;
  const identifierLabel = successful ? "Transaction ID" : "Payment Intent ID";

  const copyIdentifier = async () => {
    try {
      await navigator.clipboard.writeText(identifier);
      dispatch(showNotification({ severity: "info", detail: `${identifierLabel} copied to your clipboard.` }));
    } catch {
      dispatch(showNotification({ severity: "error", detail: "Could not copy the ID. Please select and copy it manually." }));
    }
  };

  useEffect(() => {
    if (!documentUnavailable) return;
    dispatch(showNotification({ severity: "error", detail: "Your document isn’t available right now. Please check again shortly or contact us.", life: 6000 }));
  }, [documentUnavailable, dispatch]);

  useEffect(() => {
    if (!pending) return;
    let checks = 0;
    const interval = window.setInterval(() => {
      if (document.visibilityState !== "visible") return;
      router.refresh();
      if (++checks >= 12) window.clearInterval(interval);
    }, 10000);
    return () => window.clearInterval(interval);
  }, [pending, router]);

  const retry = async () => {
    if (retryInFlight.current) return;
    retryInFlight.current = true;
    setRetrying(true);
    try {
      const response = await fetch("/payment/retry", { method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ checkout }), signal: AbortSignal.timeout(20000) });
      const data = await response.json();
      if (!response.ok || !data.url) throw new Error(data.message || "Please try again shortly.");
      window.location.assign(data.url);
    } catch (error) {
      dispatch(showNotification({ severity: "error", detail: error.name === "TimeoutError" ? "Payment verification is taking longer than expected. Please try again shortly." : error.message, life: 6000 }));
      retryInFlight.current = false;
      setRetrying(false);
    }
  };

  const eventDestination = ["ticket", "free"].includes(result?.kind) && result?.returnPath
    ? result.returnPath.replace("/purchase-ticket/", "/event-details/") : null;
  const destination = successful && result?.kind === "subscription" ? "/user?billing=return#settings"
    : eventDestination || result?.returnPath;

  return <>
    <HeaderTwo />
    <main className={styles.page}>
      <section className={styles.panel} aria-labelledby="payment-result-title" data-state={state}>
        <div className={styles.message}>
          <div className={styles.heading}>
            <div className={styles.icon} aria-hidden="true">
              {unavailable || pending ? <FiClock size={56} /> : <img src={`/assets/icons/svgs/${successful ? "success" : "fail"}.svg`} width="56" height="56" alt="" />}
            </div>
            <h1 id="payment-result-title">{title}</h1>
          </div>
          <p className={styles.description}>{free ? result.kind === "subscription" ? "Your membership checkout is confirmed. No payment was due today." : "Your booking is confirmed. No payment was required." : content.text}</p>
          {successful && ["ticket", "free"].includes(result.kind) && <p>Your ticket confirmation will arrive by email. Check your spam folder too.</p>}
          {successful && result.kind === "subscription" && <p>Your account will update once payment processing is complete. You can review your membership in account settings.</p>}

          <div className={styles.actions}>
            {successful ? <>
              {(result.hasInvoice || result.hasReceipt) && <a href={`/payment/document?checkout=${checkout}`} rel="noreferrer" className="rn-button-style--2 rn-btn-reverse-green rn-btn-small">
                <FiDownload size={24} /> {result.hasInvoice ? "Download invoice" : "View receipt"}
              </a>}
              {destination && <Link href={destination} className="rn-button-style--2 rn-btn-green rn-btn-small">
                {result.kind === "subscription" ? "Go to my account" : ["ticket", "free"].includes(result.kind) ? "View event" : "Get in touch"} <FiArrowRight size={24} />
              </Link>}
            </> : pending || unavailable ? <button type="button" disabled={refreshing} onClick={() => refresh(() => router.refresh())} className="rn-button-style--2 rn-btn-reverse-green rn-btn-small">
              {refreshing ? "Checking…" : "Check again"}
            </button> : <button type="button" disabled={retrying} onClick={retry} className="rn-button-style--2 rn-btn-reverse-red rn-btn-small">
              {retrying ? "Checking checkout…" : result.canResume ? "Retry checkout" : result.kind === "donation" ? "Contact us to retry" : "Start checkout again"} <FiArrowRight size={24} />
            </button>}
            {!successful && !pending && !unavailable && eventDestination && <Link href={eventDestination} className="rn-button-style--2 rn-btn-green rn-btn-small">
              View event <FiArrowRight size={24} />
            </Link>}
          </div>
          {!successful && !pending && !unavailable && <p className={styles.note}>If your bank shows a pending amount, check its status before paying again. A temporary authorisation isn’t always a completed charge.</p>}
        </div>

        {result && <aside className={styles.summary} aria-labelledby="payment-summary-title">
          <h2 id="payment-summary-title">{successful ? "Your confirmation" : "Checkout details"}</h2>
          <div className={styles.total}>
            <span>{successful ? free ? "Amount due" : "Total paid" : "Checkout total"}</span>
            <p className="h2">{free ? "Free" : money(result.amount, result.currency)}</p>
            <hr className={styles.totalDivider} />
          </div>
          <ul className={styles.items}>
            {result.items.map((item, index) => <li key={`${item.description}-${index}`}>
              <div className={styles.itemDetails}>
                <span className={styles.quantity}>{item.quantity ?? 1} ×</span>
                <span>{item.description}</span>
              </div>
              <span>{money(item.amount, result.currency)}</span>
            </li>)}
          </ul>
          <dl className={styles.facts}>
            <div><dt>Reference</dt><dd>{result.reference}</dd></div>
            {identifier && <div className={styles.identifier}>
              <dt>{identifierLabel}</dt>
              <dd>
                <span title={identifier}>{identifier}</span>
                <button type="button" className={styles.copyButton} aria-label={`Copy ${identifierLabel}`} title={`Copy ${identifierLabel}`} onClick={copyIdentifier}>
                  <IconlyCopy size={18} />
                </button>
              </dd>
            </div>}
            <div><dt>Date</dt><dd>{new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "Europe/Amsterdam" }).format(new Date(result.date))}</dd></div>
            <div><dt>Status</dt><dd>{successful ? free ? "Confirmed" : "Paid" : pending ? "Processing" : state === "expired" ? "Expired" : "Not completed"}</dd></div>
            {result.refunded > 0 && <div><dt>Refunded</dt><dd>{money(result.refunded, result.currency)}</dd></div>}
          </dl>
          {successful && !result.hasInvoice && !result.hasReceipt && !free && <>
            <p className={styles.note}>Your receipt may take a moment to become available.</p>
            <button type="button" className={styles.textButton} disabled={refreshing} onClick={() => refresh(() => router.refresh())}>{refreshing ? "Checking…" : "Check for receipt"}</button>
          </>}
          {free && <p className={styles.note}>No payment was required.</p>}
        </aside>}
      </section>
      <p className={styles.support}>Need a hand? <Link href="/contact">Contact our team</Link> or use the Help button.</p>
    </main>
    <Footer />
  </>;
}

PaymentResult.propTypes = {
  result: PropTypes.shape({ status: PropTypes.string, kind: PropTypes.string, amount: PropTypes.number, currency: PropTypes.string,
    date: PropTypes.string, items: PropTypes.arrayOf(PropTypes.shape({ description: PropTypes.string, quantity: PropTypes.number, amount: PropTypes.number })),
    reference: PropTypes.string, transactionId: PropTypes.string, paymentIntentId: PropTypes.string, returnPath: PropTypes.string, refunded: PropTypes.number,
    hasInvoice: PropTypes.bool, hasReceipt: PropTypes.bool, canResume: PropTypes.bool }),
  checkout: PropTypes.string, unavailable: PropTypes.bool, documentUnavailable: PropTypes.bool,
};
