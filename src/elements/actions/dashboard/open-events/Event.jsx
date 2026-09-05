import { useState } from "react";
import moment from "moment";
import PropTypes from "prop-types";
import { MOMENT_DATE_TIME } from "../../../../util/functions/date";
import { capitalizeFirstLetter } from "../../../../util/functions/capitalize";
import EventModal from "./EventModal";

const formatPrice = (value) => {
  const amount = Number(value);
  return Number.isFinite(amount)
    ? `€${amount.toLocaleString("en-NL", { maximumFractionDigits: 2 })}`
    : "—";
};

const Event = ({ event, loadData }) => {
  const [show, setShow] = useState(false);
  const isDraft = event.status === "draft";
  const now = Date.now();
  const isExpired = !isDraft && event.date && new Date(event.date).valueOf() < now;
  const salesClosed = !isDraft && (
    event.isSaleClosed ||
    (event.ticketTimer && new Date(event.ticketTimer).valueOf() < now)
  );

  let price = "TBA";
  if (isDraft) price = "Not set";
  else if (salesClosed) price = "Sales closed";
  else if (event.isFree) price = "Free";
  else if (event.product) {
    const prices = [
      formatPrice(event.product?.guest?.price),
      event.isMemberFree ? "Free" : formatPrice(event.product?.member?.price),
      event.product?.activeMember?.price != null
        ? formatPrice(event.product.activeMember.price)
        : null,
    ].filter(Boolean);
    price = prices.join(" · ");
  }

  const status = isDraft
    ? "Draft"
    : isExpired
      ? "Past"
      : salesClosed
        ? "Sales closed"
        : capitalizeFirstLetter(event.status || "Open", true);

  return (
    <>
      <EventModal
        show={show}
        setShow={setShow}
        event={event}
        loadData={loadData}
      />
      <article className={`event-card${isDraft ? " event-card--draft" : ""}`}>
        <button
          type="button"
          className="event-card__trigger"
          onClick={() => setShow(true)}
          aria-label={`Open ${event.title || "untitled draft"}`}
        >
          <div className="event-card__poster">
            {event.poster ? (
              <img
                src={event.poster}
                alt={`${event.title || "Draft event"} poster`}
                loading="lazy"
                decoding="async"
              />
            ) : (
              <span>No poster</span>
            )}
          </div>
          <div className="event-card__content">
            <div className="event-card__heading">
              <div>
                <span className={`event-card__status event-card__status--${status.toLowerCase().replaceAll(" ", "-")}`}>
                  {status}
                </span>
                <h3 className="event-card__title">{event.title || "Untitled draft"}</h3>
              </div>
              <span className="event-card__region">
                {capitalizeFirstLetter(event.region || "Region not set", true)}
              </span>
            </div>
            <dl className="event-card__details">
              <div>
                <dt>Date</dt>
                <dd>{event.date ? moment(event.date).format(MOMENT_DATE_TIME) : "Not set"}</dd>
              </div>
              <div>
                <dt>Location</dt>
                <dd>{event.location || "Not set"}</dd>
              </div>
              <div>
                <dt>Guest · member · active</dt>
                <dd>{price}</dd>
              </div>
              <div>
                <dt>Capacity</dt>
                <dd>{event.ticketLimit ?? "Not set"}</dd>
              </div>
            </dl>
          </div>
        </button>
      </article>
    </>
  );
};

Event.propTypes = {
  event: PropTypes.object.isRequired,
  loadData: PropTypes.func.isRequired,
};

export default Event;
