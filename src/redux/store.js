import { configureStore } from "@reduxjs/toolkit";
import errorReducer from "./error";
import loadingReducer from './loading'
import modalReducer from "./modal";
import userReducer from "./user";
import eventsReducer from "./events";
import donationReducer from "./donation";

export const store = configureStore({
  reducer: {
    error: errorReducer,
    loading: loadingReducer,
    modal: modalReducer,
    user: userReducer,
    events: eventsReducer,
    donation: donationReducer,
  },
});
