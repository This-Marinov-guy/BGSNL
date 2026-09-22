#!/usr/bin/env node
import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const directory = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
export const commands = Object.freeze({
  up: ["up", "--detach", "--wait", "--wait-timeout", "300"],
  stop: ["stop"],
  down: ["down"],
  logs: ["logs", "--follow", "--tail", "100"],
  status: ["ps"],
  build: ["build"],
  restart: ["restart"],
  "--check": ["config", "--quiet"],
});

export async function main(args = process.argv.slice(2)) {
  const command = args[0] || "up";
  if (command === "--help") {
    console.log("node start-local.mjs [up|stop|down|logs|status|build|restart|--check]\nOne container: website :3000, API :8080, Mailer :6000, Redis, spreadsheet worker and Stripe test webhooks.\nSource edits hot reload. stop/down preserve Redis and dependency volumes. --check validates Compose without starting anything.");
    return 0;
  }
  if (args.length > 1 || !commands[command]) throw new Error("Unknown option. Use --help.");
  return new Promise((resolve, reject) => {
    const child = spawn("docker", ["compose", "--project-directory", directory, "-f", path.join(directory, "compose.dev.yml"), ...commands[command]], { cwd: directory, stdio: "inherit" });
    child.once("error", () => reject(new Error("Docker is required. Start Docker Desktop and try again.")));
    child.once("exit", (code) => resolve(code ?? 1));
  });
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().then((code) => { process.exitCode = code; }).catch((error) => { console.error(error.message); process.exitCode = 1; });
}
