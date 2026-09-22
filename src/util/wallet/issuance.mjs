// Server-only by construction: Node crypto/filesystem must never enter a client bundle.
import { readFile } from "node:fs/promises";
import { createPrivateKey, X509Certificate, sign } from "node:crypto";
import path from "node:path";
import { PKPass } from "passkit-generator";
import { GoogleAuth } from "google-auth-library";
import sharp from "sharp";

export const WALLET_ORIGIN = "https://bulgariansociety.nl";
export const walletResponseHeaders = { "Cache-Control": "private, no-store", "X-Robots-Tag": "noindex, nofollow", "Referrer-Policy": "no-referrer", "X-Content-Type-Options": "nosniff" };
const secret = async (env, name) => env[`${name}_BASE64`] ? Buffer.from(env[`${name}_BASE64`], "base64")
  : readFile(path.resolve(env[`${name}_PATH`] || "__missing_wallet_secret__"));

export async function appleCredentials(env = process.env) {
  const [signerCert, signerKey, wwdr] = await Promise.all([secret(env, "APPLE_WALLET_CERT"), secret(env, "APPLE_WALLET_KEY"), secret(env, "APPLE_WALLET_WWDR")]);
  const cert = new X509Certificate(signerCert), intermediate = new X509Certificate(wwdr);
  const key = createPrivateKey({ key: signerKey, passphrase: env.APPLE_WALLET_KEY_PASSPHRASE });
  if (Date.parse(cert.validFrom) > Date.now() || Date.parse(cert.validTo) <= Date.now() ||
    Date.parse(intermediate.validTo) <= Date.now() || !cert.verify(intermediate.publicKey) ||
    !cert.checkPrivateKey(key) || !cert.subject.split("\n").includes(`UID=${env.APPLE_WALLET_PASS_TYPE_ID}`) ||
    !cert.subject.split("\n").includes(`OU=${env.APPLE_WALLET_TEAM_ID}`)) throw new Error("Invalid Apple Wallet configuration");
  return { signerCert, signerKey, wwdr, signerKeyPassphrase: env.APPLE_WALLET_KEY_PASSPHRASE };
}
export async function googleCredentials(env = process.env) {
  const credentials = JSON.parse((await secret(env, "GOOGLE_WALLET_SERVICE_ACCOUNT")).toString("utf8"));
  if (credentials.type !== "service_account" || !/^[^@]+@[^@]+\.iam\.gserviceaccount\.com$/.test(credentials.client_email || "") ||
    createPrivateKey(credentials.private_key).asymmetricKeyType !== "rsa" || !/^\d+$/.test(env.GOOGLE_WALLET_ISSUER_ID || "")) throw new Error("Invalid Google Wallet configuration");
  return credentials;
}
export function validatePacket(packet) {
  if (!packet?.card || !/^[A-Za-z0-9_-]{22}$/.test(packet.token || "") || packet.publicUrl !== `${WALLET_ORIGIN}/c/${packet.token}` ||
    !["active", "locked"].includes(packet.card.status) || !["firstName", "surname", "membershipLabel"].every((key) => typeof packet.card[key] === "string" && packet.card[key].length <= 200)) {
    throw new Error("Invalid membership card");
  }
  return packet;
}

// The authentication proxy intentionally strips top-level `token` fields.
// Recover the public card identifier from its canonical URL, never relax that
// credential filter or depend on a browser-supplied identifier.
export function walletPacketFromProxy(packet) {
  const token = typeof packet?.publicUrl === "string"
    ? packet.publicUrl.match(/^https:\/\/bulgariansociety\.nl\/c\/([A-Za-z0-9_-]{22})$/)?.[1] : undefined;
  return validatePacket({ ...packet, token });
}

export async function walletReadiness(env = process.env) {
  const enabled = env.WALLET_ISSUANCE_ENABLED === "1";
  const result = { apple: { available: false }, google: { available: false } };
  if (!enabled) return result;
  try { await appleCredentials(env); result.apple.available = true; } catch { /* Never leak configuration details. */ }
  try {
    await googleCredentials(env);
    // Explicit rollout gates distinguish credentials from issuer authorization.
    result.google.available = env.GOOGLE_WALLET_ISSUER_ACCESS_VERIFIED === "1" &&
      (env.NODE_ENV !== "production" || env.GOOGLE_WALLET_PUBLISHING_APPROVED === "1");
  } catch { /* Fail closed. */ }
  return result;
}

export async function createApplePass(packet, env = process.env) {
  validatePacket(packet);
  const certs = await appleCredentials(env);
  const logo = await readFile(path.join(process.cwd(), "public/assets/images/logo/logo-nl.png"));
  const buffers = {};
  for (const scale of [1, 2, 3]) {
    buffers[`icon${scale === 1 ? "" : `@${scale}x`}.png`] = await sharp(logo).resize(29 * scale, 29 * scale, { fit: "contain", background: "#00000000" }).png().toBuffer();
    buffers[`logo${scale === 1 ? "" : `@${scale}x`}.png`] = await sharp(logo).resize(50 * scale, 50 * scale, { fit: "contain", background: "#00000000" }).png().toBuffer();
  }
  const pass = new PKPass(buffers, certs, {
    formatVersion: 1, passTypeIdentifier: env.APPLE_WALLET_PASS_TYPE_ID, teamIdentifier: env.APPLE_WALLET_TEAM_ID,
    serialNumber: `bgsnl-${packet.token}`, organizationName: "Bulgarian Society Netherlands", description: "BGSNL membership card",
    logoText: "BGSNL", foregroundColor: "rgb(64, 99, 69)", backgroundColor: "rgb(213, 226, 215)", labelColor: "rgb(38, 38, 38)",
    sharingProhibited: true,
  });
  pass.type = "generic";
  pass.primaryFields.push({ key: "name", label: "MEMBER", value: `${packet.card.firstName} ${packet.card.surname}` });
  pass.secondaryFields.push({ key: "membership", label: "MEMBERSHIP", value: packet.card.membershipLabel });
  // Installed passes are snapshots. Never present a stale Active badge as live verification.
  pass.auxiliaryFields.push({ key: "verification", label: "CURRENT STATUS", value: "Scan to verify" });
  pass.backFields.push({ key: "verify", label: "Live membership card", value: packet.publicUrl },
    { key: "notice", label: "Verification", value: "Scan the QR code for current Active / Locked status. This saved pass is not proof of current benefits." });
  pass.setBarcodes({ format: "PKBarcodeFormatQR", message: packet.publicUrl, messageEncoding: "iso-8859-1" });
  return pass.getAsBuffer();
}

export function googleObject(packet, env = process.env) {
  validatePacket(packet);
  const localized = (value) => ({ defaultValue: { language: "en", value } });
  const issuer = env.GOOGLE_WALLET_ISSUER_ID;
  return {
    id: `${issuer}.bgsnl_${packet.token}`, classId: `${issuer}.bgsnl_membership_v1`, state: "ACTIVE",
    cardTitle: localized("Bulgarian Society Netherlands"), header: localized(`${packet.card.firstName} ${packet.card.surname}`),
    subheader: localized(packet.card.membershipLabel), hexBackgroundColor: "#D5E2D7",
    logo: { sourceUri: { uri: `${WALLET_ORIGIN}/assets/images/logo/logo-nl.png` }, contentDescription: localized("BGSNL") },
    barcode: { type: "QR_CODE", value: packet.publicUrl },
    textModulesData: [{ id: "verification", header: "Current membership status", body: "Scan to verify Active / Locked status. This saved card is not proof of current benefits." }],
    linksModuleData: { uris: [{ id: "card", uri: packet.publicUrl, description: "View current membership card" }] },
  };
}
export async function createGoogleSaveUrl(packet, env = process.env) {
  const credentials = await googleCredentials(env);
  const client = await new GoogleAuth({ credentials, scopes: ["https://www.googleapis.com/auth/wallet_object.issuer"] }).getClient();
  const object = googleObject(packet, env);
  const base = "https://walletobjects.googleapis.com/walletobjects/v1";
  async function ensure(resource, id, body) {
    try { await client.request({ url: `${base}/${resource}/${id}`, timeout: 15000 }); }
    catch (error) {
      if (error.response?.status !== 404) throw new Error("Google Wallet issuer access could not be verified");
      try { await client.request({ url: `${base}/${resource}`, method: "POST", data: body, timeout: 15000 }); }
      catch (creation) { if (creation.response?.status !== 409) throw new Error("Google Wallet could not create the pass"); }
    }
  }
  await ensure("genericClass", object.classId, { id: object.classId });
  await ensure("genericObject", object.id, object);
  await client.request({ url: `${base}/genericObject/${object.id}`, method: "PATCH", data: object, timeout: 15000 });
  return signGoogleSaveUrl(object.id, credentials);
}

export function signGoogleSaveUrl(objectId, credentials) {
  const encode = (value) => Buffer.from(JSON.stringify(value)).toString("base64url");
  const body = `${encode({ alg: "RS256", typ: "JWT" })}.${encode({ iss: credentials.client_email, aud: "google", typ: "savetowallet",
    iat: Math.floor(Date.now() / 1000), origins: [WALLET_ORIGIN, "https://www.bulgariansociety.nl"], payload: { genericObjects: [{ id: objectId }] } })}`;
  return `https://pay.google.com/gp/v/save/${body}.${sign("RSA-SHA256", Buffer.from(body), credentials.private_key).toString("base64url")}`;
}
