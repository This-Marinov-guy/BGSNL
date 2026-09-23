import { existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { X509Certificate } from "node:crypto";
import nextEnv from "@next/env";
import { appleCredentials, googleCredentials, walletReadiness } from "../src/util/wallet/issuance.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const production = process.argv.includes("--production");
if (process.argv.slice(2).some(arg => arg !== "--production")) throw new Error("Usage: node scripts/wallet-check.mjs [--production]");
process.chdir(root);
process.env.NODE_ENV = production ? "production" : "development";
nextEnv.loadEnvConfig(root, !production, { info() {}, error() {} });
const env = process.env;
let blocked = false;
function check(label, ok) {
  console.log(`${ok ? "OK" : "MISSING/INVALID"} ${label}`);
  if (!ok) blocked = true;
}
console.log(`Wallet ${production ? "production" : "development"} configuration (no secrets displayed; no remote writes)`);
check("v1 specification", existsSync(resolve(root, "public/assets/wallet-cards/v1/specifications.json")));
check("Archive font", existsSync(resolve(root, "public/assets/fonts/Archive-Regular.ttf")));
check("League Spartan font", existsSync(resolve(root, "public/assets/fonts/LeagueSpartan.ttf")));
check("Native wallet logo", existsSync(resolve(root, "public/assets/images/logo/logo-nl-circle.png")));
let apple;
try { apple = await appleCredentials(env); } catch { /* Never print credential-bearing errors. */ }
check("Apple certificate validity, identity, WWDR signature and matching key", Boolean(apple));
if (apple) {
  const expires = new X509Certificate(apple.signerCert).validTo;
  console.log(`Apple signing certificate expires: ${expires}`);
  if (Date.parse(expires) - Date.now() < 30 * 86400000) console.log("WARNING: Renew Apple signing certificate within 30 days.");
}
let google;
try { google = await googleCredentials(env); } catch { /* Never print credential-bearing errors. */ }
check("Google issuer ID, service account and RSA key", Boolean(google));
if (production) {
  check("Production Apple identifier", env.APPLE_WALLET_PASS_TYPE_ID === "pass.nl.bulgariansociety.membership");
  check("Google publishing approval flag", env.GOOGLE_WALLET_PUBLISHING_APPROVED === "1");
  const ready = await walletReadiness(env);
  check("Apple issuance enabled", ready.apple.available);
  check("Google issuance enabled and issuer access verified", ready.google.available);
}
console.log("Supports private files or BASE64 secret-store values, including encrypted Apple keys.");
console.log("Still required: live issuer access, deployed QR page/logo, and Apple/Android device installation.");
console.log("No passes issued or updated. Automatic updates remain excluded.");
process.exitCode = blocked ? 1 : 0;
