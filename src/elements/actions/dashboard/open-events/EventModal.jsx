import { eventModalData } from "@/util/functions/event-modal-data.mjs";
import EventDetailsContent from "@/elements/actions/form/EventDetailsContent";
import EventCampaignModal from "./EventCampaignModal";
import { useEffect, useMemo, useRef, useState } from "react";
import moment from "moment";
import PropTypes from "prop-types";
import {
  useDispatch,
  useSelector,
} from "react-redux";
import { Dialog } from "@/compat/primereact";
import {
  FiCheck,
  IconlyArchive,
  IconlyDelete,
  IconlyCopy,
  IconlyEdit,
  IconlyLink,
  IconlyImageOff,
  IconlyDocument,
  IconlyTicket,
  FiUsers,
} from "@/elements/ui/icons/IconlyIcons";
import dynamic from "next/dynamic";
import ImageTooltip from "@/elements/ui/media/ImageTooltip";
import ImagePreviewTrigger from "@/elements/ui/media/ImagePreviewTrigger";
const ImageGallery = dynamic(() => import("@/elements/ui/media/ImageGallery"), { ssr: false });
import { useNavigate } from "@/util/navigation";
import { useHttpClient } from "../../../../hooks/common/http-hook";
import {
  editEventFromAll,
  loadSingleEventDashboard,
  removeEventFromAll,
} from "../../../../redux/events";
import { showNotification } from "../../../../redux/notification";
import { selectUser } from "../../../../redux/user";
import {
  EVENT_MANAGEMENT_ACCESS,
  ACCESS_3,
  ACCESS_4,
  EVENT_ARCHIVED,
} from "../../../../util/defines/common";
import { checkAuthorization } from "../../../../util/functions/authorization";
import { capitalizeFirstLetter } from "../../../../util/functions/capitalize";
import {
  formatCorrectedDateTime,
  MOMENT_DATE_TIME,
} from "../../../../util/functions/date";
import ConfirmCenterModal from "../../../ui/modals/ConfirmCenterModal";
import GenerateTicketsModal from "./GenerateTicketsModal";
import GuestListModal from "./GuestListModal";
import EventFeedbackModal from "./EventFeedbackModal";
import WarningBanner from "@/elements/ui/banners/WarningBanner";

import { eventSalesClosed, eventStatusLabel } from "../../../../util/functions/event-status.mjs";
import { DEFAULT_REGION, NATIONAL_EVENT_URL_REGION } from "../../../../util/defines/REGIONS_DESIGN";

const EMPTY_VALUE = "Not set";

const formatOptionalDate = (value) =>
  value ? moment(value).format(MOMENT_DATE_TIME) : EMPTY_VALUE;


const EventImage = ({ label, src, alt, onPreview }) => src ? (
  <ImageTooltip label={label}>
  <ImagePreviewTrigger
    aria-label={`Open ${label.toLowerCase()} media preview`}
    className="event-details-modal__media-preview"
    imageClassName="event-details-modal__media-image"
    onClick={onPreview}
    src={src}
    alt={alt}
    type="button"
  />
  </ImageTooltip>
) : null;

EventImage.propTypes = {
  alt: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  onPreview: PropTypes.func.isRequired,
  src: PropTypes.string,
};

const EventModal = ({
  event: storedEvent,
  extended,
  fullscreen,
  guestSearch,
  loadData,
  modalView,
  onExtendedChange,
  onFullscreenChange,
  onGuestSearchChange,
  onModalViewChange,
  setShow,
  show,
}) => {
  const event = useMemo(() => eventModalData(storedEvent), [storedEvent]);
  const [confirmArchiveVisible, setConfirmArchiveVisible] = useState(false);
  const [confirmCancelVisible, setConfirmCancelVisible] = useState(false);
  const [cancelPreview, setCancelPreview] = useState(null);
  const [cancelPreviewLoading, setCancelPreviewLoading] = useState(false);
  const [cancelPreviewError, setCancelPreviewError] = useState(false);
  const [confirmation, setConfirmation] = useState(null);
  const [confirmationCode, setConfirmationCode] = useState("");
  const [cancelError, setCancelError] = useState("");
  const [requestSubmitting, setRequestSubmitting] = useState(false);
  const [cancelSubmitting, setCancelSubmitting] = useState(false);
  const confirmationInputRef = useRef(null);
  const [ticketGeneratorVisible, setTicketGeneratorVisible] = useState(false);
  const [previewMedia, setPreviewMedia] = useState(null);
  const [savingSales, setSavingSales] = useState(false);
  const { sendRequest, loading } = useHttpClient();
  const user = useSelector(selectUser);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const guestListVisible = modalView === "guest-list";
  const [emailsVisible, setEmailsVisible] = useState(false);
  const [feedbackVisible, setFeedbackVisible] = useState(false);

  useEffect(() => {
    if (confirmCancelVisible && confirmation) confirmationInputRef.current?.focus();
  }, [confirmCancelVisible, confirmation]);

  const isDraft = event.status === "draft";
  const eventTitle = event.title || "Untitled draft";
  const isNationalEvent = event.region === DEFAULT_REGION;
  const eventRegion = isNationalEvent ? "National" : capitalizeFirstLetter(event.region, true) || EMPTY_VALUE;
  const eventDate = event.correctedDate
    ? formatCorrectedDateTime(event.correctedDate)
    : formatOptionalDate(event.date);
  const statusLabel = eventStatusLabel(event);
  const salesClosed = statusLabel === "Past" || eventSalesClosed(event);
  const canToggleSales = !isDraft && !["archived", "cancelled"].includes(event.status) && checkAuthorization(user.session, ACCESS_4);
  const canCancel = !isDraft && !["archived", "cancelled", "canceled"].includes(event.status) && checkAuthorization(user.session, ACCESS_3);
  const cancelCounts = cancelPreview?.counts;
  const cancellationNeedsEmail = cancelPreview?.confirmationRequired !== false;
  const ticketsToRefund = cancelCounts?.paid ?? 0;
  const ticketTotal = cancelCounts?.total ?? (ticketsToRefund + (cancelCounts?.free ?? 0));
  const allTicketsFree = event.isFree === true && ticketsToRefund === 0;
  const cancellationGroups = [
    { label: "Guest tickets", total: cancelCounts?.guestTotal ?? cancelCounts?.guest ?? 0,
      paid: cancelCounts?.guest ?? 0, free: cancelCounts?.guestFree ?? 0, isFree: event.isFree === true },
    { label: "Member tickets", total: cancelCounts?.memberTotal ?? cancelCounts?.member ?? 0,
      paid: cancelCounts?.member ?? 0, free: cancelCounts?.memberFree ?? 0,
      isFree: event.isFree === true || event.isMemberFree === true },
  ];
  const statusModifier = statusLabel
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-");
  const publicEventUrl = !isDraft && event.region
    ? `/${encodeURIComponent(isNationalEvent ? NATIONAL_EVENT_URL_REGION : event.region)}/event-details/${encodeURIComponent(event.slug || event.id)}`
    : null;

  const galleryImages = useMemo(() => [
    { src: event.poster, alt: `${eventTitle} poster`, label: "Poster" },
    { src: event.ticketImg, alt: `${eventTitle} ticket`, label: "Ticket" },
    ...(event.images || []).map((src, index) => ({ src, alt: `${eventTitle} image ${index + 1}`, label: `Additional ${index + 1}` })),
    ...(event.subEvent?.links || []).filter(link => link.name && link.href && link.poster).map(link => ({ src: link.poster, alt: `${link.name} poster`, label: link.name })),
  ], [event.poster, event.ticketImg, event.images, event.subEvent, eventTitle]);

  const closeModal = () => setShow(false);

  const onArchive = async () => {
    const responseData = await sendRequest(
      `future-event/delete-event/${event.id}`,
      "DELETE"
    );

    if (responseData.status) {
      dispatch(showNotification(EVENT_ARCHIVED));
      loadData();
      setConfirmArchiveVisible(false);
      closeModal();
      dispatch(
        removeEventFromAll({
          region: event.region,
          eventId: event.id,
        })
      );
    }
  };

  const loadCancellationPreview = async () => {
    setCancelPreviewLoading(true);
    setCancelPreviewError(false);
    const response = await sendRequest(`future-event/cancel-event/${event.id}/preview`, "GET", null, {}, false, false);
    if (response?.status) {
      setCancelPreview(response);
      setConfirmation(response.confirmation || null);
    }
    else setCancelPreviewError(true);
    setCancelPreviewLoading(false);
  };

  const openCancellation = () => {
    setCancelPreview(null);
    setConfirmation(null);
    setConfirmationCode("");
    setCancelError("");
    setConfirmCancelVisible(true);
    void loadCancellationPreview();
  };

  const finishCancellation = () => {
    dispatch(showNotification({ severity: "success", summary: "Event cancelled",
      detail: ticketsToRefund > 0
        ? "Full refunds and cancellation emails are being processed."
        : ticketTotal > 0 ? "Cancellation emails are being processed." : "The event has been cancelled." }));
    setConfirmCancelVisible(false);
    closeModal();
    dispatch(removeEventFromAll({ region: event.region, eventId: event.id }));
    loadData();
  };

  const requestCancellation = async () => {
    if (!cancelPreview || requestSubmitting) return;
    setRequestSubmitting(true);
    setCancelError("");
    try {
      const response = await sendRequest(`future-event/cancel-event/${event.id}`, "POST", {}, {}, false, false);
      if (response?.status && response.confirmationRequired === false && response.cancellationQueued) {
        finishCancellation();
      } else if (response?.status && response.confirmation) {
        setConfirmation(response.confirmation);
        setConfirmationCode("");
        if (response.confirmation.sent) dispatch(showNotification({ severity: "success", summary: "Confirmation email sent",
          detail: `Check ${response.confirmation.sentTo} for the 8-digit code.` }));
        else dispatch(showNotification({ severity: "info", summary: "Code already sent",
          detail: `Check ${response.confirmation.sentTo}. You can resend after one minute.` }));
      } else setCancelError(cancellationNeedsEmail
        ? "We could not send a new confirmation email. The event is still active. Check the regional contact address or try again after one minute."
        : "We could not verify the cancellation result. Refresh the event list before trying again.");
    } finally { setRequestSubmitting(false); }
  };

  const onCancelEvent = async () => {
    if (!cancelPreview || !confirmation || !/^\d{8}$/.test(confirmationCode) || cancelSubmitting) return;
    setCancelSubmitting(true);
    setCancelError("");
    try {
      const response = await sendRequest(`future-event/cancel-event/${event.id}/confirm`, "POST", { code: confirmationCode }, {}, false, false);
      if (response?.status) {
        finishCancellation();
      } else setCancelError("The code was not accepted. Check it, or request a new email if it has expired.");
    } finally { setCancelSubmitting(false); }
  };

  const toggleSales = async () => {
    if (savingSales) return;
    setSavingSales(true);
    try {
      const response = await sendRequest(
        `future-event/sales/${event.id}`, "PATCH", { isSaleClosed: !salesClosed }, {}, true, false
      );
      if (response?.status && response.event) {
        dispatch(editEventFromAll(response.event));
        dispatch(showNotification({ severity: "success", summary: response.event.isSaleClosed ? "Sales closed" : "Sales opened" }));
      }
    } finally {
      setSavingSales(false);
    }
  };

  const editEvent = (section) => {
    dispatch(loadSingleEventDashboard(storedEvent));
    navigate(`/user/dashboard/events/${event.id}/edit${section ? `?section=${encodeURIComponent(section)}` : ""}`);
  };

  const copyEventText = async (text, label) => {
    if (!text) return;
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        const field = document.createElement("textarea");
        field.value = text;
        field.style.position = "fixed";
        field.style.opacity = "0";
        document.body.append(field);
        field.select();
        const copied = document.execCommand("copy");
        field.remove();
        if (!copied) throw new Error("Clipboard unavailable");
      }
      dispatch(showNotification({ severity: "success", summary: `${label} copied` }));
    } catch {
      dispatch(showNotification({ severity: "error", summary: `Could not copy ${label.toLowerCase()}` }));
    }
  };
  const copyPublicEventLink = () => publicEventUrl && copyEventText(new URL(publicEventUrl, window.location.origin).href, "Event link");

  const modalHeader = (
    <div className="event-details-modal__heading">
      <div className="event-details-modal__title-row">
        <span
          className={`event-card__status event-card__status--${statusModifier}`}
        >
          {statusLabel}
        </span>
        <div className="event-details-modal__title-with-copy">
          <h2 title={eventTitle}>{eventTitle}</h2>
          <button
            type="button"
            className="event-details-modal__copy-id"
            aria-label="Copy event ID"
            title="Copy event ID"
            disabled={!(event.id || event._id)}
            onClick={() => copyEventText(String(event.id || event._id || ""), "Event ID")}
          >
            <IconlyCopy aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {emailsVisible && <EventCampaignModal event={storedEvent} open onClose={() => setEmailsVisible(false)} />}
      {feedbackVisible && <EventFeedbackModal event={storedEvent} onClose={() => setFeedbackVisible(false)} />}
      <ConfirmCenterModal
        title="Archive draft?"
        text="This draft will be removed from the active event list and cannot be restored."
        confirmLabel="Archive event"
        cancelLabel="Keep draft"
        destructive
        onConfirm={onArchive}
        visible={confirmArchiveVisible}
        setVisible={setConfirmArchiveVisible}
        loading={loading}
      />
      <Dialog
        className="event-cancellation-modal"
        header="Cancel event"
        maximizable={false}
        visible={confirmCancelVisible}
        onHide={() => { if (!cancelSubmitting && !requestSubmitting) setConfirmCancelVisible(false); }}
        footer={<div className="event-cancellation-modal__actions">
          <button type="button" className="event-cancellation-modal__back" onClick={() => setConfirmCancelVisible(false)} disabled={cancelSubmitting || requestSubmitting}>Keep event</button>
          <button type="button" className={`event-cancellation-modal__confirm${cancellationNeedsEmail && !confirmation ? " event-cancellation-modal__confirm--request" : ""}`}
            onClick={cancellationNeedsEmail && confirmation ? onCancelEvent : requestCancellation}
            disabled={!cancelPreview || cancelPreviewLoading || requestSubmitting || cancelSubmitting || (cancellationNeedsEmail && confirmation && !/^\d{8}$/.test(confirmationCode))}
            aria-busy={requestSubmitting || cancelSubmitting}>
            {requestSubmitting ? cancellationNeedsEmail ? "Sending email…" : "Cancelling…" : cancelSubmitting ? "Cancelling…" :
              cancellationNeedsEmail && !confirmation ? "Send confirmation email" : ticketsToRefund > 0 ? "Cancel event and refund tickets" : "Cancel event"}
          </button>
        </div>}
      >
        <p><strong>{eventTitle}</strong> will be archived and ticket sales will close {cancelPreview
          ? cancellationNeedsEmail ? "after the regional email code is confirmed" : "when you cancel it"
          : "after you confirm cancellation"}. Ticket holders will then receive a cancellation email.</p>
        {cancelPreviewLoading ? <p role="status">Loading ticket counts…</p> : null}
        {cancelPreviewError ? <div role="alert"><p>Could not load the ticket counts. Try again before confirming.</p>
          <button type="button" onClick={loadCancellationPreview}>Retry</button></div> : null}
        {cancelPreview ? <>
          {cancellationNeedsEmail && <WarningBanner>
            <p>{confirmation ? "A confirmation email was sent to" : "We will send a confirmation email to"} <strong>{confirmation?.sentTo || cancelPreview.confirmationEmail || "the regional contact"}</strong> to verify this request.</p>
          </WarningBanner>}
          <dl className={`event-cancellation-modal__counts${allTicketsFree ? " event-cancellation-modal__counts--single" : ""}`}>
            {allTicketsFree ? <div><dt>Tickets</dt><dd><span>{ticketTotal}</span><span className="event-cancellation-modal__free-badge">Free</span></dd></div>
              : cancellationGroups.map(group => <div key={group.label}>
                <dt>{group.label}</dt>
                <dd>
                  <span>{group.total}</span>
                  {group.isFree && group.paid === 0 ? <span className="event-cancellation-modal__free-badge">Free</span> : null}
                  {group.paid > 0 ? <span className="event-cancellation-modal__count-detail">{group.paid} to refund</span> : null}
                  {group.free > 0 && (!group.isFree || group.paid > 0) ?
                    <span className="event-cancellation-modal__count-detail">{group.free} free</span> : null}
                </dd>
              </div>)}
          </dl>
          {/* {allTicketsFree ? null : ticketsToRefund > 0 ? <p>Paid tickets will be refunded in full.</p> :
            ticketTotal > 0 ? <p>Free tickets will be voided. No refund is due.</p> :
              <p>No tickets have been issued.</p>} */}
          {confirmation ? <div className="event-cancellation-modal__confirmation">
            <p role="status">Enter the 8-digit code from that email. It expires after 10 minutes.</p>
            <label htmlFor="event-cancellation-code">Confirmation code</label>
            <input id="event-cancellation-code" ref={confirmationInputRef} type="text" inputMode="numeric" autoComplete="one-time-code"
              pattern="[0-9]{8}" maxLength={8} value={confirmationCode}
              onChange={e => { setConfirmationCode(e.target.value.replace(/\D/g, "").slice(0, 8)); setCancelError(""); }}
              onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); void onCancelEvent(); } }}
              aria-describedby="event-cancellation-code-hint" />
            <p id="event-cancellation-code-hint">Enter the code from the email to enable cancellation.</p>
            <button type="button" className="event-cancellation-modal__resend" disabled={requestSubmitting || cancelSubmitting}
              onClick={requestCancellation}>Resend code</button>
          </div> : null}
          {cancelError ? <p className="event-cancellation-modal__error" role="alert">{cancelError}</p> : null}
        </> : null}
      </Dialog>
      <GenerateTicketsModal
        visible={ticketGeneratorVisible}
        onHide={() => setTicketGeneratorVisible(false)}
        event={storedEvent}
      />
      <GuestListModal
        extended={extended}
        event={storedEvent}
        maximized={guestListVisible && fullscreen}
        onExtendedChange={onExtendedChange}
        onHide={() => onModalViewChange("event")}
        onMaximizeChange={onFullscreenChange}
        onSearchChange={onGuestSearchChange}
        search={guestSearch}
        visible={guestListVisible}
      />
      <Dialog
        suspended={!!previewMedia || guestListVisible || emailsVisible || feedbackVisible || confirmCancelVisible || ticketGeneratorVisible}
        syncUrl={false}
        className="event-details-modal"
        contentClassName="event-details-modal__body"
        dismissableMask
        header={modalHeader}
        maximized={modalView === "event" && fullscreen}
        onMaximize={({ maximized }) => onFullscreenChange(maximized)}
        onHide={closeModal}
        visible={show}
      >
        <EventDetailsContent
          event={event}
          statusLabel={statusLabel}
          statusModifier={statusModifier}
          dateLabel={eventDate}
          regionLabel={eventRegion}
          salesStatus={isDraft ? "Not open" : eventSalesClosed(event) ? "Closed" : "Open"}
          onEdit={editEvent}
          actions={<>
            {/* {!isDraft && checkAuthorization(user.session, EVENT_MANAGEMENT_ACCESS) && <button className="event-details-modal__action" type="button" onClick={() => setEmailsVisible(true)}><FiMail aria-hidden="true" /><span>Emails</span></button>} */}
            {!isDraft && !isNationalEvent && checkAuthorization(user.session, EVENT_MANAGEMENT_ACCESS) && <button className="event-details-modal__action" type="button" onClick={() => setFeedbackVisible(true)}><IconlyDocument aria-hidden="true" /><span>Feedback</span></button>}
            <button
              className="event-details-modal__action"
              onClick={() => editEvent()}
              type="button"
              title={isDraft ? "Edit draft" : "Edit event"}
            >
              <IconlyEdit aria-hidden="true" />
              <span>Edit</span>
            </button>
            {publicEventUrl ? <button className="event-details-modal__action" type="button" onClick={copyPublicEventLink} title="Copy customer event link">
              <IconlyLink aria-hidden="true" />
              <span>Link</span>
            </button> : null}
            {isDraft && event.readyToPublish === true && checkAuthorization(user.session, ACCESS_4) && (
              <button className="event-details-modal__action event-details-modal__action--complete" type="button" onClick={() => {
                dispatch(loadSingleEventDashboard(storedEvent));
                navigate(`/user/dashboard/events/${event.id}/edit?complete=1`);
              }}>
                <FiCheck aria-hidden="true" /><span>Complete</span>
              </button>
            )}
            {!isDraft && !isNationalEvent && checkAuthorization(user.session, EVENT_MANAGEMENT_ACCESS) ? (
              <button
                className="event-details-modal__action"
                onClick={() => onModalViewChange("guest-list")}
                type="button"
                title="Open guest list"
              >
                <FiUsers aria-hidden="true" />
                <span>Guests</span>
              </button>
            ) : null}
            {!isDraft && !isNationalEvent && checkAuthorization(user.session, EVENT_MANAGEMENT_ACCESS) ? (
              <button
                className="event-details-modal__action event-details-modal__action--primary"
                onClick={() => setTicketGeneratorVisible(true)}
                type="button"
                title="Generate tickets"
              >
                <IconlyTicket aria-hidden="true" />
                <span>Tickets</span>
              </button>
            ) : null}
            {canToggleSales && !isNationalEvent && (
              <button
                type="button"
                role="switch"
                aria-checked={!salesClosed}
                aria-label="Ticket sales"
                aria-busy={savingSales}
                className={`event-details-modal__action event-details-modal__sales-toggle ${salesClosed ? "is-closed" : "is-open"}`}
                disabled={savingSales || statusLabel === "Past"}
                onClick={toggleSales}
                title={statusLabel === "Past" ? "Sales cannot be reopened for a past event" : salesClosed ? "Open ticket sales" : "Close ticket sales"}
              >
                <span className="event-details-modal__sales-track" aria-hidden="true"><span /></span>
                <span>{savingSales ? "Saving…" : `Sales ${salesClosed ? "closed" : "open"}`}</span>
              </button>
            )}
            {isDraft ? <button
              className="event-details-modal__action event-details-modal__action--danger"
              onClick={() => setConfirmArchiveVisible(true)}
              type="button"
              title="Archive event"
            >
              <IconlyArchive aria-hidden="true" />
              <span>Archive event</span>
            </button> : null}
            {canCancel && !isNationalEvent ? <button
              className="event-details-modal__action event-details-modal__action--danger"
              onClick={openCancellation}
              type="button"
              title="Cancel event"
            ><IconlyDelete aria-hidden="true" /><span>Cancel event</span></button> : null}
          </>}
          poster={event.poster ? <ImageTooltip label="Poster"><ImagePreviewTrigger
            aria-label="Open poster media preview" className="event-details-modal__poster-preview"
            imageClassName="event-details-modal__poster-image" src={event.poster} alt={`${eventTitle} poster`} type="button"
            onClick={() => setPreviewMedia({ alt: `${eventTitle} poster`, fileName: `${eventTitle}-poster`, src: event.poster })}
          /></ImageTooltip> : <div className="event-details-modal__poster-empty" role="img" aria-label="No poster available"><IconlyImageOff aria-hidden="true" /></div>}
          media={<>
            <EventImage alt={`${eventTitle} ticket`} label="Ticket" src={event.ticketImg}
              onPreview={() => setPreviewMedia({ alt: `${eventTitle} ticket`, fileName: `${eventTitle}-ticket`, src: event.ticketImg })} />
            {event.images?.map((image, index) => <EventImage key={`${image}-${index}`}
              alt={`${eventTitle} additional image ${index + 1}`} label={`Additional ${index + 1}`} src={image}
              onPreview={() => setPreviewMedia({ alt: `${eventTitle} additional image ${index + 1}`, fileName: `${eventTitle}-image-${index + 1}`, src: image })} />)}
          </>}
          renderAdvertisedImage={link => <figure className="event-review-modal__advertised-poster">
            <ImagePreviewTrigger className="event-review-modal__media-trigger" imageClassName="event-review-modal__advertised-image"
              src={link.poster} alt={`${link.name} poster`} aria-label={`Preview ${link.name} poster`}
              onClick={() => setPreviewMedia({ src: link.poster, alt: `${link.name} poster`, fileName: `${link.name}-poster` })} />
          </figure>}
        />
      </Dialog>
      {previewMedia ? (
        <ImageGallery
          images={galleryImages}
          alt={previewMedia.alt}
          fileName={previewMedia.fileName}
          onClose={() => setPreviewMedia(null)}
          open
          src={previewMedia.src}
        />
      ) : null}
    </>
  );
};

EventModal.propTypes = {
  event: PropTypes.object.isRequired,
  extended: PropTypes.bool.isRequired,
  fullscreen: PropTypes.bool.isRequired,
  guestSearch: PropTypes.string.isRequired,
  loadData: PropTypes.func.isRequired,
  modalView: PropTypes.oneOf(["event", "guest-list"]).isRequired,
  onExtendedChange: PropTypes.func.isRequired,
  onFullscreenChange: PropTypes.func.isRequired,
  onGuestSearchChange: PropTypes.func.isRequired,
  onModalViewChange: PropTypes.func.isRequired,
  setShow: PropTypes.func.isRequired,
  show: PropTypes.bool.isRequired,
};

export default EventModal;
