import { createSlice } from "@reduxjs/toolkit";
import { getStyleBySeverity } from "../util/defines/common";

export const notificationSlice = createSlice({
  name: "notification",
  initialState: {
    index: 0,
    data: {},
  },
  reducers: {
    
    showNotification: (state, action) => {
      state.index++;
      state.data = {
        ...action.payload,
        ...getStyleBySeverity(action.payload?.severity ?? ""),
      };
    },

    removeNotification: (state) => {
      state.index++;
      state.data = {};
    },
  },
});

export const selectNotificationIndex = (state) => state.notification.index;
export const selectNotification = (state) => state.notification.data;

export const { showNotification, removeNotification } =
  notificationSlice.actions;
export default notificationSlice.reducer;
