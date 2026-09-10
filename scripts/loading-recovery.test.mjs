import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";
import { scheduleLoadingRecovery, getLoadingDestination, SLOW_LOADING_DELAY_MS } from "../src/elements/ui/loading/loading-recovery.mjs";

function setup(t) {
  t.mock.timers.enable({ apis: ["setTimeout"] });
  let shown = 0;
  const cancel = scheduleLoadingRecovery(() => { shown++; });
  t.after(cancel);
  return { cancel, shown: () => shown };
}
test("the recovery notice appears at seven seconds, never before", (t) => {
  const timer = setup(t);
  t.mock.timers.tick(SLOW_LOADING_DELAY_MS - 1); assert.equal(timer.shown(), 0);
  t.mock.timers.tick(1); assert.equal(timer.shown(), 1);
});
test("fast loads and unmounted loaders leave no delayed notice", (t) => {
  const timer = setup(t);
  t.mock.timers.tick(6900); timer.cancel(); t.mock.timers.tick(20000);
  assert.equal(timer.shown(), 0);
});
test("a slow loader is notified once without recurring callbacks", (t) => {
  const timer = setup(t);
  t.mock.timers.tick(7000); assert.equal(timer.shown(), 1);
  t.mock.timers.tick(60000); assert.equal(timer.shown(), 1);
});
test("each mounted loader gets its own fresh delay", (t) => {
  const first = setup(t);
  t.mock.timers.tick(6000);
  let secondShown = false;
  const cancelSecond = scheduleLoadingRecovery(() => { secondShown = true; }); t.after(cancelSecond);
  first.cancel(); t.mock.timers.tick(6999);
  assert.equal(first.shown(), 0); assert.equal(secondShown, false);
  t.mock.timers.tick(1); assert.equal(secondShown, true);
});
test("React setup/cleanup replay cannot leave a second timer behind", (t) => {
  const first = setup(t); first.cancel();
  let shown = 0;
  const cancel = scheduleLoadingRecovery(() => { shown++; }); t.after(cancel);
  t.mock.timers.tick(7000);
  assert.equal(first.shown(), 0); assert.equal(shown, 1);
});
test("only the page and account loading components mount the delayed notice", async () => {
  for (const path of ["../src/elements/ui/loading/PageLoading.jsx", "../src/elements/ui/errors/HeaderLoadingError.jsx"]) {
    const source = await readFile(new URL(path, import.meta.url), "utf8");
    assert.match(source, /<LoadingRecovery\s*\/>/);
  }
  for (const path of ["../app/providers.jsx", "../src/component/common/RouteProgress.jsx"]) {
    const source = await readFile(new URL(path, import.meta.url), "utf8");
    assert.doesNotMatch(source, /LoadingRecovery|useLoadingRecovery/);
  }
});
test("the notice stays inline instead of using a global portal or fixed positioning", async () => {
  const source = await readFile(new URL("../src/elements/ui/loading/LoadingRecovery.jsx", import.meta.url), "utf8");
  const styles = await readFile(new URL("../src/elements/ui/loading/loading-recovery.module.scss", import.meta.url), "utf8");
  assert.doesNotMatch(source, /createPortal|document\.body|createContext/);
  assert.doesNotMatch(styles, /position:\s*fixed/);
  assert.match(source, /window\.location\.reload\(\)/);
  assert.match(source, /href="\/"/);
});
const current = "https://www.bulgariansociety.nl/user?page=1#profile";
test("same-page and hash-only links never start a navigation timeout", () => {
  for (const href of [undefined, null, "#settings", "", current, "/user?page=1", "/user?page=1#settings"]) {
    assert.equal(getLoadingDestination(href, current), null);
  }
});
test("page, query-only, relative and absolute destinations retain their query and hash", () => {
  assert.equal(getLoadingDestination("/partners#premium", current), "/partners#premium");
  assert.equal(getLoadingDestination("?page=2#tickets", current), "/user?page=2#tickets");
  assert.equal(getLoadingDestination("./partners", current), "/partners");
  assert.equal(getLoadingDestination("https://www.bulgariansociety.nl/contact", current), "/contact");
});
test("external and unsafe destinations cannot become Retry targets", () => {
  for (const href of ["https://evil.example", "//evil.example", "javascript:alert(1)", "data:text/html,hello", "mailto:person@example.test"]) {
    assert.equal(getLoadingDestination(href, current), null);
  }
});
