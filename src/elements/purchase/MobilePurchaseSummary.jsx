"use client";

import PropTypes from "prop-types";
import { useState } from "react";
import {
  FiX,
  IconlyCalendar,
  IconlyLocation,
} from "@/elements/ui/icons/IconlyIcons";
import ImageFb from "../ui/media/ImageFb";
import { getEventDateTimePresentation } from "../../util/functions/date";

const MobilePurchaseSummary = ({ event, price }) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isClosing, setIsClosing] = useState(false);

  if (!isVisible) return null;

  const eventTitle = event.newTitle || event.title;
  const eventDate = getEventDateTimePresentation(
    event.date,
    event.correctedDate
  );

  return (
    <aside
      className={`purchase-mobile-summary${isClosing ? " is-closing" : ""}`}
      aria-hidden={isClosing}
      aria-label="Event quick summary"
      onAnimationEnd={(animationEvent) => {
        if (
          isClosing &&
          animationEvent.target === animationEvent.currentTarget
        ) {
          setIsVisible(false);
        }
      }}
    >
      <button
        type="button"
        className="purchase-mobile-summary-dismiss"
        aria-label="Dismiss event summary"
        disabled={isClosing}
        onClick={() => setIsClosing(true)}
      >
        <FiX aria-hidden />
      </button>

      <div className="purchase-mobile-summary-poster">
        <ImageFb src={event.poster} alt="" aria-hidden />
      </div>

      <div className="purchase-mobile-summary-copy">
        <div className="purchase-mobile-summary-heading">
          <strong className="purchase-mobile-summary-title type-small">
            {eventTitle}
          </strong>
          {eventDate.isUpdated && (
            <span className="event-date-updated-badge type-small">Updated</span>
          )}
        </div>
        <span className="purchase-mobile-summary-detail type-caption">
          <IconlyCalendar aria-hidden />
          <time dateTime={eventDate.value}>{eventDate.label}</time>
        </span>
        <span className="purchase-mobile-summary-detail type-caption">
          <IconlyLocation aria-hidden />
          {event.location}
        </span>
      </div>

      <strong className="purchase-mobile-summary-price type-small">{price}</strong>
    </aside>
  );
};

MobilePurchaseSummary.propTypes = {
  event: PropTypes.shape({
    correctedDate: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.instanceOf(Date),
    ]),
    date: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]),
    location: PropTypes.string,
    newTitle: PropTypes.string,
    poster: PropTypes.string,
    title: PropTypes.string,
  }).isRequired,
  price: PropTypes.node.isRequired,
};

export default MobilePurchaseSummary;
