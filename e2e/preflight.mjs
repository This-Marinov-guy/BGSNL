import { readFile } from "node:fs/promises";
import { localHealthRequest, waitForReady } from "../scripts/dev-services.mjs";

export default async function preflight() {
  if (process.env.E2E_RUN_WRITES !== "1") {
    throw new Error("Set E2E_RUN_WRITES=1 to run UI journeys that create dev accounts, events, tickets, applications, and reports.");
  }
  const base = new URL(process.env.E2E_BASE_URL || "http://localhost:3000");
  if (!["localhost", "127.0.0.1"].includes(base.hostname) || base.port !== "3000") {
    throw new Error("UI journeys only run against the local port 3000 development site.");
  }
  await waitForReady({ name: "domakin-mailer", port: 6000, health: "/health" }, { timeoutMs: 30_000 });
  const health = await localHealthRequest("http://127.0.0.1:6000/health").then((response) => response.json());
  if (health.service !== "domakin-mailer" || health.mode !== "mock") {
    throw new Error("Start `node start-local.mjs e2e` first. Real email delivery must be disabled.");
  }
  await waitForReady({ name: "bgsnl-api", port: 8080, health: "/api/v1" }, { timeoutMs: 30_000 });
  const prices = await readFile(new URL("../.env.e2e.local", import.meta.url), "utf8");
  for (const key of ["STRIPE_MEMBERSHIP_6M_PRICE_ID", "STRIPE_ALUMNI_TIER_2_PRICE_ID"]) {
    if (!new RegExp(`^${key}=price_`, "m").test(prices)) throw new Error(`Missing ${key}; run the Stripe test price setup.`);
  }
  await waitForReady({ name: "bgsnl", port: 3000, health: "/signup" }, { timeoutMs: 30_000 });
}
