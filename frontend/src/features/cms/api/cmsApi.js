import apiClient from '@/shared/lib/apiClient'

export function getCmsPage(pageKey) {
  return apiClient.get(`/cms/pages/${pageKey}`)
}
