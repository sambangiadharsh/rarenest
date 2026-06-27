import { useEffect, useState, useRef } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import Highlight from '@tiptap/extension-highlight'
import Link from '@tiptap/extension-link'
import Superscript from '@tiptap/extension-superscript'
import Subscript from '@tiptap/extension-subscript'
import TextAlign from '@tiptap/extension-text-align'
import TaskList from '@tiptap/extension-task-list'
import TaskItem from '@tiptap/extension-task-item'
import Image from '@tiptap/extension-image'

import {
  Bold, Italic, Strikethrough, List, ListOrdered,
  Quote, Code, Braces, Minus, Undo, Redo,
  Underline as UnderlineIcon, Highlighter, Link2,
  Superscript as SuperscriptIcon, Subscript as SubscriptIcon,
  AlignLeft, AlignCenter, AlignRight, AlignJustify,
  ImagePlus, ChevronDown, ListTodo
} from 'lucide-react'
import { cn } from '@/shared/lib/utils'

// ─── Sub-components ───────────────────────────────────────────────────────────

function ToolbarSeparator() {
  return <div className="mx-1 h-5 w-px shrink-0 bg-border" />
}

function HeadingDropdown({ editor }) {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef(null)

  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const currentLabel = editor.isActive('heading', { level: 1 })
    ? 'H1'
    : editor.isActive('heading', { level: 2 })
    ? 'H2'
    : editor.isActive('heading', { level: 3 })
    ? 'H3'
    : 'H'

  const options = [
    { label: 'Paragraph', action: () => editor.chain().focus().setParagraph().run(), active: () => editor.isActive('paragraph') },
    { label: 'Heading 1', action: () => editor.chain().focus().toggleHeading({ level: 1 }).run(), active: () => editor.isActive('heading', { level: 1 }) },
    { label: 'Heading 2', action: () => editor.chain().focus().toggleHeading({ level: 2 }).run(), active: () => editor.isActive('heading', { level: 2 }) },
    { label: 'Heading 3', action: () => editor.chain().focus().toggleHeading({ level: 3 }).run(), active: () => editor.isActive('heading', { level: 3 }) },
  ]

  return (
    <div className="relative flex items-center" ref={containerRef}>
      <button
        type="button"
        title="Headings"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'flex h-7 items-center gap-0.5 rounded-md px-1.5 text-sm transition-all duration-100',
          editor.isActive('heading')
            ? 'bg-brand-forest text-white shadow-sm'
            : 'text-muted-foreground hover:bg-accent hover:text-foreground',
        )}
      >
        <span className="font-semibold text-[13px]">H</span>
        <ChevronDown className="size-3 opacity-60" />
      </button>
      {isOpen && (
        <div className="absolute left-0 top-full z-50 mt-1 min-w-[120px] rounded-md border border-border bg-white p-1 shadow-md">
          {options.map((opt) => (
            <button
              key={opt.label}
              type="button"
              onClick={() => {
                opt.action()
                setIsOpen(false)
              }}
              className={cn(
                'flex w-full items-center rounded-sm px-2 py-1.5 text-xs transition-colors hover:bg-accent hover:text-foreground',
                opt.active() ? 'bg-accent font-semibold text-brand-forest' : 'text-muted-foreground'
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function ListDropdown({ editor }) {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef(null)

  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const isListActive = editor.isActive('bulletList') || editor.isActive('orderedList') || editor.isActive('taskList')

  const options = [
    {
      label: 'Bullet list',
      icon: List,
      action: () => editor.chain().focus().toggleBulletList().run(),
      active: () => editor.isActive('bulletList'),
    },
    {
      label: 'Ordered list',
      icon: ListOrdered,
      action: () => editor.chain().focus().toggleOrderedList().run(),
      active: () => editor.isActive('orderedList'),
    },
    {
      label: 'Task list',
      icon: ListTodo,
      action: () => editor.chain().focus().toggleTaskList().run(),
      active: () => editor.isActive('taskList'),
    },
  ]

  return (
    <div className="relative flex items-center" ref={containerRef}>
      <button
        type="button"
        title="Lists"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'flex h-7 items-center gap-0.5 rounded-md px-1.5 text-sm transition-all duration-100',
          isListActive
            ? 'bg-brand-forest text-white shadow-sm'
            : 'text-muted-foreground hover:bg-accent hover:text-foreground',
        )}
      >
        <List className="size-3.5" />
        <ChevronDown className="size-3 opacity-60" />
      </button>
      {isOpen && (
        <div className="absolute left-0 top-full z-50 mt-1 min-w-[120px] rounded-md border border-border bg-white p-1 shadow-md">
          {options.map((opt) => {
            const Icon = opt.icon
            return (
              <button
                key={opt.label}
                type="button"
                onClick={() => {
                  opt.action()
                  setIsOpen(false)
                }}
                className={cn(
                  'flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-xs transition-colors hover:bg-accent hover:text-foreground',
                  opt.active() ? 'bg-accent font-semibold text-brand-forest' : 'text-muted-foreground'
                )}
              >
                <Icon className="size-3.5" />
                <span>{opt.label}</span>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
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
    extensions: [
      StarterKit,
      Underline,
      Highlight.configure({ multicolor: true }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-brand-forest underline cursor-pointer pointer-events-none',
        },
      }),
      Superscript,
      Subscript,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      TaskList,
      TaskItem.configure({
        nested: true,
      }),
      Image.configure({
        inline: true,
        HTMLAttributes: {
          class: 'max-w-full h-auto rounded-lg my-4 mx-auto block',
        },
      }),
    ],
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

  // Action helper for link toggle
  const toggleLink = () => {
    if (editor.isActive('link')) {
      editor.chain().focus().unsetLink().run()
      return
    }
    const url = window.prompt('Enter link URL:')
    if (url) {
      editor.chain().focus().setLink({ href: url }).run()
    }
  }

  // Action helper for image add
  const addImage = () => {
    const url = window.prompt('Enter image URL:')
    if (url) {
      editor.chain().focus().setImage({ src: url }).run()
    }
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
        {/* Undo / Redo */}
        <div className="flex items-center gap-0.5">
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

        <ToolbarSeparator />

        {/* Dropdowns, Quotes, CodeBlock */}
        <div className="flex items-center gap-0.5">
          <HeadingDropdown editor={editor} />
          <ListDropdown editor={editor} />
          
          <ToolbarBtn
            btn={{
              key: 'blockquote',
              label: 'Blockquote',
              icon: Quote,
              action: (e) => e.chain().focus().toggleBlockquote().run(),
              isActive: (e) => e.isActive('blockquote'),
            }}
            editor={editor}
          />
          <ToolbarBtn
            btn={{
              key: 'codeBlock',
              label: 'Code block',
              icon: Braces,
              action: (e) => e.chain().focus().toggleCodeBlock().run(),
              isActive: (e) => e.isActive('codeBlock'),
            }}
            editor={editor}
          />
        </div>

        <ToolbarSeparator />

        {/* Basic Text Formats */}
        <div className="flex items-center gap-0.5">
          <ToolbarBtn
            btn={{
              key: 'bold',
              label: 'Bold (⌘B)',
              icon: Bold,
              action: (e) => e.chain().focus().toggleBold().run(),
              isActive: (e) => e.isActive('bold'),
            }}
            editor={editor}
          />
          <ToolbarBtn
            btn={{
              key: 'italic',
              label: 'Italic (⌘I)',
              icon: Italic,
              action: (e) => e.chain().focus().toggleItalic().run(),
              isActive: (e) => e.isActive('italic'),
            }}
            editor={editor}
          />
          <ToolbarBtn
            btn={{
              key: 'strike',
              label: 'Strikethrough',
              icon: Strikethrough,
              action: (e) => e.chain().focus().toggleStrike().run(),
              isActive: (e) => e.isActive('strike'),
            }}
            editor={editor}
          />
          <ToolbarBtn
            btn={{
              key: 'code',
              label: 'Inline code (⌘E)',
              icon: Code,
              action: (e) => e.chain().focus().toggleCode().run(),
              isActive: (e) => e.isActive('code'),
            }}
            editor={editor}
          />
          <ToolbarBtn
            btn={{
              key: 'underline',
              label: 'Underline',
              icon: UnderlineIcon,
              action: (e) => e.chain().focus().toggleUnderline().run(),
              isActive: (e) => e.isActive('underline'),
            }}
            editor={editor}
          />
          <ToolbarBtn
            btn={{
              key: 'highlight',
              label: 'Highlight',
              icon: Highlighter,
              action: (e) => e.chain().focus().toggleHighlight().run(),
              isActive: (e) => e.isActive('highlight'),
            }}
            editor={editor}
          />
          <ToolbarBtn
            btn={{
              key: 'link',
              label: 'Link',
              icon: Link2,
              action: () => toggleLink(),
              isActive: (e) => e.isActive('link'),
            }}
            editor={editor}
          />
        </div>

        <ToolbarSeparator />

        {/* Superscript / Subscript */}
        <div className="flex items-center gap-0.5">
          <ToolbarBtn
            btn={{
              key: 'superscript',
              label: 'Superscript',
              icon: SuperscriptIcon,
              action: (e) => e.chain().focus().toggleSuperscript().run(),
              isActive: (e) => e.isActive('superscript'),
            }}
            editor={editor}
          />
          <ToolbarBtn
            btn={{
              key: 'subscript',
              label: 'Subscript',
              icon: SubscriptIcon,
              action: (e) => e.chain().focus().toggleSubscript().run(),
              isActive: (e) => e.isActive('subscript'),
            }}
            editor={editor}
          />
        </div>

        <ToolbarSeparator />

        {/* Text Alignments */}
        <div className="flex items-center gap-0.5">
          <ToolbarBtn
            btn={{
              key: 'align-left',
              label: 'Align Left',
              icon: AlignLeft,
              action: (e) => e.chain().focus().setTextAlign('left').run(),
              isActive: (e) => e.isActive({ textAlign: 'left' }),
            }}
            editor={editor}
          />
          <ToolbarBtn
            btn={{
              key: 'align-center',
              label: 'Align Center',
              icon: AlignCenter,
              action: (e) => e.chain().focus().setTextAlign('center').run(),
              isActive: (e) => e.isActive({ textAlign: 'center' }),
            }}
            editor={editor}
          />
          <ToolbarBtn
            btn={{
              key: 'align-right',
              label: 'Align Right',
              icon: AlignRight,
              action: (e) => e.chain().focus().setTextAlign('right').run(),
              isActive: (e) => e.isActive({ textAlign: 'right' }),
            }}
            editor={editor}
          />
          <ToolbarBtn
            btn={{
              key: 'align-justify',
              label: 'Align Justify',
              icon: AlignJustify,
              action: (e) => e.chain().focus().setTextAlign('justify').run(),
              isActive: (e) => e.isActive({ textAlign: 'justify' }),
            }}
            editor={editor}
          />
        </div>

        <ToolbarSeparator />

        {/* Add Image */}
        <button
          type="button"
          title="Add Image"
          onClick={addImage}
          className="flex h-7 items-center gap-1.5 rounded-md px-2 text-xs font-medium text-muted-foreground transition-all duration-100 hover:bg-accent hover:text-foreground"
        >
          <ImagePlus className="size-3.5" />
          <span>Add</span>
        </button>
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
