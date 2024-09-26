import { useCallback, useState } from "react";
import { useDispatch } from "react-redux";
import { useHttpClient } from "./http-hook";
import { loadEvents } from "../redux/events";
import { refreshToken } from "../redux/user";
import axios from 'axios';
import { isProd } from "../util/functions/helpers";
import { serverEndpoint } from "../util/defines/common";

export const useLoadEvents = () => {
    const [eventsLoading, setEventsLoading] = useState(false);
    const dispatch = useDispatch();
    const { sendRequest } = useHttpClient();

    const reloadEvents = async (withFullData = false, withDelay = 0) => {
        try {
            setEventsLoading(true);

            // timeout as it is too fast
            if (withDelay) {
                await new Promise(resolve => setTimeout(resolve, withDelay));
            }

            const url = withFullData ? 'future-event/full-data-events-list' : `event/events-list`;
            const responseData = await sendRequest(url);
            dispatch(loadEvents(responseData.events));
        } catch (err) {

        } finally {
            setEventsLoading(false);
        }
    };

    return { reloadEvents, eventsLoading }
}

export const useJWTRefresh = () => {
    const dispatch = useDispatch();

    const refreshJWTinAPI = async (jwtToken, updateUser = true) => {
        try {
            const responseData = await axios.request({
                url: serverEndpoint + 'user/refresh-token',
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${jwtToken}`
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

    return { refreshJWTinAPI }
}