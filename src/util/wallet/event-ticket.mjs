import { readFile } from "node:fs/promises";
import path from "node:path";
import { sign } from "node:crypto";
import { PKPass, PassType } from "passkit-generator";
import sharp from "sharp";
import { appleCredentials, appleWordmark, googleCredentials, WALLET_ORIGIN } from "./issuance.mjs";
import { eventTicketBrand } from "./event-ticket-brand.mjs";
import { circularEventLogo } from "./event-ticket-artwork.mjs";

const POSTER_UPLOAD_PATH = "/dqwcx5zyh/image/upload/";

export function eventTicketPosterUrl(value) {
  try {
    const url = new URL(value);
    if (url.protocol !== "https:" || url.hostname !== "res.cloudinary.com" || url.port ||
      url.username || url.password || !url.pathname.startsWith(POSTER_UPLOAD_PATH)) return "";
    url.search = "";
    url.hash = "";
    return url.href;
  } catch { return ""; }
}

export function googleEventTicketArtworkUrl(region, value) {
  const poster = eventTicketPosterUrl(value);
  if (!poster) return "";
  const url = new URL("/wallet/ticket/artwork", WALLET_ORIGIN);
  url.searchParams.set("region", eventTicketBrand(region).region);
  url.searchParams.set("poster", poster);
  return url.href;
}

async function downloadEventPoster(value) {
  const url = eventTicketPosterUrl(value);
  if (!url) return null;
  const response = await fetch(url, { redirect: "error", signal: AbortSignal.timeout(8000) });
  if (!response.ok || !/^image\/(?:jpeg|png|webp)$/.test(response.headers.get("content-type")?.split(";")[0] || "") ||
    Number(response.headers.get("content-length") || 0) > 5_000_000 || !response.body) return null;
  const chunks = [];
  let size = 0;
  for await (const chunk of response.body) {
    size += chunk.length;
    if (size > 5_000_000) return null;
    chunks.push(chunk);
  }
  const image = Buffer.concat(chunks);
  const metadata = await sharp(image, { limitInputPixels: 16_000_000 }).metadata();
  return ["jpeg", "png", "webp"].includes(metadata.format) ? image : null;
}

export async function createGoogleEventTicketArtwork(region, posterUrl, loadPoster = downloadEventPoster) {
  if (!eventTicketPosterUrl(posterUrl)) throw new Error("Invalid event poster");
  const brand = eventTicketBrand(region);
  const poster = await loadPoster(posterUrl);
  if (!poster) throw new Error("Event poster unavailable");
  const wordmark = await readFile(path.join(process.cwd(), "public", brand.googleWideLogoUrl));
  const compactWordmark = await sharp(wordmark).resize(900, 281).png().toBuffer();
  const thumbnail = await sharp(poster, { limitInputPixels: 16_000_000 })
    .resize(280, 360, { fit: "contain", background: "#00000000" }).png().toBuffer();
  return sharp({ create: { width: 1280, height: 400, channels: 4, background: "#00000000" } })
    .composite([{ input: compactWordmark, left: 20, top: 59 }, { input: thumbnail, left: 970, top: 20 }])
    .png().toBuffer();
}

export function validateEventTicket(packet) {
  const event = packet?.event, ticket = packet?.ticket;
  if (!/^[a-f\d]{24}$/i.test(event?.id || "") || !/^[a-f\d]{24}$/i.test(ticket?.id || "") ||
      ![event?.title, ticket?.name, event?.location, ticket?.barcode].every(value => typeof value === "string" && value.length <= 500) ||
      !/^https:\/\/bulgariansociety\.nl\/t\/[A-Za-z0-9_-]{22}$/.test(ticket.barcode) ||
      !Number.isFinite(new Date(event.date).getTime()) || !Number.isInteger(ticket.quantity) || ticket.quantity < 1) {
    throw new Error("Invalid event ticket");
  }
  return packet;
}

export function eventTicketExpirationDate(eventDate) {
  const expiresAt = new Date(eventDate).getTime() + 24 * 60 * 60 * 1000;
  if (!Number.isFinite(expiresAt) || !Number.isFinite(new Date(expiresAt).getTime())) throw new Error("Invalid event date");
  return new Date(expiresAt).toISOString();
}

export function isEventTicketExpired(eventDate, now = Date.now()) {
  return now >= Date.parse(eventTicketExpirationDate(eventDate));
}

export async function createAppleEventTicket(packet, env = process.env, loadPoster = downloadEventPoster) {
  validateEventTicket(packet);
  const certs = await appleCredentials(env);
  const brand = eventTicketBrand(packet.event.region);
  const logo = await readFile(path.join(process.cwd(), "public/assets/images/logo", brand.logoFile));
  const poster = await loadPoster(packet.event.poster).catch(() => null);
  const buffers = {};
  for (const scale of [1, 2, 3]) {
    buffers[`icon${scale === 1 ? "" : `@${scale}x`}.png`] = await circularEventLogo(logo, 29 * scale);
    buffers[`logo${scale === 1 ? "" : `@${scale}x`}.png`] = await appleWordmark(scale, brand.appleWordmark);
    if (poster) {
      buffers[`background${scale === 1 ? "" : `@${scale}x`}.png`] = await sharp(poster)
        .resize(180 * scale, 220 * scale, { fit: "cover" }).modulate({ brightness: 0.6 }).png().toBuffer();
      buffers[`artwork${scale === 1 ? "" : `@${scale}x`}.png`] = await sharp(poster)
        .resize(358 * scale, 448 * scale, { fit: "cover" }).png().toBuffer();
      buffers[`primaryLogo${scale === 1 ? "" : `@${scale}x`}.png`] = await circularEventLogo(logo, 30 * scale);
    }
  }
  const pass = new PKPass(buffers, certs, {
    formatVersion: 1, passTypeIdentifier: env.APPLE_WALLET_PASS_TYPE_ID, teamIdentifier: env.APPLE_WALLET_TEAM_ID,
    serialNumber: `event-${packet.event.id}-${packet.ticket.id}`, organizationName: brand.name,
    description: packet.event.title, foregroundColor: "rgb(255, 255, 255)", backgroundColor: "rgb(32, 22, 27)",
    labelColor: "rgb(240, 232, 228)", sharingProhibited: true,
  });
  pass.setRelevantDate(new Date(packet.event.date));
  pass.setExpirationDate(new Date(eventTicketExpirationDate(packet.event.date)));
  const title = packet.event.title.slice(0, 200);
  const eventDate = new Date(packet.event.date);
  const date = eventDate.toLocaleString("en-GB", { timeZone: "Europe/Amsterdam", dateStyle: "medium", timeStyle: "short" });
  const venue = packet.event.location.slice(0, 200);
  const holder = packet.ticket.name.slice(0, 200);
  const backFields = [
    ...(packet.ticket.quantity > 1 ? [{ key: "quantity", label: "Tickets in booking", value: String(packet.ticket.quantity) }] : []),
    { key: "verification", label: "Entry", value: "The QR code is checked against the live guest list at the entrance." },
    { key: "contact", label: "Contact", value: "info@bulgariansociety.nl" },
  ];
  if (poster) {
    const posterStyle = new PassType("posterGeneric");
    posterStyle.headerFields.push({
      key: "date", label: eventDate.toLocaleString("en-GB", { timeZone: "Europe/Amsterdam", day: "numeric", month: "short" }).toUpperCase(),
      value: eventDate.toLocaleString("en-GB", { timeZone: "Europe/Amsterdam", hour: "2-digit", minute: "2-digit", hour12: false }),
    });
    posterStyle.primaryFields.push({ key: "event", label: "EVENT", value: title });
    posterStyle.backFields.push(
      { key: "date_full", label: "Date & time", value: date },
      ...(venue ? [{ key: "venue", label: "Venue", value: venue }] : []),
      { key: "holder", label: "Ticket holder", value: holder },
      ...backFields,
    );
    pass.types.push(posterStyle);
  }
  const legacyStyle = new PassType("eventTicket");
  legacyStyle.primaryFields.push({ key: "event", label: "EVENT", value: title });
  legacyStyle.secondaryFields.push({ key: "date", label: "DATE", value: date });
  if (venue) legacyStyle.auxiliaryFields.push({ key: "venue", label: "VENUE", value: venue });
  legacyStyle.auxiliaryFields.push({ key: "holder", label: "TICKET HOLDER", value: holder });
  legacyStyle.backFields.push(...backFields);
  pass.types.push(legacyStyle);
  pass.setBarcodes({ format: "PKBarcodeFormatQR", message: packet.ticket.barcode, messageEncoding: "iso-8859-1" });
  return pass.getAsBuffer();
}

const localized = value => ({ defaultValue: { language: "en", value } });
export function googleEventTicketPayload(packet, env = process.env) {
  validateEventTicket(packet);
  const brand = eventTicketBrand(packet.event.region);
  const issuer = env.GOOGLE_WALLET_ISSUER_ID;
  if (!/^\d+$/.test(issuer || "")) throw new Error("Invalid Google Wallet issuer");
  const classId = `${issuer}.bgsnl_event_${packet.event.id}`;
  const objectId = `${issuer}.bgsnl_ticket_${packet.ticket.id}`;
  const artwork = googleEventTicketArtworkUrl(packet.event.region, packet.event.poster);
  return {
    eventTicketClasses: [{ id: classId, issuerName: brand.name, localizedIssuerName: localized(brand.name), reviewStatus: "underReview",
      eventName: localized(packet.event.title.slice(0, 200)), eventId: packet.event.id,
      ...(packet.event.location ? { venue: { name: localized(packet.event.location.slice(0, 200)) } } : {}),
      dateTime: { start: new Date(packet.event.date).toISOString() },
      classTemplateInfo: { cardTemplateOverride: { cardRowTemplateInfos: [{ twoItems: {
        startItem: { firstValue: { fields: [{ fieldPath: "class.dateTime.start", dateFormat: "DATE_TIME_YEAR" }] } },
        endItem: { firstValue: { fields: [{ fieldPath: "object.ticketHolderName" }] } },
      } }] } },
      logo: { sourceUri: { uri: `${WALLET_ORIGIN}${brand.googleLogoUrl}` }, contentDescription: localized(`${brand.name} logo`) },
      wideLogo: { sourceUri: { uri: artwork || `${WALLET_ORIGIN}${brand.googleWideLogoUrl}` },
        contentDescription: localized(artwork ? `${brand.name} and ${packet.event.title} poster` : brand.name) } }],
    eventTicketObjects: [{ id: objectId, classId, state: "ACTIVE", ticketHolderName: packet.ticket.name.slice(0, 200),
      ticketNumber: packet.ticket.id, barcode: { type: "QR_CODE", value: packet.ticket.barcode },
      hexBackgroundColor: "#19251F",
      validTimeInterval: { end: { date: eventTicketExpirationDate(packet.event.date) } },
      textModulesData: [{ id: "entry", header: "ENTRY", body: "The QR code is checked against the live guest list at the entrance." },
        ...(packet.ticket.quantity > 1 ? [{ id: "quantity", header: "TICKETS IN BOOKING", body: String(packet.ticket.quantity) }] : [])] }],
  };
}

export async function createGoogleEventTicketUrl(packet, env = process.env) {
  const credentials = await googleCredentials(env);
  const encode = value => Buffer.from(JSON.stringify(value)).toString("base64url");
  const body = `${encode({ alg: "RS256", typ: "JWT" })}.${encode({ iss: credentials.client_email, aud: "google", typ: "savetowallet",
    iat: Math.floor(Date.now() / 1000), origins: [WALLET_ORIGIN, "https://www.bulgariansociety.nl"],
    payload: googleEventTicketPayload(packet, env) })}`;
  return `https://pay.google.com/gp/v/save/${body}.${sign("RSA-SHA256", Buffer.from(body), credentials.private_key).toString("base64url")}`;
}
