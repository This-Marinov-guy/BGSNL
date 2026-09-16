"use client";

import { useState } from "react";
import PropTypes from "prop-types";
import { Form, ErrorMessage } from "formik";
import * as yup from "yup";
import ValidatedFormik from "@/elements/ui/forms/ValidatedFormik";
import FormExtras from "@/elements/ui/forms/FormExtras";
import MobilePurchaseSummary from "@/elements/purchase/MobilePurchaseSummary";
import PurchaseEventSummary from "@/elements/purchase/PurchaseEventSummary";
import { IconlyArrowRight } from "@/elements/ui/icons/IconlyIcons";
import Loader from "@/elements/ui/loading/Loader";
import { buildSchemaExtraInputs, constructInitialExtraFormValues, extraInputFieldName } from "@/util/functions/input-helpers";
import styles from "./email-ticket-preferences.module.scss";

const euro = amount => new globalThis.Intl.NumberFormat("en-NL", { style: "currency", currency: "EUR" }).format(amount);

export default function EmailTicketPreferences({ checkout, details, preview = false }) {
  const { event, price, guest, revision, eventUrl } = details;
  const [previewComplete, setPreviewComplete] = useState(false);
  const [error, setError] = useState("");
  const [redirecting, setRedirecting] = useState(false);
  const [needsReview, setNeedsReview] = useState(false);
  const fields = event.extraInputsForm || [];
  const schema = buildSchemaExtraInputs(fields).schema.shape({
    addOns: event.addOns.isMandatory ? yup.array().min(1, "Please choose an add-on") : yup.array(),
  });

  return <ValidatedFormik initialValues={{ ...constructInitialExtraFormValues(fields), addOns: [] }} validationSchema={schema} onSubmit={async (values) => {
          setError("");
          if (preview) { setPreviewComplete(true); return; }
          const preferences = Object.fromEntries(fields.map((field, index) => [field.placeholder, values[extraInputFieldName(index)]]));
          try {
            const response = await fetch(`/payment/event-ticket/${checkout}/pay`, {
              method: "POST", headers: { "Content-Type": "application/json" }, credentials: "same-origin",
              body: JSON.stringify({ addOns: values.addOns, preferences, revision }),
            });
            const result = await response.json();
            if (!response.ok) { setNeedsReview(response.status === 409); throw new Error(result.message || "Could not open payment. Please try again."); }
            setRedirecting(true);
            window.location.assign(result.url);
          } catch (failure) { setError(failure.message || "Could not open payment. Please try again."); }
        }}>
    {({ values, setFieldValue, isSubmitting }) => {
      const total = price + event.addOns.items
        .filter(item => values.addOns.includes(item._id))
        .reduce((sum, item) => sum + item.price, 0);
      const overviewPrice = <span aria-live="polite" aria-atomic="true">
        <span key={total} className={styles.animatedPrice}>{total === 0 ? "Free" : euro(total)}</span>
      </span>;

      return <main className={`purchase-page member-purchase-container ${styles.page}`} data-private data-hj-suppress data-clarity-mask>
    <MobilePurchaseSummary event={event} price={overviewPrice} />
    <div className="container purchase-page-container">
      <header className="purchase-page-header"><h1>Complete your booking</h1></header>
      <div className="purchase-checkout-shell">
        <aside className="purchase-event-sidebar"><PurchaseEventSummary event={event} price={overviewPrice} factsInsideOverview showMemberPriceComparison={false} usesMemberPrice={!guest} priceBadge={<span>{guest ? "Guest ticket" : "Member ticket"}</span>} /></aside>
          <Form className="purchase-form">
            <fieldset disabled={isSubmitting || redirecting} className={styles.fields}>
              {/* {preview && <p className={styles.notice}>Preview only — sample event and prices. No payment will be created.</p>} */}
              {guest && <p className={styles.notice}>You already have a ticket. This additional ticket uses the guest price.</p>}
              {fields.length > 0 && <section><div className="purchase-form-heading"></div><FormExtras inputs={fields} /></section>}
              {event.addOns.isEnabled && event.addOns.items.length > 0 && <section className="mt--40" data-custom-validation-field data-field-name="addOns">
                <h2>{event.addOns.title}</h2>{event.addOns.description && <p>{event.addOns.description}</p>}
                <div className={styles.addOns}>{event.addOns.items.map(item => {
                  const selected = values.addOns.includes(item._id);
                  return <button key={item._id} type="button" className={`${styles.addOn} ${selected ? styles.selected : ""}`} aria-pressed={selected} onClick={() => setFieldValue("addOns", selected ? values.addOns.filter(id => id !== item._id) : event.addOns.multi ? [...values.addOns, item._id] : [item._id])}>
                    <span><strong>{item.title}</strong>{item.description && <span>{item.description}</span>}</span><strong>{item.price ? `+ ${euro(item.price)}` : "Free"}</strong>
                  </button>;
                })}</div>
                <ErrorMessage component="p" className="error" name="addOns" />
              </section>}
              {previewComplete && <p role="status" className={styles.notice}>Your choices are valid. The live page would now open Stripe Checkout.</p>}
              {error && <div role="alert" className={styles.error}>{error}{needsReview && <button type="button" onClick={() => window.location.reload()}>Reload options</button>}</div>}
              <div className="purchase-actions"><a href={eventUrl} className="rn-button-style--2 rn-btn-reverse purchase-action-control">View event</a><button type="submit" disabled={isSubmitting || redirecting || needsReview} className="rn-button-style--2 rn-btn-reverse-green purchase-action-control purchase-action-primary">{isSubmitting || redirecting ? <><Loader /><span>Opening payment…</span></> : <><span>Continue to payment</span><IconlyArrowRight aria-hidden /></>}</button></div>
            </fieldset>
          </Form>
      </div>
    </div>
      </main>;
    }}
  </ValidatedFormik>;
}
EmailTicketPreferences.propTypes = { checkout: PropTypes.string.isRequired, details: PropTypes.object.isRequired, preview: PropTypes.bool };
