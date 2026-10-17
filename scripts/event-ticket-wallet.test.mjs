import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import nextEnv from "@next/env";
import sharp from "sharp";
import { createAppleEventTicket, createGoogleEventTicketArtwork, createGoogleEventTicketUrl, eventTicketExpirationDate, eventTicketPosterUrl, googleEventTicketArtworkUrl, googleEventTicketPayload, isEventTicketExpired, validateEventTicket } from "../src/util/wallet/event-ticket.mjs";
import { EVENT_TICKET_REGIONS, eventTicketBrand } from "../src/util/wallet/event-ticket-brand.mjs";
import { ticketLookupSucceeded } from "../src/util/wallet/event-ticket-lookup.mjs";
import { appleWordmark } from "../src/util/wallet/issuance.mjs";
import { circularEventLogo } from "../src/util/wallet/event-ticket-artwork.mjs";

const poster = "https://res.cloudinary.com/dqwcx5zyh/image/upload/v1791741689/drafts/507f1f77bcf86cd799439011/poster.jpg";
const packet = { event: { id: "507f1f77bcf86cd799439011", title: "Autumn Social", date: "2026-10-17T17:00:00Z", location: "Groningen", region: "groningen", poster },
  ticket: { id: "507f1f77bcf86cd799439012", name: "Alex", quantity: 2,
    barcode: "https://bulgariansociety.nl/t/aBcDeFgHiJkLmNoPqRsTuv" } };

test("only an item-level 404 marks a ticket link invalid", async () => {
  const response = message => new Response(JSON.stringify({ message }), { status: 404, headers: { "content-type": "application/json" } });
  assert.equal(await ticketLookupSucceeded(response("The requested item could not be found.")), false);
  await assert.rejects(ticketLookupSucceeded(response("This request could not be completed.")), /service unavailable/);
  await assert.rejects(ticketLookupSucceeded(new Response(null, { status: 503 })), /lookup failed/);
  assert.equal(await ticketLookupSucceeded(new Response("{}", { status: 200 })), true);
});

test("Google event pass keeps the issued QR and stable ticket identity", () => {
  const payload = googleEventTicketPayload(packet, { GOOGLE_WALLET_ISSUER_ID: "3388000000023197450" });
  assert.equal(payload.eventTicketClasses[0].dateTime.start, packet.event.date.replace("Z", ".000Z"));
  assert.equal(payload.eventTicketObjects[0].validTimeInterval.end.date, "2026-10-18T17:00:00.000Z");
  assert.equal(payload.eventTicketObjects[0].barcode.value, packet.ticket.barcode);
  assert.equal(payload.eventTicketObjects[0].ticketHolderName, "Alex");
  assert.equal(payload.eventTicketObjects[0].classId, payload.eventTicketClasses[0].id);
  assert.deepEqual(payload.eventTicketClasses[0].classTemplateInfo.cardTemplateOverride.cardRowTemplateInfos, [{ twoItems: {
    startItem: { firstValue: { fields: [{ fieldPath: "class.dateTime.start", dateFormat: "DATE_TIME_YEAR" }] } },
    endItem: { firstValue: { fields: [{ fieldPath: "object.ticketHolderName" }] } },
  } }]);
  assert.equal(payload.eventTicketObjects[0].heroImage, undefined);
  assert.equal(payload.eventTicketClasses[0].issuerName, "Bulgarian Society Groningen");
  assert.equal(payload.eventTicketClasses[0].logo.sourceUri.uri, "https://bulgariansociety.nl/assets/wallet-cards/google/groningen-event-logo.png");
  assert.equal(payload.eventTicketClasses[0].wideLogo.sourceUri.uri, googleEventTicketArtworkUrl("groningen", poster));
  assert.throws(() => validateEventTicket({ ...packet, ticket: { ...packet.ticket, barcode: "https://evil.test/t/123" } }));
});

test("event ticket branding uses the event region and falls back to the national identity", () => {
  assert.equal(eventTicketBrand("groningen").appleWordmark, "event-logo-groningen");
  assert.equal(eventTicketBrand("../private").logoUrl, "/assets/images/logo/logo-nl-circle.png");
  assert.equal(googleEventTicketPayload({ ...packet, event: { ...packet.event, region: "unknown" } },
    { GOOGLE_WALLET_ISSUER_ID: "3388000000023197450" }).eventTicketClasses[0].issuerName, "Bulgarian Society Netherlands");
});

test("every chapter has pass artwork and a Google ticket with its own name, poster, and QR", async () => {
  for (const region of EVENT_TICKET_REGIONS) {
    const brand = eventTicketBrand(region);
    const payload = googleEventTicketPayload({ ...packet, event: { ...packet.event, region } },
      { GOOGLE_WALLET_ISSUER_ID: "3388000000023197450" });
    const ticketClass = payload.eventTicketClasses[0], ticketObject = payload.eventTicketObjects[0];
    assert.equal(ticketClass.issuerName, brand.name);
    assert.equal(ticketClass.logo.sourceUri.uri, `https://bulgariansociety.nl${brand.googleLogoUrl}`);
    assert.equal(ticketClass.wideLogo.sourceUri.uri, googleEventTicketArtworkUrl(region, poster));
    assert.equal(ticketObject.barcode.type, "QR_CODE");
    assert.equal(ticketObject.barcode.value, packet.ticket.barcode);
    assert.equal(ticketObject.heroImage, undefined);
    const chapterLogo = await sharp(path.join(process.cwd(), "public", brand.googleLogoUrl)).metadata();
    assert.equal(chapterLogo.width, 660);
    assert.equal(chapterLogo.height, 660);
    const wideLogo = await sharp(path.join(process.cwd(), "public", brand.googleWideLogoUrl)).metadata();
    assert.equal(wideLogo.width, 1280);
    assert.equal(wideLogo.height, 400);
    const appleLogo = await sharp(path.join(process.cwd(), "public/assets/wallet-cards/apple", `${brand.appleWordmark}.png`)).metadata();
    assert.ok(appleLogo.width > 0 && appleLogo.height > 0);
  }
});

test("ticket poster is limited to the society's Cloudinary account and has a compact Google header", async () => {
  assert.equal(eventTicketPosterUrl(poster), poster);
  const artworkUrl = new URL(googleEventTicketArtworkUrl("groningen", poster));
  assert.equal(artworkUrl.pathname, "/wallet/ticket/artwork");
  assert.equal(artworkUrl.searchParams.get("poster"), poster);
  const source = await sharp({ create: { width: 400, height: 600, channels: 3, background: "#b52e40" } }).png().toBuffer();
  const artwork = await createGoogleEventTicketArtwork("groningen", poster, async () => source);
  const metadata = await sharp(artwork).metadata();
  assert.equal(metadata.width, 1280);
  assert.equal(metadata.height, 400);
  const posterPixel = await sharp(artwork).extract({ left: 1100, top: 200, width: 1, height: 1 }).raw().toBuffer();
  assert.deepEqual([...posterPixel], [181, 46, 64, 255]);
  for (const unsafe of ["http://res.cloudinary.com/dqwcx5zyh/image/upload/x.jpg", "https://evil.test/image/upload/x.jpg",
    "https://res.cloudinary.com/another-account/image/upload/x.jpg", "file:///private/poster.jpg"]) {
    assert.equal(eventTicketPosterUrl(unsafe), "");
    assert.equal(googleEventTicketArtworkUrl("groningen", unsafe), "");
  }
  const withoutPoster = googleEventTicketPayload({ ...packet, event: { ...packet.event, poster: "https://evil.test/poster.jpg" } },
    { GOOGLE_WALLET_ISSUER_ID: "3388000000023197450" });
  assert.equal(withoutPoster.eventTicketClasses[0].wideLogo.sourceUri.uri,
    "https://bulgariansociety.nl/assets/wallet-cards/google/groningen-event-wide-logo.png");
});

test("event pass expires exactly 24 hours after the effective event date", () => {
  assert.equal(eventTicketExpirationDate("2026-10-24T18:00:00Z"), "2026-10-25T18:00:00.000Z");
  assert.equal(isEventTicketExpired("2026-10-24T18:00:00Z", Date.parse("2026-10-25T17:59:59.999Z")), false);
  assert.equal(isEventTicketExpired("2026-10-24T18:00:00Z", Date.parse("2026-10-25T18:00:00Z")), true);
  assert.throws(() => eventTicketExpirationDate("invalid"), /Invalid event date/);
});

test("signed Apple event pass carries the expiry and issued QR", { skip: process.env.BGSNL_TEST_WALLET_SIGNING !== "1" }, async () => {
  nextEnv.loadEnvConfig(process.cwd(), true);
  const sourcePoster = await sharp({ create: { width: 640, height: 800, channels: 3, background: "#a33b2c" } }).png().toBuffer();
  const zip = await createAppleEventTicket(packet, process.env, async () => sourcePoster);
  let offset = 0, pass;
  const artwork = {};
  while (zip.readUInt32LE(offset) === 0x04034b50) {
    const length = zip.readUInt32LE(offset + 18);
    const nameLength = zip.readUInt16LE(offset + 26);
    const extraLength = zip.readUInt16LE(offset + 28);
    const name = zip.subarray(offset + 30, offset + 30 + nameLength).toString();
    const start = offset + 30 + nameLength + extraLength;
    if (name === "pass.json") pass = JSON.parse(zip.subarray(start, start + length).toString());
    if (/^(?:icon|logo|background|artwork|primaryLogo)(?:@\dx)?\.png$/.test(name)) artwork[name] = zip.subarray(start, start + length);
    offset = start + length;
  }
  assert.equal(pass.expirationDate, "2026-10-18T17:00:00.000Z");
  assert.equal(pass.relevantDate, "2026-10-17T17:00:00.000Z");
  assert.equal(pass.barcodes[0].message, packet.ticket.barcode);
  assert.equal(pass.barcodes[0].format, "PKBarcodeFormatQR");
  assert.equal(pass.barcodes[0].message,
    googleEventTicketPayload(packet, { GOOGLE_WALLET_ISSUER_ID: "3388000000023197450" }).eventTicketObjects[0].barcode.value);
  assert.equal(pass.organizationName, "Bulgarian Society Groningen");
  assert.deepEqual(artwork["logo.png"], await appleWordmark(1, "event-logo-groningen"));
  const regionLogo = await readFile(path.join(process.cwd(), "public/assets/images/logo/groningen.webp"));
  assert.deepEqual(artwork["icon.png"], await circularEventLogo(regionLogo, 29));
  const iconCorner = await sharp(artwork["icon@3x.png"]).extract({ left: 0, top: 0, width: 1, height: 1 }).raw().toBuffer();
  assert.equal(iconCorner[3], 0);
  assert.equal(pass.posterGeneric.headerFields[0].label, "17 OCT");
  assert.equal(pass.posterGeneric.headerFields[0].value, "19:00");
  assert.equal(pass.posterGeneric.primaryFields[0].value, packet.event.title);
  assert.equal(pass.posterGeneric.footerFields.length, 0);
  assert.equal(pass.posterGeneric.backFields.find(field => field.key === "holder")?.value, packet.ticket.name);
  assert.equal(pass.eventTicket.primaryFields[0].value, packet.event.title);
  for (const [name, scale] of [["background.png", 1], ["background@2x.png", 2], ["background@3x.png", 3]]) {
    const metadata = await sharp(artwork[name]).metadata();
    assert.equal(metadata.width, 180 * scale);
    assert.equal(metadata.height, 220 * scale);
  }
  for (const [name, scale] of [["artwork.png", 1], ["artwork@2x.png", 2], ["artwork@3x.png", 3]]) {
    const metadata = await sharp(artwork[name]).metadata();
    assert.equal(metadata.width, 358 * scale);
    assert.equal(metadata.height, 448 * scale);
  }
  assert.equal((await sharp(artwork["primaryLogo@3x.png"]).metadata()).width, 90);
  const primaryCorner = await sharp(artwork["primaryLogo@3x.png"]).extract({ left: 0, top: 0, width: 1, height: 1 }).raw().toBuffer();
  assert.equal(primaryCorner[3], 0);
});

test("signed Google event save URL carries the same expiry", { skip: process.env.BGSNL_TEST_WALLET_SIGNING !== "1" }, async () => {
  nextEnv.loadEnvConfig(process.cwd(), true);
  const url = await createGoogleEventTicketUrl(packet);
  const [, claims] = url.slice("https://pay.google.com/gp/v/save/".length).split(".");
  const object = JSON.parse(Buffer.from(claims, "base64url")).payload.eventTicketObjects[0];
  assert.equal(object.validTimeInterval.end.date, "2026-10-18T17:00:00.000Z");
  assert.equal(object.barcode.value, packet.ticket.barcode);
});
