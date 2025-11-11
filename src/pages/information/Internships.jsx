import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import PageHelmet from "../../component/common/Helmet";
import HeaderTwo from "../../component/header/HeaderTwo";
import FooterTwo from "../../component/footer/FooterTwo";
import ScrollToTop from "react-scroll-up";
import { FiChevronUp, FiBriefcase, FiUsers, FiCalendar } from "react-icons/fi";
import { useHttpClient } from "../../hooks/common/http-hook";
import Loader from "../../elements/ui/loading/Loader";
import { selectUser } from "../../redux/user";
import { INTERNSHIPS_LIST } from "../../util/defines/INTERNSHIPS";
import InternshipCard from "../../elements/ui/cards/InternshipCard";

const Internships = () => {
  const { sendRequest } = useHttpClient();
  const navigate = useNavigate();
  const user = useSelector(selectUser);
  
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        if (user.token) {
          const responseData = await sendRequest("user/current");
          setCurrentUser(responseData.user);
        }
      } catch (err) {
        // User not logged in or error - that's okay, page is public
        console.log("User not authenticated or error fetching user data");
      } finally {
        setLoading(false);
      }
    };

    fetchCurrentUser();
  }, [user.token]);

  if (loading) {
    return <Loader />;
  }

  return (
    <React.Fragment>
      <PageHelmet pageTitle="Internships - BGSNL Community" />
      <HeaderTwo
        headertransparent="header--transparent"
        colorblack="color--black"
        logoname="logo.png"
        forceRegion={currentUser?.region ?? null}
      />

      {/* Start Page Title Area */}
      <div
        className="rn-page-title-area pt--120 pb--190 bg_image bg_image--15"
        data-black-overlay="6"
      >
        <div className="container">
          <div className="row">
            <div className="col-lg-12">
              <div className="rn-page-title text-center pt--100">
                <h2 className="title theme-gradient">Internships</h2>
                <p>
                  Discover career opportunities and connect with our partner
                  companies
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* End Page Title Area */}

      {/* Start Internships Area */}
      <div className="rn-internships-area mt--100 rn-section-gap">
        <div className="container">
          <div className="row">
            <div className="col-lg-12">
              <div className="section-title text-center mb--50">
                <h3 className="title">Available Positions</h3>
                <p className="description">
                  Explore internship opportunities from our partner companies.
                  These positions are carefully curated to provide valuable
                  experience and career development. Join our community to
                  access exclusive opportunities and connect with industry
                  professionals.
                </p>
              </div>
            </div>
          </div>

          {/* Stats Section */}
          <div className="row mb--50">
            <div className="col-lg-4 col-md-6 col-12">
              <div className="stat-card">
                <div className="stat-icon">
                  <FiBriefcase />
                </div>
                <div className="stat-content">
                  <h4>{INTERNSHIPS_LIST.length}</h4>
                  <p>Available Positions</p>
                </div>
              </div>
            </div>
            <div className="col-lg-4 col-md-6 col-12">
              <div className="stat-card">
                <div className="stat-icon">
                  <FiUsers />
                </div>
                <div className="stat-content">
                  <h4>50+</h4>
                  <p>Partner Companies</p>
                </div>
              </div>
            </div>
            <div className="col-lg-4 col-md-6 col-12">
              <div className="stat-card">
                <div className="stat-icon">
                  <FiCalendar />
                </div>
                <div className="stat-content">
                  <h4>Weekly</h4>
                  <p>New Opportunities</p>
                </div>
              </div>
            </div>
          </div>

          {/* Preview Internship */}
          {INTERNSHIPS_LIST.length > 0 ? (
            <div className="preview-section">
              <div className="preview-header">
                <h4>Preview of Available Opportunities</h4>
                <p>
                  Here&apos;s a sample of the internship opportunities available
                  to our community members:
                </p>
              </div>

              <div className="preview-internship">
                <InternshipCard
                  internship={INTERNSHIPS_LIST[0]}
                  user={currentUser}
                  isPreview={true}
                />
              </div>

              <div className="preview-footer">
                <div className="preview-info">
                  <h5>Want to see more opportunities?</h5>
                  <p>
                    Join our community to access the full list of{" "}
                    {INTERNSHIPS_LIST.length} available internships and
                    exclusive career opportunities from our partner companies.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-icon">
                <FiBriefcase />
              </div>
              <h3>No Internships Available</h3>
              <p>Check back soon for new opportunities.</p>
            </div>
          )}

          {/* Benefits Section */}
          {/* <div className="row mt--50">
            <div className="col-lg-12">
              <div className="benefits-section">
                <h4>Why Join BGSNL Community?</h4>
                <div className="benefits-grid">
                  <div className="benefit-item">
                    <div className="benefit-icon">🎯</div>
                    <h5>Exclusive Opportunities</h5>
                    <p>
                      Access to internships and job opportunities not available
                      elsewhere
                    </p>
                  </div>
                  <div className="benefit-item">
                    <div className="benefit-icon">🤝</div>
                    <h5>Professional Network</h5>
                    <p>
                      Connect with industry professionals and fellow students
                    </p>
                  </div>
                  <div className="benefit-item">
                    <div className="benefit-icon">📈</div>
                    <h5>Career Development</h5>
                    <p>Get mentorship and guidance for your career growth</p>
                  </div>
                  <div className="benefit-item">
                    <div className="benefit-icon">💼</div>
                    <h5>Partner Companies</h5>
                    <p>Direct access to our network of partner organizations</p>
                  </div>
                </div>
              </div>
            </div>
          </div> */}

          {/* Call to Action */}
          <div className="row mt--50">
            <div className="col-lg-12">
              <div className="cta-section">
                <h4>Ready to Start Your Career Journey?</h4>
                <p>
                  Join our community to access exclusive internship
                  opportunities, connect with industry professionals, and take
                  the first step towards your dream career. New positions are
                  added regularly!
                </p>
                <div className="cta-actions">
                  {user.token ? (
                    <button
                      className="rn-button-style--2 rn-btn-green"
                      onClick={() => navigate("/user#news")}
                    >
                      View Member News
                    </button>
                  ) : (
                    <>
                      <button
                        className="rn-button-style--2 rn-btn-green"
                        onClick={() => navigate("/join-the-society")}
                      >
                        Join Our Community
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* End Internships Area */}

      <FooterTwo forceRegion={currentUser?.region ?? null} />

      <div className="backto-top">
        <ScrollToTop showUnder={160}>
          <FiChevronUp size={26} style={{ fontSize: '26px' }} />
        </ScrollToTop>
      </div>
    </React.Fragment>
  );
};

export default Internships;
