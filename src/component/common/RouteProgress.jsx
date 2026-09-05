"use client";

import {
  useEffect,
  useRef,
  useState,
} from "react";
import { usePathname } from "next/navigation";

export const ROUTE_CHANGE_START_EVENT = "bgsnl:route-change-start";

/**
 * Announces that a client-side navigation just started.
 *
 * Broadcast from the <Link>/useNavigate helpers in @/util/navigation so all 82
 * call sites feed the bar without being touched, mirroring the window-event
 * idiom GlobalBackground already uses for its reveal signal.
 */
export const notifyRouteChangeStart = () => {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(ROUTE_CHANGE_START_EVENT));
};

// Prefetched routes commit within a frame or two. A bar that flashes for those
// reads as a glitch, so nothing is shown until a navigation outlives this.
const SHOW_AFTER_MS = 160;
// Linking to the URL you are already on never changes `pathname`, so nothing
// would ever clear the bar. Give every navigation a hard ceiling, and end it
// the same way a real commit does rather than snapping the bar away.
const GIVE_UP_AFTER_MS = 8000;
// Long enough for the fill to reach 100% before the bar fades away.
const FINISH_MS = 320;

/**
 * A slim progress bar for the gap between clicking a link and the new route
 * committing. Pages here `await` their data server-side and no route ships a
 * loading.js, so a cold navigation otherwise leaves the old page on screen with
 * no feedback at all.
 */
const RouteProgress = () => {
  const pathname = usePathname();
  const [phase, setPhase] = useState("idle");
  // The pathname effect needs to read the phase without re-subscribing on every
  // change, so the ref shadows the state it renders from.
  const phaseRef = useRef("idle");
  const timers = useRef([]);

  const clearTimers = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  };

  const goTo = (next) => {
    phaseRef.current = next;
    setPhase(next);
  };

  // Runs the bar out to 100% and fades it, the only graceful way to end a cycle.
  const finish = () => {
    if (phaseRef.current !== "pending") {
      goTo("idle");
      return;
    }

    goTo("finishing");
    timers.current.push(setTimeout(() => goTo("idle"), FINISH_MS));
  };

  useEffect(() => {
    const handleStart = () => {
      clearTimers();
      // Idle carries no width transition, so this rewinds the bar to the left
      // edge instantly and the next cycle starts clean.
      goTo("idle");

      timers.current.push(
        setTimeout(() => goTo("pending"), SHOW_AFTER_MS),
        setTimeout(() => {
          clearTimers();
          finish();
        }, GIVE_UP_AFTER_MS)
      );
    };

    window.addEventListener(ROUTE_CHANGE_START_EVENT, handleStart);

    return () => {
      window.removeEventListener(ROUTE_CHANGE_START_EVENT, handleStart);
      clearTimers();
    };
  }, []);

  // A new pathname landing is the only reliable "navigation committed" signal.
  // This also runs on mount, where the pending phase is impossible, so the
  // first-render case needs no special guard.
  useEffect(() => {
    clearTimers();
    finish();
  }, [pathname]);

  return (
    <div aria-hidden="true" className="route-progress" data-phase={phase}>
      <div className="route-progress__bar" />
    </div>
  );
};

export default RouteProgress;
