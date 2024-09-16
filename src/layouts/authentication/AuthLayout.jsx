import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Navigate, useLocation } from 'react-router-dom';
import { selectUser } from '../../redux/user';
import { showNotification } from '../../redux/notification';
import { checkAuthorization } from '../../util/functions/authorization';
import PageLoading from '../../elements/ui/loading/PageLoading';

const AuthLayout = ({ children, access = [] }) => {
    const location = useLocation();
    const routePath = location.pathname + location.hash + location.search;

    const user = useSelector(selectUser);
    const dispatch = useDispatch();

    const [authState, setAuthState] = useState({
        isAuthenticated: false,
        hasAccess: true,
        isLoading: true
    });

    useEffect(() => {
        const checkAuth = async () => {
            const userData = localStorage.getItem('userData');
            const isAuth = (user && !!user.token) || !!userData;

            if (!isAuth) {
                sessionStorage.setItem('prevUrl', routePath);
                dispatch(showNotification({
                    severity: 'warn',
                    detail: 'Please log in to your account to proceed to the page!'
                }));
                setAuthState({ isAuthenticated: false, hasAccess: false, isLoading: false });
                return;
            }

            if (access.length > 0) {
                const token = user?.token || (userData ? JSON.parse(userData).token : null);
                try {
                    const authorized = await checkAuthorization(token, access);
                    if (!authorized) {
                        dispatch(showNotification({
                            severity: 'error',
                            detail: 'You do not have access to this page'
                        }));
                        setAuthState({ isAuthenticated: true, hasAccess: false, isLoading: false });
                        return;
                    }
                } catch (error) {
                    console.error('Authorization check failed:', error);
                    dispatch(showNotification({
                        severity: 'error',
                        detail: 'An error occurred while checking your access. Please try again.'
                    }));
                    setAuthState({ isAuthenticated: true, hasAccess: false, isLoading: false });
                    return;
                }
            }

            setAuthState({ isAuthenticated: true, hasAccess: true, isLoading: false });
        };

        checkAuth();
    }, [user, routePath, access, dispatch]);

    if (authState.isLoading) {
        return <PageLoading/>; 
    }

    if (!authState.isAuthenticated) {
        return <Navigate to="/login" />;
    }

    if (!authState.hasAccess) {
        return <Navigate to="/user" />;
    }

    return children;
};

export default AuthLayout;