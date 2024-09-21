// FORGOTTEN PASSWORD
export const FP_SEND_EMAIL_TOKEN = 0;
export const FP_VERIFY_TOKEN = 1;
export const FP_CHANGE_PASSWORD = 2;

export const FORGOTTEN_PASSWORD_STEPS_ENUM = {
    [FP_SEND_EMAIL_TOKEN]: FP_SEND_EMAIL_TOKEN,
    [FP_VERIFY_TOKEN]: FP_VERIFY_TOKEN,
    [FP_CHANGE_PASSWORD]: FP_CHANGE_PASSWORD
}

// USER STATUS
export const ACTIVE = 'active';
export const LOCKED = 'locked';
export const SUSPENDED = 'suspended';

export const USER_STATUSES = {
    [ACTIVE]: ACTIVE,
    [LOCKED]: LOCKED,
    [SUSPENDED]: SUSPENDED
}

// ACCOUNT TABS
export const TICKETS = 'tickets';
export const NEWS = 'news';
export const INTERNSHIPS = 'internships';

export const ACCOUNT_TABS = [NEWS, TICKETS, INTERNSHIPS];