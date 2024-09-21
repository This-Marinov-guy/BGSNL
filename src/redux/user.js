import { createSlice } from "@reduxjs/toolkit";
import { LOCAL_STORAGE_SESSION_LIFE, LOCAL_STORAGE_USER_DATA, SESSION_TIMEOUT } from "../util/defines/common";

export const userSlice = createSlice({
  name: "user",
  initialState: {
    token: null,
    expirationDate: null,
  },
  reducers: {
    login: {
      reducer(state, action) {
        const { token } = action.payload;
        state.token = token;
        localStorage.setItem(LOCAL_STORAGE_SESSION_LIFE, Date.now() + SESSION_TIMEOUT);
        localStorage.setItem(
          LOCAL_STORAGE_USER_DATA,
          JSON.stringify({
            token,
          })
        );
      },
      prepare(values) {
        return {
          payload: {
            ...values,
          },
        };
      },
    },
    logout: (state) => {
      state.token = null;
      localStorage.removeItem(LOCAL_STORAGE_USER_DATA);
      localStorage.removeItem(LOCAL_STORAGE_SESSION_LIFE);
    },
  },
});

export const selectIsAuth = (state) => !!state.user.token;
export const selectUser = (state) => state.user;
export const { login, logout } = userSlice.actions;
export default userSlice.reducer;
