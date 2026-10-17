import { NextResponse } from "next/server";
import { websiteApi } from "@/util/auth/website-api";
import { SCANNER_PATH, scannerReturnPath } from "@/util/auth/scanner-return.mjs";

export async function GET(request) {
  const returnTo = scannerReturnPath(new URL(request.url).searchParams.get("returnTo"));
  const accessRequest = new Request(new URL("/api/v1/future-event/scanner-access", request.url), {
    headers: { Accept: "application/json" },
  });
  const access = await websiteApi(accessRequest, ["future-event", "scanner-access"]);
  const destination = access.status === 200 ? returnTo : access.status === 401
    ? `${SCANNER_PATH}/sign-in?returnTo=${encodeURIComponent(returnTo)}` : access.status === 403 ? "/user" : null;

  if (!destination) {
    const retry = `${SCANNER_PATH}/renew?returnTo=${encodeURIComponent(returnTo)}`;
    return new NextResponse(`<!doctype html><html lang="en"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Ticket scanner unavailable</title><main style="font:16px system-ui;max-width:38rem;margin:10vh auto;padding:1.5rem"><h1>Ticket scanner unavailable</h1><p>We could not verify scanner access. Please try again.</p><a href="${retry}">Retry</a> · <a href="/">Home</a></main></html>`, {
      status: 503,
      headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "private, no-store" },
    });
  }

  const response = NextResponse.redirect(new URL(destination, request.url));
  response.headers.set("Cache-Control", "private, no-store");
  for (const cookie of access.headers.getSetCookie()) response.headers.append("Set-Cookie", cookie);
  return response;
}
