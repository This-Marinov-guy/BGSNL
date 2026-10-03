"use client";

import React, {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import dynamic from "next/dynamic";
import { useDispatch, useSelector } from "react-redux";
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
import HeaderLoadingError from "../../elements/ui/errors/HeaderLoadingError";
import UserUpdateModal from "../../elements/ui/modals/UserUpdateModal";
import UserSidebar from "../../elements/ui/sidebars/UserSidebar";
import AlumniRegistrationButton from "@/elements/ui/buttons/AlumniRegistrationButton";
import TabContent from "../../elements/ui/tabs/TabContent";
import { useHttpClient } from "../../hooks/common/http-hook";
import { consumeInitialAccount, selectUser, updateAccount } from "../../redux/user";
import AccountBillingAlert from "@/elements/subscriptions/AccountBillingAlert";
import SubscriptionCancellationNotice from "@/elements/subscriptions/SubscriptionCancellationNotice";
import { showModal } from "@/redux/modal";
import { USER_UPDATE_MODAL } from "@/util/defines/common";
import BillingAttentionProvider from "@/elements/subscriptions/BillingAttentionProvider";
import { CAMPAIGNS } from "../../util/defines/CAMPAIGNS";
import { ACCOUNT_TABS } from "../../util/defines/enum";
import AccountCampaignAnnouncement from "@/elements/campaigns/AccountCampaignAnnouncement";
import { SESSION_NOTICE_KEY } from "@/util/auth/browser-session.mjs";
import { showNotification } from "../../redux/notification";
import campaignStyles from "@/elements/campaigns/explore-version.module.scss";
import { ANALYTICS_EVENTS } from "@/util/analytics/events.mjs";
import { clarityEvent } from "@/util/functions/helpers";
import { HOLIDAYS } from "@/util/configs/common";

const Christmas = dynamic(() => import("../../elements/special/Christmas"));

const User = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const user = useSelector(selectUser);

  const initialAccount = user.initialAccount;
  const initialCelebrate = user.initialCelebrate;
  const [isPageLoading, setIsPageLoading] = useState(!initialAccount);
  const [loadFailed, setLoadFailed] = useState(false);
  const [currentUser, setCurrentUser] = useState(initialAccount);
  const [hasBirthday, setHasBirthday] = useState(initialCelebrate);
  const [tab, setTab] = useState(ACCOUNT_TABS[0]);
  const [campaignOpenRequest, setCampaignOpenRequest] = useState(0);

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

  const infoRequestOpened = useRef(null);
  const infoRequestAccount = currentUser?._id || currentUser?.id;
  useEffect(() => {
    if (currentUser?.status !== "info_requested") { infoRequestOpened.current = null; return; }
    if (infoRequestAccount && infoRequestOpened.current !== infoRequestAccount) {
      infoRequestOpened.current = infoRequestAccount;
      dispatch(showModal(USER_UPDATE_MODAL));
    }
  }, [currentUser?.status, infoRequestAccount, dispatch]);

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
    if (!user.session) {
      sessionStorage.setItem("prevUrl", routePath);
      navigate("/login");
      return;
    }
    try {
      const notice = JSON.parse(sessionStorage.getItem(SESSION_NOTICE_KEY) || "null");
      if (notice && ["success", "error", "info"].includes(notice.severity) && typeof notice.detail === "string") {
        sessionStorage.removeItem(SESSION_NOTICE_KEY);
        dispatch(showNotification({ severity: notice.severity, detail: notice.detail.slice(0, 700) }));
      }
    } catch { /* Ignore malformed UI-only flash data. */ }

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
    if (initialAccount) dispatch(consumeInitialAccount());
    else fetchCurrentUser();
    const timer = setInterval(fetchCurrentUser, 60000);
    window.addEventListener("focus", fetchCurrentUser);
    document.addEventListener("visibilitychange", fetchCurrentUser);
    return () => {
      mounted = false;
      clearInterval(timer);
      window.removeEventListener("focus", fetchCurrentUser);
      document.removeEventListener("visibilitychange", fetchCurrentUser);
    };
  }, [user.session?.userId, user.session?.sessionVersion, dispatch]);

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

  const exploreBanner = (
    <button
      type="button"
      className={campaignStyles.banner}
      aria-haspopup="dialog"
      onClick={() => {
        setIsSidebarOpen(false);
        setCampaignOpenRequest((count) => count + 1);
        clarityEvent(ANALYTICS_EVENTS.EXPLORE_V4_CLICKED);
      }}
    >
      <span>Explore version 4</span>
    </button>
  );

  return (
    <React.Fragment>
      <PageHelmet pageTitle="Profile" />
      <HeaderTwo
        headertransparent="header--transparent"
        colorblack="color--black"
        logoname="logo.png"
        forceRegion={currentUser.region ?? null}
        centerContent={<div className={campaignStyles.mobileHeader}>{exploreBanner}</div>}
      />
      <UserUpdateModal
        currentUser={currentUser}
        onUserRefresh={(data) => {
          setCurrentUser(data.user);
          setHasBirthday(data.hasBirthday);
        }}
      />
      {HOLIDAYS.isChristmas && currentUser.hasBenefits && <Christmas currentUser={currentUser} />}
      <AccountCampaignAnnouncement
        key={currentUser._id || currentUser.id}
        accountId={currentUser._id || currentUser.id}
        session={user.session}
        blocked={currentUser.status === "info_requested" || isSidebarOpen || tab !== ACCOUNT_TABS[0]}
        openRequest={campaignOpenRequest}
      />

      {/* Start User Page Container with Sidebar */}
      <main className="user-page-container" id="user-account-content">
        {/* Sidebar */}
        <div className={campaignStyles.navigation}>
        <div className={campaignStyles.desktopBanner}>{exploreBanner}</div>
        <UserSidebar
          currentUser={currentUser}
          hasBirthday={hasBirthday}
          activeTab={tab || ACCOUNT_TABS[0]}
          onTabChange={handleTabChange}
          isMobile={isMobile}
          isSidebarOpen={isSidebarOpen}
          toggleSidebar={toggleSidebar}
        />
        </div>

        {/* Main Content Area */}
        <div className="user-content-area">
          <BillingAttentionProvider user={currentUser}>
          <AccountBillingAlert user={currentUser} hideUnavailable />
          <SubscriptionCancellationNotice user={currentUser} />
          {currentUser?.tier === 0 && <section className="user-dashboard-notice" aria-labelledby="alumni-tier-notice-title">
            <h2 id="alumni-tier-notice-title">
              <svg className="user-dashboard-notice__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true" focusable="false">
                <circle cx="12" cy="12" r="9" />
                <path d="M12 11v6" />
                <circle cx="12" cy="7.5" r="1" fill="currentColor" stroke="none" />
              </svg>
              Your Alumni Tier 0 membership
            </h2>
            <p>Alumni Tier 0 does not include alumni programme benefits. You can upgrade your subscription in Settings.</p>
            <AlumniRegistrationButton asLink={false} className="user-dashboard-notice__action">
              Upgrade tier
            </AlumniRegistrationButton>
          </section>}

          <div className="content-container">
            {/* Campaign Section */}
            {currentUser.hasBenefits && campaignUserActions &&
              campaignUserActions.userAction.component}

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
          </BillingAttentionProvider>
        </div>
      </main>
      {/* End User Collection */}

      {/* Start Footer Style  */}
      <FooterTwo forceRegion={currentUser.region ?? null} />
      {/* End Footer Style  */}
      {/* Start Back To Top */}
      {!isMobile && <div className="backto-top user-page-back-to-top">
        <ScrollToTop showUnder={160}>
          <FiChevronUp size={26} />
        </ScrollToTop>
      </div>}
      {/* End Back To Top */}
    </React.Fragment>
  );
};

export default User;
