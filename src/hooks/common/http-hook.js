import { useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  selectLoading,
  startLoading,
  startPageLoading,
  stopLoading,
  stopPageLoading,
} from "../../redux/loading";
import axios from "axios";
import { clearSession } from "../../redux/user";
import { showNotification } from "../../redux/notification";
import { serverEndpoint } from "../../util/defines/common";
import { csrfHeaders, clearCsrf } from "../../util/auth/browser-request.mjs";

export const useHttpClient = (withPageLoading = false) => {
  const dispatch = useDispatch();
  const loading = useSelector(selectLoading);


  const forceStartLoading = useCallback(() => dispatch(startLoading()), [dispatch]);

  const sendRequest = useCallback(async (
    url,
    method = "GET",
    data = null,
    headers = {},
    withError = true,
    withLoading = true,
    { signal } = {},
  ) => {
    // Loading must not be a callback dependency: consumers fetch in effects.
    if (signal?.aborted) return undefined;
    if (withLoading) dispatch(startLoading());
    if (withPageLoading) dispatch(startPageLoading());

    try {
      const response = await axios.request({
        url: serverEndpoint + url,
        method,
        data,
        headers: {
          ...headers,
          ...await csrfHeaders(method),
        },
        withCredentials: true,
        timeout: 60000,
        signal,
      });
      if (response.headers["x-bgsnl-session-changed"] === "1") clearCsrf();

      return response.data;
    } catch (err) {
      if (axios.isCancel(err)) return undefined;
      const errorMessage = err.response?.data?.message || err.message || "An error occurred";
      const isSessionExpired = errorMessage.toLowerCase().includes("session expired") || 
                               errorMessage.toLowerCase().includes("token expired") ||
                               err.response?.status === 401;

      if (isSessionExpired) dispatch(clearSession());
      if (err.response?.status === 403) clearCsrf();

      // Show error notification if refresh failed or error is not session-related
      if (withError) {
        dispatch(
          showNotification({
            severity: "error",
            summary: "You got an error :(",
            detail: errorMessage,
          })
        );
      }
    } finally {
      if (withLoading) dispatch(stopLoading());
      if (withPageLoading) dispatch(stopPageLoading());
    }
  }, [dispatch, withPageLoading]);

  return { loading, sendRequest, forceStartLoading };
};
