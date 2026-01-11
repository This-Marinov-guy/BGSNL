import React from "react";
import PageHelmet from "../../component/common/Helmet";
import Breadcrumb from "../../elements/common/Breadcrumb";
import ScrollToTop from "react-scroll-up";
import { FiChevronUp, FiCheckCircle } from "react-icons/fi";
import Header from "../../component/header/Header";
import FooterTwo from "../../component/footer/FooterTwo";
import { Link } from "react-router-dom";
import { PARTNERS, PREMIUM_PARTNER } from "../../util/defines/PARTNERS";
import Slider from "react-slick";

const Partners = () => {
  const settings = {
    className: "partners-arc-carousel",
    centerMode: true,
    infinite: true,
    centerPadding: "0px",
    slidesToShow: 1,
    speed: 500,
    dots: true,
    arrows: true,
    autoplay: true,
    autoplaySpeed: 5000,
    responsive: [
      {
        breakpoint: 768,
        settings: {
          arrows: false,
          centerMode: true,
          centerPadding: "0px",
          slidesToShow: 1
        }
      },
      {
        breakpoint: 480,
        settings: {
          arrows: false,
          centerMode: true,
          centerPadding: "0px",
          slidesToShow: 1
        }
      }
    ]
  };

  return (
    <React.Fragment>
      <PageHelmet pageTitle="Partners" />
      <Header
        headertransparent="header--transparent"
        colorblack="color--black"
        logoname="logo.png"
      />

      {/* Start Breadcrump Area */}
      <Breadcrumb title={"Our Partners"} />
      {/* End Breadcrump Area */}

      {/* Start Premium Partner Area - Carousel */}
      <div className="rn-about-area ptb--120 bg_color--5 partners-arc-carousel-wrapper">
        <div className="container">
          <h2 className="archive text-center" style={{ color: "#017363" }}>
            Premium Partners
          </h2>
          <Slider {...settings}>
            {PREMIUM_PARTNER.map((partner, index) => (
              <div key={index}>
                <div className="row row--35 align-items-center">
                  <div className="col-lg-6">
                    <div className="thumbnail">
                      <a href={partner.url} target="_blank" rel="noreferrer">
                        <img
                          className="w-100"
                          src={partner.logo}
                          alt={`${partner.name} Logo`}
                          style={{
                            objectFit: "contain",
                            maxHeight: "300px",
                            padding: "20px",
                            ...partner.style,
                          }}
                        />
                      </a>
                    </div>
                  </div>
                  <div className="col-lg-6">
                    <div className="about-inner inner">
                      <div className="section-title">
                        {/* <span className="subtitle">Premium Partner</span> */}
                        <h2 className="title">{partner.name}</h2>
                        <p className="description">{partner.description}</p>
                      </div>
                      <div className="row mt--30">
                        <div className="col-lg-12">
                          <ul className="list-style--1">
                            {partner.features &&
                              partner.features.map((feature, fIndex) => (
                                <li key={fIndex}>
                                  <FiCheckCircle /> {feature}
                                </li>
                              ))}
                          </ul>
                        </div>
                      </div>
                      <div className="read-more-btn mt--40">
                        <a
                          className="rn-btn"
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
              </div>
            ))}
          </Slider>
        </div>
      </div>
      {/* End Premium Partner Area */}

      {/* Start Intro Area */}
      <div className="rn-service-area pt--120 pb--60 bg_color--1">
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
      <div className="rn-brand-area ptb--120 bg_color--1">
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
              <ul className="brand-style-2">
                {PARTNERS.map((partner, index) => (
                  <li key={index} style={{ listStyle: "none" }}>
                    <div className="partner-item text-center">
                      <a href={partner.url} target="_blank" rel="noreferrer">
                        <img
                          src={partner.logo}
                          alt={`${partner.name} Logo`}
                          style={partner.style || {}}
                        />
                      </a>
                      <h4 className="mt--20" style={{ fontSize: "1.2rem" }}>
                        {partner.name}
                      </h4>
                      <p style={{ fontSize: "0.9rem", color: "#666" }}>
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
          <FiChevronUp size={26} style={{ fontSize: "26px" }} />
        </ScrollToTop>
      </div>

      <FooterTwo />
    </React.Fragment>
  );
};

export default Partners;
