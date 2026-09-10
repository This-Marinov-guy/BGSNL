import { store } from "../../redux/store";
import { sessionIsActive } from "../auth/browser-session.mjs";

export const isPersistentSessionEnabled = () => true;
export const getSessionExpiration = () => (store.getState().user.session?.exp || 0) * 1000 || null;
export const isSessionValid = () => sessionIsActive(store.getState().user.session);
export const extendSession = () => getSessionExpiration();
export const getSessionInfo = () => {
  const expiration = getSessionExpiration();
  return { isPersistent: true, isValid: isSessionValid(), expiration,
    expirationDate: expiration ? new Date(expiration).toISOString() : null,
    timeRemaining: expiration ? Math.max(0, expiration - Date.now()) : 0 };
};
