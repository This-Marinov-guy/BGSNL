import { useState } from "react";
import { useDispatch } from "react-redux";
import { useHttpClient } from "./http-hook";
import { loadEvents, loadEventsDashboard } from "../../redux/events";
import { refreshSession } from "../../redux/user";
import { browserFetch } from "../../util/auth/browser-request.mjs";
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

      const responseData = await sendRequest(url, "GET", null, {}, false);
      
      dispatch(withFullData ? loadEventsDashboard(responseData.events) : loadEvents(responseData.events));
    } catch {
      // The shared request helper already reports failures when requested.
    } finally {
      setEventsLoading(false);
    }
  };

  return { reloadEvents, eventsLoading };
};

export const useJWTRefresh = () => {
  const dispatch = useDispatch();
  const refreshJWTinAPI = async () => {
    const response = await browserFetch("/api/user/refresh-token");
    const data = await response.json();
    if (response.ok && data.session) dispatch(refreshSession(data.session));
    return response.ok;
  };
  return { refreshJWTinAPI };
};

export const useArticlesLoad = () => {
  const dispatch = useDispatch();
  const { sendRequest } = useHttpClient();

  const reloadArticles = async () => {
    try {
      const responseData = await sendRequest("wordpress/posts", "GET", null, {}, false);

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
      const responseData = await sendRequest(
        `wordpress/posts/${articleId}`,
        "GET",
        null,
        {},
        false
      );
      const article = responseData?.data
        ? { ...responseData.data, id: String(articleId) }
        : null;

      if (article) {
        dispatch(loadSingleArticle(article));
      }

      return article;
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
