"use client";

import {
  useEffect,
  useState,
} from "react";
import { usePathname } from "next/navigation";
import PropTypes from "prop-types";

/**
 * Replaces the `PageNavigationFunc` helper from the old src/index.jsx, which
 * used react-router's useLocation() to reset scroll on every navigation.
 */
const ScrollToTop = ({ children, showUnder = 160, style }) => {
  const pathname = usePathname();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  useEffect(() => {
    if (!children) return undefined;

    const updateVisibility = () => {
      setIsVisible(window.scrollY > showUnder);
    };

    updateVisibility();
    window.addEventListener("scroll", updateVisibility, { passive: true });

    return () => window.removeEventListener("scroll", updateVisibility);
  }, [children, showUnder]);

  if (!children) return null;

  return (
    <button
      aria-label="Scroll to top"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      style={{
        position: "fixed",
        bottom: "max(1.25rem, env(safe-area-inset-bottom))",
        right: "calc(max(1.25rem, env(safe-area-inset-right)) + var(--support-launcher-width, 6.25rem) + 0.75rem)",
        border: 0,
        padding: 0,
        cursor: "pointer",
        opacity: isVisible ? 1 : 0,
        visibility: isVisible ? "visible" : "hidden",
        transition: "opacity 0.2s linear, visibility 0.2s linear",
        ...style,
      }}
      type="button"
    >
      {children}
    </button>
  );
};

ScrollToTop.propTypes = {
  children: PropTypes.node,
  showUnder: PropTypes.number,
  style: PropTypes.object,
};

export default ScrollToTop;
