import { useEffect, useMemo, useRef } from 'react'
import { useSelector } from 'react-redux'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { getSocket } from '@/shared/lib/socketClient'
import MessageBubble from './MessageBubble'
import MessageInput from './MessageInput'
import {
  useMessages,
  useSendMessage,
  useUploadAttachment,
  useMarkRead,
} from '../hooks/useMessaging'
import { useConversationSocket } from '../hooks/useSocket'

export default function ChatWindow({ conversationId, disabled = false }) {
  const { user } = useSelector((state) => state.auth)
  const bottomRef = useRef(null)
  const containerRef = useRef(null)

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = useMessages(conversationId)

  const { mutateAsync: sendMessage, isPending: isSending } = useSendMessage()
  const { mutateAsync: uploadAttachment, isPending: isUploading } = useUploadAttachment()
  const { mutate: markRead } = useMarkRead()
  const { sendSocketMessage, markSocketRead } = useConversationSocket(conversationId)

  const messages = useMemo(
    () => data?.pages?.slice().reverse().flatMap((p) => p.data) ?? [],
    [data],
  )

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages.length])

  useEffect(() => {
    if (!messages.length || !user) return
    const lastMsg = messages[messages.length - 1]
    if (String(lastMsg.sender_id) !== String(user.id)) {
      markRead({ conversationId, messageId: lastMsg.id })
      markSocketRead(lastMsg.id)
    }
  }, [messages, conversationId, user, markRead, markSocketRead])

  const handleSend = async (text) => {
    try {
      const socket = getSocket()
      if (socket.connected) {
        sendSocketMessage(text)
      } else {
        await sendMessage({ conversationId, message: text })
      }
    } catch (err) {
      toast.error(err.message || 'Failed to send message')
    }
  }

  const handleAttach = async (file) => {
    try {
      await uploadAttachment({ conversationId, file })
    } catch (err) {
      toast.error(err.message || 'Failed to upload attachment')
    }
  }

  const handleScroll = () => {
    const el = containerRef.current
    if (!el || !hasNextPage || isFetchingNextPage) return
    if (el.scrollTop < 80) fetchNextPage()
  }

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-brand-terracotta" />
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col">
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="flex-1 space-y-3 overflow-y-auto p-4"
      >
        {isFetchingNextPage && (
          <div className="flex justify-center py-2">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        )}
        {messages.map((msg) => (
          <MessageBubble
            key={msg.id}
            message={msg}
            isOwn={String(msg.sender_id) === String(user?.id)}
            showReadReceipt
          />
        ))}
        <div ref={bottomRef} />
      </div>
      <MessageInput
        onSend={handleSend}
        onAttach={handleAttach}
        disabled={disabled}
        isSending={isSending || isUploading}
      />
    </div>
  )
}
