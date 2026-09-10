import PropTypes from "prop-types";
import {
  IconlyCalendar,
  IconlyLocation,
  IconlyTimeCircle,
  IconlyTicket,
} from "@/elements/ui/icons/IconlyIcons";
import GoldenTicketMotionIcon from "@/elements/ui/icons/GoldenTicketMotionIcon";
import ImageFb from "../ui/media/ImageFb";
import { getEventDateTimePresentation } from "../../util/functions/date";
import TicketClosingCountdown from "../ui/functional/TicketClosingCountdown";

const formatEuro = (value) =>
  new globalThis.Intl.NumberFormat("en-NL", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: Number.isInteger(value) ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(value);

const getNumericPrice = (value) => {
  if (value === null || value === undefined || value === "") return null;
  const numericPrice = Number(value);
  return Number.isFinite(numericPrice) ? numericPrice : null;
};

const PurchaseEventSummary = ({
  event,
  discountApplied = false,
  factsInsideOverview = false,
  price,
  priceBadge,
  showMemberPriceComparison = true,
  usesMemberPrice = false,
}) => {
  const eventTitle = event.newTitle || event.title;
  const eventDate = getEventDateTimePresentation(
    event.date,
    event.correctedDate
  );
  const guestPrice = getNumericPrice(event.product?.guest?.price);
  const memberPrice = event.isMemberFree
    ? 0
    : getNumericPrice(event.product?.member?.price);
  const hasPriceComparison =
    showMemberPriceComparison &&
    guestPrice !== null &&
    memberPrice !== null &&
    memberPrice < guestPrice;
  const eventFacts = (
    <section
      className={`purchase-event-facts${
        event.ticketTimer ? "" : " purchase-event-facts-two"
      }${factsInsideOverview ? " is-inside-overview" : ""}`}
      aria-label="Event details"
    >
      <div className="purchase-event-fact purchase-event-fact--date">
        {eventDate.isUpdated && (
          <span className="event-date-updated-badge type-small">Updated</span>
        )}
        <span className="purchase-event-fact-icon">
          <IconlyCalendar aria-hidden />
        </span>
        <div>
          <span className="purchase-event-fact-label type-caption">Date</span>
          <strong>
            <time dateTime={eventDate.value}>{eventDate.label}</time>
          </strong>
        </div>
      </div>

      <div className="purchase-event-fact">
        <span className="purchase-event-fact-icon">
          <IconlyLocation aria-hidden />
        </span>
        <div>
          <span className="purchase-event-fact-label type-caption">Location</span>
          <strong>{event.location}</strong>
        </div>
      </div>

      {event.ticketTimer && (
        <div className="purchase-event-fact">
          <span className="purchase-event-fact-icon">
            <IconlyTimeCircle aria-hidden />
          </span>
          <div>
            <span className="purchase-event-fact-label type-caption">
              Time to closing
            </span>
            <TicketClosingCountdown
              isClosed={event.isSaleClosed}
              targetTime={event.ticketTimer}
            />
          </div>
        </div>
      )}
    </section>
  );

  return (
    <section className="purchase-event-summary" aria-labelledby="purchase-event-title">
      {!factsInsideOverview && eventFacts}

      <div className="purchase-event-poster">
        <ImageFb
          src={event.poster}
          alt={`${eventTitle} poster`}
          className="purchase-event-poster-image"
          eager
          fetchPriority="high"
        />
      </div>

      <div className="purchase-event-copy">
        <section className="purchase-ticket-overview" aria-label="Ticket summary">
          <h2 id="purchase-event-title" className="type-heading-md">
            {eventTitle}
          </h2>

          <div className="purchase-ticket-heading">
            <div className="purchase-event-price">
              {discountApplied ? (
                <GoldenTicketMotionIcon className="purchase-discount-motion-icon" />
              ) : (
                <IconlyTicket aria-hidden />
              )}
              <strong className="type-heading-md">{price}</strong>
              {priceBadge}
            </div>

            {hasPriceComparison && (
              <div
                className="purchase-price-comparison "
                aria-label="Price comparison"
              >
                <span
                  className={usesMemberPrice ? "is-alternative" : "is-current"}
                  aria-current={usesMemberPrice ? undefined : "true"}
                >
                  Regular {formatEuro(guestPrice)}
                </span>
                <span
                  className={usesMemberPrice ? "is-current" : "is-alternative"}
                  aria-current={usesMemberPrice ? "true" : undefined}
                >
                  Member {formatEuro(memberPrice)}
                </span>
              </div>
            )}
          </div>

          {factsInsideOverview && eventFacts}

        </section>
      </div>

    </section>
  );
};

PurchaseEventSummary.propTypes = {
  discountApplied: PropTypes.bool,
  event: PropTypes.shape({
    correctedDate: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]),
    date: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]),
    location: PropTypes.string,
    newTitle: PropTypes.string,
    poster: PropTypes.string,
    product: PropTypes.object,
    isMemberFree: PropTypes.bool,
    isSaleClosed: PropTypes.bool,
    ticketTimer: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]),
    title: PropTypes.string,
  }).isRequired,
  factsInsideOverview: PropTypes.bool,
  price: PropTypes.node.isRequired,
  priceBadge: PropTypes.node,
  showMemberPriceComparison: PropTypes.bool,
  usesMemberPrice: PropTypes.bool,
};

export default PurchaseEventSummary;
