"use client";
import { useEffect, useState } from "react";
import { supportScope } from "./support-state.mjs";
import { readSupportSeen, SUPPORT_SEEN_CHANGED } from "./support-unread.mjs";

export function useSupportUnread(session, staff = false) {
  const scope = `${supportScope(session)}:${staff ? "staff" : "requester"}`;
  const [state, setState] = useState({ scope: "", seen: {} });
  useEffect(() => {
    const update = () => setState({ scope, seen: readSupportSeen(scope) });
    update();
    window.addEventListener("storage", update);
    window.addEventListener(SUPPORT_SEEN_CHANGED, update);
    return () => { window.removeEventListener("storage", update); window.removeEventListener(SUPPORT_SEEN_CHANGED, update); };
  }, [scope]);
  return { scope, seen: state.scope === scope ? state.seen : {}, ready: state.scope === scope };
}
