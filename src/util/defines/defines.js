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