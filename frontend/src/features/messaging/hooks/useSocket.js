import { useEffect, useCallback, useRef } from 'react'
import { useDispatch } from 'react-redux'
import { useQueryClient } from '@tanstack/react-query'
import { connectSocket, getSocket } from '@/shared/lib/socketClient'
import { setSocketConnected } from '@/app/store/messagingSlice'

export function useSocketConnection(enabled = true) {
  const dispatch = useDispatch()
  const queryClient = useQueryClient()
  const initialized = useRef(false)

  useEffect(() => {
    if (!enabled || initialized.current) return
    initialized.current = true

    const socket = connectSocket()

    const onConnect = () => dispatch(setSocketConnected(true))
    const onDisconnect = () => dispatch(setSocketConnected(false))

    const onMessageNew = () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] })
      queryClient.invalidateQueries({ queryKey: ['messages'] })
    }

    const onNotification = () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
      queryClient.invalidateQueries({ queryKey: ['notifications', 'unread-count'] })
    }

    socket.on('connect', onConnect)
    socket.on('disconnect', onDisconnect)
    socket.on('message:new', onMessageNew)
    socket.on('notification:new', onNotification)

    if (socket.connected) dispatch(setSocketConnected(true))

    return () => {
      socket.off('connect', onConnect)
      socket.off('disconnect', onDisconnect)
      socket.off('message:new', onMessageNew)
      socket.off('notification:new', onNotification)
    }
  }, [enabled, dispatch, queryClient])
}

export function useConversationSocket(conversationId) {
  const queryClient = useQueryClient()

  const join = useCallback(() => {
    if (!conversationId) return
    const socket = getSocket()
    if (!socket.connected) socket.connect()
    socket.emit('conversation:join', { conversationId })
  }, [conversationId])

  const leave = useCallback(() => {
    if (!conversationId) return
    getSocket().emit('conversation:leave', { conversationId })
  }, [conversationId])

  useEffect(() => {
    if (!conversationId) return undefined
    const socket = getSocket()
    if (!socket.connected) socket.connect()
    socket.emit('conversation:join', { conversationId })

    const handleNew = (msg) => {
      queryClient.setQueryData(['messages', conversationId], (old) => {
        if (!old?.pages) return old
        const exists = old.pages.some((page) =>
          page.data?.some((m) => m.id === msg.id),
        )
        if (exists) return old
        const pages = [...old.pages]
        const lastIdx = pages.length - 1
        pages[lastIdx] = {
          ...pages[lastIdx],
          data: [...(pages[lastIdx].data || []), msg],
        }
        return { ...old, pages }
      })
      queryClient.invalidateQueries({ queryKey: ['conversations'] })
    }

    const handleRead = () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] })
    }

    socket.on('message:new', handleNew)
    socket.on('message:read', handleRead)

    return () => {
      socket.emit('conversation:leave', { conversationId })
      socket.off('message:new', handleNew)
      socket.off('message:read', handleRead)
    }
  }, [conversationId, queryClient])

  const sendSocketMessage = useCallback((message, messageType = 'TEXT') => {
    getSocket().emit('message:send', { conversationId, message, messageType })
  }, [conversationId])

  const markSocketRead = useCallback((messageId) => {
    getSocket().emit('message:read', { conversationId, messageId })
  }, [conversationId])

  return { join, leave, sendSocketMessage, markSocketRead }
}
