import { createSlice } from '@reduxjs/toolkit'
import { clearAllLocalDrafts } from '@/features/properties/utils/draftStorage'

function loadPersistedUser() {
  const raw = localStorage.getItem('user')
  if (!raw) return null
  try {
    return JSON.parse(raw)
  } catch {
    localStorage.removeItem('user')
    return null
  }
}

const persistedUser = loadPersistedUser()

const initialState = {
  user: persistedUser,
  isAuthenticated: !!persistedUser,
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
      clearAllLocalDrafts();
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
