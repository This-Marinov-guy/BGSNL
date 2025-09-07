import React from "react";
import { FiX } from "react-icons/fi";
import PropTypes from "prop-types";

const AlumniModal = ({ isOpen, onClose, onJoinNow }) => {
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
        padding: "20px"
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div 
        className="alumni-modal"
        style={{
          backgroundColor: "white",
          borderRadius: "12px",
          padding: "30px",
          maxWidth: "600px",
          width: "100%",
          maxHeight: "80vh",
          overflow: "auto",
          position: "relative",
          boxShadow: "0 20px 40px rgba(0, 0, 0, 0.3)",
          scrollbarWidth: "none", // Firefox
          msOverflowStyle: "none", // IE and Edge
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
            transition: "all 0.2s ease"
          }}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = "#f5f5f5";
            e.target.style.color = "#333";
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = "transparent";
            e.target.style.color = "#666";
          }}
        >
          <FiX />
        </button>

        {/* Modal Content */}
        <div style={{ textAlign: "center", marginBottom: "25px" }}>
          <div style={{ fontSize: "48px", marginBottom: "15px" }}>🎓</div>
          <h2 style={{ 
            color: "#017363", 
            marginBottom: "10px",
            fontSize: "28px",
            fontWeight: "bold"
          }}>
            Join Our Alumni Program
          </h2>
          <p style={{ 
            color: "#666", 
            fontSize: "16px",
            marginBottom: "0"
          }}>
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
              objectFit: "cover",
              borderRadius: "8px",
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)"
            }}
            onError={(e) => {
              e.target.style.display = "none";
            }}
          />
        </div>

        {/* Program Benefits */}
        <div style={{ marginBottom: "25px" }}>
          <h3 style={{ 
            color: "#017363", 
            marginBottom: "15px",
            fontSize: "20px",
            fontWeight: "600"
          }}>
            Alumni Benefits
          </h3>
          <ul style={{ 
            listStyle: "none", 
            padding: 0,
            textAlign: "left"
          }}>
            <li style={{ 
              marginBottom: "10px", 
              display: "flex", 
              alignItems: "center",
              fontSize: "15px"
            }}>
              <span style={{ 
                color: "#017363", 
                marginRight: "10px",
                fontSize: "18px"
              }}>✓</span>
              Access to exclusive alumni events and networking opportunities
            </li>
            <li style={{ 
              marginBottom: "10px", 
              display: "flex", 
              alignItems: "center",
              fontSize: "15px"
            }}>
              <span style={{ 
                color: "#017363", 
                marginRight: "10px",
                fontSize: "18px"
              }}>✓</span>
              Mentorship programs for current students
            </li>
            <li style={{ 
              marginBottom: "10px", 
              display: "flex", 
              alignItems: "center",
              fontSize: "15px"
            }}>
              <span style={{ 
                color: "#017363", 
                marginRight: "10px",
                fontSize: "18px"
              }}>✓</span>
              Career development resources and job opportunities
            </li>
            <li style={{ 
              marginBottom: "10px", 
              display: "flex", 
              alignItems: "center",
              fontSize: "15px"
            }}>
              <span style={{ 
                color: "#017363", 
                marginRight: "10px",
                fontSize: "18px"
              }}>✓</span>
              Special discounts on events and merchandise
            </li>
            <li style={{ 
              marginBottom: "10px", 
              display: "flex", 
              alignItems: "center",
              fontSize: "15px"
            }}>
              <span style={{ 
                color: "#017363", 
                marginRight: "10px",
                fontSize: "18px"
              }}>✓</span>
              Alumni directory and networking platform
            </li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div style={{ 
          display: "flex", 
          gap: "15px", 
          justifyContent: "center",
          flexWrap: "wrap"
        }}>
          <button
            onClick={() => {
              onClose();
              onJoinNow();
            }}
            className="alumni-button"
            style={{ margin: 0 }}
          >
            <span className="alumni-icon">🎓</span>
            Join Now
          </button>
          <button
            onClick={onClose}
            style={{
              backgroundColor: "transparent",
              color: "#666",
              border: "2px solid #ddd",
              borderRadius: "8px",
              padding: "12px 24px",
              fontSize: "16px",
              fontWeight: "500",
              cursor: "pointer",
              transition: "all 0.3s ease"
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = "#f5f5f5";
              e.target.style.borderColor = "#999";
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = "transparent";
              e.target.style.borderColor = "#ddd";
            }}
          >
            Learn More
          </button>
        </div>
      </div>
    </div>
  );
};

AlumniModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onJoinNow: PropTypes.func.isRequired
};

export default AlumniModal;
