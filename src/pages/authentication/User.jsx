import React, { useState, useEffect, useRef, useLayoutEffect } from "react";
import {
  useLocation,
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import { useHttpClient } from "../../hooks/common/http-hook";
import { useSelector } from "react-redux";
import { FiChevronUp } from "react-icons/fi";
import UserSidebar from "../../elements/ui/sidebars/UserSidebar";
import FooterTwo from "../../component/footer/FooterTwo";
import ScrollToTop from "react-scroll-up";
import PageHelmet from "../../component/common/Helmet";
import HeaderTwo from "../../component/header/HeaderTwo";
import { selectUser } from "../../redux/user";
import HeaderLoadingError from "../../elements/ui/errors/HeaderLoadingError";
import UserUpdateModal from "../../elements/ui/modals/UserUpdateModal";
import UserProfileHeader from "../../elements/ui/headers/UserProfileHeader";
import TabContent from "../../elements/ui/tabs/TabContent";
import Christmas from "../../elements/special/Christmas";
import { ACCOUNT_TABS } from "../../util/defines/enum";
import { CAMPAIGNS } from "../../util/defines/CAMPAIGNS";
import { Message } from "primereact/message";
import AlumniRegistrationButton from "../../elements/ui/buttons/AlumniRegistrationButton";

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

  const [isMobile, setIsMobile] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const { sendRequest } = useHttpClient();

  const user = useSelector(selectUser);

  const location = useLocation();
  const navigate = useNavigate();

  const routePath = location.pathname + location.hash;

  const scrollRef = useRef(null);
  
  // Handle responsive detection
  useLayoutEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 992);
    };
    
    handleResize(); // Initialize on mount
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);
  
  const toggleSidebar = () => {
    setIsSidebarOpen(prev => !prev);
  };

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
        console.error("Error fetching user data:", err);
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
    // Update tab on hash change
  }, [tab, currentUser]);

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

      {/* Start User Page Container with Sidebar */}
      <div className="user-page-container">
        {/* Sidebar */}
        <UserSidebar
          currentUser={currentUser}
          activeTab={tab || ACCOUNT_TABS[0]}
          onTabChange={(newTab) => {
            setTab(newTab);
          }}
          isMobile={isMobile}
          isSidebarOpen={isSidebarOpen}
          toggleSidebar={toggleSidebar}
        />

        {/* Main Content Area */}
        <div className="user-content-area">
          {currentUser?.tier === 0 && <Message 
            severity="info"
            text="As a tier 0 alumni, you are not eligible to any bonuses from the alumni program. Please upgrade your subscription from the settings tab."
            className="center_div mb--20"
           />}

          <div className="content-container">
            {/* User Profile Header */}
            <UserProfileHeader
              currentUser={currentUser}
              hasBirthday={hasBirthday}
            />

            {/* Campaign Section */}
            {campaignUserActions &&
              React.cloneElement(campaignUserActions.userAction.component, {
                calendarImage: currentUser.mmmCampaign2025?.calendarImage,
              })}

            {/* Tab Content */}
            <div ref={scrollRef}>
              <TabContent
                tab={tab}
                currentUser={currentUser}
                navigate={navigate}
                first={first}
                rows={rows}
                onPageChange={onPageChange}
                INIT_ITEMS_PER_PAGE={INIT_ITEMS_PER_PAGE}
              />
            </div>
          </div>
        </div>
      </div>
      {/* End User Collection */}

      {/* Start Footer Style  */}
      <FooterTwo forceRegion={currentUser.region ?? null} />
      {/* End Footer Style  */}
      {/* Start Back To Top */}
      <div className="backto-top">
        <ScrollToTop showUnder={160}>
          <FiChevronUp size={26} style={{ fontSize: "26px" }} />
        </ScrollToTop>
      </div>
      {/* End Back To Top */}
    </React.Fragment>
  );
};

export default User;
