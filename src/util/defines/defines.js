import { capitalizeAfterSpace } from "../functions/capitalize";

export const SUPER_ADMIN = 'super_admin';
export const ADMIN = 'admin';
export const SOCIETY_ADMIN = 'society_board_member';
export const BOARD_MEMBER = 'board_member';
export const COMMITTEE_MEMBER = 'committee_member';
export const MEMBER = 'member';

export const formatRole = (role) => {
    return capitalizeAfterSpace(role.replace(/_/g, " "));
}