import { createSlice } from "@reduxjs/toolkit";

export const modalSlice = createSlice({
  name: "modal",
  initialState: {
    modal: [],
    warning: [],
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
  },
});

export const selectModal = (state) => state.modal.modal;
export const selectWarning = (state) => state.modal.warning;

export const { removeModal, showModal, showWarning, removeWarning } =
  modalSlice.actions;
export default modalSlice.reducer;
