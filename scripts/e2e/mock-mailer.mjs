import { createServer } from "node:http";
import { randomUUID, timingSafeEqual } from "node:crypto";

if (process.env.APP_ENV !== "dev" || process.env.BGSNL_E2E_MOCK_EMAILS !== "1") {
  throw new Error("The email mock only runs in the local E2E development stack.");
}

const messages = [];
const secret = Buffer.from(process.env.MAILER_BULGARIANSOCIETY_SECRET || "");
if (secret.length < 32) throw new Error("The E2E email mock requires the local mailer secret.");

function reply(response, status, body) {
  response.writeHead(status, { "Content-Type": "application/json", "Cache-Control": "no-store" });
  response.end(JSON.stringify(body));
}

function authorized(request) {
  const supplied = Buffer.from(request.headers["x-mailer-admin-secret"] || "");
  return supplied.length === secret.length && timingSafeEqual(supplied, secret);
}

const server = createServer(async (request, response) => {
  const path = new URL(request.url, "http://127.0.0.1").pathname;
  if (request.method === "GET" && path === "/health") {
    reply(response, 200, { service: "domakin-mailer", mode: "mock", messages: messages.length });
    return;
  }
  if (request.method === "POST" && path === "/api/delivery/template") {
    if (!authorized(request) || request.headers["x-domakin-caller"] !== "bgsnl_api") {
      reply(response, 403, { error: "Forbidden" });
      return;
    }
    try {
      let raw = "";
      for await (const chunk of request) {
        raw += chunk;
        if (raw.length > 1_000_000) throw new Error("Message too large");
      }
      const data = JSON.parse(raw);
      if (data.channel !== "bulgariansociety" || !data.templateId || !data.receiver?.email) {
        reply(response, 422, { error: "Invalid template request" });
        return;
      }
      const id = randomUUID();
      messages.push({ id, templateId: data.templateId, email: data.receiver.email, at: new Date().toISOString() });
      reply(response, 200, { status: "accepted", id, messageId: id });
    } catch {
      reply(response, 400, { error: "Invalid request" });
    }
    return;
  }
  reply(response, 404, { error: "Not found" });
});

server.listen(Number(process.env.PORT || 6000), "0.0.0.0", () => {
  console.log("BGSNL E2E email mock is ready; deliveries stay in memory.");
});
