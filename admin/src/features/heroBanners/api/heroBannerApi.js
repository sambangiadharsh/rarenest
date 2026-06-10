import apiClient from '@/shared/lib/apiClient'

export function getHeroBannersAdmin() {
  return apiClient.get('/hero-banners/admin')
}

function buildFormData(data, file) {
  const fd = new FormData()
  if (file) fd.append('image', file)
  if (data.title !== undefined) fd.append('title', data.title)
  if (data.subtitle !== undefined) fd.append('subtitle', data.subtitle ?? '')
  if (data.image_url !== undefined) fd.append('image_url', data.image_url)
  if (data.display_order !== undefined) fd.append('display_order', String(data.display_order))
  if (data.is_active !== undefined) fd.append('is_active', String(data.is_active))
  return fd
}

export function createHeroBanner({ file, ...data }) {
  return apiClient.post('/hero-banners', buildFormData(data, file), {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}

export function updateHeroBanner(id, { file, ...data }) {
  return apiClient.put(`/hero-banners/${id}`, buildFormData(data, file), {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}

export function deleteHeroBanner(id) {
  return apiClient.delete(`/hero-banners/${id}`)
}

export function toggleHeroBanner(id) {
  return apiClient.patch(`/hero-banners/${id}/toggle`)
}

export function reorderHeroBanners(items) {
  return apiClient.put('/hero-banners/reorder', { items })
}
