import React from "react";
import { useHttpClient } from "../../../hooks/http-hook";
import Loader from "../loading/Loader";
import { useNavigate } from "react-router-dom";
import { Dialog } from 'primereact/dialog';
import { REGIONS_MEMBERSHIP_SPECIFICS, findMembershipByProperty } from "../../../util/defines/REGIONS_AUTH_CONFIG";
import { isProd } from "../../../util/functions/helpers";
import { REGION_EMAIL } from "../../../util/defines/REGIONS_DESIGN";
import PageLoading from "../loading/PageLoading";
import { ACTIVE, LOCKED, SUSPENDED, USER_STATUSES } from "../../../util/defines/enum";
import { useSelector } from "react-redux";
import { selectUser } from "../../../redux/user";

const AccountLocked = () => {
  const { loading, sendRequest } = useHttpClient();

  const navigate = useNavigate();

  const user = useSelector(selectUser);
  const {isSubscribed, status} = user;

  const handleManageSubscription = async () => {
    try {
      const responseData = await sendRequest(
        "payment/subscription/customer-portal",
        "POST",
        {
          url: window.location.href,
        },
      );
      if (responseData.url) {
        window.location.assign(responseData.url);
      }
    } catch (err) { }
  }

  const handleCreateSubscription = async (id = 1) => {
    const membership = findMembershipByProperty('id', id);

    try {
      const responseData = await sendRequest(
        "payment/subscription/general",
        "POST",
        {
          itemId: membership.renewItemId,
          period: membership.period,
          origin_url: window.location.origin,
          method: "unlock_account",
        },
      );
      if (responseData.url) {
        window.location.assign(responseData.url);
      }
    } catch (err) {
      !isProd() && console.log(err);
    }
  };

  const actionButtons = isSubscribed ?
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

  switch (status) {
    case USER_STATUSES[LOCKED]:
      bodyContent = <div className="center_section center_text">
        <h3>
          Your account is locked!
        </h3>
        <p>
          To continue using the benefits of a member please make the subscription payment (cancel anytime)! Otherwise, log out of your account.
        </p>
        {actionButtons}
        <button onClick={() => navigate(-1)} className="rn-button-style--2 rn-btn-reverse mt--40">
          Back
        </button>
      </div>;
      break;

    case USER_STATUSES[SUSPENDED]:
      bodyContent = <div className="center_section center_text">
        <h3>
          Your account is suspended!
        </h3>
        <p>
          <span>We have noticed some violation from your side. Unfortunately, we will need to block your account until further notice. Please contact: <a href={`mailto:${REGION_EMAIL['support']}`}>{REGION_EMAIL['support']}</a></span>
        </p>
        <button onClick={() => navigate(-1)} className="rn-button-style--2 rn-btn-reverse mt--40">
          Back
        </button>
      </div>;
      break;

    default:
      bodyContent = <div className="center_section center_text">
        <h3>
          There is something wrong with your account!
        </h3>
        <p>
          <span>We are resolving an issue with your account. Except our apologies and please contact: <a href={`mailto:${REGION_EMAIL['support']}`}>{REGION_EMAIL['support']}</a></span>
        </p>
        <button onClick={() => navigate(-1)} className="rn-button-style--2 rn-btn-reverse mt--40">
          Back
        </button>
      </div>;
  }

  return (
    <>
      <PageLoading />
      <Dialog modal visible={status !== USER_STATUSES[ACTIVE]} blockScroll={true} closable={false}>
        {bodyContent}
      </Dialog>
    </>

  );
};

export default AccountLocked;
