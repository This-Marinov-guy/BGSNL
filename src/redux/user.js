import { createSlice } from "@reduxjs/toolkit";
import { LOCAL_STORAGE_USER_DATA } from "../util/defines/common";

export const userSlice = createSlice({
  name: "user",
  initialState: {
    image: '',
    version: null,
    token: null,
    status: '',
    isSubscribed: false,
    isAlumni: false,
  },
  reducers: {
    login: {
      reducer(state, action) {
        const { version,token, status, isSubscribed, isAlumni, image } = action.payload;
        state.image = image;
        state.version = version;
        state.token = token;
        state.status = status;
        state.isSubscribed = isSubscribed;
        state.isAlumni = isAlumni;
        
        // Store user data - no expiration check on frontend
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
      state.version = null;
      state.token = null;
      state.status = '';
      state.isSubscribed = false;
      state.isAlumni = false;
      localStorage.removeItem(LOCAL_STORAGE_USER_DATA);
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
