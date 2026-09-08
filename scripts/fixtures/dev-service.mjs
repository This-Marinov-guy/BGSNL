// Test-only server. No application imports, credentials, databases or email.
import http from "node:http";
const server = http.createServer((_request, response) => {
  response.writeHead(Number(process.env.FIXTURE_STATUS || 200), { "Content-Type": "application/json" });
  response.end(JSON.stringify({ service: "domakin-mailer", fixture: true }));
});
server.listen(Number(process.argv[2]), "127.0.0.1", () => console.log("fixture ready"));
if (process.env.FIXTURE_IGNORE_TERM === "true") process.on("SIGTERM", () => {});
else process.on("SIGTERM", () => server.close(() => process.exit(0)));
