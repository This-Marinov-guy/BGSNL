import React from "react";
import Alert from "react-bootstrap/Alert";
import { Link } from "react-router-dom";

const Fail = () => {
  const prevUrl = sessionStorage.getItem('prevUrl')

  return (
    <Alert
      className="center_section"
      style={{ margin: "50px" }}
      variant="danger"
    >
      <p>
        Unfortunately, your payment was unsuccessful and you were NOT charged!
        If you need any help with the payment, please contact support!
      </p>
      <div className="d-flex justify-content-center align-items-center g--5 mb--40">
        {!prevUrl && (
          <Link
            onClick={() => sessionStorage.removeItem("prevUrl")}
            className="rn-button-style--2 rn-btn-green mt--30"
            to={prevUrl}
          >
            Go Back
          </Link>
        )}
        <Link className="rn-button-style--2 rn-btn-green mt--30" to="/">
          Home
        </Link>
      </div>
    </Alert>
  );
};

export default Fail;
