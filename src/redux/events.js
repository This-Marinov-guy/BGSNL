import { createSlice } from "@reduxjs/toolkit";
import { REGIONS } from "../util/defines/REGIONS_DESIGN";

let regionObject = {};

REGIONS.forEach(region => {
    regionObject[region] = [];
});

export const eventsSlice = createSlice({
    name: "events",
    initialState: {
        value: regionObject,
    },
    reducers: {
        loadEvents: (state, action) => {
            action.payload.forEach(event => state.value[event.region].push(event));
        },
    },
});

export const selectEvents = (state) => state.events.value;
export const { loadEvents } = eventsSlice.actions;
export default eventsSlice.reducer;
