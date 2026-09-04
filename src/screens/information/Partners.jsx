"use client";

import React, {
  useCallback,
  useRef,
  useState,
} from "react";
import PropTypes from "prop-types";
import { useReducedMotion } from "framer-motion";
import Slider from "react-slick";
import ScrollToTop from "@/component/common/ScrollToTop";
import {
  FiCheckCircle,
  FiChevronLeft,
  FiChevronRight,
  FiChevronUp,
} from "@/elements/ui/icons/IconlyIcons";
import { Link } from "@/util/navigation";
import PageHelmet from "../../component/common/Helmet";
import FooterTwo from "../../component/footer/FooterTwo";
import Header from "../../component/header/Header";
import Breadcrumb from "../../elements/common/Breadcrumb";
import {
  PARTNERS,
  PREMIUM_PARTNER,
} from "../../util/defines/PARTNERS";

const PremiumPartnerArrow = ({
  className,
  direction,
  onClick,
  onManualInteraction,
}) => {
  const isPrevious = direction === "previous";
  const Icon = isPrevious ? FiChevronLeft : FiChevronRight;

  return (
    <button
      type="button"
      className={`${className || ""} partners-carousel-arrow partners-carousel-arrow--${direction}`}
      onClick={(event) => {
        onManualInteraction?.();
        onClick?.(event);
      }}
      aria-label={`${isPrevious ? "Previous" : "Next"} premium partner`}
    >
      <Icon aria-hidden="true" />
    </button>
  );
};

PremiumPartnerArrow.propTypes = {
  className: PropTypes.string,
  direction: PropTypes.oneOf(["previous", "next"]).isRequired,
  onClick: PropTypes.func,
  onManualInteraction: PropTypes.func,
};

const Partners = () => {
  const shouldReduceMotion = useReducedMotion();
  const sliderRef = useRef(null);
  const [autoplayEnabled, setAutoplayEnabled] = useState(true);

  const stopAutoplay = useCallback(() => {
    setAutoplayEnabled(false);
    sliderRef.current?.slickPause();
  }, []);

  const handleCarouselKeyDown = useCallback(
    (event) => {
      if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
        stopAutoplay();
      }
    },
    [stopAutoplay]
  );

  const settings = {
    className: "partners-arc-carousel",
    accessibility: true,
    autoplay: autoplayEnabled && !shouldReduceMotion,
    autoplaySpeed: 6000,
    centerMode: false,
    customPaging: (index) => (
      <button
        aria-label={`Show premium partner ${index + 1}`}
        onClick={stopAutoplay}
        type="button"
      />
    ),
    dots: true,
    infinite: true,
    lazyLoad: "ondemand",
    nextArrow: (
      <PremiumPartnerArrow
        direction="next"
        onManualInteraction={stopAutoplay}
      />
    ),
    onSwipe: stopAutoplay,
    pauseOnDotsHover: false,
    pauseOnFocus: false,
    pauseOnHover: false,
    prevArrow: (
      <PremiumPartnerArrow
        direction="previous"
        onManualInteraction={stopAutoplay}
      />
    ),
    slidesToShow: 1,
    slidesToScroll: 1,
    speed: shouldReduceMotion ? 0 : 450,
    swipeToSlide: true,
    arrows: true,
    responsive: [
      {
        breakpoint: 768,
        settings: {
          arrows: false,
          slidesToShow: 1,
        },
      },
    ],
  };

  return (
    <React.Fragment>
      <PageHelmet pageTitle="Partners" />
      <Header
        headertransparent="header--transparent"
        colorblack="color--black"
        logoname="logo.png"
      />

      <Breadcrumb
        title="Our Partners"
        description="Meet the organisations that help us create opportunities for Bulgarians across the Netherlands."
      />

      {/* Start Premium Partner Area - Carousel */}
      <section
        className="rn-about-area bg_color--5 partners-arc-carousel-wrapper"
        aria-labelledby="premium-partners-title"
      >
        <div className="container">
          <h2
            id="premium-partners-title"
            className="archive partners-premium-title"
          >
            Premium Partners
          </h2>
          <div onKeyDownCapture={handleCarouselKeyDown}>
            <Slider ref={sliderRef} {...settings}>
              {PREMIUM_PARTNER.map((partner) => (
                <div key={partner.name}>
                  <article className="premium-partner-card">
                    <div className="premium-partner-card__logo">
                      <div className="thumbnail">
                        <a href={partner.url} target="_blank" rel="noreferrer">
                          <img
                            className="premium-partner-card__logo-image"
                            src={partner.logo}
                            alt={`${partner.name} Logo`}
                            style={partner.style}
                          />
                        </a>
                      </div>
                    </div>
                    <div className="premium-partner-card__content">
                      <div className="about-inner inner">
                        <div className="section-title">
                          <h2 className="title archive">{partner.name}</h2>
                          <p className="description">{partner.description}</p>
                        </div>
                        <ul className="list-style--1 premium-partner-card__features">
                          {partner.features?.map((feature) => (
                            <li key={feature}>
                              <FiCheckCircle aria-hidden="true" /> {feature}
                            </li>
                          ))}
                        </ul>
                        <div className="read-more-btn premium-partner-card__actions">
                          <div className="premium-partner-card__action-list">
                            {partner.name === "PwC Bulgaria" && (
                              <Link
                                className="rn-button-style--2 rn-btn-solid-green"
                                to="/partners/pwc-bulgaria"
                              >
                                Explore Partner
                              </Link>
                            )}
                            <a
                              className="rn-button-style--2 rn-btn-reverse-red"
                              href={partner.url}
                              target="_blank"
                              rel="noreferrer"
                            >
                              Visit Website
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>
                  </article>
                </div>
              ))}
            </Slider>
          </div>
        </div>
      </section>
      {/* End Premium Partner Area */}

      {/* Start Intro Area */}
      <div className="rn-service-area pt--120 pb--60 bg_color--1 partners-background-section">
        <div className="container">
          <div className="row">
            <div className="col-md-6 col-12 d-flex flex-column justify-content-center align-items-center">
              <div className="section-title text-center mb--30">
                <h2 className="title">Building Bridges Together</h2>
                <p className="description">
                  We are proud to collaborate with organizations that share our
                  vision and values. Together, we work towards empowering the
                  Bulgarian community in the Netherlands and creating
                  opportunities for growth and connection.
                </p>
              </div>
            </div>

            <div className="col-md-6 col-12">
              <div className="call-to-action-wrapper call-to-action text-white-wrapper text-center ptb--60 bg_image bg_image--30">
                <div className="content">
                  <h2 style={{ color: "white" }}>Become a Partner</h2>
                  <p style={{ color: "white" }}>
                    Are you interested in collaborating with the Bulgarian
                    Society Netherlands? Join our network and connect with
                    talented students and professionals.
                  </p>
                  <Link
                    className="rn-button-style--2 rn-btn-solid-green mt--20"
                    to="/contact"
                  >
                    Send an Inquiry
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* End Call To Action */}
        </div>
      </div>
      {/* End Intro Area */}

      {/* Start Other Partners Area */}
      <div className="rn-brand-area ptb--120 bg_color--1 partners-grid-section">
        <div className="container">
          <div className="row">
            <div className="col-lg-12">
              <div className="section-title text-center mb--60">
                <h2 className="title">Our Valued Partners</h2>
                <p>Collaborating for success and community growth</p>
              </div>
            </div>
          </div>
          <div className="row">
            <div className="col-lg-12">
              <ul className="partners-logo-grid">
                {PARTNERS.map((partner, index) => (
                  <li key={index}>
                    <div className="partner-item partner-grid-item text-center">
                      <a href={partner.url} target="_blank" rel="noreferrer">
                        <span className="partners-logo-card">
                          <img
                            className="partners-logo-image"
                            src={partner.logo}
                            alt={`${partner.name} Logo`}
                            style={partner.style || {}}
                          />
                        </span>
                      </a>
                      <h4 className="mt--15">
                        {partner.name}
                      </h4>
                      <p style={{ color: "#666" }}>
                        Partner since {partner.since}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
      {/* End Other Partners Area */}

      <div className="backto-top">
        <ScrollToTop showUnder={160}>
          <FiChevronUp size={26} />
        </ScrollToTop>
      </div>

      <FooterTwo />
    </React.Fragment>
  );
};

export default Partners;
