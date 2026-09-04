"use client";

import {
  useEffect,
  useRef,
  useState,
} from "react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";
import PropTypes from "prop-types";

// Both edges of the reveal are measured against the viewport rather than
// against a share of the section, so a long list of events behaves like a short
// paragraph does: it is solid for the whole time it is anywhere near the
// middle, instead of spending hundreds of pixels of its own height fading.
const ENTER_EDGE = "start 62%";
const LEAVE_EDGE = "end 38%";
const DRIFT = 28;

/**
 * Carries a section in as it rises into the middle of the screen and lets it go
 * again once it is on its way out — the page content answering the same pull as
 * the embroidery behind it, which unpicks and re-knits itself on scroll.
 */
const ScrollReveal = ({ children, className }) => {
  const ref = useRef(null);
  const reducedMotion = useReducedMotion();
  const [isMounted, setIsMounted] = useState(false);

  const { scrollYProgress: entering } = useScroll({
    target: ref,
    offset: ["start end", ENTER_EDGE],
  });
  const { scrollYProgress: leaving } = useScroll({
    target: ref,
    offset: [LEAVE_EDGE, "end start"],
  });

  const opacity = useTransform([entering, leaving], ([entered, left]) =>
    Math.min(entered, 1 - left)
  );
  const y = useTransform(
    [entering, leaving],
    ([entered, left]) => (1 - entered) * DRIFT - left * DRIFT
  );

  useEffect(() => setIsMounted(true), []);

  // The wrapper is always a motion.div, never swapped for a plain one after
  // mount: React would treat that as a different element type, unmount it, and
  // useScroll — memoised on the ref object, not on the node it holds — would go
  // on measuring the detached div. Progress sticks at 0 and every section on
  // the page stays invisible.
  //
  // Only the style is held back, and only until mount: server rendering has no
  // scroll position, so a motion value there would put `opacity: 0` into the
  // delivered HTML and hand crawlers a blank section.
  const isTracking = isMounted && !reducedMotion;

  return (
    <motion.div
      className={className}
      ref={ref}
      style={isTracking ? { opacity, y } : undefined}
    >
      {children}
    </motion.div>
  );
};

ScrollReveal.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string,
};

export default ScrollReveal;
