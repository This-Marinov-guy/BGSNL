// Server-only by construction: Node crypto/filesystem must never enter a client bundle.
import { readFile, realpath } from "node:fs/promises";
import { createPrivateKey, X509Certificate, sign } from "node:crypto";
import path from "node:path";
import { PKPass } from "passkit-generator";
import { GoogleAuth } from "google-auth-library";
import sharp from "sharp";

export const WALLET_ORIGIN = "https://bulgariansociety.nl";
// Version the approved layout instead of changing every installed pass's class
// as a side effect of a single member clicking Add to Wallet.
export const GOOGLE_WALLET_TEMPLATE = "bgsnl_membership_v2";
export const walletResponseHeaders = { "Cache-Control": "private, no-store", "X-Robots-Tag": "noindex, nofollow", "Referrer-Policy": "no-referrer", "X-Content-Type-Options": "nosniff" };
export async function walletSecret(env, name) {
  if (env[`${name}_BASE64`]) {
    const encoded = env[`${name}_BASE64`];
    if (encoded.length > 1024 * 1024 || !/^[A-Za-z0-9+/]+={0,2}$/.test(encoded)) throw new Error("Invalid wallet credential encoding");
    return Buffer.from(encoded, "base64");
  }
  if (!env[`${name}_PATH`]) throw new Error("Missing wallet credential");
  const file = await realpath(path.resolve(env[`${name}_PATH`]));
  const publicRoot = await realpath(path.resolve("public"));
  if (file === publicRoot || file.startsWith(`${publicRoot}${path.sep}`)) throw new Error("Wallet credentials must not be public");
  return readFile(file);
}

export async function appleCredentials(env = process.env) {
  if (!/^[A-Z0-9]{10}$/.test(env.APPLE_WALLET_TEAM_ID || "") || !/^pass\.[a-zA-Z0-9.-]+$/.test(env.APPLE_WALLET_PASS_TYPE_ID || "")) throw new Error("Invalid Apple Wallet identity");
  const [signerCert, signerKey, wwdr] = await Promise.all([walletSecret(env, "APPLE_WALLET_CERT"), walletSecret(env, "APPLE_WALLET_KEY"), walletSecret(env, "APPLE_WALLET_WWDR")]);
  const cert = new X509Certificate(signerCert), intermediate = new X509Certificate(wwdr);
  const key = createPrivateKey({ key: signerKey, passphrase: env.APPLE_WALLET_KEY_PASSPHRASE });
  if (Date.parse(cert.validFrom) > Date.now() || Date.parse(cert.validTo) <= Date.now() ||
    Date.parse(intermediate.validFrom) > Date.now() || Date.parse(intermediate.validTo) <= Date.now() || !intermediate.ca || !cert.verify(intermediate.publicKey) ||
    !cert.checkPrivateKey(key) || !cert.subject.split("\n").includes(`UID=${env.APPLE_WALLET_PASS_TYPE_ID}`) ||
    !cert.subject.split("\n").includes(`OU=${env.APPLE_WALLET_TEAM_ID}`)) throw new Error("Invalid Apple Wallet configuration");
  return { signerCert, signerKey, wwdr, signerKeyPassphrase: env.APPLE_WALLET_KEY_PASSPHRASE };
}
export async function googleCredentials(env = process.env) {
  const credentials = JSON.parse((await walletSecret(env, "GOOGLE_WALLET_SERVICE_ACCOUNT")).toString("utf8"));
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
  try { await appleCredentials(env); result.apple.available = env.APPLE_WALLET_ENABLED !== "0"; } catch { /* Never leak configuration details. */ }
  try {
    await googleCredentials(env);
    // Explicit rollout gates distinguish credentials from issuer authorization.
    result.google.available = env.GOOGLE_WALLET_ENABLED !== "0" && env.GOOGLE_WALLET_ISSUER_ACCESS_VERIFIED === "1" &&
      (env.NODE_ENV !== "production" || env.GOOGLE_WALLET_PUBLISHING_APPROVED === "1");
  } catch { /* Fail closed. */ }
  return result;
}

async function appleWordmark(logo, scale) {
  const width = 160 * scale;
  const height = 50 * scale;
  const mark = await sharp(logo).resize(46 * scale, 46 * scale, { fit: "contain", background: "#00000000" }).png().toBuffer();
  const title = Buffer.from(`<svg width="${width}" height="${height}" viewBox="0 0 160 50" xmlns="http://www.w3.org/2000/svg">
    <text x="51" y="22" fill="#000000" font-family="Arial, sans-serif" font-size="13" font-weight="700">Bulgarian Society</text>
    <text x="51" y="39" fill="#000000" font-family="Arial, sans-serif" font-size="13" font-weight="700">Netherlands</text>
  </svg>`);
  return sharp({ create: { width, height, channels: 4, background: "#00000000" } })
    .composite([{ input: mark, left: 0, top: 2 * scale }, { input: title, left: 0, top: 0 }]).png().toBuffer();
}

export async function createApplePass(packet, env = process.env) {
  validatePacket(packet);
  const certs = await appleCredentials(env);
  const logo = await readFile(path.join(process.cwd(), "public/assets/images/logo/logo-nl-circle.png"));
  const buffers = {};
  for (const scale of [1, 2, 3]) {
    buffers[`icon${scale === 1 ? "" : `@${scale}x`}.png`] = await sharp(logo).resize(29 * scale, 29 * scale, { fit: "contain", background: "#00000000" }).png().toBuffer();
    buffers[`logo${scale === 1 ? "" : `@${scale}x`}.png`] = await appleWordmark(logo, scale);
  }
  const pass = new PKPass(buffers, certs, {
    formatVersion: 1, passTypeIdentifier: env.APPLE_WALLET_PASS_TYPE_ID, teamIdentifier: env.APPLE_WALLET_TEAM_ID,
    serialNumber: `bgsnl-${packet.token}`, organizationName: "Bulgarian Society Netherlands", description: "BGSNL membership card",
    foregroundColor: "rgb(64, 99, 69)", backgroundColor: "rgb(213, 226, 215)", labelColor: "rgb(38, 38, 38)",
    sharingProhibited: true, voided: packet.card.status !== "active",
  });
  pass.type = "generic";
  pass.primaryFields.push({ key: "name", value: `${packet.card.firstName} ${packet.card.surname}`, textAlignment: "PKTextAlignmentCenter" });
  pass.secondaryFields.push({ key: "membership", label: "MEMBERSHIP", value: packet.card.membershipLabel, textAlignment: "PKTextAlignmentCenter" });
  pass.backFields.push({ key: "verify", label: "Live membership card", value: packet.publicUrl },
    { key: "notice", label: "Verification", value: "Scan the QR code for current Active / Locked status. This saved pass is not proof of current benefits." });
  pass.setBarcodes({ format: "PKBarcodeFormatQR", message: packet.publicUrl, messageEncoding: "iso-8859-1" });
  return pass.getAsBuffer();
}

export function googleClass(env = process.env) {
  const row = (id) => ({ oneItem: { item: { firstValue: { fields: [{ fieldPath: `object.textModulesData['${id}']` }] } } } });
  return {
    id: `${env.GOOGLE_WALLET_ISSUER_ID}.${GOOGLE_WALLET_TEMPLATE}`,
    classTemplateInfo: {
      cardTemplateOverride: { cardRowTemplateInfos: [row("membership")] },
      detailsTemplateOverride: { detailsItemInfos: [
        { item: { firstValue: { fields: [{ fieldPath: "object.textModulesData['notice']" }] } } },
        { item: { firstValue: { fields: [{ fieldPath: "object.linksModuleData.uris['card']" }] } } },
      ] },
    },
  };
}

export function googleObject(packet, env = process.env) {
  validatePacket(packet);
  const localized = (value) => ({ defaultValue: { language: "en", value } });
  const issuer = env.GOOGLE_WALLET_ISSUER_ID;
  return {
    id: `${issuer}.bgsnl_v2_${packet.token}`, classId: `${issuer}.${GOOGLE_WALLET_TEMPLATE}`, state: packet.card.status === "active" ? "ACTIVE" : "INACTIVE",
    cardTitle: localized("Bulgarian society Netherlands"), header: localized(`${packet.card.firstName} ${packet.card.surname}`),
    hexBackgroundColor: "#D5E2D7",
    logo: { sourceUri: { uri: `${WALLET_ORIGIN}/assets/images/logo/logo-nl-circle.png` }, contentDescription: localized("Bulgarian Society Netherlands") },
    barcode: { type: "QR_CODE", value: packet.publicUrl },
    textModulesData: [
      { id: "membership", header: "MEMBERSHIP", body: packet.card.membershipLabel },
      { id: "notice", header: "Verification", body: "Scan the QR code for current Active / Locked status. This saved pass is not proof of current benefits." },
    ],
    linksModuleData: { uris: [{ id: "card", uri: packet.publicUrl, description: "BGSNL membership card" }] },
  };
}
export async function createGoogleSaveUrl(packet, env = process.env) {
  validatePacket(packet);
  const credentials = await googleCredentials(env);
  const client = await new GoogleAuth({ credentials, scopes: ["https://www.googleapis.com/auth/wallet_object.issuer"] }).getClient();
  const objectId = await prepareGooglePass(client, packet, env);
  return signGoogleSaveUrl(objectId, credentials);
}

export async function prepareGooglePass(client, packet, env = process.env, signal = AbortSignal.timeout(20000)) {
  const object = googleObject(packet, env);
  const base = "https://walletobjects.googleapis.com/walletobjects/v1";
  const request = (options) => {
    signal.throwIfAborted();
    return client.request({ ...options, signal, timeout: 8000, retry: false });
  };
  async function ensure(resource, id, body) {
    try { await request({ url: `${base}/${resource}/${id}` }); }
    catch (error) {
      if (error.response?.status !== 404) throw new Error("Google Wallet issuer access could not be verified");
      try { await request({ url: `${base}/${resource}`, method: "POST", data: body }); }
      catch (creation) { if (creation.response?.status !== 409) throw new Error("Google Wallet could not create the pass"); }
    }
  }
  const template = googleClass(env);
  await ensure("genericClass", object.classId, template);
  await ensure("genericObject", object.id, object);
  // Clear the legacy subheader now that membership has its own labelled row.
  await request({ url: `${base}/genericObject/${object.id}`, method: "PATCH", data: { ...object, subheader: null } });
  return object.id;
}

export function signGoogleSaveUrl(objectId, credentials) {
  const encode = (value) => Buffer.from(JSON.stringify(value)).toString("base64url");
  const body = `${encode({ alg: "RS256", typ: "JWT" })}.${encode({ iss: credentials.client_email, aud: "google", typ: "savetowallet",
    iat: Math.floor(Date.now() / 1000), origins: [WALLET_ORIGIN, "https://www.bulgariansociety.nl"], payload: { genericObjects: [{ id: objectId }] } })}`;
  return `https://pay.google.com/gp/v/save/${body}.${sign("RSA-SHA256", Buffer.from(body), credentials.private_key).toString("base64url")}`;
}
