import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { removeModal, showModal } from "../../redux/modal";
import { INACTIVITY_MODAL, LOCAL_STORAGE_SESSION_LIFE, LOCAL_STORAGE_USER_DATA, SESSION_TIMEOUT } from "../../util/defines/common";
import InactivityModal from "../../elements/ui/modals/InactivityModal";
import { calculateTimeRemaining } from "../../util/functions/date";
import { login, logout, selectUser } from "../../redux/user";
import { decodeJWT, isTokenExpired } from "../../util/functions/authorization";
import { useHttpClient } from "../../hooks/http-hook";
import { isObjectEmpty } from "../../util/functions/helpers";
import { useNavigate } from "react-router-dom";
import { selectPageLoading, startPageLoading, stopPageLoading } from "../../redux/loading";
import HeaderLoadingError from "../../elements/ui/errors/HeaderLoadingError";

const INACTIVITY_TIMEOUT = SESSION_TIMEOUT
const WARNING_THRESHOLD = 30 * 1000; // 30 seconds in milliseconds

// NOTE: Deprecated code (moved in index.js as here did not worked)
const SessionLayout = () => {
    const [timeRemaining, setTimeRemaining] = useState(INACTIVITY_TIMEOUT);

    const dispatch = useDispatch();

    const { sendRequest } = useHttpClient();

    const user = useSelector(selectUser);

    const pageLoading = useSelector(selectPageLoading);

    const navigate = useNavigate();

    const onLogout = () => {
        dispatch(removeModal(INACTIVITY_MODAL));
        dispatch(logout());
        navigate('/');
    }

    const refreshJWT = async () => {
        try {
            dispatch(startPageLoading());
            const responseData = await sendRequest('user/refresh-token');

            return responseData.token ?? null;
        } catch (err) {
            return null;
        } finally {
            dispatch(stopPageLoading());
        }
    }

    const loginUser = async (jwtToken) => {
        try {
            if (isTokenExpired(jwtToken)) {
                const token = await refreshJWT();

                if (token) {
                    jwtToken = token;
                }
            }

            // TODO: temp fix as we cannot access the token in the hook
            const responseData = await sendRequest('user/get-subscription-status', 'GET', {}, {Authorization: `Bearer ${jwtToken}`});

            dispatch(
                login({
                    token: jwtToken,
                    ...responseData
                })
            );
        } catch (err) {
        }
    }

    let target = Date.now() + INACTIVITY_TIMEOUT;

    useEffect(() => {
        let storedUser = JSON.parse(localStorage.getItem(LOCAL_STORAGE_USER_DATA));
        let expirationTime = localStorage.getItem(LOCAL_STORAGE_SESSION_LIFE) ?? Date.now();

        if (
            !isObjectEmpty(storedUser) &&
            storedUser.token &&
            // TODO temp fix
            !isObjectEmpty(storedUser.token) &&
            expirationTime > Date.now()
        ) {
            loginUser(storedUser.token);
        }
    }, []);

    useEffect(() => {
        let inactivityTimeout;
        let intervalCheck;

        const resetInactivityTimeout = () => {
            target = Date.now() + INACTIVITY_TIMEOUT;

            dispatch(removeModal(INACTIVITY_MODAL));
            clearTimeout(inactivityTimeout);
            clearInterval(intervalCheck);
            setTimeRemaining(INACTIVITY_TIMEOUT); // Reset remaining time

            inactivityTimeout = setTimeout(() => {
                onLogout();
            }, INACTIVITY_TIMEOUT);

            // Check remaining time every second
            intervalCheck = setInterval(() => {
                const timeLeft = calculateTimeRemaining(target) // Calculate time remaining

                setTimeRemaining(timeLeft);

                if (timeLeft <= WARNING_THRESHOLD) {
                    executeWarningCode();
                }

                if (timeLeft <= 0) {
                    clearInterval(intervalCheck); // Stop checking after the timeout expires
                }
            }, 1000); // Check every second
        };

        const executeWarningCode = () => {
            dispatch(showModal(INACTIVITY_MODAL));
        };

        const handleUserActivity = () => {
            localStorage.setItem(LOCAL_STORAGE_SESSION_LIFE, target);
            resetInactivityTimeout();
        };

        window.addEventListener("click", handleUserActivity);

        resetInactivityTimeout();

        return () => {
            clearTimeout(inactivityTimeout);
            clearInterval(intervalCheck);
            window.removeEventListener("click", handleUserActivity);
        };
    }, []);

    if (user && user.token) {
        if (pageLoading) {
            return <HeaderLoadingError />
        }

        return <InactivityModal timeRemaining={timeRemaining} />;
    } else {
        return null;
    }
};

export default SessionLayout;