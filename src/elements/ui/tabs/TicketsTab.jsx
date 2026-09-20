"use client";

import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import PropTypes from "prop-types";
import ImagePreviewTrigger from "@/elements/ui/media/ImagePreviewTrigger";

import AlumniRegistrationButton from "../buttons/AlumniRegistrationButton";
import UserTabHeader from "./UserTabHeader";

const ImageGallery = dynamic(() => import("@/elements/ui/media/ImageGallery"), { ssr: false });
const EMPTY_TICKETS = [];

const TicketsTab = ({ currentUser }) => {
  // Check if user is tier 0 alumni
  const isTier0Alumni = currentUser?.tier === 0;
  // Index of the ticket being previewed; null when the viewer is closed.
  const [previewIndex, setPreviewIndex] = useState(null);
  const tickets = currentUser?.tickets ?? EMPTY_TICKETS;
  const galleryImages = useMemo(() => tickets.map((ticket, index) => ({
    src: ticket.image,
    alt: `Ticket ${index + 1}`,
    download: { url: ticket.image, filename: `ticket-${index + 1}.png` },
  })), [tickets]);
  const previewTicket = previewIndex === null ? null : tickets[previewIndex];

  return (
    <div className="tab-content-wrapper">
      <UserTabHeader title="Tickets" />
      <div className="tab-body">
        {isTier0Alumni ? (
          <div className="tier-restriction-card">
            <div className="restriction-icon">
              <img
                alt=""
                aria-hidden="true"
                className="restriction-icon-image"
                src="/assets/images/svg/3d/lock.png"
              />
            </div>
            <h4>Tickets Not Available</h4>
            <p>
              Ticket collection is not supported for Tier 0 alumni
              members. Upgrade your membership to gain access to exclusive
              ticket collection.
            </p>
            <AlumniRegistrationButton
              className="rn-button-style--2 rn-btn-reverse-red"
              asLink={false}
            >
              Upgrade Tier
            </AlumniRegistrationButton>
          </div>
        ) : currentUser && currentUser.tickets?.length > 0 ? (
          <div className="tickets-grid">
            {tickets.map((ticket, i) => (
              <div className="ticket-item" key={i}>
                <ImagePreviewTrigger
                  aria-label={`Preview ticket ${i + 1}`}
                  className="ticket-image"
                  imageClassName="ticket-image__image"
                  onClick={() => setPreviewIndex(i)}
                  src={ticket.image}
                  alt={`Ticket ${i + 1}`}
                  type="button"
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-icon">
              <img
                src="/assets/images/svg/3d/ticket.png"
                alt=""
                className="empty-icon-image"
              />
            </div>
            <h3>No Tickets Found</h3>
            <p>You haven&apos;t purchased any tickets yet.</p>
          </div>
        )}
      </div>

      {!isTier0Alumni && previewTicket?.image ? (
        <ImageGallery
          images={galleryImages}
          alt={`Ticket ${previewIndex + 1}`}
          fileName={`ticket-${previewIndex + 1}.png`}
          onClose={() => setPreviewIndex(null)}
          open
          src={previewTicket.image}
        />
      ) : null}
    </div>
  );
};

TicketsTab.propTypes = {
  currentUser: PropTypes.object.isRequired,
};

export default TicketsTab;
