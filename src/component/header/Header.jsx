import React, { Fragment, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { logout, selectUser } from "../../redux/user";
import { Link, useNavigate } from "react-router-dom";
import { FiMenu, FiX } from "react-icons/fi";
import Alert from "react-bootstrap/Alert";
import ImageFb from "../../elements/ui/ImageFb";
import { REGIONS } from "../../util/REGIONS_DESIGN";
import { useParams } from "react-router-dom";
import capitalizeFirstLetter from "../../util/capitalize";

const Header = (props) => {
  const [isMenuOpened, setIsMenuOpened] = useState();
  const [logoutAlert, setLogoutAlert] = useState(false);

  const user = useSelector(selectUser);

  const { region } = useParams()

  const dispatch = useDispatch();

  const navigate = useNavigate();

  var elements = document.querySelectorAll(".has-dropdown > a");
  for (var i in elements) {
    if (elements.hasOwnProperty(i)) {
      elements[i].onclick = function () {
        this.parentElement.querySelector(".submenu").classList.toggle("active");
        this.classList.toggle("open");
      };
    }
  }

  let logoUrl = (
    <ImageFb
      className="logo"
      src={`/assets/images/logo/${REGIONS.includes(region) ? region : 'logo'}.webp`}
      fallback={`/assets/images/logo/${REGIONS.includes(region) ? region : 'logo'}.jpg`}
      alt="Logo"
    />
  );

  return (
    <Fragment>
      {logoutAlert && (
        <Alert className="logout_alert" variant="danger">
          <p>Continue logging out?</p>
          <button
            className="rn-btn mr--10"
            onClick={() => {
              dispatch(logout());
              setLogoutAlert(false);
              navigate("/");
            }}
          >
            Log out
          </button>
          <button
            className="rn-btn"
            onClick={() => {
              setLogoutAlert(false);
            }}
          >
            Stay
          </button>
        </Alert>
      )}
      <header
        className={`header-area formobile-menu header--transparent default-color`}
      >
        <div
          className={(isMenuOpened && "menu-open") + " header-wrapper"}
          id="header-wrapper"
        >
          <div className="header-left">
            <div className="logo">
              <Link to={region ? `/${region}` : '/'}>{logoUrl}</Link>
            </div>
          </div>
          <div className="header-right">
            <nav className={"mainmenunav d-lg-block"}>
              <ul className={props.dark ? "mainmenu dark_nav" : "mainmenu"}>
                <li className="has-dropdown">
                  <a style={{ cursor: 'pointer' }}>Regions</a>
                  <ul className="submenu">
                    <li>
                      <Link to='/'>Netherlands</Link>
                    </li>
                    {REGIONS.map((region, index) => {
                      return <li key={index}>
                        <Link to={"/" + region}>{capitalizeFirstLetter(region)}</Link>
                      </li>
                    })}

                  </ul>
                </li>
                {region ? <Fragment>
                  <li className="has-dropdown">
                    <a style={{ cursor: 'pointer' }}>Structure</a>
                    <ul className="submenu">
                      <li>
                        <Link to={`/${region}/board`}>Meet the Board</Link>
                      </li>
                      <li>
                        <Link to={`/${region}/committees`}>Meet the Committees</Link>
                      </li>
                    </ul>
                  </li>
                  <li className="has-dropdown">
                    <Link to={`/${region}/events`}>Events</Link>
                    <ul className="submenu">
                      <li>
                        <Link to={`/${region}/future-events`}>Future Events</Link>
                      </li>
                      <li>
                        <Link to={`/${region}/past-events`}>Past Events</Link>
                      </li>
                    </ul>
                  </li>
                </Fragment> : <li>
                  <Link to="/about">About</Link>
                </li>}


                <li className="has-dropdown">
                  <a style={{ cursor: 'pointer' }}>Society</a>
                  <ul className="submenu">
                    <li>
                      <Link to="/articles">Articles</Link>
                    </li>
                  </ul>
                </li>

                {region && <li>
                  <Link to={`/${region}/contact`}>Contact</Link>
                </li>}
                {user.token && (
                  <li>
                    <Link to={`/user`}>Profile</Link>
                  </li>
                )}

                <li>
                  <div className="header-btn">
                    {!user.token ? (
                      <Link to="/login" className="rn-btn">
                        <span>Log In</span>
                      </Link>
                    ) : (
                      <button
                        onClick={() => setLogoutAlert(true)}
                        className="rn-btn"
                      >
                        <span>Log Out</span>
                      </button>
                    )}
                  </div>
                </li>
              </ul>
            </nav>

            {/* Start Humberger Menu  */}
            <div className="humberger-menu d-block d-lg-none pl--20">
              <span
                onClick={() => {
                  setIsMenuOpened(true);
                }}
                className="menutrigger text-white"
              >
                <FiMenu />
              </span>
            </div>
            {/* End Humberger Menu  */}
            <div className="close-menu d-block d-lg-none">
              <span
                onClick={() => {
                  setIsMenuOpened(false);
                }}
                className="closeTrigger"
              >
                <FiX />
              </span>
            </div>
          </div>
        </div>
      </header>
    </Fragment>
  );
};

export default Header;
