import React, { useState, useEffect } from "react";
import { useHttpClient } from "../../../hooks/http-hook";
import Loader from "../loading/Loader";
import { Link } from "react-router-dom";
import { Dialog } from 'primereact/dialog';
import { useDispatch, useSelector } from "react-redux";
import { REGIONS_MEMBERSHIP_SPECIFICS, findMembershipByProperty } from "../../../util/defines/REGIONS_AUTH_CONFIG";
import { showNotification } from "../../../redux/notification";
import { selectUser } from "../../../redux/user";
import { decodeJWT } from "../../../util/functions/authorization";
import { isProd } from "../../../util/functions/helpers";

const Locked = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);

  const { loading, sendRequest } = useHttpClient();

  const user = useSelector(selectUser);
  const userId = decodeJWT(user.token).userId;

  const dispatch = useDispatch();

  useEffect(() => {
    if (!user.token) {
      sessionStorage.setItem('prevUrl', routePath);
      return navigate('/login');
    }

    const fetchCurrentUser = async () => {
      try {
        const responseData = await sendRequest(`user/${userId}`);
        setCurrentUser(responseData.user);
        setIsLoaded(true);
      } catch (err) {
      }
    };
    fetchCurrentUser();
  }, []);

  const handleManageSubscription = async () => {
    if (!userId || !currentUser.subscription) {
      dispatch(showNotification({ severity: 'error', detail: "There was an error with your request - please contact support!" }));
      return;
    }

    try {
      const responseData = await sendRequest(
        "payment/subscription/customer-portal",
        "POST",
        {
          customerId: currentUser.subscription.customerId,
          url: window.location.href,
          userId: userId
        },
      );
      if (responseData.url) {
        window.location.assign(responseData.url);
      }
    } catch (err) { }
  }

  const handleCreateSubscription = async (id = 1) => {
    const membership = findMembershipByProperty('id', id);

    if (!userId || !membership.renewItemId || !membership.period) {
      dispatch(showNotification({ severity: 'error', detail: "There was an error with your request - please contact support!" }));
      return;
    }

    try {
      const responseData = await sendRequest(
        "payment/subscription/general",
        "POST",
        {
          itemId: membership.renewItemId,
          period: membership.period,
          origin_url: window.location.origin,
          method: "unlock_account",
          userId: userId,
        },
      );
      if (responseData.url) {
        window.location.assign(responseData.url);
      }
    } catch (err) {
      !isProd() && console.log(err);
    }
  };


  const actionButtons = currentUser && currentUser.subscription ?
    <button
      disabled={loading}
      onClick={handleManageSubscription}
      className="rn-button-style--2 rn-btn-reverse-green mt--40"
    >
      {loading ? <Loader /> : <span>Manage Subscription</span>}
    </button> 
    :
    <div className="center_div_col mt--20" style={{ gap: '15px' }}>
      {REGIONS_MEMBERSHIP_SPECIFICS.map((option, index) => {
        return <button
          key={index}
          disabled={loading}
          onClick={() => handleCreateSubscription(option.id)}
          className={'rn-button-style--2 rn-btn-reverse-green'}>Extend with {option.period} months</button>
      })}
    </div>

  if (!isLoaded) {
    return <Loader />
  }

  return (
    <Dialog modal visible={currentUser.status === 'locked'} blockScroll={true} closable={false}>
      <div className="center_section">
        <h3>
          {currentUser.status === "locked"
            ? "Your account is locked!"
            : "Your account is suspended!"}
        </h3>
        <p className="center_text">
          {currentUser.status === "locked"
            ? "To continue using the benefits of a member please make the subscription payment (cancel anytime)! Otherwise, log out of your account."
            : "We have noticed some violation from your side. Unfortunately, we will need to block your account until further notice. Please contact: bgsn.tech.nl@gmail.com"}
        </p>
        {currentUser.status === "locked" && actionButtons}
        <Link to="/" className="rn-button-style--2 rn-btn-reverse mt--40">
          Back to Home
        </Link>
      </div>
    </Dialog>
  );
};

export default Locked;
