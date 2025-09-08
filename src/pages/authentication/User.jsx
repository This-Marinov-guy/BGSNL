import React, { useState, useEffect, Fragment, useRef } from "react";
import {
  Link,
  useLocation,
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import { useHttpClient } from "../../hooks/common/http-hook";
import { useSelector, useDispatch } from "react-redux";
import { FiChevronUp, FiArrowRight, FiLock } from "react-icons/fi";
import FooterTwo from "../../component/footer/FooterTwo";
import ScrollToTop from "react-scroll-up";
import Tooltip from "react-bootstrap/Tooltip";
import PageHelmet from "../../component/common/Helmet";
import HeaderTwo from "../../component/header/HeaderTwo";
import { LazyLoadImage } from "react-lazy-load-image-component";
import { selectUser } from "../../redux/user";
import SubscriptionManage from "../../elements/ui/buttons/SubscriptionManage";
import Recruit from "../../elements/special/Recruite";
import { Image } from "primereact/image";
import { INTERNSHIPS_LIST } from "../../util/defines/INTERNSHIPS";
import HeaderLoadingError from "../../elements/ui/errors/HeaderLoadingError";
import UserUpdateModal from "../../elements/ui/modals/UserUpdateModal";
import UserCard from "../../elements/ui/cards/UserCard";
import BirthdayBanner from "../../elements/banners/BirthdayBanner";
import Christmas from "../../elements/special/Christmas";
import { isProd } from "../../util/functions/helpers";
import { Paginator } from "primereact/paginator";
import NewsList from "../../elements/ui/lists/NewsList";
import {
  ACCOUNT_TABS,
  ACTIVE,
  INTERNSHIPS,
  NEWS,
  TICKETS,
  USER_STATUSES,
} from "../../util/defines/enum";
import { CAMPAIGNS } from "../../util/defines/CAMPAIGNS";
import InternshipCard from "../../elements/ui/cards/InternshipCard";

const User = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [isPageLoading, setIsPageLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState();
  const [hasBirthday, setHasBirthday] = useState();
  const [tab, setTab] = useState(
    window.location.hash.substring(1).split("?")[0]
  );

  const INIT_ITEMS_PER_PAGE = 6;
  
  const [first, setFirst] = useState(
    (searchParams.get("page") ? searchParams.get("page") - 1 : 0) *
      INIT_ITEMS_PER_PAGE
  );
  const [rows, setRows] = useState(INIT_ITEMS_PER_PAGE);

  const onPageChange = (event) => {
    setFirst(event.first);
    setRows(event.rows);

    const currentHash = window.location.hash; // e.g., "#internships"

    setSearchParams({ page: event.page + 1 });

    if (currentHash) {
      setTimeout(() => {
        window.location.hash = currentHash;
      }, 0);
    }
  };

  const [disableScroll, setDisableScroll] = useState(false);

  const { sendRequest } = useHttpClient();

  const user = useSelector(selectUser);

  const location = useLocation();
  const navigate = useNavigate();

  const routePath = location.pathname + location.hash;

  const scrollRef = useRef(null);

  const campaignUserActions = CAMPAIGNS.find(
    (c) => c.userAction.active ?? false
  );

  useEffect(() => {
    if (!user.token) {
      sessionStorage.setItem("prevUrl", routePath);
      navigate("/login");
      return;
    }

    const fetchCurrentUser = async () => {
      try {
        const responseData = await sendRequest(
          `user/current?withTickets=${true}&withChristmas=${true}`
        );

        setCurrentUser(responseData.user);
        setHasBirthday(responseData.celebrate);
      } catch (err) {
      } finally {
        setIsPageLoading(false);
      }
    };

    fetchCurrentUser();
  }, []);

  useEffect(() => {
    const hash = window.location.hash.substring(1).split("?")[0];
    setTab(hash);
  }, [location.hash]);

  useEffect(() => {
    setTimeout(() => {
      if (scrollRef.current && ACCOUNT_TABS.includes(tab) && !disableScroll) {
        scrollRef.current.scrollIntoView({ behavior: "smooth" });
      }
    }, 100);

    setDisableScroll(false);
  }, [tab, currentUser]);

  let menuContent = null;

  switch (tab) {
    case "":
    case NEWS:
      menuContent = <NewsList />;
      break;
    case TICKETS:
      // Check if user is tier 0 alumni
      const isTier0Alumni = true; // currentUser?.tier === 0 && currentUser?.roles?.includes('alumni');
      
      menuContent = (
        <div className="container">
          <div className="row">
            <div className="col-lg-12">
              <div className="mb--30 mb_sm--0">
                <h2 className="title">Ticket Collection</h2>
                <p>*Click one to expand it</p>

                {isTier0Alumni ? (
                  <div
                    className="tier-0-restriction"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexDirection: "column",
                      padding: "40px 20px",
                      backgroundColor: "#f8f9fa",
                      borderRadius: "8px",
                      border: "1px solid #e9ecef",
                      margin: "20px 0",
                    }}
                  >
                    <FiLock
                      style={{
                        fontSize: "48px",
                        color: "#6c757d",
                        marginBottom: "16px",
                      }}
                    />
                    <h4
                      style={{
                        color: "#6c757d",
                        marginBottom: "8px",
                        textAlign: "center",
                      }}
                    >
                      Tickets Not Available
                    </h4>
                    <p
                      style={{
                        color: "#6c757d",
                        textAlign: "center",
                        margin: "0 0 20px 0",
                      }}
                    >
                      Ticket collection is not supported for Tier 0 alumni
                      members. Upgrade your membership to gain access to exclusive
                      ticket collection.
                    </p>
                    <button
                      className="rn-button-style--2 rn-btn-reverse-red"
                      style={{
                        padding: "12px 24px",
                        fontSize: "16px",
                        fontWeight: "600",
                        borderRadius: "6px",
                        border: "none",
                        cursor: "pointer",
                        transition: "all 0.3s ease",
                        textDecoration: "none",
                        display: "inline-block",
                      }}
                      onClick={() => {
                        // Navigate to alumni upgrade page or open modal
                        navigate("/alumni/register");
                      }}
                    >
                      Upgrade Tier
                    </button>
                  </div>
                ) : currentUser && currentUser.tickets?.length > 0 ? (
                  <div className="row">
                    {currentUser.tickets.map((ticket, i) => (
                      <Image
                        src={ticket.image}
                        alt="Image with expand"
                        className="col-lg-4 col-md-6 col-12 mt--10 mb--10"
                        key={i}
                        preview
                      />
                    ))}
                  </div>
                ) : (
                  <p>No tickets purchased</p>
                )}
              </div>
            </div>
          </div>
        </div>
      );
      break;
    case INTERNSHIPS:
      menuContent = (
        <Fragment>
          <div style={{ padding: "2%" }}>
            <div className="row">
              <div className="col-lg-12">
                <div className="mb--30 mb_sm--0">
                  <h2 className="title">Internships</h2>
                  <p>
                    As a BGSNL member you get special access to our recommended
                    positions. Check the section frequently as we aim to add
                    exclusive internships for our members only!
                  </p>
                  <div className="d-flex justify-content-between flex-wrap gap-3">
                    {INTERNSHIPS_LIST.slice(first, first + rows).map(
                      (i, index) => {
                        return <InternshipCard key={index} internship={i} user={currentUser}/>;
                      }
                    )}
                  </div>
                  <Paginator
                    className="col-12"
                    first={first}
                    rows={rows}
                    totalRecords={INTERNSHIPS_LIST.length ?? 0}
                    rowsPerPageOptions={[INIT_ITEMS_PER_PAGE, 10, 15]}
                    onPageChange={onPageChange}
                  />
                </div>
              </div>
            </div>
          </div>
        </Fragment>
      );
      break;
    default:
      menuContent = null;
  }

  if (isPageLoading) {
    return <HeaderLoadingError />;
  }

  return (
    <React.Fragment>
      <PageHelmet pageTitle="Profile" />
      <HeaderTwo
        headertransparent="header--transparent"
        colorblack="color--black"
        logoname="logo.png"
        forceRegion={currentUser.region ?? null}
      />
      <UserUpdateModal currentUser={currentUser} />
      <Christmas currentUser={currentUser} />
      {/* Start Info Area */}
      <div className="service-area ptb--20 bg_color--1 mt--100">
        <div className="container">
          <div className="row service-one-wrapper">
            <div className="col-lg-5 col-md-12 col-12 center_div_col">
              <div className="service">
                {hasBirthday && (
                  <img
                    src="/assets/images/special/birthday-hat.png"
                    alt="hat"
                    className="birthday-hat"
                  />
                )}
                <LazyLoadImage
                  src={currentUser.image}
                  alt="profile"
                  className="profile-image"
                />
              </div>
            </div>
            <div className="col-lg-5 col-md-12 col-12">
              <UserCard user={currentUser} />
            </div>
          </div>
        </div>
      </div>
      {/* End Info Area */}

      {/* Start Campaigns */}
      {campaignUserActions &&
        React.cloneElement(campaignUserActions.userAction.component, {
          calendarImage: currentUser.mmmCampaign2025.calendarImage, // props
        })}
      {/* End Campaigns */}

      {/* <Greeting /> */}
      {/* Start User Collection */}
      <div ref={scrollRef} className="btn_row row">
        {ACCOUNT_TABS.map((t, i) => (
          <Link
            key={i}
            to={`#${t}`}
            className={`col-lg-2 col-md-4 col-sm-12 center_text rn-button-style--2 ${
              tab === t || (tab === "" && t === ACCOUNT_TABS[0])
                ? "rn-btn-solid-green"
                : "rn-btn-green"
            }`}
            onClick={() => {
              setDisableScroll(true);
              setTab(t);
            }}
          >
            {t}
          </Link>
        ))}
      </div>

      {menuContent !== null && menuContent}
      {/* End User Collection */}

      {/* Start Footer Style  */}
      <FooterTwo forceRegion={currentUser.region ?? null} />
      {/* End Footer Style  */}
      {/* Start Back To Top */}
      <div className="backto-top">
        <ScrollToTop showUnder={160}>
          <FiChevronUp />
        </ScrollToTop>
      </div>
      {/* End Back To Top */}
    </React.Fragment>
  );
};

export default User;
