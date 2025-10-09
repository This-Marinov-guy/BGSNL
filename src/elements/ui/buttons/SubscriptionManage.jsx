import React from 'react'
import { useHttpClient } from '../../../hooks/common/http-hook'
import { ConfirmPopup, confirmPopup } from 'primereact/confirmpopup';
import { useDispatch } from 'react-redux';
import { showNotification } from '../../../redux/notification';
import CustomSpinner from '../loading/CustomSpinner';
import PropTypes from 'prop-types';
import { ALUMNI, MEMBER } from '../../../util/defines/common';

const SubscriptionManage = ({ onAction, isAlumni }) => {
    const { loading, sendRequest } = useHttpClient();

    const dispatch = useDispatch();

    const confirm1 = (event) => {
        confirmPopup({
            target: event.currentTarget,
            message: 'Are you sure you want to cancel your membership at end of billing cycle?',
            icon: 'pi pi-exclamation-triangle',
            defaultFocus: 'reject',
            accept: handleCancel,
            reject: () => { }
        });
    };

    async function handleManage() {
        try {
            const responseData = await sendRequest(
              "payment/subscription/customer-portal",
              "POST",
              {
                url: window.location.href,
                type: isAlumni ? ALUMNI : MEMBER,
              }
            );
            if (responseData.url) {
                window.location.assign(responseData.url);
            }
            if (onAction) onAction();
        } catch (err) {
            console.error('Error managing subscription:', err);
        }
    }

    const handleCancel = async () => {
        try {
            const responseData = await sendRequest("user/cancel-membership", "DELETE");
            if (responseData.message) {
                dispatch(showNotification({ severity: 'success', summary: 'Success', detail: responseData.message }));
            }
            if (onAction) onAction();
        } catch (err) {
            console.error('Error canceling subscription:', err);
        }
    }

    return (
        loading ? <div className='center_div'><CustomSpinner/></div> :
            <div className="subscription-actions">
                <ConfirmPopup />
                <button 
                    className="rn-button-style--2 rn-btn-green subscription-btn"
                    onClick={handleManage}
                    disabled={loading}
                >
                    <span>Payment Details</span>
                </button>
                <button 
                    className="rn-button-style--2 rn-btn-reverse-red subscription-btn"
                    onClick={confirm1}
                    disabled={loading}
                >
                    <span>Cancel Subscription</span>
                </button>
            </div>
    )
}

SubscriptionManage.propTypes = {
    onAction: PropTypes.func
};

export default SubscriptionManage