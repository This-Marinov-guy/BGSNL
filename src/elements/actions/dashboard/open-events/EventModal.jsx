import { useMemo, useState } from "react";
import moment from "moment";
import PropTypes from "prop-types";
import {
  useDispatch,
  useSelector,
} from "react-redux";
import { Dialog } from "@/compat/primereact";
import {
  IconlyCalendar,
  FiCheck,
  IconlyDelete,
  IconlyEdit,
  IconlyExternalLink,
  IconlyImage,
  IconlyLocation,
  IconlyShow,
  IconlyTicket,
} from "@/elements/ui/icons/IconlyIcons";
import dynamic from "next/dynamic";
import ImageTooltip from "@/elements/ui/media/ImageTooltip";
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
  ACCESS_3,
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

const PreviewOverlay = () => (
  <span aria-hidden="true" className="media-trigger__overlay">
    <span className="media-trigger__eye">
      <IconlyShow />
    </span>
  </span>
);

const EventImage = ({ label, src, alt, onPreview }) => src ? (
  <ImageTooltip label={label}>
  <button
    aria-label={`Open ${label.toLowerCase()} media preview`}
    className="event-details-modal__media-preview media-trigger"
    onClick={onPreview}
    type="button"
  >
    <img alt={alt} className="event-details-modal__media-image" src={src} />
    <PreviewOverlay />
  </button>
  </ImageTooltip>
) : null;

EventImage.propTypes = {
  alt: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  onPreview: PropTypes.func.isRequired,
  src: PropTypes.string,
};

const PriceOption = ({ label, price, including, priceId }) => (
  <article className="event-details-modal__price-option">
    <span>{label}</span>
    <strong>{price}</strong>
    <p>{including || "Standard entry"}</p>
    {priceId ? <small>Price ID: {priceId}</small> : null}
  </article>
);

PriceOption.propTypes = {
  including: PropTypes.string,
  label: PropTypes.string.isRequired,
  price: PropTypes.string.isRequired,
  priceId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
};

const EventModal = ({ event, show, setShow, loadData }) => {
  const [confirmDeleteVisible, setConfirmDeleteVisible] = useState(false);
  const [ticketGeneratorVisible, setTicketGeneratorVisible] = useState(false);
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
  const backgroundImage =
    event.bgImageExtra && event.bgImageSelection === 2
      ? event.bgImageExtra
      : event.bgImage != null
        ? `/assets/images/bg/bg-image-${event.bgImage}.webp`
        : null;

  const galleryImages = useMemo(() => [
    { src: event.poster, alt: `${eventTitle} poster`, label: "Poster" },
    { src: event.ticketImg, alt: `${eventTitle} ticket`, label: "Ticket" },
    { src: backgroundImage, alt: `${eventTitle} background`, label: "Background" },
    ...(event.images || []).map((src, index) => ({ src, alt: `${eventTitle} image ${index + 1}`, label: `Additional ${index + 1}` })),
  ], [event.poster, event.ticketImg, event.images, eventTitle, backgroundImage]);

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
    dispatch(loadSingleEventDashboard(event));
    navigate(`/user/dashboard/events/${event.id}/edit`);
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
      <div className="event-details-modal__heading-meta">
        <span>
          <IconlyLocation aria-hidden="true" />
          {eventRegion}
        </span>
        <span>
          <IconlyCalendar aria-hidden="true" />
          {eventDate}
        </span>
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
        event={event}
      />
      <Dialog
        suspended={!!previewMedia}
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
              className="rn-button-style--2 rn-btn-reverse-green"
              onClick={editEvent}
              type="button"
            >
              <IconlyEdit aria-hidden="true" />
              <span>{isDraft ? "Edit draft" : "Edit event"}</span>
            </button>
            {isDraft && event.readyToPublish === true && checkAuthorization(user.session, ACCESS_4) && (
              <button className="rn-button-style--2 event-details-modal__complete" type="button" onClick={() => {
                dispatch(loadSingleEventDashboard(event));
                navigate(`/user/dashboard/events/${event.id}/edit?complete=1`);
              }}>
                <FiCheck aria-hidden="true" /><span>Complete</span>
              </button>
            )}
            {canToggleSales && (
              <button
                type="button"
                role="switch"
                aria-checked={!salesClosed}
                aria-label="Ticket sales"
                aria-busy={savingSales}
                className={`event-details-modal__sales-toggle ${salesClosed ? "is-closed" : "is-open"}`}
                disabled={savingSales || statusLabel === "Past"}
                onClick={toggleSales}
                title={statusLabel === "Past" ? "Sales cannot be reopened for a past event" : salesClosed ? "Open ticket sales" : "Close ticket sales"}
              >
                <span className="event-details-modal__sales-track" aria-hidden="true"><span /></span>
                <span>{savingSales ? "Saving…" : salesClosed ? "Sales closed" : "Sales opened"}</span>
              </button>
            )}
            {!isDraft && checkAuthorization(user.session, ACCESS_3) ? (
              <button
                className="rn-button-style--2 rn-btn-green"
                onClick={() => setTicketGeneratorVisible(true)}
                type="button"
              >
                <IconlyTicket aria-hidden="true" />
                <span>Generate tickets</span>
              </button>
            ) : null}
            <button
              className="rn-button-style--2 rn-btn-reverse event-details-modal__delete"
              onClick={() => setConfirmDeleteVisible(true)}
              type="button"
            >
              <IconlyDelete aria-hidden="true" />
              <span>Delete event</span>
            </button>
          </div>

          <section className="event-details-modal__summary">
            <div className="event-details-modal__media-overview">
              <div className="event-details-modal__poster">
                {event.poster ? (
                  <ImageTooltip label="Poster">
                  <button
                    aria-label="Open poster media preview"
                    className="event-details-modal__poster-preview media-trigger"
                    onClick={() =>
                      setPreviewMedia({
                        alt: `${eventTitle} poster`,
                        fileName: `${eventTitle}-poster`,
                        src: event.poster,
                      })
                    }
                    type="button"
                  >
                    <img
                      alt={`${eventTitle} poster`}
                      className="event-details-modal__poster-image"
                      src={event.poster}
                    />
                    <PreviewOverlay />
                  </button>
                  </ImageTooltip>
                ) : (
                  <div className="event-details-modal__poster-empty">
                    <IconlyImage aria-hidden="true" />
                    <span>No poster uploaded</span>
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
                  <EventImage
                    alt={`${eventTitle} background`}
                    label="Background"
                    onPreview={() =>
                      setPreviewMedia({
                        alt: `${eventTitle} background`,
                        fileName: `${eventTitle}-background`,
                        src: backgroundImage,
                      })
                    }
                    src={backgroundImage}
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
                    value={event.extraInputsForm?.length > 0 ? "Enabled" : "None"}
                  />
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
                  {!event.isFree ? (
                    <EventFact
                      label="Member ticket"
                      value={event.isMemberFree ? "Free" : "Priced"}
                    />
                  ) : null}
                </dl>
              </DetailSection>

              <DetailSection title="Pricing">
                {event.isFree ? (
                  <span className="event-details-modal__free-label">Free</span>
                ) : event.ticketLink ? (
                  <div className="event-details-modal__notice">
                    <IconlyExternalLink aria-hidden="true" />
                    <div>
                      <strong>External ticketing</strong>
                      <a href={event.ticketLink} rel="noreferrer" target="_blank">
                        Open ticket page
                      </a>
                    </div>
                  </div>
                ) : (
                  <div className="event-details-modal__pricing-list">
                    {event.product?.guest ? (
                      <PriceOption
                        including={event.entryIncluding}
                        label="Guest"
                        price={formatPrice(event.product.guest.price)}
                        priceId={event.product.guest.priceId}
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
                        priceId={event.product?.member?.priceId}
                      />
                    ) : null}
                    {event.product?.activeMember ? (
                      <PriceOption
                        label="Active member"
                        price={formatPrice(event.product.activeMember.price)}
                        priceId={event.product.activeMember.priceId}
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
