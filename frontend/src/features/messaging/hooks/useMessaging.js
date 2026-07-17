import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import * as messagingService from '../services/messagingService'

export function useConversations(filters = {}) {
  return useQuery({
    queryKey: ['conversations', filters],
    queryFn: () => messagingService.getConversations(filters),
    select: (res) => res?.data ?? [],
  })
}

export function useConversation(id, options = {}) {
  return useQuery({
    queryKey: ['conversation', id],
    queryFn: () => messagingService.getConversation(id),
    select: (res) => res?.data,
    enabled: Boolean(id),
    ...options,
  })
}

export function useMessages(conversationId) {
  return useInfiniteQuery({
    queryKey: ['messages', conversationId],
    queryFn: ({ pageParam }) =>
      messagingService.getMessages(conversationId, {
        cursor: pageParam,
        limit: 30,
      }),
    initialPageParam: undefined,
    getNextPageParam: (lastPage) => {
      const messages = lastPage?.data ?? []
      if (messages.length < 30) return undefined
      return messages[0]?.created_at
    },
    enabled: Boolean(conversationId),
    select: (data) => ({
      pages: data.pages.map((p) => ({ data: p?.data ?? [] })),
      pageParams: data.pageParams,
    }),
  })
}

export function useSendMessage() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ conversationId, message, message_type }) =>
      messagingService.sendMessage(conversationId, { message, message_type }),
    onSuccess: (_, { conversationId }) => {
      queryClient.invalidateQueries({ queryKey: ['messages', conversationId] })
      queryClient.invalidateQueries({ queryKey: ['conversations'] })
    },
  })
}

export function useUploadAttachment() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ conversationId, file }) =>
      messagingService.uploadAttachment(conversationId, file),
    onSuccess: (_, { conversationId }) => {
      queryClient.invalidateQueries({ queryKey: ['messages', conversationId] })
      queryClient.invalidateQueries({ queryKey: ['conversations'] })
    },
  })
}

export function useMarkRead() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ conversationId, messageId }) =>
      messagingService.markRead(conversationId, messageId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] })
    },
  })
}

export function useArchiveConversation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ conversationId, isArchived }) =>
      messagingService.archiveConversation(conversationId, isArchived),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] })
    },
  })
}

export function useOpenPropertyChat() {
  return useMutation({
    mutationFn: (propertyId) => messagingService.openPropertyChat(propertyId),
  })
}
