import { Link } from 'react-router-dom'
import { Archive, MessageSquare } from 'lucide-react'
import { cn } from '@/shared/lib/utils'

function formatPreview(conv) {
  if (conv.last_message_preview) {
    return conv.last_message_preview.length > 60
      ? `${conv.last_message_preview.slice(0, 60)}...`
      : conv.last_message_preview
  }
  return 'No messages yet'
}

function getTitle(conv) {
  if (conv.type === 'PROPERTY') {
    return conv.property_title || 'Property chat'
  }
  if (conv.type === 'SUPPORT') {
    return conv.ticket_subject || 'Support ticket'
  }
  return 'Conversation'
}

export default function ConversationList({
  conversations = [],
  activeId,
  onArchive,
  showArchive = true,
}) {
  if (!conversations.length) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 p-8 text-center text-muted-foreground">
        <MessageSquare className="h-10 w-10 opacity-40" />
        <p className="text-sm">No conversations yet</p>
      </div>
    )
  }

  return (
    <ul className="divide-y divide-brand-sand dark:divide-neutral-800">
      {conversations.map((conv) => (
        <li key={conv.id}>
          <Link
            to={`/messages/${conv.id}`}
            className={cn(
              'flex items-start gap-3 px-4 py-3 transition-colors hover:bg-brand-sand/30 dark:hover:bg-neutral-800/50',
              activeId === conv.id && 'bg-brand-sand/40 dark:bg-neutral-800',
            )}
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-terracotta/15 text-brand-terracotta">
              <MessageSquare className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <p className="truncate text-sm font-semibold">{getTitle(conv)}</p>
                {conv.unread_count > 0 && (
                  <span className="shrink-0 rounded-full bg-brand-terracotta px-1.5 py-0.5 text-[10px] font-bold text-white">
                    {conv.unread_count}
                  </span>
                )}
              </div>
              <p className="truncate text-xs text-muted-foreground">{formatPreview(conv)}</p>
              {conv.last_message_at && (
                <p className="mt-0.5 text-[10px] text-muted-foreground">
                  {new Date(conv.last_message_at).toLocaleString()}
                </p>
              )}
            </div>
            {showArchive && onArchive && (
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault()
                  onArchive(conv.id, !conv.is_archived)
                }}
                className="shrink-0 rounded p-1 text-muted-foreground hover:text-brand-terracotta"
                title={conv.is_archived ? 'Unarchive' : 'Archive'}
              >
                <Archive className="h-4 w-4" />
              </button>
            )}
          </Link>
        </li>
      ))}
    </ul>
  )
}
