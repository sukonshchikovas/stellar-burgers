import { createSlice } from '@reduxjs/toolkit';
import { TUser } from '@utils-types';
import {
  getUser,
  loginUser,
  logoutUser,
  registerUser,
  updateUser
} from './action';

type TAuthState = {
  user: TUser | null;
  isAuthenticated: boolean;
  isAuthChecked: boolean;
  error: string | null;
};

const initialState: TAuthState = {
  user: null,
  isAuthenticated: false,
  isAuthChecked: false,
  error: null
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
    }
  },
  extraReducers: (builder) => {
    builder
      // getUser
      .addCase(getUser.fulfilled, (state, action) => {
        state.user = {
          name: action.payload.name,
          email: action.payload.email
        };
        state.isAuthenticated = true;
        state.isAuthChecked = true;
      })
      .addCase(getUser.rejected, (state) => {
        state.isAuthenticated = false;
        state.isAuthChecked = true;
      })
      // registerUser
      .addCase(registerUser.fulfilled, (state, action) => {
        state.user = action.payload;
        state.isAuthenticated = true;
      })
      // loginUser
      .addCase(loginUser.fulfilled, (state, action) => {
        state.user = action.payload;
        state.isAuthenticated = true;
      })
      // updateUser
      .addCase(updateUser.fulfilled, (state, action) => {
        state.user = action.payload;
      })
      // logoutUser
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.isAuthenticated = false;
      });
  }
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
