import PropTypes from "prop-types";
import { defaultPromoAudiences, promoAudiences } from "@/util/functions/event-promo-codes.mjs";
import { IconlyImageOff } from "@/elements/ui/icons/IconlyIcons";

const money = value => value == null || value === "" || !Number.isFinite(Number(value))
  ? "Not set"
  : new globalThis.Intl.NumberFormat("en-NL", { style: "currency", currency: "EUR" }).format(Number(value));
const dateTime = value => {
  const date = value ? new Date(value) : null;
  return date && Number.isFinite(date.valueOf())
    ? new globalThis.Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeStyle: "short", timeZone: "Europe/Amsterdam" }).format(date)
    : "Not set";
};

function Section({ title, children }) {
  return <section className="event-details-modal__section">
    <header className="event-details-modal__section-heading"><h3>{title}</h3></header>
    {children}
  </section>;
}
Section.propTypes = { title: PropTypes.string.isRequired, children: PropTypes.node.isRequired };

export function EventUpsellDetails({ values }) {
  const birds = ["earlyBird", "lateBird"].filter(key => values[key]?.isEnabled);
  const promotions = ["guestPromotion", "memberPromotion"].filter(key => values[key]?.isEnabled);
  const codes = values.promoCodes?.isEnabled && Array.isArray(values.promoCodes.codes) ? values.promoCodes.codes : [];
  return <Section title="Upsell"><ul className="event-review-modal__list">
    {birds.map(key => {
      const bird = values[key];
      return <li key={key}>
        <strong>{key === "earlyBird" ? "Early bird" : "Late bird"}</strong>
        <span>Guest {money(bird.price)} / member {money(bird.memberPrice)}</span>
        <small>{bird.ticketLimit ? `Ticket cap: ${bird.ticketLimit}. ` : ""}{bird.startTimer ? `Starts ${dateTime(bird.startTimer)}. ` : ""}{bird.ticketTimer ? `Ends ${dateTime(bird.ticketTimer)}. ` : ""}{bird.excludeMembers ? "Member tickets excluded from the count." : ""}</small>
      </li>;
    })}
    {promotions.map(key => <li key={key}>
      <strong>{key === "guestPromotion" ? "Guest" : "Member"} promotion</strong>
      <span>{values[key].discount}% off</span>
      <small>{dateTime(values[key].startTimer)} – {dateTime(values[key].endTimer)}</small>
    </li>)}
    {codes.map((code, index) => <li key={code.id ?? `promo-${index}`}>
      <strong>Promo code {code.code || `Code ${index + 1}`}</strong>
      <span>{Number(code.discountType) === 1 ? money(code.discount) : `${code.discount}%`} off · {code.active === false ? "Inactive" : "Active"}{code.exhausted ? " · Exhausted" : ""}</span>
      <small>{promoAudiences.filter(audience => (code.audiences ?? defaultPromoAudiences).includes(audience.value)).map(audience => audience.label).join(", ")} · {code.useLimit ? `${code.useLimit} redemptions` : "Unlimited redemptions"} · {code.timeLimit ? `Expires ${dateTime(code.timeLimit)}` : "No expiration"}{code.minAmount ? ` · Minimum spend ${money(code.minAmount)}` : ""}</small>
    </li>)}
    {!birds.length && !promotions.length && !codes.length && <li className="event-details-modal__empty-copy">No upsell options enabled.</li>}
  </ul></Section>;
}
EventUpsellDetails.propTypes = { values: PropTypes.object.isRequired };

export function EventAddOnDetails({ addOns }) {
  if (!addOns?.isEnabled) return null;
  return <Section title="Add-ons">
    <dl className="event-details-modal__facts-grid">
      <div className="event-details-modal__fact"><dt>Checkout heading</dt><dd>{addOns.title || "Not set"}</dd></div>
      <div className="event-details-modal__fact"><dt>Selection</dt><dd>{addOns.multi ? "Multiple items" : "One item"} · {addOns.isMandatory ? "Required" : "Optional"}</dd></div>
    </dl>
    <ul className="event-review-modal__list">{addOns.items?.map((item, index) => <li key={item.id ?? `item-${index}`}>
      <strong>{item.title || `Item ${index + 1}`}</strong><span>{money(item.price ?? 0)}</span>
      {item.description && <small>{item.description}</small>}
    </li>)}</ul>
  </Section>;
}
EventAddOnDetails.propTypes = { addOns: PropTypes.object };

export function EventQuestionDetails({ questions = [] }) {
  return <Section title="Collect data">{questions.length ? <ul className="event-review-modal__list">
    {questions.map((question, index) => <li key={question.id ?? index}>
      <strong>{question.placeholder || `Question ${index + 1}`}</strong>
      <span>{question.type === "select" ? "Choice" : "Written answer"} · {question.required === true || question.required === "true" ? "Required" : "Optional"}{question.multiselect ? " · Multiple selections" : ""}</span>
      {question.type === "select" && <small>{question.options?.join(" · ")}</small>}
    </li>)}
  </ul> : <p className="event-details-modal__empty-copy">No extra questions.</p>}</Section>;
}
EventQuestionDetails.propTypes = { questions: PropTypes.array };

export function EventAdvertisedDetails({ links = [], renderImage }) {
  const recommendations = links.filter(link => link.name && link.href);
  if (!recommendations.length) return null;
  return <Section title="Advertised events"><div className="event-review-modal__advertised-events">
    {recommendations.map((link, index) => <article className="event-review-modal__advertised-event" key={`${link.href}-${index}`}>
      {link.poster ? renderImage(link) : <div className="event-review-modal__advertised-poster event-review-modal__advertised-poster--empty" role="img" aria-label={`${link.name} has no poster`}><IconlyImageOff aria-hidden="true" /></div>}
      <strong>{link.name}</strong>
    </article>)}
  </div></Section>;
}
EventAdvertisedDetails.propTypes = { links: PropTypes.array, renderImage: PropTypes.func.isRequired };
