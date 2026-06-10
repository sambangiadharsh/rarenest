import { useEffect } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import {
  Bold, Italic, Strikethrough, List, ListOrdered,
  Heading1, Heading2, Heading3,
  Quote, Code, Minus, Undo, Redo,
} from 'lucide-react'
import { cn } from '@/shared/lib/utils'

// ─── Toolbar config ──────────────────────────────────────────────────────────

const TOOLBAR_GROUPS = [
  [
    {
      key: 'h1',
      label: 'Heading 1',
      icon: Heading1,
      action: (e) => e.chain().focus().toggleHeading({ level: 1 }).run(),
      isActive: (e) => e.isActive('heading', { level: 1 }),
    },
    {
      key: 'h2',
      label: 'Heading 2',
      icon: Heading2,
      action: (e) => e.chain().focus().toggleHeading({ level: 2 }).run(),
      isActive: (e) => e.isActive('heading', { level: 2 }),
    },
    {
      key: 'h3',
      label: 'Heading 3',
      icon: Heading3,
      action: (e) => e.chain().focus().toggleHeading({ level: 3 }).run(),
      isActive: (e) => e.isActive('heading', { level: 3 }),
    },
  ],
  [
    {
      key: 'bold',
      label: 'Bold (⌘B)',
      icon: Bold,
      action: (e) => e.chain().focus().toggleBold().run(),
      isActive: (e) => e.isActive('bold'),
    },
    {
      key: 'italic',
      label: 'Italic (⌘I)',
      icon: Italic,
      action: (e) => e.chain().focus().toggleItalic().run(),
      isActive: (e) => e.isActive('italic'),
    },
    {
      key: 'strike',
      label: 'Strikethrough',
      icon: Strikethrough,
      action: (e) => e.chain().focus().toggleStrike().run(),
      isActive: (e) => e.isActive('strike'),
    },
    {
      key: 'code',
      label: 'Inline code (⌘E)',
      icon: Code,
      action: (e) => e.chain().focus().toggleCode().run(),
      isActive: (e) => e.isActive('code'),
    },
  ],
  [
    {
      key: 'blockquote',
      label: 'Blockquote',
      icon: Quote,
      action: (e) => e.chain().focus().toggleBlockquote().run(),
      isActive: (e) => e.isActive('blockquote'),
    },
    {
      key: 'ul',
      label: 'Bullet list',
      icon: List,
      action: (e) => e.chain().focus().toggleBulletList().run(),
      isActive: (e) => e.isActive('bulletList'),
    },
    {
      key: 'ol',
      label: 'Numbered list',
      icon: ListOrdered,
      action: (e) => e.chain().focus().toggleOrderedList().run(),
      isActive: (e) => e.isActive('orderedList'),
    },
    {
      key: 'hr',
      label: 'Divider',
      icon: Minus,
      action: (e) => e.chain().focus().setHorizontalRule().run(),
      isActive: () => false,
    },
  ],
]

// ─── Sub-components ───────────────────────────────────────────────────────────

function ToolbarSeparator() {
  return <div className="mx-1.5 h-5 w-px shrink-0 bg-border" />
}

function ToolbarBtn({ btn, editor }) {
  const Icon = btn.icon
  const active = editor ? btn.isActive(editor) : false

  return (
    <button
      type="button"
      title={btn.label}
      onMouseDown={(e) => {
        e.preventDefault()
        btn.action(editor)
      }}
      className={cn(
        'flex size-7 items-center justify-center rounded-md text-sm transition-all duration-100',
        active
          ? 'bg-brand-forest text-white shadow-sm'
          : 'text-muted-foreground hover:bg-accent hover:text-foreground',
      )}
    >
      <Icon className="size-3.5" />
    </button>
  )
}

function UndoRedoBtn({ title, onAction, disabled, icon: Icon }) {
  return (
    <button
      type="button"
      title={title}
      onMouseDown={(e) => {
        e.preventDefault()
        onAction()
      }}
      disabled={disabled}
      className="flex size-7 items-center justify-center rounded-md text-muted-foreground transition-all duration-100 hover:bg-accent hover:text-foreground disabled:pointer-events-none disabled:opacity-30"
    >
      <Icon className="size-3.5" />
    </button>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function RichTextEditor({
  value = '',
  onChange,
  placeholder = 'Start writing…',
  className,
  minHeight = 300,
}) {
  const editor = useEditor({
    extensions: [StarterKit],
    content: value || '',
    onUpdate: ({ editor: ed }) => {
      onChange?.(ed.getHTML())
    },
    editorProps: {
      attributes: {
        class: 'rich-content focus:outline-none px-5 py-4',
        style: `min-height: ${minHeight}px`,
      },
    },
  })

  useEffect(() => {
    if (!editor) return
    const current = editor.getHTML()
    if (value !== current && value !== undefined) {
      editor.commands.setContent(value || '', false)
    }
  }, [value, editor])

  const isEmpty = !editor || editor.isEmpty
  const text = editor ? editor.getText() : ''
  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0
  const charCount = text.length

  if (!editor) {
    return (
      <div
        className={cn('rounded-xl border border-border bg-muted/10 animate-pulse', className)}
        style={{ minHeight: minHeight + 96 }}
      />
    )
  }

  return (
    <div
      className={cn(
        'overflow-hidden rounded-xl border border-border bg-white shadow-xs',
        'transition-all duration-200 focus-within:border-brand-forest/50 focus-within:shadow-sm',
        className,
      )}
    >
      {/* ── Toolbar ── */}
      <div className="flex flex-wrap items-center gap-0.5 border-b border-border bg-muted/40 px-2.5 py-1.5">
        {TOOLBAR_GROUPS.map((group, gi) => (
          <div key={gi} className="flex items-center gap-0.5">
            {gi > 0 && <ToolbarSeparator />}
            {group.map((btn) => (
              <ToolbarBtn key={btn.key} btn={btn} editor={editor} />
            ))}
          </div>
        ))}

        {/* Undo / Redo pushed to the right */}
        <div className="ml-auto flex items-center gap-0.5">
          <ToolbarSeparator />
          <UndoRedoBtn
            title="Undo (⌘Z)"
            icon={Undo}
            disabled={!editor.can().undo()}
            onAction={() => editor.chain().focus().undo().run()}
          />
          <UndoRedoBtn
            title="Redo (⌘⇧Z)"
            icon={Redo}
            disabled={!editor.can().redo()}
            onAction={() => editor.chain().focus().redo().run()}
          />
        </div>
      </div>

      {/* ── Content area ── */}
      <div className="relative">
        {isEmpty && (
          <p className="pointer-events-none absolute left-5 top-4 select-none text-sm text-muted-foreground/50">
            {placeholder}
          </p>
        )}
        <EditorContent editor={editor} />
      </div>

      {/* ── Footer: word count ── */}
      <div className="flex items-center justify-between border-t border-border bg-muted/20 px-4 py-1.5">
        <div className="flex gap-2 text-[11px] text-muted-foreground/50">
          <span>Use the toolbar above or keyboard shortcuts to format content.</span>
        </div>
        <div className="flex gap-3 text-[11px] tabular-nums text-muted-foreground/60">
          <span>{wordCount} {wordCount === 1 ? 'word' : 'words'}</span>
          <span>·</span>
          <span>{charCount} chars</span>
        </div>
      </div>
    </div>
  )
}
