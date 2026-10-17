import { NextResponse } from "next/server";
import { SCANNER_RESUME_PATH, SCANNER_RETURN_COOKIE, scannerReturnPath } from "@/util/auth/scanner-return.mjs";

export function GET(request) {
  const returnTo = scannerReturnPath(new URL(request.url).searchParams.get("returnTo"));
  const response = NextResponse.redirect(new URL("/login?scannerReturn=1", request.url));
  response.headers.set("Cache-Control", "private, no-store");
  response.cookies.set(SCANNER_RETURN_COOKIE, returnTo, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: SCANNER_RESUME_PATH,
    maxAge: 15 * 60,
  });
  return response;
}
