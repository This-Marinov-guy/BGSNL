import { createSlice } from "@reduxjs/toolkit";
import { LOCAL_STORAGE_SESSION_LIFE, LOCAL_STORAGE_USER_DATA, SESSION_TIMEOUT } from "../util/defines/common";

export const userSlice = createSlice({
  name: "user",
  initialState: {
    image: '',
    token: null,
    status: '',
    isSubscribed: false,
  },
  reducers: {
    login: {
      reducer(state, action) {
        const { token, status, isSubscribed, image } = action.payload;
        state.image = image;
        state.token = token;
        state.status = status;
        state.isSubscribed = isSubscribed;
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
      state.image = '';
      state.token = null;
      state.status = '';
      state.isSubscribed = false;
      localStorage.removeItem(LOCAL_STORAGE_USER_DATA);
      localStorage.removeItem(LOCAL_STORAGE_SESSION_LIFE);
    },

    refreshToken: (state, action) => {
      const token = action.payload;

      state.token = action.payload;

      localStorage.setItem(
        LOCAL_STORAGE_USER_DATA,
        JSON.stringify({
          token,
        })
      );
    }

  },
});

export const selectIsAuth = (state) => !!state.user.token;
export const selectUser = (state) => state.user;
export const { login, logout, refreshToken } = userSlice.actions;
export default userSlice.reducer;
