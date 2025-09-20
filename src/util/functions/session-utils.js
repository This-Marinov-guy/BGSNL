/**
 * Session utility functions for managing persistent sessions
 */

import { PERSISTENT_SESSION, LOCAL_STORAGE_SESSION_LIFE } from "../defines/common";

/**
 * Check if persistent sessions are enabled
 * @returns {boolean} True if persistent sessions are enabled
 */
export const isPersistentSessionEnabled = () => {
  return PERSISTENT_SESSION;
};

/**
 * Get session expiration time
 * @returns {number} Session expiration timestamp
 */
export const getSessionExpiration = () => {
  const stored = localStorage.getItem(LOCAL_STORAGE_SESSION_LIFE);
  return stored ? parseInt(stored, 10) : null;
};

/**
 * Check if current session is still valid
 * @returns {boolean} True if session is valid
 */
export const isSessionValid = () => {
  if (isPersistentSessionEnabled()) {
    return true; // Persistent sessions never expire automatically
  }
  
  const expiration = getSessionExpiration();
  return expiration ? expiration > Date.now() : false;
};

/**
 * Extend session expiration (useful for activity-based renewal)
 * @param {number} additionalTime - Additional time in milliseconds
 */
export const extendSession = (additionalTime = 24 * 60 * 60 * 1000) => {
  if (isPersistentSessionEnabled()) {
    // For persistent sessions, extend by the additional time
    const currentExpiry = getSessionExpiration() || Date.now();
    const newExpiry = currentExpiry + additionalTime;
    localStorage.setItem(LOCAL_STORAGE_SESSION_LIFE, newExpiry.toString());
  }
};

/**
 * Get session info for debugging
 * @returns {object} Session information
 */
export const getSessionInfo = () => {
  const expiration = getSessionExpiration();
  const isValid = isSessionValid();
  const isPersistent = isPersistentSessionEnabled();
  
  return {
    isPersistent,
    isValid,
    expiration,
    expirationDate: expiration ? new Date(expiration).toISOString() : null,
    timeRemaining: expiration ? Math.max(0, expiration - Date.now()) : null,
  };
};
