import React, { useState, useEffect } from "react";
import PageHelmet from "../../component/common/Helmet";
import Breadcrumb from "../../elements/common/Breadcrumb";
import ScrollToTop from "react-scroll-up";
import { FiChevronUp } from "react-icons/fi";
import Header from "../../component/header/Header";
import Footer from "../../component/footer/Footer";
import { useParams } from "react-router-dom";
import PortfolioList from "../../elements/portfolio/PortfolioList";
import { OTHER_EVENTS } from "../../util/defines/OTHER_EVENTS";
import { useDispatch, useSelector } from "react-redux";
import { selectEvents } from "../../redux/events";
import EventsLoading from "../../elements/ui/loading/EventsLoading";


const FutureEventsContent = ({displayAll}) => {
  const [isEventsLoading, setIsEventsLoading] = useState();

  const { region } = useParams();

  const events = displayAll ? useSelector(selectEvents) : useSelector(selectEvents)[region];
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchEventsFromApi = async () => {
      try {
        setIsEventsLoading(true);
        const responseData = await sendRequest(`event/actions/events`);
        dispatch(loadEvents(responseData.events));
      } catch (err) { } finally {
        setIsEventsLoading(false);
      }
    }

    fetchEventsFromApi();
  }, []);

  return (
    <div className="portfolio-area pt--120 pb--120 bg_color--5">
      <div className="rn-slick-dot">
        <div className="container">
          <div className="row mb--40">
            <div className="col-lg-6">
              <div className="section-title service-style--3 text-left mb--15 mb_sm--0">
                <h2 className="title">Future Events</h2>
                <p>
                  Our society events. Click on one for more information and buy
                  a ticket on our website
                </p>
              </div>
            </div>
            <div className="col-lg-12">
              <div className="row slick-space-gutter--15 slickdot--20">
                {isEventsLoading ? <EventsLoading/> : 
                events && events.filter(event => event.visible === true).length > 0 ? (
                  <PortfolioList
                    style="society"
                    target={events.filter(event => event.visible === true)}
                    styevariation="text-center mt--40"
                    column="col-lg-4 col-md-5 col-sm-6"
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
          <div className="row mb--80">
            <div className="col-lg-12">
              <div className="slick-space-gutter--15 slickdot--20">
                {OTHER_EVENTS[region] && OTHER_EVENTS[region].length > 0 ? (
                  <PortfolioList
                    style="other"
                    target={OTHER_EVENTS[region]}
                    styevariation="text-center mt--40"
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
      <FutureEventsContent openSocietyEvents={props.openSocietyEvents} />
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
