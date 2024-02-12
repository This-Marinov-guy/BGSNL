import React, { Component } from "react";
import PageHelmet from "../../component/common/Helmet";
import Breadcrumb from "../../elements/common/Breadcrumb";
import Slider from "react-slick";
import ScrollToTop from "react-scroll-up";
import { FiChevronUp } from "react-icons/fi";
import { slickDot } from "../../page-demo/script";
import Header from "../../component/header/Header";
import Footer from "../../component/footer/Footer";
import ImageFb from "../../elements/ui/ImageFb";
import { Link , useParams} from "react-router-dom";
import {PAST_EVENTS} from '../../util/PAST_EVENTS'


const PastEventsContent = () => {
const {region} = useParams();

    return (
      <div className="portfolio-area pt--80 pb--140 bg_color--5">
        <div className="rn-slick-dot">
          <div className="container">
            <div className="row">
              <div className="col-lg-6">
                <div className="section-title service-style--3 text-left mb--15 mb_sm--0">
                  <h2 className="title">Past Events</h2>
                  <p>
                    Let us introduce you to our events that brought success
                    beyond our expectations
                  </p>
                </div>
              </div>
            </div>
            <div className="row">
              <div className="col-lg-12">
                <div className="slick-space-gutter--15 slickdot--100">
                  {PAST_EVENTS[region] ? <Slider {...slickDot}>
                    {PAST_EVENTS[region].map((value, index) => (
                      <div className="portfolio portfolio-slider" key={index}>
                        <Link
                          to={`/${region}/event-reflection/${value.url}`}
                          className="thumbnail-inner-2"
                        >
                          <ImageFb
                            className="thumbnail"
                            src={`/assets/images/portfolio/${region}/portfolio-${value.image}.webp`}
                            fallback={`/assets/images/portfolio/${region}/portfolio-${value.image}.jpg`}
                            alt="Event Images"
                          />
                        </Link>
                      </div>
                    ))}
                  </Slider> : <h3>Expect the catalogue of past events soon</h3>}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
}

const PastEventsListed = () => {
const {region} = useParams()

    return (
      <div className="portfolio-area pt--120 pb--140 bg_color--5">
        <div className="rn-slick-dot">
          <div className="container">
            <div className="row">
              <div className="col-lg-6">
                <div className="section-title service-style--3 text-left mb--15 mb_sm--0">
                  <h2 className="title">Past Events</h2>
                  <p>
                    Let us introduce you to our events that brought success
                    beyond our expectations
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="grid">
            {PAST_EVENTS[region] ? PAST_EVENTS[region].map((value, index) => (
              <div className="portfolio portfolio-slider grid_item" key={index}>
                <Link
                  to={`/${region}/event-reflection/${value.url}`}
                  className="thumbnail-inner-2"
                >
                  <ImageFb
                    className="thumbnail"
                    src={`/assets/images/portfolio/${region}/portfolio-${value.image}.webp`}
                    fallback={`/assets/images/portfolio/${region}/portfolio-${value.image}.jpg`}
                    alt="Event Images"
                  />
                </Link>
              </div>
            )): <h3>Expect catalogue of the past events soon</h3>}
          </div>
        </div>
      </div>
    );
  
}

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
        <PastEventsListed />
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
export { PastEvents, PastEventsContent, PastEventsListed };
