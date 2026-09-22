// Injected browser primitives keep scheduling testable without real requests.
export function startPaymentSync({ check, visible, busy, onSlow, now = Date.now,
  schedule = setTimeout, cancel = clearTimeout, listen }) {
  const started = now();
  let timer, stopped = false, slowReported = false;
  const tick = () => {
    if (stopped) return;
    cancel(timer);
    const slow = now() - started >= 120000;
    if (slow && !slowReported) { slowReported = true; onSlow(); }
    if (visible() && !busy()) check();
    timer = schedule(tick, slow ? 15000 : 5000);
  };
  timer = schedule(tick, 5000);
  const unlisten = listen(() => { if (visible()) tick(); });
  return () => { stopped = true; cancel(timer); unlisten(); };
}
