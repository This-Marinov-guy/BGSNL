import React, { useEffect, useState } from "react";
import PageHelmet from "../../component/common/Helmet";
import ScrollToTop from "react-scroll-up";
import { FiChevronUp } from "react-icons/fi";
import Header from "../../component/header/Header";
import Footer from "../../component/footer/Footer";
import { useSelector } from "react-redux";
import { selectUser } from "../../redux/user";
import ImageFb from "../../elements/ui/media/ImageFb";
import Countdown from "../../elements/ui/functional/Countdown";
import { useHttpClient } from "../../hooks/common/http-hook";
import Loader from "../../elements/ui/loading/Loader";
import { Link, useParams, useNavigate } from "react-router-dom";
import StickyButtonFooter from "../../elements/ui/functional/StickyButtonFooter";
import HeaderLoadingError from "../../elements/ui/errors/HeaderLoadingError";
import { estimatePriceByEvent, isMember } from "../../util/functions/helpers";
import NoEventFound from "../../elements/ui/errors/Events/NoEventFound";
import moment from "moment";
import { MOMENT_DATE_TIME } from "../../util/functions/date";
import DynamicTicketBadge from "../../elements/ui/badges/DynamicTicketBadge";
import EventStructuredData from "../../component/common/EventStructuredData";

const EventDetails = () => {
  const [eventClosed, setEventClosed] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);

  const user = useSelector(selectUser);

  const { region, eventId } = useParams();
  const navigate = useNavigate();

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
      } catch (err) {}
    };

    getEventDetails();
  }, []);

  if (loading) {
    return <HeaderLoadingError />;
  } else if (!selectedEvent) {
    return <NoEventFound />;
  }

  const price = estimatePriceByEvent(selectedEvent, user);
  const imageUrl =
    selectedEvent.bgImageExtra && selectedEvent?.bgImageSelection == 2
      ? selectedEvent.bgImageExtra
      : `/assets/images/bg/bg-image-${selectedEvent.bgImage}.webp`;

  const eventTitle = selectedEvent.newTitle || selectedEvent.title;
  const eventDescription =
    selectedEvent.description || selectedEvent.text?.substring(0, 160);
  const eventUrl = `https://www.bulgariansociety.nl/${region}/event-details/${eventId}`;

  return (
    <React.Fragment>
      <PageHelmet
        pageTitle={eventTitle}
        description={eventDescription}
        image={
          selectedEvent.bgImageExtra ||
          `https://www.bulgariansociety.nl${imageUrl}`
        }
        type="event"
        canonicalUrl={eventUrl}
        keywords={`${eventTitle}, Bulgarian event, ${region}, BGSNL event, Bulgarian Society`}
      />
      <EventStructuredData event={selectedEvent} region={region} />

      <Header
        headertransparent="header--transparent"
        colorblack="color--black"
        logoname="logo.png"
      />

      {/* Start Breadcrump Area */}
      <div
        className={`rn-page-title-area pt--120 pb--190 bg_image`}
        style={{ backgroundImage: `url(${imageUrl})` }}
        data-black-overlay="7"
      >
        <div className="container">
          <div className="row">
            <div className="col-lg-12">
              <div className="rn-page-title text-center pt--100">
                <h2 className="title theme-gradient">
                  {selectedEvent.newTitle || selectedEvent.title}
                </h2>
                <p>{selectedEvent.description}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* End Breadcrump Area */}

      {/* Start Portfolio Details */}
      <div className="rn-portfolio-details ptb--120 bg_color--1">
        <div className="container">
          <div className="row">
            <div className="col-lg-5 col-md-12 mb--40">
              {/* Event Poster */}
              <div className="event-poster-wrapper">
                <ImageFb
                  src={selectedEvent.poster}
                  alt={eventTitle}
                  className="event-poster-image"
                />
              </div>
            </div>

            <div className="col-lg-7 col-md-12">
              <div className="portfolio-details">
                <div className="inner">
                  <h3>About</h3>
                  <p style={{ whiteSpace: "pre-line" }}>{selectedEvent.text}</p>
                  <div className="portfolio-view-list d-flex flex-wrap">
                    <div className="port-view">
                      <span>When</span>
                      <h4>
                        {moment(selectedEvent.date).format(MOMENT_DATE_TIME)}
                      </h4>
                      {selectedEvent.correctedDate && (
                        <p style={{ color: "#f80707" }} className="error">
                          {"Updated Date/Time -> " +
                            moment(selectedEvent.correctedDate).format(
                              "Do MMM YY hh:mm"
                            )}
                        </p>
                      )}
                    </div>

                    <div className="port-view">
                      <span>Where</span>
                      <h4>{selectedEvent.location}</h4>
                    </div>

                    <div className="port-view">
                      <span className="center_div j-start">
                        Entry fee{" "}
                        {
                          <DynamicTicketBadge
                            isMember={isMember(user)}
                            product={selectedEvent?.product}
                          />
                        }
                      </span>
                      <h4>{price}</h4>
                    </div>
                  </div>
                  {
                    //for links to subEvent
                    selectedEvent?.subEvent?.description &&
                      selectedEvent?.subEvent.links.length > 0 && (
                        <div className="mt--40 mb--40 team_member_border_1 center_section">
                          <h3 className="center_text">
                            {selectedEvent.subEvent.description}
                          </h3>
                          <div className="row">
                            {selectedEvent.subEvent.links.map((link, idx) => {
                              return (
                                <a
                                  key={idx}
                                  className="rn-button-style--2 rn-btn-reverse-green center_text center_div_no_gap m--5"
                                  href={link.href}
                                >
                                  <span className="">{link.name}</span>
                                </a>
                              );
                            })}
                          </div>
                        </div>
                      )
                  }
                  {!selectedEvent.isSaleClosed &&
                    (loading ? (
                      <div>
                        <h3 className="mt--20">
                          Checking Ticket Availability - please be patient!
                        </h3>
                        <Loader />
                      </div>
                    ) : (
                      <StickyButtonFooter>
                        <div className="purchase-btn gap-3" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                          {selectedEvent.ticketLink ? (
                            <div>
                              <div
                                className="purchase-btn"
                                style={{ justifyContent: "center" }}
                              >
                                <a
                                  style={
                                    eventClosed
                                      ? {
                                          pointerEvents: "none",
                                          backgroundColor: "#ccc",
                                          borderColor: "white",
                                        }
                                      : {}
                                  }
                                  href={selectedEvent.ticketLink}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="rn-button-style--2 rn-btn-reverse-green"
                                >
                                  {eventClosed ? "Sold out" : "Buy Ticket"}
                                </a>
                                <button
                                  type="button"
                                  onClick={() => navigate(-1)}
                                  className="rn-button-style--2 rn-btn-reverse-red"
                                >
                                  <span>Back</span>
                                </button>
                              </div>
                              <p className="information mt--20">
                                *Tickets are purchased from an outside platform!
                                Click the button to be redirected
                              </p>
                            </div>
                          ) : (
                            <>
                              {!eventClosed && (
                                <Link
                                  to={`/${region}/purchase-ticket/${eventId}`}
                                  className="rn-button-style--2 rn-btn-reverse-green"
                                >
                                  Buy Ticket
                                </Link>
                              )}
                              <button
                                type="button"
                                onClick={() => navigate(-1)}
                                className="rn-button-style--2 rn-btn-reverse-red"
                              >
                                <span>Back</span>
                              </button>
                            </>
                          )}
                          {selectedEvent.ticketTimer && (
                            <Countdown
                              targetTime={selectedEvent.ticketTimer}
                              eventClosed={eventClosed}
                              setEventClosed={setEventClosed}
                            />
                          )}
                        </div>
                      </StickyButtonFooter>
                    ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* End Portfolio Details */}

      {/* Start Back To Top */}
      <div className="backto-top">
        <ScrollToTop showUnder={160}>
          <FiChevronUp size={26} style={{ fontSize: "26px" }} />
        </ScrollToTop>
      </div>
      {/* End Back To Top */}

      <Footer />
    </React.Fragment>
  );
};
export default EventDetails;
