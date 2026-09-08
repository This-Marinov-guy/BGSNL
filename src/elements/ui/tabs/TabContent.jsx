import PropTypes from "prop-types";
import {
  INTERNSHIPS,
  NEWS,
  PROFILE,
  PROMOTIONS,
  SETTINGS,
  TICKETS,
} from "../../../util/defines/enum";
import InternshipsTab from "./InternshipsTab";
import NewsTab from "./NewsTab";
import ProfileTab from "./ProfileTab";
import PromotionsTab from "./PromotionsTab";
import SettingsTab from "./SettingsTab";
import TicketsTab from "./TicketsTab";
import HelpSection from "@/elements/support/HelpSection";

const TabContent = ({
  tab,
  currentUser,
  onUserRefresh,
  INIT_ITEMS_PER_PAGE
}) => {
  if ([TICKETS, INTERNSHIPS, PROMOTIONS].includes(tab) && !currentUser.hasBenefits) {
    return (
      <div className="tab-content-wrapper">
        <div className="tab-body">
          <h2>Membership benefits are unavailable</h2>
          <p>Review your subscription in Settings to access these benefits.</p>
          <a className="rn-button-style--2 rn-btn-reverse-green rn-btn-small" href="/user#settings">Open settings</a>
        </div>
      </div>
    );
  }
  // Determine content based on current tab
  if (tab === NEWS) {
    return <NewsTab />;
  } else if (tab === TICKETS) {
    return <TicketsTab currentUser={currentUser} />;
  } else if (tab === INTERNSHIPS) {
    return (
      <InternshipsTab
        currentUser={currentUser}
        onUserRefresh={onUserRefresh}
        INIT_ITEMS_PER_PAGE={INIT_ITEMS_PER_PAGE}
      />
    );
  } else if (tab === "" || tab === PROFILE) {
    return <ProfileTab currentUser={currentUser} onUserRefresh={onUserRefresh} />;
  } else if (tab === PROMOTIONS) {
    return <PromotionsTab />;
  } else if (tab === SETTINGS) {
    return <SettingsTab user={currentUser} />;
  } else if (tab === "help") {
    return <HelpSection currentUser={currentUser} />;
  } else {
    return null;
  }
};

TabContent.propTypes = {
  tab: PropTypes.string.isRequired,
  currentUser: PropTypes.object.isRequired,
  onUserRefresh: PropTypes.func,
  INIT_ITEMS_PER_PAGE: PropTypes.number.isRequired,
};

export default TabContent;
