import { promoAudiences } from "@/util/functions/event-promo-codes.mjs";
import { cloneElement, useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import { Dialog } from "@/compat/primereact";
import EventSubmitProgress from "./EventSubmitProgress";

const euro = value => value === undefined || value === null || value === "" ? "Not set" : new globalThis.Intl.NumberFormat("en-NL", { style: "currency", currency: "EUR" }).format(Number(value));
const dateTime = value => {
  const date = value ? new Date(value) : null;
  return date && Number.isFinite(date.valueOf()) ? new globalThis.Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeStyle: "short", timeZone: "Europe/Amsterdam" }).format(date) : "Not set";
};
function ReviewImage({ value, label }) {
  const [url, setUrl] = useState(typeof value === "string" ? value : "");
  useEffect(() => {
    if (!(value instanceof Blob)) { setUrl(typeof value === "string" ? value : ""); return; }
    const next = URL.createObjectURL(value);
    setUrl(next);
    return () => URL.revokeObjectURL(next);
  }, [value]);
  return url ? <figure><img src={url} alt={label} /><figcaption>{label}</figcaption></figure> : null;
}
ReviewImage.propTypes = { value: PropTypes.any, label: PropTypes.string.isRequired };

export default function EventReviewModal({ values, extraImagesCount = 0, onCancel, onSubmit, draftAction, disabled = false, updating = false }) {
  const [busy, setBusy] = useState(false);
  const [stage, setStage] = useState(0);
  const [error, setError] = useState("");
  const [draftOpen, setDraftOpen] = useState(false);
  const busyRef = useRef(false);
  const runSubmit = async () => {
    if (busyRef.current || disabled) return;
    busyRef.current = true;
    setBusy(true); setStage(0); setError("");
    let saved = false;
    try {
      const result = await onSubmit(setStage);
      saved = Boolean(result);
      if (!result) setError("Your event could not be saved. Review your connection and try again. Your changes are still here.");
    } catch {
      setError("Your event could not be saved. Please try again. Your changes are still here.");
    } finally {
      if (!saved) {
        busyRef.current = false;
        setBusy(false);
      }
    }
  };
  useEffect(() => {
    if (!busy) return;
    const warnBeforeLeaving = event => { event.preventDefault(); event.returnValue = ""; };
    window.addEventListener("beforeunload", warnBeforeLeaving);
    return () => window.removeEventListener("beforeunload", warnBeforeLeaving);
  }, [busy]);
  const close = () => { if (!busyRef.current && !disabled) onCancel(); };
  const mode = values.isFree ? "Free for everyone" : values.isTicketLink ? "External ticket platform" : values.isMemberFree ? "Free for members" : "Paid tickets";
  const questions = values.extraInputsForm ?? [];
  const recommendations = values.subEvent?.links?.filter(link => link.name && link.href) ?? [];
  return <Dialog visible header={busy ? "Saving your event" : updating ? "Review event changes" : "Review your event"} className={`event-review-modal${busy ? " event-review-modal--loading" : ""}`} closable={!busy && !disabled} closeOnEscape={!busy && !disabled} dismissableMask={false} blockScroll suspended={draftOpen} onHide={close}
    footer={busy ? undefined : <div className="event-review-actions">
      <button type="button" className="event-form-button event-form-button--ghost" disabled={disabled} onClick={close}>Cancel</button>
      {draftAction && cloneElement(draftAction, { disabled: disabled || draftAction.props.disabled, onOpenChange: setDraftOpen })}
      <button type="button" className="event-form-button event-form-button--primary" disabled={disabled} onClick={runSubmit}>Submit</button>
    </div>}>
    {busy ? <EventSubmitProgress step={stage} /> : <div className="event-review-content">
      {error && <p className="event-review-error" role="alert">{error}</p>}
      <section className="event-review-overview" aria-label="Event overview">
        <ReviewImage value={values.poster} label="Event poster" />
        <div><h3>{values.title}</h3><dl className="event-review-facts">
          <div><dt>Region</dt><dd>{values.region?.replaceAll("_", " / ")}</dd></div>
          <div><dt>Date & time</dt><dd>{dateTime(values.date)}</dd></div>
          <div><dt>Location</dt><dd>{values.location}</dd></div>
          <div><dt>Ticket sales close</dt><dd>{dateTime(values.ticketTimer)}</dd></div>
          <div><dt>Ticket limit</dt><dd>{values.ticketLimit}</dd></div>
          <div><dt>Audience</dt><dd>{values.memberOnly ? "Members only" : "Everyone"}</dd></div>
          <div><dt>Visibility</dt><dd>{values.hidden ? "Direct link only" : "Listed on the website"}</dd></div>
          <div><dt>Sales</dt><dd>{values.isSaleClosed ? "Closed" : "Open until the deadline"}</dd></div>
        </dl></div>
      </section>
      <section><h3>Tickets & media</h3><p>{mode}</p>
        {!values.isFree && !values.isTicketLink && <dl className="event-review-prices">
          <div><dt>Guest</dt><dd>{euro(values.guestPrice)}</dd></div><div><dt>Member</dt><dd>{values.isMemberFree ? "Free" : euro(values.memberPrice)}</dd></div><div><dt>Active member</dt><dd>{values.isMemberFree ? "Free" : euro(values.activeMemberPrice || values.memberPrice)}</dd></div>
        </dl>}
        {values.isTicketLink && <p className="event-review-link">{values.ticketLink}</p>}
        {values.entryIncluding && <p><strong>Guest extras:</strong> {values.entryIncluding}</p>}
        {values.memberIncluding && <p><strong>Member extras:</strong> {values.memberIncluding}</p>}
        <ReviewImage value={values.ticketImg} label="Ticket image" />
        <p>{extraImagesCount} extra {extraImagesCount === 1 ? "image" : "images"} · Guest name {String(values.ticketName) === "true" ? "shown" : "hidden"} · QR code {String(values.ticketQR) === "true" ? "shown" : "hidden"}</p>
      </section>
      <section><h3>Description</h3><p className="event-review-description">{values.text}</p></section>
      <section><h3>Collect data</h3>{questions.length ? <ul>{questions.map((question, index) => <li key={index}><strong>{question.placeholder}</strong> · {question.type === "select" ? "Choice" : "Written answer"} · {question.required === true || question.required === "true" ? "Required" : "Optional"}{question.type === "select" && <p>{question.options?.join(" · ")}</p>}</li>)}</ul> : <p>No extra questions.</p>}</section>
      <section><h3>Upsell</h3><ul className="event-review-upsell">
        {["earlyBird", "lateBird"].filter(name => values[name]?.isEnabled).map(name => <li key={name}><strong>{name === "earlyBird" ? "Early bird" : "Late bird"}</strong> · Guest {euro(values[name].price)} / member {euro(values[name].memberPrice)}<p>{values[name].ticketLimit ? `Ticket count cap: ${values[name].ticketLimit}. ` : ""}{values[name].ticketTimer ? `Ends ${dateTime(values[name].ticketTimer)}.` : ""}{values[name].startTimer ? `Starts ${dateTime(values[name].startTimer)}.` : ""}</p></li>)}
        {["guestPromotion", "memberPromotion"].filter(name => values[name]?.isEnabled).map(name => <li key={name}><strong>{name === "guestPromotion" ? "Guest" : "Member"} promotion</strong> · {values[name].discount}% off<p>{dateTime(values[name].startTimer)} – {dateTime(values[name].endTimer)}</p></li>)}
        {values.promoCodes?.isEnabled && values.promoCodes.codes?.map((code, index) => <li key={`promo-${index}`}><strong>{code.code}</strong> · {Number(code.discountType) === 1 ? euro(code.discount) : `${code.discount}%`} off · {code.active === false ? "Inactive" : "Active"}<p>{promoAudiences.filter(audience => (code.audiences ?? promoAudiences.map(item => item.value)).includes(audience.value)).map(audience => audience.label).join(", ")} · {code.useLimit ? `${code.useLimit} redemptions` : "Unlimited redemptions"} · {code.timeLimit ? `Expires ${dateTime(code.timeLimit)}` : "No expiration"}</p></li>)}
        {values.addOns?.isEnabled && <li><strong>{values.addOns.title || "Add-ons"}</strong><p>{values.addOns.items?.map(item => `${item.title} (${euro(item.price ?? 0)})`).join(" · ")}</p></li>}
        {recommendations.length > 0 && <li><strong>Advertised events</strong><p>{recommendations.map(link => link.name).join(" · ")}</p></li>}
      </ul>
      {![values.earlyBird, values.lateBird, values.guestPromotion, values.memberPromotion, values.addOns, values.promoCodes].some(option => option?.isEnabled) && !recommendations.length && <p>No upsell options enabled.</p>}
      </section>
    </div>}
  </Dialog>;
}
EventReviewModal.propTypes = { values: PropTypes.object.isRequired, extraImagesCount: PropTypes.number, onCancel: PropTypes.func.isRequired, onSubmit: PropTypes.func.isRequired, draftAction: PropTypes.element, disabled: PropTypes.bool, updating: PropTypes.bool };
