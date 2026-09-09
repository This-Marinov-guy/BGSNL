"use client";

import React, {
  useEffect,
  useState,
} from "react";
import PropTypes from "prop-types";
import { useSelector } from "react-redux";
import ScrollToTop from "@/component/common/ScrollToTop";
import {
  FiChevronUp,
  IconlyCalendar,
  IconlyLocation,
  IconlyTicket,
  IconlyTimeCircle,
} from "@/elements/ui/icons/IconlyIcons";
import {
  Link,
  useParams,
} from "@/util/navigation";
import Footer from "../../component/footer/Footer";
import HeaderTwo from "../../component/header/HeaderTwo";
import MembershipOfferBanner from "../../elements/banners/MembershipOfferBanner";
import BillingStatusBanner from "../../elements/subscriptions/BillingStatusBanner";
import { getAccountStatusNotice } from "../../elements/subscriptions/account-status-notice.mjs";
import DynamicTicketBadge from "../../elements/ui/badges/DynamicTicketBadge";
import NoEventFound from "../../elements/ui/errors/Events/NoEventFound";
import HeaderLoadingError from "../../elements/ui/errors/HeaderLoadingError";
import EventImageCarousel from "../../elements/ui/EventImageCarousel";
import StickyButtonFooter from "../../elements/ui/functional/StickyButtonFooter";
import TicketClosingCountdown from "../../elements/ui/functional/TicketClosingCountdown";
import ImageFb from "../../elements/ui/media/ImageFb";
import { useHttpClient } from "../../hooks/common/http-hook";
import { selectUser } from "../../redux/user";
import { getEventDateTimePresentation } from "../../util/functions/date";
import {
  estimatePriceByEvent,
  isMember,
} from "../../util/functions/helpers";

const getNumericPrice = (value) => {
  const numericPrice = Number(value);
  return Number.isFinite(numericPrice) ? numericPrice : null;
};

const formatEuro = (value) =>
  new globalThis.Intl.NumberFormat("en-NL", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: Number.isInteger(value) ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(value);

/**
 * `initialEvent` is fetched on the server by the route, so the event is in the
 * HTML rather than appearing after the effect below runs. The effect still
 * refetches on mount to pick up live ticket availability.
 */
const EventDetails = ({ initialEvent = null }) => {
  const [eventClosed, setEventClosed] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(initialEvent);

  const user = useSelector(selectUser);

  const { region, eventId } = useParams();

  const { loading, sendRequest } = useHttpClient();

  useEffect(() => {
    const getEventDetails = async () => {
      try {
        const responseData = await sendRequest(
          `event/event-details/${eventId}`,
          "GET",
          null,
          {},
          false
        );
        setSelectedEvent(responseData.event);
        setEventClosed(!responseData.status);
      } catch (err) {
        // The server-rendered event remains available if the live refresh fails.
      }
    };

    getEventDetails();
  }, []);

  // Only fall back to the loader when there is nothing to show yet — otherwise
  // the mount-time refetch would replace server-rendered content with a spinner.
  if (loading && !selectedEvent) {
    return <HeaderLoadingError />;
  } else if (!selectedEvent) {
    return <NoEventFound />;
  }

  const price = estimatePriceByEvent(selectedEvent, user, {
    withIncludedText: false,
    blockDiscounts: false,
    withMemberBadge: true,
  });
  const eventTitle = selectedEvent.newTitle || selectedEvent.title;
  const eventImages = Array.from(
    new Set([selectedEvent.poster, ...(selectedEvent.images || [])].filter(Boolean))
  );
  const userIsMember = isMember(user);
  const userIsLoggedIn = Boolean(user?.token);
  const ticketIsFree =
    selectedEvent.isFree || (userIsMember && selectedEvent.isMemberFree);
  const ticketActionLabel = ticketIsFree ? "Get ticket" : "Buy ticket";
  const guestPrice = getNumericPrice(selectedEvent?.product?.guest?.price);
  const memberPrice = selectedEvent.isMemberFree
    ? 0
    : getNumericPrice(selectedEvent?.product?.member?.price);
  const memberSaving =
    guestPrice !== null && memberPrice !== null && memberPrice < guestPrice
      ? guestPrice - memberPrice
      : null;
  const includedWithTicket = userIsMember
    ? selectedEvent.memberIncluding || selectedEvent.entryIncluding
    : selectedEvent.entryIncluding;
  const ticketInclusions = includedWithTicket?.replace(/\s+\*\s+/g, "\n• ");
  const membershipOfferTitle = userIsMember
    ? memberSaving !== null
      ? `You save ${formatEuro(memberSaving)} and keep your ticket`
      : "Your ticket stays in your collection"
    : memberSaving !== null
      ? `Save ${formatEuro(memberSaving)} and keep your ticket as a member`
      : "Keep your ticket as a member";
  const purchasePath = `/${region}/purchase-ticket/${eventId}`;
  const showMembershipOffer = !selectedEvent.ticketLink && !userIsLoggedIn;
  const showAccountAttention =
    !selectedEvent.ticketLink &&
    userIsLoggedIn &&
    (user.hasBenefits !== true || Boolean(getAccountStatusNotice(user)));
  const useGuestEventLayout = showMembershipOffer || showAccountAttention;
  const factsInsideBookingCard = !useGuestEventLayout;
  const eventDate = getEventDateTimePresentation(
    selectedEvent.date,
    selectedEvent.correctedDate
  );

  const rememberEventPage = () => {
    sessionStorage.setItem(
      "prevUrl",
      `/${region}/event-details/${eventId}`
    );
  };

  const purchaseActions = (
    <div className="event-purchase-actions">
      {selectedEvent.ticketLink && !eventClosed ? (
        <a
          href={selectedEvent.ticketLink}
          target="_blank"
          rel="noopener noreferrer"
          className="rn-button-style--2 rn-btn-reverse-green event-action-control "
        >
          {ticketActionLabel}
        </a>
      ) : !eventClosed ? (
        <Link
          to={purchasePath}
          className="rn-button-style--2 rn-btn-reverse-green event-action-control "
        >
          {ticketActionLabel}
        </Link>
      ) : (
        <button
          type="button"
          disabled
          className="rn-button-style--2 rn-btn-reverse-green event-action-control "
        >
          Sold out
        </button>
      )}
    </div>
  );
  const eventFacts = (
    <section
      className={`event-details-facts${
        selectedEvent.ticketTimer ? "" : " event-details-facts-two"
      }${factsInsideBookingCard ? " event-details-facts--inside-booking" : ""}`}
      aria-label="Event details"
    >
      <div className="event-detail-item event-detail-item--date">
        {eventDate.isUpdated && (
          <span className="event-date-updated-badge type-small">Updated</span>
        )}
        <span className="event-detail-icon">
          <IconlyCalendar />
        </span>
        <div>
          <span className="event-detail-label type-caption">Date</span>
          <strong>
            <time dateTime={eventDate.value}>{eventDate.label}</time>
          </strong>
        </div>
      </div>

      <div className="event-detail-item">
        <span className="event-detail-icon">
          <IconlyLocation />
        </span>
        <div>
          <span className="event-detail-label type-caption">Location</span>
          <strong>{selectedEvent.location}</strong>
        </div>
      </div>

      {selectedEvent.ticketTimer && (
        <div className="event-detail-item event-detail-item-wide">
          <span className="event-detail-icon">
            <IconlyTimeCircle />
          </span>
          <div>
            <span className="event-detail-label type-caption">
              Time to closing
            </span>
            <TicketClosingCountdown
              isClosed={selectedEvent.isSaleClosed || eventClosed}
              onClose={setEventClosed}
              targetTime={selectedEvent.ticketTimer}
            />
          </div>
        </div>
      )}
    </section>
  );
  const stickyMembershipSaving =
    showMembershipOffer && memberSaving !== null ? (
      <Link
        className="event-sticky-membership-saving type-caption"
        onClick={rememberEventPage}
        to="/signup"
      >
        Save {formatEuro(memberSaving)} by becoming a member
      </Link>
    ) : null;

  return (
    <React.Fragment>
      <HeaderTwo
        headertransparent="header--transparent"
        colorblack="color--black"
        logoname="logo.png"
      />

      <main className="rn-portfolio-details event-details-page">
        <div className="container">
          <div
            className={`event-details-layout${
              factsInsideBookingCard
                ? " event-details-layout--facts-inside-booking"
                : ""
            }`}
          >
            <section className="event-details-media" aria-label="Event images">
              {eventImages.length > 1 ? (
                <EventImageCarousel images={eventImages} />
              ) : (
                <div className="event-poster-wrapper">
                  <ImageFb
                    src={selectedEvent.poster}
                    alt={eventTitle}
                    className="event-poster-image"
                    eager
                    fetchPriority="high"
                  />
                </div>
              )}
            </section>

            <div className="event-details-content">
              {!factsInsideBookingCard && eventFacts}

              <section
                className="event-booking-card"
                aria-label="Ticket options"
              >
                <div className="event-booking-heading">
                  <div>
                    <div className="event-ticket-price">
                      <span className="event-ticket-price-value">
                        <span
                          className="event-ticket-price-icon"
                          aria-hidden="true"
                        >
                          <IconlyTicket />
                        </span>
                        <span className="type-heading-lg">{price}</span>
                      </span>
                      <DynamicTicketBadge
                        isMember={userIsMember}
                        product={selectedEvent?.product}
                        event={selectedEvent}
                      />
                    </div>
                  </div>

                  {useGuestEventLayout && memberSaving !== null && (
                    <div
                      className="event-price-comparison "
                      aria-label="Price comparison"
                    >
                      <span
                        className="is-current"
                        aria-current="true"
                      >
                        Regular {formatEuro(guestPrice)}
                      </span>
                      <span className="is-alternative">
                        Member {formatEuro(memberPrice)}
                      </span>
                    </div>
                  )}
                </div>

                {ticketInclusions && (
                  <p className="event-ticket-includes ">{ticketInclusions}</p>
                )}

                {factsInsideBookingCard && eventFacts}

                {showMembershipOffer && (
                  <MembershipOfferBanner
                    title={membershipOfferTitle}
                    onAction={rememberEventPage}
                  />
                )}

                {showAccountAttention && (
                  <BillingStatusBanner
                    user={user}
                    context="ticket"
                    missedDiscount={
                      memberSaving !== null ? formatEuro(memberSaving) : null
                    }
                    showMissingBenefits
                  />
                )}

                {selectedEvent.isSaleClosed ? (
                  <p className="event-sale-status ">Ticket sales are closed.</p>
                ) : (
                  <StickyButtonFooter stickyContent={stickyMembershipSaving}>
                    {purchaseActions}
                  </StickyButtonFooter>
                )}

                {selectedEvent.ticketLink && !eventClosed && (
                  <p className="event-external-note ">
                    Tickets are sold by an external ticket platform.
                  </p>
                )}
              </section>

              <section className="event-about-card">
                <div className="event-about-heading">
                  <h3>{eventTitle}</h3>
                </div>
                <div className="event-about-body">
                  <p className="event-about-copy type-body">
                    {selectedEvent.text}
                  </p>

                  {selectedEvent?.subEvent?.description &&
                    selectedEvent?.subEvent?.links?.length > 0 && (
                      <div className="event-related-links">
                        <h4>{selectedEvent.subEvent.description}</h4>
                        <div>
                          {selectedEvent.subEvent.links.map((link, idx) => (
                            <a
                              key={idx}
                              href={link.href}
                              className="rn-button-style--2 rn-btn-green rn-btn-small "
                            >
                              {link.name}
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                </div>
              </section>
            </div>
          </div>
        </div>
      </main>

      {/* Start Back To Top */}
      <div className="backto-top">
        <ScrollToTop showUnder={160}>
          <FiChevronUp size={26} />
        </ScrollToTop>
      </div>
      {/* End Back To Top */}

      <Footer />
    </React.Fragment>
  );
};

EventDetails.propTypes = {
  initialEvent: PropTypes.object,
};

export default EventDetails;
