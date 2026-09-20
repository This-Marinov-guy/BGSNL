import { useState } from "react";
import moment from "moment";
import PropTypes from "prop-types";
import { IconlyImageOff } from "@/elements/ui/icons/IconlyIcons";
import { MOMENT_DATE_TIME } from "../../../../util/functions/date";
import EventModal from "./EventModal";
import { eventStatusLabel } from "../../../../util/functions/event-status.mjs";

const formatPrice = (value) => {
  const amount = Number(value);
  return Number.isFinite(amount)
    ? `€${amount.toLocaleString("en-NL", { maximumFractionDigits: 2 })}`
    : "—";
};

const Event = ({ event, loadData }) => {
  const [show, setShow] = useState(false);
  const isDraft = event.status === "draft";
  const note = isDraft && typeof event.draftData?.note === "string" ? event.draftData.note.trim() : "";

  let price = "TBA";
  if (isDraft) price = "Not set";
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

  const status = eventStatusLabel(event);

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
              <span role="img" aria-label="No poster available"><IconlyImageOff aria-hidden="true" /></span>
            )}
          </div>
          <div className="event-card__content">
            <div className="event-card__heading">
              <div className="event-card__title-row">
                <span className={`event-card__status event-card__status--${status.toLowerCase().replaceAll(" ", "-")}`}>
                  {status}
                </span>
                <h3 className="event-card__title">{event.title || "Untitled draft"}</h3>
              </div>
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
                <dt>Prices</dt>
                <dd>{price}</dd>
              </div>
              <div>
                <dt>Capacity</dt>
                <dd>{event.ticketLimit ?? "Not set"}</dd>
              </div>
            </dl>
            {note && <p className="event-draft-note"><strong>Note</strong>{note}</p>}
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
