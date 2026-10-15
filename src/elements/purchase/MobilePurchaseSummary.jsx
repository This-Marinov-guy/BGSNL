"use client";

import PropTypes from "prop-types";
import { useState } from "react";
import dynamic from "next/dynamic";
import {
  FiX,
  IconlyCalendar,
  IconlyImageOff,
  IconlyLocation,
  IconlyShow,
} from "@/elements/ui/icons/IconlyIcons";
import ImageFb from "../ui/media/ImageFb";
import { getEventDateTimePresentation } from "../../util/functions/date";

const ImageGallery = dynamic(() => import("@/elements/ui/media/ImageGallery"), { ssr: false });

const MobilePurchaseSummary = ({ event, price, ticketQuantity = 1, selectedAddOns = [] }) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isClosing, setIsClosing] = useState(false);
  const [posterPreviewOpen, setPosterPreviewOpen] = useState(false);
  const [posterFailed, setPosterFailed] = useState(false);

  if (!isVisible) return null;

  const eventTitle = event.newTitle || event.title;
  const eventDate = getEventDateTimePresentation(
    event.date,
    event.correctedDate
  );

  return <>
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

      {event.poster && !posterFailed ? <button type="button" className="purchase-mobile-summary-poster" onClick={() => setPosterPreviewOpen(true)} aria-label={`Preview ${eventTitle} poster`}>
        <ImageFb src={event.poster} alt="" aria-hidden onError={() => setPosterFailed(true)} />
        <span className="purchase-mobile-summary-poster-icon" aria-hidden="true"><IconlyShow /></span>
      </button> : <div className="purchase-mobile-summary-poster purchase-mobile-summary-poster--empty" role="img" aria-label="Poster unavailable"><IconlyImageOff aria-hidden="true" /></div>}

      <div className="purchase-mobile-summary-copy">
        <div className="purchase-mobile-summary-heading">
          <strong className="purchase-mobile-summary-title">
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

      <div className="purchase-mobile-summary-total">
        <strong className="purchase-mobile-summary-price">{price}</strong>
        <span title={[`${ticketQuantity} ${ticketQuantity === 1 ? "ticket" : "tickets"}`, ...selectedAddOns.map(item => item.title)].join(" · ")}>
          {ticketQuantity} {ticketQuantity === 1 ? "ticket" : "tickets"}
          {selectedAddOns.length > 0 && ` · ${selectedAddOns.map(item => item.title).join(", ")}`}
        </span>
      </div>
    </aside>
    {posterPreviewOpen && event.poster && !posterFailed && <ImageGallery images={[{ src: event.poster, alt: `${eventTitle} poster` }]} src={event.poster} alt={`${eventTitle} poster`} fileName={`${eventTitle}-poster`} open onClose={() => setPosterPreviewOpen(false)} />}
  </>;
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
  ticketQuantity: PropTypes.number,
  selectedAddOns: PropTypes.arrayOf(PropTypes.shape({
    title: PropTypes.string.isRequired,
  })),
};

export default MobilePurchaseSummary;
