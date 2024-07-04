import { createSlice } from "@reduxjs/toolkit";

export const modalSlice = createSlice({
  name: "modal",
  initialState: {
    modal: null,
    warning: false,
  },
  reducers: {
    showModal: (state, action) => {
      state.modal = action.payload;
    },
    removeModal: (state) => {
      state.modal = false;
    },
    showWarning: (state) => {
      state.warning = true;
    },
    removeWarning: (state) => {
      state.warning = null;
    },
  },
});

export const selectModal = (state) => state.modal.modal;
export const selectWarning = (state) => state.modal.warning;

export const { removeModal, showModal, showWarning, removeWarning } =
  modalSlice.actions;
export default modalSlice.reducer;
