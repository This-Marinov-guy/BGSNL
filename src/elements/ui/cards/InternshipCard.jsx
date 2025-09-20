import React from "react";
import PropTypes from "prop-types";
import { GOOGLE_FORM_APPLICATION } from "../../../util/defines/INTERNSHIPS";

const InternshipCard = (props) => {
  const {
    logo,
    company,
    specialty,
    location,
    logoClass,
    duration,
    languages,
    description,
    bonuses,
    requirements,
    website,
  } = props.internship;
  const { user, isPreview = false } = props;

  return (
    <div className="row border-1 intern-card mt--10 mr--10">
      <div
        style={{ width: "20em" }}
        className="d-flex justify-content-between mb--10 text-right"
      >
        <img
          src={
            logo ||
            "https://t2.uc.ltmcdn.com/en/posts/2/8/0/how_do_internships_work_11082_orig.jpg"
          }
          className={"responsive_img " + (logoClass || "")}
          alt="Company Logo"
        ></img>
        <div className="d-flex flex-column align-items-end justify-content-center">
          <h3>{company}</h3>
          <div className="d-flex align-items-center justify-content-evenly g--3">
            <div style={{ backgroundColor: "green" }} className="dot" />
            <h5 className="mt--10 text-break" style={{ maxWidth: "8em" }}>
              {specialty}
            </h5>
          </div>
        </div>
      </div>

      <div className=" d-flex justify-content-evenly text-break g--2">
        <div className="bg-1">
          <p style={{ padding: "10px", minWidth: "5em" }}>{location}</p>
        </div>

        <div className="bg-1 text-break ">
          <p style={{ padding: "10px", minWidth: "7em" }}>
            DURATION:
            <br /> {duration}
          </p>
        </div>

        <div className="bg-1 text-break">
          <p style={{ padding: "10px", minWidth: "5em" }}>{bonuses}</p>
        </div>
      </div>

      <div className="col-12 d-flex flex-column align-items-start justify-content-start text-break bg-1 mt--10">
        <h4>Requirements:</h4>
        <p>{requirements} </p>
      </div>

      <div className="col-12 d-flex flex-column align-items-start justify-content-start text-break bg-1 mt--10">
        <h4>Languages:</h4>
        <p>{languages} </p>
      </div>

      <div className="col-12 d-flex flex-column align-items-start justify-content-start text-break bg-1 mt--10">
        <h4>Description:</h4>
        <p>{description}</p>
      </div>

      <div style={{ width: "100%" }}>
        <a
          href={website}
          target="_blank"
          rel="noreferrer"
          style={{ width: "100%" }}
          className="rn-button-style--2 rn-btn-green"
        >
          Visit Website
        </a>
      </div>

      {!isPreview && (
        <div style={{ width: "100%" }}>
          {/*  {contactMail ? (
            <a
              href={`mailto:${contactMail}?${BGSNL_INTERNSHIP_MAIL_SUBJECT}`}
              style={{ width: "100%", textAlign: "center" }}
              className="rn-button-style--2 rn-btn-solid-red"
            >
              Contact Internship
            </a>
          ) : ( */}
          <a
            href={GOOGLE_FORM_APPLICATION(company, specialty, user)}
            target="_blank"
            rel="noreferrer"
            style={{ width: "100%", textAlign: "center" }}
            className="rn-button-style--2 rn-btn-solid-red"
          >
            Apply for Internship
          </a>
          {/* )} */}
        </div>
      )}
      
      {isPreview && (
        <div style={{ width: "100%" }}>
          <div className="preview-notice">
            <p>🔒 <strong>Join our community to apply for this and other opportunities</strong></p>
          </div>
        </div>
      )}
    </div>
  );
};

InternshipCard.propTypes = {
  internship: PropTypes.shape({
    logo: PropTypes.string,
    company: PropTypes.string.isRequired,
    specialty: PropTypes.string.isRequired,
    location: PropTypes.string.isRequired,
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
};

export default InternshipCard;
