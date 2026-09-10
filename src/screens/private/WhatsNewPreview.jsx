"use client";

import { useCallback, useState } from "react";
import WhatsNewModal from "@/elements/campaigns/WhatsNewModal";

// Visual preview only: no account requests and no campaignsSeen writes.
export default function WhatsNewPreview() {
  const [open, setOpen] = useState(true);
  const close = useCallback(() => setOpen(false), []);
  return (
    <main className="container py-5">
      <h1>Account announcement preview</h1>
      <button type="button" className="rn-button-style--2 rn-btn-reverse-green" onClick={() => setOpen(true)}>Open What’s new</button>
      <WhatsNewModal open={open} onClose={close} />
    </main>
  );
}
