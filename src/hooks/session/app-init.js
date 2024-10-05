import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { useHttpClient } from "../common/http-hook";
import { useJWTRefresh } from "../common/api-hooks";
import { login } from "../../redux/user";
import { isObjectEmpty } from "../../util/functions/helpers";
import {
  LOCAL_STORAGE_SESSION_LIFE,
  LOCAL_STORAGE_USER_DATA,
} from "../../util/defines/common";
import { isTokenExpired } from "../../util/functions/authorization";

export const useAppInitialization = () => {
  const [isLoading, setIsLoading] = useState(true);

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
        expirationTime > Date.now()
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

      dispatch(login({ token: jwtToken, ...responseData }));
    } catch (err) {
      console.error("Failed to login user:", err);
    }
  };

  const clearUserStorage = () => {
    localStorage.removeItem(LOCAL_STORAGE_SESSION_LIFE);
    localStorage.removeItem(LOCAL_STORAGE_USER_DATA);
  };

  return { isLoading };
};
