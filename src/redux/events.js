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
        allDashboard: regionObject,
        selected: null,
        selectedDashboard: null,
    },
    reducers: {
        loadSingleEvent: (state, action) => {
            state.selected = action.payload;
        },
        loadEvents: (state, action) => {
            state.all = regionObject;
            action.payload.forEach(event => state.all[event.region].push(event));
        },

        // Dashboard reducers
        loadSingleEventDashboard: (state, action) => {
            state.selectedDashboard = action.payload;
        },
        loadEventsDashboard: (state, action) => {
            state.allDashboard = regionObject;
            action.payload.forEach(event => state.allDashboard[event.region].push(event));
        },
        addEventToAll: (state, action) => {
            const event = action.payload;

            state.allDashboard[event.region] = [...state.allDashboard[event.region], event];
        },
        editEventFromAll: (state, action) => {
            const event = action.payload;
            const index = state.allDashboard[event.region].findIndex(e => e.id === event.id);
            if (index !== -1) {
                state.allDashboard[event.region][index] = event;
            }
        },

        removeEventFromAll: {
            reducer(state, action) {
                const { region, eventId } = action.payload;

                state.allDashboard[region] = state.allDashboard[region].filter(e => e.id !== eventId);
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
export const selectEventsDashboard = (state) => state.events.allDashboard;
export const selectSingleEventDashboard = (state) => state.events.selectedDashboard;
export const { loadSingleEventDashboard, loadEventsDashboard, loadSingleEvent, loadEvents, addEventToAll, editEventFromAll, removeEventFromAll } = eventsSlice.actions;
export default eventsSlice.reducer;
