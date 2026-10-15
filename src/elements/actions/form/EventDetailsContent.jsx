import PropTypes from "prop-types";
import EventPanelEditButton from "./EventPanelEditButton";
import { EventUpsellDetails, EventAddOnDetails, EventQuestionDetails, EventAdvertisedDetails } from "./EventConfigurationPanels";
import { IconlyExternalLink } from "@/elements/ui/icons/IconlyIcons";
import { formatDisplayDateTime } from "@/util/functions/display-date.mjs";

const EMPTY_VALUE = "Not set";
const formatDate = value => {
  const date = value ? new Date(value) : null;
  return date && Number.isFinite(date.valueOf()) ? formatDisplayDateTime(date) : EMPTY_VALUE;
};
const formatPrice = value => {
  if (value == null || value === "" || !Number.isFinite(Number(value))) return EMPTY_VALUE;
  return `€${Number(value).toLocaleString("en-NL", { maximumFractionDigits: 2 })}`;
};

function EventFact({ label, value }) {
  return <div className="event-details-modal__fact"><dt>{label}</dt><dd>{value}</dd></div>;
}
EventFact.propTypes = { label: PropTypes.string.isRequired, value: PropTypes.node };

function DetailSection({ title, children, onEdit }) {
  return <section className="event-details-modal__section">
    <header className="event-details-modal__section-heading"><h3>{title}</h3><EventPanelEditButton title={title} onEdit={onEdit} /></header>
    {children}
  </section>;
}
DetailSection.propTypes = { title: PropTypes.string.isRequired, children: PropTypes.node.isRequired, onEdit: PropTypes.func };

function PriceOption({ label, price, including }) {
  return <article className="event-details-modal__price-option"><span>{label}</span><strong>{price}</strong><p>{including || "Standard entry"}</p></article>;
}
PriceOption.propTypes = { label: PropTypes.string.isRequired, price: PropTypes.string.isRequired, including: PropTypes.string };

export default function EventDetailsContent({ event, actions, poster, media, renderAdvertisedImage, onEdit, statusLabel, statusModifier, dateLabel, regionLabel, salesStatus, preview = false }) {
  const edit = section => onEdit?.(section);
  const recommendations = event.subEvent?.links?.filter(link => link.name && link.href) ?? [];
  const product = event.product ?? {};
  const activeMemberPrice = product.activeMember?.price === "" ? product.member?.price : product.activeMember?.price ?? product.member?.price;
  return <div className="event-details-modal__content">
    <div className="event-details-modal__actions" aria-label="Event actions" role="group">{actions}</div>
    <section className="event-details-modal__summary" aria-label="Event overview">
      <div className="event-details-modal__summary-media">
        <div className="event-details-modal__panel-actions"><EventPanelEditButton title="Event images" onEdit={onEdit ? () => edit("media") : undefined} /></div>
        <div className="event-details-modal__media-overview">
          <div className="event-details-modal__poster">{poster}</div>
          <div className="event-details-modal__media-section" aria-label="Event media"><div className="event-details-modal__media-grid">{media}</div></div>
        </div>
      </div>
      <div>
        <div className="event-details-modal__panel-actions"><EventPanelEditButton title="Event summary" onEdit={onEdit ? () => edit("details") : undefined} /></div>
        <dl className="event-details-modal__summary-facts">
          <EventFact label="Status" value={<span className={`event-card__status event-card__status--${statusModifier}`}>{statusLabel}</span>} />
          <EventFact label="Date and time" value={dateLabel} />
          <EventFact label="Location" value={event.location || EMPTY_VALUE} />
          <EventFact label="Region" value={regionLabel} />
          <EventFact label="Capacity" value={event.ticketLimit ?? EMPTY_VALUE} />
          <EventFact label="Visibility" value={event.hidden ? "Hidden" : "Visible"} />
        </dl>
      </div>
    </section>
    <div className="event-details-modal__layout">
      <div className="event-details-modal__main-column">
        <DetailSection title="Event details" onEdit={onEdit ? () => edit("details") : undefined}>
          <dl className="event-details-modal__facts-grid">
            <EventFact label="Subtitle" value={event.description || "None"} />
            <EventFact label="Audience" value={event.memberOnly ? "Members only" : "Everyone"} />
            <EventFact label="Additional form fields" value={event.extraInputsForm?.length ? `${event.extraInputsForm.length} configured` : "None"} />
            <EventFact label="Recommended events" value={recommendations.length || "None"} />
            {event.subEventDescription ? <EventFact label="Sub-event" value={event.subEventDescription} /> : null}
          </dl>
        </DetailSection>
        <DetailSection title="Description" onEdit={onEdit ? () => edit("description") : undefined}>
          <p className="event-details-modal__description">{event.text || "No description provided."}</p>
        </DetailSection>
        <EventUpsellDetails values={event} onEdit={onEdit ? () => edit("upsell") : undefined} />
        <EventAddOnDetails addOns={event.addOns} onEdit={onEdit ? () => edit("addons") : undefined} />
        <EventAdvertisedDetails links={recommendations} onEdit={onEdit ? () => edit("advertised") : undefined} renderImage={renderAdvertisedImage} />
      </div>
      <aside className="event-details-modal__side-column">
        <DetailSection title="Ticket settings" onEdit={onEdit ? () => edit("tickets") : undefined}>
          <dl className="event-details-modal__facts-grid event-details-modal__facts-grid--single">
            <EventFact label="Sales close" value={formatDate(event.ticketTimer)} />
            <EventFact label="Sales status" value={salesStatus} />
            <EventFact label="Ticket type" value={event.isFree ? "Free for everyone" : event.isTicketLink ? "External ticket platform" : event.isMemberFree ? "Free for members" : "Paid tickets"} />
            <EventFact label="Guest name" value={String(event.ticketName) === "true" ? "Shown on ticket" : "Hidden"} />
            <EventFact label="QR code" value={String(event.ticketQR) === "true" ? "Shown on ticket" : "Hidden"} />
          </dl>
        </DetailSection>
        <DetailSection title="Pricing" onEdit={onEdit ? () => edit("pricing") : undefined}>
          {event.isFree ? <span className="event-details-modal__free-label">Free</span> : event.isTicketLink ?
            <div className="event-details-modal__notice"><IconlyExternalLink aria-hidden="true" /><div><strong>External ticketing</strong>
              {event.ticketLink ? preview ? <span>{event.ticketLink}</span> : <a href={event.ticketLink} rel="noreferrer" target="_blank">Open ticket page</a> : <span>Ticket link not set</span>}
            </div></div> : <div className="event-details-modal__pricing-list">
              {product.guest ? <PriceOption label="Guest" price={formatPrice(product.guest.price)} including={event.entryIncluding} /> : null}
              {product.member || event.isMemberFree ? <PriceOption label="Member" price={event.isMemberFree ? "Free" : formatPrice(product.member?.price)} including={event.memberIncluding} /> : null}
              {product.activeMember || product.member || event.isMemberFree ? <PriceOption label="Active member" price={event.isMemberFree ? "Free" : formatPrice(activeMemberPrice)} /> : null}
              {!product.guest && !product.member && !product.activeMember && !event.isMemberFree ? <p className="event-details-modal__empty-copy">No pricing configured.</p> : null}
            </div>}
        </DetailSection>
        <EventQuestionDetails questions={event.extraInputsForm ?? []} onEdit={onEdit ? () => edit("questions") : undefined} />
      </aside>
    </div>
  </div>;
}
EventDetailsContent.propTypes = {
  event: PropTypes.object.isRequired, actions: PropTypes.node.isRequired, poster: PropTypes.node.isRequired, media: PropTypes.node,
  renderAdvertisedImage: PropTypes.func.isRequired, onEdit: PropTypes.func, statusLabel: PropTypes.string.isRequired,
  statusModifier: PropTypes.string.isRequired, dateLabel: PropTypes.string.isRequired, regionLabel: PropTypes.string.isRequired,
  salesStatus: PropTypes.string.isRequired, preview: PropTypes.bool,
};
