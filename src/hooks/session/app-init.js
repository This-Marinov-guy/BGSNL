import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useHttpClient } from "../common/http-hook";
import { useJWTRefresh } from "../common/api-hooks";
import { login, selectUser } from "../../redux/user";
import { isObjectEmpty } from "../../util/functions/helpers";
import {
  LOCAL_STORAGE_USER_DATA,
} from "../../util/defines/common";
import { decodeJWT } from "../../util/functions/authorization";

export const useAppInitialization = () => {
  const [isLoading, setIsLoading] = useState(true);

  const user = useSelector(selectUser);
  const dispatch = useDispatch();

  const { sendRequest } = useHttpClient();
  const { refreshJWTinAPI } = useJWTRefresh();

  useEffect(() => {
    const initialize = async () => {
      try {
        const storedUserData = localStorage.getItem(LOCAL_STORAGE_USER_DATA);
        let storedUser = null;

        if (storedUserData) {
          try {
            storedUser = JSON.parse(storedUserData);
          } catch (parseError) {
            console.error("Error parsing stored user data:", parseError);
            clearUserStorage();
            setIsLoading(false);
            return;
          }
        }

        let version = null;

        if (storedUser && storedUser.token) {
          const decodedData = decodeJWT(storedUser.token ?? "");
          version = decodedData?.version ?? null;
        }
        
        // If we have a valid token with correct version, always try to refresh and login
        if (
          !isObjectEmpty(storedUser) &&
          !!storedUser.token &&
          version == process.env.REACT_APP_AUTH_VERSION
        ) {
          await loginUser(storedUser.token);
        } else if (storedUser && storedUser.token) {
          // Token exists but version mismatch - clear storage
          console.log("Token version mismatch - clearing storage");
          clearUserStorage();
        }

        setIsLoading(false);
      } catch (err) {
        console.error("Error during initialization:", err);
        clearUserStorage();
        setIsLoading(false);
      }
    };

    initialize();
  }, []);

  const loginUser = async (jwtToken) => {
    try {
      // Always attempt to refresh the token on page load
      // This ensures the user stays logged in indefinitely
      let refreshedToken = jwtToken;
      const newToken = await refreshJWTinAPI(jwtToken, false);
      if (newToken) {
        refreshedToken = newToken;
        console.log("Token refreshed successfully on page load");
      } else {
        // If refresh fails, try with original token
        console.log("Token refresh failed, attempting with original token");
      }

      const responseData = await sendRequest(
        "user/get-subscription-status",
        "GET",
        {},
        { Authorization: `Bearer ${refreshedToken}` },
        false
      );

      if (!responseData) {
        console.error("No response data received");
        throw new Error("No response from server");
      }

      if (
        !Object.prototype.hasOwnProperty.call(responseData, "status") ||
        !Object.prototype.hasOwnProperty.call(responseData, "isSubscribed")
      ) {
        throw new Error("Server Error - Invalid response structure");
      }

      // Use the refreshed token if available, otherwise use original
      dispatch(login({ token: refreshedToken, ...responseData }));
    } catch (err) {
      // Only clear storage on authentication errors (401)
      if (err.response?.status === 401 || err.message?.includes("401") || err.message?.includes("Unauthorized")) {
        console.log("Authentication failed - clearing storage");
        clearUserStorage();
      } else {
        console.error("Failed to login user (non-auth error):", err);
        // Don't clear storage on network errors - user can retry
      }
    }
  };

  const clearUserStorage = () => {
    localStorage.removeItem(LOCAL_STORAGE_USER_DATA);
  };

  return { isLoading };
};
