import { createSlice } from '@reduxjs/toolkit'

const messagingSlice = createSlice({
  name: 'messaging',
  initialState: {
    activeConversationId: null,
    socketConnected: false,
  },
  reducers: {
    setActiveConversationId(state, action) {
      state.activeConversationId = action.payload
    },
    setSocketConnected(state, action) {
      state.socketConnected = action.payload
    },
    clearMessagingState(state) {
      state.activeConversationId = null
      state.socketConnected = false
    },
  },
})

export const { setActiveConversationId, setSocketConnected, clearMessagingState } =
  messagingSlice.actions
export default messagingSlice.reducer
