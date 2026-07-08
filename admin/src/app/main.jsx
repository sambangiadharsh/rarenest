import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import { QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider } from 'react-router-dom'
import { Toaster } from 'sonner'
import { store } from '@/app/store'
import { queryClient } from '@/shared/lib/queryClient'
import { router } from '@/app/routes'
import { GoogleOAuthProvider } from '@react-oauth/google'
import '../index.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <Provider store={store}>
        <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID || ''}>
          <RouterProvider router={router} />
          <Toaster position="top-right" richColors />
        </GoogleOAuthProvider>
      </Provider>
    </QueryClientProvider>
  </StrictMode>,
)
