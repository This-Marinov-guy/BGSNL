import React, { useState } from "react";
import { useHttpClient } from "../../hooks/http-hook";
import Loader from "./Loader";
import { Link } from "react-router-dom";
import ModalWindow from "./ModalWindow";
import { useDispatch } from "react-redux";
import { showError } from "../../redux/error";
import { REGIONS_MEMBERSHIP_SPECIFICS } from "../../util/REGIONS_AUTH_CONFIG";

const Locked = (props) => {
  const { loading, sendRequest } = useHttpClient();

  const [membershipIndex, setMembershipIndex] = useState(0)

  const dispatch = useDispatch();

  const handleUnlock = async (index) => {
    if (!props.id) {
      dispatch(showError("User cannot be found, please try again"));
      return;
    }
    setMembershipIndex(index)
    try {
      const responseData = await sendRequest(
        "payment/checkout-no-file",
        "POST",
        {
          itemId: REGIONS_MEMBERSHIP_SPECIFICS[props.region][membershipIndex].renewItemId,
          period: REGIONS_MEMBERSHIP_SPECIFICS[props.region][membershipIndex].period,
          origin_url: window.location.origin,
          method: "unlock_account",
          userId: props.id,
        },
      );
      if (responseData.url) {
        window.location.assign(responseData.url);
      }
    } catch (err) { }
  };

  return (
    <ModalWindow static="static" show={props.show} freeze>
      <div style={{ padding: "40px" }} className="center_section">
        <h2>
          {props.case === "locked"
            ? "Your account is locked!"
            : "Your account is suspended!"}
        </h2>
        <p className="center_text">
          {props.case === "locked"
            ? "To continue using the benefits of a member please pay the fee subscription for the following term! Otherwise, log out of your account."
            : "We have noticed some violation from your side. Unfortunately, we will need to block your account until further notice. Please contact: bulgariansociety.gro@gmail.com"}
        </p>
        {props.case === "locked" && (REGIONS_MEMBERSHIP_SPECIFICS[props.region].length > 1 ?
          <ul className="brand-style-2">
            {REGIONS_MEMBERSHIP_SPECIFICS[props.region].map((option, index) => {
              return <li key={index} >
                <button disabled={loading}
                  onClick={() => handleUnlock(index)}
                  className={'rn-button-style--2 btn-solid'}>Extend with {option.period} year/s</button>
              </li>
            })}
          </ul> : <button
            disabled={loading}
            onClick={handleUnlock}
            className="rn-button-style--2 btn-solid mt--40"
          >
            {loading ? <Loader /> : <span>Proceed to paying</span>}
          </button>
        )}
        <Link to="/" className="rn-button-style--2 rn-btn-green mt--40">
          Back to Home
        </Link>
      </div>
    </ModalWindow>
  );
};

export default Locked;
