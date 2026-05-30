import axios from 'axios'
import { getApiBaseUrl } from '@/shared/config/api'

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
    const data = error.response?.data
    const err = new Error(data?.message || 'An error occurred')
    err.requiresLogin = data?.requiresLogin === true
    err.status = error.response?.status
    return Promise.reject(err)
  },
)

export default apiClient
