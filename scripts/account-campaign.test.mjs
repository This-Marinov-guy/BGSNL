import test, { beforeEach } from "node:test";
import { primeCsrf } from "./fixtures/cookie-transport.mjs";
beforeEach(primeCsrf);
import assert from "node:assert/strict";
import { ACTIVE_ACCOUNT_CAMPAIGNS, WHATS_NEW_CAMPAIGN, scheduleAccountCampaign, requestAccountCampaign } from "../src/elements/campaigns/account-campaign.mjs";

const tick = () => new Promise((resolve) => setTimeout(resolve, 20));

test("Version 4 is enabled, while disabled campaigns never check, mark seen or display", async () => {
  assert.equal(ACTIVE_ACCOUNT_CAMPAIGNS.includes(WHATS_NEW_CAMPAIGN), true);
  const unexpected = () => assert.fail("Disabled campaign performed background work");
  const stop = scheduleAccountCampaign({ enabled: false, delay: 0,
    check: unexpected, claim: unexpected, canPresent: unexpected, onShow: unexpected });
  await tick();
  stop();
});

test("all environments use saved history even with the obsolete local override", async (t) => {
  const previousMode = process.env.NODE_ENV;
  const previousFlag = process.env.NEXT_PUBLIC_WHATS_NEW_IGNORE_SEEN;
  t.after(() => {
    if (previousMode === undefined) delete process.env.NODE_ENV;
    else process.env.NODE_ENV = previousMode;
    if (previousFlag === undefined) delete process.env.NEXT_PUBLIC_WHATS_NEW_IGNORE_SEEN;
    else process.env.NEXT_PUBLIC_WHATS_NEW_IGNORE_SEEN = previousFlag;
  });
  let requests = 0;
  const campaign = "whats-new-2026-09";
  t.mock.method(globalThis, "fetch", async () => {
    requests++;
    return { headers: new Headers(), ok: true, json: async () => ({ campaign, seen: true, shouldShow: false }) };
  });
  const options = { endpoint: "/api", token: "test-token", campaign };
  for (const [environment, flag] of [["development", "true"], ["production", "true"], ["development", "false"], ["development", ""], ["test", "true"]]) {
    process.env.NODE_ENV = environment;
    process.env.NEXT_PUBLIC_WHATS_NEW_IGNORE_SEEN = flag;
    assert.equal((await requestAccountCampaign(options)).seen, true);
    assert.equal((await requestAccountCampaign({ ...options, markSeen: true })).shouldShow, false);
  }
  assert.equal(requests, 10);
});

test("a seen campaign never claims or displays", async () => {
  const stop = scheduleAccountCampaign({ delay: 0, check: async () => ({ seen: true }),
    claim: () => assert.fail("Unexpected claim"), canPresent: () => true,
    onShow: () => assert.fail("Unexpected display") });
  await tick(); stop();
});

test("background check waits for user interaction to finish and only displays a winning claim", async () => {
  let ready = false, claims = 0, shows = 0;
  const stop = scheduleAccountCampaign({ delay: 1, check: async () => ({ seen: false }),
    claim: async () => { claims++; return { shouldShow: true }; },
    canPresent: () => ready, onShow: () => shows++ });
  await tick(); assert.equal(claims, 0); assert.equal(shows, 0);
  ready = true;
  await tick(); stop();
  assert.equal(claims, 1); assert.equal(shows, 1);
});

test("navigation cancels pending checks without claiming or displaying", async () => {
  let finish;
  const stop = scheduleAccountCampaign({ delay: 0,
    check: () => new Promise((resolve) => { finish = resolve; }),
    claim: () => assert.fail("Unexpected claim"), canPresent: () => true,
    onShow: () => assert.fail("Unexpected display") });
  await tick(); stop(); finish({ seen: false }); await tick();
});

test("another tab winning the claim or a request failure leaves the page alone", async () => {
  for (const claim of [async () => ({ shouldShow: false }), async () => { throw new Error("Offline"); }]) {
    const stop = scheduleAccountCampaign({ delay: 0, check: async () => ({ seen: false }), claim,
      canPresent: () => true, onShow: () => assert.fail("Unexpected display") });
    await tick(); stop();
  }
});

test("campaign requests use cookies without a bearer token, no-store and reject unsuccessful responses", async (t) => {
  t.mock.method(globalThis, "fetch", async (url, options) => {
    assert.equal(url, "/api/user/campaigns/whats-new-2026-09/seen");
    assert.equal(options.method, "POST");
    assert.equal(options.keepalive, true);
    assert.equal(options.headers.get("Authorization"), null);
    assert.equal(options.cache, "no-store");
    return { headers: new Headers(), ok: false };
  });
  await assert.rejects(requestAccountCampaign({ endpoint: "/api/", token: "example-token",
    campaign: "whats-new-2026-09", markSeen: true }), /Announcement unavailable/);
});
