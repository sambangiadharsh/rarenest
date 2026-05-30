/**
 * Backend origin for API and uploaded media.
 * Keep in sync: apiClient uses /api, images use /uploads on the same host.
 */
export function getApiOrigin() {
  if (import.meta.env.MODE === 'development') {
    return 'http://localhost:5000'
  }

  const configured = import.meta.env.VITE_API_URL
  if (typeof configured === 'string' && configured.trim()) {
    return configured.trim().replace(/\/$/, '')
  }

  return ''
}

export function getApiBaseUrl() {
  const origin = getApiOrigin()
  return origin ? `${origin}/api` : '/api'
}
