import test from "node:test";
import assert from "node:assert/strict";
import { validateSupportFiles } from "./support-files.mjs";

test("accepts bounded supported attachments", () => {
  const files = ["image/png", "application/pdf", "text/plain"].map(type => ({ type, size: 1024 }));
  assert.equal(validateSupportFiles([], files), "");
  assert.match(validateSupportFiles([files[0]], files), /up to 3/);
  assert.match(validateSupportFiles([], [{ type: "text/html", size: 20 }]), /Choose/);
  assert.match(validateSupportFiles([], [{ type: "application/pdf", size: 6 * 1024 * 1024 }]), /5 MB/);
  assert.match(validateSupportFiles([], [{ type: "text/plain", size: 0 }]), /non-empty/);
});
