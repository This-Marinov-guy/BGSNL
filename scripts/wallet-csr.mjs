import { generateKeyPairSync } from "node:crypto";
import { mkdirSync, writeFileSync, existsSync, chmodSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const directory = resolve(root, ".wallet-local/apple");
const keyPath = resolve(directory, "pass-key.pem");
const csrPath = resolve(directory, "pass.csr");
if (existsSync(keyPath) || existsSync(csrPath)) {
  console.error("Stopped: an Apple key or CSR already exists. Existing signing material was not changed.");
  process.exitCode = 1;
} else {
  const openssl = process.platform === "darwin" ? "/usr/bin/openssl" : "openssl";
  const available = spawnSync(openssl, ["version"], { stdio: "ignore" });
  if (available.status !== 0) throw new Error("OpenSSL is required to create the CSR.");
  mkdirSync(directory, { recursive: true, mode: 0o700 });
  chmodSync(directory, 0o700);
  const { privateKey } = generateKeyPairSync("rsa", {
    modulusLength: 2048,
    privateKeyEncoding: { type: "pkcs8", format: "pem" },
    publicKeyEncoding: { type: "spki", format: "pem" },
  });
  writeFileSync(keyPath, privateKey, { flag: "wx", mode: 0o600 });
  const result = spawnSync(openssl, [
    "req", "-new", "-sha256", "-key", keyPath, "-out", csrPath,
    "-subj", "/CN=BGSNL Membership Test/O=Bulgarian Society Netherlands/C=NL",
  ], { stdio: "ignore" });
  if (result.status !== 0) throw new Error("CSR generation failed. The new private key is preserved; do not overwrite it.");
  chmodSync(csrPath, 0o600);
  console.log("Created .wallet-local/apple/pass.csr for upload to Apple.");
  console.log("Private key retained in .wallet-local/apple/pass-key.pem (owner-only permissions). Do not upload or share it.");
}
