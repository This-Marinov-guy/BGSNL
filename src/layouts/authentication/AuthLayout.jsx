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
      try { sessionStorage.setItem("prevUrl", location.pathname + location.hash + location.search); }
      catch { /* A blocked storage setting must not prevent the login redirect. */ }
      navigate("/login", { replace: true });
    } else if (routeState === "locked") {
      navigate("/user#settings", { replace: true });
    } else if (routeState === "forbidden") {
      dispatch(showNotification({ severity: "error", detail: "You do not have access to this page" }));
      navigate("/user", { replace: true });
    }
  }, [routeState, location.pathname, location.hash, location.search, navigate, dispatch]);

  if (routeState !== "allowed") return <HeaderLoadingError />;

  return children;
};

AuthLayout.propTypes = { children: PropTypes.node, access: PropTypes.arrayOf(PropTypes.string) };
export default React.memo(AuthLayout);
