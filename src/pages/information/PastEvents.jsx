import React, { Component } from "react";
import PageHelmet from "../../component/common/Helmet";
import Breadcrumb from "../../elements/common/Breadcrumb";
import ScrollToTop from "react-scroll-up";
import { FiChevronUp, FiInstagram } from "react-icons/fi";
import Header from "../../component/header/Header";
import { Image } from "primereact/image";
import Footer from "../../component/footer/Footer";
import RegionOptionsUnstyled from "../../elements/ui/buttons/RegionOptionsUnstyled";
import {
  REGION_DISPLAY_NAMES,
  REGION_INSTAGRAM,
  REGIONS,
  getRegionPath,
} from "../../util/defines/REGIONS_DESIGN";
import { PAST_EVENTS_GALLERY } from "../../util/defines/GALLERY";
import {
  PAST_EVENTS_ARCHIVE,
  PAST_EVENTS_ARCHIVE_STATS,
} from "../../util/defines/PAST_EVENTS_ARCHIVE";

const formatEventDate = (date) => date;
const regionLogoPath = (region) => `/assets/images/logo/${region}.webp`;
const eventContext = (event) => (
  event.summary || `A BGSNL past event in ${event.regionName}.`
);
const eventBadges = (event) => [
  "Past event",
  ...(event.tags?.length > 0 ? event.tags : ["community"]),
];
const eventDetails = (event) => [
  event.date ? { label: "Date", value: formatEventDate(event.date) } : null,
  { label: "City", value: event.regionName },
  event.location ? { label: "Venue", value: event.location } : null,
].filter(Boolean);

const cityRegions = REGIONS.map((region) => ({
  slug: region,
  name: REGION_DISPLAY_NAMES[region] || region.replace(/_/g, " "),
  path: `${getRegionPath(region)}/events/past-events`,
  logo: regionLogoPath(region),
}));

const cityRegionNames = cityRegions.map((region) => region.name).join(", ");

const yearRange = PAST_EVENTS_ARCHIVE_STATS.years?.length
  ? `${Math.min(...PAST_EVENTS_ARCHIVE_STATS.years)}-${Math.max(...PAST_EVENTS_ARCHIVE_STATS.years)}`
  : "recent years";

const PastEventsContent = () => {
  return (
    <div className="portfolio-area pt--40 pb--120 bg_color--5">
      <div className="rn-slick-dot">
        <div className="container">
          <div className="row mb--30">
            <div className="col-12">
              <div className="section-title service-style--3 text-left mb--15 mb_sm--0">
                <h2 className="title">Past Events</h2>
                <p>
                  Quick answer: BGSNL has hosted{" "}
                  {PAST_EVENTS_ARCHIVE_STATS.totalEvents} archived public events
                  across its Dutch city network in {yearRange}. Browse the
                  archive by city, venue, and event theme across{" "}
                  {cityRegionNames}.
                </p>
              </div>
            </div>
          </div>
          <div className="row">
            <div className="col-12 row past-events-gallery">
              {PAST_EVENTS_GALLERY.map((e, i) => {
                return (
                  <div
                    key={i}
                    className={`col-lg-6 col-12 gallery-element-${
                      i % 2 === 0 ? "left" : "right"
                    }`}
                  >
                    <h3>{e.text}</h3>
                    <Image
                      className="gallery-showcase"
                      src={e.src}
                      alt="past event"
                      preview
                    />
                  </div>
                );
              })}
            </div>

            <div className="col-12 past-events-archive">
              <div className="archive-links" aria-label="Past events next steps">
                <a href="/events/future-events">See upcoming events</a>
                <a href="/join-the-society">Join the society</a>
                <a href="/about">Learn about BGSNL</a>
              </div>

              <nav className="archive-city-quick-links" aria-label="Browse past events by city">
                <span>Browse cities</span>
                {cityRegions.map((region) => (
                  <a key={region.slug} href={region.path}>
                    <img
                      className="archive-city-logo"
                      src={region.logo}
                      alt=""
                      aria-hidden="true"
                      loading="lazy"
                    />
                    {region.name}
                  </a>
                ))}
              </nav>

              <div className="archive-event-grid">
                {PAST_EVENTS_ARCHIVE.map((event) => {
                  const context = eventContext(event);
                  return (
                    <article className="archive-event-card" key={event.id}>
                      <div className="archive-event-card-header">
                        <img
                          className="archive-event-logo"
                          src={regionLogoPath(event.region)}
                          alt={`${event.regionName} logo`}
                          loading="lazy"
                        />
                        <div className="archive-event-tags">
                          {eventBadges(event).map((badge) => (
                            <span key={badge}>{badge}</span>
                          ))}
                        </div>
                      </div>
                      <h3>{event.title}</h3>
                      {context ? <p className="archive-event-context">{context}</p> : null}
                      <dl className="archive-event-detail-list">
                        {eventDetails(event).map((detail) => (
                          <div key={detail.label}>
                            <dt>{detail.label}</dt>
                            <dd>{detail.value}</dd>
                          </div>
                        ))}
                      </dl>
                    </article>
                  );
                })}
              </div>
            </div>

            <div
              style={{ alignSelf: "flex-start" }}
              className="col-12 past-events-gallery"
            >
              <h2 className="mt--40 center_text" style={{ fontSize: "1em" }}>
                Find more about our latest events on our{" "}
                <FiInstagram style={{ fontSize: "1em" }} /> channels
              </h2>
              <RegionOptionsUnstyled links={REGION_INSTAGRAM} withMain />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

class PastEvents extends Component {
  render() {
    return (
      <React.Fragment>
        <PageHelmet
          pageTitle="Past Events"
          description="Browse the BGSNL past events archive: public event summaries across Dutch regions, showing cultural, social, sports, career, and networking events by Bulgarian Society Netherlands."
          canonicalUrl="https://www.bulgariansociety.nl/events/past-events"
          keywords="BGSNL past events, Bulgarian events Netherlands, Bulgarian Society Netherlands event archive"
        />
        <Header
          headertransparent="header--transparent"
          colorblack="color--black"
          logoname="logo.png"
        />
        {/* Start Breadcrump Area */}
        <Breadcrumb title={"Past Events"} />
        {/* End Breadcrump Area */}

        {/* Start Past Events Area */}
        <PastEventsContent />
        {/* End Past Events Area */}

        {/* Start Back To Top */}
        <div className="backto-top">
          <ScrollToTop showUnder={160}>
            <FiChevronUp size={26} style={{ fontSize: '26px' }} />
          </ScrollToTop>
        </div>
        {/* End Back To Top */}

        <Footer />
      </React.Fragment>
    );
  }
}
export { PastEvents, PastEventsContent };
