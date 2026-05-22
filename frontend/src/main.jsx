import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import { QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider } from 'react-router-dom'
import { store } from './store'
import { logout } from './store/authSlice'
import { queryClient } from './lib/queryClient'
import { router } from './routes'
import './index.css'

// Clear stale admin sessions; admins sign in via the separate admin app.
const persistedUser = store.getState().auth.user
if (persistedUser?.role?.toLowerCase() === 'admin') {
  store.dispatch(logout())
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <Provider store={store}>
        <RouterProvider router={router} />
      </Provider>
    </QueryClientProvider>
  </StrictMode>,
)
