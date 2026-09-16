import { eventTicketRequest } from "@/util/payments/event-ticket-server";
import { createTicketPaymentHandler } from "@/util/payments/event-ticket-handlers.mjs";

export const POST = createTicketPaymentHandler({ checkoutRequest: eventTicketRequest });
