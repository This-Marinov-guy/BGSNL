"use client";

import React, { useEffect } from "react";
import {
  useDispatch,
  useSelector,
} from "react-redux";
import {
  useLocation,
  useNavigate,
} from "@/util/navigation";
import { getAccountStatusNotice } from "../../elements/subscriptions/account-status-notice.mjs";
import HeaderLoadingError from "../../elements/ui/errors/HeaderLoadingError";
import { showNotification } from "../../redux/notification";
import { selectUser } from "../../redux/user";
import { accountRouteState } from "../../util/functions/account-route-state.mjs";
import PropTypes from "prop-types";

const AuthLayout = ({ children, access = [] }) => {
  const location = useLocation();
  const user = useSelector(selectUser);
  const dispatch = useDispatch();

  const navigate = useNavigate();

  const routeState = accountRouteState(user, access, location.pathname);

  useEffect(() => {
    if (routeState === "anonymous") {
      try { sessionStorage.setItem("prevUrl", location.pathname + location.search + location.hash); }
      catch { /* A blocked storage setting must not prevent the login redirect. */ }
      navigate("/login", { replace: true });
    } else if (routeState === "locked") {
      const notice = getAccountStatusNotice(user);
      dispatch(showNotification({ severity: "warn", detail: notice?.description || notice?.title || "Your account needs attention before you can access this page." }));
      navigate("/user#settings", { replace: true });
    } else if (routeState === "forbidden") {
      dispatch(showNotification({ severity: "error", detail: "You do not have access to this page" }));
      navigate("/user", { replace: true });
    }
  }, [routeState, location.pathname, location.hash, location.search, navigate, dispatch, user]);

  if (routeState !== "allowed") return <HeaderLoadingError />;

  return children;
};

AuthLayout.propTypes = { children: PropTypes.node, access: PropTypes.arrayOf(PropTypes.string) };
export default React.memo(AuthLayout);
