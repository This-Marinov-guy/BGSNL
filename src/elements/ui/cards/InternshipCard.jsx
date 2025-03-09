import React from "react";
import { BGSNL_INTERNSHIP_MAIL_SUBJECT } from "../../../util/defines/common";

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
    contactMail,
    website,
  } = props.internship;

  return (
    <div
      className="col-lg-4 col-md-6 col-12 row border-1 intern-card mt--10"
    >
      <div
        style={{ width: "20em" }}
        className="d-flex justify-content-between mb--10 text-right"
      >
        <img
          src={
            logo ||
            "https://t2.uc.ltmcdn.com/en/posts/2/8/0/how_do_internships_work_11082_orig.jpg"
          }
          className={"responsive_img " + logoClass ?? ""}
          alt="Company Logo"
        ></img>
        <div className="d-flex flex-column align-items-end justify-content-center">
          <h3>{company}</h3>
          <div className="d-flex align-items-center justify-content-evenly g--3">
            <div style={{ backgroundColor: "green" }} className="dot" />
            <h5 className="mt--10 text-break" style={{maxWidth: '8em'}}>{specialty}</h5>
          </div>
        </div>
      </div>

      <div className=" d-flex justify-content-evenly text-break g--2">
        <div className="bg-1">
          <p style={{ padding: "10px", minWidth: '5em' }}>{location}</p>
        </div>

        <div className="bg-1 text-break ">
          <p style={{ padding: "10px", minWidth: '7em' }}>
            DURATION:
            <br /> {duration}
          </p>
        </div>

        <div className="bg-1 text-break">
          <p style={{ padding: "10px", minWidth: '5em' }}>{bonuses}</p>
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

      <div style={{ width: "100%" }}>
        <a
          href={`mailto:${contactMail}?${BGSNL_INTERNSHIP_MAIL_SUBJECT}`}
          style={{ width: "100%", textAlign: "center" }}
          className="rn-button-style--2 rn-btn-solid-red"
        >
          Contact Internship
        </a>
      </div>
    </div>
  );
};

export default InternshipCard;
