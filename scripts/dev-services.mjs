#!/usr/bin/env node
import { execFile, spawn } from "node:child_process";
import { randomBytes } from "node:crypto";
import { access, readFile, realpath } from "node:fs/promises";
import { get as httpGet } from "node:http";
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { promisify } from "node:util";
import { setTimeout as delay } from "node:timers/promises";
import { checkStripeCli, configureTestStripe, stripeService, STRIPE_FORWARD_URL } from "./local-stripe.mjs";

const exec = promisify(execFile);
const websiteDirectory = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

export async function readEnvironment(directory, parse, files = [".env", ".env.dev", ".env.local"]) {
  const environment = {};
  for (const file of files) {
    try { Object.assign(environment, parse(await readFile(path.join(directory, file)))); }
    catch (error) { if (error.code !== "ENOENT") throw error; }
  }
  return environment;
}

export function localEnvironments(api, mailer, inherited = process.env) {
  const apiEnv = { ...api, ...inherited };
  const mailerEnv = { ...mailer, ...inherited };
  // Share only the channel-scoped credential, never the Mailer admin key.
  const secret = randomBytes(32).toString("hex");
  for (const key of ["DB_USER", "DB_PASS", "DB", "SSR_SERVER_KEY"]) {
    if (!apiEnv[key]?.trim()) throw new Error(`Configure ${key} in BGSNL-API/.env or .env.local.`);
  }
  if (!mailerEnv.BULGARIANSOCIETY_EMAIL_DATABASE_URL?.trim()) {
    throw new Error("Configure BULGARIANSOCIETY_EMAIL_DATABASE_URL in Domakin-Mailer/.env.dev; delivery acceptance requires its email store.");
  }
  const development = { APP_ENV: "dev", NODE_ENV: "development" };
  return {
    website: {
      ...inherited, ...development, PORT: "3000",
      NEXT_PUBLIC_TEST_SERVER_URL: "http://localhost:8080/api/",
      BGSNL_SERVER_KEY: apiEnv.SSR_SERVER_KEY,
    },
    api: {
      ...apiEnv, ...development, PORT: "8080", BILLING_WORKER_ENABLED: "false",
      BGSNL_REDIS_URL: apiEnv.BGSNL_REDIS_URL || "redis://127.0.0.1:6380/0",
      BGSNL_REDIS_PREFIX: apiEnv.BGSNL_REDIS_PREFIX || "bgsnl:development:v1:",
      BGSNL_EMAIL_PROVIDER: "domakin", MAILER_API_URL: "http://127.0.0.1:6000/api",
      MAILER_BULGARIANSOCIETY_SECRET: secret,
    },
    mailer: {
      ...mailerEnv, ...development, PORT: "6000", APP_URL: "http://localhost:6000",
      EMAIL_EVENT_MAINTENANCE_ENABLED: "false", EMAIL_SES_EVENT_CONSUMER_ENABLED: "false",
      AXIOM_LOGGING_ENABLED: "false", LOG_MAILS: "false",
      MAILER_BULGARIANSOCIETY_SECRET: secret,
    },
  };
}

export async function createServices({ directory = websiteDirectory, inherited = process.env } = {}) {
  const apiDirectory = path.resolve(directory, "../BGSNL-API");
  const mailerDirectory = path.resolve(inherited.BGSNL_MAILER_DIR || path.join(directory, "../../Domakin/Domakin-Mailer"));
  // Load dotenv from the API's existing dependencies. Do not install anything or
  // evaluate env files as shell scripts, and do not write credentials to disk.
  const require = createRequire(path.join(apiDirectory, "package.json"));
  let parse;
  try { ({ parse } = require("dotenv")); }
  catch { throw new Error(`Install API dependencies first: npm --prefix "${apiDirectory}" install`); }
  const environments = localEnvironments(
    await readEnvironment(apiDirectory, parse),
    await readEnvironment(mailerDirectory, parse),
    inherited,
  );
  environments.api = configureTestStripe(environments.api);
  const services = [
    { name: "domakin-mailer", cwd: mailerDirectory, port: 6000, env: environments.mailer,
      entry: "node_modules/tsx/dist/cli.mjs", args: ["watch", "app.ts"], health: "/health" },
    { name: "bgsnl-api", cwd: apiDirectory, port: 8080, env: environments.api,
      entry: "node_modules/nodemon/bin/nodemon.js", args: ["--exitcrash", "app.js"], health: "/api/v1" },
    { name: "bgsnl", cwd: directory, port: 3000, env: environments.website,
      entry: "node_modules/next/dist/bin/next", args: ["dev", "--webpack", "--port", "3000"], health: "/login" },
  ];
  for (const service of services) {
    try {
      service.cwd = await realpath(service.cwd);
      await access(path.join(service.cwd, "package.json"));
      await access(path.join(service.cwd, service.entry));
    } catch {
      throw new Error(`${service.name} is missing its checkout or dependencies at ${service.cwd}. Install its dependencies before starting.`);
    }
    service.command = process.execPath;
    service.args = [path.join(service.cwd, service.entry), ...service.args];
  }
  const catalog = JSON.parse(await readFile(path.join(mailerDirectory, "templates/bulgariansociety/manifest.json"), "utf8"));
  const registered = await readFile(path.join(mailerDirectory, "utils/templates.ts"), "utf8");
  const ids = new Set(catalog.templates.map(({ uuid }) => uuid));
  const notificationId = "ccbe1725-0b2c-47a7-b34e-a4f11336c56b";
  if (!ids.has(notificationId) || !registered.includes(notificationId)) {
    throw new Error("Update the Domakin-Mailer checkout with the BGSNL template registration and notification snapshot before starting this stack.");
  }
  const apiDefinitions = await readFile(path.join(apiDirectory, "util/config/defines.js"), "utf8");
  services[0].warnings = [];
  for (const [, name, id] of apiDefinitions.matchAll(/export const (\w*TEMPLATE)\s*=\s*"([^"]+)"/g)) {
    if (/^[0-9a-f-]{36}$/i.test(id)) {
      if (!ids.has(id) || !registered.includes(id)) services[0].warnings.push(`${name} is not available in Domakin Mailer; import/register its snapshot before testing that email flow.`);
    } else if (!environments.api.DOMAKIN_RESEND_TEMPLATE_MAP) {
      services[0].warnings.push(`${name} uses a Resend ID; configure DOMAKIN_RESEND_TEMPLATE_MAP before testing that campaign.`);
    }
  }
  const stripe = stripeService(services[1], inherited);
  if (!inherited.BGSNL_STRIPE_CLI) {
    const localCli = path.resolve(directory, "../.tools/stripe");
    try { await access(localCli); stripe.command = localCli; }
    catch { /* Use the Stripe CLI on PATH when no project-local binary exists. */ }
  }
  await checkStripeCli(stripe.command);
  // Capture the listener's secret before the API imports its Stripe config.
  services.splice(1, 0, stripe);
  return services;
}

export async function listeners(port) {
  if (!Number.isInteger(port) || port < 1024 || port > 65535) throw new Error("Invalid development port.");
  try {
    const { stdout } = await exec("lsof", ["-nP", `-iTCP:${port}`, "-sTCP:LISTEN", "-t"]);
    return [...new Set(stdout.trim().split(/\s+/).filter(Boolean).map(Number))];
  } catch (error) {
    if (error.code === 1 && !error.stdout?.trim() && !error.stderr?.trim()) return [];
    throw new Error(`Cannot inspect port ${port}. Install lsof and run this script with permission to inspect local processes.`);
  }
}

async function processInfo(pid) {
  const { stdout } = await exec("ps", ["-p", String(pid), "-o", "ppid=", "-o", "args="]);
  const match = stdout.trim().match(/^(\d+)\s+(.+)$/s);
  if (!match) throw new Error("Process exited during inspection.");
  const { stdout: cwd } = await exec("lsof", ["-a", "-p", String(pid), "-d", "cwd", "-Fn"]);
  return { parent: Number(match[1]), command: match[2], cwd: cwd.split("\n").find((line) => line.startsWith("n"))?.slice(1) };
}

// A listener's dev watcher can otherwise respawn it after the port was freed.
// Stop only recognized watcher ancestors in the SAME checkout; never a shell,
// editor, terminal, unrelated process group, or every process named node.
async function watcherAncestors(pid) {
  const ancestors = [];
  try {
    const listener = await processInfo(pid);
    let parent = listener.parent;
    for (let depth = 0; depth < 8 && parent > 1 && parent !== process.pid; depth++) {
      const info = await processInfo(parent);
      if (!listener.cwd || info.cwd !== listener.cwd ||
          !/(?:nodemon|tsx[^\n]*\bwatch\b|next[^\n]*\bdev\b|npm (?:run )?dev\b|scripts\/dev-services\.mjs)/.test(info.command)) break;
      ancestors.push(parent);
      parent = info.parent;
    }
  } catch { /* Listener-only cleanup is safe if parent inspection is denied. */ }
  return ancestors;
}

function signal(pid, name) {
  if (!Number.isInteger(pid) || pid <= 1 || pid === process.pid) throw new Error("Refusing to stop an unsafe PID.");
  try { process.kill(pid, name); }
  catch (error) { if (error.code !== "ESRCH") throw new Error(`Cannot stop PID ${pid}: ${error.code}. Stop it manually and rerun.`); }
}

export async function clearPorts(services, { log = console.log, graceMs = 30_000, find = listeners, kill = signal, ancestors = watcherAncestors, sleep = delay } = {}) {
  // Preflight EVERY port before stopping anything.
  const occupied = await Promise.all(services.filter(({ port }) => port != null).map(async ({ port }) => ({ port, pids: await find(port) })));
  for (const { port, pids } of occupied) {
    for (const pid of pids) {
      const parents = await ancestors(pid);
      if (!(await find(port)).includes(pid)) continue;
      log(`Stopping port ${port} listener PID ${pid}${parents.length ? " and its dev watcher" : ""} (SIGTERM).`);
      for (const parent of parents.reverse()) kill(parent, "SIGTERM");
      kill(pid, "SIGTERM");
    }
  }
  const deadline = Date.now() + graceMs;
  while (Date.now() < deadline) {
    if ((await Promise.all(occupied.map(({ port }) => find(port)))).every((pids) => pids.length === 0)) return;
    await sleep(200);
  }
  for (const { port, pids } of occupied) {
    for (const pid of await find(port)) {
      // A replacement PID may belong to something the user just started.
      if (!pids.includes(pid)) throw new Error(`A new process occupied port ${port}. Stop its supervisor and rerun; no replacement process was killed.`);
      log(`Port ${port}: PID ${pid} did not stop gracefully; sending SIGKILL.`);
      kill(pid, "SIGKILL");
    }
  }
  await sleep(300);
  for (const { port } of occupied) {
    if ((await find(port)).length) throw new Error(`Port ${port} is still occupied. No services were started.`);
  }
}

export function localHealthRequest(url, { signal } = {}) {
  return new Promise((resolve, reject) => {
    const request = httpGet(url, { signal }, (response) => {
      const chunks = [];
      response.on("data", (chunk) => chunks.push(chunk));
      response.once("error", reject);
      response.once("end", () => {
        const body = Buffer.concat(chunks).toString("utf8");
        resolve({
          status: response.statusCode || 0,
          ok: response.statusCode >= 200 && response.statusCode < 300,
          json: async () => JSON.parse(body),
          body: { cancel: async () => {} },
        });
      });
    });
    request.once("error", reject);
  });
}

export async function waitForReady(service, { timeoutMs = 120_000, signal: abortSignal, request = localHealthRequest } = {}) {
  const deadline = Date.now() + timeoutMs;
  let status = "not responding";
  while (Date.now() < deadline) {
    abortSignal?.throwIfAborted();
    try {
      const response = await request(`http://127.0.0.1:${service.port}${service.health}`, { signal: AbortSignal.timeout(4000), redirect: "manual" });
      status = `HTTP ${response.status}`;
      if (response.ok) {
        if (service.name === "domakin-mailer" && (await response.json()).service !== "domakin-mailer") {
          throw new Error("Unexpected service on mailer port");
        }
        await response.body?.cancel().catch(() => {});
        return;
      }
      await response.body?.cancel();
    } catch (error) { if (error.message === "Unexpected service on mailer port") throw error; }
    await delay(500, undefined, { signal: abortSignal });
  }
  throw new Error(`${service.name} did not become ready (${status}). Check its logs and local database/email-provider configuration.`);
}

export async function runServices(services, { log = console.log, ready = waitForReady, start = spawn, shutdownMs = 30_000 } = {}) {
  const running = [];
  const abort = new AbortController();
  let finish;
  const finished = new Promise((resolve) => { finish = resolve; });
  let shutdown;
  const stop = (code = 0) => {
    if (shutdown) return shutdown;
    abort.abort();
    shutdown = (async () => {
      log("Stopping local services…");
      for (const { child } of [...running].reverse()) {
        try { process.kill(-child.pid, "SIGTERM"); } catch (error) { if (error.code !== "ESRCH") log(`Could not stop child group ${child.pid}: ${error.code}`); }
      }
      const deadline = Date.now() + shutdownMs;
      const groupAlive = (child) => {
        if (!child.pid) return false;
        try { process.kill(-child.pid, 0); return true; } catch { return false; }
      };
      // A watcher can exit before its worker drains pending requests. Give the
      // entire private process group its grace period, not just the parent.
      while (running.some(({ child }) => groupAlive(child)) && Date.now() < deadline) await delay(100);
      for (const { child } of running) {
        if (groupAlive(child)) {
          try { process.kill(-child.pid, "SIGKILL"); } catch { /* Already stopped. */ }
        }
      }
      await Promise.all(running.map(({ exited }) => exited));
      finish(code);
    })();
    return shutdown;
  };
  const onSignal = () => { void stop(0); };
  process.once("SIGINT", onSignal);
  process.once("SIGTERM", onSignal);
  try {
    for (const service of services) {
      abort.signal.throwIfAborted();
      log(`Starting ${service.name}${service.port ? ` at http://localhost:${service.port}` : service.name === "stripe-webhooks" ? ` → ${STRIPE_FORWARD_URL} (test mode)` : ""}`);
      const child = start(service.command, service.args, { cwd: service.cwd, env: service.env, detached: true, stdio: ["ignore", "pipe", "pipe"] });
      for (const output of service.ready ? [] : [child.stdout, child.stderr]) {
        output?.on("data", (chunk) => process.stdout.write(`[${service.name}] ${chunk}`));
      }
      const exited = new Promise((resolve) => {
        child.once("exit", (code, exitSignal) => {
          resolve();
          if (!abort.signal.aborted) {
            log(`${service.name} exited unexpectedly (${exitSignal || code}); stopping the other services.`);
            void stop(1);
          }
        });
        child.once("error", (error) => {
          resolve();
          log(`Could not start ${service.name}: ${error.code}`);
          void stop(1);
        });
      });
      running.push({ child, exited });
      await (service.ready || ready)(service, { child, signal: abort.signal, log });
      abort.signal.throwIfAborted();
      log(`${service.name} is ready.`);
    }
    log("All services ready. Open http://localhost:3000 — Ctrl+C stops this stack.");
    return await finished;
  } catch (error) {
    if (!abort.signal.aborted) { log(error.message); await stop(1); }
    return await finished;
  } finally {
    process.removeListener("SIGINT", onSignal);
    process.removeListener("SIGTERM", onSignal);
  }
}

export async function main(args = process.argv.slice(2)) {
  if (args.includes("--help")) {
    console.log("npm run dev:all [-- --check]\nStarts Redis :6380 first, then Mailer :6000, Stripe test webhooks, API :8080 and BGSNL :3000. --check only inspects configuration, Stripe CLI availability and occupied ports.\nSet BGSNL_MAILER_DIR if Domakin-Mailer is checked out elsewhere. Set BGSNL_STRIPE_CLI to use a custom Stripe CLI executable.");
    return 0;
  }
  if (args.some((arg) => arg !== "--check")) throw new Error("Unknown option. Use --help.");
  if (!["darwin", "linux"].includes(process.platform)) throw new Error("This launcher requires macOS or Linux (lsof and POSIX process signals).");
  const services = await createServices();
  for (const service of services) {
    for (const warning of service.warnings || []) console.warn(`Email setup warning: ${warning}`);
    if (!service.port) {
      console.log(`${service.name}: Stripe test account → ${STRIPE_FORWARD_URL}`);
      continue;
    }
    const pids = await listeners(service.port);
    console.log(`${service.name}: ${service.cwd} → :${service.port}${pids.length ? ` (will stop PID ${pids.join(", ")})` : " (free)"}`);
  }
  console.log("Local API → http://127.0.0.1:6000/api; channel-scoped mailer key and SSR key matched in memory.");
  console.log("All local Stripe regions use the configured test account. The listener signing secret is injected into the API in memory; no Stripe credentials are written to disk.");
  console.log("Existing database/provider credentials are retained. Triggered emails can reach real recipients. Billing, SES event consumption and email maintenance workers are disabled.");
  if (args.includes("--check")) { console.log("Configuration check passed. No processes stopped or started; network readiness not tested."); return 0; }
  const api = services.find((service) => service.name === "bgsnl-api");
  const { ensureLocalRedis } = await import(pathToFileURL(path.join(api.cwd, "scripts/local-redis.mjs")).href);
  await ensureLocalRedis({ env: api.env });
  console.log("Redis is ready. The local Redis instance stays running when the development stack stops.");
  await clearPorts(services);
  return runServices(services);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().then((code) => { process.exitCode = code; }).catch((error) => { console.error(error.message); process.exitCode = 1; });
}
