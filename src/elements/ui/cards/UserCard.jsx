import React, { useState } from "react";
import { FiCheckCircle, FiEdit2, FiPlus, FiHelpCircle } from "react-icons/fi";
import { REGION_WHATSAPP } from "../../../util/defines/REGIONS_DESIGN";
import {
  ALUMNI,
} from "../../../util/defines/common";
import moment from "moment";
import PropTypes from "prop-types";
import { Tooltip } from "primereact/tooltip";
import { useHttpClient } from "../../../hooks/common/http-hook";
import { useDispatch } from "react-redux";
import { showNotification } from "../../../redux/notification";

const UserCard = ({ user }) => {
  const isAlumni = user.roles.includes(ALUMNI);
  const [isEditingQuote, setIsEditingQuote] = useState(false);
  const [quoteValue, setQuoteValue] = useState(user?.quote || "");
  const [isSavingQuote, setIsSavingQuote] = useState(false);
  const { sendRequest } = useHttpClient();
  const dispatch = useDispatch();

  // Check if user is tier 1+ alumni (tier >= 1)
  const hasPaidAlumniTier = isAlumni && user?.tier >= 1;

  const handleSaveQuote = async () => {
    try {
      setIsSavingQuote(true);
      const response = await sendRequest("user/alumni-quote", "PATCH", {
        quote: quoteValue,
      });

      if (response?.status === true) {
        dispatch(
          showNotification({
            severity: "success",
            detail: "Your quote has been saved successfully!",
          })
        );
        setIsEditingQuote(false);
        // Update the user object in local state or trigger a refetch
        window.location.reload(); // Simple solution, you might want to update state instead
      }
    } catch (err) {
      dispatch(
        showNotification({
          severity: "error",
          detail: "Failed to save quote. Please try again.",
        })
      );
      console.error("Error saving quote:", err);
    } finally {
      setIsSavingQuote(false);
    }
  };

  const handleCancelEdit = () => {
    setQuoteValue(user?.quote || "");
    setIsEditingQuote(false);
  };

  return (
    <div className="service gradient-border-2 mt--20">
      {/* <h2 className='archive-title' >Greetings, {user.name}!</h2> */}
      {/* <div className="hor_section mb--10">
        <p className="mt--10" style={{ fontFamily: "Archive" }}>
          {capitalizeFirstLetter(user.region, true)} <br />{" "}
          {formatRole(user.roles)}{" "}
        </p>
      </div> */}
      <div className="pricing-body">
        <div className="user-info-grid">
          {/* Personal Information Column */}
          <div className="user-info-column">
            <h4 className="column-title">Personal Information</h4>
            <ul className="list-style--1">
              <li>
                <span className="bold">Full Name: </span>
                {user.name + " " + user.surname}
              </li>
              {user?.birth && (
                <li>
                  <span className="bold">Date of Birth: </span>
                  {moment(user.birth).format("D MMM YYYY")}
                </li>
              )}
              <li>
                <span className="bold">Email: </span>
                {user.email}
              </li>
              {user?.phone && (
                <li>
                  <span className="bold">Phone: </span>
                  {user.phone}
                </li>
              )}
              {user?.university && (
                <li>
                  <span className="bold">University: </span>
                  {user.university === "other"
                    ? user.otherUniversityName
                    : user.university}
                </li>
              )}
            </ul>
          </div>

          {/* Community Links Column */}
          <div className="user-info-column">
            <h4 className="column-title">Community</h4>
            <ul className="list-style--1">
              {REGION_WHATSAPP[user.region] && (
                <li className="d-flex align-items-center">
                  <FiCheckCircle className="link-icon" />
                  <a
                    className="community-link"
                    href={REGION_WHATSAPP[user.region]}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Regional Member Chat
                  </a>
                </li>
              )}
              {isAlumni ? (
                <li className="d-flex align-items-center">
                  <FiCheckCircle className="link-icon" />
                  <a
                    className="community-link"
                    href={REGION_WHATSAPP["alumni"]}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Alumni Chat
                  </a>
                </li>
              ) : (
                <li>
                  <FiCheckCircle className="link-icon" />
                  <a
                    className="community-link"
                    href={REGION_WHATSAPP["netherlands"]}
                    target="_blank"
                    rel="noreferrer"
                  >
                    National Member Chat
                  </a>
                </li>
              )}
            </ul>
          </div>
        </div>

        {/* Alumni Quote Section - Only for tier 1+ */}
        {hasPaidAlumniTier && (
          <div className="user-quote-section mt--30">
            <div className="d-flex align-items-center justify-content-between mb--10">
              <h4 className="column-title mb--0 d-flex align-items-center">
                Alumni Quote
                <FiHelpCircle
                  className="quote-help-icon"
                  data-pr-tooltip="Your quote will be displayed on the Alumni Tree page for other members to see. Share your wisdom, experience, or a memorable moment!"
                  data-pr-position="top"
                  style={{
                    marginLeft: "8px",
                    cursor: "pointer",
                    color: "#017363",
                    fontSize: "16px",
                  }}
                />
              </h4>
              {!isEditingQuote && (
                <button
                  className="rn-button-style--2 rn-btn-small rn-btn-green"
                  onClick={() => setIsEditingQuote(true)}
                  style={{ fontSize: "12px", padding: "5px 15px" }}
                >
                  {user?.quote ? <><FiEdit2 size={12} /> Edit</> : <><FiPlus size={12} /> Add Quote</>}
                </button>
              )}
            </div>

            <Tooltip target=".quote-help-icon" style={{ maxWidth: "300px" }} />

            {isEditingQuote ? (
              <div>
                <textarea
                  className="rn-form-control"
                  value={quoteValue}
                  onChange={(e) => setQuoteValue(e.target.value)}
                  placeholder="Enter your quote here..."
                  rows={3}
                  maxLength={200}
                  style={{ marginBottom: "10px", width: "100%" }}
                />
                <div style={{ fontSize: "12px", color: "#666", marginBottom: "10px" }}>
                  {quoteValue.length}/200 characters
                </div>
                <div className="d-flex" style={{ gap: "10px" }}>
                  <button
                    className="rn-button-style--2 rn-btn-green"
                    onClick={handleSaveQuote}
                    disabled={isSavingQuote}
                    style={{ fontSize: "14px", padding: "8px 20px" }}
                  >
                    {isSavingQuote ? (
                      <>
                        <i className="pi pi-spin pi-spinner" style={{ marginRight: "8px" }}></i>
                        Saving...
                      </>
                    ) : (
                      "Save Quote"
                    )}
                  </button>
                  <button
                    className="rn-button-style--2 rn-btn-reverse-red"
                    onClick={handleCancelEdit}
                    disabled={isSavingQuote}
                    style={{ fontSize: "14px", padding: "8px 20px" }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div>
                {user?.quote ? (
                  <div
                    className="quote-display"
                    style={{
                      background: "#f9f9f9",
                      borderLeft: "4px solid #017363",
                      borderRadius: "4px",
                      padding: "15px",
                      fontStyle: "italic",
                      fontSize: "20px",
                    }}
                  >
                    &ldquo;{user.quote}&rdquo;
                  </div>
                ) : (
                  <p style={{ color: "#999", fontStyle: "italic" }}>
                    No quote added yet. Click &quot;Add Quote&quot; to share your message!
                  </p>
                )}
              </div>
            )}
          </div>
        )}

      </div>

    </div>
  );
};

UserCard.propTypes = {
  user: PropTypes.shape({
    id: PropTypes.string,
    name: PropTypes.string,
    surname: PropTypes.string,
    email: PropTypes.string,
    phone: PropTypes.string,
    birth: PropTypes.string,
    university: PropTypes.string,
    otherUniversityName: PropTypes.string,
    region: PropTypes.string,
    roles: PropTypes.array,
    subscription: PropTypes.object,
    quote: PropTypes.string,
    tier: PropTypes.number,
  }).isRequired,
};

export default UserCard;
