import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import * as supportApi from '../api/supportApi'

export function useAdminTickets(filters = {}) {
  return useQuery({
    queryKey: ['admin-support-tickets', filters],
    queryFn: () => supportApi.getTickets(filters),
    select: (res) => ({ tickets: res?.data ?? [], count: res?.count ?? 0 }),
  })
}

export function useAdminTicket(id) {
  return useQuery({
    queryKey: ['admin-support-ticket', id],
    queryFn: () => supportApi.getTicket(id),
    select: (res) => res?.data,
    enabled: Boolean(id),
  })
}

export function useAdminTicketMessages(ticketId) {
  return useQuery({
    queryKey: ['admin-support-messages', ticketId],
    queryFn: () => supportApi.getTicketMessages(ticketId, { limit: 100 }),
    select: (res) => res?.data ?? [],
    enabled: Boolean(ticketId),
    refetchInterval: 15000,
  })
}

export function useAdmins() {
  return useQuery({
    queryKey: ['admin-users'],
    queryFn: () => supportApi.getAdmins(),
    select: (res) => res?.data ?? [],
  })
}

export function useAssignTicket() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ ticketId, adminId }) => supportApi.assignTicket(ticketId, adminId),
    onSuccess: (_, { ticketId }) => {
      qc.invalidateQueries({ queryKey: ['admin-support-ticket', ticketId] })
      qc.invalidateQueries({ queryKey: ['admin-support-tickets'] })
    },
  })
}

export function useUpdateTicketStatus() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ ticketId, status }) => supportApi.updateTicketStatus(ticketId, status),
    onSuccess: (_, { ticketId }) => {
      qc.invalidateQueries({ queryKey: ['admin-support-ticket', ticketId] })
      qc.invalidateQueries({ queryKey: ['admin-support-tickets'] })
    },
  })
}

export function useUpdateTicketPriority() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ ticketId, priority }) => supportApi.updateTicketPriority(ticketId, priority),
    onSuccess: (_, { ticketId }) => {
      qc.invalidateQueries({ queryKey: ['admin-support-ticket', ticketId] })
      qc.invalidateQueries({ queryKey: ['admin-support-tickets'] })
    },
  })
}

export function useAddInternalNote() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ ticketId, message }) => supportApi.addInternalNote(ticketId, message),
    onSuccess: (_, { ticketId }) => {
      qc.invalidateQueries({ queryKey: ['admin-support-messages', ticketId] })
    },
  })
}

export function useAdminSendMessage() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ ticketId, message }) => supportApi.sendTicketMessage(ticketId, message),
    onSuccess: (_, { ticketId }) => {
      qc.invalidateQueries({ queryKey: ['admin-support-messages', ticketId] })
      qc.invalidateQueries({ queryKey: ['admin-support-tickets'] })
    },
  })
}
