import { useCallback, useState } from "react";
import { useDispatch } from "react-redux";
import { useHttpClient } from "./http-hook";
import { loadEvents } from "../redux/events";

export const useLoadEvents = (withFullData = false) => {
    const [eventsLoading, setEventsLoading] = useState(false);
    const dispatch = useDispatch();
    const { sendRequest } = useHttpClient();

    const reloadEvents = useCallback(async (withDelay = 0) => {
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
    }, []);

    return { reloadEvents, eventsLoading }
}
