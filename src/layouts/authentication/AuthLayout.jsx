import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { selectUser } from "../../redux/user";
import { showNotification } from "../../redux/notification";
import { checkAuthorization } from "../../util/functions/authorization";
import AccountLocked from "../../elements/ui/modals/AccountLocked";
import { ACTIVE, USER_STATUSES } from "../../util/defines/enum";
import HeaderLoadingError from "../../elements/ui/errors/HeaderLoadingError";
import { LOCAL_STORAGE_USER_DATA } from "../../util/defines/common";

const AuthLayout = ({ children, access = [] }) => {
  const location = useLocation();
  const user = useSelector(selectUser);
  const dispatch = useDispatch();

  const navigate = useNavigate();

  const [isActive, setIsActive] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const userData = localStorage.getItem(LOCAL_STORAGE_USER_DATA);
      const isAuth = !!(user && user.token) || !!userData;
      const routePath = location.pathname + location.hash + location.search;

      if (!isAuth) {
        return sessionStorage.setItem("prevUrl", routePath).then(() => {
          dispatch(
            showNotification({
              severity: "warn",
              detail: "Please log in to your account to proceed to the page!",
            })
          );
          setIsActive(false);
          setIsLoading(false);
          navigate("/login");
        });
      }

      const token =
        user?.token || (userData ? JSON.parse(userData).token : null);

      if (user.status && user.status !== USER_STATUSES[ACTIVE]) {
        setIsActive(false);
        setIsLoading(false);
        return;
      }

      if (access.length > 0) {
        try {
          const authorized = checkAuthorization(token, access);
          if (!authorized) {
            dispatch(
              showNotification({
                severity: "error",
                detail: "You do not have access to this page",
              })
            );
            setIsActive(true);
            setIsLoading(false);
            return navigate("/user");
          }
        } catch (error) {
          dispatch(
            showNotification({
              severity: "error",
              detail:
                "An error occurred while checking your access. Please try again.",
            })
          );
          setIsActive(true);
          setIsLoading(false);
          return navigate("/user");
        }
      }

      setIsActive(true);
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  if (isLoading) {
    return <HeaderLoadingError />;
  }

  if (!isActive) {
    return <AccountLocked />;
  }

  return children;
};

export default React.memo(AuthLayout);
