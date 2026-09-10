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


  const forceStartLoading = () => dispatch(startLoading());

  const sendRequest = async (
    url,
    method = "GET",
    data = null,
    headers = {},
    withError = true,
    withLoading = true,
  ) => {
    if (withLoading && !loading) forceStartLoading();
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
      });
      if (response.headers["x-bgsnl-session-changed"] === "1") clearCsrf();

      return response.data;
    } catch (err) {
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
  };

  return { loading, sendRequest, forceStartLoading };
};
