import { createSlice } from "@reduxjs/toolkit";
import { SESSION_TIMEOUT } from "../util/defines/common";

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
        localStorage.setItem('session_remaining', Date.now() + SESSION_TIMEOUT);
        localStorage.setItem(
          "userData",
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
      localStorage.removeItem("userData");
      localStorage.removeItem('session_remaining');
    },
  },
});

export const selectIsAuth = (state) => !!state.user.token;
export const selectUser = (state) => state.user;
export const { login, logout } = userSlice.actions;
export default userSlice.reducer;
