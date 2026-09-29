import { useEffect } from "react";
import { modalKey, updateModalUrl } from "./modal-url.mjs";

export default function useModalUrl(open, name) {
  const key = modalKey(name);

  useEffect(() => {
    if (!open) return undefined;
    const pathname = window.location.pathname;
    const current = `${pathname}${window.location.search}${window.location.hash}`;
    const next = updateModalUrl(window.location.href, key, true);
    if (next !== current) window.history.replaceState(window.history.state, "", next);

    return () => {
      if (window.location.pathname !== pathname) return;
      const active = `${pathname}${window.location.search}${window.location.hash}`;
      const nextUrl = updateModalUrl(window.location.href, key, false);
      if (nextUrl !== active) window.history.replaceState(window.history.state, "", nextUrl);
    };
  }, [open, key]);
}
