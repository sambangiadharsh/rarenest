import { configureStore } from '@reduxjs/toolkit'
import authReducer from './authSlice'
import messagingReducer from './messagingSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    messaging: messagingReducer,
  },
  devTools: import.meta.env.DEV,
})
