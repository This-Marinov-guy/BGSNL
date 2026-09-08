import { createSlice } from "@reduxjs/toolkit";
import { LOCAL_STORAGE_USER_DATA } from "../util/defines/common";

export const userSlice = createSlice({
  name: "user",
  initialState: {
    authInitialized: false,
    image: '',
    version: null,
    token: null,
    status: '',
    isSubscribed: false,
    isAlumni: false,
    hasBenefits: false,
    memberDiscount: false,
  },
  reducers: {
    login: {
      reducer(state, action) {
        state.authInitialized = true;
        const { version,token, status, isSubscribed, isAlumni, image } = action.payload;
        for (const key of ["hasBenefits", "memberDiscount", "billingLocked", "billingVerificationUnavailable", "lockReason", "tier", "subscription", "roles", "region"]) state[key] = action.payload[key];
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
      state.authInitialized = true;
      state.image = '';
      state.version = null;
      state.token = null;
      state.status = '';
      state.isSubscribed = false;
      state.isAlumni = false;
      state.hasBenefits = false;
      state.memberDiscount = false;
      state.billingLocked = false;
      state.lockReason = null;
      state.subscription = null;
      state.roles = [];
      state.tier = null;
      state.region = null;
      localStorage.removeItem(LOCAL_STORAGE_USER_DATA);
    },

    finishAuthInitialization: (state) => { state.authInitialized = true; },

    updateAccount: (state, action) => {
      for (const key of ["status", "isSubscribed", "isAlumni", "hasBenefits", "memberDiscount", "billingLocked", "billingVerificationUnavailable", "lockReason", "tier", "subscription", "roles", "region", "image"]) {
        if (Object.prototype.hasOwnProperty.call(action.payload, key)) state[key] = action.payload[key];
      }
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
export const { login, logout, refreshToken, updateAccount, finishAuthInitialization } = userSlice.actions;
export default userSlice.reducer;
