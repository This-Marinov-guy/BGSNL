import { createSlice } from "@reduxjs/toolkit";

export const loadingSlice = createSlice({
  name: "loading",
  initialState: {
    unit: false,
    page: false,
  },
  reducers: {
    startLoading: (state) => {
      state.unit = true;
    },
    stopLoading: (state) => {
      state.unit = false;
    },
    startPageLoading: (state) => {
      state.page = true;
    },
    stopPageLoading: (state) => {
      state.page = false;
    },
  },
});

export const selectLoading = (state) => state.loading.unit;
export const selectPageLoading = (state) => state.loading.page;
export const { startLoading, stopLoading, startPageLoading, stopPageLoading } = loadingSlice.actions;
export default loadingSlice.reducer;
