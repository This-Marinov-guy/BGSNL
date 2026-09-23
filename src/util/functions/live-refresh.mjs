// One request at a time. Invalidations discard stale responses, including
// transports that complete after abort, before fetching a fresh snapshot.
export function createLiveRefresh({ load, onData, onError, isActive = () => true,
  interval = 2000, retryInterval = 10000, schedule = setTimeout, cancel = clearTimeout }) {
  let stopped = false, timer, running = false, dirty = false, controller, revision = 0;
  const nextInterval = () => typeof interval === "function" ? interval() : interval;
  async function refresh() {
    if (stopped) return;
    cancel(timer);
    if (running) { dirty = true; return; }
    if (!isActive()) { timer = schedule(refresh, 2000); return; }
    running = true;
    dirty = false;
    const version = revision;
    controller = new AbortController();
    let failed = false;
    try {
      const data = await load(controller.signal);
      if (!stopped && version === revision) onData(data);
    } catch (error) {
      failed = true;
      if (!stopped && version === revision) onError(error);
    } finally {
      running = false;
      const delay = dirty ? 0 : failed ? retryInterval : nextInterval();
      if (!stopped && delay != null) timer = schedule(refresh, delay);
    }
  }
  return {
    start: refresh,
    invalidate() { revision++; controller?.abort(); void refresh(); },
    stop() { stopped = true; revision++; cancel(timer); controller?.abort(); },
  };
}
