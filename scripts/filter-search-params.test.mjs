import assert from "node:assert/strict";
import test from "node:test";
import { updateFilterSearchParams } from "../src/util/filter-search-params.mjs";

function browserAt(path) {
  let url = new URL(path, "https://example.test");
  const calls = [];
  const write = method => (state, title, next) => {
    calls.push({ method, state, title, next });
    url = new URL(next, url);
  };
  return {
    get location() { return url; },
    history: { pushState: write("push"), replaceState: write("replace") },
    calls,
  };
}

test("region filters preserve the page, analytics view and hash", () => {
  const browser = browserAt("/user/dashboard/events?view=analytics#results");
  updateFilterSearchParams(params => { params.set("region", "groningen"); return params; }, {}, browser);
  assert.equal(browser.calls[0].method, "push");
  assert.equal(browser.calls[0].next, "/user/dashboard/events?view=analytics&region=groningen#results");
});

test("rapid filter changes compose using the latest URL", () => {
  const browser = browserAt("/internships?type=bulgarian");
  updateFilterSearchParams(params => { params.set("search", "design & events"); return params; }, { replace: true }, browser);
  updateFilterSearchParams(params => { params.set("page", "2"); return params; }, {}, browser);
  assert.equal(browser.location.searchParams.get("type"), "bulgarian");
  assert.equal(browser.location.searchParams.get("search"), "design & events");
  assert.equal(browser.location.searchParams.get("page"), "2");
  assert.deepEqual(browser.calls.map(call => call.method), ["replace", "push"]);
});

test("clearing filters removes an empty query while retaining the hash", () => {
  const browser = browserAt("/internships?search=test#list");
  updateFilterSearchParams({}, { replace: true }, browser);
  assert.equal(browser.calls[0].next, "/internships#list");
});

test("unchanged filters do not add history entries", () => {
  const browser = browserAt("/user/dashboard/events?region=groningen");
  updateFilterSearchParams(params => params, {}, browser);
  assert.equal(browser.calls.length, 0);
});

test("clearing one filter preserves unrelated query values", () => {
  const browser = browserAt("/user/dashboard/events?view=analytics&region=groningen");
  updateFilterSearchParams(params => { params.delete("region"); return params; }, {}, browser);
  assert.equal(browser.calls[0].next, "/user/dashboard/events?view=analytics");
});
