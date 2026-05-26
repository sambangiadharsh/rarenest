import { useMutation } from '@tanstack/react-query'
import * as enquiryService from '../services/enquiryService'

export function useCreateEnquiry() {
  return useMutation({
    mutationFn: enquiryService.createEnquiry,
  })
}

export function useGuestEnquiry() {
  return useMutation({
    mutationFn: enquiryService.createGuestEnquiry,
  })
}
