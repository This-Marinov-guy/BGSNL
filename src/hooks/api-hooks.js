import { useCallback, useState } from "react";
import { useDispatch } from "react-redux";
import { useHttpClient } from "./http-hook";
import { loadEvents } from "../redux/events";

export const useLoadEvents = () => {
    const [eventsLoading, setEventsLoading] = useState(false);
    const dispatch = useDispatch();
    const { sendRequest } = useHttpClient();

    const reloadEvents = useCallback(async () => {
        try {
            setEventsLoading(true);
            const responseData = await sendRequest(`event/actions/events`);
            dispatch(loadEvents(responseData.events));
        } catch (err) {

        } finally {
            setEventsLoading(false);
        }
    }, []);

    return { reloadEvents, eventsLoading }
}