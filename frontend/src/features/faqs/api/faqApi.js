import apiClient from '@/shared/lib/apiClient'

export function getFaqs() {
  return apiClient.get('/faqs')
}
