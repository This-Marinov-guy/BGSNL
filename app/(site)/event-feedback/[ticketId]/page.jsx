import { notFound } from "next/navigation";
import EventFeedbackPage from "@/screens/feedback/EventFeedbackPage";
import { API_HEADERS, API_URL } from "@/util/api/server";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Event feedback",
  robots: { index: false, follow: false, noarchive: true, nosnippet: true },
  referrer: "no-referrer",
  alternates: { canonical: null },
};

// eslint-disable-next-line react/prop-types
export default async function Page({ params }) {
  const { ticketId } = await params;
  if (!/^[a-f\d]{24}$/i.test(ticketId)) notFound();

  let initialState = { phase: "error" };
  try {
    const response = await fetch(`${API_URL}/event/feedback/${ticketId}`, {
      headers: { ...API_HEADERS, Accept: "application/json" },
      cache: "no-store",
      redirect: "error",
      signal: AbortSignal.timeout(8000),
    });
    if (response.status === 404) initialState = { phase: "not-found" };
    else if (response.status === 410) initialState = { phase: "unavailable" };
    else if (response.ok) {
      const data = await response.json();
      if (data.status === true && data.state === "submitted") initialState = { phase: "not-found" };
      else if (data.status === true && ["ready", "not_ready"].includes(data.state)) {
        initialState = { phase: data.state, eventTitle: data.eventTitle, eventPoster: data.eventPoster, opensAt: data.opensAt };
      }
    }
  } catch (error) {
    console.warn("[event-feedback] Ticket lookup failed:", error?.message || "unknown error");
  }

  if (initialState.phase === "not-found") notFound();
  return <EventFeedbackPage ticketId={ticketId} initialState={initialState} />;
}
