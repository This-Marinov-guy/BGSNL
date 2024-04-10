import React, { useEffect, useState } from "react";
import PageHelmet from "../../component/common/Helmet";
import ScrollToTop from "react-scroll-up";
import { FiChevronUp } from "react-icons/fi";
import Header from "../../component/header/Header";
import Footer from "../../component/footer/Footer";
import { useSelector } from "react-redux";
import { selectUser } from "../../redux/user";
import { useObjectGrabUrl } from "../../hooks/object-hook";
import ImageFb from "../../elements/ui/ImageFb";
import Countdown from "../../elements/ui/Countdown";
import { useHttpClient } from "../../hooks/http-hook";
import Loader from "../../elements/ui/Loader";
import { Link, useParams } from "react-router-dom";
import { SOCIETY_EVENTS } from "../../util/OPEN_EVENTS";
import { link } from "fs-extra";
import WithBackBtn from "../../elements/ui/WithBackBtn";

const EventDetails = () => {
  const [eventClosed, setEventClosed] = useState(false)
  const user = useSelector(selectUser);

  const { region } = useParams();

  const target = useObjectGrabUrl(SOCIETY_EVENTS[region]);

  const imageUrl = `/assets/images/bg/bg-image-${target.bgImage}.webp`;

  const { loading, sendRequest } = useHttpClient();

  useEffect(() => {
    if (target.ticketLimit) {
      const checkRemainingTicketQuantity = async () => {
        try {
          const responseData = await sendRequest(`event/sold-ticket-count`, "POST", {
            eventName: target.title,
            region,
            date: target.date
          });
          const isTicketsSold = target.ticketLimit - responseData.ticketsSold <= 0;
          if (isTicketsSold) {
            setEventClosed(true)
          }
        } catch (err) { }
      };
      checkRemainingTicketQuantity();
    }
  }, [])

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
                <h2 className="title theme-gradient">{target.newTitle || target.title}</h2>
                <p>{target.description}</p>
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
                  <p className="subtitle">{target.title}</p>
                  {target.text.map((value, index) => {
                    return <p key={index}>{value}</p>
                  })}
                  <div className="portfolio-view-list d-flex flex-wrap">
                    <div className="port-view">
                      <span>When</span>
                      <h4>{target.date + ", " + target.time}</h4>
                      {target.correctedDate && (
                        <p style={{ color: "#f80707" }} className="error">
                          {"Updated Date -> " + target.correctedDate}
                        </p>
                      )}
                      {target.correctedTime && (
                        <p style={{ color: "#f80707" }} className="error">
                          {"Updated Time -> " + target.correctedTime}
                        </p>
                      )}
                    </div>

                    <div className="port-view">
                      <span>Where</span>
                      <h4>{target.where}</h4>
                    </div>

                    <div className="port-view">
                      <span>Entry fee</span>
                      {!target.isFree ? <h4>
                        {(user.token && target.memberEntry)
                          ? target.memberEntry + (!isNaN(target.memberEntry) ? ' euro ' : ' ') + ((target.including && target.including.length > 0) ? target.including[0] : '')
                          : target.entry + (!isNaN(target.entry) ? ' euro ' : ' ') + ((target.including && target.including.length > 0) ? target.including[1] : '')}
                      </h4> : <h4 >{target.ticket_link ? 'Check ticket portal' : 'FREE'}</h4>}
                    </div>
                  </div>
                  {
                    //for links to subEvent
                    target.subEvent &&
                    <div className="mt--40 mb--40 team_member_border-1 center_section">
                      <h3 className="center_text">
                        {target.subEvent.description}
                      </h3>
                      <div className="row">
                        {
                          target.subEvent.links.map((link) => {
                            return <a
                              className="rn-button-style--2 rn-btn-reverse-green center_text m--5"
                              href={'/' + region + '/event-details' + link.href}
                            >
                              <span className="">{link.name}</span>
                            </a>
                          })
                        }
                      </div>
                    </div>
                  }
                  {!target.is_tickets_closed && (loading ? <div>
                    <h3 className="mt--20">Checking Ticket Availability - please be patient!</h3>
                    <Loader />
                  </div> :
                    <div className="purchase-btn">
                      {target.ticket_link ? <div>
                        <WithBackBtn><a
                          style={eventClosed ? { pointerEvents: 'none', backgroundColor: '#ccc', borderColor: "white" } : {}}
                          href={target.ticket_link}
                          target="_blank"
                          className="rn-button-style--2 btn-solid mt--80"
                        >
                          {eventClosed ? "Sold out" : 'Buy Ticket'}
                        </a></WithBackBtn>
                        <p className="information mt--20">*Tickets are purchased from an outside platform! Click the button to be redirected</p></div> : <WithBackBtn><Link
                          style={eventClosed ? { pointerEvents: 'none', backgroundColor: '#ccc', borderColor: "white" } : {}}
                          to={`/${region}/purchase-ticket/${target.title}`}
                          className="rn-button-style--2 btn-solid"
                        >
                          {eventClosed ? "Sold out" : 'Buy Ticket'}
                        </Link></WithBackBtn>}
                      {target.ticketTimer && <Countdown targetTime={target.ticketTimer} setEventClosed={setEventClosed} />}
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
                <div className="portfolio-thumb-inner row">

                  {target.images.map((value, index) => {
                    return <div key={index} className="col-lg-6 col-md-12 col-12 thumb center_div mb--30">
                      <ImageFb src={`${value}.webp`} fallback={`${value}.jpg`}
                        alt="Portfolio Images" />
                    </div>

                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div >
      {/* End Portfolio Details */}

      {/* Start Back To Top */}
      <div className="backto-top">
        <ScrollToTop showUnder={160}>
          <FiChevronUp />
        </ScrollToTop>
      </div>
      {/* End Back To Top */}

      <Footer />
    </React.Fragment >
  );
};
export default EventDetails;
