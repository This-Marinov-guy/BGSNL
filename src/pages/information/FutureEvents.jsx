import React, { useEffect } from "react";
import PageHelmet from "../../component/common/Helmet";
import Breadcrumb from "../../elements/common/Breadcrumb";
import ScrollToTop from "react-scroll-up";
import { Tooltip } from "primereact/tooltip";
import { FiCalendar, FiChevronUp } from "react-icons/fi";
import Header from "../../component/header/Header";
import Footer from "../../component/footer/Footer";
import { useParams } from "react-router-dom";
import { OTHER_EVENTS } from "../../util/defines/OTHER_EVENTS";
import { useDispatch, useSelector } from "react-redux";
import { selectEvents } from "../../redux/events";
import EventsLoading from "../../elements/ui/loading/EventsLoading";
import { useLoadEvents } from "../../hooks/common/api-hooks";
import { REGIONS } from "../../util/defines/REGIONS_DESIGN";
import {
  checkObjectOfArraysEmpty,
  hasNonEmptyValues,
} from "../../util/functions/helpers";
import PortfolioList2 from "../../elements/portfolio/PortfolioList2";
import CalendarSubscriptionComponent from "../../component/common/CalendarSubscriptionComponent";
import { showModal } from "../../redux/modal";
import { GOOGLE_CALENDAR_MODAL } from "../../util/defines/common";

const FutureEventsContent = ({ displayAll, nullable = true }) => {
  const { region } = useParams();

  const dispatch = useDispatch();

  const { reloadEvents, eventsLoading } = useLoadEvents();

  let events;

  if (displayAll) {
    events = useSelector(selectEvents);
  } else {
    events = useSelector(selectEvents)[region];

    if (events && events.length) {
      events = events.filter((event) => event.hidden === false);
    }
  }
  const isMoreThanOneEvent = hasNonEmptyValues(events);

  useEffect(() => {
    reloadEvents();
  }, []);

  if (nullable && displayAll && checkObjectOfArraysEmpty(events)) {
    return null;
  }

  return (
    <div className="portfolio-area pt--40 pb--10 bg_color--5">
      <div className="rn-slick-dot">
        <div className="container">
          <div className="row mb--40">
            <div className="col-lg-12">
              <div className="section-title service-style--3 text-left mb--15 mb_sm--0">
                <div className="d-flex align-items-center justify-content-between">
                  <h3 className="title">Future Events</h3>
                  <Tooltip target=".google_calendar" />
                  <FiCalendar
                    className="pointer swing google_calendar"
                    onClick={() => dispatch(showModal(GOOGLE_CALENDAR_MODAL))}
                    data-pr-tooltip="Click to see our Cloud Calendar"
                    data-pr-position="top"
                  />
                </div>
                <p className="mt--10">
                  What you can expect - our society events happening near you!
                  Make sure to subscribe to our social media or calendars in
                  order to be up to date with schedule and promotions
                </p>
              </div>
            </div>
            {displayAll ? (
              eventsLoading ? (
                <EventsLoading />
              ) : (
                REGIONS.map((region, index) => {
                  // Skip regions that have no events
                  if (!events[region] || !events[region].length) {
                    return null;
                  };

                  return (
                    <div
                      className="col-lg-4 col-md-6 col-12 mt--20"
                      key={index}
                    >
                      <h4 className="col-12 archive">{region.toUpperCase()}</h4>
                      <PortfolioList2
                        style="society"
                        target={events[region]}
                        styevariation="text-center"
                        column="col-12"
                      />
                    </div>
                  );
                })
              )
            ) : (
              <div className="col-lg-12">
                <div className="row slick-space-gutter--15 slickdot--20">
                  {eventsLoading ? (
                    <EventsLoading />
                  ) : events && events.length > 0 ? (
                    <PortfolioList2
                      style="society"
                      target={events}
                      styevariation="text-center"
                      column="col-lg-4 col-md-5 col-sm-6"
                    />
                  ) : (
                    <p className="col-lg-6 mt--20 mb--20">
                      Currently there are no upcoming other events. Follow us
                      for updates!
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const FutureOtherEventsContent = () => {
  return (
    <div className="portfolio-area pt--40 pb--10 bg_color--5">
      <div className="rn-slick-dot">
        <div className="container">
          <div className="row">
            <div className="col-lg-6">
              <div className="section-title service-style--3 text-left mb--15 mb_sm--0">
                <h3 className="title">Special events</h3>
                <p>Events that you might find interesting from our partners</p>
              </div>
            </div>
          </div>
          <div className="row mb--40">
            <div className="col-lg-12">
              <div className="slick-space-gutter--15 slickdot--20">
                {OTHER_EVENTS && OTHER_EVENTS.length > 0 ? (
                  <PortfolioList2
                    style="other"
                    target={OTHER_EVENTS}
                    styevariation="text-center"
                    column="col-lg-4 col-md-6 col-sm-6 col-12"
                    special
                  />
                ) : (
                  <p className="col-lg-6 mt--20 mb--20">
                    Currently there are no upcoming other events. Follow us for
                    updates!
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
  const { region } = useParams();

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

      {/* Add Calendar Subscription Component Here */}
      <CalendarSubscriptionComponent />

      {/* Start Future Events Area */}
      {region ? (
        <>
          <FutureOtherEventsContent />
          <FutureEventsContent nullable={false} />
        </>
      ) : (
        <>
          <FutureOtherEventsContent />
          <FutureEventsContent displayAll nullable={false} />
        </>
      )}
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
