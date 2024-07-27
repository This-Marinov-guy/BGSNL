import React, { useState } from "react";
import { useHttpClient } from "../../hooks/http-hook";
import Loader from "./loading/Loader";
import { Link } from "react-router-dom";
import ModalWindow from "./ModalWindow";
import { useDispatch } from "react-redux";
import SubscriptionManage from "./SubscriptionManage";
import { showError } from "../../redux/error";
import { REGIONS_MEMBERSHIP_SPECIFICS } from "../../util/defines/REGIONS_AUTH_CONFIG";

const Locked = (props) => {
  const { loading, sendRequest } = useHttpClient();

  const [membershipIndex, setMembershipIndex] = useState(0)

  const dispatch = useDispatch();

  const handleManage = async () => {

  }

  const handleUnlock = async (index) => {
    if (!props.user.id) {
      dispatch(showError("User cannot be found, please try again"));
      return;
    }
    setMembershipIndex(index)
    if (REGIONS_MEMBERSHIP_SPECIFICS[membershipIndex].period == props.user.subscription.period) {
      try {
        const responseData = await sendRequest(
          "payment/customer-portal",
          "POST",
          {
            customerId: props.user.subscription.customerId,
            url: window.location.href,
            userId: props.user.id
          },
        );
        if (responseData.url) {
          window.location.assign(responseData.url);
        }
      } catch (err) { }
    }
    else {
      try {
        const responseData = await sendRequest(
          "payment/subscription-no-file",
          "POST",
          {
            itemId: REGIONS_MEMBERSHIP_SPECIFICS[membershipIndex].renewItemId,
            period: REGIONS_MEMBERSHIP_SPECIFICS[membershipIndex].period,
            origin_url: window.location.origin,
            method: "unlock_account",
            userId: props.user.id,
          },
        );
        if (responseData.url) {
          window.location.assign(responseData.url);
        }
      } catch (err) { }
    }
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
            ? "To continue using the benefits of a member please make the subscription payment (cancel anytime)! Otherwise, log out of your account."
            : "We have noticed some violation from your side. Unfortunately, we will need to block your account until further notice. Please contact: bgsn.tech.nl@gmail.com"}
        </p>
        {props.user.subscription && <SubscriptionManage userId={props.user.id} subscription={props.user.subscription} toast={props.toast}/>}
        {props.case === "locked" && (REGIONS_MEMBERSHIP_SPECIFICS.length > 1 ?
          <ul className="brand-style-2">
            {REGIONS_MEMBERSHIP_SPECIFICS.map((option, index) => {
              return <li key={index} >
                <button disabled={loading}
                  onClick={() => handleUnlock(index)}
                  className={'rn-button-style--2 rn-btn-reverse-green'}>Extend with {option.period} months</button>
              </li>
            })}
          </ul> : <button
            disabled={loading}
            onClick={handleUnlock}
            className="rn-button-style--2 rn-btn-reverse-green mt--40"
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
