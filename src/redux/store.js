import { configureStore } from "@reduxjs/toolkit";
import notificationReducer from "./notification";
import loadingReducer from './loading'
import modalReducer from "./modal";
import userReducer from "./user";
import eventsReducer from "./events";
import donationReducer from "./donation";

export const store = configureStore({
  reducer: {
    notification: notificationReducer,
    loading: loadingReducer,
    modal: modalReducer,
    user: userReducer,
    events: eventsReducer,
    donation: donationReducer,
  },
});
