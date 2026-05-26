import apiClient from '@/shared/lib/apiClient'

export function getCmsPageAdmin(pageKey) {
  return apiClient.get(`/cms/pages/${pageKey}/admin`)
}

export function updateCmsPage(pageKey, data) {
  return apiClient.put(`/cms/pages/${pageKey}`, data)
}
