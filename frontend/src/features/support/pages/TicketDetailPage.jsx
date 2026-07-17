import { useEffect, useRef } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import MessageBubble from '@/features/messaging/components/MessageBubble'
import MessageInput from '@/features/messaging/components/MessageInput'
import { useTicket, useTicketMessages, useSendTicketMessage } from '../hooks/useSupport'
import { useSocketConnection } from '@/features/messaging'

const statusColors = {
  Open: 'bg-blue-100 text-blue-700',
  'In Progress': 'bg-amber-100 text-amber-700',
  'Waiting for User': 'bg-purple-100 text-purple-700',
  Resolved: 'bg-emerald-100 text-emerald-700',
  Closed: 'bg-gray-100 text-gray-600',
}

export default function TicketDetailPage() {
  const { id } = useParams()
  const { user, isAuthenticated } = useSelector((state) => state.auth)
  const bottomRef = useRef(null)

  useSocketConnection(isAuthenticated)

  const { data: ticket, isLoading } = useTicket(id)
  const { data: messages = [], refetch } = useTicketMessages(id)
  const { mutateAsync: sendMessage, isPending } = useSendTicketMessage()

  const isClosed = ticket?.status === 'Closed'

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages.length])

  const handleSend = async (text) => {
    try {
      await sendMessage({ ticketId: id, message: text })
      refetch()
    } catch (err) {
      toast.error(err.message || 'Failed to send message')
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-brand-terracotta" />
      </div>
    )
  }

  if (!ticket) {
    return <p className="p-8 text-center text-muted-foreground">Ticket not found</p>
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <Link to="/support/tickets" className="mb-4 inline-flex items-center gap-1 text-sm text-brand-terracotta hover:underline">
        <ArrowLeft className="h-4 w-4" /> Back to tickets
      </Link>

      <div className="mb-4 rounded-2xl border border-brand-sand bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="font-serif text-2xl font-bold">{ticket.subject}</h1>
            <p className="text-sm text-muted-foreground">{ticket.category}</p>
          </div>
          <div className="flex gap-2">
            <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${statusColors[ticket.status]}`}>
              {ticket.status}
            </span>
            <span className="rounded-full bg-brand-sand px-2.5 py-0.5 text-xs font-bold">
              {ticket.priority}
            </span>
          </div>
        </div>
        <p className="mt-3 text-sm text-muted-foreground">{ticket.description}</p>
      </div>

      <div className="flex min-h-[400px] flex-col overflow-hidden rounded-2xl border border-brand-sand bg-white dark:border-neutral-800 dark:bg-neutral-900">
        <div className="flex-1 space-y-3 overflow-y-auto p-4">
          {messages.map((msg) => (
            <MessageBubble
              key={msg.id}
              message={msg}
              isOwn={String(msg.sender_id) === String(user?.id)}
            />
          ))}
          <div ref={bottomRef} />
        </div>
        <MessageInput
          onSend={handleSend}
          disabled={isClosed}
          isSending={isPending}
          placeholder={isClosed ? 'This ticket is closed' : 'Reply to support...'}
        />
      </div>
    </div>
  )
}
