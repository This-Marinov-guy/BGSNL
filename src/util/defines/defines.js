import { capitalizeAfterSpace } from "../functions/capitalize";

// member roles
export const SUPER_ADMIN = 'super_admin';
export const ADMIN = 'admin';
export const SOCIETY_ADMIN = 'society_board_member';
export const BOARD_MEMBER = 'board_member';
export const COMMITTEE_MEMBER = 'committee_member';
export const MEMBER = 'member';

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

//toasts
export const INCORRECT_MISSING_DATA = { severity: 'warning', summary: 'Missing details', detail: 'Please check the form again and fill the missing or incorrect data!' }
export const EVENT_ADDED = { severity: 'success', summary: 'Event added' };
export const EVENT_EDITED = { severity: 'success', summary: 'Event added' };
export const EVENT_DELETED = { severity: 'success', summary: 'Event deleted' };