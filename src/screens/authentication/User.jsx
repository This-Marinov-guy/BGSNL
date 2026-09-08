"use client";

import React, {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { useDispatch, useSelector } from "react-redux";
import { Message } from "@/compat/primereact";
import ScrollToTop from "@/component/common/ScrollToTop";
import { FiChevronUp } from "@/elements/ui/icons/IconlyIcons";
import {
  useLocation,
  useNavigate,
  useSearchParams,
} from "@/util/navigation";
import PageHelmet from "../../component/common/Helmet";
import FooterTwo from "../../component/footer/FooterTwo";
import HeaderTwo from "../../component/header/HeaderTwo";
import Christmas from "../../elements/special/Christmas";
import HeaderLoadingError from "../../elements/ui/errors/HeaderLoadingError";
import UserUpdateModal from "../../elements/ui/modals/UserUpdateModal";
import UserSidebar from "../../elements/ui/sidebars/UserSidebar";
import TabContent from "../../elements/ui/tabs/TabContent";
import { useHttpClient } from "../../hooks/common/http-hook";
import { selectUser, updateAccount } from "../../redux/user";
import BillingStatusBanner from "@/elements/subscriptions/BillingStatusBanner";
import { CAMPAIGNS } from "../../util/defines/CAMPAIGNS";
import { ACCOUNT_TABS } from "../../util/defines/enum";

const User = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [isPageLoading, setIsPageLoading] = useState(true);
  const [loadFailed, setLoadFailed] = useState(false);
  const [currentUser, setCurrentUser] = useState();
  const [hasBirthday, setHasBirthday] = useState();
  const [tab, setTab] = useState(ACCOUNT_TABS[0]);

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

  const [isMobile, setIsMobile] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const { sendRequest } = useHttpClient();
  const request = useRef(sendRequest);
  request.current = sendRequest;
  const dispatch = useDispatch();

  const user = useSelector(selectUser);

  const location = useLocation();
  const navigate = useNavigate();

  const routePath = location.pathname + location.hash;

  const scrollRef = useRef(null);

  // Handle responsive detection
  useLayoutEffect(() => {
    const mobileQuery = window.matchMedia("(max-width: 991px)");
    const handleViewportChange = (event) => {
      setIsMobile(event.matches);
      if (!event.matches) setIsSidebarOpen(false);
    };

    handleViewportChange(mobileQuery);
    mobileQuery.addEventListener("change", handleViewportChange);

    return () =>
      mobileQuery.removeEventListener("change", handleViewportChange);
  }, []);

  useEffect(() => {
    if (!isMobile || !isSidebarOpen) return undefined;

    const previousOverflow = document.body.style.overflow;
    const closeOnEscape = (event) => {
      if (event.key === "Escape") setIsSidebarOpen(false);
    };

    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", closeOnEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [isMobile, isSidebarOpen]);

  const toggleSidebar = () => {
    setIsSidebarOpen((previousValue) => !previousValue);
  };

  const handleTabChange = (newTab) => {
    setTab(newTab);

    if (isMobile) {
      const reduceMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;

      requestAnimationFrame(() => {
        scrollRef.current?.scrollIntoView({
          behavior: reduceMotion ? "auto" : "smooth",
          block: "start",
        });
        scrollRef.current?.focus({ preventScroll: true });
      });
    }
  };

  const campaignUserActions = CAMPAIGNS.find(
    (c) => c.userAction?.active ?? false
  );

  useEffect(() => {
    if (!user.token) {
      sessionStorage.setItem("prevUrl", routePath);
      navigate("/login");
      return;
    }

    let mounted = true;
    let refreshing = false;
    const fetchCurrentUser = async () => {
      if (refreshing || document.visibilityState === "hidden") return;
      refreshing = true;
      try {
        const response = await request.current("user/current?withTickets=true&withChristmas=true", "GET", null, {}, false, false);
        if (!mounted) return;
        if (!response?.user) {
          setLoadFailed(true);
          return;
        }
        setCurrentUser(response.user);
        setHasBirthday(response.celebrate);
        setLoadFailed(false);
        dispatch(updateAccount(response.user));
      } finally {
        refreshing = false;
        if (mounted) setIsPageLoading(false);
      }
    };
    fetchCurrentUser();
    const timer = setInterval(fetchCurrentUser, 60000);
    window.addEventListener("focus", fetchCurrentUser);
    document.addEventListener("visibilitychange", fetchCurrentUser);
    return () => {
      mounted = false;
      clearInterval(timer);
      window.removeEventListener("focus", fetchCurrentUser);
      document.removeEventListener("visibilitychange", fetchCurrentUser);
    };
  }, [user.token, dispatch]);

  useEffect(() => {
    const syncTabWithHash = () => {
      const hash = window.location.hash.substring(1).split("?")[0];
      setTab(ACCOUNT_TABS.includes(hash) ? hash : ACCOUNT_TABS[0]);
    };

    syncTabWithHash();
    window.addEventListener("hashchange", syncTabWithHash);

    return () => window.removeEventListener("hashchange", syncTabWithHash);
  }, []);

  if (isPageLoading) {
    return <HeaderLoadingError />;
  }

  if (loadFailed || !currentUser) {
    return (
      <HeaderLoadingError
        isError
        message="We could not load your account. Check your connection and try again."
      />
    );
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
      <UserUpdateModal
        currentUser={currentUser}
        onUserRefresh={(data) => {
          setCurrentUser(data.user);
          setHasBirthday(data.hasBirthday);
        }}
      />
      {currentUser.hasBenefits && <Christmas currentUser={currentUser} />}

      {/* Start User Page Container with Sidebar */}
      <main className="user-page-container" id="user-account-content">
        {/* Sidebar */}
        <UserSidebar
          currentUser={currentUser}
          hasBirthday={hasBirthday}
          activeTab={tab || ACCOUNT_TABS[0]}
          onTabChange={handleTabChange}
          isMobile={isMobile}
          isSidebarOpen={isSidebarOpen}
          toggleSidebar={toggleSidebar}
        />

        {/* Main Content Area */}
        <div className="user-content-area">
          <BillingStatusBanner user={currentUser} />
          {currentUser?.tier === 0 && <Message 
            severity="info"
            text="As a tier 0 alumni, you are not eligible to any bonuses from the alumni program. Please upgrade your subscription from the settings tab."
            className="user-dashboard-notice mb--20"
           />}

          <div className="content-container">
            {/* Campaign Section */}
            {currentUser.hasBenefits && campaignUserActions &&
              React.cloneElement(campaignUserActions.userAction.component, {
                calendarImage: currentUser.mmmCampaign2025?.calendarImage,
              })}

            {/* Tab Content */}
            <section
              aria-live="polite"
              className="user-tab-transition"
              key={tab}
              ref={scrollRef}
              tabIndex={-1}
            >
              <TabContent
                tab={tab}
                currentUser={currentUser}
                onUserRefresh={(data) => {
                  setCurrentUser(data.user);
                  setHasBirthday(data.hasBirthday);
                }}
                first={first}
                rows={rows}
                onPageChange={onPageChange}
                INIT_ITEMS_PER_PAGE={INIT_ITEMS_PER_PAGE}
              />
            </section>
          </div>
        </div>
      </main>
      {/* End User Collection */}

      {/* Start Footer Style  */}
      <FooterTwo forceRegion={currentUser.region ?? null} />
      {/* End Footer Style  */}
      {/* Start Back To Top */}
      <div className="backto-top user-page-back-to-top">
        <ScrollToTop showUnder={160}>
          <FiChevronUp size={26} />
        </ScrollToTop>
      </div>
      {/* End Back To Top */}
    </React.Fragment>
  );
};

export default User;
