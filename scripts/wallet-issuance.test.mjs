import test from "node:test";
import assert from "node:assert/strict";
import { createHash, generateKeyPairSync, verify } from "node:crypto";
import { mkdtemp, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import nextEnv from "@next/env";
import { createApplePass, googleObject, signGoogleSaveUrl, validatePacket, walletPacketFromProxy, walletReadiness } from "../src/util/wallet/issuance.mjs";

const packet = { token: "abcdefghijklmnopqrstuv", publicUrl: "https://bulgariansociety.nl/c/abcdefghijklmnopqrstuv",
  card: { firstName: "Test", surname: "Member", membershipLabel: "Member of Groningen", status: "active" } };

test("proxy packet recovery only accepts canonical public card URLs", () => {
  const { token, ...filtered } = packet;
  assert.equal(walletPacketFromProxy(filtered).token, token);
  for (const publicUrl of [undefined, "https://evil.test/c/abcdefghijklmnopqrstuv", `${packet.publicUrl}?x=1`, `${packet.publicUrl}/`, `${packet.publicUrl}#test`]) {
    assert.throws(() => walletPacketFromProxy({ ...filtered, publicUrl }));
  }
});

test("issuance only accepts the canonical member URL and valid card fields", () => {
  assert.equal(validatePacket(packet), packet);
  for (const changed of [{ publicUrl: "https://evil.test/c/abcdefghijklmnopqrstuv" }, { token: "member_123" },
    { card: { ...packet.card, status: "unknown" } }, { card: { ...packet.card, firstName: "A".repeat(201) } }]) {
    assert.throws(() => validatePacket({ ...packet, ...changed }));
  }
});

test("Google payload shares the short QR and does not advertise a stale Active status", () => {
  const object = googleObject(packet, { GOOGLE_WALLET_ISSUER_ID: "123456" });
  assert.equal(object.id, "123456.bgsnl_abcdefghijklmnopqrstuv");
  assert.equal(object.barcode.value, packet.publicUrl);
  assert.equal(object.header.defaultValue.value, "Test Member");
  assert.match(object.textModulesData[0].body, /Scan to verify/);
  assert.equal(object.subheader.defaultValue.value, "Member of Groningen");
});

test("Google save link has a verifiable RS256 signature and only references its object", () => {
  const { privateKey, publicKey } = generateKeyPairSync("rsa", { modulusLength: 2048 });
  const url = signGoogleSaveUrl("123456.bgsnl_test", { client_email: "test@example.com", private_key: privateKey });
  const [header, payload, signature] = url.slice("https://pay.google.com/gp/v/save/".length).split(".");
  assert.equal(verify("RSA-SHA256", Buffer.from(`${header}.${payload}`), publicKey, Buffer.from(signature, "base64url")), true);
  assert.deepEqual(JSON.parse(Buffer.from(header, "base64url")), { alg: "RS256", typ: "JWT" });
  const claims = JSON.parse(Buffer.from(payload, "base64url"));
  assert.equal(claims.aud, "google");
  assert.equal(claims.typ, "savetowallet");
  assert.deepEqual(claims.payload, { genericObjects: [{ id: "123456.bgsnl_test" }] });
  assert.deepEqual(claims.origins, ["https://bulgariansociety.nl", "https://www.bulgariansociety.nl"]);
});

test("rollout gates fail closed even when the UI requests downloads", async () => {
  assert.deepEqual(await walletReadiness({}), { apple: { available: false }, google: { available: false } });
  assert.deepEqual(await walletReadiness({ WALLET_ISSUANCE_ENABLED: "1" }), { apple: { available: false }, google: { available: false } });
});

// Opt in locally: uses ignored signing credentials, writes only a private temp directory.
test("real Apple archive has a valid detached signature and matching manifest", { skip: process.env.BGSNL_TEST_WALLET_SIGNING !== "1" }, async () => {
  nextEnv.loadEnvConfig(process.cwd(), true);
  const zip = await createApplePass(packet);
  const files = new Map();
  let offset = 0;
  while (zip.readUInt32LE(offset) === 0x04034b50) {
    assert.equal(zip.readUInt16LE(offset + 8), 0, "Test parser expects stored ZIP members");
    const length = zip.readUInt32LE(offset + 18), nameLength = zip.readUInt16LE(offset + 26), extraLength = zip.readUInt16LE(offset + 28);
    const name = zip.subarray(offset + 30, offset + 30 + nameLength).toString();
    const start = offset + 30 + nameLength + extraLength;
    files.set(name, zip.subarray(start, start + length)); offset = start + length;
  }
  const manifest = JSON.parse(files.get("manifest.json"));
  for (const [name, digest] of Object.entries(manifest)) assert.equal(createHash("sha1").update(files.get(name)).digest("hex"), digest);
  const pass = JSON.parse(files.get("pass.json"));
  assert.equal(pass.barcodes[0].message, packet.publicUrl);
  assert.equal(pass.serialNumber, `bgsnl-${packet.token}`);
  assert.match(pass.generic.auxiliaryFields[0].value, /Scan to verify/);
  const directory = await mkdtemp(path.join(tmpdir(), "bgsnl-wallet-signature-"));
  try {
    await writeFile(path.join(directory, "manifest.json"), files.get("manifest.json"), { mode: 0o600 });
    const result = spawnSync("/usr/bin/openssl", ["smime", "-verify", "-inform", "DER", "-noverify", "-content", path.join(directory, "manifest.json")], { input: files.get("signature") });
    assert.equal(result.status, 0, "Detached Apple pass signature must verify");
    assert.deepEqual(result.stdout, files.get("manifest.json"));
  } finally { await rm(directory, { recursive: true, force: true }); }
});
