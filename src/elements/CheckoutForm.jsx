import React from "react";
import { useState } from "react";
import { PaymentElement } from "@stripe/react-stripe-js";
import { useStripe, useElements } from "@stripe/react-stripe-js";
import Spinner from "react-bootstrap/Spinner";
import PropTypes from "prop-types";

const CheckoutForm = ({ returnUrl }) => {
    const stripe = useStripe();
    const elements = useElements();

    const [message, setMessage] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!stripe || !elements || !returnUrl) {
            // Stripe.js has not yet loaded.
            // Make sure to disable form submission until Stripe.js has loaded.
            return <Spinner
                className="center_div"
                variant="danger"
                as="span"
                animation="border"
                size="m"
                role="status"
                aria-hidden="true"
            />;
        }

        setIsProcessing(true);

        const { error } = await stripe.confirmPayment({
            elements,
            confirmParams: {
                // Use the protected URL returned with this exact PaymentIntent.
                return_url: returnUrl,
            },
        });

        if (error?.type === "card_error" || error?.type === "validation_error") {
            setMessage(error.message);
        } else {
            setMessage("An unexpected error occured.");
        }

        setIsProcessing(false);
    };

    return (
        <form className="payment_form" id="payment-form" onSubmit={handleSubmit}>
            <PaymentElement id="payment-element" />
            <button disabled={isProcessing || !stripe || !elements || !returnUrl} id="submit" className="rn-button-style--2 rn-btn-reverse-green mt--40"
            >
                <span id="button-text">
                    {isProcessing ? "Processing ... " : "Pay now"}
                </span>
            </button>
            {/* Show any error or success messages */}
            {message && <div id="payment-message">{message}</div>}
        </form>
    );
}

CheckoutForm.propTypes = { returnUrl: PropTypes.string.isRequired };
export default CheckoutForm
