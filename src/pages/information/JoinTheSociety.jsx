import React from "react";
import { Link } from "react-router-dom";
import PageHelmet from "../../component/common/Helmet";
import HeaderTwo from "../../component/header/HeaderTwo";
import FooterTwo from "../../component/footer/FooterTwo";
import ScrollToTop from "react-scroll-up";
import { FiChevronUp, FiUsers, FiAward } from "react-icons/fi";

const JoinTheSociety = () => {
  return (
    <>
      <PageHelmet pageTitle="Join the society" />
      <HeaderTwo
        headertransparent="header--transparent"
        colorblack="color--black"
        logoname="logo.png"
      />

      {/* Cards Section */}
      <div className="rn-service-area pt--160 pb--80 bg_color--1">
        <div className="container">
          <div className="row">
            <div className="col-lg-12">
              <div className="section-title text-center">
                <h3 className="subtitle">Two Ways to Join</h3>
                <h2 className="title">Choose Your Path in the Society</h2>
                {/* <p className="description">
                  Whether you're a current student or a graduated alumni, we
                  have the perfect membership option for you.
                </p> */}
              </div>
            </div>
          </div>

          <div className="row mt--50 justify-content-center">
            {/* Member Card */}
            <div className="col-lg-5 col-md-6 col-sm-6 col-12">
              <div className="service service__style--2 bg-color-blackest radius text-center">
                <div className="icon">
                  <img
                    src="/assets/images/alumni/members.jpg"
                    alt="Become a Member"
                    style={{
                      width: "120px",
                      height: "120px",
                      borderRadius: "50%",
                      objectFit: "cover",
                      border: "3px solid #017363",
                    }}
                  />
                </div>
                <div className="content">
                  <h3 className="title">
                    <FiUsers
                      style={{ marginRight: "10px", color: "#017363" }}
                    />
                    Become a Member
                  </h3>
                  <p>
                    Join the society during your academic years, meet new people, explore internship options and get the chance to enter a society's committee or a board.
                  </p>
                  {/* <div className="feature-list mt--30">
                    <ul className="list-style--1">
                      <li>Access to EXCLUSIVE society events</li>
                      <li>Member discounts</li>
                      <li>Option to become an Active Member</li>
                      <li>Internship opportunities</li>
                    </ul>
                  </div> */}
                </div>
                <div className="service-button mt--30">
                  <Link
                    to="/signup"
                    className="rn-button-style--2 rn-btn-reverse-green"
                  >
                    Join as Member
                  </Link>
                </div>
              </div>
            </div>

            {/* Alumni Card */}
            <div className="col-lg-5 col-md-6 col-sm-6 col-12">
              <div className="service service__style--2 bg-color-blackest radius text-center">
                <div className="icon">
                  <img
                    src="/assets/images/alumni/alumni.jpeg"
                    alt="Become an Alumni"
                    style={{
                      width: "120px",
                      height: "120px",
                      borderRadius: "50%",
                      objectFit: "cover",
                      border: "3px solid #e5b80b",
                    }}
                  />
                </div>
                <div className="content">
                  <h3 className="title">
                    <FiAward
                      style={{ marginRight: "10px", color: "#e5b80b" }}
                    />
                    Become an Alumni
                  </h3>
                  <p>
                    Perfect for our graduates who want to be part of the society. This program enables you to networking opportunities and alumni events.
                  </p>
                  {/* <div className="feature-list mt--30">
                    <ul className="list-style--1">
                      <li>Premium alumni events</li>
                      <li>Hall of Fame entry</li>
                      <li>Voting rights</li>
                      <li>Personalized merchandise</li>
                    </ul>
                  </div> */}
                </div>
                <div className="service-button mt--30">
                  <Link
                    to="/alumni/register"
                    className="rn-button-style--2"
                    style={{
                      backgroundColor: "#e5b80b",
                      borderColor: "#e5b80b",
                      color: "white",
                    }}
                  >
                    Join as Alumni
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Info Section */}
          <div className="row mt--80">
            <div className="col-lg-12">
              <div className="text-center">
                <h4>Still Not Sure?</h4>
                <p className="mb--30">
                  Contact us for more information about membership benefits and
                  requirements.
                </p>
                <Link
                  to="/contact"
                  className="rn-button-style--2 rn-btn-reverse"
                >
                  Contact Us
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      <FooterTwo />

      <div className="backto-top">
        <ScrollToTop showUnder={160}>
          <FiChevronUp />
        </ScrollToTop>
      </div>
    </>
  );
};

export default JoinTheSociety;
