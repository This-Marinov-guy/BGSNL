import { createSlice } from "@reduxjs/toolkit";
import { sessionIsActive, announceSessionChange } from "../util/auth/browser-session.mjs";
import { endBrowserSession } from "../util/auth/browser-request.mjs";

const accountFields = ["nonExpiring", "hasBenefits", "memberDiscount", "billingLocked", "billingVerificationUnavailable", "lockReason", "tier", "subscription", "roles", "region", "status", "isSubscribed", "isAlumni", "image"];
const empty = () => ({ authInitialized: false, session: null, roles: [], status: "", image: "", hasBenefits: false, memberDiscount: false, isSubscribed: false, isAlumni: false });
export const userSlice = createSlice({
  name: "user", initialState: empty(),
  reducers: {
    login: (state, { payload }) => {
      if (!sessionIsActive(payload?.session)) return;
      Object.assign(state, empty());
      delete state.initialAccount;
      delete state.initialCelebrate;
      state.authInitialized = true;
      state.session = payload.session;
      // Hand the already verified account response to the account page once.
      if (payload.user) {
        state.initialAccount = payload.user;
        state.initialCelebrate = !!payload.celebrate;
      }
      for (const key of ["roles", "status", "region", "image"]) if (Object.hasOwn(payload.session, key)) state[key] = payload.session[key];
      for (const key of accountFields) if (Object.hasOwn(payload.user || payload, key)) state[key] = (payload.user || payload)[key];
      for (const key of ["roles", "status", "region", "image"]) state.session[key] = state[key] ?? state.session[key];
    },
    clearSession: () => ({ ...empty(), authInitialized: true }),
    finishAuthInitialization: (state) => { state.authInitialized = true; },
    consumeInitialAccount: (state) => { delete state.initialAccount; delete state.initialCelebrate; },
    updateAccount: (state, { payload }) => {
      for (const key of accountFields) if (Object.hasOwn(payload, key)) state[key] = payload[key];
      if (state.session) for (const key of ["roles", "status", "region", "image"]) if (Object.hasOwn(payload, key)) state.session[key] = payload[key];
    },
    refreshSession: (state, { payload }) => {
      if (!state.session || !sessionIsActive(payload) || payload.auth_time !== state.session.auth_time ||
          payload.sid !== state.session.sid || payload.exp < state.session.exp ||
          payload.sessionVersion < state.session.sessionVersion || payload.accessExp < state.session.accessExp) return;
      state.session = payload;
      for (const key of ["roles", "status", "region", "image"]) if (Object.hasOwn(payload, key)) state[key] = payload[key];
    },
  },
});
export const { login, clearSession, finishAuthInitialization, consumeInitialAccount, updateAccount, refreshSession } = userSlice.actions;
export const logout = () => async (dispatch) => {
  await endBrowserSession();
  dispatch(clearSession());
  announceSessionChange();
};
export const selectIsAuth = (state) => sessionIsActive(state.user.session);
export const selectUser = (state) => state.user;
export default userSlice.reducer;
