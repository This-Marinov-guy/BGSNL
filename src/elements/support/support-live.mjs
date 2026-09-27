import { browserFetch } from "../../util/auth/browser-request.mjs";
import { createLiveRefresh } from "../../util/functions/live-refresh.mjs";

export const SUPPORT_CHANGED = "bgsnl:support-changed";

export function supportStreamFrames(onEvent) {
  let buffer = "";
  return chunk => {
    buffer += chunk;
    let boundary;
    while ((boundary = buffer.indexOf("\n\n")) !== -1) {
      const frame = buffer.slice(0, boundary);
      buffer = buffer.slice(boundary + 2);
      const event = /^event:\s*(ready|changed)\s*$/m.exec(frame)?.[1];
      if (event) onEvent(event);
    }
    if (buffer.length > 16384) throw new Error("Invalid support stream");
  };
}

// Fetch-based SSE allows guest credentials in headers/body, never in URLs.
export function watchSupportLive({ refresh, subscription, secret, isActive = () => true }) {
  let stopped = false, connected = false, connection, reconnect;
  const loop = createLiveRefresh({
    load: refresh, onData() {}, onError() {},
    isActive: () => !document.hidden && isActive(),
    interval: () => connected ? null : 10000,
  });
  async function connect() {
    if (stopped || document.hidden || connection) return;
    const payload = subscription();
    if (!payload) return;
    const controller = new AbortController();
    connection = controller;
    try {
      const response = await browserFetch("/api/support/live", {
        method: "POST", signal: AbortSignal.any([controller.signal, AbortSignal.timeout(60000)]),
        headers: { "Content-Type": "application/json", ...(secret ? { "X-Support-Token": secret } : {}) },
        body: JSON.stringify(payload),
      });
      if (!response.ok || !response.headers.get("content-type")?.includes("text/event-stream")) throw new Error("Support stream unavailable");
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      const consume = supportStreamFrames(event => {
        if (stopped || controller.signal.aborted) return;
        if (event === "ready") connected = true;
        loop.invalidate();
      });
      try {
        while (!controller.signal.aborted) {
          const { value, done } = await reader.read();
          if (done) break;
          consume(decoder.decode(value, { stream: true }));
        }
      } finally { await reader.cancel().catch(() => {}); }
    } catch { /* Background polling keeps working while streaming is unavailable. */ }
    finally {
      if (connection === controller) {
        connection = null; connected = false;
        if (!stopped) {
          loop.invalidate();
          reconnect = setTimeout(connect, 3000);
        }
      }
    }
  }
  function disconnect() {
    clearTimeout(reconnect);
    const previous = connection;
    connection = null; connected = false;
    previous?.abort();
  }
  function resume() {
    if (document.hidden) disconnect();
    else { void connect(); loop.invalidate(); }
  }
  function storageChanged() { disconnect(); resume(); }
  document.addEventListener("visibilitychange", resume);
  window.addEventListener("focus", resume);
  window.addEventListener("online", resume);
  window.addEventListener("storage", storageChanged);
  window.addEventListener(SUPPORT_CHANGED, storageChanged);
  void loop.start();
  void connect();
  return () => {
    stopped = true; disconnect(); loop.stop();
    document.removeEventListener("visibilitychange", resume);
    window.removeEventListener("focus", resume);
    window.removeEventListener("online", resume);
    window.removeEventListener("storage", storageChanged);
    window.removeEventListener(SUPPORT_CHANGED, storageChanged);
  };
}
