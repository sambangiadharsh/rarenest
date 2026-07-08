import { useEffect, useState } from 'react'
import { Loader2, Save, Globe, FileText, Eye, EyeOff, Info } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'
import { Skeleton } from '@/shared/components/ui/skeleton'
import RichTextEditor from '@/shared/components/editors/RichTextEditor'
import { useCmsPageAdmin, useUpdateCmsPage } from '@/features/cms'

const STATUS_OPTIONS = [
  { value: 'Published', label: 'Published', icon: Eye, color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-200' },
  { value: 'Draft', label: 'Draft', icon: EyeOff, color: 'text-amber-600', bg: 'bg-amber-50 border-amber-200' },
]

function SectionCard({ title, icon: Icon, children, className }) {
  return (
    <div className={`overflow-hidden rounded-xl border border-brand-sand/80 bg-white shadow-[0_8px_24px_rgba(42,42,42,0.06)] ${className ?? ''}`}>
      <div className="flex items-center gap-2 border-b border-brand-sand bg-brand-warm-white px-4 py-3">
        {Icon && <Icon className="size-3.5 text-brand-forest" />}
        <h3 className="text-xs font-semibold uppercase tracking-wider text-brand-forest">{title}</h3>
      </div>
      <div className="p-4">{children}</div>
    </div>
  )
}

export default function CmsPageEditor({ pageKey, pageTitle, pageDescription }) {
  const { data, isLoading, isError, error } = useCmsPageAdmin(pageKey)
  const { mutateAsync: updatePage, isPending } = useUpdateCmsPage(pageKey)

  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [metaTitle, setMetaTitle] = useState('')
  const [metaDescription, setMetaDescription] = useState('')
  const [status, setStatus] = useState('Published')

  useEffect(() => {
    const page = data?.data
    if (page) {
      setTitle(page.title || '')
      setContent(page.content || '')
      setMetaTitle(page.meta_title || '')
      setMetaDescription(page.meta_description || '')
      setStatus(page.status || 'Published')
    }
  }, [data])

  const handleSave = async () => {
    if (!title.trim()) {
      toast.error('Title is required.')
      return
    }
    if (!content.trim() || content === '<p></p>') {
      toast.error('Content is required.')
      return
    }
    try {
      const res = await updatePage({
        title: title.trim(),
        content,
        meta_title: metaTitle.trim() || null,
        meta_description: metaDescription.trim() || null,
        status,
      })
      if (!res.success) {
        toast.error(res.message || 'Failed to save page.')
        return
      }
      toast.success('Page saved successfully.')
    } catch (err) {
      toast.error(err.message || 'Failed to save page.')
    }
  }

  const currentStatus = STATUS_OPTIONS.find((s) => s.value === status) ?? STATUS_OPTIONS[0]
  const StatusIcon = currentStatus.icon

  // ── Loading skeleton ─────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader pageTitle={pageTitle} pageDescription={pageDescription} />
        <div className="grid gap-5 lg:grid-cols-[1fr_300px]">
          <div className="space-y-4">
            <Skeleton className="h-10 w-full rounded-xl" />
            <Skeleton className="h-[420px] w-full rounded-xl" />
          </div>
          <div className="space-y-4">
            <Skeleton className="h-40 w-full rounded-xl" />
            <Skeleton className="h-48 w-full rounded-xl" />
          </div>
        </div>
      </div>
    )
  }

  // ── Error state ───────────────────────────────────────────────────────────────
  if (isError) {
    return (
      <div className="space-y-6">
        <PageHeader pageTitle={pageTitle} pageDescription={pageDescription} />
        <div className="rounded-xl border border-destructive/20 bg-destructive/5 px-5 py-4">
          <p className="text-sm text-destructive">{error?.message || 'Failed to load page.'}</p>
        </div>
      </div>
    )
  }

  // ── Main editor layout ────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      <PageHeader pageTitle={pageTitle} pageDescription={pageDescription} />

      <div className="flex flex-col lg:flex-row gap-5 items-stretch">

        {/* ── Left: main editing area ── */}
        <div className="flex-1 relative min-h-[500px] lg:min-h-0">
          <div className="lg:absolute lg:inset-0 flex flex-col gap-4">
            {/* Title */}
            <div className="shrink-0 overflow-hidden rounded-xl border border-brand-sand/80 bg-white shadow-[0_8px_24px_rgba(42,42,42,0.06)]">
              <div className="border-b border-brand-sand bg-brand-warm-white px-4 py-2.5">
                <span className="text-xs font-semibold uppercase tracking-wider text-brand-forest">Page Title</span>
              </div>
              <div className="p-4">
                <input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Page title"
                  className="w-full bg-transparent font-heading text-2xl font-semibold tracking-normal text-foreground placeholder:font-sans placeholder:text-base placeholder:font-normal placeholder:text-muted-foreground/50 focus:outline-none"
                />
              </div>
            </div>

            {/* Body */}
            <div className="flex flex-col flex-1 min-h-0">
              <div className="mb-2 shrink-0 flex items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-brand-forest">Body Content</span>
              </div>
              <RichTextEditor
                value={content}
                onChange={setContent}
                placeholder="Start writing your content here..."
                minHeight={0}
                className="flex-1 min-h-0"
              />
            </div>
          </div>
        </div>

        {/* ── Right: sidebar ── */}
        <div className="w-full lg:w-[320px] shrink-0 space-y-4">

          {/* Publish card */}
          <SectionCard title="Publish" icon={Globe}>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Visibility</Label>
                <div className="flex gap-2">
                  {STATUS_OPTIONS.map((opt) => {
                    const Icon = opt.icon
                    const selected = status === opt.value
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setStatus(opt.value)}
                        className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-medium transition-all ${
                          selected
                            ? `${opt.bg} ${opt.color} border-current shadow-sm`
                            : 'border-brand-sand text-muted-foreground hover:bg-brand-cream'
                        }`}
                      >
                        <Icon className="size-3.5" />
                        {opt.label}
                      </button>
                    )
                  })}
                </div>
                <p className="text-[11px] text-muted-foreground/60 mt-1">
                  {status === 'Published'
                    ? 'Visible to all visitors on the public site.'
                    : 'Hidden from the public site until published.'}
                </p>
              </div>

              <Button
                onClick={handleSave}
                disabled={isPending}
                className="w-full gap-2 bg-brand-forest text-white hover:bg-brand-forest-mid"
              >
                {isPending ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Saving…
                  </>
                ) : (
                  <>
                    <Save className="size-4" />
                    Save changes
                  </>
                )}
              </Button>
            </div>
          </SectionCard>

          {/* SEO card */}
          <SectionCard title="SEO & Meta" icon={FileText}>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="meta_title" className="text-xs">
                  Meta title
                </Label>
                <Input
                  id="meta_title"
                  value={metaTitle}
                  onChange={(e) => setMetaTitle(e.target.value)}
                  placeholder="Leave blank to use page title"
                  className="h-9 rounded-lg border-brand-sand bg-brand-warm-white text-xs"
                />
                <p className="text-[11px] text-muted-foreground/60">
                  {metaTitle.length}/60 characters
                </p>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="meta_description" className="text-xs">
                  Meta description
                </Label>
                <textarea
                  id="meta_description"
                  value={metaDescription}
                  onChange={(e) => setMetaDescription(e.target.value)}
                  rows={4}
                  className="flex w-full resize-none rounded-lg border border-brand-sand bg-brand-warm-white px-3 py-2 text-xs shadow-xs transition-colors placeholder:text-muted-foreground/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  placeholder="Brief description shown in search results..."
                />
                <p className="text-[11px] text-muted-foreground/60">
                  {metaDescription.length}/160 characters
                </p>
              </div>
            </div>
          </SectionCard>

          {/* Tips card */}
          <div className="rounded-xl border border-brand-sand bg-brand-warm-white p-4 shadow-[0_8px_24px_rgba(42,42,42,0.05)]">
            <div className="flex items-start gap-2.5">
              <Info className="mt-0.5 size-4 shrink-0 text-brand-terracotta" />
              <div className="space-y-1.5">
                <p className="text-xs font-semibold text-brand-forest">Editor tips</p>
                <ul className="space-y-1 text-[11px] text-muted-foreground">
                  <li>⌘B / ⌘I — Bold / Italic</li>
                  <li>⌘E — Inline code</li>
                  <li>⌘Z / ⌘⇧Z — Undo / Redo</li>
                  <li>Tab — Indent list items</li>
                </ul>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}

function PageHeader({ pageTitle, pageDescription }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <h1 className="font-heading text-2xl font-semibold tracking-tight text-brand-forest">
          {pageTitle}
        </h1>
        {pageDescription && (
          <p className="mt-1 text-sm text-muted-foreground">{pageDescription}</p>
        )}
      </div>
    </div>
  )
}
