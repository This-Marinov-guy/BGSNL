import {
  useCallback,
  useEffect,
  useRef,
} from "react";
import {
  useDispatch,
  useSelector,
} from "react-redux";
import {
  removeModal,
  showModal,
} from "../../redux/modal";
import {
  logout,
  selectUser,
} from "../../redux/user";
import {
  INACTIVITY_MODAL,
  JWT_RESET_TIMER,
  LOCAL_STORAGE_SESSION_LIFE,
  PERSISTENT_SESSION,
  SESSION_TIMEOUT,
  WARNING_THRESHOLD,
} from "../../util/defines/common";
import { calculateTimeRemaining } from "../../util/functions/date";
import { useJWTRefresh } from "../common/api-hooks";

export const useAuthSession = () => {
  const timeRemainingRef = useRef(SESSION_TIMEOUT);
  const targetRef = useRef(0);
  const inactivityTimeoutRef = useRef(null);
  const refreshJWTinAPITimerRef = useRef(null);
  const intervalCheckRef = useRef(null);

  const user = useSelector(selectUser);
  const dispatch = useDispatch();
  const { refreshJWTinAPI } = useJWTRefresh();

  const resetInactivityTimeout = useCallback(() => {
    // Clear any existing timeouts/intervals
    clearTimeout(inactivityTimeoutRef.current);
    clearInterval(intervalCheckRef.current);
    dispatch(removeModal(INACTIVITY_MODAL));

    // If persistent sessions are enabled, don't set up automatic expiration
    if (PERSISTENT_SESSION) {
      // Set a very long timeout (effectively never expires)
      targetRef.current = Date.now() + (365 * 24 * 60 * 60 * 1000); // 1 year
      timeRemainingRef.current = targetRef.current;

      // Token renewal is scheduled once in the session effect below, where
      // the current token is always supplied. User activity must not create
      // additional refresh requests with an undefined token.
      return;
    }

    // Original timeout logic for non-persistent sessions
    targetRef.current = Date.now() + SESSION_TIMEOUT;
    timeRemainingRef.current = SESSION_TIMEOUT;

    inactivityTimeoutRef.current = setTimeout(() => {
      window.location.href = "/";
      dispatch(logout());
      dispatch(removeModal(INACTIVITY_MODAL));
    }, SESSION_TIMEOUT);

    intervalCheckRef.current = setInterval(() => {
      const timeLeft = calculateTimeRemaining(targetRef.current);
      timeRemainingRef.current = timeLeft;

      if (timeLeft <= WARNING_THRESHOLD) {
        dispatch(showModal(INACTIVITY_MODAL));
      }

      if (timeLeft <= 0) {
        clearInterval(intervalCheckRef.current);
      }
    }, 1000);
  }, [dispatch]);

  const handleUserActivity = useCallback(() => {
    localStorage.setItem(LOCAL_STORAGE_SESSION_LIFE, targetRef.current);
    resetInactivityTimeout();
  }, [resetInactivityTimeout]);

  useEffect(() => {
    if (user && user.token) {
      window.addEventListener("click", handleUserActivity);
      resetInactivityTimeout();

      refreshJWTinAPITimerRef.current = setTimeout(() => {
        refreshJWTinAPI(user.token);
      }, JWT_RESET_TIMER);

      return () => {
        clearTimeout(inactivityTimeoutRef.current);
        clearTimeout(refreshJWTinAPITimerRef.current);
        clearInterval(intervalCheckRef.current);
        window.removeEventListener("click", handleUserActivity);
      };
    }
  }, [user]);

  return {
    getTimeRemaining: useCallback(() => timeRemainingRef.current, []),
  };
};
