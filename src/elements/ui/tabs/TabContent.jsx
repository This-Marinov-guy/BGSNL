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

const TabContent = ({
  tab,
  currentUser,
  onUserRefresh,
  INIT_ITEMS_PER_PAGE
}) => {
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
