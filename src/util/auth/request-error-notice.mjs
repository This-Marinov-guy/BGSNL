export const requestErrorNotice = (error) => {
  const status = error?.response?.status;
  // Background/system failures are handled by each screen's persistent state.
  if (!status || status === 408 || status === 429 || status === 404 || status >= 500) return null;
  const message = error?.response?.data?.message;
  return {
    severity: "error",
    summary: status === 401 || status === 403 ? "Access unavailable" : "Check your request",
    detail: typeof message === "string" && message.length <= 300 &&
      !/[\r\n]|https?:\/\/|\S+@\S+|bearer\s|token\s*[:=]|(?:mongodb|postgres):\/\//i.test(message)
      ? message
      : status === 401 ? "You cannot complete this action with this account."
        : status === 403 ? "You do not have access to this action."
          : "We could not complete your request. Please check your input and try again.",
  };
};
