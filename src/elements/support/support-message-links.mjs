import "core-js/actual/url/can-parse.js";
import * as linkify from "linkifyjs";
import { findPhoneNumbersInText } from "libphonenumber-js";
import { sanitizeUrl } from "@braintree/sanitize-url";

const sanitizedHref = (href, protocols) => {
  const sanitized = sanitizeUrl(href);
  try {
    return protocols.includes(new URL(sanitized).protocol) ? sanitized : null;
  } catch {
    return null;
  }
};

export function supportMessageParts(text) {
  if (typeof text !== "string" || !text) return [];
  const parts = [];
  const appendPhones = (start, end) => {
    const section = text.slice(start, end);
    let position = 0;
    for (const match of findPhoneNumbersInText(section, "NL")) {
      if (match.startsAt > position) parts.push({ text: section.slice(position, match.startsAt) });
      const label = section.slice(match.startsAt, match.endsAt);
      const href = sanitizedHref(`tel:${match.number.number}`, ["tel:"]);
      parts.push(href ? { text: label, href, kind: "phone" } : { text: label });
      position = match.endsAt;
    }
    if (position < section.length) parts.push({ text: section.slice(position) });
  };

  let position = 0;
  for (const match of linkify.find(text, { defaultProtocol: "https" })) {
    if (match.type !== "url" && match.type !== "email") continue;
    appendPhones(position, match.start);
    const label = text.slice(match.start, match.end);
    const href = sanitizedHref(match.href, match.type === "email" ? ["mailto:"] : ["http:", "https:"]);
    parts.push(href ? { text: label, href, kind: match.type } : { text: label });
    position = match.end;
  }
  appendPhones(position, text.length);
  return parts;
}
