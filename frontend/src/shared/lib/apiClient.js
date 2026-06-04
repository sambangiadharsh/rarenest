import axios from 'axios'
import { getApiBaseUrl } from '@/shared/config/api'
import { store } from '@/app/store'
import { logout } from '@/app/store/authSlice'
import { queryClient } from '@/shared/lib/queryClient'

const apiClient = axios.create({
  baseURL: getApiBaseUrl(),
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
})

apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      // Clear auth state
      localStorage.removeItem('user')
      try {
        store.dispatch(logout())
      } catch (e) {
        // Fallback
      }
      
      // Clear react-query cache
      try {
        queryClient.clear()
      } catch (e) {
        // Fallback
      }
      
      // Redirect to Login page and show Session Expired
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login?expired=true'
      }
    }

    const data = error.response?.data
    const err = new Error(data?.message || 'An error occurred')
    err.requiresLogin = data?.requiresLogin === true
    err.status = error.response?.status
    return Promise.reject(err)
  },
)

export default apiClient
