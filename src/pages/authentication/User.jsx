import React, { useState, useEffect, useRef, useLayoutEffect } from "react";
import {
  useLocation,
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import { useHttpClient } from "../../hooks/common/http-hook";
import { useSelector } from "react-redux";
import { FiChevronUp, FiLock } from "react-icons/fi";
import UserSidebar from "../../elements/ui/sidebars/UserSidebar";
import FooterTwo from "../../component/footer/FooterTwo";
import ScrollToTop from "react-scroll-up";
import PageHelmet from "../../component/common/Helmet";
import HeaderTwo from "../../component/header/HeaderTwo";
import { LazyLoadImage } from "react-lazy-load-image-component";
import { selectUser } from "../../redux/user";
import { Image } from "primereact/image";
import { INTERNSHIPS_LIST } from "../../util/defines/INTERNSHIPS";
import HeaderLoadingError from "../../elements/ui/errors/HeaderLoadingError";
import UserUpdateModal from "../../elements/ui/modals/UserUpdateModal";
import UserCard from "../../elements/ui/cards/UserCard";
import Christmas from "../../elements/special/Christmas";
import { Paginator } from "primereact/paginator";
import NewsList from "../../elements/ui/lists/NewsList";
import {
  ACCOUNT_TABS,
  INTERNSHIPS,
  NEWS,
  TICKETS,
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

  let menuContent = null;

  // Determine content based on current tab
  if (tab === "" || tab === NEWS) {
    menuContent = (
      <div className="tab-content-wrapper">
        <div className="tab-header">
          <h2>Latest News & Updates</h2>
          <p>Stay updated with the latest announcements and news from BGSNL.</p>
        </div>
        <div className="tab-body">
          <NewsList />
        </div>
      </div>
    );
  } else if (tab === TICKETS) {
    // Check if user is tier 0 alumni
    const isTier0Alumni = true; // currentUser?.tier === 0 && currentUser?.roles?.includes('alumni');
    
    menuContent = (
      <div className="tab-content-wrapper">
        <div className="tab-header">
          <h2>Ticket Collection</h2>
          <p>View and manage your purchased event tickets.</p>
        </div>
        <div className="tab-body">
          {isTier0Alumni ? (
            <div className="tier-restriction-card">
              <div className="restriction-icon">
                <FiLock />
              </div>
              <h4>Tickets Not Available</h4>
              <p>
                Ticket collection is not supported for Tier 0 alumni
                members. Upgrade your membership to gain access to exclusive
                ticket collection.
              </p>
              <button
                className="rn-button-style--2 rn-btn-reverse-red"
                onClick={() => navigate("/alumni/register")}
              >
                Upgrade Tier
              </button>
            </div>
          ) : currentUser && currentUser.tickets?.length > 0 ? (
            <div className="tickets-grid">
              {currentUser.tickets.map((ticket, i) => (
                <div className="ticket-item" key={i}>
                  <Image
                    src={ticket.image}
                    alt={`Ticket ${i+1}`}
                    preview
                    className="ticket-image"
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-icon">{"🎫"}</div>
              <h3>No Tickets Found</h3>
              <p>You haven't purchased any tickets yet.</p>
            </div>
          )}
        </div>
      </div>
    );
  } else if (tab === INTERNSHIPS) {
    menuContent = (
      <div className="tab-content-wrapper">
        <div className="tab-header">
          <h2>Available Internships</h2>
          <p>
            Exclusive internship opportunities for BGSNL members. New positions are added regularly.
          </p>
        </div>
        <div className="tab-body">
          {INTERNSHIPS_LIST.length > 0 ? (
            <>
              <div className="internships-grid">
                {INTERNSHIPS_LIST.slice(first, first + rows).map((i, index) => (
                  <InternshipCard key={index} internship={i} user={currentUser}/>
                ))}
              </div>
              
              <div className="pagination-container">
                <Paginator
                  first={first}
                  rows={rows}
                  totalRecords={INTERNSHIPS_LIST.length ?? 0}
                  rowsPerPageOptions={[INIT_ITEMS_PER_PAGE, 10, 15]}
                  onPageChange={onPageChange}
                />
              </div>
            </>
          ) : (
            <div className="empty-state">
              <div className="empty-icon">{"💼"}</div>
              <h3>No Internships Available</h3>
              <p>Check back soon for new opportunities.</p>
            </div>
          )}
        </div>
      </div>
    );
  } else {
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
          <div className="content-container">
            {/* User Profile Header */}
            <div className="user-profile-header">
              <div>
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
              <div className="profile-header-info">
                <UserCard user={currentUser} />
              </div>
            </div>
            
            {/* Campaign Section */}
            {campaignUserActions &&
              React.cloneElement(campaignUserActions.userAction.component, {
                calendarImage: currentUser.mmmCampaign2025?.calendarImage,
              })}
            
            {/* Tab Content */}
            <div ref={scrollRef}>
              {menuContent !== null && menuContent}
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
          <FiChevronUp />
        </ScrollToTop>
      </div>
      {/* End Back To Top */}
    </React.Fragment>
  );
};

export default User;
