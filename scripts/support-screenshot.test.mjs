import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { screenshotDimensions, prepareScreenshotClone, captureFullPageScreenshot, startReportScreenshot, attachReportScreenshot } from "../src/elements/support/support-screenshot.mjs";

test("capture covers the full document with bounded mobile-safe canvas dimensions", () => {
  const dimensions = screenshotDimensions({ documentElement: { scrollWidth: 1200, scrollHeight: 24000 }, body: { scrollWidth: 1200, scrollHeight: 25000 } }, { innerWidth: 1200, innerHeight: 800, devicePixelRatio: 3 });
  assert.equal(dimensions.height, 25000);
  assert.equal(dimensions.width, 1200);
  assert.ok(dimensions.width * dimensions.height * dimensions.scale ** 2 <= 3_000_001);
  assert.ok(dimensions.height * dimensions.scale <= 8192);
});

test("clone removes support UI and masks private content and form values", () => {
  const removed = [];
  const privateElement = { style: {} };
  const input = { tagName: "INPUT", value: "secret", type: "password", removeAttribute(name) { this[name] = undefined; } };
  const textarea = { ...input, tagName: "TEXTAREA", textContent: "private message" };
  const select = { ...input, tagName: "SELECT", options: [{ textContent: "personal selection" }] };
  const doc = { documentElement: { style: {} }, body: { style: {} }, querySelectorAll(selector) {
    if (selector.includes("data-support-widget-root")) return [{ remove: () => removed.push("widget") }, { remove: () => removed.push("desk") }];
    if (selector.includes("data-private")) return [privateElement];
    return [input, textarea, select];
  } };
  prepareScreenshotClone(doc);
  assert.deepEqual(removed, ["widget", "desk"]);
  assert.equal(privateElement.style.visibility, "hidden");
  assert.equal(input.value, undefined);
  assert.equal(textarea.textContent, "");
  assert.equal(select.options[0].textContent, "");
  assert.equal(doc.body.style.overflow, "visible");
});

test("renderer starts at page top, excludes embedded content and encodes a bounded JPEG", async () => {
  const doc = { documentElement: { scrollWidth: 390, scrollHeight: 4000 }, body: { scrollWidth: 390, scrollHeight: 4000 } };
  const canvas = { width: 390, height: 4000, toBlob(callback, type) { assert.equal(type, "image/jpeg"); callback(new Blob(["jpeg"], { type })); } };
  const file = await captureFullPageScreenshot({ doc, viewport: { innerWidth: 390, innerHeight: 844, devicePixelRatio: 2 }, render: async (element, options) => {
    assert.equal(element, doc.documentElement);
    assert.equal(options.height, 4000);
    assert.equal(options.windowHeight, 844);
    assert.equal(options.scrollY, 0); assert.equal(options.y, 0);
    assert.equal(options.allowTaint, false);
    assert.equal(options.onclone, prepareScreenshotClone);
    assert.equal(options.ignoreElements({ matches: (selector) => selector.includes("iframe") && selector.includes("data-support-widget-root") }), true);
    return canvas;
  } });
  assert.equal(file.type, "image/jpeg");
  assert.match(file.name, /^website-screenshot-/);
  assert.equal(canvas.width, 0); assert.equal(canvas.height, 0);
});

test("capture failures are non-fatal and do not upload an empty attachment", async () => {
  const screenshot = startReportScreenshot(async () => { throw new Error("Unsupported browser rendering"); });
  assert.equal(await attachReportScreenshot({ screenshot }, () => assert.fail("No upload expected")), false);
});

test("background screenshot upload retries the same ID and file with the report credentials", async () => {
  const file = new File(["jpeg"], "snapshot.jpg", { type: "image/jpeg" });
  const operation = { screenshot: Promise.resolve(file), conversationId: "report-id", messageId: "message-id", secret: "guest-secret" };
  const calls = [];
  assert.equal(await attachReportScreenshot(operation, async (path, options) => {
    calls.push({ path, options });
    if (calls.length === 1) throw new Error("Connection interrupted after upload");
  }), true);
  assert.equal(calls.length, 2);
  assert.equal(calls[0].path, "conversations/report-id/messages");
  assert.equal(calls[0].options.secret, "guest-secret");
  assert.equal(calls[0].options.data, calls[1].options.data);
  assert.equal(calls[1].options.data.get("id"), "message-id");
  assert.equal(calls[1].options.data.get("images").name, "snapshot.jpg");
});

test("authorization failures are not retried", async () => {
  let calls = 0;
  const attached = await attachReportScreenshot({ screenshot: Promise.resolve(new File(["jpeg"], "snapshot.jpg")), conversationId: "report-id", messageId: "message-id", session: { userId: "account" } }, async (path, options) => {
    calls++; assert.equal(options.session.userId, "account"); throw Object.assign(new Error("Forbidden"), { status: 403 });
  });
  assert.equal(attached, false); assert.equal(calls, 1);
});

test("report submission starts capture automatically and attaches only after confirmed creation", async () => {
  const source = await readFile(new URL("../src/elements/support/ReportForm.jsx", import.meta.url), "utf8");
  assert.ok(source.indexOf("startReportScreenshot();") < source.indexOf('await supportRequest("conversations"'));
  assert.ok(source.indexOf('await supportRequest("conversations"') < source.indexOf("void attachReportScreenshot("));
  assert.match(source, /conversationId: result\.conversation\.id/);
  assert.match(source, /if \(!pending\.current\.screenshot\)/);
  assert.doesNotMatch(source, /getDisplayMedia|window\.confirm/);
});
