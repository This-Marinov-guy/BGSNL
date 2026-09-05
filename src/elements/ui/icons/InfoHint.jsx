"use client";

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import PropTypes from "prop-types";
import { FiHelpCircle } from "./IconlyIcons";

/**
 * A circular "?" affordance that actually shows its hint.
 *
 * Replaces the previous `<FiHelpCircle data-pr-tooltip>` + `<Tooltip target>`
 * pairing, which silently showed nothing: the compat Tooltip in
 * src/compat/primereact.jsx works by setting a native `title` attribute, and
 * browsers do not render `title` tooltips on an <svg> element. Anchoring the
 * hint on a real <button> fixes that and, as a side effect, makes it reachable
 * by keyboard — the bare icon never was.
 *
 * The bubble is portalled to <body> and positioned as `fixed` rather than being
 * absolutely positioned next to the trigger. Ancestors of the trigger clip it
 * otherwise — `.user-content-area` sets `overflow-x: clip`, which sliced the
 * hint off at the panel edge on the profile tab.
 *
 * The bubble stays in the DOM and is hidden with opacity/visibility rather than
 * being conditionally rendered, so `aria-describedby` always resolves and
 * screen readers announce the hint along with the trigger.
 */

/** Keeps the bubble off the viewport edges. */
const VIEWPORT_MARGIN = 8;
/** Space between the trigger and the bubble. */
const TRIGGER_GAP = 8;

const InfoHint = ({ label = "More information", text }) => {
  const id = useId();
  const triggerRef = useRef(null);
  const bubbleRef = useRef(null);
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState(null);

  useEffect(() => setMounted(true), []);

  const reposition = useCallback(() => {
    const trigger = triggerRef.current;
    const bubble = bubbleRef.current;
    if (!trigger || !bubble) return;

    const anchor = trigger.getBoundingClientRect();
    const { height, width } = bubble.getBoundingClientRect();
    const anchorCentre = anchor.left + anchor.width / 2;
    const furthestLeft = Math.max(
      window.innerWidth - VIEWPORT_MARGIN - width,
      VIEWPORT_MARGIN
    );
    const left = Math.min(
      Math.max(anchorCentre - width / 2, VIEWPORT_MARGIN),
      furthestLeft
    );
    // Flip below the trigger when the space above cannot hold the bubble.
    const fitsAbove = anchor.top - height - TRIGGER_GAP >= VIEWPORT_MARGIN;

    setPosition({
      // The arrow tracks the trigger even when the bubble is clamped sideways.
      arrow: Math.min(Math.max(anchorCentre - left, 12), Math.max(width - 12, 12)),
      left,
      placement: fitsAbove ? "top" : "bottom",
      top: fitsAbove ? anchor.top - height - TRIGGER_GAP : anchor.bottom + TRIGGER_GAP,
    });
  }, []);

  useEffect(() => {
    if (!open) return undefined;

    reposition();

    const handle = () => reposition();
    window.addEventListener("resize", handle);
    // Capture phase so scrolling any ancestor, not just the window, re-anchors.
    window.addEventListener("scroll", handle, true);

    return () => {
      window.removeEventListener("resize", handle);
      window.removeEventListener("scroll", handle, true);
    };
  }, [open, reposition]);

  const bubble = (
    <span
      className={`info-hint__bubble${open ? " info-hint__bubble--open" : ""}${
        position ? ` info-hint__bubble--${position.placement}` : ""
      }`}
      id={id}
      ref={bubbleRef}
      role="tooltip"
      style={
        position
          ? {
              "--info-hint-arrow": `${position.arrow}px`,
              left: `${position.left}px`,
              top: `${position.top}px`,
            }
          : undefined
      }
    >
      {text}
    </span>
  );

  return (
    <span className="info-hint">
      <button
        aria-describedby={id}
        className="info-hint__trigger"
        onBlur={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        ref={triggerRef}
        type="button"
      >
        <FiHelpCircle aria-hidden size="0.72rem" />
        <span className="visually-hidden">{label}</span>
      </button>
      {mounted ? createPortal(bubble, document.body) : bubble}
    </span>
  );
};

InfoHint.propTypes = {
  /** Accessible name for the trigger; the visible hint lives in `text`. */
  label: PropTypes.string,
  text: PropTypes.node.isRequired,
};

export default InfoHint;
