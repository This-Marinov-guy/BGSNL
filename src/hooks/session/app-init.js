import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { login, clearSession, finishAuthInitialization } from "../../redux/user";
import { browserFetch } from "../../util/auth/browser-request.mjs";

export const useAppInitialization = () => {
  const [isLoading, setIsLoading] = useState(true);
  const dispatch = useDispatch();
  useEffect(() => {
    let active = true;
    const controller = new AbortController();
    // Never migrate a browser-readable bearer token into the new cookie session.
    try { localStorage.removeItem("BGSNL_user_data"); localStorage.removeItem("BGSNL_session_life"); } catch { /* Storage disabled. */ }
    browserFetch("/api/session/current", { signal: controller.signal }).then(async (response) => {
      const data = await response.json();
      if (!active) return;
      if (response.ok && data.session) dispatch(login(data));
      else if (response.ok || response.status === 401) dispatch(clearSession());
    }).catch(() => { /* Recovery components provide retry; retain the HttpOnly cookie on network failure. */ })
      .finally(() => { if (active) { dispatch(finishAuthInitialization()); setIsLoading(false); } });
    return () => { active = false; controller.abort(); };
  }, [dispatch]);
  return { isLoading };
};
