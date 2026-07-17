import { useRef, useState } from 'react'
import { Loader2, Paperclip, Send } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'

export default function MessageInput({
  onSend,
  onAttach,
  disabled = false,
  isSending = false,
  placeholder = 'Type a message...',
}) {
  const [text, setText] = useState('')
  const fileRef = useRef(null)

  const handleSend = () => {
    const trimmed = text.trim()
    if (!trimmed || disabled || isSending) return
    onSend(trimmed)
    setText('')
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleFile = (e) => {
    const file = e.target.files?.[0]
    if (file && onAttach) onAttach(file)
    e.target.value = ''
  }

  return (
    <div className="flex items-end gap-2 border-t border-brand-sand bg-white p-3 dark:border-neutral-800 dark:bg-neutral-900">
      {onAttach && (
        <>
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,application/pdf"
            className="hidden"
            onChange={handleFile}
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            disabled={disabled || isSending}
            onClick={() => fileRef.current?.click()}
            aria-label="Attach file"
          >
            <Paperclip className="h-4 w-4" />
          </Button>
        </>
      )}
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled || isSending}
        rows={1}
        className="max-h-32 min-h-[40px] flex-1 resize-none rounded-xl border border-brand-sand bg-brand-sand/20 px-3 py-2 text-sm outline-none focus:border-brand-terracotta dark:border-neutral-700 dark:bg-neutral-800"
      />
      <Button
        type="button"
        size="icon"
        disabled={!text.trim() || disabled || isSending}
        onClick={handleSend}
        className="bg-brand-terracotta hover:bg-brand-terracotta/90"
        aria-label="Send message"
      >
        {isSending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Send className="h-4 w-4" />
        )}
      </Button>
    </div>
  )
}
