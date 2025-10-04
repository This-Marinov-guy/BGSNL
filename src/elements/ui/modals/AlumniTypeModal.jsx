import React, { useState } from "react";
import { FiX, FiCheck } from "react-icons/fi";
import PropTypes from "prop-types";
import { ALUMNI_MEMBERSHIP_SPECIFICS } from "../../../util/defines/ALUMNI";
import { Badge } from "primereact/badge";
import { useNavigate } from "react-router-dom";
import { useHttpClient } from "../../../hooks/common/http-hook";
import Loader from "../loading/Loader";
import { useDispatch } from "react-redux";
import { showNotification } from "../../../redux/notification";

const AlumniTypeModal = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { loading, sendRequest } = useHttpClient();
  const [processingTier, setProcessingTier] = useState(null);

  const dispatch = useDispatch();

  if (!isOpen) return null;

  const handleSelectMembership = async (index) => {
    try {
      setProcessingTier(index);
      const membership = ALUMNI_MEMBERSHIP_SPECIFICS[index];
      
      // Make API call to checkout/general with alumni_migration method
      const response = await sendRequest(
        "payment/subscription/general",
        "POST",
        {
          method: "alumni_migration",
          tier: membership.id,
          period: membership.period,
          itemId: membership.itemId,
          priceId: membership.itemId,
          origin_url: window.location.origin,
        }
      );

      // If we get a URL back, redirect to it
      if (response && response.url) {
        window.location.assign(response.url);
      } 
    } catch (error) {
      dispatch(
        showNotification({
          severity: "error",
          summary: "You got an error :(",
          detail: "Something went wrong. Please try again later or contact support.",
        })
      );
      console.error("Error processing alumni migration:", error);
    } finally {
      setProcessingTier(null);
      onClose();
    }
  };

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
        className="alumni-type-modal"
        style={{
          backgroundColor: "white",
          borderRadius: "12px",
          padding: "30px",
          maxWidth: "900px",
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
            transition: "all 0.2s ease",
          }}
        >
          <FiX />
        </button>

        {/* Modal Header */}
        <div style={{ textAlign: "center", marginBottom: "25px" }}>
          <h2
            style={{
              color: "#017363",
              marginBottom: "20px",
              fontSize: "28px",
              fontWeight: "bold",
            }}
          >
            Choose Your Alumni Tier
          </h2>
          <p
            style={{
              color: "#666",
              fontSize: "16px",
              marginBottom: "0",
            }}
          >
            Select the membership tier that best fits your needs
          </p>
        </div>

        {/* Membership Options */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "20px",
            justifyContent: "center",
          }}
        >
          {ALUMNI_MEMBERSHIP_SPECIFICS.map((membership, index) => (
            <div
              key={index}
              style={{
                width: "calc(25% - 15px)",
                minWidth: "200px",
                maxWidth: "250px",
              }}
            >
              <button
                style={{
                  backgroundColor: "white",
                  border: `2px solid ${membership.borderColor ?? "#ddd"}`,
                  borderRadius: "10px",
                  padding: "20px",
                  width: "100%",
                  textAlign: "left",
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                  boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
                  position: "relative",
                  display: "flex",
                  flexDirection: "column",
                  height: "100%",
                }}
                onClick={() => handleSelectMembership(index)}
              >
                {membership?.label?.text && (
                  <Badge
                    style={{
                      position: "absolute",
                      top: "-10px",
                      right: "-10px",
                      backgroundColor: membership.label.color,
                    }}
                    value={membership.label.text}
                  />
                )}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    marginBottom: "15px",
                  }}
                >
                  <div style={{ marginRight: "15px" }}>{membership.icon}</div>
                  <h3 style={{ margin: 0, fontSize: "20px", color: "#017363" }}>
                    {membership.title}
                  </h3>
                </div>
                <div style={{ marginBottom: "15px" }}>
                  <h4 style={{ fontSize: "24px", margin: "0 0 5px 0" }}>
                    {membership.price}€{" "}
                    <span style={{ fontSize: "16px", color: "#666" }}>
                      / month
                    </span>
                  </h4>
                </div>
                {membership?.benefits && (
                  <ul
                    style={{
                      listStyle: "none",
                      padding: 0,
                      margin: 0,
                      flexGrow: 1,
                    }}
                  >
                    {membership.benefits.map((benefit, idx) => (
                      <li
                        key={idx}
                        style={{
                          color: benefit.strike ? "#999" : "inherit",
                          display: "flex",
                          alignItems: "flex-start",
                          marginBottom: "8px",
                          fontSize: "14px",
                        }}
                      >
                        {benefit.strike ? (
                          <FiX
                            style={{
                              marginRight: "8px",
                              color: "#dc3545",
                              fontSize: "16px",
                              flexShrink: 0,
                              marginTop: "2px",
                            }}
                          />
                        ) : (
                          <FiCheck
                            style={{
                              marginRight: "8px",
                              color: "#28a745",
                              fontSize: "16px",
                              flexShrink: 0,
                              marginTop: "2px",
                            }}
                          />
                        )}
                        <span>{benefit.text}</span>
                      </li>
                    ))}
                  </ul>
                )}
                <button
                  className="rn-button-style--2 rn-btn-green"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSelectMembership(index);
                  }}
                  disabled={loading || processingTier !== null}
                >
                  {processingTier === index ? <Loader small /> : "Select"}
                </button>
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

AlumniTypeModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default AlumniTypeModal;
