import { NextResponse } from "next/server";
import { SCANNER_RESUME_PATH, SCANNER_RETURN_COOKIE, scannerReturnPath } from "@/util/auth/scanner-return.mjs";

export function GET(request) {
  const returnTo = scannerReturnPath(request.cookies.get(SCANNER_RETURN_COOKIE)?.value);
  const response = NextResponse.redirect(new URL(returnTo, request.url));
  response.headers.set("Cache-Control", "private, no-store");
  response.cookies.set(SCANNER_RETURN_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: SCANNER_RESUME_PATH,
    maxAge: 0,
  });
  return response;
}
