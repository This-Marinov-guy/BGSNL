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
            state.all = regionObject;
            action.payload.forEach(event => state.all[event.region].push(event));
        },
        addEventToAll: (state, action) => {
            const event = action.payload;

            state.all[event.region].push(event);
        },
        editEventFromAll: (state, action) => {
            const event = action.payload;
            const index = state.all[event.region].findIndex(e => e.id === event.id);

            if (index !== -1) {
                state.all[event.region][index] = { ...state.all[index], ...event };
            }
        },

        removeEventFromAll: {
            reducer(state, action) {
                const { region, eventId } = action.payload;

                state.all[region].filter(e => e.id !== eventId);
            },
            prepare(values) {
                return {
                    payload: {
                        ...values,
                    },
                };
            },
        },
    },
});

export const selectEvents = (state) => state.events.all;
export const selectSingleEvent = (state) => state.events.selected;
export const { loadSingleEvent, loadEvents, addEventToAll, editEventFromAll, removeEventFromAll } = eventsSlice.actions;
export default eventsSlice.reducer;
