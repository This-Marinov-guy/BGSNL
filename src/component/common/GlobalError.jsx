import React, { useEffect } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { useLocation, useNavigate } from 'react-router-dom';
import HeaderTwo from '../header/HeaderTwo';

// Custom fallback component
const ErrorFallback = ({ resetErrorBoundary }) => {
    const navigate = useNavigate();

    return (
        <div className="container">
            <div className="mt--200">
                <h3 className="center_text mb--10">Something went wrong - If the issue persists please report it!</h3>
                <h5 className="center_text mb--80">Your feedback helps us make the platform better. We appreciate it!</h5>
                <div className="options-btns-div mt--60">
                    <button
                        onClick={resetErrorBoundary}
                        className="rn-button-style--2 btn-solid"
                    >
                        Try again
                    </button>
                    <button
                        onClick={() => navigate(-1)}
                        className="rn-button-style--2 rn-btn-reverse"
                    >
                        Go Back
                    </button>
                </div>
            </div>
        </div>
    );
};

const GlobalError = ({ children }) => {
    const location = useLocation();

    return (
        <>
            <HeaderTwo
                headertransparent="header--transparent"
                colorblack="color--black"
                logoname="logo.png"
            />
            <ErrorBoundary
                FallbackComponent={ErrorFallback}
                key={location.pathname} // Force remount on location change
            >
                {children}
            </ErrorBoundary>
        </>
    );
};

export default GlobalError;
