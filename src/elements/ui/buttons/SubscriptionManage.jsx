import React from 'react'
import Loader from '../loading/Loader'
import { useHttpClient } from '../../../hooks/http-hook'
import { ConfirmPopup, confirmPopup } from 'primereact/confirmpopup';
import { useDispatch } from 'react-redux';
import { showNotification } from '../../../redux/notification';
import { ProgressSpinner } from 'primereact/progressspinner';

const SubscriptionManage = (props) => {
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
                "payment/customer-portal",
                "POST",
                {
                    customerId: props.subscription.customerId,
                    url: window.location.href,
                    userId: props.userId
                },
            );
            if (responseData.url) {
                window.location.assign(responseData.url);
            }
        } catch (err) { }
    }

    const handleCancel = async () => {
        try {
            const responseData = await sendRequest(
                "user/cancel-membership",
                "POST",
                {
                    userId: props.userId
                },
            );
            if (responseData.message) {
                dispatch(showNotification({ severity: 'success', summary: 'Success', detail: responseData.message }));
            }
        } catch (err) { }
    }

    return (
        loading ? <div className='center_div mt--40'><ProgressSpinner style={{ width: '50px', height: '50px' }} /></div> :
            <div className="options-btns-div mt--60">
                <ConfirmPopup />
                <button
                    disabled={loading}
                    onClick={handleManage}
                    className="rn-button-style--2 rn-btn-reverse-green"
                >
                    Payment details
                </button>
                <button
                    disabled={loading}
                    onClick={confirm1}
                    className="rn-button-style--2 rn-btn-reverse"
                >
                    Cancel subscription
                </button>
            </div>
    )
}

export default SubscriptionManage