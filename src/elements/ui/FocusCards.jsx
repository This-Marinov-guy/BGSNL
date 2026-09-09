import PropTypes from "prop-types";
import {
  FiCalendar,
  FiLock,
  IconlyLocation,
} from "@/elements/ui/icons/IconlyIcons";
import { Link } from "@/util/navigation";
import { capitalizeFirstLetter } from "../../util/functions/capitalize";
import { getEventDateTimePresentation } from "../../util/functions/date";

export const FocusCards = ({ cards, region, isOtherEvent, centerItems = true }) => {
  return (
    <div
      className={`focus-cards-grid${
        !centerItems || isOtherEvent ? " focus-cards-grid--left" : ""
      }`}
    >
      {cards.map((card) => (
        <FocusCard
          key={card.id || `${card.title}-${card.date}`}
          card={card}
          region={region}
          isOtherEvent={isOtherEvent}
        />
      ))}
    </div>
  );
};

export const FocusCard = ({ card, region, isOtherEvent }) => {
  const eventRegion = card.region ?? region;
  const cityLabel =
    eventRegion && eventRegion !== "other"
      ? capitalizeFirstLetter(eventRegion, true)
      : null;
  const link = isOtherEvent
    ? `/other-event-details/${card.id}`
    : `/${eventRegion}/event-details/${card.id}`;

  const { label: dateLabel } = getEventDateTimePresentation(
    card.date,
    card.correctedDate
  );

  return (
    <article className="focus-card">
      <Link to={link} className="focus-card-link">
        <div className="focus-card-media ">
          <img
            className="focus-card-image"
            src={card.poster}
            alt={`${card.title} poster`}
            loading="eager"
            decoding="async"
          />
          {cityLabel && (
            <span className="focus-card-region type-small weight-semibold">
              <IconlyLocation size="1em" aria-hidden="true" />
              {cityLabel}
            </span>
          )}
          {card.memberOnly && (
            <div className="focus-card-badge">
              <FiLock />
              Members Only
            </div>
          )}
        </div>

        <div className="focus-card-content">
          <h3 className="focus-card-title">{card.title}</h3>

          <div className="focus-card-details">
            <div className="focus-card-meta">
              <FiCalendar />
              <span>{dateLabel}</span>
            </div>
          </div>
        </div>
      </Link>
    </article>
  );
};

const eventCardPropType = PropTypes.shape({
  correctedDate: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.instanceOf(Date),
  ]),
  date: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.instanceOf(Date),
  ]),
  id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  memberOnly: PropTypes.bool,
  poster: PropTypes.string.isRequired,
  region: PropTypes.string,
  title: PropTypes.string.isRequired,
});

FocusCards.propTypes = {
  cards: PropTypes.arrayOf(eventCardPropType).isRequired,
  centerItems: PropTypes.bool,
  isOtherEvent: PropTypes.bool,
  region: PropTypes.string,
};

FocusCard.propTypes = {
  card: eventCardPropType.isRequired,
  isOtherEvent: PropTypes.bool,
  region: PropTypes.string,
};

export default FocusCards;
