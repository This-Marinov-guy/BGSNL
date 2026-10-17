import test from "node:test";
import assert from "node:assert/strict";
import { SCANNER_PATH, scannerReturnPath, scannerPathWithSearch } from "../src/util/auth/scanner-return.mjs";
import { clearScannerEventsCache, readScannerEventsCache, writeScannerEventsCache } from "../src/util/auth/scanner-events-cache.mjs";
import { scannerSessionNeedsReload } from "../src/util/auth/scanner-session-state.mjs";

test("scanner sign-in return keeps the selected event and ticket scan", () => {
  const path = scannerPathWithSearch({ forEvent: "event-1", token: "qr-value" });
  assert.equal(path, `${SCANNER_PATH}?forEvent=event-1&token=qr-value`);
  assert.equal(scannerReturnPath(path), path);
  assert.equal(scannerReturnPath("https://evil.example/user/dashboard/ticket-scanner"), SCANNER_PATH);
  assert.equal(scannerReturnPath("//evil.example"), SCANNER_PATH);
  assert.equal(scannerReturnPath(`${SCANNER_PATH}/other?token=qr-value`), SCANNER_PATH);
});

test("event list cache is account scoped, short lived, and can be cleared for retry", () => {
  clearScannerEventsCache();
  const events = [{ id: "event-1", title: "Groningen" }];
  writeScannerEventsCache("staff-1", events, 1000);
  assert.deepEqual(readScannerEventsCache("staff-1", 2000), events);
  assert.equal(readScannerEventsCache("staff-2", 2000), null);
  assert.equal(readScannerEventsCache("staff-1", 61000), null);
  writeScannerEventsCache("staff-1", events, 1000);
  writeScannerEventsCache("staff-2", [], 2000);
  assert.equal(readScannerEventsCache("staff-1", 2000), null);
  clearScannerEventsCache();
  assert.equal(readScannerEventsCache("staff-2", 2000), null);
});

test("event list cache never uses browser storage", () => {
  Object.defineProperty(globalThis, "sessionStorage", {
    configurable: true,
    get() { throw new Error("Storage blocked"); },
  });
  try {
    writeScannerEventsCache("staff-1", [], 1000);
    assert.deepEqual(readScannerEventsCache("staff-1", 2000), []);
  } finally { delete globalThis.sessionStorage; }
  clearScannerEventsCache();
});

test("a restored scanner page cannot replay authorization after logout or account change", () => {
  const session = { userId: "staff-1", sid: "session-1", auth_time: 100, sessionVersion: 2, accessExp: 1000 };
  assert.equal(scannerSessionNeedsReload({ authInitialized: false }, session), false);
  assert.equal(scannerSessionNeedsReload({ authInitialized: true, session }, session), false);
  assert.equal(scannerSessionNeedsReload({ authInitialized: true, session: null }, session), true);
  assert.equal(scannerSessionNeedsReload({ authInitialized: true, session: { ...session, sid: "session-2" } }, session), true);
  assert.equal(scannerSessionNeedsReload({ authInitialized: true, session: { ...session, sessionVersion: 3 } }, session), true);
  assert.equal(scannerSessionNeedsReload({ authInitialized: true, session: { ...session, accessExp: 1001 } }, session), false);
});
