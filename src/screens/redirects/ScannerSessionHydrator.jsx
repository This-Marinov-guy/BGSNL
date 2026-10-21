"use client";

import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { useDispatch, useSelector } from "react-redux";
import { LoadErrorBanner } from "@/elements/ui/loading/LoadState";
import { browserFetch } from "@/util/auth/browser-request.mjs";
import { authorizedScannerEventId, parseScannerBootstrap, scannerAccessRedirect } from "@/util/auth/scanner-bootstrap.mjs";
import { clearScannerEventsCache, readScannerEventsCache, scannerEventsCacheCandidate, writeScannerEventsCache } from "@/util/auth/scanner-events-cache.mjs";
import { readRecentScannerEvent, recentScannerEventCandidate, rememberScannerEvent } from "@/util/auth/scanner-recent-event.mjs";
import { login, selectUser } from "@/redux/user";
import { scannerSessionNeedsReload } from "@/util/auth/scanner-session-state.mjs";
import CheckTicket, { EventCardsSkeleton } from "./CheckTicket";
import ScannerHeader from "./ScannerHeader";
import styles from "./check-ticket.module.scss";

export default function ScannerSessionHydrator({ session }) {
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const needsReload = scannerSessionNeedsReload(user, session);
  const [bootstrap, setBootstrap] = useState(null);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    if (needsReload) window.location.replace(window.location.href);
  }, [needsReload]);
  useEffect(() => {
    if (needsReload) return undefined;
    const controller = new AbortController();
    async function load() {
      try {
        const loadResponse = async (url) => {
          const response = await browserFetch(url, {
            signal: AbortSignal.any([controller.signal, AbortSignal.timeout(15000)]),
          });
          if (controller.signal.aborted) return null;
          const redirectTo = scannerAccessRedirect(response.status,
            `${window.location.pathname}${window.location.search}`);
          if (redirectTo) { clearScannerEventsCache(); window.location.replace(redirectTo); return null; }
          if (!response.ok) throw new Error("Scanner events could not be loaded. Please try again.");
          return response.json();
        };
        const query = new URLSearchParams(window.location.search);
        const hasExplicitScan = ["forEvent", "event", "token", "code", "preview"].some(key => query.has(key));
        const preferredEventId = query.get("forEvent") || query.get("event") ||
          (hasExplicitScan ? "" : recentScannerEventCandidate(session));
        const focusedId = /^[\da-f]{24}$/i.test(preferredEventId) ? preferredEventId : "";
        const candidate = focusedId ? null : scannerEventsCacheCandidate(session);
        let packet;
        if (candidate) {
          const access = await loadResponse("/api/future-event/scanner-access");
          if (!access) return;
          parseScannerBootstrap({ access, events: [] }, session.userId);
          const cachedEvents = readScannerEventsCache(session, access);
          if (cachedEvents) packet = { access, events: cachedEvents };
          else clearScannerEventsCache();
        }
        if (!packet) {
          const data = await loadResponse(`/api/future-event/scanner-events${focusedId ? `?forEvent=${focusedId}` : ""}`);
          if (!data) return;
          packet = parseScannerBootstrap(data, session.userId);
          if (!focusedId) writeScannerEventsCache(session, packet.access, packet.events);
        }
        if (controller.signal.aborted) return;
        const explicitEventId = authorizedScannerEventId(query.get("forEvent") || query.get("event"), packet.events);
        if (explicitEventId) rememberScannerEvent(session, explicitEventId);
        const recentEventId = hasExplicitScan ? "" : readRecentScannerEvent(session, packet.events);
        setBootstrap({ ...packet, recentEventId });
        setError("");
      } catch {
        if (!controller.signal.aborted) setError("Scanner access and events could not be loaded. Please try again.");
      }
    }
    void load();
    return () => controller.abort();
  }, [attempt, needsReload, session.userId, session.auth_time, session.sessionVersion]);
  useEffect(() => {
    if (bootstrap?.access && !needsReload) dispatch(login({ session: { ...session, ...bootstrap.access } }));
  }, [bootstrap, dispatch, needsReload, session]);

  if (needsReload) return null;
  return bootstrap ? <CheckTicket initialEvents={bootstrap.events} initialEventId={bootstrap.recentEventId} initialAccess={bootstrap.access} session={session} /> : <>
    <ScannerHeader />
    <main className={styles.checkIn}>
      <header className={styles.heading}><h1 className="page-breadcrumb__title archive">Ticket scanner</h1></header>
      {error ? <LoadErrorBanner message={error} onRetry={() => { setError(""); setAttempt(value => value + 1); }} /> : <EventCardsSkeleton />}
    </main>
  </>;
}

ScannerSessionHydrator.propTypes = {
  session: PropTypes.shape({
    sid: PropTypes.string.isRequired,
    auth_time: PropTypes.number.isRequired,
    userId: PropTypes.string.isRequired,
    sessionVersion: PropTypes.number.isRequired,
    accessExp: PropTypes.number.isRequired,
  }).isRequired,
};
