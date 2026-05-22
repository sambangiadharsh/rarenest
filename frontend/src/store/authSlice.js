import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  user: localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null,
  isAuthenticated: !!localStorage.getItem('user'),
  activeFilters: {},
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials(state, action) {
      state.user = action.payload;
      state.isAuthenticated = true;
      localStorage.setItem('user', JSON.stringify(action.payload));
    },
    logout(state) {
      state.user = null;
      state.isAuthenticated = false;
      localStorage.removeItem('user');
    },
    setFilters(state, action) {
      state.activeFilters = { ...state.activeFilters, ...action.payload };
    },
    clearFilters(state) {
      state.activeFilters = {};
    },
  },
})

export const { setCredentials, logout, setFilters, clearFilters } = authSlice.actions;
export default authSlice.reducer;
