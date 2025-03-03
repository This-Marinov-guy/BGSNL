import { createSlice } from "@reduxjs/toolkit";

export const modalSlice = createSlice({
  name: "modal",
  initialState: {
    modal: [],
    warning: [],
    localStorageIndex: 0,
  },
  reducers: {
    showModal: (state, action) => {
      state.modal = [...state.modal, action.payload];
    },
    removeModal: (state, action) => {
      state.modal = state.modal.filter((m) => m !== action.payload);
    },
    showWarning: (state) => {
      state.warning = [...state.warning, action.payload];
    },
    removeWarning: (state) => {
      state.warning = state.warning.filter((w) => w !== action.payload);
    },
    changeLocalStorageIndex: (state) => {
      state.localStorageIndex = state.localStorageIndex + 1;
    },
  },
});

export const selectModal = (state) => state.modal.modal;
export const selectWarning = (state) => state.modal.warning;
export const selectLocalStorageIndex = (state) => state.modal.localStorageIndex;

export const {
  removeModal,
  showModal,
  showWarning,
  removeWarning,
  changeLocalStorageIndex,
} = modalSlice.actions;
export default modalSlice.reducer;
