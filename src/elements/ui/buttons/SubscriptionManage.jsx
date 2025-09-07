import React from 'react'
import { useHttpClient } from '../../../hooks/common/http-hook'
import { ConfirmPopup, confirmPopup } from 'primereact/confirmpopup';
import { useDispatch } from 'react-redux';
import { showNotification } from '../../../redux/notification';
import CustomSpinner from '../loading/CustomSpinner';
import PropTypes from 'prop-types';

const SubscriptionManage = ({ onAction }) => {
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
                },
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
                <div 
                    className="dropdown-item"
                    onClick={handleManage}
                    style={{
                        padding: '12px 16px',
                        cursor: loading ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        transition: 'background-color 0.2s ease',
                        opacity: loading ? 0.6 : 1
                    }}
                    onMouseEnter={(e) => !loading && (e.target.style.backgroundColor = '#f5f5f5')}
                    onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                >
                    <span style={{ fontSize: '16px' }}>💳</span>
                    <span>Payment Details</span>
                </div>
                <div style={{ borderTop: '1px solid #e0e0e0', margin: '4px 0' }} />
                <div 
                    className="dropdown-item"
                    onClick={confirm1}
                    style={{
                        padding: '12px 16px',
                        cursor: loading ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        transition: 'background-color 0.2s ease',
                        opacity: loading ? 0.6 : 1
                    }}
                    onMouseEnter={(e) => !loading && (e.target.style.backgroundColor = '#f5f5f5')}
                    onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                >
                    <span style={{ fontSize: '16px' }}>❌</span>
                    <span>Cancel Subscription</span>
                </div>
            </div>
    )
}

SubscriptionManage.propTypes = {
    onAction: PropTypes.func
};

export default SubscriptionManage