"use client";

import PropTypes from "prop-types";
import RecoveryScreen from "@/component/common/RecoveryScreen";

export default function RouteError({ error, retry }) {
  return <RecoveryScreen kind="error" error={error} onRetry={retry} />;
}

RouteError.propTypes = {
  error: PropTypes.shape({ message: PropTypes.string }),
  retry: PropTypes.func.isRequired,
};
