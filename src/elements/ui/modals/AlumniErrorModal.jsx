import React from "react";
import { FiX, FiAlertTriangle } from "react-icons/fi";
import PropTypes from "prop-types";

const AlumniErrorModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div
      className="modal-overlay"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 10000,
        padding: "20px",
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        className="alumni-error-modal"
        style={{
          backgroundColor: "white",
          borderRadius: "12px",
          padding: "30px",
          maxWidth: "500px",
          width: "100%",
          position: "relative",
          boxShadow: "0 20px 40px rgba(0, 0, 0, 0.3)",
          textAlign: "center",
        }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: "15px",
            right: "15px",
            background: "none",
            border: "none",
            fontSize: "24px",
            cursor: "pointer",
            color: "#666",
            padding: "5px",
            borderRadius: "50%",
            width: "35px",
            height: "35px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <FiX />
        </button>

        {/* Error Icon */}
        <div style={{ marginBottom: "20px", color: "#dc3545", fontSize: "48px" }}>
          <FiAlertTriangle />
        </div>

        {/* Error Message */}
        <h2
          style={{
            color: "#dc3545",
            marginBottom: "15px",
            fontSize: "24px",
            fontWeight: "bold",
          }}
        >
          Already an Alumni
        </h2>
        <p
          style={{
            color: "#666",
            fontSize: "16px",
            marginBottom: "25px",
          }}
        >
          Your account is already registered as an Alumni member. You cannot register again.
        </p>

        {/* Action Button */}
        <button
          onClick={onClose}
          className="rn-button-style--2 rn-btn-reverse-green"
          style={{ margin: "0 auto" }}
        >
          Close
        </button>
      </div>
    </div>
  );
};

AlumniErrorModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default AlumniErrorModal;
