import React from "react";
import { REGION_EMAIL } from "../../util/defines/REGIONS_DESIGN";

const Privacy = () => {
  return (
    <div className="container">
      <h2 className="center_text">
        Privacy Policy for Bulgarian Society Netherlands
      </h2>
      <h5 style={{ textAlign: "right" }}>Last updated: November 20, 2024</h5>
      <div className="mt--80 mb--80">
        <p className="ml--20">
          Bulgarian Society Netherlands ("we," "our," or "us") is committed to
          protecting your privacy in compliance with the General Data Protection
          Regulation (GDPR).
        </p>
        <h3 className="mt--40">Information We Collect and Use</h3>
        <ul className="list-style--1 ml--20">
          <li>Full names</li>
          <li>Phone number</li>
          <li>Birthdate</li>
          <li>Email addresses</li>
          <li>University name, course, student number, graduation year</li>
          <li>Payment information</li>
        </ul>
        <h3 className="mt--40">We use this information to:</h3>
        <ul className="list-style--1 ml--20">
          <li>Communicate with members</li>
          <li>Process memberships</li>
          <li>Complete e-transactions</li>
        </ul>
        <h3 className="mt--40">Legal Basis and Data Retention</h3>
        <p className="ml--20">
          We process data based on consent, contract fulfillment, and legitimate
          interests. Data is retained only as long as necessary for these
          purposes.
        </p>
        <h3 className="mt--40">Data Security and Sharing</h3>
        <p className="ml--20">
          We implement appropriate security measures to protect your data.
          Information is only shared with financial intermediaries for payment
          processing. We share your information with third parties only with
          your consent.
        </p>

        <h3 className="mt--40">Under GDPR, you have rights to:</h3>

        <ul className="list-style--1 ml--20">
          <li>Access your data</li>
          <li>Request corrections</li>
          <li>Request deletion</li>
          <li>Restrict processing</li>
          <li>Data portability</li>
          <li>Request deletion</li>
          <li>Object to processing</li>
          <li>Withdraw consent</li>
        </ul>

        <h3 className="mt--40">
          Contact us at:{" "}
          <a href={"mailto:" + REGION_EMAIL.netherlands}>
            {REGION_EMAIL.netherlands}
          </a>
        </h3>
      </div>
    </div>
  );
};

export default Privacy;
