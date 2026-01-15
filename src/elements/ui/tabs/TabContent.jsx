import React from "react";
import PropTypes from "prop-types";
import { NEWS, TICKETS, INTERNSHIPS, SETTINGS, PROFILE } from "../../../util/defines/enum";
import NewsTab from "./NewsTab";
import TicketsTab from "./TicketsTab";
import InternshipsTab from "./InternshipsTab";
import SettingsTab from "./SettingsTab";
import ProfileTab from "./ProfileTab";

const TabContent = ({ 
  tab, 
  currentUser, 
  hasBirthday,
  onUserRefresh,
  navigate, 
  first, 
  rows, 
  onPageChange, 
  INIT_ITEMS_PER_PAGE
}) => {
  // Determine content based on current tab
  if (tab === "" || tab === NEWS) {
    return <NewsTab />;
  } else if (tab === TICKETS) {
    return <TicketsTab currentUser={currentUser} navigate={navigate} />;
  } else if (tab === INTERNSHIPS) {
    return (
      <InternshipsTab
        currentUser={currentUser}
        onUserRefresh={onUserRefresh}
        INIT_ITEMS_PER_PAGE={INIT_ITEMS_PER_PAGE}
      />
    );
  } else if (tab === PROFILE) {
    return <ProfileTab currentUser={currentUser} hasBirthday={hasBirthday} onUserRefresh={onUserRefresh} />;
  } else if (tab === SETTINGS) {
    return <SettingsTab user={currentUser} />;
  } else {
    return null;
  }
};

TabContent.propTypes = {
  tab: PropTypes.string.isRequired,
  currentUser: PropTypes.object.isRequired,
  hasBirthday: PropTypes.bool,
  onUserRefresh: PropTypes.func,
  navigate: PropTypes.func.isRequired,
  first: PropTypes.number.isRequired,
  rows: PropTypes.number.isRequired,
  onPageChange: PropTypes.func.isRequired,
  INIT_ITEMS_PER_PAGE: PropTypes.number.isRequired,
};

export default TabContent;
