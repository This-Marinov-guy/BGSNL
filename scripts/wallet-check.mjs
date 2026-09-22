import { readFileSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { X509Certificate, createPrivateKey } from "node:crypto";
import nextEnv from "@next/env";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
nextEnv.loadEnvConfig(root, true, { info() {}, error() {} });
const env = process.env;
let blocked = false;
function check(label, ok) {
  console.log(`${ok ? "OK" : "MISSING/INVALID"} ${label}`);
  if (!ok) blocked = true;
}
function privateFile(key) {
  if (!env[key]) return null;
  const file = resolve(root, env[key]);
  // Refuse credentials inside public assets.
  if (file === resolve(root, "public") || file.startsWith(`${resolve(root, "public")}/`)) return null;
  try { return readFileSync(file); } catch { return null; }
}

console.log("Wallet local configuration (no secrets displayed; no remote writes)");
check("v1 specification", existsSync(resolve(root, "public/assets/wallet-cards/v1/specifications.json")));
check("Archive font", existsSync(resolve(root, "public/assets/fonts/Archive-Regular.ttf")));
check("League Spartan font", existsSync(resolve(root, "public/assets/fonts/LeagueSpartan.ttf")));
check("Apple team ID", /^[A-Z0-9]{10}$/.test(env.APPLE_WALLET_TEAM_ID || ""));
check("Apple pass type ID", /^pass\.[a-zA-Z0-9.-]+$/.test(env.APPLE_WALLET_PASS_TYPE_ID || ""));
let certificate, privateKey;
try { certificate = new X509Certificate(privateFile("APPLE_WALLET_CERT_PATH")); } catch { /* Report below. */ }
try { privateKey = createPrivateKey(privateFile("APPLE_WALLET_KEY_PATH")); } catch { /* Report below. */ }
check("Apple signing certificate, current validity", Boolean(certificate && Date.parse(certificate.validFrom) <= Date.now() && Date.parse(certificate.validTo) > Date.now()));
check("Apple private key matches certificate", Boolean(certificate && privateKey && certificate.checkPrivateKey(privateKey)));
let wwdr;
try { wwdr = new X509Certificate(privateFile("APPLE_WALLET_WWDR_PATH")); } catch { /* Report below. */ }
check("Apple WWDR certificate", Boolean(wwdr));
check("Google Wallet issuer ID", /^\d+$/.test(env.GOOGLE_WALLET_ISSUER_ID || ""));
let serviceAccount;
try {
  const data = JSON.parse(privateFile("GOOGLE_WALLET_SERVICE_ACCOUNT_PATH"));
  const key = createPrivateKey(data.private_key);
  serviceAccount = data.type === "service_account" && /@.+\.iam\.gserviceaccount\.com$/.test(data.client_email) && key.asymmetricKeyType === "rsa";
} catch { /* Report below. */ }
check("Google service-account JSON and RSA key", Boolean(serviceAccount));
console.log("Manual checks still required: Apple certificate identity/chain; Google API enabled, issuer access and demo tester accounts.");
console.log("Preview: http://localhost:3000/dev/wallet-card");
console.log("Phone QR scans require a reachable test base URL; localhost means the phone itself.");
console.log("This check does not generate, sign or issue passes.");
process.exitCode = blocked ? 1 : 0;
