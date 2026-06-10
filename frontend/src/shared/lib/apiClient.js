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

let isHandling401 = false

function isAuthRouteRequest(config) {
  const url = config?.url || ''
  return url.includes('/auth/')
}

function resetHandling401() {
  isHandling401 = false
}

apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const status = error.response?.status
    const data = error.response?.data
    const err = new Error(data?.message || 'An error occurred')
    err.requiresLogin = data?.requiresLogin === true
    err.status = status

    if (status === 401 && !isAuthRouteRequest(error.config) && !isHandling401) {
      isHandling401 = true

      try { localStorage.removeItem('user') } catch { /* ignore */ }
      try { store.dispatch(logout()) } catch { /* ignore */ }
      try { queryClient.clear() } catch { /* ignore */ }

      if (!window.location.pathname.includes('/login')) {
        // Full-page redirect clears module state on reload.
        // Safety reset in case navigation is blocked by the browser.
        setTimeout(resetHandling401, 8_000)
        window.location.href = '/login?expired=true'
      } else {
        // Already on login — just unlock so future errors can be handled
        resetHandling401()
      }
    }

    return Promise.reject(err)
  },
)

export default apiClient
