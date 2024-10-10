import { useEffect, useState } from "react";
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
  const [timeRemaining, setTimeRemaining] = useState(SESSION_TIMEOUT);

  const user = useSelector(selectUser);

  const dispatch = useDispatch();
  const { refreshJWTinAPI } = useJWTRefresh();

  useEffect(() => {
    if (user && user.token) {
      let inactivityTimeout;
      let refreshJWTinAPITimer;
      let intervalCheck;
      let target = Date.now() + SESSION_TIMEOUT;

      const resetInactivityTimeout = () => {
        target = Date.now() + SESSION_TIMEOUT;
        dispatch(removeModal(INACTIVITY_MODAL));
        clearTimeout(inactivityTimeout);
        clearInterval(intervalCheck);
        setTimeRemaining(SESSION_TIMEOUT);

        inactivityTimeout = setTimeout(() => {
          window.location.href = '/';
          dispatch(logout());
          dispatch(removeModal(INACTIVITY_MODAL));
        }, SESSION_TIMEOUT);

        intervalCheck = setInterval(() => {
          const timeLeft = calculateTimeRemaining(target);
          setTimeRemaining(timeLeft);

          if (timeLeft <= WARNING_THRESHOLD) {
            dispatch(showModal(INACTIVITY_MODAL));
          }

          if (timeLeft <= 0) {
            clearInterval(intervalCheck);
          }
        }, 1000);
      };

      const handleUserActivity = () => {
        localStorage.setItem(LOCAL_STORAGE_SESSION_LIFE, target);
        resetInactivityTimeout();
      };

      window.addEventListener("click", handleUserActivity);
      resetInactivityTimeout();

      refreshJWTinAPITimer = setTimeout(() => {
        refreshJWTinAPI(user.token);
      }, JWT_RESET_TIMER);

      return () => {
        clearTimeout(inactivityTimeout);
        clearTimeout(refreshJWTinAPITimer);
        clearInterval(intervalCheck);
        window.removeEventListener("click", handleUserActivity);
      };
    }
  }, [user]);

  return { timeRemaining };
};
