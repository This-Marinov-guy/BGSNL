import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  testMatch: "*.spec.mjs",
  fullyParallel: false,
  workers: 1,
  retries: 0,
  timeout: 180_000,
  expect: { timeout: 20_000 },
  reporter: [["list"], ["html", { open: "never" }]],
  globalSetup: "./e2e/preflight.mjs",
  use: {
    ...devices["Desktop Chrome"],
    channel: "chrome",
    baseURL: process.env.E2E_BASE_URL || "http://localhost:3000",
    launchOptions: { args: ["--host-resolver-rules=MAP localhost 127.0.0.1"] },
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
});
