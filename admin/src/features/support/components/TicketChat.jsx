import { useEffect, useRef, useState } from 'react'
import { useSelector } from 'react-redux'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { getApiOrigin } from '@/shared/config/api'
import {
  useAdminTicketMessages,
  useAdminSendMessage,
  useAddInternalNote,
} from '../hooks/useSupportAdmin'

function resolveUrl(url) {
  if (!url) return ''
  if (url.startsWith('http')) return url
  return `${getApiOrigin()}${url.startsWith('/') ? '' : '/'}${url}`
}

function MessageRow({ message, isOwn }) {
  const isInternal = message.is_internal
  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm ${
          isInternal
            ? 'border-2 border-dashed border-amber-400 bg-amber-50 text-amber-900'
            : isOwn
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted'
        }`}
      >
        {isInternal && (
          <p className="mb-1 text-[10px] font-bold uppercase text-amber-600">Internal</p>
        )}
        {message.message_type === 'IMAGE' && message.attachments?.[0] && (
          <img
            src={resolveUrl(message.attachments[0].file_url)}
            alt=""
            className="mb-2 max-h-40 rounded-lg"
          />
        )}
        {message.message && <p className="whitespace-pre-wrap">{message.message}</p>}
        <p className="mt-1 text-[10px] opacity-60">
          {message.sender_first_name} {message.sender_last_name} ·{' '}
          {new Date(message.created_at).toLocaleString()}
        </p>
      </div>
    </div>
  )
}

export default function TicketChat({ ticketId }) {
  const { user } = useSelector((state) => state.auth)
  const [text, setText] = useState('')
  const [noteText, setNoteText] = useState('')
  const bottomRef = useRef(null)

  const { data: messages = [], isLoading, refetch } = useAdminTicketMessages(ticketId)
  const { mutateAsync: sendMessage, isPending: isSending } = useAdminSendMessage()
  const { mutateAsync: addNote, isPending: isAddingNote } = useAddInternalNote()

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages.length])

  const handleSend = async () => {
    const trimmed = text.trim()
    if (!trimmed) return
    try {
      await sendMessage({ ticketId, message: trimmed })
      setText('')
      refetch()
    } catch (err) {
      toast.error(err.message || 'Failed to send')
    }
  }

  const handleAddNote = async () => {
    const trimmed = noteText.trim()
    if (!trimmed) return
    try {
      await addNote({ ticketId, message: trimmed })
      setNoteText('')
      toast.success('Internal note added')
    } catch (err) {
      toast.error(err.message || 'Failed to add note')
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="h-80 space-y-3 overflow-y-auto rounded-xl border bg-card p-4">
        {messages.map((msg) => (
          <MessageRow
            key={msg.id}
            message={msg}
            isOwn={String(msg.sender_id) === String(user?.id)}
          />
        ))}
        <div ref={bottomRef} />
      </div>

      <div className="flex gap-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Reply to user..."
          className="flex-1 rounded-lg border px-3 py-2 text-sm"
        />
        <button
          type="button"
          onClick={handleSend}
          disabled={isSending}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
        >
          Send
        </button>
      </div>

      <div className="rounded-xl border border-dashed border-amber-300 bg-amber-50/50 p-4">
        <p className="mb-2 text-xs font-bold uppercase text-amber-700">Internal note (admins only)</p>
        <div className="flex gap-2">
          <input
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            placeholder="Add internal note..."
            className="flex-1 rounded-lg border px-3 py-2 text-sm"
          />
          <button
            type="button"
            onClick={handleAddNote}
            disabled={isAddingNote}
            className="rounded-lg border border-amber-400 bg-amber-100 px-4 py-2 text-sm font-medium text-amber-900 disabled:opacity-50"
          >
            Add note
          </button>
        </div>
      </div>
    </div>
  )
}
