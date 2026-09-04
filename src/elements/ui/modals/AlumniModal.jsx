import { useState } from "react";
import PropTypes from "prop-types";
import { Dialog } from "@/compat/primereact";
import AlumniTypeModal from "./AlumniTypeModal";

const AlumniModal = ({ isOpen, onClose, onJoinNow }) => {
  const actions = (
    <>
      <button
        onClick={onJoinNow}
        className="alumni-button"
        style={{ margin: 0 }}
        type="button"
      >
        <span className="alumni-icon">🎓</span>
        Join Now
      </button>
      <a
        href="/welcome-to-alumni"
        target="_blank"
        rel="noopener noreferrer"
        onClick={onClose}
        className="rn-button-style--2 rn-btn-reverse"
      >
        Learn More
      </a>
    </>
  );

  return (
    <Dialog
      header="Join Our Alumni Program"
      visible={isOpen}
      onHide={onClose}
      footer={actions}
      style={{ width: "600px" }}
      dismissableMask
    >
      <div
        className="alumni-modal"
        style={{
          width: "100%",
          scrollbarWidth: "none", // Firefox
          msOverflowStyle: "none", // IE and Edge
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "25px" }}>
          <p
            style={{
              color: "#666",
              marginBottom: "0",
            }}
          >
            Connect with fellow graduates and stay involved in our community
          </p>
        </div>

        {/* Alumni Image */}
        <div style={{ marginBottom: "25px", textAlign: "center" }}>
          <img
            src="/assets/images/alumni/alumni.jpeg"
            alt="Alumni Program"
            style={{
              width: "100%",
              maxWidth: "400px",
              height: "250px",
              objectFit: "contain",
              borderRadius: "8px",
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
            }}
            onError={(e) => {
              e.target.style.display = "none";
            }}
          />
        </div>

        {/* Program Benefits */}
        <div style={{ marginBottom: "25px" }}>
          <h3
            style={{
              color: "#017363",
              marginBottom: "15px",
            }}
          >
            Alumni Benefits
          </h3>
          <ul
            style={{
              listStyle: "none",
              padding: 0,
              textAlign: "left",
            }}
          >
            <li
              style={{
                marginBottom: "10px",
                display: "flex",
                alignItems: "center",
              }}
            >
              <span
                style={{
                  color: "#017363",
                  marginRight: "10px",
                }}
              >
                ✓
              </span>
              Access to exclusive alumni events and networking opportunities
            </li>
            <li
              style={{
                marginBottom: "10px",
                display: "flex",
                alignItems: "center",
              }}
            >
              <span
                style={{
                  color: "#017363",
                  marginRight: "10px",
                }}
              >
                ✓
              </span>
              Mentorship programs for current students
            </li>
            <li
              style={{
                marginBottom: "10px",
                display: "flex",
                alignItems: "center",
              }}
            >
              <span
                style={{
                  color: "#017363",
                  marginRight: "10px",
                }}
              >
                ✓
              </span>
              Career development resources and job opportunities
            </li>
            <li
              style={{
                marginBottom: "10px",
                display: "flex",
                alignItems: "center",
              }}
            >
              <span
                style={{
                  color: "#017363",
                  marginRight: "10px",
                }}
              >
                ✓
              </span>
              Special discounts on events and merchandise
            </li>
            <li
              style={{
                marginBottom: "10px",
                display: "flex",
                alignItems: "center",
              }}
            >
              <span
                style={{
                  color: "#017363",
                  marginRight: "10px",
                }}
              >
                ✓
              </span>
              Alumni directory and networking platform
            </li>
          </ul>
        </div>

        {/* Modal content ends here */}
      </div>
    </Dialog>
  );
};

// Wrapper component that handles both modals
const AlumniModalWithTypeSelection = ({ isOpen, onClose }) => {
  const [showTypeModal, setShowTypeModal] = useState(false);
  
  return (
    <>
      {isOpen && (
        <AlumniModal 
          isOpen={isOpen && !showTypeModal}
          onClose={onClose}
          onJoinNow={() => setShowTypeModal(true)}
        />
      )}
      <AlumniTypeModal 
        isOpen={showTypeModal} 
        onClose={() => {
          setShowTypeModal(false);
          onClose();
        }} 
      />
    </>
  );
};

AlumniModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onJoinNow: PropTypes.func.isRequired,
};

AlumniModalWithTypeSelection.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default AlumniModalWithTypeSelection;
