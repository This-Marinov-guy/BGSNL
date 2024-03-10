import React from "react";
import Alert from "react-bootstrap/Alert";
import { Link } from "react-router-dom";

const SuccessDonation = () => {
  return (
    <Alert
      className="center_section"
      style={{ margin: "50px" }}
      variant="success"
    >
      <h2 className="mb--40">Thank you!</h2>
      <p>
        Your help means a lot! Keep being awesome and help communities develop!
      </p>
      <Link className="rn-button-style--2 rn-btn-green mt--40" to="/">
        Home
      </Link>
    </Alert>
  );
};

export default SuccessDonation;
