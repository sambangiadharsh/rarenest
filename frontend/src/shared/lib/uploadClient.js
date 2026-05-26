import axios from 'axios'

const uploadClient = axios.create({
  baseURL: '/api',
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
