import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import * as sellerService from '../services/sellerService'

export function useSellerProfile(id, options = {}) {
  return useQuery({
    queryKey: ['seller', id],
    queryFn: () => sellerService.getSeller(id),
    enabled: !!id,
    ...options,
  })
}

export function useUpdateSellerProfile() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: sellerService.updateSellerProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seller'] })
    },
  })
}
