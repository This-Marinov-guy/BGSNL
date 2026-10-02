"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import PropTypes from "prop-types";
import PageLoading from "./PageLoading";
import { startupContentReady } from "./startup-readiness.mjs";

// Presentation only: the page stays mounted and in the server-rendered HTML.
export default function StartupOverlay({ children }) {
  const pathname = usePathname();
  const entryPath = useRef(pathname).current;
  const isPublicEntry = !entryPath?.startsWith("/user");
  const isHomeEntry = entryPath === "/";
  const content = useRef(null);
  const [ready, setReady] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  useEffect(() => {
    if (!ready) return;
    const delay = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : isPublicEntry ? 180 : 280;
    const timer = setTimeout(() => setDismissed(true), delay);
    return () => clearTimeout(timer);
  }, [ready, isPublicEntry]);
  useEffect(() => {
    let frame;
    let settled = false;
    let readySince = null;
    const finish = () => {
      if (settled) return;
      settled = true;
      clearInterval(interval);
      clearTimeout(deadline);
      frame = requestAnimationFrame(() => setReady(true));
    };
    const check = () => {
      if (!startupContentReady(content.current, document, window.innerHeight,
        { publicPage: isPublicEntry, homePage: isHomeEntry })) { readySince = null; return; }
      if (isPublicEntry) { finish(); return; }
      // Let child effects and their initial requests commit before reveal.
      if (readySince === null) readySince = performance.now();
      else if (performance.now() - readySince >= 100) finish();
    };
    const interval = setInterval(check, 50);
    const deadline = setTimeout(finish, 10000);
    check();
    return () => { settled = true; clearInterval(interval); clearTimeout(deadline); cancelAnimationFrame(frame); };
  }, [isPublicEntry, isHomeEntry]);
  return <>
    {!dismissed && <div className={`initial-loading-screen startup-overlay ${isPublicEntry ? "startup-overlay--public" : ""} ${ready ? "fade-out" : "fade-in"}`}
      aria-hidden={ready || undefined} inert={ready ? true : undefined} data-nosnippet><PageLoading /></div>}
    <div ref={content} className="initial-page-content">{children}</div>
    <noscript><style>{".startup-overlay{display:none!important}"}</style></noscript>
  </>;
}
StartupOverlay.propTypes = { children: PropTypes.node };
