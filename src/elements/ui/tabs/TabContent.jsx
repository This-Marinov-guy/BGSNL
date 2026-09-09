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
import { getAccountStatusNotice } from "@/elements/subscriptions/account-status-notice.mjs";
import UserTabHeader from "./UserTabHeader";

const RESTRICTED_BENEFITS = {
  [TICKETS]: {
    label: "Tickets",
    title: "Your tickets are restricted",
    description:
      "Your ticket collection will remain unavailable until the issue with your account is resolved.",
  },
  [INTERNSHIPS]: {
    label: "Internships",
    title: "Your internships are restricted",
    description:
      "Internship access will remain unavailable until the issue with your account is resolved.",
  },
  [PROMOTIONS]: {
    label: "Promotions",
    title: "Your promotions are restricted",
    description:
      "Your member promotions will remain unavailable until the issue with your account is resolved.",
  },
};

const RestrictedBenefit = ({ currentUser, tab }) => {
  const content = RESTRICTED_BENEFITS[tab];
  const notice = getAccountStatusNotice(currentUser);

  return (
    <div className="tab-content-wrapper">
      <UserTabHeader title={content.label} />
      <div className="tab-body">
        <section className="account-restriction-card" aria-labelledby={`${tab}-restriction-title`}>
          <img
            alt=""
            aria-hidden="true"
            className="account-restriction-card__icon"
            src="/assets/images/svg/3d/lock.png"
          />
          <h3 id={`${tab}-restriction-title`}>{content.title}</h3>
          <p>{content.description}</p>
          <a
            className="rn-button-style--2 rn-btn-reverse-green rn-btn-small"
            href={notice?.href || "/user#settings"}
          >
            {notice?.actionLabel || "Open settings"}
          </a>
        </section>
      </div>
    </div>
  );
};

RestrictedBenefit.propTypes = {
  currentUser: PropTypes.object.isRequired,
  tab: PropTypes.oneOf([TICKETS, INTERNSHIPS, PROMOTIONS]).isRequired,
};

const TabContent = ({
  tab,
  currentUser,
  onUserRefresh,
  INIT_ITEMS_PER_PAGE
}) => {
  if ([TICKETS, INTERNSHIPS, PROMOTIONS].includes(tab) && !currentUser.hasBenefits) {
    return <RestrictedBenefit currentUser={currentUser} tab={tab} />;
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
