import React from 'react'
import Loader from './Loader'
import { useHttpClient } from '../../hooks/http-hook'
import { useSelector } from 'react-redux'
import { selectUser } from '../../redux/user'

const SubscriptionManage = (props) => {
    const { loading, sendRequest } = useHttpClient()

    const { user } = useSelector(selectUser)

    const handleManage = async () => {
        try {
            const responseData = await sendRequest(
                "payment/customer-portal",
                "POST",
                {
                    customerId: props.subscription.customerId,
                    url: window.location.href,
                    userId: user.id
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
                    userId: user.id
                },
            );
            if (responseData.message) {
                props.toast.current.show({ severity: 'success', summary: 'Success', detail: responseData.message });
            }
        } catch (err) { }
    }

    return (
        loading ? <div className='center_div mt--40'><Loader /></div> :
            <div className="options-btns-div mt--60">
                <button
                    disabled={loading}
                    onClick={handleManage}
                    className="rn-button-style--2 btn-solid"
                >
                    Payment methods
                </button>
                <button
                    disabled={loading}
                    onClick={handleCancel}
                    className="rn-button-style--2 btn-solid"
                >
                    Cancel subscription
                </button>
            </div>
    )
}

export default SubscriptionManage