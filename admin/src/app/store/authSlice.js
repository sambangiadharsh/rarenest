import { createSlice } from '@reduxjs/toolkit'

const STORAGE_KEY = 'admin_user'

const getStoredUser = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

const storedUser = getStoredUser()

const initialState = {
  user: storedUser,
  isAuthenticated: !!storedUser,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials(state, action) {
      state.user = action.payload
      state.isAuthenticated = true
      localStorage.setItem(STORAGE_KEY, JSON.stringify(action.payload))
    },
    logout(state) {
      state.user = null
      state.isAuthenticated = false
      localStorage.removeItem(STORAGE_KEY)
    },
  },
})

export const { setCredentials, logout } = authSlice.actions
export default authSlice.reducer
