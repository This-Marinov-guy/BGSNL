import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useHttpClient } from "../common/http-hook";
import { useJWTRefresh } from "../common/api-hooks";
import { login, selectUser } from "../../redux/user";
import { isObjectEmpty } from "../../util/functions/helpers";
import {
  LOCAL_STORAGE_SESSION_LIFE,
  LOCAL_STORAGE_USER_DATA,
  PERSISTENT_SESSION,
} from "../../util/defines/common";
import { isTokenExpired } from "../../util/functions/authorization";

export const useAppInitialization = () => {
  const [isLoading, setIsLoading] = useState(true);

  const user = useSelector(selectUser);
  const dispatch = useDispatch();

  const { sendRequest } = useHttpClient();
  const { refreshJWTinAPI } = useJWTRefresh();

  useEffect(() => {
    const initialize = async () => {
      let storedUser = JSON.parse(
        localStorage.getItem(LOCAL_STORAGE_USER_DATA)
      );
      let expirationTime =
        localStorage.getItem(LOCAL_STORAGE_SESSION_LIFE) ?? Date.now();

      if (
        !isObjectEmpty(storedUser) &&
        storedUser.token &&
        (PERSISTENT_SESSION || expirationTime > Date.now())
      ) {
        await loginUser(storedUser.token);
      } else {
        clearUserStorage();
      }

      setIsLoading(false);
    };

    initialize();
  }, []);

  const loginUser = async (jwtToken) => {
    try {
      if (isTokenExpired(jwtToken)) {
        const token = await refreshJWTinAPI(jwtToken, false);
        if (token) {
          jwtToken = token;
        }
      }

      const responseData = await sendRequest(
        "user/get-subscription-status",
        "GET",
        {},
        { Authorization: `Bearer ${jwtToken}` }
      );

      if (!Object.prototype.hasOwnProperty.call(responseData, 'status') || !Object.prototype.hasOwnProperty.call(responseData, 'isSubscribed')) {
        throw new Error("Server Error");
      }

      dispatch(login({ token: jwtToken, ...responseData }));
    } catch (err) {
      clearUserStorage();
      console.error("Failed to login user:", err);
    }
  };

  const clearUserStorage = () => {
    localStorage.removeItem(LOCAL_STORAGE_SESSION_LIFE);
    localStorage.removeItem(LOCAL_STORAGE_USER_DATA);
  };

  return { isLoading };
};
