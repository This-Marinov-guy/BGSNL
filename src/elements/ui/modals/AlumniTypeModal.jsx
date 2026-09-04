import { useState } from "react";
import PropTypes from "prop-types";
import { useDispatch } from "react-redux";
import { Badge, Dialog } from "@/compat/primereact";
import {
  FiCheck,
  FiX,
} from "@/elements/ui/icons/IconlyIcons";
import { useHttpClient } from "../../../hooks/common/http-hook";
import { showNotification } from "../../../redux/notification";
import { ALUMNI_MEMBERSHIP_SPECIFICS } from "../../../util/defines/ALUMNI";
import Loader from "../loading/Loader";

const AlumniTypeModal = ({ isOpen, onClose }) => {
  const { loading, sendRequest } = useHttpClient();
  const [processingTier, setProcessingTier] = useState(null);

  const dispatch = useDispatch();

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
    <Dialog
      header="Choose Your Alumni Tier"
      visible={isOpen}
      onHide={onClose}
      style={{ width: "900px" }}
      dismissableMask
    >
      <div
        className="alumni-type-modal"
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
                  <h3 style={{ margin: 0, color: "#017363" }}>
                    {membership.title}
                  </h3>
                </div>
                <div style={{ marginBottom: "15px" }}>
                  <h4 style={{ margin: "0 0 5px 0" }}>
                    {membership.price}€{" "}
                    <span style={{ color: "#666" }}>
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
                        }}
                      >
                        {benefit.strike ? (
                          <FiX
                            style={{
                              marginRight: "8px",
                              color: "#dc3545",
                              flexShrink: 0,
                              marginTop: "2px",
                            }}
                          />
                        ) : (
                          <FiCheck
                            style={{
                              marginRight: "8px",
                              color: "#28a745",
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
    </Dialog>
  );
};

AlumniTypeModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default AlumniTypeModal;
