import test from "node:test";
import assert from "node:assert/strict";
import { SCANNER_PATH, scannerReturnPath, scannerPathWithSearch } from "../src/util/auth/scanner-return.mjs";
import { authorizedScannerEventId, parseScannerBootstrap, scannerAccessRedirect } from "../src/util/auth/scanner-bootstrap.mjs";
import { clearRecentScannerEvent, readRecentScannerEvent, recentScannerEventCandidate, rememberScannerEvent } from "../src/util/auth/scanner-recent-event.mjs";
import { clearScannerEventsCache, readScannerEventsCache, scannerEventsCacheCandidate, SCANNER_EVENTS_MAX_AGE_MS, writeScannerEventsCache } from "../src/util/auth/scanner-events-cache.mjs";
import { scannerSessionNeedsReload } from "../src/util/auth/scanner-session-state.mjs";

test("scanner sign-in return keeps the selected event and ticket scan", () => {
  const path = scannerPathWithSearch({ forEvent: "event-1", token: "qr-value" });
  assert.equal(path, `${SCANNER_PATH}?forEvent=event-1&token=qr-value`);
  assert.equal(scannerReturnPath(path), path);
  assert.equal(scannerReturnPath("https://evil.example/user/dashboard/ticket-scanner"), SCANNER_PATH);
  assert.equal(scannerReturnPath("//evil.example"), SCANNER_PATH);
  assert.equal(scannerReturnPath(`${SCANNER_PATH}/other?token=qr-value`), SCANNER_PATH);
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

test("scanner bootstrap accepts only the signed-in account's authorized event response", () => {
  const response = { access: { userId: "staff-1", roles: ["board_member"], status: "active", region: "groningen" },
    events: [{ id: "event-1", title: "Event", region: "groningen" }] };
  assert.deepEqual(parseScannerBootstrap(response, "staff-1"), response);
  assert.throws(() => parseScannerBootstrap(response, "staff-2"), /access could not be verified/i);
  assert.throws(() => parseScannerBootstrap({ ...response, events: null }, "staff-1"), /access could not be verified/i);
  assert.equal(scannerAccessRedirect(403, SCANNER_PATH), "/user");
  assert.equal(scannerAccessRedirect(401, `${SCANNER_PATH}?forEvent=event-1`),
    `${SCANNER_PATH}/sign-in?returnTo=${encodeURIComponent(`${SCANNER_PATH}?forEvent=event-1`)}`);
  assert.equal(authorizedScannerEventId("event-1", response.events), "event-1");
  assert.equal(authorizedScannerEventId("other-region-event", response.events), "");
});

test("a previous event is restored only for the same login and current authorized list", () => {
  const entries = new Map();
  const storage = { getItem: key => entries.get(key) || null, setItem: (key, value) => entries.set(key, value), removeItem: key => entries.delete(key) };
  const session = { userId: "staff-1", auth_time: 100 };
  const events = [{ id: "event-1" }];
  rememberScannerEvent(session, "event-1", storage, 1000);
  assert.equal(recentScannerEventCandidate(session, storage, 1001), "event-1");
  assert.equal(readRecentScannerEvent(session, events, storage, 1001), "event-1");
  assert.equal(readRecentScannerEvent({ ...session, auth_time: 101 }, events, storage, 1001), "");
  assert.equal(readRecentScannerEvent({ ...session, userId: "staff-2" }, events, storage, 1001), "");
  assert.equal(readRecentScannerEvent(session, [{ id: "event-2" }], storage, 1001), "");
  assert.equal(readRecentScannerEvent(session, events, storage, 1000 + 3 * 60 * 60 * 1000 + 1), "");
  clearRecentScannerEvent(storage);
  assert.equal(readRecentScannerEvent(session, events, storage, 1001), "");
});

test("browser event cards are reusable for three hours only after live access matches", () => {
  const entries = new Map();
  const storage = { getItem: key => entries.get(key) || null, setItem: (key, value) => entries.set(key, value), removeItem: key => entries.delete(key) };
  const session = { userId: "staff-1", auth_time: 100, sessionVersion: 2 };
  const access = { userId: "staff-1", roles: ["board_member"], status: "active", region: "groningen" };
  const events = [{ id: "event-1", title: "Event", region: "groningen", poster: "https://example.com/poster.jpg", status: "opened", guestList: ["private"] }];
  assert.equal(SCANNER_EVENTS_MAX_AGE_MS, 3 * 60 * 60 * 1000);
  writeScannerEventsCache(session, access, events, storage, 1000);
  assert.equal(scannerEventsCacheCandidate(session, storage, 1001)?.events[0].guestList, undefined);
  assert.equal(readScannerEventsCache(session, null, storage, 1001), null);
  assert.equal(readScannerEventsCache(session, access, storage, 1001)?.[0].id, "event-1");
  assert.equal(readScannerEventsCache(session, { ...access, region: "amsterdam" }, storage, 1001), null);
  assert.equal(readScannerEventsCache(session, { ...access, roles: ["member"] }, storage, 1001), null);
  writeScannerEventsCache(session, access, events, storage, 1000);
  assert.equal(readScannerEventsCache({ ...session, userId: "staff-2" }, access, storage, 1001), null);
  writeScannerEventsCache(session, access, events, storage, 1000);
  assert.equal(readScannerEventsCache({ ...session, auth_time: 101 }, access, storage, 1001), null);
  writeScannerEventsCache(session, access, events, storage, 1000);
  assert.equal(readScannerEventsCache({ ...session, sessionVersion: 3 }, access, storage, 1001), null);
  writeScannerEventsCache(session, access, events, storage, 1000);
  assert.equal(readScannerEventsCache(session, access, storage, 1000 + SCANNER_EVENTS_MAX_AGE_MS), null);
  assert.equal(entries.size, 0);
  writeScannerEventsCache(session, access, events, storage, 1000);
  clearScannerEventsCache(storage);
  assert.equal(scannerEventsCacheCandidate(session, storage, 1001), null);
});
