import React from "react";
import Alert from "react-bootstrap/Alert";
import { Link } from "react-router-dom";

const Success = (props) => {
  const prevUrl = sessionStorage.getItem('prevUrl')

  return (
    <Alert
      className="center_section"
      style={{ margin: "50px" }}
      variant="success"
    >
      <h2 className="mb--40 center_text">Payment is Successful!</h2>
      <p>
        Your payment was Successful! Check your email for the invoice and enjoy&nbsp;&nbsp;your purchase! Hope to see you soon!
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
      <hr />
      <p className="information">
        If you have been mischarged, have not received your invoice or you face
        any other problems, do not hesitate to contact us!
      </p>
    </Alert>
  );
};

export default Success;
