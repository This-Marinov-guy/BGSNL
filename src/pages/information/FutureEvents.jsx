import React, { useEffect } from "react";
import PageHelmet from "../../component/common/Helmet";
import Breadcrumb from "../../elements/common/Breadcrumb";
import ScrollToTop from "react-scroll-up";
import { FiChevronUp } from "react-icons/fi";
import Header from "../../component/header/Header";
import Footer from "../../component/footer/Footer";
import { useParams } from "react-router-dom";
import PortfolioList from "../../elements/portfolio/PortfolioList";
import { OTHER_EVENTS } from "../../util/defines/OTHER_EVENTS";
import { useSelector } from "react-redux";
import { selectEvents } from "../../redux/events";
import EventsLoading from "../../elements/ui/loading/EventsLoading";
import { useLoadEvents } from "../../hooks/common/api-hooks";
import { REGIONS } from "../../util/defines/REGIONS_DESIGN";
import { checkObjectOfArraysEmpty } from "../../util/functions/helpers";
import PortfolioList2 from "../../elements/portfolio/PortfolioList2";

const FutureEventsContent = ({ displayAll }) => {
  const { region } = useParams();

  const { reloadEvents, eventsLoading } = useLoadEvents();

  let events;

  if (displayAll) {
    events = useSelector(selectEvents);
  } else {
    events = useSelector(selectEvents)[region];

    if (events && events.length) {
      events = events.filter(event => event.hidden === false);
    }
  }

  useEffect(() => {
    reloadEvents();
  }, []);

  if (displayAll && checkObjectOfArraysEmpty(events)) {
    return null;
  }

  return (
    <div className="portfolio-area pt--40 pb--40 bg_color--5">
      <div className="rn-slick-dot">
        <div className="container">
          <div className="row mb--40">
            <div className="col-lg-12">
              <div className="section-title service-style--3 text-left mb--15 mb_sm--0">
                <h2 className="title">Future Events</h2>
                <p>
                  Our society events. Click on one for more information and buy
                  a ticket on our website
                </p>
              </div>
            </div>
            {displayAll ?
              (eventsLoading ? <EventsLoading /> : REGIONS.map((region, index) => {
                if (events[region].length) {
                  return <div className='col-lg-4 col-md-6 col-12 row mt--20' key={index}>
                    <h4 className='col-12 archive'>{region.toUpperCase()}</h4>
                    <PortfolioList2
                      style="society"
                      target={events[region]}
                      styevariation="text-center"
                      column="col-12"
                    />
                  </div>
                }
              }))
              :
              <div className="col-lg-12">
                <div className="row slick-space-gutter--15 slickdot--20">
                  {eventsLoading ? <EventsLoading /> :
                    events && events.length > 0 ? (
                      <PortfolioList2
                        style="society"
                        target={events}
                        styevariation="text-center"
                        column="col-lg-4 col-md-5 col-sm-6"
                      />
                    ) : (
                      <p className="col-lg-6 mt--20 mb--20">
                        Currently there are no upcoming other events. Follow us for updates!
                      </p>
                    )}
                </div>
              </div>}
          </div>
        </div>
      </div>
    </div>
  );
};

const FutureOtherEventsContent = () => {

  const { region } = useParams();


  return (
    <div className="portfolio-area pt--20 pb--100 bg_color--5">
      <div className="rn-slick-dot">
        <div className="container">
          <div className="row">
            <div className="col-lg-6">
              <div className="section-title service-style--3 text-left mb--15 mb_sm--0">
                <h3 className="title">Other events</h3>
                <p>
                  Events that you might find interesting from other organizers
                </p>
              </div>
            </div>
          </div>
          <div className="row mb--40">
            <div className="col-lg-12">
              <div className="slick-space-gutter--15 slickdot--20">
                {OTHER_EVENTS[region] && OTHER_EVENTS[region].length > 0 ? (
                  <PortfolioList2
                    style="other"
                    target={OTHER_EVENTS[region]}
                    styevariation="text-center"
                    column="col-lg-4 col-md-6 col-sm-6 col-12"
                  />
                ) : (
                  <p className="col-lg-6 mt--20 mb--20">
                    Currently there are no upcoming other events. Follow us for updates!
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const FutureEvents = (props) => {
  return (
    <React.Fragment>
      <PageHelmet pageTitle="Events" />

      <Header
        headertransparent="header--transparent"
        colorblack="color--black"
        logoname="logo.png"
      />
      {/* Start Breadcrump Area */}
      <Breadcrumb title={"Future Events"} />
      {/* End Breadcrump Area */}

      {/* Start Future Events Area */}
      <FutureEventsContent />
      <FutureOtherEventsContent
        openNonSocietyEvents={props.openNonSocietyEvents}
      />
      {/* End Future Events Area */}

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

export { FutureEvents, FutureEventsContent, FutureOtherEventsContent };
