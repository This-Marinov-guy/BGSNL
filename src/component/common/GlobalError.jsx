import React, { useEffect } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import HeaderTwo from '../header/HeaderTwo';
import { AXIOM_DATASET, getAxiomEndpoint, isAxiomLoggingEnabled } from '../../util/configs/axiom';

// Custom fallback component
const ErrorFallback = ({ error, resetErrorBoundary }) => {
    const navigate = useNavigate();

    return (
        <>
            <HeaderTwo
                headertransparent="header--transparent"
                colorblack="color--black"
                logoname="logo.png"
            />
            <div className="container">
                <div className="mt--200">
                    <h3 className="center_text mb--10">Something went wrong - If the issue persists please report it!</h3>
                    <h5 className="center_text mb--80">Your feedback helps us make the platform better. We appreciate it!</h5>
                    
                    {process.env.NODE_ENV !== 'production' && (
                        <div className="alert alert-danger">
                            <p className="mb--10"><strong>Error Details (only visible in development):</strong></p>
                            <p>{error.message}</p>
                        </div>
                    )}
                    
                    <div className="options-btns-div mt--60">
                        <button
                            onClick={resetErrorBoundary}
                            className="rn-button-style--2 rn-btn-reverse-green"
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
        </>
    );
};

// Function to log errors to Axiom
const logErrorToAxiom = (error, componentStack, errorInfo) => {
    // Don't log if Axiom logging is disabled
    if (!isAxiomLoggingEnabled()) {
        console.log('Axiom logging disabled. Error not sent to Axiom.');
        return;
    }
    
    // Create the payload for Axiom
    const errorPayload = {
        dataset: AXIOM_DATASET,
        timestamp: new Date().toISOString(),
        type: 'error_boundary',
        data: {
            message: error.message,
            name: error.name,
            stack: error.stack,
            componentStack: componentStack,
            url: window.location.href,
            path: window.location.pathname,
            userAgent: navigator.userAgent,
            screenSize: {
                width: window.innerWidth,
                height: window.innerHeight,
            },
            ...errorInfo
        }
    };

    // Send to Axiom via API
    try {
        const AXIOM_API_TOKEN = process.env.REACT_APP_AXIOM_API_TOKEN;
        const AXIOM_ENDPOINT = getAxiomEndpoint();
        
        if (AXIOM_API_TOKEN) {
            axios.post(AXIOM_ENDPOINT, [errorPayload], {
                headers: {
                    'Authorization': `Bearer ${AXIOM_API_TOKEN}`,
                    'Content-Type': 'application/json'
                }
            }).then(() => {
                console.log('Error logged to Axiom successfully');
            }).catch(err => {
                console.error('Failed to log error to Axiom:', err);
            });
        } else {
            console.warn('Axiom API token not configured. Error logging disabled.');
        }
    } catch (loggingError) {
        // Don't let logging failures cause additional issues
        console.error('Error during Axiom logging:', loggingError);
    }
};

// Error handler function for ErrorBoundary
const handleError = (error, info) => {
    // Log error to console in development
    console.error('Error caught by error boundary:', error);
    
    // Extract component name from stack trace
    const componentMatch = info.componentStack.match(/\s+in\s+([A-Za-z0-9]+)/);
    const componentName = componentMatch ? componentMatch[1] : 'Unknown';
    
    // Log to Axiom
    logErrorToAxiom(error, info.componentStack, { 
        componentName,
        errorTime: new Date().toISOString()
    });
};

const GlobalError = ({ children }) => {
    const location = useLocation();

    return (
        <ErrorBoundary
            FallbackComponent={ErrorFallback}
            key={location.pathname} // Force remount on location change
            onError={handleError}
        >
            {children}
        </ErrorBoundary>
    );
};

export default GlobalError;