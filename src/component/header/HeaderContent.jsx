import {
  Fragment,
  useEffect,
  useRef,
  useState,
} from "react";
import PropTypes from "prop-types";
import { LazyLoadImage } from "react-lazy-load-image-component";
import { useSelector } from "react-redux";
import {
  IconlyArrowDown,
  IconlyLogout,
  IconlyProfile,
} from "@/elements/ui/icons/IconlyIcons";
import {
  Link,
  useLocation,
  useNavigate,
  useParams,
} from "@/util/navigation";
import LogoutAlert from "../../elements/ui/alerts/Logout";
import NewBadge from "../../elements/ui/badges/NewBadge";
import { selectUser } from "../../redux/user";
import {
  ACCESS_1,
  ACCESS_4,
  SUPPORT_ACCESS,
} from "../../util/defines/common";
import { ACCOUNT_TABS } from "../../util/defines/enum";
import { REGIONS } from "../../util/defines/REGIONS_DESIGN";
import {
  checkAuthorization,
  decodeJWT,
} from "../../util/functions/authorization";
import { capitalizeFirstLetter } from "../../util/functions/capitalize";

const getAccountInitials = (account) => {
  const nameParts = [account?.name, account?.surname]
    .map((part) => String(part || "").trim())
    .filter(Boolean);

  if (nameParts.length) {
    return nameParts
      .map((part) => Array.from(part)[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  }

  const emailName = String(account?.email || "").split("@")[0];
  const emailParts = emailName.split(/[^\p{L}\p{N}]+/u).filter(Boolean);

  if (emailParts.length > 1) {
    return `${Array.from(emailParts[0])[0]}${Array.from(emailParts.at(-1))[0]}`
      .toUpperCase();
  }

  return Array.from(emailParts[0] || "U").slice(0, 2).join("").toUpperCase();
};

const HeaderContent = (props) => {
  const user = useSelector(selectUser);
  const accountMenuRef = useRef(null);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const [logoutAlert, setLogoutAlert] = useState(false);

  const account = user.token ? decodeJWT(user.token) : null;
  const profileImage = user.image || account?.image || "";
  const initials = getAccountInitials(account);

  const region = props.forceRegion ?? useParams().region;

  const navigate = useNavigate();
  const location = useLocation();
  const routePath = location.pathname;

  useEffect(() => {
    if (!accountMenuOpen) return undefined;

    const closeOnOutsideClick = (event) => {
      if (!accountMenuRef.current?.contains(event.target)) {
        setAccountMenuOpen(false);
      }
    };
    const closeOnEscape = (event) => {
      if (event.key === "Escape") {
        setAccountMenuOpen(false);
        accountMenuRef.current
          ?.querySelector(".header-account-trigger")
          ?.focus();
      }
    };

    document.addEventListener("pointerdown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);

    return () => {
      document.removeEventListener("pointerdown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [accountMenuOpen]);

  const closeAccountMenu = () => setAccountMenuOpen(false);

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
                if (region === "breda_tilburg") {
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
                    <Link to={`/welcome-to-alumni`}>Alumni Program</Link>
                  </li>
                  <li>
                    <Link to={`/hall-of-fame`}>Alumni Tree</Link>
                  </li>
                </ul>
              </li>
            </Fragment>
          )}

          <li className="has-dropdown">
            <a style={{ cursor: "pointer" }}>Partners</a>
            <ul className="submenu">
              <li>
                <Link to="/partners/pwc-bulgaria">PwC</Link>
              </li>
              <li>
                <Link to="/partners">See all</Link>
              </li>
            </ul>
          </li>

          <li>
            <Link to="/articles">Articles</Link>
          </li>

          <li>
            <Link to={`/internships`}>Internships</Link>
          </li>

          <li>
            <Link to={`/${region ? region + "/" : ""}contact`}>Contact</Link>
          </li>

          {user.authInitialized && user.token && (
            <>
              {checkAuthorization(user.token, [...new Set([...ACCESS_4, ...SUPPORT_ACCESS])]) && (
                <li className="has-dropdown">
                  <a style={{ cursor: "pointer" }}>Dashboard</a>
                  <ul className="submenu">
                    <>
                      {checkAuthorization(user.token, ACCESS_1) && (
                        <li><Link to="/user/accounts">Accounts</Link></li>
                      )}
                      {checkAuthorization(user.token, ACCESS_4) && <>
                        <li><Link to="/user/dashboard">Events</Link></li>
                        <li><Link to="/user/add-event">Add Event</Link></li>
                      </>}
                      {checkAuthorization(user.token, ACCESS_1) && (
                        <li>
                          <Link to="/user/internships-dashboard">
                            Internships
                          </Link>
                        </li>
                      )}
                      {checkAuthorization(user.token, SUPPORT_ACCESS) && <li><Link to="/user/support">Support</Link></li>}
                    </>
                  </ul>
                </li>
              )}
              <li
                className={`header-account-menu ${
                  accountMenuOpen ? "is-open" : ""
                }`}
                ref={accountMenuRef}
              >
                <button
                  aria-controls="header-account-dropdown"
                  aria-expanded={accountMenuOpen}
                  aria-haspopup="true"
                  aria-label={
                    accountMenuOpen ? "Close account menu" : "Open account menu"
                  }
                  className="header-account-trigger"
                  onClick={() => setAccountMenuOpen((isOpen) => !isOpen)}
                  type="button"
                >
                  {profileImage ? (
                    <LazyLoadImage
                      src={profileImage}
                      alt=""
                      className="header-account-avatar"
                    />
                  ) : (
                    <span className="header-account-avatar header-account-avatar--fallback">
                      <IconlyProfile size="1.15rem" aria-hidden />
                    </span>
                  )}
                  <span className="header-account-trigger__label">{initials}</span>
                  <IconlyArrowDown
                    aria-hidden
                    className="header-account-trigger__chevron"
                  />
                </button>
                <div
                  className="header-account-dropdown"
                  hidden={!accountMenuOpen}
                  id="header-account-dropdown"
                >
                  <div className="header-account-summary">
                    <strong>Your account</strong>
                    {account?.email ? <span>{account.email}</span> : null}
                  </div>
                  <ul aria-label="Account sections">
                    {ACCOUNT_TABS.map((tab) => (
                      <li key={tab}>
                        <Link onClick={closeAccountMenu} to={`/user#${tab}`}>
                          {capitalizeFirstLetter(tab)}
                        </Link>
                      </li>
                    ))}
                  </ul>
                  <button
                    className="header-account-logout"
                    onClick={() => {
                      closeAccountMenu();
                      setLogoutAlert(true);
                    }}
                    type="button"
                  >
                    <IconlyLogout size="1rem" aria-hidden />
                    <span>Log Out</span>
                  </button>
                </div>
              </li>
            </>
          )}

          {!user.authInitialized ? (
            <li className="header-account-loading">
              <span aria-label="Checking account status" role="status">
                <span aria-hidden="true" className="header-account-spinner" />
              </span>
            </li>
          ) : !user.token ? (
            <li>
              <div className="header-btn">
                <button
                  onClick={() => {
                    sessionStorage.setItem("prevUrl", routePath);
                    navigate("/login");
                  }}
                  className="rn-button-style--2 rn-btn-reverse-green"
                >
                  <span>Log In</span>
                </button>
              </div>
            </li>
          ) : null}
        </ul>
      </nav>
    </>
  );
};

HeaderContent.propTypes = {
  dark: PropTypes.bool,
  forceRegion: PropTypes.string,
};

export default HeaderContent;
