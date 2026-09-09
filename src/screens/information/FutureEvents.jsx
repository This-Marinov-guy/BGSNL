"use client";

import React, {
  useEffect,
  useState,
} from "react";
import calendarMotion from "@assets/images/svg/motion/calendar-motion.json";
import { useReducedMotion } from "framer-motion";
import Lottie from "react-lottie-player";
import PropTypes from "prop-types";
import Slider from "react-slick";
import {
  useDispatch,
  useSelector,
} from "react-redux";
import { Tooltip } from "@/compat/primereact";
import ScrollToTop from "@/component/common/ScrollToTop";
import {
  FiChevronUp,
  IconlyArrowLeft,
  IconlyArrowRight,
} from "@/elements/ui/icons/IconlyIcons";
import { useParams } from "@/util/navigation";
import CalendarSubscriptionComponent from "../../component/common/CalendarSubscriptionComponent";
import PageHelmet from "../../component/common/Helmet";
import Footer from "../../component/footer/Footer";
import Header from "../../component/header/Header";
import Breadcrumb from "../../elements/common/Breadcrumb";
import FocusCards, { FocusCard } from "../../elements/ui/FocusCards";
import EventsLoading from "../../elements/ui/loading/EventsLoading";
import { useLoadEvents } from "../../hooks/common/api-hooks";
import { selectEvents } from "../../redux/events";
import { showModal } from "../../redux/modal";
import { selectIsAuth } from "../../redux/user";
import { GOOGLE_CALENDAR_MODAL } from "../../util/defines/common";
import { OTHER_EVENTS } from "../../util/defines/OTHER_EVENTS";
import { REGIONS } from "../../util/defines/REGIONS_DESIGN";
import { capitalizeFirstLetter } from "../../util/functions/capitalize";
import {
  checkObjectOfArraysEmpty,
} from "../../util/functions/helpers";

const eventsByRegionPropType = PropTypes.objectOf(
  PropTypes.arrayOf(PropTypes.object)
);

const FutureEventsArrow = ({ className, direction, onClick }) => {
  const isPrevious = direction === "previous";
  const Icon = isPrevious ? IconlyArrowLeft : IconlyArrowRight;

  return (
    <button
      aria-label={`${isPrevious ? "Previous" : "Next"} future event`}
      className={`${className || ""} future-events-carousel-arrow future-events-carousel-arrow--${direction}`}
      onClick={onClick}
      type="button"
    >
      <Icon aria-hidden />
    </button>
  );
};

FutureEventsArrow.propTypes = {
  className: PropTypes.string,
  direction: PropTypes.oneOf(["previous", "next"]).isRequired,
  onClick: PropTypes.func,
};

const FutureEventsCarousel = ({ events, filterKey }) => {
  const shouldReduceMotion = useReducedMotion();
  const slidesToShow = Math.min(2, events.length);
  const hasMultipleEvents = events.length > 1;

  const settings = {
    accessibility: true,
    arrows: hasMultipleEvents,
    dots: hasMultipleEvents,
    infinite: events.length > 2,
    nextArrow: <FutureEventsArrow direction="next" />,
    prevArrow: <FutureEventsArrow direction="previous" />,
    slidesToScroll: 1,
    slidesToShow,
    speed: shouldReduceMotion ? 0 : 380,
    swipeToSlide: true,
    responsive: [
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 1,
        },
      },
    ],
  };

  return (
    <section
      aria-label="Future events carousel"
      className="future-events-carousel-shell"
    >
      <Slider
        className="future-events-carousel"
        key={`${filterKey}-${events.length}`}
        {...settings}
      >
        {events.map((event) => (
          <div className="future-events-carousel-slide" key={event.id}>
            <FocusCard card={event} region={event.region} />
          </div>
        ))}
      </Slider>
    </section>
  );
};

FutureEventsCarousel.propTypes = {
  events: PropTypes.arrayOf(PropTypes.object).isRequired,
  filterKey: PropTypes.string.isRequired,
};

/**
 * `initialEvents` is the region-keyed map fetched on the server by the route,
 * so upcoming events are in the HTML rather than appearing after reloadEvents()
 * runs on the client. The store is empty during SSR and on the client's first
 * render, so both produce identical markup; the store wins once it is filled.
 */
const FutureEventsContent = ({
  carousel = false,
  displayAll,
  nullable = true,
  initialEvents,
}) => {
  const { region } = useParams();
  const [selectedRegion, setSelectedRegion] = useState("all");

  const dispatch = useDispatch();

  const { reloadEvents, eventsLoading } = useLoadEvents();

  const isAuth = useSelector(selectIsAuth);
  // Called unconditionally — the previous version had it inside both branches
  // of an if/else, which is a hooks-order hazard.
  const storedEvents = useSelector(selectEvents);

  const source =
    initialEvents && checkObjectOfArraysEmpty(storedEvents)
      ? initialEvents
      : storedEvents;

  let events;

  if (displayAll) {
    events = source;
  } else {
    events = source[region];

    if (events && events.length) {
      events = events.filter(
        (event) => event.hidden === false && (isAuth || !event.memberOnly)
      );
    }
  }
  useEffect(() => {
    reloadEvents();
  }, []);

  if (nullable && displayAll && checkObjectOfArraysEmpty(events)) {
    return null;
  }

  const visibleRegionGroups = displayAll
    ? REGIONS.map((regionName) => ({
        regionName,
        events: (events?.[regionName] || []).filter(
          (event) => event.hidden !== true && (isAuth || !event.memberOnly)
        ),
      })).filter((group) => group.events.length > 0)
    : [];

  const visibleEvents = visibleRegionGroups.flatMap(({ regionName, events: regionEvents }) =>
    regionEvents.map((event) => ({
      ...event,
      region: event.region ?? regionName,
    }))
  );
  const showThreeEventRow = displayAll && visibleEvents.length === 3;
  const activeRegion =
    selectedRegion === "all" ||
    visibleRegionGroups.some(({ regionName }) => regionName === selectedRegion)
      ? selectedRegion
      : "all";
  const carouselEvents = activeRegion === "all"
    ? visibleEvents
    : visibleRegionGroups.find(({ regionName }) => regionName === activeRegion)
      ?.events.map((event) => ({
        ...event,
        region: event.region ?? activeRegion,
      })) || [];

  // A single region, or a long list of regions, gets the full page width so
  // its event cards can run horizontally. Two or three active regions remain
  // compact columns for an easy cross-city overview.
  const regionListLayout =
    visibleRegionGroups.length === 1 || visibleRegionGroups.length > 3
      ? "future-events-region-list--rows"
      : `future-events-region-list--columns-${visibleRegionGroups.length}`;

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
                  <Lottie
                    className="pointer google_calendar"
                    onClick={() => dispatch(showModal(GOOGLE_CALENDAR_MODAL))}
                    data-pr-tooltip="Click to see our Cloud Calendar"
                    data-pr-position="top"
                    animationData={calendarMotion}
                    play
                    loop
                    style={{ width: 50, height: 50 }}
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
              ) : carousel ? (
                <div className="col-lg-12">
                  <div className="future-events-filter-panel">
                    <div className="future-events-filter-heading">
                      <label
                        className="type-caption"
                        htmlFor="future-events-region-select"
                      >
                        Filter by region
                      </label>
                      <strong aria-live="polite">
                        {carouselEvents.length} {carouselEvents.length === 1 ? "event" : "events"}
                      </strong>
                    </div>
                    <select
                      aria-label="Filter future events by region"
                      className="bgsnl-form-control future-events-region-select"
                      id="future-events-region-select"
                      onChange={(event) => setSelectedRegion(event.target.value)}
                      value={activeRegion}
                    >
                      <option value="all">
                        All regions ({visibleEvents.length})
                      </option>
                      {visibleRegionGroups.map(({ regionName, events: regionEvents }) => (
                        <option
                          key={regionName}
                          value={regionName}
                        >
                          {capitalizeFirstLetter(regionName, true)} ({regionEvents.length})
                        </option>
                      ))}
                    </select>
                  </div>

                  {carouselEvents.length ? (
                    <FutureEventsCarousel
                      events={carouselEvents}
                      filterKey={activeRegion}
                    />
                  ) : (
                    <p className="future-events-filter-empty">
                      No upcoming events in this region.
                    </p>
                  )}
                </div>
              ) : (
                <div className="col-lg-12">
                  <div
                    className={`future-events-region-list ${regionListLayout}${
                      showThreeEventRow ? " future-events-three-events" : ""
                    }`}
                    data-active-regions={visibleRegionGroups.length}
                  >
                    {showThreeEventRow ? (
                      <section className="future-events-region-section">
                        <FocusCards
                          cards={visibleEvents}
                          centerItems={false}
                        />
                      </section>
                    ) : visibleRegionGroups.map(({ regionName, events: regionEvents }) => (
                      <section
                        className="future-events-region-section"
                        key={regionName}
                      >
                        <div className="future-events-region-header">
                          {/* <h4 className="archive future-events-region-title">
                            {capitalizeFirstLetter(
                              regionName,
                              true,
                            ).toUpperCase()}
                          </h4> */}
                          <span className="future-events-region-count m-auto">
                            <h4 className="archive future-events-region-title">
                              {capitalizeFirstLetter(
                                regionName,
                                true,
                              ).toUpperCase()}
                            </h4>{" "}
                          </span>
                        </div>
                        <FocusCards
                          cards={regionEvents}
                          region={regionName}
                        />
                      </section>
                    ))}
                  </div>
                </div>
              )
            ) : (
              <div
                className={`col-lg-12${
                  events?.length === 3 ? " future-events-three-events" : ""
                }`}
              >
                {eventsLoading ? (
                  <EventsLoading />
                ) : events && events.length > 0 ? (
                  <FocusCards
                    cards={events}
                    region={region}
                    centerItems={false}
                  />
                ) : (
                  <p className="col-lg-6 mt--20 mb--20">
                    Currently there are no upcoming other events. Follow us
                    for updates!
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

FutureEventsContent.propTypes = {
  carousel: PropTypes.bool,
  displayAll: PropTypes.bool,
  initialEvents: eventsByRegionPropType,
  nullable: PropTypes.bool,
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
              {OTHER_EVENTS && OTHER_EVENTS.length > 0 ? (
                <FocusCards
                  cards={OTHER_EVENTS}
                  region="other"
                  isOtherEvent
                  centerItems={false}
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
  );
};

const FutureEvents = ({ initialEvents }) => {
  const { region } = useParams();

  return (
    <React.Fragment>
      <PageHelmet pageTitle="Events" />

      <Header
        headertransparent="header--transparent"
        colorblack="color--black"
        logoname="logo.png"
      />
      <Breadcrumb
        title="Future Events"
        description="See what is coming up and plan your next gathering with the Bulgarian community near you."
      />

      <div className="future-events-page-layout">
        <aside
          className="future-events-page-layout__calendar"
          aria-label="Event calendar"
        >
          <CalendarSubscriptionComponent />
        </aside>

        <div className="future-events-page-layout__events">
          {/* Start Future Events Area */}
          {region ? (
            <>
              {OTHER_EVENTS.length > 0 && <FutureOtherEventsContent />}
              <FutureEventsContent
                nullable={false}
                initialEvents={initialEvents}
              />
            </>
          ) : (
            <>
              {OTHER_EVENTS.length > 0 && <FutureOtherEventsContent />}
              <FutureEventsContent
                carousel
                displayAll
                nullable={false}
                initialEvents={initialEvents}
              />
            </>
          )}
          {/* End Future Events Area */}
        </div>
      </div>

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

FutureEvents.propTypes = {
  initialEvents: eventsByRegionPropType,
};

export { FutureEvents, FutureEventsContent, FutureOtherEventsContent };
