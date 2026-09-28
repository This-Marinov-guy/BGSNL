import test from "node:test";
import assert from "node:assert/strict";
import { supportTicketFromSearch, supportTicketPath } from "../src/elements/support/support-link.mjs";

const id = "a6c98b76-610b-4f52-85ca-2ae38d164ad8";

test("email links select only one valid ticket ID, never arbitrary paths or credentials", () => {
  assert.equal(supportTicketFromSearch(`?supportTicket=${id}`), id);
  assert.equal(supportTicketFromSearch(`?other=1&supportTicket=${id.toUpperCase()}`), id);
  for (const search of [undefined, "", "?supportTicket=", "?supportTicket=../../inbox", "?supportTicket=https://evil.test", `?supportTicket=${id}&supportTicket=${id}`, "?secret=private"]) {
    assert.equal(supportTicketFromSearch(search), null);
  }
});

test("sign-in links and return destinations retain the ticket, including billing settings redirects", () => {
  assert.equal(supportTicketPath(id), `/?supportTicket=${id}`);
  assert.equal(supportTicketPath(id, "/login"), `/login?supportTicket=${id}`);
  assert.equal(supportTicketPath(id, "/user#settings"), `/user?supportTicket=${id}#settings`);
  assert.equal(supportTicketPath(id, "/?campaign=1#home"), `/?campaign=1&supportTicket=${id}#home`);
  assert.equal(supportTicketPath("invalid", "/login"), "/login");
});
