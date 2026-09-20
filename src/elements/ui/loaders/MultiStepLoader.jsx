"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import PropTypes from "prop-types";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

const clamp = (value, length) => Math.max(0, Math.min(value, Math.max(length - 1, 0)));

function CheckIcon({ filled = false }) {
  if (filled) {
    return <svg aria-hidden="true" viewBox="0 0 24 24" fill="currentColor">
      <path fillRule="evenodd" d="M2.25 12a9.75 9.75 0 1 1 19.5 0 9.75 9.75 0 0 1-19.5 0Zm13.36-1.814a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z" clipRule="evenodd" />
    </svg>;
  }

  return <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="m9 12.75 2.25 2.25L15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" strokeLinecap="round" strokeLinejoin="round" />
  </svg>;
}

CheckIcon.propTypes = { filled: PropTypes.bool };

/**
 * Source: https://ui.aceternity.com/registry/multi-step-loader.json
 * Original layout and motion, with Tailwind utilities translated to Sass.
 * A supplied value keeps it in sync with real server progress;
 * without one it progresses through the supplied states on a timer.
 */
export function LoaderCore({ loadingStates, value }) {
  const reducedMotion = useReducedMotion();

  return <div className="multi-step-loader__core" aria-hidden="true">
    {loadingStates.map((loadingState, index) => {
      const distance = Math.abs(index - value);
      const opacity = Math.max(1 - distance * 0.2, 0);
      const current = index === value;

      return <motion.div key={loadingState.text} className={`multi-step-loader__step${current ? " is-current" : ""}`} initial={{ opacity: 0, y: -(value * 40) }} animate={{ opacity, y: -(value * 40) }} transition={{ duration: reducedMotion ? 0 : 0.5, ease: [0.22, 1, 0.36, 1] }}>
        <span className="multi-step-loader__icon"><CheckIcon filled={index <= value} /></span>
        <motion.span initial={{ opacity: reducedMotion ? 1 : 0, x: reducedMotion ? 0 : 12, filter: reducedMotion ? "blur(0px)" : "blur(4px)" }} animate={{ opacity: 1, x: reducedMotion || current ? 0 : 4, filter: "blur(0px)" }} transition={{ duration: reducedMotion ? 0 : 0.5, ease: [0.22, 1, 0.36, 1] }}>{loadingState.text}</motion.span>
      </motion.div>;
    })}
  </div>;
}

LoaderCore.propTypes = {
  loadingStates: PropTypes.arrayOf(PropTypes.shape({ text: PropTypes.string.isRequired })).isRequired,
  value: PropTypes.number.isRequired,
};

export default function MultiStepLoader({ loadingStates, loading, value, duration = 2000, loop = true, children, closable = false, onClose, className = "" }) {
  const [currentState, setCurrentState] = useState(0);
  const [mounted, setMounted] = useState(false);
  const overlayRef = useRef(null);
  const onCloseRef = useRef(onClose);
  const reducedMotion = useReducedMotion();
  const isControlled = Number.isFinite(value);
  const stateCount = loadingStates.length;
  const activeState = clamp(isControlled ? value : currentState, stateCount);
  const canClose = closable && typeof onClose === "function";

  useEffect(() => { setMounted(true); }, []);
  useEffect(() => { onCloseRef.current = onClose; }, [onClose]);

  useEffect(() => {
    if (!mounted || !loading) return undefined;

    const overlay = overlayRef.current;
    const previousFocus = document.activeElement;
    const scrollStyles = [document.documentElement, document.body].map(element => ({
      element,
      overflow: element.style.overflow,
      overscrollBehavior: element.style.overscrollBehavior,
      touchAction: element.style.touchAction,
    }));
    const background = Array.from(document.body.children)
      .filter(element => !element.contains(overlay))
      .map(element => ({ element, inert: element.inert }));
    background.forEach(({ element }) => { element.inert = true; });
    scrollStyles.forEach(({ element }) => {
      element.style.overflow = "hidden";
      element.style.overscrollBehavior = "none";
      element.style.touchAction = "none";
    });
    overlay?.focus({ preventScroll: true });

    const preventScroll = event => { event.preventDefault(); };
    const handleKeyDown = event => {
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "PageUp", "PageDown", "Home", "End", " "].includes(event.key) && !(event.key === " " && event.target.closest?.("button"))) {
        event.preventDefault();
      }
      if (event.key === "Escape") {
        event.preventDefault();
        event.stopImmediatePropagation();
        if (canClose) onCloseRef.current?.();
      }
      if (event.key === "Tab") {
        event.preventDefault();
        (overlay?.querySelector("button") ?? overlay)?.focus();
      }
    };
    document.addEventListener("keydown", handleKeyDown, true);
    document.addEventListener("wheel", preventScroll, { passive: false });
    document.addEventListener("touchmove", preventScroll, { passive: false });

    return () => {
      document.removeEventListener("keydown", handleKeyDown, true);
      document.removeEventListener("wheel", preventScroll);
      document.removeEventListener("touchmove", preventScroll);
      scrollStyles.forEach(({ element, overflow, overscrollBehavior, touchAction }) => {
        element.style.overflow = overflow;
        element.style.overscrollBehavior = overscrollBehavior;
        element.style.touchAction = touchAction;
      });
      background.forEach(({ element, inert }) => { element.inert = inert; });
      if (previousFocus?.isConnected) previousFocus.focus?.({ preventScroll: true });
    };
  }, [canClose, loading, mounted]);

  useEffect(() => {
    if (!loading || isControlled || stateCount < 2) {
      if (!loading) setCurrentState(0);
      return undefined;
    }

    const timeout = window.setTimeout(() => {
      setCurrentState(previous => loop ? (previous === stateCount - 1 ? 0 : previous + 1) : Math.min(previous + 1, stateCount - 1));
    }, duration);

    return () => window.clearTimeout(timeout);
  }, [currentState, duration, isControlled, loading, loop, stateCount]);

  if (!mounted) return null;

  return createPortal(<AnimatePresence mode="wait">
    {loading && <motion.div ref={overlayRef} role="dialog" aria-modal="true" aria-label="Saving your event" tabIndex={-1} className={`multi-step-loader${className ? ` ${className}` : ""}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={reducedMotion ? { duration: 0 } : undefined}>
      <div className="multi-step-loader__content">
        {children}
        <div className="multi-step-loader__viewport">
          <LoaderCore loadingStates={loadingStates} value={activeState} />
        </div>
      </div>
      <div className="multi-step-loader__fade" aria-hidden="true" />
      <span className="visually-hidden" role="status" aria-live="polite" aria-atomic="true">{loadingStates[activeState]?.text}</span>
      {canClose && <button type="button" className="multi-step-loader__close" aria-label="Close loading overlay" onClick={() => onCloseRef.current?.()}>
        <svg aria-hidden="true" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="m18 6-12 12M6 6l12 12" /></svg>
      </button>}
    </motion.div>}
  </AnimatePresence>, document.body);
}

MultiStepLoader.propTypes = {
  loadingStates: PropTypes.arrayOf(PropTypes.shape({ text: PropTypes.string.isRequired })).isRequired,
  loading: PropTypes.bool.isRequired,
  value: PropTypes.number,
  duration: PropTypes.number,
  loop: PropTypes.bool,
  children: PropTypes.node,
  closable: PropTypes.bool,
  onClose: PropTypes.func,
  className: PropTypes.string,
};
