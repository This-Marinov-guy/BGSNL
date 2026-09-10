"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { getLoadingDestination } from "@/elements/ui/loading/loading-recovery.mjs";

export const ROUTE_CHANGE_START_EVENT = "bgsnl:route-change-start";

/**
 * Announces that a client-side navigation just started.
 *
 * Broadcast from the <Link>/useNavigate helpers in @/util/navigation so all 82
 * call sites feed the bar without being touched, mirroring the window-event
 * idiom GlobalBackground already uses for its reveal signal.
 */
export const notifyRouteChangeStart = (href) => {
  if (typeof window === "undefined") return;
  const destination = getLoadingDestination(href, window.location.href);
  if (destination) window.dispatchEvent(new CustomEvent(ROUTE_CHANGE_START_EVENT, { detail: { href: destination } }));
};

// Prefetched routes commit within a frame or two. A bar that flashes for those
// reads as a glitch, so nothing is shown until a navigation outlives this.
const SHOW_AFTER_MS = 160;
// Fade only when navigation commits; this component renders only the bar.
const FINISH_MS = 320;

/**
 * A slim progress bar for the gap between clicking a link and the new route
 * committing. Pages here `await` their data server-side and no route ships a
 * loading.js, so a cold navigation otherwise leaves the old page on screen with
 * no feedback at all.
 */
const RouteProgress = () => {
  const pathname = usePathname();
  const search = useSearchParams()?.toString() ?? "";
  const [phase, setPhase] = useState("idle");
  const destinationRef = useRef(null);
  const committedUrl = useRef(null);
  // The pathname effect needs to read the phase without re-subscribing on every
  // change, so the ref shadows the state it renders from.
  const phaseRef = useRef("idle");
  const timers = useRef([]);

  const clearTimers = useCallback(() => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  }, []);

  const goTo = useCallback((next) => {
    phaseRef.current = next;
    setPhase(next);
  }, []);

  const finish = useCallback(() => {
    clearTimers();
    destinationRef.current = null;
    if (phaseRef.current !== "pending") {
      goTo("idle");
      return;
    }

    // Keep the indeterminate motion running while the indicator fades away.
    goTo("finishing");
    timers.current.push(setTimeout(() => goTo("idle"), FINISH_MS));
  }, [clearTimers, goTo]);

  useEffect(() => {
    const start = (href) => {
      if (!href || destinationRef.current === href) return;
      clearTimers();
      destinationRef.current = href;
      goTo("idle");
      timers.current.push(setTimeout(() => goTo("pending"), SHOW_AFTER_MS));
    };
    const handleStart = (event) => start(event.detail?.href);
    // Native same-origin links also get feedback. Listen after application
    // handlers so cancelled clicks never start a false loading timeout.
    const handleClick = (event) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const anchor = event.target.closest?.("a[href]");
      if (!anchor || anchor.hasAttribute("download") || (anchor.target && anchor.target !== "_self")) return;
      const href = getLoadingDestination(anchor.href, window.location.href);
      if (href) start(href);
    };
    const handleHistory = () => {
      const url = `${window.location.pathname}${window.location.search}`;
      if (url !== committedUrl.current) start(`${url}${window.location.hash}`);
    };

    window.addEventListener(ROUTE_CHANGE_START_EVENT, handleStart);
    document.addEventListener("click", handleClick);
    window.addEventListener("popstate", handleHistory);

    return () => {
      window.removeEventListener(ROUTE_CHANGE_START_EVENT, handleStart);
      document.removeEventListener("click", handleClick);
      window.removeEventListener("popstate", handleHistory);
      clearTimers();
    };
  }, [clearTimers, goTo]);

  // Query-only navigation must finish too; hash links never start the timer.
  useEffect(() => {
    committedUrl.current = `${window.location.pathname}${window.location.search}`;
    finish();
  }, [pathname, search, finish]);

  return (
    <div aria-hidden="true" className="route-progress" data-phase={phase}>
      <div className="route-progress__bar" />
    </div>
  );
};

export default RouteProgress;
