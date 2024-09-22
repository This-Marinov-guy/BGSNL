import React, { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Navigate, useLocation } from 'react-router-dom';
import { selectUser } from '../../redux/user';
import { showNotification } from '../../redux/notification';
import { checkAuthorization } from '../../util/functions/authorization';
import AccountLocked from '../../elements/ui/modals/AccountLocked';
import { ACTIVE, USER_STATUSES } from '../../util/defines/enum';
import HeaderLoadingError from '../../elements/ui/errors/HeaderLoadingError';

const AuthLayout = ({ children, access = [] }) => {
    const location = useLocation();
    const user = useSelector(selectUser);
    const dispatch = useDispatch();

    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isActive, setIsActive] = useState(false);
    const [hasAccess, setHasAccess] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const checkAuth = async () => {
            const userData = localStorage.getItem('userData');
            const isAuth = (user && !!user.token) || !!userData;
            const routePath = location.pathname + location.hash + location.search;

            if (!isAuth) {
                sessionStorage.setItem('prevUrl', routePath);
                dispatch(showNotification({
                    severity: 'warn',
                    detail: 'Please log in to your account to proceed to the page!'
                }));
                setIsAuthenticated(false);
                setIsActive(false);
                setHasAccess(false);
                setIsLoading(false);
                return;
            }

            const token = user?.token || (userData ? JSON.parse(userData).token : null);

            if (user.status !== USER_STATUSES[ACTIVE]) {
                setIsAuthenticated(true);
                setIsActive(false);
                setHasAccess(false);
                setIsLoading(false);
                return;
            }

            if (access.length > 0) {
                try {
                    const authorized = await checkAuthorization(token, access);
                    if (!authorized) {
                        dispatch(showNotification({
                            severity: 'error',
                            detail: 'You do not have access to this page'
                        }));
                        setIsAuthenticated(true);
                        setIsActive(true);
                        setHasAccess(false);
                        setIsLoading(false);
                        return;
                    }
                } catch (error) {
                    dispatch(showNotification({
                        severity: 'error',
                        detail: 'An error occurred while checking your access. Please try again.'
                    }));
                    setIsAuthenticated(true);
                    setIsActive(true);
                    setHasAccess(false);
                    setIsLoading(false);
                    return;
                }
            }

            setIsAuthenticated(true);
            setIsActive(true);
            setHasAccess(true);
            setIsLoading(false);
        };

        checkAuth();
    }, [access, location, user, dispatch]);

    if (isLoading) {
        return <HeaderLoadingError />;
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" />;
    }

    if (!isActive) {
        return <AccountLocked/>;
    }

    if (!hasAccess) {
        return <Navigate to="/user" />;
    }

    return children;
};

export default React.memo(AuthLayout);