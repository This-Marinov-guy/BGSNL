import {
  Fragment,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  useSyncExternalStore,
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
  sessionClaims,
} from "../../util/functions/authorization";
import { capitalizeFirstLetter } from "../../util/functions/capitalize";

const useBrowserLayoutEffect =
  typeof window === "undefined" ? useEffect : useLayoutEffect;

const subscribeToHydration = () => () => {};
const hydratedSnapshot = () => true;
const serverSnapshot = () => false;
const serverUser = { authInitialized: false, session: null, image: "" };

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
  const storedUser = useSelector(selectUser);
  // Account initialisation can finish while a streamed payment page is still
  // arriving. Hydrate the same neutral header the server rendered first.
  const hydrated = useSyncExternalStore(subscribeToHydration, hydratedSnapshot, serverSnapshot);
  const user = hydrated ? storedUser : serverUser;
  const accountMenuRef = useRef(null);
  const navigationRef = useRef(null);
  const headerMotionRef = useRef({
    animation: null,
    state: null,
    width: null,
  });
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const [logoutAlert, setLogoutAlert] = useState(false);

  const account = user.session ? sessionClaims(user.session) : null;
  const profileImage = user.image || account?.image || "";
  const initials = getAccountInitials(account);

  const requestedRegion = props.forceRegion ?? useParams().region;
  const region = REGIONS.includes(requestedRegion) ? requestedRegion : null;

  const navigate = useNavigate();
  const location = useLocation();
  const routePath = location.pathname;
  const authenticationState = !user.authInitialized
    ? "loading"
    : user.session
      ? "authenticated"
      : "anonymous";

  useBrowserLayoutEffect(() => {
    const headerPanel = navigationRef.current?.closest(".header-right");
    if (!headerPanel) return undefined;

    const nextWidth = headerPanel.getBoundingClientRect().width;
    const previous = headerMotionRef.current;
    const stateChanged = previous.state && previous.state !== authenticationState;
    const distance = previous.width === null ? 0 : nextWidth - previous.width;

    previous.animation?.cancel();

    if (
      stateChanged &&
      Math.abs(distance) > 0.5 &&
      !window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      previous.animation = headerPanel.animate(
        [
          { transform: `translate3d(${distance}px, 0, 0)` },
          { transform: "translate3d(0, 0, 0)" },
        ],
        {
          duration: 380,
          easing: "cubic-bezier(0.22, 1, 0.36, 1)",
        }
      );
    } else {
      previous.animation = null;
    }

    previous.state = authenticationState;
    previous.width = nextWidth;

    return undefined;
  }, [authenticationState]);

  useEffect(() => () => {
    headerMotionRef.current.animation?.cancel();
  }, []);

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

      <nav className={"mainmenunav d-lg-block"} ref={navigationRef}>
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
                  {!user.session && (
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

          {user.authInitialized && user.session && (
            <>
              {checkAuthorization(user.session, [...new Set([...ACCESS_4, ...SUPPORT_ACCESS])]) && (
                <li className="has-dropdown">
                  <a style={{ cursor: "pointer" }}>Dashboard</a>
                  <ul className="submenu">
                    <>
                      {checkAuthorization(user.session, ACCESS_1) && (
                        <li><Link to="/user/accounts">Accounts</Link></li>
                      )}
                      {checkAuthorization(user.session, ACCESS_4) && <>
                        <li><Link to="/user/dashboard">Events</Link></li>
                        <li><Link to="/user/add-event">Add Event</Link></li>
                      </>}
                      {checkAuthorization(user.session, ACCESS_1) && (
                        <li>
                          <Link to="/user/internships-dashboard">
                            Internships
                          </Link>
                        </li>
                      )}
                      {checkAuthorization(user.session, SUPPORT_ACCESS) && <li><Link to="/user/support">Support</Link></li>}
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
          ) : !user.session ? (
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
