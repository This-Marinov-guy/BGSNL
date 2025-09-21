import React from "react";
import { Link } from "react-router-dom";
import PageHelmet from "../../component/common/Helmet";
import HeaderTwo from "../../component/header/HeaderTwo";
import FooterTwo from "../../component/footer/FooterTwo";
import ScrollToTop from "react-scroll-up";
import { FiChevronUp } from "react-icons/fi";
import {
  faMoneyCheckDollar,
  faHexagonNodes,
  faHandHoldingHeart,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const AlumniInfoPage = () => {
  return (
    <React.Fragment>
      <PageHelmet pageTitle="Alumni" />
      <HeaderTwo
        headertransparent="header--transparent"
        colorblack="color--black"
        logoname="logo.png"
      />

      {/* Main Hero Section */}
      <div className="pt--160 pb--80 bg_color--1">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-6 col-md-12 col-12">
              <div className="content">
                <h1
                  className="mb--20"
                  style={{ fontSize: "2.5rem", fontWeight: "bold" }}
                >
                  Join the Bulgarian Alumni Community
                </h1>
                <p
                  className="mb--30"
                  style={{ fontSize: "1.1rem", lineHeight: "1.6" }}
                >
                  Connect with fellow Bulgarians and support each other's
                  success. Be a pillar of the Bulgarian community in the
                  Netherlands and gain exclusive benefits in return.
                </p>
                <Link
                  to="/alumni/register"
                  className="rn-button-style--2 rn-btn-green"
                  style={{
                    display: "inline-block",
                    padding: "15px 30px",
                    marginBottom: "40px",
                    fontSize: "1.1rem",
                    textDecoration: "none",
                  }}
                >
                  Become an Alumni Now!
                </Link>
              </div>
            </div>
            <div className="col-lg-6 col-md-12 col-12">
              <div className="thumbnail text-center">
                {/* Placeholder for main image - smartphone showing dashboard */}
                <div
                  style={{
                    width: "300px",
                    height: "auto",
                    margin: "0 auto",
                    backgroundColor: "#f8f9fa",
                    border: "2px dashed black",
                    borderRadius: "20px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#6c757d",
                    fontSize: "1.2rem",
                  }}
                >
                  <img
                    style={{ borderRadius: "20px" }}
                    src={"/assets/images/alumni/landing.jpg"}
                    alt="Alumni Dashboard"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Benefits Grid Section */}
      <div className="service-area ptb--60">
        <div className="container">
          <div className="row">
            {/* Free Membership Card */}
            <div className="col-lg-4 col-md-6 col-12 mb--30">
              <div
                className="service service__style--2"
                style={{
                  border: "2px solid black",
                  borderRadius: "15px",
                  padding: "30px",
                  height: "100%",
                  textAlign: "center",
                }}
              >
                <div className="icon mb--20">
                  {/* Placeholder for card image */}
                  <div
                    style={{
                      fontSize: "3rem",
                      color: "#ffc107",
                    }}
                  >
                    <FontAwesomeIcon
                      style={{
                        fontSize: "42px",
                        color: "black",
                        height: "75px",
                        marginLeft: "20px",
                      }}
                      icon={faMoneyCheckDollar}
                    />
                  </div>
                </div>
                <div className="content">
                  <h3 style={{ fontSize: "1.3rem", marginBottom: "15px" }}>
                    Start for free
                  </h3>
                  <p style={{ fontSize: "0.95rem", lineHeight: "1.5" }}>
                    If you have ever been a Bulgarian Society Netherlands
                    member, you can enter the Alumni program for free.
                    <br />
                    <br />
                    Otherwise, you can choose one of our flexible subscriptions
                    each unlocking more benefits than the previous one
                  </p>
                </div>
              </div>
            </div>

            {/* Fast Networking */}
            <div className="col-lg-4 col-md-6 col-12 mb--30">
              <div
                className="service service__style--2"
                style={{
                  border: "2px solid #28a745",
                  borderRadius: "15px",
                  padding: "30px",
                  height: "100%",
                  textAlign: "center",
                  backgroundColor: "#d4edda",
                }}
              >
                <div className="icon mb--20">
                  <div
                    style={{
                      fontSize: "3rem",
                      color: "#ffc107",
                    }}
                  >
                    <FontAwesomeIcon
                      style={{
                        fontSize: "42px",
                        color: "#28a745",
                        height: "75px",
                        marginLeft: "20px",
                      }}
                      icon={faHexagonNodes}
                    />
                  </div>
                </div>
                <div className="content">
                  <h3 style={{ fontSize: "1.3rem", marginBottom: "15px" }}>
                    Connect with
                  </h3>
                  <div
                    style={{
                      fontSize: "2rem",
                      fontWeight: "bold",
                      marginBottom: "10px",
                    }}
                  >
                    500+ members
                  </div>
                  <p style={{ fontSize: "0.95rem", lineHeight: "1.5" }}>
                    That is how many people are orbiting around the BGSNL
                    community and inside it.
                  </p>
                </div>
              </div>
            </div>

            {/* Mobile App */}
            <div className="col-lg-4 col-md-6 col-12 mb--30">
              <div
                className="service service__style--2"
                style={{
                  border: "2px solid #ab1c02",
                  borderRadius: "15px",
                  padding: "30px",
                  height: "100%",
                  textAlign: "center",
                  backgroundColor: "#E57373",
                }}
              >
                <div className="icon mb--20">
                  <div
                    style={{
                      fontSize: "3rem",
                      color: "#28a745",
                    }}
                  >
                    <FontAwesomeIcon
                      style={{
                        fontSize: "42px",
                        color: "#ab1c02",
                        height: "75px",
                        marginLeft: "20px",
                      }}
                      icon={faHandHoldingHeart}
                    />
                  </div>
                </div>
                <div className="content">
                  <h3 style={{ fontSize: "1.3rem", marginBottom: "15px" }}>
                    Support a community
                  </h3>
                  <p
                    style={{
                      fontSize: "0.95rem",
                      lineHeight: "1.5",
                      marginBottom: "15px",
                    }}
                  >
                    By taking care of the community, you are taking care of
                    yourself. Our program includes special events, exclusive
                    access and even appreciation gifts
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Features Section */}
      <div className="service-area ptb--60 bg_color--1">
        <div className="container">
          <div className="row">
            <div className="col-lg-6 col-md-12 col-12 mb--30">
              <div className="row align-items-center">
                <div className="col-md-6">
                  {/* Placeholder for business image */}
                  <img
                    src={"/assets/images/alumni/group-1.jpg"}
                    alt="Career"
                    style={{
                      width: "100%",
                      borderRadius: "10px",
                      height: "100%",
                    }}
                  />
                </div>
                <div className="col-md-6">
                  <h3 style={{ fontSize: "1.4rem", marginBottom: "15px" }}>
                    Be professional...
                  </h3>
                  <p style={{ fontSize: "0.95rem", lineHeight: "1.6" }}>
                    Our program includes career, networking and mentoring events
                  </p>
                </div>
              </div>
            </div>

            <div className="col-lg-6 col-md-12 col-12 mb--30">
              <div className="row align-items-center">
                <div className="col-md-6">
                  <img
                    src={"/assets/images/alumni/group-2.jpg"}
                    alt="Career"
                    style={{
                      width: "100%",
                      borderRadius: "10px",
                      height: "100%",
                    }}
                  />
                </div>
                <div className="col-md-6">
                  <h3 style={{ fontSize: "1.4rem", marginBottom: "15px" }}>
                    ...and have fun
                  </h3>
                  <p style={{ fontSize: "0.95rem", lineHeight: "1.6" }}>
                    As well as regular events full of fun and recharging activities
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Call to Action Section */}
      <div className="service-area ptb--80">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-8 col-md-12 col-12 text-center">
              <h2 style={{ fontSize: "2rem", marginBottom: "20px" }}>
                Ready to join?
              </h2>
              <p
                style={{
                  fontSize: "1.1rem",
                  marginBottom: "30px",
                  lineHeight: "1.6",
                }}
              >
                Join our big network by following a 2 minute registration. If
                you have an account it will take you a few seconds.
              </p>
              <Link
                to="/alumni/register"
                className="rn-button-style--2 rn-btn-green"
                style={{
                  display: "inline-block",
                  padding: "15px 40px",
                  fontSize: "1.2rem",
                  textDecoration: "none",
                  marginRight: "15px",
                }}
              >
                Register
              </Link>
              <Link
                to="/login"
                className="rn-button-style--1"
                style={{
                  display: "inline-block",
                  padding: "15px 40px",
                  fontSize: "1.2rem",
                  textDecoration: "none",
                }}
              >
                Already a member?
              </Link>
            </div>
          </div>
        </div>
      </div>

      <FooterTwo />

      <div className="backto-top">
        <ScrollToTop showUnder={160}>
          <FiChevronUp size={26} style={{ fontSize: '26px' }} />
        </ScrollToTop>
      </div>
    </React.Fragment>
  );
};

export default AlumniInfoPage;
