import { createSlice } from "@reduxjs/toolkit";
import { ADMIN_EVENT_REGIONS, REGIONS } from "../util/defines/REGIONS_DESIGN";

const createRegionObject = (regions) => regions.reduce((acc, region) => {
    acc[region] = [];
    return acc;
}, {});

const createPublicEventsState = () => createRegionObject(REGIONS);
const createDashboardEventsState = () => createRegionObject(ADMIN_EVENT_REGIONS);

export const eventsSlice = createSlice({
    name: "events",
    initialState: {
        all: createPublicEventsState(),
        allDashboard: createDashboardEventsState(),
        drafts: [],
        selected: null,
        selectedDashboard: null,
    },
    reducers: {
        loadSingleEvent: (state, action) => {
            state.selected = action.payload;
        },
        loadEvents: (state, action) => {
            state.all = createPublicEventsState();
            action.payload.forEach(event => {
                if (state.all[event.region]) {
                    state.all[event.region].push(event);
                }
            });
        },

        // Dashboard reducers
        loadSingleEventDashboard: (state, action) => {
            state.selectedDashboard = action.payload;
        },
        loadEventsDashboard: (state, action) => {
            state.allDashboard = createDashboardEventsState();
            state.drafts = [];
            action.payload.forEach(event => {
                if (event.status === "draft") {
                    state.drafts.push(event);
                    return;
                }
                if (state.allDashboard[event.region]) {
                    state.allDashboard[event.region].push(event);
                }
            });
        },
        addEventToAll: (state, action) => {
            const event = action.payload;

            if (event.status === "draft") {
                state.drafts = [...state.drafts, event];
                return;
            }

            if (!state.allDashboard[event.region]) {
                state.allDashboard[event.region] = [];
            }
            state.allDashboard[event.region] = [...state.allDashboard[event.region], event];
        },
        editEventFromAll: (state, action) => {
            const event = action.payload;

            state.drafts = state.drafts.filter(e => e.id !== event.id);
            Object.keys(state.allDashboard).forEach(region => {
                state.allDashboard[region] = state.allDashboard[region].filter(
                    e => e.id !== event.id
                );
            });

            if (event.status === "draft") {
                state.drafts.push(event);
            } else {
                if (!state.allDashboard[event.region]) {
                    state.allDashboard[event.region] = [];
                }
                state.allDashboard[event.region].push(event);
            }
        },

        removeEventFromAll: {
            reducer(state, action) {
                const { region, eventId } = action.payload;

                state.drafts = state.drafts.filter(e => e.id !== eventId);
                if (state.allDashboard[region]) {
                    state.allDashboard[region] = state.allDashboard[region].filter(e => e.id !== eventId);
                }
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
export const selectEventDrafts = (state) => state.events.drafts;
export const selectSingleEventDashboard = (state) => state.events.selectedDashboard;
export const { loadSingleEventDashboard, loadEventsDashboard, loadSingleEvent, loadEvents, addEventToAll, editEventFromAll, removeEventFromAll } = eventsSlice.actions;
export default eventsSlice.reducer;
