"use client";

import { useEffect } from "react";
import PropTypes from "prop-types";
import { useDispatch, useSelector } from "react-redux";
import { useAuthSession } from "@/hooks/session/auth-session";
import { login, selectUser } from "@/redux/user";
import { scannerSessionNeedsReload } from "@/util/auth/scanner-session-state.mjs";

export default function ScannerSessionHydrator({ session, children }) {
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const needsReload = scannerSessionNeedsReload(user, session);
  useAuthSession();
  useEffect(() => {
    if (needsReload) window.location.replace(window.location.href);
    else dispatch(login({ session }));
  }, [dispatch, needsReload, session]);
  return needsReload ? null : children;
}

ScannerSessionHydrator.propTypes = {
  session: PropTypes.shape({
    sid: PropTypes.string.isRequired,
    auth_time: PropTypes.number.isRequired,
    userId: PropTypes.string.isRequired,
    sessionVersion: PropTypes.number.isRequired,
    accessExp: PropTypes.number.isRequired,
  }).isRequired,
  children: PropTypes.node,
};
