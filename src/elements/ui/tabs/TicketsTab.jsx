"use client";

import { useState } from "react";
import PropTypes from "prop-types";
import {
  FiEye,
} from "@/elements/ui/icons/IconlyIcons";
import MediaPreview from "@/elements/ui/media/MediaPreview";
import AlumniRegistrationButton from "../buttons/AlumniRegistrationButton";
import UserTabHeader from "./UserTabHeader";

const TicketsTab = ({ currentUser }) => {
  // Check if user is tier 0 alumni
  const isTier0Alumni = currentUser?.tier === 0;
  // Index of the ticket being previewed; null when the viewer is closed.
  const [previewIndex, setPreviewIndex] = useState(null);
  const tickets = currentUser?.tickets ?? [];
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
                <button
                  aria-label={`Preview ticket ${i + 1}`}
                  className="media-trigger ticket-image"
                  onClick={() => setPreviewIndex(i)}
                  type="button"
                >
                  <img alt={`Ticket ${i + 1}`} src={ticket.image} />
                  <span aria-hidden="true" className="media-trigger__overlay">
                    <span className="media-trigger__eye">
                      <FiEye size="1.4rem" />
                    </span>
                  </span>
                </button>
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

      {previewTicket ? (
        <MediaPreview
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
