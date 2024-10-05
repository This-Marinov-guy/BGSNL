import { useSelector, useDispatch } from "react-redux";
import { selectLoading, startLoading, stopLoading } from "../../redux/loading";
import axios from 'axios';
import { isProd } from "../../util/functions/helpers";
import { selectUser } from "../../redux/user";
import { showNotification } from "../../redux/notification";
import { serverEndpoint } from "../../util/defines/common";

export const useHttpClient = () => {
  const dispatch = useDispatch();
  const loading = useSelector(selectLoading);

  const user = useSelector(selectUser);

  const forceStartLoading = () => dispatch(startLoading());

  const sendRequest = async (url, method = "GET", data = null, headers = {}, withError = true) => {
      if (!loading) forceStartLoading();

      if (user && !!user.token) {
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
        !isProd() && console.log(err.response.data ?? err);

        if (withError) {
          dispatch(showNotification({
            severity: 'error',
            summary: 'You got an error :(',
            detail: err.response.data.message,
          }));
        }
      } finally {
        dispatch(stopLoading());
      }
    }

  return { loading, sendRequest, forceStartLoading };
};