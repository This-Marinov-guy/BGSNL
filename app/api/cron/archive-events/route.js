import { NextResponse } from "next/server";
import { API_HEADERS, API_URL } from "@/util/api/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const apiUrl = (path) => `${API_URL.replace(/\/$/, "")}/${path}`;
const json = (body, status = 200) => NextResponse.json(body, {
  status,
  headers: { "Cache-Control": "no-store", "X-Robots-Tag": "noindex, nofollow" },
});

export async function GET(request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return json({ message: "Unauthorized" }, 401);
  }
  if (!process.env.BGSNL_SERVER_KEY) {
    return json({ message: "Archive scheduler is not configured." }, 503);
  }

  try {
    const response = await fetch(apiUrl("future-event/archive-expired"), {
      method: "POST",
      headers: API_HEADERS,
      cache: "no-store",
      signal: AbortSignal.timeout(30000),
    });
    if (!response.ok) return json({ message: "Archive scheduler could not complete." }, 502);
    const data = await response.json();
    return json({ archived: Number(data.archived) || 0 });
  } catch {
    return json({ message: "Archive scheduler could not complete." }, 503);
  }
}
