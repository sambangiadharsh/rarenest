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
import '../index.css'

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
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  </StrictMode>,
)
