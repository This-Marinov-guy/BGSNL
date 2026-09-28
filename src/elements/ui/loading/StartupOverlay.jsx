"use client";

import { useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import PageLoading from "./PageLoading";
import { startupContentReady } from "./startup-readiness.mjs";

// Presentation only: the page stays mounted and in the server-rendered HTML.
export default function StartupOverlay({ children }) {
  const content = useRef(null);
  const [ready, setReady] = useState(false);
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
      if (!startupContentReady(content.current, document, window.innerHeight)) { readySince = null; return; }
      // Let child effects and their initial requests commit before reveal.
      if (readySince === null) readySince = performance.now();
      else if (performance.now() - readySince >= 100) finish();
    };
    const interval = setInterval(check, 50);
    const deadline = setTimeout(finish, 10000);
    check();
    return () => { settled = true; clearInterval(interval); clearTimeout(deadline); cancelAnimationFrame(frame); };
  }, []);
  return <>
    {!ready && <div className="initial-loading-screen startup-overlay fade-in" data-nosnippet><PageLoading /></div>}
    <div ref={content} className="initial-page-content">{children}</div>
    <noscript><style>{".startup-overlay{display:none!important}"}</style></noscript>
  </>;
}
StartupOverlay.propTypes = { children: PropTypes.node };
