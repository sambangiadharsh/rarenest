import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import * as supportApi from '../api/supportApi'

export function useCreateTicket() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: supportApi.createTicket,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['support-tickets'] })
    },
  })
}

export function useMyTickets(filters = {}) {
  return useQuery({
    queryKey: ['support-tickets', filters],
    queryFn: () => supportApi.getMyTickets(filters),
    select: (res) => res?.data ?? [],
  })
}

export function useTicket(id) {
  return useQuery({
    queryKey: ['support-ticket', id],
    queryFn: () => supportApi.getTicket(id),
    select: (res) => res?.data,
    enabled: Boolean(id),
  })
}

export function useTicketMessages(ticketId) {
  return useQuery({
    queryKey: ['support-messages', ticketId],
    queryFn: () => supportApi.getTicketMessages(ticketId, { limit: 50 }),
    select: (res) => res?.data ?? [],
    enabled: Boolean(ticketId),
    refetchInterval: 30000,
  })
}

export function useSendTicketMessage() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ ticketId, message }) =>
      supportApi.sendTicketMessage(ticketId, message),
    onSuccess: (_, { ticketId }) => {
      queryClient.invalidateQueries({ queryKey: ['support-messages', ticketId] })
      queryClient.invalidateQueries({ queryKey: ['support-tickets'] })
    },
  })
}
