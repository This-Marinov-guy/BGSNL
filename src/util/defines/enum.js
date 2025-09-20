// FORGOTTEN PASSWORD
export const FP_SEND_EMAIL_TOKEN = 0;
export const FP_VERIFY_TOKEN = 1;
export const FP_CHANGE_PASSWORD = 2;

export const FORGOTTEN_PASSWORD_STEPS_ENUM = {
  [FP_SEND_EMAIL_TOKEN]: FP_SEND_EMAIL_TOKEN,
  [FP_VERIFY_TOKEN]: FP_VERIFY_TOKEN,
  [FP_CHANGE_PASSWORD]: FP_CHANGE_PASSWORD,
};

// USER STATUS
export const ACTIVE = "active";
export const LOCKED = "locked";
export const SUSPENDED = "suspended";

export const USER_STATUSES = {
  [ACTIVE]: ACTIVE,
  [LOCKED]: LOCKED,
  [SUSPENDED]: SUSPENDED,
};

// ACCOUNT TABS
export const TICKETS = "tickets";
export const NEWS = "news";
export const INTERNSHIPS = "internships";
export const SETTINGS = "settings";

export const ACCOUNT_TABS = [NEWS, TICKETS, INTERNSHIPS, SETTINGS];

// TIMER TYPES
export const END_TIMER = 1;
export const START_TIMER = 2;

// Ticket types
export const GUEST = "guest";
export const MEMBER = "member";
export const ACTIVE_MEMBER = "active member";
export const FREE = "free";

export const TICKET_TYPES = {
  [GUEST]: GUEST,
  [MEMBER]: MEMBER,
  [ACTIVE_MEMBER]: ACTIVE_MEMBER,
  [FREE]: FREE,
};

// Legal Tabs
export const RULES = "rules";
export const PRIVACY = "privacy";
export const COOKIES = "cookies";
export const TERMS = "terms";

export const LEGAL_TABS = [TERMS, RULES, PRIVACY, COOKIES];
