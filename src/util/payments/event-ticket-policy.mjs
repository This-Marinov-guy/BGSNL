export const EVENT_TICKET_COOKIE_SECONDS = 30 * 60;
export const validEventTicketToken = token => typeof token === "string" && token.length <= 1500 && /^e1\.[A-Za-z0-9_-]{40,}$/.test(token);
export const eventTicketCookieName = id => typeof id === "string" && /^[a-f0-9]{24}$/.test(id) ? `bgsnl_event_ticket_${id}` : null;
export const eventTicketPath = id => `/payment/event-ticket/${id}`;
export const isEventTicketPage = path => path === "/payment/event-ticket" || path?.startsWith("/payment/event-ticket/");
