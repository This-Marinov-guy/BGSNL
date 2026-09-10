import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { clearSession, refreshSession, selectUser } from "../../redux/user";
import { SESSION_CHANGED_EVENT } from "../../util/auth/browser-session.mjs";
import { clearCsrf } from "../../util/auth/browser-request.mjs";
import { trackSessionActivity } from "../../util/auth/session-activity.mjs";

export const useAuthSession = () => {
  const { session } = useSelector(selectUser);
  const dispatch = useDispatch();
  const currentSession = useRef(session);
  const sid = session?.sid, sessionVersion = session?.sessionVersion;
  useEffect(() => { currentSession.current = session; }, [session]);
  useEffect(() => {
    const synchronize = (event) => {
      if (event.key === SESSION_CHANGED_EVENT || event.key === null) {
        clearCsrf();
        window.location.reload();
      }
    };
    window.addEventListener("storage", synchronize);
    return () => window.removeEventListener("storage", synchronize);
  }, []);
  useEffect(() => {
    if (!sid) return undefined;
    const watcher = trackSessionActivity({ session: currentSession.current,
      onSession: (next) => dispatch(refreshSession(next)),
      onEnd: () => {
        dispatch(clearSession());
        window.location.replace("/login");
      },
    });
    return watcher.stop;
  }, [sid, sessionVersion, dispatch]);
};
