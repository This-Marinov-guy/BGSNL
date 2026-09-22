import { execFile } from "node:child_process";
import { promisify } from "node:util";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { writeFile, rm } from "node:fs/promises";
import { setTimeout as delay } from "node:timers/promises";
import { ensureDependencies } from "./dependencies.mjs";
import { createServices, runServices, waitForReady } from "../../scripts/dev-services.mjs";

const exec = promisify(execFile);
const readyFile = "/tmp/bgsnl-dev-ready";

export async function waitForRedis(_service, { signal }) {
  const deadline = Date.now() + 15000;
  while (Date.now() < deadline) {
    signal.throwIfAborted();
    try {
      const { stdout } = await exec("redis-cli", ["-h", "127.0.0.1", "-p", "6380", "ping"], { signal, timeout: 2000 });
      if (stdout.trim() === "PONG") return;
    } catch { signal.throwIfAborted(); }
    await delay(200, undefined, { signal });
  }
  throw new Error("Container Redis did not become ready.");
}

export function waitForWorker(_service, { child, signal, log }) {
  return new Promise((resolve, reject) => {
    let pending = "";
    let settled = false;
    const done = (error) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      signal.removeEventListener("abort", abort);
      child.removeListener("exit", exited);
      child.removeListener("error", failed);
      if (error) reject(error); else resolve();
    };
    const abort = () => done(new Error("Worker startup cancelled."));
    const exited = () => done(new Error("Worker exited before startup completed."));
    const failed = () => done(new Error("Worker could not start."));
    const timer = setTimeout(() => done(new Error("Worker startup timed out.")), 120000);
    signal.addEventListener("abort", abort, { once: true });
    child.once("exit", exited);
    child.once("error", failed);
    for (const output of [child.stdout, child.stderr]) {
      output.on("data", (chunk) => {
        log(`[bgsnl-worker] ${chunk}`);
        pending = (pending + chunk).slice(-8192);
        if (pending.includes("BGSNL spreadsheet synchronization worker is running.")) done();
      });
    }
    if (signal.aborted) abort();
  });
}

export async function containerServices() {
  const services = await createServices({ inherited: {
    ...process.env,
    BGSNL_MAILER_DIR: "/workspace/Domakin-Mailer",
    BGSNL_STRIPE_CLI: "/usr/local/bin/stripe",
    BGSNL_REDIS_URL: "redis://127.0.0.1:6380/0",
    BGSNL_REDIS_PREFIX: "bgsnl:docker-development:v1:",
  } });
  const stripe = services.find(({ name }) => name === "stripe-webhooks");
  // Stripe CLI 1.51 requires an explicit event selection.
  stripe.args.push("--all-snapshot");
  const api = services.find(({ name }) => name === "bgsnl-api");
  const website = services.find(({ name }) => name === "bgsnl");
  const mailer = services.find(({ name }) => name === "domakin-mailer");
  mailer.args.splice(2, 0, "--include", "templates/**/*", "--include", "openapi/**/*");
  // Do not pass --hostname: Next builds each request's absolute URL from the
  // bound hostname, so "0.0.0.0" would make every /api/* call fail the website
  // origin check. Omitting it still listens on every interface for the
  // published port while keeping the origin at http://localhost:3000.
  api.args.splice(1, 0, "--legacy-watch");
  const worker = {
    name: "bgsnl-worker", cwd: api.cwd, env: api.env, command: process.execPath,
    args: [api.args[0], "--legacy-watch", "--exitcrash", "workers.js"], ready: waitForWorker,
  };
  services.splice(services.indexOf(website), 0, worker);
  services.unshift({
    name: "redis", cwd: "/data/redis", env: process.env, command: "redis-server",
    args: ["--bind", "127.0.0.1", "--port", "6380", "--protected-mode", "yes", "--appendonly", "yes", "--appendfsync", "everysec", "--dir", "/data/redis", "--maxmemory", "256mb", "--maxmemory-policy", "noeviction"],
    ready: async (service, options) => {
      for (const output of [options.child.stdout, options.child.stderr]) output.on("data", (chunk) => options.log(`[redis] ${chunk}`));
      await waitForRedis(service, options);
    },
  });
  return services;
}

async function main() {
  await rm(readyFile, { force: true });
  for (const directory of ["/workspace/BGSNL", "/workspace/BGSNL-API", "/workspace/Domakin-Mailer"]) await ensureDependencies(directory);
  const services = await containerServices();
  for (const service of services) for (const warning of service.warnings || []) console.warn(`Email setup warning: ${warning}`);
  try {
    return await runServices(services, { ready: async (service, options) => {
      await waitForReady(service, { ...options, timeoutMs: 240000 });
      if (service.name === "bgsnl") await writeFile(readyFile, "ready");
    } });
  } finally { await rm(readyFile, { force: true }); }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().then((code) => { process.exitCode = code; }).catch((error) => { console.error(error.message); process.exitCode = 1; });
}
