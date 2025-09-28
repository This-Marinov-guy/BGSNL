import React from "react";
import PropTypes from "prop-types";
import { FiLock } from "react-icons/fi";
import { Image } from "primereact/image";
import { useAlumniRegistration } from "../../../hooks/alumni/use-alumni-registration";
import AlumniRegistrationButton from "../buttons/AlumniRegistrationButton";

const TicketsTab = ({ currentUser, navigate }) => {
  // Check if user is tier 0 alumni
  const isTier0Alumni = true; // currentUser?.tier === 0 && currentUser?.roles?.includes('alumni');
  const { handleAlumniRegistrationClick } = useAlumniRegistration();
  
  return (
    <div className="tab-content-wrapper">
      <div className="tab-header">
        <h2>Ticket Collection</h2>
        <p>View and manage your purchased event tickets.</p>
      </div>
      <div className="tab-body">
        {isTier0Alumni ? (
          <div className="tier-restriction-card">
            <div className="restriction-icon">
              <FiLock />
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
            {currentUser.tickets.map((ticket, i) => (
              <div className="ticket-item" key={i}>
                <Image
                  src={ticket.image}
                  alt={`Ticket ${i+1}`}
                  preview
                  className="ticket-image"
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-icon">{"🎫"}</div>
            <h3>No Tickets Found</h3>
            <p>You haven't purchased any tickets yet.</p>
          </div>
        )}
      </div>
    </div>
  );
};

TicketsTab.propTypes = {
  currentUser: PropTypes.object.isRequired,
  navigate: PropTypes.func.isRequired,
};

export default TicketsTab;
