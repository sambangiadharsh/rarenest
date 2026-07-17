import { Check, CheckCheck } from 'lucide-react'
import { getApiOrigin } from '@/shared/config/api'
import { cn } from '@/shared/lib/utils'

function resolveUrl(url) {
  if (!url) return ''
  if (url.startsWith('http')) return url
  return `${getApiOrigin()}${url.startsWith('/') ? '' : '/'}${url}`
}

export default function MessageBubble({ message, isOwn, showReadReceipt, isRead }) {
  const isInternal = message.is_internal

  return (
    <div className={cn('flex', isOwn ? 'justify-end' : 'justify-start')}>
      <div
        className={cn(
          'max-w-[75%] rounded-2xl px-4 py-2 text-sm shadow-sm',
          isOwn
            ? 'bg-brand-terracotta text-white rounded-br-md'
            : 'bg-brand-sand/60 text-foreground rounded-bl-md dark:bg-neutral-800',
          isInternal && 'border-2 border-dashed border-amber-400 bg-amber-50 text-amber-900',
        )}
      >
        {isInternal && (
          <p className="mb-1 text-[10px] font-bold uppercase tracking-wide text-amber-600">
            Internal note
          </p>
        )}

        {message.message_type === 'IMAGE' && message.attachments?.[0] && (
          <a href={resolveUrl(message.attachments[0].file_url)} target="_blank" rel="noreferrer">
            <img
              src={resolveUrl(message.attachments[0].file_url)}
              alt={message.attachments[0].file_name}
              className="mb-2 max-h-48 rounded-lg object-cover"
            />
          </a>
        )}

        {message.message_type === 'FILE' && message.attachments?.[0] && (
          <a
            href={resolveUrl(message.attachments[0].file_url)}
            target="_blank"
            rel="noreferrer"
            className="mb-2 block underline"
          >
            {message.attachments[0].file_name}
          </a>
        )}

        {message.message && <p className="whitespace-pre-wrap break-words">{message.message}</p>}

        <div className={cn('mt-1 flex items-center gap-1 text-[10px] opacity-70', isOwn && 'justify-end')}>
          <span>
            {new Date(message.created_at).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </span>
          {isOwn && showReadReceipt && (
            isRead ? <CheckCheck className="h-3 w-3" /> : <Check className="h-3 w-3" />
          )}
        </div>
      </div>
    </div>
  )
}
