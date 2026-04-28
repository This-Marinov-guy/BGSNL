import React, { useEffect, useMemo, useState } from "react";
import PageHelmet from "../../component/common/Helmet";
import Breadcrumb from "../../elements/common/Breadcrumb";
import Header from "../../component/header/Header";
import FooterTwo from "../../component/footer/FooterTwo";
import ScrollToTop from "react-scroll-up";
import { FiChevronUp, FiCheckCircle, FiBriefcase } from "react-icons/fi";
import { Link } from "react-router-dom";
import { useHttpClient } from "../../hooks/common/http-hook";
import Loader from "../../elements/ui/loading/Loader";
import InternshipCard from "../../elements/ui/cards/InternshipCard";
import { PREMIUM_PARTNER } from "../../util/defines/PARTNERS";

const PWC_PARTNER = PREMIUM_PARTNER.find((partner) => partner.name === "PwC Bulgaria");
const PWC_VIDEO = "/assets/images/partners/pwc.mp4";
const PWC_BREADCRUMB_IMAGE = "/assets/images/partners/sofia.png";
const PWC_METADATA_IMAGE = "/assets/images/events/pwc.jpeg";

const PwcPartner = () => {
  const { sendRequest } = useHttpClient();
  const [loading, setLoading] = useState(true);
  const [internships, setInternships] = useState([]);

  useEffect(() => {
    const loadInternships = async () => {
      try {
        const response = await sendRequest("internship/list", "GET", null, {}, false, false);
        setInternships(response?.internships ?? []);
      } finally {
        setLoading(false);
      }
    };

    loadInternships();
  }, []);

  const pwcInternships = useMemo(
    () =>
      internships.filter((internship) =>
        internship?.company?.toLowerCase().includes("pwc")
      ),
    [internships]
  );

  if (loading) {
    return <Loader />;
  }

  return (
    <React.Fragment>
      <PageHelmet
        pageTitle="PwC Bulgaria"
        description={PWC_PARTNER?.description}
        image={PWC_METADATA_IMAGE}
        canonicalUrl="https://www.bulgariansociety.nl/partners/pwc-bulgaria"
      />
      <Header
        headertransparent="header--transparent"
        colorblack="color--black"
        logoname="logo.png"
      />

      <Breadcrumb
        title="PwC Bulgaria"
        category="Premium Partner"
        parent="Partners"
        imageUrl={PWC_BREADCRUMB_IMAGE}
      />

      <div className="rn-about-area ptb--120 bg_color--5">
        <div className="container">
          <div className="row row--35 align-items-center">
            <div className="col-lg-6">
              <video
                src={PWC_VIDEO}
                autoPlay
                muted
                loop
                playsInline
                style={{ maxHeight: "80vh", borderRadius: "10%" }}
              />
            </div>

            <div className="col-lg-6 mt_md--30 mt_sm--30">
              <div className="about-inner inner">
                <div className="section-title">
                  <span className="subtitle">Premium Partner</span>
                  <h2 className="title">
                    Career opportunities with PwC Bulgaria
                  </h2>
                  <p className="description">{PWC_PARTNER?.description}</p>
                </div>

                <div className="row mt--30">
                  <div className="col-lg-12">
                    <ul className="list-style--1">
                      {PWC_PARTNER?.features?.map((feature) => (
                        <li key={feature}>
                          <FiCheckCircle /> {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div
                  className="read-more-btn mt--40 d-flex flex-wrap"
                  style={{ gap: "14px" }}
                >
                  <a
                    className="rn-btn"
                    href={PWC_PARTNER?.url}
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
      </div>

      <div className="rn-service-area pt--80 pb--40 bg_color--1">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-6 mb_md--30 mb_sm--30">
              <div className="section-title text-start">
                <span className="subtitle">Inside PwC</span>
                <h2 className="title">Discover PwC Bulgaria</h2>
                <p className="description">
                  Learn more about the team, environment, and opportunities
                  available through PwC Bulgaria. This page combines their
                  partner information with the currently active internships
                  available through BGSNL.
                </p>
              </div>
            </div>

            <div style={{}} className="col-lg-6">
              <img
                src={"/assets/images/events/pwc.jpeg"}
                alt="PwC Bulgaria logo"
                style={{
                  width: "100%",
                  objectFit: "contain",
                  borderRadius: "10%",
                }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="rn-internships-area pt--80 pb--120 bg_color--1">
        <div className="container">
          <div className="row">
            <div className="col-lg-12">
              <div className="section-title text-center mb--50">
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: "64px",
                    height: "64px",
                    borderRadius: "50%",
                    background: "rgba(1,115,99,0.1)",
                    color: "#017363",
                    marginBottom: "18px",
                  }}
                >
                  <FiBriefcase size={28} />
                </div>
                <h2 className="title">PwC Bulgaria internships</h2>
                <p className="description">
                  Active internship opportunities currently available for PwC
                  Bulgaria.
                </p>
              </div>
            </div>
          </div>

          {pwcInternships.length > 0 ? (
            <div className="row">
              {pwcInternships.map((internship) => (
                <div
                  key={internship._id || internship.id}
                  className="col-lg-6 col-12"
                >
                  <InternshipCard internship={internship} />
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state text-center">
              <div className="empty-icon">
                <FiBriefcase />
              </div>
              <h3>No PwC internships available right now</h3>
              <p>Check back soon for new opportunities from PwC Bulgaria.</p>
            </div>
          )}
        </div>
      </div>

      <div className="backto-top">
        <ScrollToTop showUnder={160}>
          <FiChevronUp size={26} style={{ fontSize: "26px" }} />
        </ScrollToTop>
      </div>

      <FooterTwo />
    </React.Fragment>
  );
};

export default PwcPartner;
