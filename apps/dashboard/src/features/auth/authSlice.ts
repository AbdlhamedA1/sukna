import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

import type { SessionUser } from '../../services/authApi';
import type { RootState } from '../../app/store';

interface AuthState {
  user: SessionUser | null;
}

const initialState: AuthState = { user: null };

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setSessionUser(state, action: PayloadAction<SessionUser>) {
      state.user = action.payload;
    },
    clearSessionUser(state) {
      state.user = null;
    },
  },
});

export const { setSessionUser, clearSessionUser } = authSlice.actions;
export const selectCurrentUser = (state: RootState) => state.auth.user;
export default authSlice.reducer;
