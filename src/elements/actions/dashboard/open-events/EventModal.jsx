import { eventModalData } from "@/util/functions/event-modal-data.mjs";
import { EventUpsellDetails, EventAddOnDetails, EventQuestionDetails, EventAdvertisedDetails } from "@/elements/actions/form/EventConfigurationPanels";
import { useMemo, useState } from "react";
import moment from "moment";
import PropTypes from "prop-types";
import {
  useDispatch,
  useSelector,
} from "react-redux";
import { Dialog } from "@/compat/primereact";
import {
  FiCheck,
  IconlyDelete,
  IconlyEdit,
  IconlyExternalLink,
  IconlyImageOff,
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
  ACCESS_4,
  EVENT_DELETED,
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

import { eventSalesClosed, eventStatusLabel } from "../../../../util/functions/event-status.mjs";

const EMPTY_VALUE = "Not set";

const formatOptionalDate = (value) =>
  value ? moment(value).format(MOMENT_DATE_TIME) : EMPTY_VALUE;

const formatPrice = (value) => {
  if (value == null || value === "") return EMPTY_VALUE;

  const amount = Number(value);

  return Number.isFinite(amount)
    ? `€${amount.toLocaleString("en-NL", { maximumFractionDigits: 2 })}`
    : EMPTY_VALUE;
};

const EventFact = ({ label, value, highlight = false }) => (
  <div className="event-details-modal__fact">
    <dt>{label}</dt>
    <dd className={highlight ? "is-highlighted" : undefined}>{value}</dd>
  </div>
);

EventFact.propTypes = {
  highlight: PropTypes.bool,
  label: PropTypes.string.isRequired,
  value: PropTypes.node,
};

const DetailSection = ({ title, description, children, className = "" }) => (
  <section className={`event-details-modal__section ${className}`.trim()}>
    <header className="event-details-modal__section-heading">
      <h3>{title}</h3>
      {description ? <p>{description}</p> : null}
    </header>
    {children}
  </section>
);

DetailSection.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  description: PropTypes.string,
  title: PropTypes.string.isRequired,
};

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

const PriceOption = ({ label, price, including }) => (
  <article className="event-details-modal__price-option">
    <span>{label}</span>
    <strong>{price}</strong>
    <p>{including || "Standard entry"}</p>
  </article>
);

PriceOption.propTypes = {
  including: PropTypes.string,
  label: PropTypes.string.isRequired,
  price: PropTypes.string.isRequired,
};

const EventModal = ({ event: storedEvent, show, setShow, loadData }) => {
  const event = useMemo(() => eventModalData(storedEvent), [storedEvent]);
  const [confirmDeleteVisible, setConfirmDeleteVisible] = useState(false);
  const [ticketGeneratorVisible, setTicketGeneratorVisible] = useState(false);
  const [guestListVisible, setGuestListVisible] = useState(false);
  const [previewMedia, setPreviewMedia] = useState(null);
  const [savingSales, setSavingSales] = useState(false);
  const { sendRequest, loading } = useHttpClient();
  const user = useSelector(selectUser);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const isDraft = event.status === "draft";
  const eventTitle = event.title || "Untitled draft";
  const eventRegion = capitalizeFirstLetter(event.region, true) || EMPTY_VALUE;
  const eventDate = event.correctedDate
    ? formatCorrectedDateTime(event.correctedDate)
    : formatOptionalDate(event.date);
  const statusLabel = eventStatusLabel(event);
  const salesClosed = statusLabel === "Past" || eventSalesClosed(event);
  const canToggleSales = !isDraft && !["archived", "cancelled"].includes(event.status) && checkAuthorization(user.session, ACCESS_4);
  const statusModifier = statusLabel
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-");
  const publicEventUrl = !isDraft && event.region
    ? `/${encodeURIComponent(event.region)}/event-details/${encodeURIComponent(event.slug || event.id)}`
    : null;

  const galleryImages = useMemo(() => [
    { src: event.poster, alt: `${eventTitle} poster`, label: "Poster" },
    { src: event.ticketImg, alt: `${eventTitle} ticket`, label: "Ticket" },
    ...(event.images || []).map((src, index) => ({ src, alt: `${eventTitle} image ${index + 1}`, label: `Additional ${index + 1}` })),
    ...(event.subEvent?.links || []).filter(link => link.name && link.href && link.poster).map(link => ({ src: link.poster, alt: `${link.name} poster`, label: link.name })),
  ], [event.poster, event.ticketImg, event.images, event.subEvent, eventTitle]);

  const closeModal = () => setShow(false);

  const onDelete = async () => {
    const responseData = await sendRequest(
      `future-event/delete-event/${event.id}`,
      "DELETE"
    );

    if (responseData.status) {
      dispatch(showNotification(EVENT_DELETED));
      loadData();
      setConfirmDeleteVisible(false);
      closeModal();
      dispatch(
        removeEventFromAll({
          region: event.region,
          eventId: event.id,
        })
      );
    }
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

  const editEvent = () => {
    dispatch(loadSingleEventDashboard(storedEvent));
    navigate(`/user/dashboard/events/${event.id}/edit`);
  };

  const copyPublicEventLink = async () => {
    if (!publicEventUrl) return;
    try {
      const link = new URL(publicEventUrl, window.location.origin).href;
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(link);
      } else {
        const field = document.createElement("textarea");
        field.value = link;
        field.style.position = "fixed";
        field.style.opacity = "0";
        document.body.append(field);
        field.select();
        const copied = document.execCommand("copy");
        field.remove();
        if (!copied) throw new Error("Clipboard unavailable");
      }
      dispatch(showNotification({ severity: "success", summary: "Event link copied" }));
    } catch {
      dispatch(showNotification({ severity: "error", summary: "Could not copy the event link" }));
    }
  };

  const modalHeader = (
    <div className="event-details-modal__heading">
      <div className="event-details-modal__title-row">
        <span
          className={`event-card__status event-card__status--${statusModifier}`}
        >
          {statusLabel}
        </span>
        <h2>{eventTitle}</h2>
      </div>
    </div>
  );

  return (
    <>
      <ConfirmCenterModal
        text="Deleting this event cannot be undone. Are you sure you want to continue?"
        onConfirm={onDelete}
        visible={confirmDeleteVisible}
        setVisible={setConfirmDeleteVisible}
        loading={loading}
      />
      <GenerateTicketsModal
        visible={ticketGeneratorVisible}
        onHide={() => setTicketGeneratorVisible(false)}
        event={storedEvent}
      />
      <GuestListModal
        event={storedEvent}
        onHide={() => setGuestListVisible(false)}
        visible={guestListVisible}
      />
      <Dialog
        suspended={!!previewMedia || guestListVisible}
        className="event-details-modal"
        contentClassName="event-details-modal__body"
        dismissableMask
        header={modalHeader}
        onHide={closeModal}
        visible={show}
      >
        <div className="event-details-modal__content">
          <div
            aria-label="Event actions"
            className="event-details-modal__actions"
            role="group"
          >
            <button
              className="event-details-modal__action"
              onClick={editEvent}
              type="button"
              title={isDraft ? "Edit draft" : "Edit event"}
            >
              <IconlyEdit aria-hidden="true" />
              <span>Edit</span>
            </button>
            {publicEventUrl ? <button className="event-details-modal__action" type="button" onClick={copyPublicEventLink} title="Copy customer event link">
              <IconlyExternalLink aria-hidden="true" />
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
            {!isDraft && checkAuthorization(user.session, EVENT_MANAGEMENT_ACCESS) ? (
              <button
                className="event-details-modal__action"
                onClick={() => setGuestListVisible(true)}
                type="button"
                title="Open guest list"
              >
                <FiUsers aria-hidden="true" />
                <span>Guests</span>
              </button>
            ) : null}
            {!isDraft && checkAuthorization(user.session, EVENT_MANAGEMENT_ACCESS) ? (
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
            {canToggleSales && (
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
            <button
              className="event-details-modal__action event-details-modal__action--danger"
              onClick={() => setConfirmDeleteVisible(true)}
              type="button"
              title="Delete event"
            >
              <IconlyDelete aria-hidden="true" />
              <span>Delete</span>
            </button>
          </div>

          <section className="event-details-modal__summary">
            <div className="event-details-modal__media-overview">
              <div className="event-details-modal__poster">
                {event.poster ? (
                  <ImageTooltip label="Poster">
                  <ImagePreviewTrigger
                    aria-label="Open poster media preview"
                    className="event-details-modal__poster-preview"
                    imageClassName="event-details-modal__poster-image"
                    onClick={() =>
                      setPreviewMedia({
                        alt: `${eventTitle} poster`,
                        fileName: `${eventTitle}-poster`,
                        src: event.poster,
                      })
                    }
                    src={event.poster}
                    alt={`${eventTitle} poster`}
                    type="button"
                  />
                  </ImageTooltip>
                ) : (
                  <div className="event-details-modal__poster-empty" role="img" aria-label="No poster available">
                    <IconlyImageOff aria-hidden="true" />
                  </div>
                )}
              </div>
              <div className="event-details-modal__media-section" aria-label="Event media">
                <div className="event-details-modal__media-grid">
                  <EventImage
                    alt={`${eventTitle} ticket`}
                    label="Ticket"
                    onPreview={() =>
                      setPreviewMedia({
                        alt: `${eventTitle} ticket`,
                        fileName: `${eventTitle}-ticket`,
                        src: event.ticketImg,
                      })
                    }
                    src={event.ticketImg}
                  />
                  {event.images?.map((image, index) => (
                    <EventImage
                      alt={`${eventTitle} additional image ${index + 1}`}
                      key={`${image}-${index}`}
                      label={`Additional ${index + 1}`}
                      onPreview={() =>
                        setPreviewMedia({
                          alt: `${eventTitle} additional image ${index + 1}`,
                          fileName: `${eventTitle}-image-${index + 1}`,
                          src: image,
                        })
                      }
                      src={image}
                    />
                  ))}
                </div>
              </div>
            </div>
            <dl className="event-details-modal__summary-facts">
              <EventFact
                label="Status"
                value={<span className={`event-card__status event-card__status--${statusModifier}`}>{statusLabel}</span>}
              />
              <EventFact label="Date and time" value={eventDate} />
              <EventFact label="Location" value={event.location || EMPTY_VALUE} />
              <EventFact label="Region" value={eventRegion} />
              <EventFact
                label="Capacity"
                value={event.ticketLimit ?? EMPTY_VALUE}
              />
              <EventFact
                label="Visibility"
                value={event.hidden ? "Hidden" : "Visible"}
              />
            </dl>
          </section>

          <div className="event-details-modal__layout">
            <div className="event-details-modal__main-column">
              <DetailSection title="Event details">
                <dl className="event-details-modal__facts-grid">
                  <EventFact
                    label="Subtitle"
                    value={event.description || "None"}
                  />
                  <EventFact
                    label="Audience"
                    value={event.memberOnly ? "Members only" : "Everyone"}
                  />
                  <EventFact
                    label="Additional form fields"
                    value={event.extraInputsForm?.length > 0 ? `${event.extraInputsForm.length} configured` : "None"}
                  />
                  <EventFact label="Recommended events" value={event.subEvent?.links?.filter(link => link.name && link.href).length || "None"} />
                  {event.subEventDescription ? (
                    <EventFact
                      label="Sub-event"
                      value={event.subEventDescription}
                    />
                  ) : null}
                </dl>
              </DetailSection>

              <DetailSection title="Description">
                <p className="event-details-modal__description">
                  {event.text || "No description provided."}
                </p>
              </DetailSection>
              <EventUpsellDetails values={event} />
              <EventAddOnDetails addOns={event.addOns} />
            </div>

            <aside className="event-details-modal__side-column">
              <DetailSection title="Ticket settings">
                <dl className="event-details-modal__facts-grid event-details-modal__facts-grid--single">
                  <EventFact
                    label="Sales close"
                    value={formatOptionalDate(event.ticketTimer)}
                  />
                  <EventFact
                    label="Sales status"
                    value={isDraft ? "Not open" : eventSalesClosed(event) ? "Closed" : "Open"}
                  />
                  <EventFact label="Ticket type" value={event.isFree ? "Free for everyone" : event.isTicketLink ? "External ticket platform" : event.isMemberFree ? "Free for members" : "Paid tickets"} />
                  <EventFact label="Guest name" value={String(event.ticketName) === "true" ? "Shown on ticket" : "Hidden"} />
                  <EventFact label="QR code" value={String(event.ticketQR) === "true" ? "Shown on ticket" : "Hidden"} />
                </dl>
              </DetailSection>

              <DetailSection title="Pricing">
                {event.isFree ? (
                  <span className="event-details-modal__free-label">Free</span>
                ) : event.isTicketLink ? (
                  <div className="event-details-modal__notice">
                    <IconlyExternalLink aria-hidden="true" />
                    <div>
                      <strong>External ticketing</strong>
                      {event.ticketLink ? <a href={event.ticketLink} rel="noreferrer" target="_blank">Open ticket page</a> : <span>Ticket link not set</span>}
                    </div>
                  </div>
                ) : (
                  <div className="event-details-modal__pricing-list">
                    {event.product?.guest ? (
                      <PriceOption
                        including={event.entryIncluding}
                        label="Guest"
                        price={formatPrice(event.product.guest.price)}
                      />
                    ) : null}
                    {event.product?.member || event.isMemberFree ? (
                      <PriceOption
                        including={event.memberIncluding}
                        label="Member"
                        price={
                          event.isMemberFree
                            ? "Free"
                            : formatPrice(event.product?.member?.price)
                        }
                      />
                    ) : null}
                    {event.product?.activeMember || event.product?.member || event.isMemberFree ? (
                      <PriceOption
                        label="Active member"
                        price={event.isMemberFree ? "Free" : formatPrice(event.product?.activeMember?.price === "" ? event.product?.member?.price : event.product?.activeMember?.price ?? event.product?.member?.price)}
                      />
                    ) : null}
                    {!event.product?.guest &&
                    !event.product?.member &&
                    !event.product?.activeMember &&
                    !event.isMemberFree ? (
                      <p className="event-details-modal__empty-copy">
                        No pricing configured.
                      </p>
                    ) : null}
                  </div>
                )}
              </DetailSection>
              <EventQuestionDetails questions={event.extraInputsForm ?? []} />
              <EventAdvertisedDetails links={event.subEvent?.links ?? []} renderImage={link => (
                <figure className="event-review-modal__advertised-poster">
                  <ImagePreviewTrigger
                    className="event-review-modal__media-trigger"
                    imageClassName="event-review-modal__advertised-image"
                    src={link.poster}
                    alt={`${link.name} poster`}
                    aria-label={`Preview ${link.name} poster`}
                    onClick={() => setPreviewMedia({ src: link.poster, alt: `${link.name} poster`, fileName: `${link.name}-poster` })}
                  />
                </figure>
              )} />
            </aside>
          </div>


        </div>
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
  loadData: PropTypes.func.isRequired,
  setShow: PropTypes.func.isRequired,
  show: PropTypes.bool.isRequired,
};

export default EventModal;
