import { createHash } from "node:crypto";
import { readFile, writeFile, access } from "node:fs/promises";
import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

export async function dependencyFingerprint(directory) {
  const hash = createHash("sha256");
  hash.update(`${process.platform}:${process.arch}:${process.versions.modules}:`);
  for (const file of ["package.json", "package-lock.json"]) hash.update(await readFile(path.join(directory, file)));
  return hash.digest("hex");
}

export async function ensureDependencies(directory) {
  const fingerprint = await dependencyFingerprint(directory);
  const stamp = path.join(directory, "node_modules/.bgsnl-dev-dependencies");
  try {
    if ((await readFile(stamp, "utf8")) === fingerprint) {
      await access(path.join(directory, "node_modules/.package-lock.json"));
      return;
    }
  } catch { /* A new volume or changed lockfile needs Linux dependencies. */ }
  console.log(`Installing development dependencies for ${path.basename(directory)}…`);
  await new Promise((resolve, reject) => {
    const child = spawn("npm", ["ci", "--include=dev", "--no-audit", "--no-fund"], { cwd: directory, stdio: "inherit" });
    child.once("error", reject);
    child.once("exit", (code) => code === 0 ? resolve() : reject(new Error(`npm ci failed for ${directory} (${code})`)));
  });
  await writeFile(stamp, fingerprint);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  for (const directory of ["/workspace/BGSNL", "/workspace/BGSNL-API", "/workspace/Domakin-Mailer"]) await ensureDependencies(directory);
}
