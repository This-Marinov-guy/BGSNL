import React, { useState, useEffect } from "react";
import PageHelmet from "../../component/common/Helmet";
import HeaderTwo from "../../component/header/HeaderTwo";
import FooterTwo from "../../component/footer/FooterTwo";
import ScrollToTop from "react-scroll-up";
import { FiChevronUp } from "react-icons/fi";
import { useHttpClient } from "../../hooks/common/http-hook";
import Loader from "../../elements/ui/loading/Loader";
import { Dialog } from "primereact/dialog";
import Tree from "../../component/userTree/Tree";
import { Link } from "react-router-dom";

const HallOfFame = () => {
  const { sendRequest } = useHttpClient();

  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [visible, setVisible] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setError(null);
        const response = await sendRequest("user/active-alumni", "GET");
        setUsers(response.alumniMembers);
        setLoading(false);
      } catch (err) {
        setError("Failed to load alumni data. Using sample data.");
      }
    };
    fetchUsers();
  }, []);

  const handleUserClick = (user) => {
    if (user.quote) {
      setSelectedUser(user);
      setVisible(true);
    }
  };

  return (
    <React.Fragment>
      <PageHelmet pageTitle="Allumni Tree" />
      <HeaderTwo
        headertransparent="header--transparent"
        colorblack="color--black"
        logoname="logo.png"
      />

      {/* Start Breadcrump Area */}
      <div
        className="rn-page-title-area pt--120 pb--190 bg_image bg_image--15"
        data-black-overlay="6"
      >
        <div className="container">
          <div className="row">
            <div className="col-lg-12">
              <div className="rn-page-title text-center pt--100">
                <h2 className="title theme-gradient">Allumni Tree</h2>
                <p>
                  Our esteemed alumni members who make our society exceptional
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* End Breadcrump Area */}

      {/* Start Allumni Tree Area */}
      <div className="rn-alumni-area mt--100 rn-section-gap">
        <div className="container">
          <div className="row">
            <div className="col-lg-12">
              <div className="section-title text-center mb--30">
                <p className="description">
                  Click on members to read their inspiring quotes or see details
                  for them.
                  <br />
                  Want to join them?{" "}
                  <a
                    href="/alumni/register"
                    className="link-hover-red"
                    target="_blank"
                    rel="noreferrer"
                  >
                    Do not waste a minute!
                  </a>
                </p>
              </div>
            </div>
          </div>

          {loading ? (
            <Loader />
          ) : (
            <>
              {error && (
                <div
                  className="alert alert-warning mb--20"
                  style={{
                    backgroundColor: "#fff3cd",
                    border: "1px solid #ffeaa7",
                    borderRadius: "4px",
                    padding: "12px 16px",
                    color: "#856404",
                    textAlign: "center",
                  }}
                >
                  {error}
                </div>
              )}
              <div className="user-tree-section">
                <Tree users={users} onUserClick={handleUserClick} />
              </div>
            </>
          )}
        </div>
      </div>
      {/* End Allumni Tree Area */}

      <FooterTwo />

      <div className="backto-top">
        <ScrollToTop showUnder={160}>
          <FiChevronUp />
        </ScrollToTop>
      </div>
    </React.Fragment>
  );
};

export default HallOfFame;
