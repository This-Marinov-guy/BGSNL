// Keep analytics event and property names centralized for discoverability and
// to prevent reporting from being fragmented by spelling variations.
export const ANALYTICS_EVENTS = Object.freeze({
  WALLET_ADD_CLICKED: "wallet_add_clicked",
  USER_REGISTRATION_OPENED: "user_registration_opened",
  USER_REGISTRATION_STEP_1_VIEWED: "user_registration_step_1_viewed",
  USER_REGISTRATION_STEP_2_VIEWED: "user_registration_step_2_viewed",
  USER_REGISTRATION_STEP_3_VIEWED: "user_registration_step_3_viewed",
  ALUMNI_REGISTRATION_OPENED: "alumni_registration_opened",
  ALUMNI_REGISTRATION_STEP_1_VIEWED: "alumni_registration_step_1_viewed",
  ALUMNI_REGISTRATION_STEP_2_VIEWED: "alumni_registration_step_2_viewed",
  ALUMNI_REGISTRATION_STEP_3_VIEWED: "alumni_registration_step_3_viewed",
  ARTICLE_OPENED: "article_opened",
  ALUMNI_TREE_OPENED: "alumni_tree_opened",
  USER_CARD_OPENED: "user_card_opened",
  CV_UPLOADED: "cv_uploaded",
  INTERNSHIPS_OPENED: "internships_opened",
  MEMBERSHIP_CTA_CLICKED: "membership_cta_clicked",
  MEMBERSHIP_TYPE_SELECTED: "membership_type_selected",
  MEMBERSHIP_PLAN_SELECTED: "membership_plan_selected",
  MEMBERSHIP_CHECKOUT_STARTED: "membership_checkout_started",
  MEMBERSHIP_PAYMENT_COMPLETED: "membership_payment_completed",
  MEMBERSHIP_PAYMENT_FAILED: "membership_payment_failed",
  EVENT_OPENED: "event_opened",
  EVENT_REGISTRATION_CTA_CLICKED: "event_registration_cta_clicked",
  EVENT_TICKET_TYPE_SELECTED: "event_ticket_type_selected",
  EVENT_CHECKOUT_STARTED: "event_checkout_started",
  EVENT_REGISTRATION_COMPLETED: "event_registration_completed",
  EVENT_REGISTRATION_FAILED: "event_registration_failed",
});

export const ANALYTICS_PROPERTIES = Object.freeze({
  WALLET_PROVIDER: "wallet_provider",
  SOURCE: "source",
  MEMBERSHIP_TYPE: "membership_type",
  MEMBERSHIP_PLAN: "membership_plan",
  TICKET_TYPE: "ticket_type",
  PAYMENT_STATUS: "payment_status",
});

export const USER_REGISTRATION_STEP_EVENTS = Object.freeze([
  ANALYTICS_EVENTS.USER_REGISTRATION_STEP_1_VIEWED,
  ANALYTICS_EVENTS.USER_REGISTRATION_STEP_2_VIEWED,
  ANALYTICS_EVENTS.USER_REGISTRATION_STEP_3_VIEWED,
]);

export const ALUMNI_REGISTRATION_STEP_EVENTS = Object.freeze([
  ANALYTICS_EVENTS.ALUMNI_REGISTRATION_STEP_1_VIEWED,
  ANALYTICS_EVENTS.ALUMNI_REGISTRATION_STEP_2_VIEWED,
  ANALYTICS_EVENTS.ALUMNI_REGISTRATION_STEP_3_VIEWED,
]);
