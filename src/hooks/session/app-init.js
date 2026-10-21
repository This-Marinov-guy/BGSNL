import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { login, clearSession, finishAuthInitialization } from "../../redux/user";
import { restoreInitialSession } from "../../util/auth/session-restoration.mjs";

export const useAppInitialization = ({ skip = false } = {}) => {
  const [isLoading, setIsLoading] = useState(true);
  const dispatch = useDispatch();
  useEffect(() => {
    if (skip) { setIsLoading(false); return undefined; }
    setIsLoading(true);
    let active = true;
    const controller = new AbortController();
    // Never migrate a browser-readable bearer token into the new cookie session.
    try { localStorage.removeItem("BGSNL_user_data"); localStorage.removeItem("BGSNL_session_life"); } catch { /* Storage disabled. */ }
    const accountPage = window.location.pathname === "/user";
    const returningFromBilling = accountPage && new URLSearchParams(window.location.search).get("billing") === "return";
    restoreInitialSession(accountPage ? `/api/session/current?account=1${returningFromBilling ? "&fresh=1" : ""}` : "/api/session/current", { signal: controller.signal })
      .then((result) => {
        if (!active || !result) return;
        if (result.kind === "authenticated") {
          dispatch(login(result.data));
          if (returningFromBilling) {
            const url = new URL(window.location.href);
            url.searchParams.delete("billing");
            window.history.replaceState(window.history.state, "", `${url.pathname}${url.search}${url.hash}`);
          }
        }
        else dispatch(clearSession());
        dispatch(finishAuthInitialization());
        setIsLoading(false);
      });
    return () => { active = false; controller.abort(); };
  }, [dispatch, skip]);
  return { isLoading };
};
