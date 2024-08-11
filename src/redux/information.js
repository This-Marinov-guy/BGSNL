import { createSlice } from "@reduxjs/toolkit";

export const informationSlice = createSlice({
    name: "information",
    initialState: {
        value: false,
        severity: '',
        detail: ''
    },
    reducers: {
        showInfoNotification: (state, action) => {
            state.value = true;
            state.severity = action.payload.severity;
            state.detail = action.payload.detail;
        },
        removeInfoNotification: (state) => {
            state.value = false;
            state.severity = '',
            state.detail = '';
        },
    },
});

export const selectNotification = (state) => state.information.value;
export const selectNotificationDetails = (state) => {
    return {
        severity: state.information.severity,
        detail: state.information.detail
    }
};
export const { showInfoNotification, removeInfoNotification } = informationSlice.actions;
export default informationSlice.reducer;
