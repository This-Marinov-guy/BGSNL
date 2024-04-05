import React from 'react'
import Loader from './Loader'
import { useHttpClient } from '../../hooks/http-hook'
import { ConfirmPopup, confirmPopup } from 'primereact/confirmpopup';

const SubscriptionManage = (props) => {
    const { loading, sendRequest } = useHttpClient()

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
                props.toast({
                    title: responseData.message,
                    status: 'success',
                    position: 'top-left',
                    duration: 8000,
                    isClosable: true,
                })
            }
        } catch (err) { }
    }

    return (
        loading ? <div className='center_div mt--40'><Loader /></div> :
            <div className="options-btns-div mt--60">
                <ConfirmPopup />
                <button
                    disabled={loading}
                    onClick={handleManage}
                    className="rn-button-style--2 btn-solid"
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