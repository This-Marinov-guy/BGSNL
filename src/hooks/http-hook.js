import { useCallback } from "react";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import { removeError, showError } from "../redux/error";
import { selectLoading, startLoading, stopLoading } from "../redux/loading";
import axios from 'axios';

export const useHttpClient = () => {
  const dispatch = useDispatch();
  const loading = useSelector(selectLoading);

  const sendRequest = useCallback(
    async (url, method = "GET", data = null, headers = {}) => {
      dispatch(startLoading());

      try {
        //for production --> process.env.REACT_APP_SERVER_URL
        //for testing -----> process.env.REACT_APP_TEST_SERVER_URL
        const response = await axios.request({
          url: process.env.REACT_APP_SERVER_URL + url,
          method,
          data,
          headers,
        });

        return response.data;
      } catch (err) {
        dispatch(showError(err.response.data.message));
        setTimeout(() => dispatch(removeError()), 6000);
      } finally {
        dispatch(stopLoading());
      }
    },
    []
  );

  return { loading, sendRequest };
};
