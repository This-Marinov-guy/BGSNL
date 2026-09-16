import { randomBytes } from "node:crypto";
import { createTicketEntryHandler } from "@/util/payments/event-ticket-handlers.mjs";

export const dynamic = "force-dynamic";
export const GET = createTicketEntryHandler({ randomId: () => randomBytes(12).toString("hex"), secure: process.env.NODE_ENV === "production" });
export const HEAD = GET;
