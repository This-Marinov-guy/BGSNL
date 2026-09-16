import { notFound } from "next/navigation";
import EmailTicketPreferences from "@/screens/eventActions/EmailTicketPreferences";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Ticket preferences preview",
  robots: { index: false, follow: false },
  referrer: "no-referrer",
};

export default function TicketPreferencesPreviewPage() {
  if (process.env.NODE_ENV !== "development") notFound();

  return <EmailTicketPreferences preview checkout="preview" details={{
    price: 8,
    guest: false,
    revision: "preview",
    eventUrl: "/groningen/event-details/6a8ecc388e2b1093c9584aa8",
    event: {
      id: "preview",
      title: "Community dinner",
      description: "An evening of good food and conversation with the Bulgarian community in Groningen.",
      date: "2026-10-20T17:00:00Z",
      location: "Groningen",
      region: "groningen",
      poster: "/assets/images/alumni/members.jpg",
      ticketTimer: "2026-10-20T16:00:00Z",
      isFree: false,
      addOns: {
        isEnabled: true,
        isMandatory: false,
        multi: true,
        title: "Make it your evening",
        description: "Add dinner or a welcome drink to your ticket.",
        items: [
          { _id: "meal", title: "Dinner", description: "A freshly prepared meal", price: 5 },
          { _id: "drink", title: "Welcome drink", description: "A drink on arrival", price: 2 },
        ],
      },
      extraInputsForm: [
        { type: "text", placeholder: "Dietary requirements", required: false },
        { type: "select", placeholder: "Arrival time", required: true, options: ["18:00", "18:30", "19:00"] },
      ],
    },
  }} />;
}
