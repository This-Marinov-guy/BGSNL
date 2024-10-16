import { useEffect, useRef, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { selectUser, logout } from "../../redux/user";
import { removeModal, showModal } from "../../redux/modal";
import { useJWTRefresh } from "../common/api-hooks";
import { calculateTimeRemaining } from "../../util/functions/date";
import {
  INACTIVITY_MODAL,
  JWT_RESET_TIMER,
  LOCAL_STORAGE_SESSION_LIFE,
  SESSION_TIMEOUT,
  WARNING_THRESHOLD,
} from "../../util/defines/common";

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
    targetRef.current = Date.now() + SESSION_TIMEOUT;
    dispatch(removeModal(INACTIVITY_MODAL));
    clearTimeout(inactivityTimeoutRef.current);
    clearInterval(intervalCheckRef.current);
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
