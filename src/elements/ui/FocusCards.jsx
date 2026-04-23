import React from "react";
import { Link } from "react-router-dom";
import { FiCalendar, FiLock } from "react-icons/fi";
import { MOMENT_DATE_TIME } from "../../util/functions/date";
import moment from "moment";

export const FocusCards = ({ cards, region, isOtherEvent, centerItems = true }) => {
  return (
    <div
      className={`focus-cards-grid${
        !centerItems || isOtherEvent ? " focus-cards-grid--left" : ""
      }`}
    >
      {cards.map((card) => (
        <Card
          key={card.id || `${card.title}-${card.date}`}
          card={card}
          region={region}
          isOtherEvent={isOtherEvent}
        />
      ))}
    </div>
  );
};

const Card = ({ card, region, isOtherEvent }) => {
  const link = isOtherEvent
    ? "/other-event-details/gala-festival"
    : `/${card.region ?? region}/event-details/${card.id}`;

  const dateLabel = moment(card.date).isValid()
    ? moment(card.correctedDate ?? card.date).format(MOMENT_DATE_TIME)
    : card.date;

  return (
    <article className="focus-card">
      <Link to={link} className="focus-card-link">
        <div className="focus-card-media ">
          <div
            className="focus-card-image"
            style={{
              backgroundImage: `url(${card.poster})`,
            }}
          />
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

export default FocusCards;
