import React, { useState } from "react";
import { Link } from "react-router-dom";
import { cn } from "../../util/functions/helpers";
import { MOMENT_DATE_TIME } from "../../util/functions/date";
import moment from "moment";

export const FocusCards = ({ cards, region, isOtherEvent }) => {
  const [hovered, setHovered] = useState(null);

  return (
    <div className="focus-cards-grid">
      {cards.map((card, index) => (
        <Card
          key={card.id}
          card={card}
          index={index}
          hovered={hovered}
          setHovered={setHovered}
          region={region}
          isOtherEvent={isOtherEvent}
        />
      ))}
    </div>
  );
};

const Card = ({ card, index, hovered, setHovered, region, isOtherEvent }) => {
  const link = isOtherEvent
    ? "/other-event-details/pwc-offer-day"
    : `/${card.region ?? region}/event-details/${card.id}`;
  
  return (
    <div
      onMouseEnter={() => setHovered(index)}
      onMouseLeave={() => setHovered(null)}
      className={cn(
        "focus-card",
        hovered !== null && hovered !== index && "focus-card-blurred"
      )}
    >
      <Link to={link} className="focus-card-link">
        <div
          className="focus-card-image"
          style={{ backgroundImage: `url(${card.poster})` }}
        >
          <div className="focus-card-overlay">
            <h3 className="focus-card-title">{card.title}</h3>
            <div className="focus-card-details">
              <div className="focus-card-datetime">
                {moment(card.date).isValid() ? moment(card.correctedDate ?? card.date).format(
                  MOMENT_DATE_TIME
                ) : card.date}
              </div>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default FocusCards;
