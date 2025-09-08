import React from "react";
import { FiX } from "react-icons/fi";
import PropTypes from "prop-types";

const AlumniUserModal = ({ isOpen, isClosing, user, onClose }) => {
  if (!isOpen || !user) return null;

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
        animation: isClosing ? "fadeOut 0.3s ease-in" : "fadeIn 0.3s ease-out"
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div 
        className="user-modal"
        style={{
          backgroundColor: "white",
          borderRadius: "12px",
          padding: "30px",
          maxWidth: "500px",
          width: "100%",
          maxHeight: "80vh",
          overflow: "auto",
          position: "relative",
          boxShadow: "0 20px 40px rgba(0, 0, 0, 0.3)",
          scrollbarWidth: "none", // Firefox
          msOverflowStyle: "none", // IE and Edge
          animation: isClosing ? "slideOutDown 0.3s ease-in" : "slideInUp 0.3s ease-out",
          border: `4px solid ${
            user.tier === "platinum" ? "#e5e4e2" :
            user.tier === "gold" ? "#FFD700" :
            user.tier === "silver" ? "#C0C0C0" :
            user.tier === "bronze" ? "#CD7F32" :
            "#017363"
          }`
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
          <div
            style={{
              width: "120px",
              height: "120px",
              overflow: "hidden",
              borderRadius: "50%",
              margin: "0 auto 20px",
              border: `4px solid ${
                user.tier === "platinum" ? "#e5e4e2" :
                user.tier === "gold" ? "#FFD700" :
                user.tier === "silver" ? "#C0C0C0" :
                user.tier === "bronze" ? "#CD7F32" :
                "#017363"
              }`,
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)"
            }}
          >
            <img
              src={user.avatar}
              alt={user.name}
              style={{ 
                width: "100%", 
                height: "100%", 
                objectFit: "cover" 
              }}
              onError={(e) => {
                e.target.style.display = "none";
              }}
            />
          </div>
          <h2 style={{ 
            color: "#017363", 
            marginBottom: "10px",
            fontSize: "24px",
            fontWeight: "bold"
          }}>
            {user.name}
          </h2>
          <p style={{ 
            color: "#666", 
            fontSize: "16px",
            marginBottom: "0"
          }}>
            {user.tier ? 
              `Tier ${user.tier.charAt(0).toUpperCase() + user.tier.slice(1)} Alumni` : 
              "Alumni"
            }
          </p>
        </div>

        {/* Join Date */}
        {user.joinDate && (
          <div style={{ marginBottom: "25px", textAlign: "center" }}>
            <p style={{ 
              color: "#666", 
              fontSize: "14px",
              margin: 0
            }}>
              Member since {new Date(user.joinDate).toLocaleDateString()}
            </p>
          </div>
        )}

        {/* Quote */}
        {user.quote && (
          <div style={{ marginBottom: "25px" }}>
            <div
              className="quote-container p--30"
              style={{
                background: "#f9f9f9",
                borderLeft: `4px solid ${
                  user.tier === "platinum" ? "#e5e4e2" : "#FFD700"
                }`,
                borderRadius: "4px",
              }}
            >
              <blockquote style={{ 
                margin: 0, 
                fontStyle: "italic",
                fontSize: "16px",
                lineHeight: "1.5"
              }}>
                &ldquo;{user.quote}&rdquo;
              </blockquote>
            </div>
          </div>
        )}

        {/* No quote message */}
        {/* {!user.quote && (
          <div style={{ 
            textAlign: "center", 
            color: "#999", 
            fontStyle: "italic",
            marginBottom: "25px"
          }}>
            No quote available for this member
          </div>
        )} */}
      </div>
    </div>
  );
};

AlumniUserModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  isClosing: PropTypes.bool.isRequired,
  user: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    name: PropTypes.string,
    avatar: PropTypes.string,
    tier: PropTypes.string,
    quote: PropTypes.string,
    joinDate: PropTypes.string,
  }),
  onClose: PropTypes.func.isRequired,
};

export default AlumniUserModal;
