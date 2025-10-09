import React from "react";
import Alert from "react-bootstrap/Alert";
import { Link } from "react-router-dom";

const Fail = () => {
  const prevUrl = sessionStorage.getItem('prevUrl')

  return (
    <div 
      className="d-flex justify-content-center align-items-center" 
      style={{ minHeight: "100vh", padding: "20px" }}
    >
      <Alert
        className="center_section"
        style={{ margin: "0", maxWidth: "800px", width: "100%" }}
        variant="danger"
      >
      <div className="d-flex justify-content-center mb--40">
        <img 
          src="/assets/icons/svgs/fail.svg" 
          alt="Failed" 
          style={{ width: "100px", height: "100px" }}
        />
      </div>
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
    </div>
  );
};

export default Fail;
