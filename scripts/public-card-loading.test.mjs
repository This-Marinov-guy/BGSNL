import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import vm from "node:vm";
import { isIP } from "node:net";

const source = await readFile(new URL("../src/util/wallet/public-card-server.js", import.meta.url), "utf8");
const token = "abcdefghijklmnopqrstuv";
async function harness({ status = 200, cardStatus = "active", fails = false } = {}) {
  const requests = [];
  const context = vm.createContext({ process: { env: { BGSNL_TRUSTED_CLIENT_IP_HEADER: "x-test-client-ip" } }, Date, AbortSignal, fetch: async (url, options) => {
    requests.push({ url, options });
    if (fails) throw new Error("offline");
    return { ok: status === 200, status, json: async () => ({ card: { status: cardStatus }, ticketImages: [] }) };
  } });
  const dependencies = {
    "server-only": {},
    "qrcode": { default: { toDataURL: async () => "data:image/png;base64,mock" } },
    "node:net": { isIP },
    "@/util/api/server": { API_URL: "https://api.example/api/v1", API_HEADERS: { "x-api-key": "test" } },
    "@assets/wallet-cards/v1/specifications.json": { default: { design: { colors: {} } } },
  };
  const module = new vm.SourceTextModule(source, { context });
  await module.link(name => {
    const exports = dependencies[name];
    return new vm.SyntheticModule(Object.keys(exports), function () { for (const [key, value] of Object.entries(exports)) this.setExport(key, value); }, { context });
  });
  await module.evaluate();
  return { load: module.namespace.loadPublicCard, requests };
}
test("initial card lookup is fresh, anonymous and preserves trusted rate-limit IP", async () => {
  const { load, requests } = await harness();
  const result = await load(token, new Headers({ cookie: "secret", authorization: "secret", "x-test-client-ip": "127.0.0.1" }));
  assert.equal(result.status, 200);
  assert.equal(result.data.card.status, "active");
  assert.ok(result.data.verifiedAt > 0);
  assert.equal(requests.length, 1);
  assert.equal(requests[0].options.cache, "no-store");
  assert.equal(requests[0].options.headers["x-bgsnl-client-ip"], "127.0.0.1");
  assert.equal(requests[0].options.headers.cookie, undefined);
  assert.equal(requests[0].options.headers.authorization, undefined);
  assert.equal(requests[0].url, `https://api.example/api/v1/user/wallet/public/${token}`);
});
test("invalid/revoked links and unavailable status fail closed", async () => {
  const invalid = await harness();
  assert.equal((await invalid.load("bad", new Headers())).status, 404);
  assert.equal(invalid.requests.length, 0);
  for (const [options, expected] of [[{ status: 404 }, 404], [{ status: 500 }, 503], [{ cardStatus: "unknown" }, 503], [{ fails: true }, 503]]) {
    const { load } = await harness(options);
    const result = await load(token, new Headers());
    assert.equal(result.status, expected);
    assert.equal(result.data, undefined);
  }
});
