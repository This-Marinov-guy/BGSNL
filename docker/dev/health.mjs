import { access } from "node:fs/promises";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { localHealthRequest } from "../../scripts/dev-services.mjs";

try {
  await access("/tmp/bgsnl-dev-ready");
  const { stdout } = await promisify(execFile)("redis-cli", ["-p", "6380", "ping"], { timeout: 2000 });
  if (stdout.trim() !== "PONG") throw new Error("Redis unavailable");
  await Promise.all(["http://127.0.0.1:3000/login", "http://127.0.0.1:8080/api/v1", "http://127.0.0.1:6000/health"].map(async (url) => {
    const response = await localHealthRequest(url, { signal: AbortSignal.timeout(7000) });
    await response.body?.cancel();
    if (!response.ok) throw new Error("Service unavailable");
  }));
} catch { process.exitCode = 1; }
