import React, { Fragment, useState } from "react";
import { useSelector } from "react-redux";
import { selectUser } from "../../redux/user";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { FiMenu, FiX } from "react-icons/fi";
import ImageFb from "../../elements/ui/media/ImageFb";
import { LazyLoadImage } from "react-lazy-load-image-component";
import { REGIONS } from "../../util/defines/REGIONS_DESIGN";
import { useParams } from "react-router-dom";
import { capitalizeFirstLetter } from "../../util/functions/capitalize";
import {
  checkAuthorization,
  decodeJWT,
} from "../../util/functions/authorization";
import NewBadge from "../../elements/ui/badges/NewBadge";
import { ACCESS_2, ACCESS_3, ACCESS_4 } from "../../util/defines/common";
import LogoutAlert from "../../elements/ui/alerts/Logout";
import { selectArticles } from "../../redux/articles";
import { encodeForURL } from "../../util/functions/helpers";
import SolidBadge from "../../elements/ui/badges/SolidBadge";

const HeaderContent = (props) => {
  const user = useSelector(selectUser);
  const [logoutAlert, setLogoutAlert] = useState(false);

  const articles = useSelector(selectArticles);

  const profileImage = user.token ? decodeJWT(user.token).image : '';
  
  const region = props.forceRegion ?? useParams().region;

  const navigate = useNavigate();
  const location = useLocation();
  const routePath = location.pathname;

  return (
    <>
      <LogoutAlert visible={logoutAlert} onHide={() => setLogoutAlert(false)} />

      <nav className={"mainmenunav d-lg-block"}>
        <ul className={props.dark ? "mainmenu dark_nav" : "mainmenu"}>
          <li className="has-dropdown">
            <a style={{ cursor: "pointer" }}>Regions</a>
            <ul className="submenu">
              <li>
                <Link to="/">Netherlands</Link>
              </li>
              {REGIONS.map((region, index) => {
                if (region === "leiden_hague") {
                  return (
                    <li key={index}>
                      <Link to={"/" + region}>
                        <div className="hor_section">
                          {capitalizeFirstLetter(region, true)}
                          <NewBadge />
                        </div>
                      </Link>
                    </li>
                  );
                }

                return (
                  <li key={index}>
                    <Link to={"/" + region}>
                      {capitalizeFirstLetter(region, true)}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </li>
          {region ? (
            <Fragment>
              {/* <li className="has-dropdown">
                    <a style={{ cursor: 'pointer' }}>Structure</a>
                    <ul className="submenu">
                      <li>
                        <Link to={`/${region}/board`}>Meet the Board</Link>
                      </li>
                      <li>
                        <Link to={`/${region}/committees`}>Meet the Committees</Link>
                      </li>
                    </ul>
                  </li> */}
              <li className="has-dropdown">
                <a style={{ cursor: "pointer" }}>Events</a>
                <ul className="submenu">
                  <li>
                    <Link to={`/${region}/events/future-events`}>
                      Future Events
                    </Link>
                  </li>
                  <li>
                    <Link to={`/${region}/events/past-events`}>
                      Past Events
                    </Link>
                  </li>
                </ul>
              </li>
            </Fragment>
          ) : (
            <Fragment>
              <li className="has-dropdown">
                <a style={{ cursor: "pointer" }}>Events</a>
                <ul className="submenu">
                  <li>
                    <Link to={`/events/future-events`}>Future Events</Link>
                  </li>
                  <li>
                    <Link to={`/events/past-events`}>Past Events</Link>
                  </li>
                </ul>
              </li>

              <li className="has-dropdown">
                <a style={{ cursor: "pointer" }}>About</a>
                <ul className="submenu">
                  {!user.token && (
                    <li>
                      <Link to="/join-the-society">How to join</Link>
                    </li>
                  )}
                  <li>
                    <Link to="/about">About the society</Link>
                  </li>
                  <li>
                    <Link to={`/board-and-committee`}>
                      Meet the Board & Committee
                    </Link>
                  </li>
                  <li>
                    <Link to={`/partners`}>Partners</Link>
                  </li>
                  <li>
                    <Link to={`/welcome-to-alumni`}>Alumni Program</Link>
                  </li>
                  <li>
                    <Link to={`/hall-of-fame`}>Alumni Tree</Link>
                  </li>
                </ul>
              </li>
            </Fragment>
          )}

          <li>
            <Link to="/articles">Articles</Link>
          </li>

          <li>
            <SolidBadge className="absolute-badge" text="New" color="green" />
            <Link to={`/internships`}>Internships</Link>
          </li>

          <li>
            <Link to={`/${region ? region + "/" : ""}contact`}>Contact</Link>
          </li>
          {user.token && (
            <>
              <li className="has-dropdown">
                <a
                  style={{
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  {profileImage ? (
                    <LazyLoadImage
                      src={profileImage}
                      alt="Profile"
                      style={{
                        width: "48px",
                        height: "48px",
                        borderRadius: "50%",
                        objectFit: "fill",
                        border: "2px solid #fff",
                      }}
                    />
                  ) : (
                    <span>Profile</span>
                  )}
                </a>
                <ul className="submenu">
                  <li>
                    <Link to={`/user#profile`}>Profile</Link>
                  </li>
                  <li>
                    <Link to={`/user#news`}>News</Link>
                  </li>
                  <li>
                    <Link to={`/user#tickets`}>Tickets</Link>
                  </li>
                  <li>
                    <Link to={`/user#internships`}>Internships</Link>
                  </li>
                  <li>
                    <Link to={`/user#settings`}>Settings</Link>
                  </li>
                </ul>
              </li>
              {checkAuthorization(user.token, ACCESS_4) && (
                <li className="has-dropdown">
                  <a style={{ cursor: "pointer" }}>Event's Panel</a>
                  <ul className="submenu">
                    <li>
                      <Link to="/user/dashboard">Dashboard</Link>
                    </li>
                    <li>
                      <Link to="/user/add-event">Add Event</Link>
                    </li>
                  </ul>
                </li>
              )}
            </>
          )}

          <li>
            <div className="header-btn">
              {!user.token ? (
                <button
                  onClick={() => {
                    sessionStorage.setItem("prevUrl", routePath);
                    navigate("/login");
                  }}
                  className="rn-button-style--2 rn-btn-reverse-green"
                >
                  <span>Log In</span>
                </button>
              ) : (
                <button onClick={() => setLogoutAlert(true)} className="rn-btn">
                  <span>Log Out</span>
                </button>
              )}
            </div>
          </li>
        </ul>
      </nav>
    </>
  );
};

export default HeaderContent;
