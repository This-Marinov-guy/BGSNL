import { formatDisplayDateTime } from "@/util/functions/display-date.mjs";
import EventDetailsContent from "./EventDetailsContent";
import { cloneElement, useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import { useDispatch } from "react-redux";
import dynamic from "next/dynamic";
import { Dialog } from "@/compat/primereact";
import EventSubmitProgress from "./EventSubmitProgress";
import { IconlyImageOff } from "@/elements/ui/icons/IconlyIcons";
import ImagePreviewTrigger from "@/elements/ui/media/ImagePreviewTrigger";
import EventPromotionCampaignModal from "./EventPromotionCampaignModal";
import { showNotification } from "../../../redux/notification";

const ImageGallery = dynamic(() => import("@/elements/ui/media/ImageGallery"), { ssr: false });

const dateTime = value => {
  const date = value ? new Date(value) : null;
  return date && Number.isFinite(date.valueOf()) ? formatDisplayDateTime(date) : "Not set";
};

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

export default function EventReviewModal({ values, extraImages = [], onCancel, onEditSection, onSubmit, draftAction, promotionChanges = [], allowCloseDuringSubmit = false, disabled = false, updating = false }) {
  const dispatch = useDispatch();
  const [busy, setBusy] = useState(false);
  const [stage, setStage] = useState(0);
  const [draftOpen, setDraftOpen] = useState(false);
  const [promotionOpen, setPromotionOpen] = useState(false);
  const busyRef = useRef(false);
  const runSubmit = async (reviewPromotionEmail = false) => {
    if (busyRef.current || disabled) return;
    busyRef.current = true;
    setBusy(true); setStage(0);
    try {
      const result = await onSubmit(setStage, reviewPromotionEmail);
      if (!result) dispatch(showNotification({ severity: "error", summary: "Event could not be saved", detail: "Review your connection and try again. Your changes are still here." }));
    } catch {
      dispatch(showNotification({ severity: "error", summary: "Event could not be saved", detail: "Please try again. Your changes are still here." }));
    } finally {
      busyRef.current = false;
      setBusy(false);
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
  const previewEvent = {
    ...values,
    product: {
      guest: { price: values.guestPrice },
      member: { price: values.memberPrice },
      activeMember: { price: values.activeMemberPrice },
    },
  };
  const reviewMedia = [
    values.ticketImg && { id: "ticket", label: "Ticket image", value: values.ticketImg },
    ...extraImages.map((image, index) => ({
      id: image.id ?? `additional-${index}`,
      label: `Additional image ${index + 1}`,
      value: typeof image === "string" ? image : image.preview ?? image.url ?? image.file,
    })),
  ].filter(media => media?.value);

  if (busy) return <EventSubmitProgress loading={busy} step={stage} closable={canClose} onClose={close} />;

  return <><Dialog visible header={<div className="event-details-modal__heading"><div className="event-details-modal__title-row"><span className="event-card__status event-card__status--draft">Preview</span><div className="event-details-modal__title-with-copy"><h2>{title}</h2></div></div></div>} className="event-details-modal event-review-modal" contentClassName="event-details-modal__body" closable={canClose} closeOnEscape={canClose} dismissableMask={false} blockScroll suspended={draftOpen || promotionOpen} onHide={close}>
    <EventDetailsContent
      event={previewEvent}
      preview
      statusLabel="Preview"
      statusModifier="draft"
      dateLabel={dateTime(values.date)}
      regionLabel={values.region === "netherlands" ? "National" : values.region?.replaceAll("_", " / ") || "Not set"}
      salesStatus={values.isSaleClosed ? "Closed" : updating ? "Open" : "Opens after submission"}
      onEdit={onEditSection}
      actions={<>
        <button type="button" className="event-form-button event-form-button--ghost" disabled={disabled} onClick={close}>Continue editing</button>
        {draftAction && cloneElement(draftAction, { disabled: disabled || draftAction.props.disabled, onOpenChange: setDraftOpen })}
        <button type="button" className="event-form-button event-form-button--primary" disabled={disabled} onClick={() => promotionChanges.length ? setPromotionOpen(true) : runSubmit()}>{updating ? "Update event" : "Submit event"}</button>
      </>}
      poster={values.poster ? <ReviewImage value={values.poster} label="Event poster" className="event-details-modal__poster-preview" imageClassName="event-details-modal__poster-image" showCaption={false} /> : <div className="event-details-modal__poster-empty" role="img" aria-label="No poster available"><IconlyImageOff aria-hidden="true" /></div>}
      media={reviewMedia.map(item => <ReviewImage key={item.id} value={item.value} label={item.label} className="event-details-modal__media-preview" imageClassName="event-details-modal__media-image" showCaption={false} />)}
      renderAdvertisedImage={link => <ReviewImage value={link.poster} label={`${link.name} poster`} className="event-review-modal__advertised-poster" imageClassName="event-review-modal__advertised-image" showCaption={false} />}
    />
  </Dialog>
    <EventPromotionCampaignModal open={promotionOpen} eventTitle={title} changes={promotionChanges}
      onClose={() => setPromotionOpen(false)} onConfirm={reviewEmail => { setPromotionOpen(false); runSubmit(reviewEmail); return true; }} />
  </>;
}
EventReviewModal.propTypes = { values: PropTypes.object.isRequired, extraImages: PropTypes.array, onCancel: PropTypes.func.isRequired, onEditSection: PropTypes.func.isRequired, onSubmit: PropTypes.func.isRequired, draftAction: PropTypes.element, promotionChanges: PropTypes.arrayOf(PropTypes.string), allowCloseDuringSubmit: PropTypes.bool, disabled: PropTypes.bool, updating: PropTypes.bool };
