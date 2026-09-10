import { sessionIsActive } from "../auth/browser-session.mjs";

// Presentation only: the API verifies the HttpOnly cookie's JWT independently.
export const sessionClaims = (session) => session || {};
export const checkAuthorization = (session, roles) =>
  sessionIsActive(session) && roles.some((role) => session.roles?.includes(role));
