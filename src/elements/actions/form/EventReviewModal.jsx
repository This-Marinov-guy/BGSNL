import { EventUpsellDetails, EventAddOnDetails, EventQuestionDetails, EventAdvertisedDetails } from "./EventConfigurationPanels";
import { cloneElement, useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import dynamic from "next/dynamic";
import { Dialog } from "@/compat/primereact";
import EventSubmitProgress from "./EventSubmitProgress";
import { IconlyImageOff } from "@/elements/ui/icons/IconlyIcons";
import ImagePreviewTrigger from "@/elements/ui/media/ImagePreviewTrigger";

const ImageGallery = dynamic(() => import("@/elements/ui/media/ImageGallery"), { ssr: false });

const euro = value => value === undefined || value === null || value === "" ? "Not set" : new globalThis.Intl.NumberFormat("en-NL", { style: "currency", currency: "EUR" }).format(Number(value));
const dateTime = value => {
  const date = value ? new Date(value) : null;
  return date && Number.isFinite(date.valueOf()) ? new globalThis.Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeStyle: "short", timeZone: "Europe/Amsterdam" }).format(date) : "Not set";
};

const ReviewFact = ({ label, value }) => <div className="event-details-modal__fact"><dt>{label}</dt><dd>{value}</dd></div>;
ReviewFact.propTypes = { label: PropTypes.string.isRequired, value: PropTypes.node };

const ReviewSection = ({ title, children }) => <section className="event-details-modal__section"><header className="event-details-modal__section-heading"><h3>{title}</h3></header>{children}</section>;
ReviewSection.propTypes = { children: PropTypes.node.isRequired, title: PropTypes.string.isRequired };

function ReviewImage({ value, label, className = "", imageClassName = "", showCaption = true }) {
  const [url, setUrl] = useState(typeof value === "string" ? value : "");
  const [previewOpen, setPreviewOpen] = useState(false);
  useEffect(() => {
    if (!(value instanceof Blob)) { setUrl(typeof value === "string" ? value : ""); return; }
    const next = URL.createObjectURL(value);
    setUrl(next);
    return () => URL.revokeObjectURL(next);
  }, [value]);
  return url ? <><figure className={className}><ImagePreviewTrigger type="button" className="event-review-modal__media-trigger" imageClassName={imageClassName} onClick={() => setPreviewOpen(true)} aria-label={`Preview ${label.toLowerCase()}`} src={url} alt={label} />{showCaption && <figcaption>{label}</figcaption>}</figure>{previewOpen && <ImageGallery images={[{ src: url, alt: label, label }]} src={url} alt={label} fileName={label} open onClose={() => setPreviewOpen(false)} />}</> : null;
}
ReviewImage.propTypes = { className: PropTypes.string, imageClassName: PropTypes.string, label: PropTypes.string.isRequired, showCaption: PropTypes.bool, value: PropTypes.any };

export default function EventReviewModal({ values, extraImages = [], onCancel, onSubmit, draftAction, allowCloseDuringSubmit = false, disabled = false, updating = false }) {
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
      if (!saved) { busyRef.current = false; setBusy(false); }
    }
  };
  useEffect(() => {
    if (!busy) return;
    const warnBeforeLeaving = event => { event.preventDefault(); event.returnValue = ""; };
    window.addEventListener("beforeunload", warnBeforeLeaving);
    return () => window.removeEventListener("beforeunload", warnBeforeLeaving);
  }, [busy]);
  const canClose = !disabled && (!busy || allowCloseDuringSubmit);
  const close = () => { if (canClose) onCancel(); };
  const title = values.title?.trim() || "Untitled event";
  const mode = values.isFree ? "Free for everyone" : values.isTicketLink ? "External ticket platform" : values.isMemberFree ? "Free for members" : "Paid tickets";
  const questions = values.extraInputsForm ?? [];
  const recommendations = values.subEvent?.links?.filter(link => link.name && link.href) ?? [];
  const reviewMedia = [
    values.ticketImg && { id: "ticket", label: "Ticket image", value: values.ticketImg },
    ...extraImages.map((image, index) => ({
      id: image.id ?? `additional-${index}`,
      label: `Additional image ${index + 1}`,
      value: typeof image === "string" ? image : image.preview ?? image.url ?? image.file,
    })),
  ].filter(media => media?.value);

  if (busy) return <EventSubmitProgress loading={busy} step={stage} closable={canClose} onClose={close} />;

  return <Dialog visible header={<div className="event-details-modal__heading"><div className="event-details-modal__title-row"><span className="event-card__status event-card__status--draft">Preview</span><h2>{title}</h2></div></div>} className="event-details-modal event-review-modal" contentClassName="event-details-modal__body" closable={canClose} closeOnEscape={canClose} dismissableMask={false} blockScroll suspended={draftOpen} onHide={close}>
    <div className="event-details-modal__content">
      {error && <p className="event-review-error" role="alert">{error}</p>}
      <div className="event-details-modal__actions" aria-label="Event actions" role="group">
        <button type="button" className="event-form-button event-form-button--ghost" disabled={disabled} onClick={close}>Continue editing</button>
        {draftAction && cloneElement(draftAction, { disabled: disabled || draftAction.props.disabled, onOpenChange: setDraftOpen })}
        <button type="button" className="event-form-button event-form-button--primary" disabled={disabled} onClick={runSubmit}>{updating ? "Update event" : "Submit event"}</button>
      </div>

      <section className="event-details-modal__summary" aria-label="Event overview">
        <div className={`event-details-modal__media-overview${reviewMedia.length ? "" : " event-review-modal__media-overview--poster-only"}`}>
          <div className="event-details-modal__poster">
            {values.poster ? <ReviewImage value={values.poster} label="Event poster" className="event-details-modal__poster-preview" imageClassName="event-details-modal__poster-image" showCaption={false} /> : <div className="event-details-modal__poster-empty" role="img" aria-label="No poster available"><IconlyImageOff aria-hidden="true" /></div>}
          </div>
          <div className="event-details-modal__media-section" aria-label="Event media"><div className="event-details-modal__media-grid event-review-modal__media-grid" data-items={reviewMedia.length}>
            {reviewMedia.map(media => <ReviewImage key={media.id} value={media.value} label={media.label} className="event-details-modal__media-preview" imageClassName="event-details-modal__media-image" showCaption={false} />)}
          </div></div>
        </div>
        <dl className="event-details-modal__summary-facts">
          <ReviewFact label="Date and time" value={dateTime(values.date)} />
          <ReviewFact label="Location" value={values.location || "Not set"} />
          <ReviewFact label="Region" value={values.region?.replaceAll("_", " / ") || "Not set"} />
          <ReviewFact label="Capacity" value={values.ticketLimit || "Not set"} />
          <ReviewFact label="Audience" value={values.memberOnly ? "Members only" : "Everyone"} />
          <ReviewFact label="Visibility" value={values.hidden ? "Direct link only" : "Listed on the website"} />
        </dl>
      </section>

      <div className="event-details-modal__layout">
        <div className="event-details-modal__main-column">
          <ReviewSection title="Event details"><dl className="event-details-modal__facts-grid">
            <ReviewFact label="Ticket sales" value={values.isSaleClosed ? "Closed" : "Open"} />
            <ReviewFact label="Sales close" value={dateTime(values.ticketTimer)} />
            <ReviewFact label="Additional questions" value={questions.length ? `${questions.length} configured` : "None"} />
            <ReviewFact label="Recommended events" value={recommendations.length ? `${recommendations.length} configured` : "None"} />
          </dl></ReviewSection>
          <ReviewSection title="Description"><p className="event-details-modal__description">{values.text || "No description provided."}</p></ReviewSection>
          <EventUpsellDetails values={values} />
          <EventAddOnDetails addOns={values.addOns} />
        </div>
        <aside className="event-details-modal__side-column">
          <ReviewSection title="Ticket settings"><dl className="event-details-modal__facts-grid event-details-modal__facts-grid--single">
            <ReviewFact label="Ticket type" value={mode} />
            <ReviewFact label="Guest name" value={String(values.ticketName) === "true" ? "Shown on ticket" : "Hidden"} />
            <ReviewFact label="QR code" value={String(values.ticketQR) === "true" ? "Shown on ticket" : "Hidden"} />
          </dl></ReviewSection>
          <ReviewSection title="Pricing">{values.isFree ? <span className="event-details-modal__free-label">Free</span> : values.isTicketLink ? <div className="event-details-modal__notice"><div><strong>External ticketing</strong><span>{values.ticketLink || "Ticket link not set"}</span></div></div> : <div className="event-details-modal__pricing-list">
            <article className="event-details-modal__price-option"><span>Guest</span><strong>{euro(values.guestPrice)}</strong><p>{values.entryIncluding || "Standard entry"}</p></article>
            <article className="event-details-modal__price-option"><span>Member</span><strong>{values.isMemberFree ? "Free" : euro(values.memberPrice)}</strong><p>{values.memberIncluding || "Standard entry"}</p></article>
            <article className="event-details-modal__price-option"><span>Active member</span><strong>{values.isMemberFree ? "Free" : euro(values.activeMemberPrice || values.memberPrice)}</strong></article>
          </div>}</ReviewSection>
          <EventQuestionDetails questions={questions} />
          <EventAdvertisedDetails links={recommendations} renderImage={link => <ReviewImage value={link.poster} label={`${link.name} poster`} className="event-review-modal__advertised-poster" imageClassName="event-review-modal__advertised-image" showCaption={false} />} />
        </aside>
      </div>
    </div>
  </Dialog>;
}
EventReviewModal.propTypes = { values: PropTypes.object.isRequired, extraImages: PropTypes.array, onCancel: PropTypes.func.isRequired, onSubmit: PropTypes.func.isRequired, draftAction: PropTypes.element, allowCloseDuringSubmit: PropTypes.bool, disabled: PropTypes.bool, updating: PropTypes.bool };
