import PropTypes from "prop-types";

const euro = new globalThis.Intl.NumberFormat("en-NL", { style: "currency", currency: "EUR" });
const formatPrice = value => value === "" || value == null || !Number.isFinite(Number(value)) ? "Not set" : euro.format(Number(value));

export default function EventPriceBadges({ values }) {
  const prices = values.isFree
    ? [["Everyone", "Free"]]
    : values.isTicketLink
      ? [["Tickets", "External platform"]]
      : [
          ["Guests", formatPrice(values.guestPrice)],
          ["Members", values.isMemberFree ? "Free" : formatPrice(values.memberPrice)],
          ["Active members", values.isMemberFree ? "Free" : formatPrice(values.activeMemberPrice === "" || values.activeMemberPrice == null ? values.memberPrice : values.activeMemberPrice)],
        ];
  return <div className="event-form-price-badges" role="group" aria-label="Ticket prices from Tickets and media">
    <span className="event-form-price-badge">
      {prices.map(([label, price], index) => <span className="event-form-price-badge__item" key={label}>
        {index > 0 && <span className="event-form-price-badge__separator" aria-hidden="true">·</span>}
        <span className="event-form-price-badge__label">{label}</span><strong>{price}</strong>
      </span>)}
    </span>
  </div>;
}
EventPriceBadges.propTypes = { values: PropTypes.object.isRequired };
