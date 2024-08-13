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
import { useHttpClient } from "../../hooks/http-hook";
import Loader from "../../elements/ui/loading/Loader";
import { Link, useParams } from "react-router-dom";
import WithBackBtn from "../../elements/ui/functional/WithBackBtn";
import GalaMembers from "../information/GalaMembers";
import HeaderLoadingError from "../../elements/ui/errors/HeaderLoadingError";
import { estimatePriceByEvent } from "../../util/functions/helpers";
import NoEventFound from "../../elements/ui/errors/NoEventFound";
import moment from "moment";

const EventDetails = () => {
  const [eventClosed, setEventClosed] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);

  const user = useSelector(selectUser);

  const { region, eventId } = useParams();

  const { loading, sendRequest } = useHttpClient();

  useEffect(() => {
    const getEventDetails = async () => {
      try {
        const responseData = await sendRequest(`event/get-event-details-id/${eventId}`, "GET", null, {}, false);
        setSelectedEvent(responseData.event);
        setEventClosed(!responseData.status);
      } catch (err) { }
    };

    getEventDetails();
  }, [])

  if (loading) {
    return <HeaderLoadingError/>
  } else if (!selectedEvent) {
    return <NoEventFound/>
  }

  const price = estimatePriceByEvent(selectedEvent, user);
  const imageUrl = selectedEvent.bgImageExtra ? selectedEvent.bgImageExtra : `/assets/images/bg/bg-image-${selectedEvent.bgImage}.webp`;

  return (
    <React.Fragment>
      <PageHelmet pageTitle="Event Details" />

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
                <h2 className="title theme-gradient">{selectedEvent.newTitle || selectedEvent.title}</h2>
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
            <div className="col-lg-12">
              <div className="portfolio-details">
                <div className="inner">
                  <h2>About</h2>
                  <p className="subtitle">{selectedEvent.title}</p>
                  <p style={{ whiteSpace: 'pre-line' }}>{selectedEvent.text}</p>
                  <div className="portfolio-view-list d-flex flex-wrap">
                    <div className="port-view">
                      <span>When</span>
                      <h4>{moment(selectedEvent.date).format("Do MMMM") + ", " + moment(selectedEvent.time).format('hh:mm')}</h4>
                      {selectedEvent.correctedDate && (
                        <p style={{ color: "#f80707" }} className="error">
                          {"Updated Date -> " + moment(selectedEvent.correctedDate).format("Do MMMM")}
                        </p>
                      )}
                      {selectedEvent.correctedTime && (
                        <p style={{ color: "#f80707" }} className="error">
                          {"Updated Time -> " + moment(selectedEvent.correctedTime).format('hh:mm')}
                        </p>
                      )}
                    </div>

                    <div className="port-view">
                      <span>Where</span>
                      <h4>{selectedEvent.location}</h4>
                    </div>

                    <div className="port-view">
                      <span>Entry fee</span>
                      <h4>{price}</h4>
                    </div>
                  </div>
                  {
                    //for links to subEvent
                    (selectedEvent?.subEvent.description && selectedEvent?.subEvent.links.length > 0 ) &&
                    <div className="mt--40 mb--40 team_member_border-1 center_section">
                      <h3 className="center_text">
                          {selectedEvent.subEvent.description}
                      </h3>
                      <div className="row">
                        {
                            selectedEvent.subEvent.links.map((link) => {
                            return <a
                              className="rn-button-style--2 rn-btn-reverse-green center_text center_div_no_gap m--5"
                              href={'/' + region + '/event-details' + link.href}
                            >
                              <span className="">{link.name}</span>
                            </a>
                          })
                        }
                      </div>
                    </div>
                  }
                  {!selectedEvent.isSaleClosed && (loading ? <div>
                    <h3 className="mt--20">Checking Ticket Availability - please be patient!</h3>
                    <Loader />
                  </div> :
                    <div className="purchase-btn">
                      {selectedEvent.ticketLink ? <div>
                        <WithBackBtn><a
                          style={eventClosed ? { pointerEvents: 'none', backgroundColor: '#ccc', borderColor: "white" } : {}}
                          href={selectedEvent.ticketLink}
                          selectedEvent="_blank"
                          className="rn-button-style--2 rn-btn-reverse-green mt--80"
                        >
                          {eventClosed ? "Sold out" : 'Buy Ticket'}
                        </a></WithBackBtn>
                        <p className="information mt--20">*Tickets are purchased from an outside platform! Click the button to be redirected</p></div> : <WithBackBtn><Link
                          style={eventClosed ? { pointerEvents: 'none', backgroundColor: '#ccc', borderColor: "white" } : {}}
                          to={`/${region}/purchase-ticket/${eventId}`}
                          className="rn-button-style--2 rn-btn-reverse-green"
                        >
                          {eventClosed ? "Sold out" : 'Buy Ticket'}
                        </Link></WithBackBtn>}
                        {selectedEvent.isGala && <h4>Ticket Sale closes on the 23th at 23:59</h4>}
                      {selectedEvent.ticketTimer && <Countdown selectedEventTime={selectedEvent.ticketTimer} setEventClosed={setEventClosed} />}
                    </div>)}
                </div>
                <br />
                {/* Start Contact Map  */}
                <div className="container">
                  <div className="rn-contact-map-area position-relative">
                    {/* <div style={{ height: "450px", width: "100%" }}>
                      <GoogleMapReact
                        defaultCenter={eventDetails[0].center}
                        defaultZoom={eventDetails[0].zoom}
                      >
                        <AnyReactComponent
                          lat={59.955413}
                          lng={30.337844}
                          text="My Marker"
                        />
                      </GoogleMapReact>
                    </div> */}
                  </div>
                </div>
                {/* End Contact Map  */}
                <br />
                {selectedEvent.isGala && <GalaMembers />}
                <div className="portfolio-thumb-inner row">

                  {selectedEvent.images.map((value, index) => {
                    return <div key={index} className="col-lg-6 col-md-12 col-12 thumb center_div mb--30">
                      <ImageFb src={`${value}`} alt="Portfolio Images" />
                    </div>

                  })}
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
          <FiChevronUp />
        </ScrollToTop>
      </div>
      {/* End Back To Top */}

      <Footer />
    </React.Fragment>
  );
};
export default EventDetails;
