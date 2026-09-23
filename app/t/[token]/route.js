import { NextResponse } from "next/server";

export async function GET(request, { params }) {
  const { token } = await params;
  const headers = { "Cache-Control": "private, no-store", "Referrer-Policy": "no-referrer", "X-Robots-Tag": "noindex, nofollow" };
  if (!/^[A-Za-z0-9_-]{22}$/.test(token)) return new Response("Invalid ticket link", { status: 404, headers });
  // GET never admits anyone. The destination requires staff login before PATCH.
  return NextResponse.redirect(new URL(`/user/dashboard/ticket-scanner?token=${token}`, request.url), { status: 307, headers });
}
