import React, { useState } from "react";
import PropTypes from "prop-types";
import { GOOGLE_FORM_APPLICATION } from "../../../util/defines/INTERNSHIPS";
import InternshipApplyModal from "../modals/InternshipApplyModal";
import { DOCUMENT_TYPES } from "../../../util/defines/enum";

const InternshipCard = (props) => {
  const {
    logo,
    company,
    specialty,
    location,
    label,
    logoClass,
    duration,
    languages,
    description,
    bonuses,
    requirements,
    website,
  } = props.internship;
  const { user, isPreview = false, onUserRefresh } = props;
  const [showApplyModal, setShowApplyModal] = useState(false);

  const cvDocument = user?.documents?.find(
    (document) => document.type === DOCUMENT_TYPES.CV
  );

  const handleApply = async (documents) => {
    // Redirect to Google Form with application
    // const formUrl = GOOGLE_FORM_APPLICATION(company, specialty, user);
    // window.open(formUrl, "_blank");
    setShowApplyModal(false);
  };

  // Consistent styles for all titles and text
  const titleStyle = {
    marginBottom: "8px",
    fontSize: "16px",
    fontWeight: 700,
    color: "#374151",
    textTransform: "uppercase",
    letterSpacing: "0.5px"
  };

  const textStyle = {
    fontSize: "16px",
    lineHeight: "1.6",
    color: "#4b5563",
    margin: 0
  };

  return (
    <div className="intern-card border-1 mt--10 mr--10" style={{ padding: "20px", borderRadius: "12px" }}>
      {/* Header Section with Logo and Company Info */}
      <div className="d-flex justify-content-between align-items-start mb--20" style={{ gap: "15px" }}>
        <div style={{ flex: "0 0 auto", maxWidth: "120px" }}>
          <img
            src={
              logo ||
              "https://t2.uc.ltmcdn.com/en/posts/2/8/0/how_do_internships_work_11082_orig.jpg"
            }
            className={"responsive_img " + (logoClass || "")}
            alt="Company Logo"
            style={{ width: "100%", height: "auto", objectFit: "contain", maxHeight: "80px" }}
          />
        </div>
        <div className="d-flex flex-column align-items-end justify-content-center" style={{ flex: "1 1 auto" }}>
          <h3 className="mb--5">{company}</h3>
          <div className="d-flex align-items-center justify-content-end" style={{ gap: "8px", marginBottom: "8px" }}>
            <div style={{ backgroundColor: "#10b981", width: "8px", height: "8px", borderRadius: "50%" }} />
            <h5 className="text-break mb--0" style={{ maxWidth: "12em", fontSize: "16px" }}>
              {specialty}
            </h5>
          </div>
          {label && (
            <span
              style={{
                backgroundColor: "#e0f2fe",
                color: "#0c4a6e",
                borderRadius: "9999px",
                padding: "4px 12px",
                fontSize: "11px",
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.5px"
              }}
            >
              {label}
            </span>
          )}
        </div>
      </div>

      {/* Quick Info Pills */}
      <div className="d-flex flex-wrap mb--15" style={{ gap: "10px" }}>
        <div className="bg-1" style={{ padding: "10px 15px", borderRadius: "8px", flex: "1 1 auto", minWidth: "140px" }}>
          <h6 style={titleStyle}>Location</h6>
          <p style={textStyle}>{location}</p>
        </div>

        <div className="bg-1" style={{ padding: "10px 15px", borderRadius: "8px", flex: "1 1 auto", minWidth: "140px" }}>
          <h6 style={titleStyle}>Duration</h6>
          <p style={textStyle}>{duration}</p>
        </div>

        <div className="bg-1" style={{ padding: "10px 15px", borderRadius: "8px", flex: "1 1 auto", minWidth: "140px" }}>
          <h6 style={titleStyle}>Benefits</h6>
          <p style={textStyle}>{bonuses}</p>
        </div>
      </div>

      {/* Detailed Information Sections */}
      <div className="bg-1 mb--10" style={{ padding: "15px", borderRadius: "8px" }}>
        <h6 style={titleStyle}>Description</h6>
        <p style={textStyle}>{description}</p>
      </div>

      <div className="bg-1 mb--10" style={{ padding: "15px", borderRadius: "8px" }}>
        <h6 style={titleStyle}>Requirements</h6>
        <p style={textStyle}>{requirements}</p>
      </div>

      <div className="bg-1 mb--15" style={{ padding: "15px", borderRadius: "8px" }}>
        <h6 style={titleStyle}>Languages</h6>
        <p style={textStyle}>{languages}</p>
      </div>

      {/* Action Buttons */}
      <div className="d-flex flex-column" style={{ gap: "10px" }}>
        <a
          href={website}
          target="_blank"
          rel="noreferrer"
          className="rn-button-style--2 rn-btn-green"
          style={{ width: "100%", textAlign: "center", padding: "12px 24px", fontSize: "15px", fontWeight: 600 }}
        >
          Visit Website
        </a>

        {!isPreview && (
          <>
            <button
              onClick={() => setShowApplyModal(true)}
              className="rn-button-style--2 rn-btn-solid-red"
              style={{ width: "100%", textAlign: "center", padding: "12px 24px", fontSize: "15px", fontWeight: 600, border: "none", cursor: "pointer" }}
            >
              Apply for Internship
            </button>
            <InternshipApplyModal
              visible={showApplyModal}
              onHide={() => setShowApplyModal(false)}
              internship={props.internship}
              user={user}
              cvDocument={cvDocument}
              onApply={handleApply}
              onUserRefresh={onUserRefresh}
            />
          </>
        )}
        
        {isPreview && (
          <div className="preview-notice">
            <p style={{ margin: 0, fontSize: "14px" }}><strong>Join our community to apply for this and other opportunities</strong></p>
          </div>
        )}
      </div>
    </div>
  );
};

InternshipCard.propTypes = {
  internship: PropTypes.shape({
    logo: PropTypes.string,
    company: PropTypes.string.isRequired,
    specialty: PropTypes.string.isRequired,
    location: PropTypes.string.isRequired,
    label: PropTypes.string,
    logoClass: PropTypes.string,
    duration: PropTypes.string.isRequired,
    languages: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    bonuses: PropTypes.string.isRequired,
    requirements: PropTypes.string.isRequired,
    contactMail: PropTypes.string,
    applyLink: PropTypes.string,
    website: PropTypes.string.isRequired,
  }).isRequired,
  user: PropTypes.object,
  isPreview: PropTypes.bool,
  onUserRefresh: PropTypes.func,
};

export default InternshipCard;
