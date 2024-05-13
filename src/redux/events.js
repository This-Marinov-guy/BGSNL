import { createSlice } from "@reduxjs/toolkit";
import { REGIONS } from "../util/defines/REGIONS_DESIGN";

let regionObject = {};

REGIONS.forEach(region => {
    regionObject[region] = [];
});

export const eventsSlice = createSlice({
    name: "events",
    initialState: {
        all: regionObject,
        selected: null,
    },
    reducers: {
        loadSingleEvent: (state, action) => {
            state.selected = action.payload;
        },
        loadEvents: (state, action) => {
            action.payload.forEach(event => state.all[event.region].push(event));
        },
    },
});

export const selectEvents = (state) => state.events.all;
export const selectSingleEvent = (state) => state.events.selected;
export const { loadSingleEvent, loadEvents } = eventsSlice.actions;
export default eventsSlice.reducer;
