import { useCallback, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { GripVertical, ImagePlus, Loader2, Pencil, Plus, Power, Trash2, X } from 'lucide-react'
import { toast } from 'sonner'
import { getApiOrigin } from '@/shared/config/api'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card'
import { Skeleton } from '@/shared/components/ui/skeleton'
import {
  useHeroBannersAdmin,
  useCreateHeroBanner,
  useUpdateHeroBanner,
  useDeleteHeroBanner,
  useToggleHeroBanner,
  useReorderHeroBanners,
} from '@/features/heroBanners'

const ACCEPTED = ['image/jpeg', 'image/png', 'image/webp']
const MAX_BYTES = 5 * 1024 * 1024 // 5 MB

function resolveUrl(url) {
  if (!url) return null
  if (url.startsWith('http://') || url.startsWith('https://')) return url
  const origin = getApiOrigin()
  return origin ? `${origin}${url}` : url
}

const emptyForm = { title: '', subtitle: '', is_active: true }

const bannerSchema = z.object({
  title: z.string().trim().min(1, 'Title is required').max(100, 'Max 100 characters'),
  subtitle: z.string().max(200, 'Subtitle is too long').optional(),
  is_active: z.preprocess((val) => val === 'true' || val === true, z.boolean()).default(true),
})

// ── Image Dropzone ──────────────────────────────────────────────────────────────
function ImageDropzone({ file, existingUrl, onFile, onClear }) {
  const inputRef = useRef(null)
  const [dragging, setDragging] = useState(false)

  const validate = (f) => {
    if (!ACCEPTED.includes(f.type)) {
      toast.error('Only JPEG, PNG, or WebP images are allowed.')
      return false
    }
    if (f.size > MAX_BYTES) {
      toast.error('Image must be smaller than 5 MB.')
      return false
    }
    return true
  }

  const pick = useCallback((f) => {
    if (validate(f)) onFile(f)
  }, [onFile])

  const onDrop = (e) => {
    e.preventDefault()
    setDragging(false)
    const f = e.dataTransfer.files[0]
    if (f) pick(f)
  }

  const onInputChange = (e) => {
    const f = e.target.files[0]
    if (f) pick(f)
    e.target.value = ''
  }

  const preview = file ? URL.createObjectURL(file) : resolveUrl(existingUrl)

  return (
    <div className="space-y-2">
      <Label>Banner Image *</Label>

      {preview ? (
        <div className="relative rounded-xl overflow-hidden border border-border h-44">
          <img src={preview} alt="Preview" className="w-full h-full object-cover" />
          <button
            type="button"
            onClick={onClear}
            className="absolute top-2 right-2 bg-black/60 hover:bg-black/80 text-white rounded-full p-1 transition-colors"
          >
            <X className="size-3.5" />
          </button>
          {file && (
            <span className="absolute bottom-2 left-2 bg-black/60 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full">
              New image selected
            </span>
          )}
        </div>
      ) : (
        <div
          onDragEnter={() => setDragging(true)}
          onDragLeave={() => setDragging(false)}
          onDragOver={(e) => e.preventDefault()}
          onDrop={onDrop}
          onClick={() => inputRef.current?.click()}
          className={`flex flex-col items-center justify-center gap-3 h-44 rounded-xl border-2 border-dashed cursor-pointer transition-colors select-none
            ${dragging ? 'border-brand-forest bg-[#492615]/5' : 'border-border hover:border-brand-forest/50 hover:bg-muted/40'}`}
        >
          <ImagePlus className="size-8 text-muted-foreground/50" />
          <div className="text-center">
            <p className="text-sm font-medium text-muted-foreground">
              Drag & drop an image here, or{' '}
              <span className="text-brand-forest font-semibold underline decoration-dotted">click to browse</span>
            </p>
            <p className="text-xs text-muted-foreground/60 mt-1">JPEG, PNG, WebP · max 5 MB</p>
          </div>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED.join(',')}
        className="hidden"
        onChange={onInputChange}
      />
    </div>
  )
}

// ── Main Page ───────────────────────────────────────────────────────────────────
export default function HeroBanners() {
  const { data, isLoading, isError, error } = useHeroBannersAdmin()
  const { mutateAsync: createBanner, isPending: isCreating } = useCreateHeroBanner()
  const { mutateAsync: updateBanner, isPending: isUpdating } = useUpdateHeroBanner()
  const { mutateAsync: deleteBanner, isPending: isDeleting } = useDeleteHeroBanner()
  const { mutateAsync: toggleBanner, isPending: isToggling } = useToggleHeroBanner()
  const { mutateAsync: reorderBanners } = useReorderHeroBanners()

  const [editingId, setEditingId] = useState(null)
  const [imageFile, setImageFile] = useState(null)       // new File selected by user
  const [existingImageUrl, setExistingImageUrl] = useState(null) // current saved URL when editing
  const [showForm, setShowForm] = useState(false)
  const [localBanners, setLocalBanners] = useState(null) // optimistic DnD state
  const dragIndexRef = useRef(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(bannerSchema),
    defaultValues: emptyForm,
  })

  const banners = localBanners ?? (data?.data ?? [])
  const isSaving = isCreating || isUpdating

  const openCreate = () => {
    setEditingId(null)
    reset(emptyForm)
    setImageFile(null)
    setExistingImageUrl(null)
    setShowForm(true)
  }

  const openEdit = (banner) => {
    setEditingId(banner.id)
    reset({ title: banner.title, subtitle: banner.subtitle ?? '', is_active: !!banner.is_active })
    setImageFile(null)
    setExistingImageUrl(banner.image_url)
    setShowForm(true)
  }

  const closeForm = () => {
    setShowForm(false)
    setEditingId(null)
    reset(emptyForm)
    setImageFile(null)
    setExistingImageUrl(null)
  }

  const onSubmit = async (data) => {
    // For new banners require a file; for edits allow keeping existing image
    if (!editingId && !imageFile) { toast.error('Please upload a banner image.'); return }

    try {
      const payload = {
        title: data.title.trim(),
        subtitle: data.subtitle?.trim() || '',
        is_active: data.is_active,
        ...(imageFile ? { file: imageFile } : {}),
      }

      if (editingId) {
        const res = await updateBanner({ id: editingId, ...payload })
        if (!res.success) { toast.error(res.message || 'Failed to update.'); return }
        toast.success('Banner updated.')
      } else {
        const res = await createBanner(payload)
        if (!res.success) { toast.error(res.message || 'Failed to create.'); return }
        toast.success('Banner created.')
      }
      setLocalBanners(null)
      closeForm()
    } catch (err) {
      toast.error(err.message || 'Failed to save banner.')
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this banner? The image file will also be removed.')) return
    try {
      await deleteBanner(id)
      setLocalBanners(null)
      toast.success('Banner deleted.')
      if (editingId === id) closeForm()
    } catch (err) {
      toast.error(err.message || 'Failed to delete banner.')
    }
  }

  const handleToggle = async (id) => {
    try {
      await toggleBanner(id)
      setLocalBanners(null)
      toast.success('Status updated.')
    } catch (err) {
      toast.error(err.message || 'Failed to toggle status.')
    }
  }

  // ── Drag & Drop reorder (HTML5 native) ────────────────────────────────────────
  const handleDragStart = (index) => { dragIndexRef.current = index }

  const handleDragOver = (e, index) => {
    e.preventDefault()
    const from = dragIndexRef.current
    if (from === null || from === index) return
    const reordered = [...banners]
    const [moved] = reordered.splice(from, 1)
    reordered.splice(index, 0, moved)
    dragIndexRef.current = index
    setLocalBanners(reordered)
  }

  const handleDrop = async () => {
    dragIndexRef.current = null
    if (!localBanners) return
    const items = localBanners.map((b, i) => ({ id: b.id, display_order: i + 1 }))
    try {
      await reorderBanners(items)
      toast.success('Order saved.')
    } catch {
      setLocalBanners(null)
      toast.error('Failed to save order.')
    }
  }

  const handleDragEnd = () => { dragIndexRef.current = null }

  const selectCls =
    'flex h-9 w-full rounded-lg border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-semibold tracking-tight text-brand-forest">
            Hero Banners
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Upload images for the homepage hero carousel. Drag rows to reorder.
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="size-4" />
          Add Banner
        </Button>
      </div>

      {/* ── Create / Edit Form ── */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{editingId ? 'Edit Banner' : 'New Banner'}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Image upload */}
            <ImageDropzone
              file={imageFile}
              existingUrl={existingImageUrl}
              onFile={setImageFile}
              onClear={() => { setImageFile(null); if (editingId) setExistingImageUrl(null) }}
            />

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Title & Subtitle */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Title *</Label>
                  <Input
                    {...register('title')}
                    placeholder="e.g. Own a home that tells a story"
                    className={errors.title ? 'border-destructive' : ''}
                  />
                  {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label>Subtitle</Label>
                  <Input
                    {...register('subtitle')}
                    placeholder="Optional supporting text shown below the title"
                    className={errors.subtitle ? 'border-destructive' : ''}
                  />
                  {errors.subtitle && <p className="text-xs text-destructive">{errors.subtitle.message}</p>}
                </div>
              </div>

              {/* Status */}
              <div className="space-y-2 max-w-xs">
                <Label>Status</Label>
                <select
                  {...register('is_active')}
                  className={selectCls}
                >
                  <option value="true">Active</option>
                  <option value="false">Inactive</option>
                </select>
              </div>

              <div className="flex gap-2">
                <Button type="submit" disabled={isSaving}>
                  {isSaving && <Loader2 className="size-4 animate-spin" />}
                  {isSaving ? 'Uploading…' : 'Save Banner'}
                </Button>
                <Button type="button" variant="outline" onClick={closeForm}>Cancel</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* ── Banner List ── */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">All Banners</CardTitle>
          <CardDescription>{banners.length} total · drag the grip handle to reorder</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </div>
          ) : isError ? (
            <p className="text-sm text-destructive">{error?.message || 'Failed to load banners.'}</p>
          ) : banners.length === 0 ? (
            <p className="text-sm text-muted-foreground">No banners yet. Click "Add Banner" to create the first one.</p>
          ) : (
            <div className="divide-y divide-border">
              {banners.map((banner, index) => (
                <div
                  key={banner.id}
                  draggable
                  onDragStart={() => handleDragStart(index)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDrop={handleDrop}
                  onDragEnd={handleDragEnd}
                  className="flex items-center gap-3 py-3 first:pt-0 last:pb-0 select-none group"
                >
                  {/* Drag handle */}
                  <span className="cursor-grab active:cursor-grabbing text-muted-foreground/40 hover:text-muted-foreground shrink-0 touch-none">
                    <GripVertical className="size-4" />
                  </span>

                  {/* Thumbnail */}
                  <img
                    src={resolveUrl(banner.image_url)}
                    alt={banner.title}
                    className="h-12 w-20 rounded-md object-cover border border-border shrink-0 bg-muted"
                    onError={(e) => { e.target.style.opacity = '0.3' }}
                  />

                  {/* Text */}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{banner.title}</p>
                    {banner.subtitle && (
                      <p className="truncate text-xs text-muted-foreground">{banner.subtitle}</p>
                    )}
                  </div>

                  {/* Order badge */}
                  <span className="shrink-0 text-[10px] font-bold text-muted-foreground/50 tabular-nums w-5 text-center">
                    {index + 1}
                  </span>

                  {/* Active badge */}
                  <span
                    className={`shrink-0 inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                      banner.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-neutral-100 text-neutral-500'
                    }`}
                  >
                    {banner.is_active ? 'Active' : 'Inactive'}
                  </span>

                  {/* Actions */}
                  <div className="flex shrink-0 gap-1">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      title={banner.is_active ? 'Deactivate' : 'Activate'}
                      onClick={() => handleToggle(banner.id)}
                      disabled={isToggling}
                    >
                      <Power className={`size-4 ${banner.is_active ? 'text-emerald-600' : 'text-muted-foreground'}`} />
                    </Button>
                    <Button variant="ghost" size="icon-sm" onClick={() => openEdit(banner)}>
                      <Pencil className="size-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => handleDelete(banner.id)}
                      disabled={isDeleting}
                    >
                      <Trash2 className="size-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
