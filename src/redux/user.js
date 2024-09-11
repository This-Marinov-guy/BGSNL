import { createSlice } from "@reduxjs/toolkit";

export const userSlice = createSlice({
  name: "user",
  initialState: {
    token: null,
    expirationDate: null,
  },
  reducers: {
    login: {
      reducer(state, action) {
        const { token, expirationDate } = action.payload;
        state.token = token;
        state.expirationDate = expirationDate;
        localStorage.setItem(
          "userData",
          JSON.stringify({
            token: token,
            expirationDate: expirationDate,
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
      state.expirationDate = null;
      localStorage.removeItem("userData");
    },
  },
});

export const selectIsAuth = (state) => !!state.user.token;
export const selectUser = (state) => state.user;
export const { login, logout } = userSlice.actions;
export default userSlice.reducer;
