import { useState } from "react";
import { useDispatch } from "react-redux";
import { useHttpClient } from "./http-hook";
import { loadEvents, loadEventsDashboard } from "../../redux/events";
import { refreshToken } from "../../redux/user";
import axios from "axios";
import { serverEndpoint } from "../../util/defines/common";
import { loadArticles, loadSingleArticle } from "../../redux/articles";
import { startPageLoading, stopPageLoading } from "../../redux/loading";

export const useLoadEvents = () => {
  const [eventsLoading, setEventsLoading] = useState(false);
  const dispatch = useDispatch();
  const { sendRequest } = useHttpClient();

  const reloadEvents = async (withFullData = false, withDelay = 0) => {
    try {
      setEventsLoading(true);

      // timeout as it is too fast
      if (withDelay) {
        await new Promise((resolve) => setTimeout(resolve, withDelay));
      }

      const url = withFullData
        ? "future-event/full-data-events-list"
        : `event/events-list`;

      const responseData = await sendRequest(url);
      
      dispatch(withFullData ? loadEventsDashboard(responseData.events) : loadEvents(responseData.events));
    } catch (err) {
    } finally {
      setEventsLoading(false);
    }
  };

  return { reloadEvents, eventsLoading };
};

export const useJWTRefresh = () => {
  const dispatch = useDispatch();

  const refreshJWTinAPI = async (jwtToken, updateUser = true) => {
    try {
      const responseData = await axios.request({
        url: serverEndpoint + "user/refresh-token",
        method: "GET",
        headers: {
          Authorization: `Bearer ${jwtToken}`,
        },
      });

      if (updateUser) {
        dispatch(refreshToken(responseData.data.token));
      } else {
        return responseData.data.token;
      }
    } catch (err) {
      return null;
    }
  };

  return { refreshJWTinAPI };
};

export const useArticlesLoad = () => {
  const dispatch = useDispatch();
  const { sendRequest } = useHttpClient();

  const reloadArticles = async () => {
    try {
      const responseData = await sendRequest("wordpress/posts");

      if (responseData.posts) {
        dispatch(loadArticles(responseData.posts));
      } 
    } catch (err) {
      return [];
    }
  };

  const reloadArticleDetails = async (articleId) => {
    try {
      dispatch(startPageLoading());
      const responseData = await sendRequest(`wordpress/posts/${articleId}`);

      if (responseData.data) {
        dispatch(loadSingleArticle(responseData.data));
      }
    } catch (err) {
      return null;
    } finally {
        dispatch(stopPageLoading());
    }
  };

  return { reloadArticles, reloadArticleDetails };
};

export const useRefreshUser = () => {
  const { sendRequest } = useHttpClient();

  const refreshUser = async (callback = null) => {
    try {
      const responseData = await sendRequest(
        `user/current?withTickets=${false}&withChristmas=${false}`,
        "GET",
        null,
        {},
        false, // withError - don't show error notification
        false  // withLoading - don't show loading spinner (background refresh)
      );

      if (responseData?.user && callback ) {
        callback ({
          user: responseData.user,
          hasBirthday: responseData.celebrate,
        });
      }

      return responseData;
    } catch (err) {
      console.error("Error refreshing user data:", err);
      return null;
    }
  };

  return { refreshUser };
};
