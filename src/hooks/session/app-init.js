import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { login, clearSession, finishAuthInitialization } from "../../redux/user";
import { restoreInitialSession } from "../../util/auth/session-restoration.mjs";

export const useAppInitialization = () => {
  const [isLoading, setIsLoading] = useState(true);
  const dispatch = useDispatch();
  useEffect(() => {
    let active = true;
    const controller = new AbortController();
    // Never migrate a browser-readable bearer token into the new cookie session.
    try { localStorage.removeItem("BGSNL_user_data"); localStorage.removeItem("BGSNL_session_life"); } catch { /* Storage disabled. */ }
    const accountPage = window.location.pathname === "/user";
    restoreInitialSession(accountPage ? "/api/session/current?account=1" : "/api/session/current", { signal: controller.signal })
      .then((result) => {
        if (!active || !result) return;
        if (result.kind === "authenticated") dispatch(login(result.data));
        else dispatch(clearSession());
        dispatch(finishAuthInitialization());
        setIsLoading(false);
      });
    return () => { active = false; controller.abort(); };
  }, [dispatch]);
  return { isLoading };
};
