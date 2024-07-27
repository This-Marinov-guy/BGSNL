import { useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { removeError, showError } from "../redux/error";
import { selectLoading, startLoading, stopLoading } from "../redux/loading";
import axios from 'axios';
import { isProd } from "../util/functions/helpers";
import { selectUser } from "../redux/user";

export const useHttpClient = () => {
  const dispatch = useDispatch();
  const loading = useSelector(selectLoading);

  const user = useSelector(selectUser);

  const forceStartLoading = () => dispatch(startLoading());

  const serverEndpoint = isProd() ?
    process.env.REACT_APP_SERVER_URL :
    process.env.REACT_APP_TEST_SERVER_URL;

  const sendRequest = useCallback(
    async (url, method = "GET", data = null, headers = {}, withError = true) => {
      if (!loading) forceStartLoading();

      if (user && user.token) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${user.token}`;
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
        if (withError) {
          dispatch(showError(err.response.data.message));
          setTimeout(() => dispatch(removeError()), 6000);
        }
      } finally {
        dispatch(stopLoading());
      }
    },
    []
  );

  return { loading, sendRequest, forceStartLoading };
};
