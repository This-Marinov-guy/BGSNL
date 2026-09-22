import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, writeFile, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { EventEmitter } from "node:events";
import { PassThrough } from "node:stream";
import { dependencyFingerprint } from "../docker/dev/dependencies.mjs";
import { waitForWorker } from "../docker/dev/start.mjs";
import { commands, main } from "./dev-docker.mjs";

test("dependency identity changes on either manifest or lockfile changes", async (t) => {
  const directory = await mkdtemp(path.join(os.tmpdir(), "bgsnl-dependencies-"));
  t.after(() => rm(directory, { recursive: true, force: true }));
  await writeFile(path.join(directory, "package.json"), '{"name":"fixture"}');
  await writeFile(path.join(directory, "package-lock.json"), '{"lockfileVersion":3}');
  const original = await dependencyFingerprint(directory);
  assert.equal(await dependencyFingerprint(directory), original);
  await writeFile(path.join(directory, "package.json"), '{"name":"changed"}');
  const manifestChanged = await dependencyFingerprint(directory);
  assert.notEqual(manifestChanged, original);
  await writeFile(path.join(directory, "package-lock.json"), '{"lockfileVersion":3,"packages":{}}');
  assert.notEqual(await dependencyFingerprint(directory), manifestChanged);
});

const childFixture = () => Object.assign(new EventEmitter(), { stdout: new PassThrough(), stderr: new PassThrough() });
test("worker waits for startup and handles a message split across chunks", async () => {
  const child = childFixture();
  const signal = new AbortController().signal;
  let ready = false;
  const pending = waitForWorker({}, { child, signal, log() {} }).then(() => { ready = true; });
  child.stdout.write("[nodemon] starting\nBGSNL spreadsheet synchronization ");
  await Promise.resolve();
  assert.equal(ready, false);
  child.stdout.write("worker is running.\n");
  await pending;
  assert.equal(ready, true);
  assert.equal(child.listenerCount("exit"), 0);
});

for (const failure of ["exit", "error", "abort"]) {
  test(`worker startup rejects on ${failure}`, async () => {
    const child = childFixture();
    const controller = new AbortController();
    const result = waitForWorker({}, { child, signal: controller.signal, log() {} });
    const rejected = assert.rejects(result, /Worker/);
    if (failure === "abort") controller.abort();
    else child.emit(failure);
    await rejected;
    assert.equal(child.listenerCount("exit"), 0);
  });
}

test("stopping preserves data and unsupported commands never reach Docker", async () => {
  assert.deepEqual(commands.stop, ["stop"]);
  assert.deepEqual(commands.down, ["down"]);
  await assert.rejects(main(["down", "-v"]), /Unknown option/);
  await assert.rejects(main(["unknown"]), /Unknown option/);
});
