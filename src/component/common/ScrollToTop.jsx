"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * Replaces the `PageNavigationFunc` helper from the old src/index.jsx, which
 * used react-router's useLocation() to reset scroll on every navigation.
 */
const ScrollToTop = () => {
  const pathname = usePathname();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

export default ScrollToTop;
