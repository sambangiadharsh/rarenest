import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { RouterProvider } from 'react-router-dom'
import { store } from '@/app/store'
import { logout } from '@/app/store/authSlice'
import { queryClient } from '@/shared/lib/queryClient'
import { router } from '@/app/routes'
import { GoogleOAuthProvider } from '@react-oauth/google'
import '../index.css'
import 'react-loading-skeleton/dist/skeleton.css'

const persistedUser = store.getState().auth.user
if (persistedUser?.role?.toLowerCase() === 'admin') {
  store.dispatch(logout())
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <Provider store={store}>
        <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID || ''}>
          <RouterProvider router={router} />
        </GoogleOAuthProvider>
      </Provider>
      <ReactQueryDevtools initialIsOpen={false} buttonPosition="bottom-left" />
    </QueryClientProvider>
  </StrictMode>,
)
