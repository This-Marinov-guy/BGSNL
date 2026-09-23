"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { browserFetch } from "@/util/auth/browser-request.mjs";
import { createLiveRefresh } from "@/util/functions/live-refresh.mjs";
import { mergeGuestList } from "@/util/functions/merge-guest-list.mjs";
import { showNotification } from "@/redux/notification";

export const GUEST_LIST_CHANGED = "bgsnl:guest-list-changed";

export function useLiveGuestList(eventId, enabled, initialGuests = [], initialColumns = {}) {
  const dispatch = useDispatch();
  const initial = useRef({ initialGuests, initialColumns });
  initial.current = { initialGuests, initialColumns };
  const currentEvent = useRef(eventId);
  currentEvent.current = eventId;
  const pending = useRef(new Set());
  const refresh = useRef(null);
  const [guests, setGuests] = useState(initialGuests);
  const [columns, setColumns] = useState(initialColumns);
  const [loading, setLoading] = useState(enabled);
  const [syncError, setSyncError] = useState(false);
  const [live, setLive] = useState(false);
  const loadedEvent = useRef(null);
  const [pendingGuestIds, setPendingGuestIds] = useState([]);

  useEffect(() => {
    setGuests(initial.current.initialGuests);
    setColumns(initial.current.initialColumns);
    pending.current = new Set();
    setPendingGuestIds([]);
  }, [eventId]);

  useEffect(() => {
    if (!enabled || !eventId) return undefined;
    setLoading(loadedEvent.current !== eventId && initial.current.initialGuests.length === 0);
    let source, reconnectTimer, connected = false;
    const loop = createLiveRefresh({
      interval: () => connected ? null : 10000,
      isActive: () => document.visibilityState !== "hidden" && pending.current.size === 0,
      async load(signal) {
        const response = await browserFetch(`/api/event/guest-list/${eventId}`, { signal: AbortSignal.any([signal, AbortSignal.timeout(10000)]) });
        if (!response.ok) throw Object.assign(new Error("Guest list sync unavailable"), { status: response.status });
        const data = await response.json();
        if (!Array.isArray(data.guestList)) throw new Error("Invalid guest list response");
        return data;
      },
      onData(data) {
        loadedEvent.current = eventId;
        setGuests(current => mergeGuestList(current, data.guestList));
        setColumns(current => JSON.stringify(current) === JSON.stringify(data.columns || {}) ? current : data.columns || {});
        setLoading(false); setSyncError(false);
      },
      onError(error) {
        setLoading(false); setSyncError(true);
        if ([401, 403].includes(error.status)) { setGuests([]); setColumns({}); }
      },
    });
    refresh.current = loop;
    const disconnect = () => { clearTimeout(reconnectTimer); source?.close(); source = null; connected = false; setLive(false); };
    const connect = () => {
      if (document.visibilityState === "hidden") { disconnect(); return; }
      if (source || typeof EventSource === "undefined") return;
      source = new EventSource(`/api/event/guest-list/${eventId}/stream`);
      source.addEventListener("ready", () => { connected = true; setLive(true); loop.invalidate(); });
      source.addEventListener("changed", () => loop.invalidate());
      source.onerror = () => {
        disconnect(); loop.invalidate();
        reconnectTimer = setTimeout(connect, 3000);
      };
    };
    const invalidate = event => { if (!event?.detail?.eventId || event.detail.eventId === eventId) loop.invalidate(); };
    const resume = () => { connect(); loop.invalidate(); };
    document.addEventListener("visibilitychange", resume);
    window.addEventListener("focus", invalidate);
    window.addEventListener("online", resume);
    window.addEventListener(GUEST_LIST_CHANGED, invalidate);
    void loop.start();
    connect();
    return () => {
      disconnect();
      loop.stop();
      refresh.current = null;
      document.removeEventListener("visibilitychange", resume);
      window.removeEventListener("focus", invalidate);
      window.removeEventListener("online", resume);
      window.removeEventListener(GUEST_LIST_CHANGED, invalidate);
    };
  }, [eventId, enabled]);

  const updatePresence = useCallback(async guest => {
    const guestId = String(guest.id || guest._id || "");
    if (!guestId || pending.current.has(guestId)) return;
    pending.current.add(guestId);
    setPendingGuestIds([...pending.current]);
    refresh.current?.invalidate();
    try {
      const response = await browserFetch("/api/event/guest-presence", {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventId, guestId, present: Number(guest.status) !== 1 }),
        signal: AbortSignal.timeout(15000),
      });
      const data = await response.json();
      if (!response.ok || !data.status) throw new Error(data.message || "Attendance could not be saved.");
      if (currentEvent.current === eventId) setGuests(current => current.map(item => String(item.id || item._id) === guestId ? { ...item, ...data.guest } : item));
    } catch (error) {
      dispatch(showNotification({ severity: "error", detail: error.message || "Attendance could not be confirmed. Refreshing the guest list." }));
    } finally {
      if (currentEvent.current === eventId) {
        pending.current.delete(guestId);
        setPendingGuestIds([...pending.current]);
        window.dispatchEvent(new CustomEvent(GUEST_LIST_CHANGED, { detail: { eventId } }));
      }
    }
  }, [eventId, dispatch]);

  return { guests, columns, loading, syncError, live, pendingGuestIds, updatePresence };
}
