import React from "react";
import { useHttpClient } from "../../../hooks/http-hook";
import Loader from "../loading/Loader";
import { Link } from "react-router-dom";
import { Dialog } from 'primereact/dialog';
import { useDispatch, useSelector } from "react-redux";
import { REGIONS_MEMBERSHIP_SPECIFICS, findMembershipByProperty } from "../../../util/defines/REGIONS_AUTH_CONFIG";
import { showNotification } from "../../../redux/notification";
import { isProd } from "../../../util/functions/helpers";
import { REGION_EMAIL } from "../../../util/defines/REGIONS_DESIGN";
import PageLoading from "../loading/PageLoading";
import { ACTIVE, LOCKED, SUSPENDED, USER_STATUSES } from "../../../util/defines/enum";

const Locked = ({ currentUser }) => {
  const isLocked = !!currentUser && currentUser.status !== USER_STATUSES[ACTIVE]

  if (!isLocked) {
    return <PageLoading />;
  }

  const { loading, sendRequest } = useHttpClient();

  const dispatch = useDispatch();

  const handleManageSubscription = async () => {
    if (!currentUser.id || !currentUser.subscription) {
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
          userId: currentUser.id
        },
      );
      if (responseData.url) {
        window.location.assign(responseData.url);
      }
    } catch (err) { }
  }

  const handleCreateSubscription = async (id = 1) => {
    const membership = findMembershipByProperty('id', id);

    if (!currentUser.id || !membership.renewItemId || !membership.period) {
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
          userId: currentUser.id,
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

  let bodyContent;

  switch (currentUser.status) {
    case USER_STATUSES[LOCKED]:
      bodyContent = <div className="center_section">
        <h3>
          Your account is locked!
        </h3>
        <p className="center_text">
          To continue using the benefits of a member please make the subscription payment (cancel anytime)! Otherwise, log out of your account.
        </p>
        {actionButtons}
        <Link to="/" className="rn-button-style--2 rn-btn-reverse mt--40">
          Back to Home
        </Link>
      </div>;
      break;

    case USER_STATUSES[SUSPENDED]:
      bodyContent = <div className="center_section">
        <h3>
          Your account is suspended!
        </h3>
        <p className="center_text">
          <span>We have noticed some violation from your side. Unfortunately, we will need to block your account until further notice. Please contact: <a href={`mailto:${REGION_EMAIL['support']}`}>{REGION_EMAIL['support']}</a></span>
        </p>
        <Link to="/" className="rn-button-style--2 rn-btn-reverse mt--40">
          Back to Home
        </Link>
      </div>;
      break;

    default:
      bodyContent = <div className="center_section">
        <h3>
          There is something wrong with your account!
        </h3>
        <p className="center_text">
          <span>We are resolving an issue with your account. Except our apologies and please contact: <a href={`mailto:${REGION_EMAIL['support']}`}>{REGION_EMAIL['support']}</a></span>
        </p>
        <Link to="/" className="rn-button-style--2 rn-btn-reverse mt--40">
          Back to Home
        </Link>
      </div>;
  }

  return (
    <>
      <PageLoading />
      <Dialog modal visible={isLocked} blockScroll={true} closable={false}>
        {bodyContent}
      </Dialog>
    </>

  );
};

export default Locked;
