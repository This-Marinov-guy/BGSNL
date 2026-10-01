import assert from "node:assert/strict";
import test from "node:test";
import { supportMessageParts } from "./support-message-links.mjs";

test("support messages link websites, email addresses, and international and local phone numbers", () => {
  const message = "Visit https://example.org/help, email help@example.org, or call 06 12345678 and +359 888 123 456.";
  const parts = supportMessageParts(message);
  assert.equal(parts.map(part => part.text).join(""), message);
  assert.deepEqual(parts.filter(part => part.href).map(({ text, href, kind }) => ({ text, href, kind })), [
    { text: "https://example.org/help", href: "https://example.org/help", kind: "url" },
    { text: "help@example.org", href: "mailto:help@example.org", kind: "email" },
    { text: "06 12345678", href: "tel:+31612345678", kind: "phone" },
    { text: "+359 888 123 456", href: "tel:+359888123456", kind: "phone" },
  ]);
});

test("bare domains use HTTPS and phone-like text inside a URL stays in that URL", () => {
  const parts = supportMessageParts("www.example.org/0612345678 and 1234");
  assert.deepEqual(parts.filter(part => part.href).map(part => part.href), ["https://www.example.org/0612345678"]);
});

test("HTML and unsafe schemes stay plain text while safe links remain clickable", () => {
  const message = '<img src=x onerror=alert(1)> javascript:alert(1) data:text/html,evil https://safe.example';
  const parts = supportMessageParts(message);
  assert.equal(parts.map(part => part.text).join(""), message);
  assert.deepEqual(parts.filter(part => part.href).map(part => part.href), ["https://safe.example/"]);
  assert.deepEqual(supportMessageParts(""), []);
});
