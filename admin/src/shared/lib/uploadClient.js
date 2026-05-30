import axios from 'axios'
import { getApiBaseUrl } from '@/shared/config/api'

const uploadClient = axios.create({
  baseURL: getApiBaseUrl(),
  withCredentials: true,
})

uploadClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message = error.response?.data?.message || 'Upload failed'
    return Promise.reject(new Error(message))
  },
)

export default uploadClient
