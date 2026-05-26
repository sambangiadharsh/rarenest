import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import {
  Loader2,
  ImagePlus,
  Video,
  Star,
  MapPin,
  Sparkles,
  ArrowLeft,
} from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { usePropertyTypes } from '@/features/properties'
import { useCreateProperty, useUploadPropertyMedia } from '@/features/properties'
import {
  SPECIAL_FEATURES,
  MAX_IMAGES,
  MAX_VIDEOS,
  MAX_IMAGE_BYTES,
  MAX_VIDEO_BYTES,
} from '@/features/properties/constants/specialFeatures'

const listingSchema = z.object({
  title: z.string().min(2).max(255),
  property_type_id: z.string().uuid('Select a property type'),
  asking_price: z.preprocess((v) => Number(v), z.number().positive()),
  size_sqft: z.preprocess((v) => Number(v), z.number().positive()),
  location_city: z.string().min(2).max(100),
  location_state: z.string().min(2).max(100),
  location_district: z.string().min(2).max(100),
  contact_email: z.string().email(),
  contact_phone: z.string().min(8).max(20),
  property_story: z.string().min(10),
  special_features: z.array(z.string()).optional(),
})

export default function CreateListing() {
  const navigate = useNavigate()
  const { isAuthenticated } = useSelector((state) => state.auth)
  const { data: typesRes, isLoading: typesLoading } = usePropertyTypes()
  const propertyTypes = typesRes?.data || []

  const [images, setImages] = React.useState([])
  const [videos, setVideos] = React.useState([])
  const [thumbnailIndex, setThumbnailIndex] = React.useState(0)
  const [pendingPropertyId, setPendingPropertyId] = React.useState(null)

  const { mutateAsync: createProperty, isPending: isCreating } = useCreateProperty()
  const { mutateAsync: uploadMedia, isPending: isUploading } = useUploadPropertyMedia()

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(listingSchema),
    defaultValues: { special_features: [] },
  })

  React.useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { replace: true })
    }
  }, [isAuthenticated, navigate])

  const validateAndSetImages = (fileList) => {
    const files = Array.from(fileList)
    if (files.length > MAX_IMAGES) {
      toast.error(`Maximum ${MAX_IMAGES} images allowed`)
      return
    }
    for (const f of files) {
      if (f.size > MAX_IMAGE_BYTES) {
        toast.error(`"${f.name}" exceeds 5MB`)
        return
      }
      if (!f.type.startsWith('image/')) {
        toast.error(`"${f.name}" is not an image`)
        return
      }
    }
    const previews = files.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }))
    setImages(previews)
    setThumbnailIndex(0)
  }

  const validateAndSetVideos = (fileList) => {
    const files = Array.from(fileList)
    if (files.length > MAX_VIDEOS) {
      toast.error(`Maximum ${MAX_VIDEOS} videos allowed`)
      return
    }
    for (const f of files) {
      if (f.size > MAX_VIDEO_BYTES) {
        toast.error(`"${f.name}" exceeds 50MB`)
        return
      }
      if (!f.type.startsWith('video/')) {
        toast.error(`"${f.name}" is not a video`)
        return
      }
    }
    setVideos(files.map((file) => ({ file, name: file.name })))
  }

  const uploadFilesForProperty = async (propertyId) => {
    if (images.length === 0 && videos.length === 0) return true

    const formData = new FormData()
    images.forEach(({ file }) => formData.append('images', file))
    videos.forEach(({ file }) => formData.append('videos', file))
    formData.append('thumbnail_index', String(thumbnailIndex))

    await uploadMedia({ propertyId, formData })
    return true
  }

  const onSubmit = async (data) => {
    try {
      let propertyId = pendingPropertyId

      if (!propertyId) {
        const res = await createProperty({
          ...data,
          special_features: data.special_features?.length ? data.special_features : undefined,
        })
        if (!res.success) {
          toast.error(res.message || 'Failed to create listing')
          return
        }
        propertyId = res.data.id
      }

      try {
        await uploadFilesForProperty(propertyId)
        toast.success('Listing created successfully! Pending admin verification.')
        navigate('/dashboard')
      } catch (uploadErr) {
        setPendingPropertyId(propertyId)
        toast.error(
          uploadErr.message || 'Listing saved but media upload failed. Click Submit to retry upload.',
        )
      }
    } catch (err) {
      toast.error(err.message || 'Failed to create listing')
    }
  }

  const isSubmitting = isCreating || isUploading

  return (
    <div className="max-w-3xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 pb-20 flex flex-col gap-8">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="rounded-full">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <div className="inline-flex items-center gap-1 text-[10px] font-bold text-primary tracking-wider uppercase bg-primary/10 px-2.5 py-0.5 rounded-full w-fit mb-1">
            <Sparkles className="h-3 w-3" /> New listing
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight">List your property</h1>
          <p className="text-sm text-muted-foreground">
            Add details, special features, and up to {MAX_IMAGES} images / {MAX_VIDEOS} videos.
          </p>
        </div>
      </div>

      {pendingPropertyId && (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-800">
          Listing saved. Submit again to retry uploading photos and videos.
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
        <section className="rounded-2xl border border-border/40 bg-card p-6 flex flex-col gap-4">
          <h2 className="font-bold text-lg">Basic details</h2>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold">Property title</label>
            <input
              type="text"
              {...register('title')}
              disabled={!!pendingPropertyId}
              className="h-10 rounded-lg bg-muted/30 px-3 text-sm border border-border"
              placeholder="Himalayan Earthship Retreat"
            />
            {errors.title && <span className="text-[10px] text-destructive">{errors.title.message}</span>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold">Property type</label>
              <select
                {...register('property_type_id')}
                disabled={typesLoading || !!pendingPropertyId}
                className="h-10 rounded-lg bg-muted/30 px-3 text-sm border border-border"
              >
                <option value="">Select type</option>
                {propertyTypes.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
              {errors.property_type_id && (
                <span className="text-[10px] text-destructive">{errors.property_type_id.message}</span>
              )}
              {!typesLoading && propertyTypes.length === 0 && (
                <span className="text-[10px] text-muted-foreground">No types in catalog. Ask admin to add property types.</span>
              )}
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold">Asking price (INR)</label>
              <input
                type="number"
                {...register('asking_price')}
                disabled={!!pendingPropertyId}
                className="h-10 rounded-lg bg-muted/30 px-3 text-sm border border-border"
              />
              {errors.asking_price && (
                <span className="text-[10px] text-destructive">{errors.asking_price.message}</span>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold">Size (sq ft)</label>
            <input
              type="number"
              {...register('size_sqft')}
              disabled={!!pendingPropertyId}
              className="h-10 rounded-lg bg-muted/30 px-3 text-sm border border-border max-w-xs"
            />
            {errors.size_sqft && (
              <span className="text-[10px] text-destructive">{errors.size_sqft.message}</span>
            )}
          </div>
        </section>

        <section className="rounded-2xl border border-border/40 bg-card p-6 flex flex-col gap-4">
          <h2 className="font-bold text-lg flex items-center gap-2">
            <MapPin className="h-4 w-4 text-primary" /> Location
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold">City</label>
              <input type="text" {...register('location_city')} disabled={!!pendingPropertyId} className="h-10 rounded-lg bg-muted/30 px-3 text-sm border border-border" />
              {errors.location_city && <span className="text-[10px] text-destructive">{errors.location_city.message}</span>}
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold">State</label>
              <input type="text" {...register('location_state')} disabled={!!pendingPropertyId} className="h-10 rounded-lg bg-muted/30 px-3 text-sm border border-border" />
              {errors.location_state && <span className="text-[10px] text-destructive">{errors.location_state.message}</span>}
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold">District</label>
              <input type="text" {...register('location_district')} disabled={!!pendingPropertyId} className="h-10 rounded-lg bg-muted/30 px-3 text-sm border border-border" />
              {errors.location_district && <span className="text-[10px] text-destructive">{errors.location_district.message}</span>}
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-border/40 bg-card p-6 flex flex-col gap-4">
          <h2 className="font-bold text-lg">Contact & story</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold">Email</label>
              <input type="email" {...register('contact_email')} disabled={!!pendingPropertyId} className="h-10 rounded-lg bg-muted/30 px-3 text-sm border border-border" />
              {errors.contact_email && <span className="text-[10px] text-destructive">{errors.contact_email.message}</span>}
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold">Phone</label>
              <input type="tel" {...register('contact_phone')} disabled={!!pendingPropertyId} className="h-10 rounded-lg bg-muted/30 px-3 text-sm border border-border" />
              {errors.contact_phone && <span className="text-[10px] text-destructive">{errors.contact_phone.message}</span>}
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold">Property story</label>
            <textarea
              {...register('property_story')}
              disabled={!!pendingPropertyId}
              rows={4}
              className="rounded-lg bg-muted/30 px-3 py-2 text-sm border border-border resize-y"
              placeholder="Describe what makes this property unique..."
            />
            {errors.property_story && <span className="text-[10px] text-destructive">{errors.property_story.message}</span>}
          </div>
        </section>

        <section className="rounded-2xl border border-border/40 bg-card p-6 flex flex-col gap-4">
          <h2 className="font-bold text-lg">Special features</h2>
          <Controller
            name="special_features"
            control={control}
            render={({ field }) => (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {SPECIAL_FEATURES.map((feature) => {
                  const checked = (field.value || []).includes(feature)
                  return (
                    <label
                      key={feature}
                      className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm cursor-pointer transition-colors ${
                        checked ? 'border-primary bg-primary/5' : 'border-border hover:bg-muted/30'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        disabled={!!pendingPropertyId}
                        onChange={(e) => {
                          const next = e.target.checked
                            ? [...(field.value || []), feature]
                            : (field.value || []).filter((f) => f !== feature)
                          field.onChange(next)
                        }}
                        className="rounded border-border"
                      />
                      {feature}
                    </label>
                  )
                })}
              </div>
            )}
          />
        </section>

        <section className="rounded-2xl border border-border/40 bg-card p-6 flex flex-col gap-4">
          <h2 className="font-bold text-lg">Photos & videos</h2>
          <p className="text-xs text-muted-foreground">
            Up to {MAX_IMAGES} images (5MB each), {MAX_VIDEOS} videos (50MB each). Click an image to set as thumbnail.
          </p>

          <div className="flex flex-wrap gap-3">
            <label className="inline-flex items-center gap-2 cursor-pointer rounded-xl border border-dashed border-border px-4 py-3 text-sm hover:bg-muted/30">
              <ImagePlus className="h-4 w-4 text-primary" />
              Add images
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                className="hidden"
                onChange={(e) => {
                  validateAndSetImages(e.target.files)
                  e.target.value = ''
                }}
              />
            </label>
            <label className="inline-flex items-center gap-2 cursor-pointer rounded-xl border border-dashed border-border px-4 py-3 text-sm hover:bg-muted/30">
              <Video className="h-4 w-4 text-primary" />
              Add videos
              <input
                type="file"
                accept="video/mp4,video/webm,video/quicktime"
                multiple
                className="hidden"
                onChange={(e) => {
                  validateAndSetVideos(e.target.files)
                  e.target.value = ''
                }}
              />
            </label>
          </div>

          {images.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {images.map((img, idx) => (
                <button
                  key={img.preview}
                  type="button"
                  onClick={() => setThumbnailIndex(idx)}
                  className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all ${
                    thumbnailIndex === idx ? 'border-primary ring-2 ring-primary/30' : 'border-transparent'
                  }`}
                >
                  <img src={img.preview} alt="" className="h-full w-full object-cover" />
                  {thumbnailIndex === idx && (
                    <span className="absolute top-1 right-1 bg-primary text-primary-foreground rounded-full p-1">
                      <Star className="h-3 w-3 fill-current" />
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}

          {videos.length > 0 && (
            <ul className="text-sm text-muted-foreground space-y-1">
              {videos.map((v) => (
                <li key={v.name} className="flex items-center gap-2">
                  <Video className="h-3.5 w-3.5" /> {v.name}
                </li>
              ))}
            </ul>
          )}
        </section>

        <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto gap-2">
          {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
          {pendingPropertyId ? 'Retry media upload' : 'Publish listing'}
        </Button>
      </form>
    </div>
  )
}
