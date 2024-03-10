import React from "react";
import PageHelmet from "../../component/common/Helmet";
import Breadcrumb from "../../elements/common/Breadcrumb";

import ContactTwo from "../../elements/contact/ContactTwo";
import ScrollToTop from "react-scroll-up";
import { FiChevronUp } from "react-icons/fi";
import Header from "../../component/header/Header";
import Footer from "../../component/footer/Footer";
import { FiMail } from "react-icons/fi";

import { FaLink } from "react-icons/fa";
import { useParams } from "react-router-dom";
import { REGION_SOCIALS, REGION_EMAIL } from "../../util/REGIONS_DESIGN";


const Contact = () => {

  const { region } = useParams()

  return (
    <React.Fragment>
      <PageHelmet pageTitle="Contact Us" />

      <Header
        headertransparent="header--transparent"
        colorblack="color--black"
        logoname="logo.png"
      />

      {/* Start Breadcrump Area */}
      <Breadcrumb title={"Contact Us"} />
      {/* End Breadcrump Area */}

      {/* Start Contact Top Area  */}
      <div className="rn-contact-top-area ptb--120 bg_color--5">
        <div className="container">
          <div className="row">
            {/* Start Single Address  */}
            <div className="col-lg-4 col-md-6 col-sm-6 col-12 mt_mobile--50">
              <div className="rn-address">
                <div className="icon">
                  <FiMail />
                </div>
                <div className="inner email_container">
                  <h4 className="title">Email Address</h4>
                  <p>
                    <a
                      style={{ overflowWrap: "break-word" }}
                      href={`mailto:${REGION_EMAIL[region]}`}
                      target="_blank"
                    >
                      {REGION_EMAIL[region]}
                    </a>
                  </p>
                </div>
              </div>
            </div>
            {/* End Single Address  */}
            {/* Start Social Media  */}
            <div className="col-lg-4 col-md-6 col-sm-6 col-12">
              <div className="rn-address">
                <div className="icon">
                  <FaLink />
                </div>
                <div className="inner">
                  <div className="social_media">
                    {REGION_SOCIALS[region] ? REGION_SOCIALS[region].map((val, i) => (
                      <div key={i}>
                        <a href={`${val.link}`}>{val.Social}</a>
                      </div>
                    )) : <h3>Expect Socials Soon</h3>}
                  </div>
                </div>
              </div>
            </div>

            {/* End Social Media  */}
          </div>
        </div>
      </div>
      {/* End Contact Top Area  */}

      {/* Start Contact Page Area  */}
      <div className="rn-contact-page ptb--120 bg_color--1">
        <ContactTwo />
      </div>
      {/* End Contact Page Area  */}

      {/* Start Brand Area */}
      {/* <div className="rn-brand-area brand-separation bg_color--5 ptb--120">
        <div className="container">
          <div className="row">
            <div className="col-lg-12">
              <BrandTwo />
            </div>
          </div>
        </div>
      </div> */}
      {/* End Brand Area */}

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

export default Contact;
