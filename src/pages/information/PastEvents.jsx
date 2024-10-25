import React, { Component } from "react";
import PageHelmet from "../../component/common/Helmet";
import Breadcrumb from "../../elements/common/Breadcrumb";
import ScrollToTop from "react-scroll-up";
import { FiChevronUp, FiInstagram } from "react-icons/fi";
import Header from "../../component/header/Header";
import { Image } from "primereact/image";
import Footer from "../../component/footer/Footer";
import RegionOptionsUnstyled from "../../elements/ui/buttons/RegionOptionsUnstyled";
import { REGION_INSTAGRAM } from "../../util/defines/REGIONS_DESIGN";
import { PAST_EVENTS_GALLERY } from "../../util/defines/GALLERY";

const PastEventsContent = () => {
  return (
    <div className="portfolio-area pt--40 pb--120 bg_color--5">
      <div className="rn-slick-dot">
        <div className="container">
          <div className="row mb--10">
            <div className="col-12">
              <div className="section-title service-style--3 text-left mb--15 mb_sm--0">
                <h2 className="title">Past Events</h2>
                <p>
                  Let us introduce you to our events that brought success beyond
                  our expectations. In Bulgarian Society we rely on variety so
                  we are proud to showcase it
                </p>
              </div>
            </div>
          </div>
          <div className="row">
            <div className="col-12 past-events-gallery">
              {PAST_EVENTS_GALLERY.map((e, i) => {
                return (
                  <div
                    key={i}
                    className={`gallery-element-${
                      i % 2 === 0 ? "left" : "right"
                    }`}
                  >
                    <h3>{e.text}</h3>
                    <Image className="gallery-showcase" src={e.src} alt="past event" preview />
                  </div>
                );
              })}
            </div>
            <div
              style={{ alignSelf: "flex-start" }}
              className="col-12 past-events-gallery"
            >
              <h2 className="mt--40">
                Find more about our latest events on our{" "}
                <FiInstagram style={{ fontSize: "1em" }} /> channels
              </h2>
              <RegionOptionsUnstyled links={REGION_INSTAGRAM} />
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
        <PageHelmet pageTitle="Events" />
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
            <FiChevronUp />
          </ScrollToTop>
        </div>
        {/* End Back To Top */}

        <Footer />
      </React.Fragment>
    );
  }
}
export { PastEvents, PastEventsContent };
