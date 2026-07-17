import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { ArrowLeft, MessageSquare, Wifi, WifiOff } from 'lucide-react'
import { toast } from 'sonner'
import ConversationList from '../components/ConversationList'
import ChatWindow from '../components/ChatWindow'
import {
  useConversations,
  useArchiveConversation,
} from '../hooks/useMessaging'
import { useSocketConnection } from '../hooks/useSocket'
import { Button } from '@/shared/components/ui/button'

export default function MessagesPage() {
  const { conversationId } = useParams()
  const navigate = useNavigate()
  const { isAuthenticated } = useSelector((state) => state.auth)
  const socketConnected = useSelector((state) => state.messaging.socketConnected)
  const [showArchived, setShowArchived] = useState(false)

  useSocketConnection(isAuthenticated)

  const filters = { type: undefined, archived: showArchived ? 'all' : false }
  const { data: conversations = [], isLoading } = useConversations(filters)

  const activeMeta = conversations.find((c) => c.id === conversationId)
  const chatTitle =
    activeMeta?.property_title ||
    activeMeta?.ticket_subject ||
    'Conversation'
  const { mutateAsync: archive } = useArchiveConversation()

  const handleArchive = async (id, isArchived) => {
    try {
      await archive({ conversationId: id, isArchived })
      toast.success(isArchived ? 'Conversation archived' : 'Conversation restored')
      if (conversationId === id && isArchived) navigate('/messages')
    } catch (err) {
      toast.error(err.message || 'Failed to update archive')
    }
  }

  const getChatTitle = () => chatTitle

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl font-bold text-brand-forest">Messages</h1>
          <p className="text-sm text-muted-foreground">Chat with property owners</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowArchived((v) => !v)}
        >
          {showArchived ? 'Hide archived' : 'Show archived'}
        </Button>
      </div>

      <div className="grid min-h-[600px] overflow-hidden rounded-2xl border border-brand-sand bg-white shadow-lg dark:border-neutral-800 dark:bg-neutral-900 lg:grid-cols-[320px_1fr]">
        <div className="border-r border-brand-sand dark:border-neutral-800">
          {isLoading ? (
            <div className="p-8 text-center text-sm text-muted-foreground">Loading...</div>
          ) : (
            <ConversationList
              conversations={conversations}
              activeId={conversationId}
              onArchive={handleArchive}
            />
          )}
        </div>

        <div className="flex flex-col">
          {conversationId ? (
            <>
              <div className="flex items-center gap-3 border-b border-brand-sand px-4 py-3 dark:border-neutral-800">
                <Button
                  variant="ghost"
                  size="icon"
                  className="lg:hidden"
                  onClick={() => navigate('/messages')}
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <MessageSquare className="h-5 w-5 text-brand-terracotta" />
                <h2 className="font-semibold">{getChatTitle()}</h2>
                {socketConnected ? (
                  <Wifi className="ml-auto h-4 w-4 text-emerald-500" title="Connected" />
                ) : (
                  <WifiOff className="ml-auto h-4 w-4 text-muted-foreground" title="Reconnecting..." />
                )}
              </div>
              <div className="flex-1">
                <ChatWindow conversationId={conversationId} />
              </div>
            </>
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center gap-3 p-8 text-center text-muted-foreground">
              <MessageSquare className="h-12 w-12 opacity-30" />
              <p>Select a conversation to start chatting</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
