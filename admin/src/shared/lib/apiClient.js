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
    const message = error.response?.data?.message || 'An error occurred'
    return Promise.reject(new Error(message))
  },
)

export default apiClient
