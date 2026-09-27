import { websiteApi } from "@/util/auth/website-api";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const handle = async (request, { params }) => {
  const parts = (await params).path;
  if (parts[0] !== "v1" && !/^v[1-9]\d*$/.test(parts[0])) {
    const destination = new URL(request.url);
    destination.pathname = `/api/v1/${parts.join("/")}`;
    const response = NextResponse.redirect(destination, 307);
    response.headers.set("Cache-Control", "private, no-store");
    return response;
  }
  return websiteApi(request, parts);
};
export { handle as GET, handle as POST, handle as PUT, handle as PATCH, handle as DELETE, handle as HEAD };
