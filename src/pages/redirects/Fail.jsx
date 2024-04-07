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
      <h2 className="mb--40">Payment Error</h2>
      <p>
        Unfortunately, your payment was unsuccessful and you were NOT charged!
        If you need any help with the payment, please contact us!
      </p>
      <div className="options-btns-div">
        <Link className="rn-button-style--2 rn-btn-green mt--30" to="/">
          Home
        </Link>
        {prevUrl && <Link onClick={() => sessionStorage.removeItem('prevUrl')
        } className="rn-button-style--2 rn-btn-green mt--30" to={prevUrl}>
          Back To Event
        </Link>}
      </div>
    </Alert>
  );
};

export default Fail;
