export async function ticketLookupSucceeded(response) {
  if (response.status === 404) {
    const body = await response.json().catch(() => null);
    // This is the API's item-level 404. Its unmatched-route 404 has a
    // different body, so an undeployed endpoint remains retryable.
    if (body?.message === "The requested item could not be found.") return false;
    throw new Error("Ticket Wallet service unavailable");
  }
  if (!response.ok) throw new Error("Ticket Wallet lookup failed");
  return true;
}
