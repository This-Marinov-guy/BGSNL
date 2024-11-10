import React, { Fragment, useState } from "react";
import { useSelector } from "react-redux";
import { selectUser } from "../../redux/user";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { FiMenu, FiX } from "react-icons/fi";
import ImageFb from "../../elements/ui/media/ImageFb";
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
  const userRegion = user.token ? decodeJWT(user.token).region : "";

  const articles = useSelector(selectArticles);

  const region = props.forceRegion ?? useParams().region;

  const navigate = useNavigate();
  const location = useLocation();
  const routePath = location.pathname;

  return (
      <nav className={"mainmenunav d-lg-block"}>
        <ul className={props.dark ? "mainmenu dark_nav" : "mainmenu"}>
          <li>
            <Link to={`/${region ?? userRegion}`}>Home</Link>
          </li>
          <li className="has-dropdown">
            <a style={{ cursor: "pointer" }}>Regions</a>
            <ul className="submenu">
              <li>
                <Link to="/">Netherlands</Link>
              </li>
              {REGIONS.map((region, index) => {
                if (region === "eindhoven") {
                  return (
                    <li key={index}>
                      <Link to={"/" + region}>
                        <div className="hor_section">
                          {capitalizeFirstLetter(region)}
                          <NewBadge />
                        </div>
                      </Link>
                    </li>
                  );
                }

                return (
                  <li key={index}>
                    <Link to={"/" + region}>
                      {capitalizeFirstLetter(region)}
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
              <li>
                <Link to="/about">About</Link>
              </li>
            </Fragment>
          )}

          <li className="has-dropdown">
            <a style={{ cursor: "pointer" }}>Articles</a>
            <ul className="submenu">
              {articles?.length > 0 &&
                articles.map((article, i) => (
                  <li key={i}>
                    <Link
                      to={`/articles/${article.id}/${encodeForURL(
                        article.title
                      )}`}
                    >
                      {article.title}
                    </Link>
                  </li>
                ))}
              <li>
                <Link to="/articles/from-bulgaria-to-the-netherlands">
                  From Bulgaria To The Netherlands
                </Link>
              </li>
              <li>
                <Link to="/articles/acedemie-minerva">Academie Minerva</Link>
              </li>
              <li>
                <Link to="/articles/toni-villa">Toni's Villa</Link>
              </li>
            </ul>
          </li>

          <li>
            <SolidBadge className="absolute-badge" text="New" color="green" />
            <Link to={`/user#internships`}>Internships</Link>
          </li>

          {region && (
            <li>
              <Link to={`/${region}/contact`}>Contact</Link>
            </li>
          )}
          {user.token && (
            <>
              <li className="has-dropdown">
                <a style={{ cursor: "pointer" }}>Profile</a>
                <ul className="submenu">
                  <li>
                    <Link to={`/user`}>My details</Link>
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
                    navigate("/login");
                    if (routePath !== "/")
                      sessionStorage.setItem("prevUrl", routePath);
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
  );
};

export default HeaderContent;
