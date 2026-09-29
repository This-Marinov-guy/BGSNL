"use client";

import { useEffect, useRef, useState } from "react";
import { useInView, useReducedMotion } from "framer-motion";
import Lottie from "react-lottie-player";
import upMotion from "@assets/images/svg/motion/up.json";

// Tint a private copy, leaving the shared source animation unchanged.
const redUpMotion = JSON.parse(JSON.stringify(upMotion));
function tintStrokes(node) {
  if (!node || typeof node !== "object") return;
  if (node.ty === "st" && node.c?.a === 0) {
    node.c.k = [158 / 255, 13 / 255, 51 / 255, 1]; // Brand red: #9e0d33.
  }
  Object.values(node).forEach(tintStrokes);
}
tintStrokes(redUpMotion);

export default function UpMotionIcon() {
  const container = useRef(null);
  const inView = useInView(container);
  const reducedMotion = useReducedMotion();
  const [pageVisible, setPageVisible] = useState(true);

  useEffect(() => {
    const updateVisibility = () => setPageVisible(document.visibilityState === "visible");
    updateVisibility();
    document.addEventListener("visibilitychange", updateVisibility);
    return () => document.removeEventListener("visibilitychange", updateVisibility);
  }, []);

  return <span ref={container} className="sidebar-tier-motion-icon" aria-hidden="true">
    <Lottie animationData={redUpMotion} loop
      play={reducedMotion === false && inView && pageVisible}
      goTo={reducedMotion ? 30 : undefined} />
  </span>;
}
