import { capitalizeAfterSpace } from "../functions/capitalize";
import { isProd } from "../functions/helpers";

// Local Storage
export const LOCAL_STORAGE_USER_DATA = 'BGSNL_user_data';
export const LOCAL_STORAGE_SESSION_LIFE = 'BGSNL_session_life'

// authentication
export const SESSION_TIMEOUT = (isProd() ? 15 : 60) * 60 * 1000 // minutes in milliseconds

// member roles
export const SUPER_ADMIN = 'super_admin';
export const ADMIN = 'admin';
export const SOCIETY_ADMIN = 'society_board_member';
export const BOARD_MEMBER = 'board_member';
export const COMMITTEE_MEMBER = 'committee_member';
export const MEMBER = 'member';

export const ACCESS_1 = [SUPER_ADMIN];
export const ACCESS_2 = [...ACCESS_1, ADMIN, SOCIETY_ADMIN];
export const ACCESS_3 = [...ACCESS_2, BOARD_MEMBER];
export const ACCESS_4 = [...ACCESS_3, COMMITTEE_MEMBER];

// event status
export const EVENT_OPENED = 'opened';
export const EVENT_CLOSED = 'closed';
export const EVENT_SALE_STOP = 'temporary closed';
export const EVENT_CANCELED = 'canceled';

export const formatRole = (roles) => {
    return capitalizeAfterSpace(roles[roles.length - 1].replace(/_/g, " "));
}

// modals
export const BIRTHDAY_MODAL = 'birthday_modal';
export const USER_UPDATE_MODAL = 'user_update_modal';
export const RESET_PASSWORD_MODAL = 'reset_password_modal';
export const NSE_REGISTRATION_MODAL = 'nse_registration_modal';
export const WEB_DEV_MODAL = 'web_developer_modal';
export const INACTIVITY_MODAL = 'inactive_user_modal';

//toasts
export const SUCCESS_STYLE = {
    life: 8000,
    severity: 'success',
    style: { background: '#d4edda', color: '#155724' },
    contentStyle: { background: '#d4edda', color: '#155724' }
};

export const INFO_STYLE = {
    life: 8000,
    severity: 'info',
    style: { background: '#cce5ff', color: '#004085' },
    contentStyle: { background: '#cce5ff', color: '#004085' }
}

export const WARNING_STYLE = {
    life: 8000,
    severity: 'warn',
    style: { background: '#fff3cd', color: '#856404' },
    contentStyle: { background: '#fff3cd', color: '#856404' }
}

export const DANGER_STYLE = {
    life: 8000,
    severity: 'error',
    style: { background: '#ffcccb', color: '#8b0000' },
    contentStyle: { background: '#ffcccb', color: '#8b0000' }
}

export const INCORRECT_MISSING_DATA = {
    severity: 'warn',
    summary: 'Missing details',
    detail: 'Please check the form again and fill the missing or incorrect data!',
    ...WARNING_STYLE
};

export const getStyleBySeverity = (severity) => {
    switch (severity) {
        case 'error':
            return DANGER_STYLE;
        case 'warn':
            return WARNING_STYLE;
        case 'info':
            return INFO_STYLE;
        case 'success':
            return SUCCESS_STYLE;
        default:
            return {}
    }
};

export const EVENT_ADDED = { summary: 'Event added', ...SUCCESS_STYLE };
export const EVENT_EDITED = { summary: 'Event edited', ...SUCCESS_STYLE };
export const EVENT_DELETED = { summary: 'Event deleted', ...SUCCESS_STYLE };

export const GENERAL_ERROR = { summary: 'Something went wrong - please try again or report to support!', ...DANGER_STYLE };