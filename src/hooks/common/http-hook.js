import { useSelector, useDispatch } from "react-redux";
import {
  selectLoading,
  startLoading,
  startPageLoading,
  stopLoading,
  stopPageLoading,
} from "../../redux/loading";
import axios from "axios";
import { isProd } from "../../util/functions/helpers";
import { selectUser, refreshToken } from "../../redux/user";
import { showNotification } from "../../redux/notification";
import { serverEndpoint } from "../../util/defines/common";
import { useJWTRefresh } from "./api-hooks";

export const useHttpClient = (withPageLoading = false) => {
  const dispatch = useDispatch();
  const loading = useSelector(selectLoading);

  const user = useSelector(selectUser);
  const { refreshJWTinAPI } = useJWTRefresh();

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

    if (user && !!user.token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${user.token}`;
    }

    try {
      //for production --> process.env.REACT_APP_SERVER_URL
      //for testing -----> process.env.REACT_APP_TEST_SERVER_URL
      const response = await axios.request({
        url: serverEndpoint + url,
        method,
        data,
        headers,
      });

      return response.data;
    } catch (err) {
      !isProd() && console.log(err.response.data ?? err);

      const errorMessage = err.response?.data?.message || err.message || "An error occurred";
      const isSessionExpired = errorMessage.toLowerCase().includes("session expired") || 
                               errorMessage.toLowerCase().includes("token expired") ||
                               err.response?.status === 401;

      // If session expired, try to refresh token first
      if (isSessionExpired && user?.token) {
        try {
          const newToken = await refreshJWTinAPI(user.token, false);
          if (newToken) {
            // Token refreshed successfully, update Redux store and axios headers
            dispatch(refreshToken(newToken));
            axios.defaults.headers.common["Authorization"] = `Bearer ${newToken}`;
            
            // Retry the original request with the new token
            const retryResponse = await axios.request({
              url: serverEndpoint + url,
              method,
              data,
              headers: {
                ...headers,
                Authorization: `Bearer ${newToken}`,
              },
            });
            
            return retryResponse.data;
          }
        } catch (refreshError) {
          // Token refresh failed, fall through to show error
          !isProd() && console.log("Token refresh failed:", refreshError);
        }
      }

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
