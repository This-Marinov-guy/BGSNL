import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  showTypeModal: false,
  showErrorModal: false
};

export const alumniModalsSlice = createSlice({
  name: "alumniModals",
  initialState,
  reducers: {
    showTypeModal: (state) => {
      state.showTypeModal = true;
    },
    hideTypeModal: (state) => {
      state.showTypeModal = false;
    },
    showErrorModal: (state) => {
      state.showErrorModal = true;
    },
    hideErrorModal: (state) => {
      state.showErrorModal = false;
    },
    resetModals: (state) => {
      state.showTypeModal = false;
      state.showErrorModal = false;
    }
  }
});

export const { 
  showTypeModal, 
  hideTypeModal, 
  showErrorModal, 
  hideErrorModal, 
  resetModals 
} = alumniModalsSlice.actions;

export const selectAlumniModals = (state) => state.alumniModals;

export default alumniModalsSlice.reducer;
