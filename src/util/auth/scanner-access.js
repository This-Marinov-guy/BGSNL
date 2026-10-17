import "server-only";

import { API_HEADERS, API_URL } from "@/util/api/server";

export async function verifyScannerAccess(token) {
  try {
    const response = await fetch(`${API_URL}/future-event/scanner-access`, {
      headers: { ...API_HEADERS, Authorization: `Bearer ${token}` },
      cache: "no-store",
      redirect: "manual",
      signal: AbortSignal.timeout(10000),
    });
    if (!response.ok) return { status: response.status };
    const data = await response.json();
    if (typeof data?.userId !== "string" || !data.userId || !Array.isArray(data.roles) ||
        typeof data.status !== "string") return { status: 503 };
    return { status: 200, userId: data.userId, roles: data.roles, accountStatus: data.status, region: data.region };
  } catch {
    return { status: 503 };
  }
}
