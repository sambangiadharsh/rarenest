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
  X,
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

const STEP_CONFIG = [
  {
    number: 1,
    title: 'Basic details & location',
    description: 'Start with your property basics and location.',
    fields: [
      'title',
      'property_type_id',
      'asking_price',
      'size_sqft',
      'location_city',
      'location_state',
      'location_district',
    ],
  },
  {
    number: 2,
    title: 'Contact, story & features',
    description: 'Tell buyers how to reach you and what makes this place unique.',
    fields: ['contact_email', 'contact_phone', 'property_story', 'special_features'],
  },
  {
    number: 3,
    title: 'Photos & videos',
    description: 'Upload media and choose your cover image.',
    fields: [],
  },
]

export default function CreateListing() {
  const navigate = useNavigate()
  const { isAuthenticated } = useSelector((state) => state.auth)
  const { data: typesRes, isLoading: typesLoading } = usePropertyTypes()
  const propertyTypes = typesRes?.data || []

  const [images, setImages] = React.useState([])
  const [videos, setVideos] = React.useState([])
  const [thumbnailIndex, setThumbnailIndex] = React.useState(0)
  const [pendingPropertyId, setPendingPropertyId] = React.useState(null)
  const [currentStep, setCurrentStep] = React.useState(1)
  const imagesRef = React.useRef([])

  const { mutateAsync: createProperty, isPending: isCreating } = useCreateProperty()
  const { mutateAsync: uploadMedia, isPending: isUploading } = useUploadPropertyMedia()

  const {
    register,
    handleSubmit,
    control,
    trigger,
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
    if (files.length === 0) return
    if (images.length + files.length > MAX_IMAGES) {
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
    setImages((prev) => [...prev, ...previews])
    if (images.length === 0) setThumbnailIndex(0)
  }

  const validateAndSetVideos = (fileList) => {
    const files = Array.from(fileList)
    if (files.length === 0) return
    if (videos.length + files.length > MAX_VIDEOS) {
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
    setVideos((prev) => [...prev, ...files.map((file) => ({ file, name: file.name }))])
  }

  const removeImageAt = (indexToRemove) => {
    setImages((prev) => {
      const target = prev[indexToRemove]
      if (target?.preview) URL.revokeObjectURL(target.preview)
      return prev.filter((_, index) => index !== indexToRemove)
    })
    setThumbnailIndex((prev) => {
      if (indexToRemove === prev) return 0
      if (indexToRemove < prev) return prev - 1
      return prev
    })
  }

  const removeVideoAt = (indexToRemove) => {
    setVideos((prev) => prev.filter((_, index) => index !== indexToRemove))
  }

  React.useEffect(() => {
    imagesRef.current = images
  }, [images])

  React.useEffect(() => {
    return () => {
      imagesRef.current.forEach((img) => {
        if (img.preview) URL.revokeObjectURL(img.preview)
      })
    }
  }, [])

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
  const totalSteps = STEP_CONFIG.length
  const activeStep = STEP_CONFIG[currentStep - 1]
  const progress = (currentStep / totalSteps) * 100

  const goToNextStep = async () => {
    const stepFields = activeStep?.fields || []
    if (stepFields.length > 0) {
      const isValid = await trigger(stepFields)
      if (!isValid) return
    }
    setCurrentStep((prev) => Math.min(prev + 1, totalSteps))
  }

  const goToPreviousStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1))
  }

  const handleFormSubmit = async (event) => {
    event.preventDefault()
    if (currentStep < totalSteps) {
      await goToNextStep()
      return
    }
  }

  const handlePublishClick = handleSubmit(onSubmit)

  return (
    <div className="max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 pb-20 flex flex-col gap-8">
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

      <form onSubmit={handleFormSubmit} className="flex flex-col gap-6">
        <section className="rounded-2xl border border-border/40 bg-card p-5 sm:p-6 flex flex-col gap-4">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-bold text-base sm:text-lg">Listing progress</h2>
            <span className="text-xs text-muted-foreground">
              Step {currentStep} of {totalSteps}
            </span>
          </div>
          <div className="h-2 rounded-full bg-muted overflow-hidden">
            <div className="h-full bg-primary transition-all duration-300" style={{ width: `${progress}%` }} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {STEP_CONFIG.map((step) => {
              const isActive = currentStep === step.number
              const isDone = currentStep > step.number
              return (
                <div
                  key={step.number}
                  className={`rounded-xl border px-3 py-2 transition-colors ${
                    isActive
                      ? 'border-primary bg-primary/10'
                      : isDone
                        ? 'border-primary/30 bg-primary/5'
                        : 'border-border/50 bg-background'
                  }`}
                >
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Step {step.number}
                  </p>
                  <p className="text-sm font-semibold">{step.title}</p>
                </div>
              )
            })}
          </div>
        </section>

        <section className="rounded-2xl border border-border/40 bg-card p-5 sm:p-6 flex flex-col gap-4">
          <div className="space-y-1">
            <h2 className="font-bold text-lg">{activeStep.title}</h2>
            <p className="text-xs sm:text-sm text-muted-foreground">{activeStep.description}</p>
          </div>

          {currentStep === 1 && (
            <>
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
                    <span className="text-[10px] text-muted-foreground">
                      No types in catalog. Ask admin to add property types.
                    </span>
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

              <div className="rounded-xl border border-border/40 bg-muted/10 p-4 sm:p-5 flex flex-col gap-4">
                <h3 className="font-semibold text-base flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-primary" /> Location
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold">City</label>
                    <input
                      type="text"
                      {...register('location_city')}
                      disabled={!!pendingPropertyId}
                      className="h-10 rounded-lg bg-background px-3 text-sm border border-border"
                    />
                    {errors.location_city && <span className="text-[10px] text-destructive">{errors.location_city.message}</span>}
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold">State</label>
                    <input
                      type="text"
                      {...register('location_state')}
                      disabled={!!pendingPropertyId}
                      className="h-10 rounded-lg bg-background px-3 text-sm border border-border"
                    />
                    {errors.location_state && <span className="text-[10px] text-destructive">{errors.location_state.message}</span>}
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold">District</label>
                    <input
                      type="text"
                      {...register('location_district')}
                      disabled={!!pendingPropertyId}
                      className="h-10 rounded-lg bg-background px-3 text-sm border border-border"
                    />
                    {errors.location_district && (
                      <span className="text-[10px] text-destructive">{errors.location_district.message}</span>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}

          {currentStep === 2 && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold">Email</label>
                  <input
                    type="email"
                    {...register('contact_email')}
                    disabled={!!pendingPropertyId}
                    className="h-10 rounded-lg bg-muted/30 px-3 text-sm border border-border"
                  />
                  {errors.contact_email && <span className="text-[10px] text-destructive">{errors.contact_email.message}</span>}
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold">Phone</label>
                  <input
                    type="tel"
                    {...register('contact_phone')}
                    disabled={!!pendingPropertyId}
                    className="h-10 rounded-lg bg-muted/30 px-3 text-sm border border-border"
                  />
                  {errors.contact_phone && <span className="text-[10px] text-destructive">{errors.contact_phone.message}</span>}
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold">Property story</label>
                <textarea
                  {...register('property_story')}
                  disabled={!!pendingPropertyId}
                  rows={5}
                  className="rounded-lg bg-muted/30 px-3 py-2 text-sm border border-border resize-y"
                  placeholder="Describe what makes this property unique..."
                />
                {errors.property_story && <span className="text-[10px] text-destructive">{errors.property_story.message}</span>}
              </div>

              <div className="rounded-xl border border-border/40 bg-muted/10 p-4 sm:p-5 flex flex-col gap-4">
                <h3 className="font-semibold text-base">Special features</h3>
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
              </div>
            </>
          )}

          {currentStep === 3 && (
            <>
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
                    disabled={images.length >= MAX_IMAGES}
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
                    disabled={videos.length >= MAX_VIDEOS}
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
                    <div
                      key={img.preview}
                      className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all ${
                        thumbnailIndex === idx ? 'border-primary ring-2 ring-primary/30' : 'border-transparent'
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => removeImageAt(idx)}
                        className="absolute top-1 right-1 z-10 rounded-full bg-black/70 p-1 text-white hover:bg-black"
                        aria-label="Remove image"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                      <button type="button" onClick={() => setThumbnailIndex(idx)} className="h-full w-full">
                        <img src={img.preview} alt="" className="h-full w-full object-cover" />
                        {thumbnailIndex === idx && (
                          <span className="absolute bottom-1 right-1 bg-primary text-primary-foreground rounded-full p-1">
                            <Star className="h-3 w-3 fill-current" />
                          </span>
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {videos.length > 0 && (
                <ul className="text-sm text-muted-foreground space-y-1">
                  {videos.map((v, idx) => (
                    <li
                      key={`${v.name}-${idx}`}
                      className="flex items-center justify-between gap-2 rounded-lg border border-border/50 px-2 py-1.5"
                    >
                      <span className="flex items-center gap-2">
                        <Video className="h-3.5 w-3.5" /> {v.name}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeVideoAt(idx)}
                        className="rounded-full p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                        aria-label="Remove video"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </>
          )}
        </section>

        <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="text-xs text-muted-foreground">
            {currentStep < totalSteps
              ? 'Complete this step and continue to the next one.'
              : 'Review media and publish your listing.'}
          </div>
          <div className="flex items-center justify-end gap-2">
            {currentStep > 1 && (
              <Button type="button" variant="outline" onClick={goToPreviousStep} disabled={isSubmitting}>
                Back
              </Button>
            )}
            {currentStep < totalSteps ? (
              <Button type="button" onClick={goToNextStep} disabled={isSubmitting}>
                Next
              </Button>
            ) : (
              <Button type="button" onClick={handlePublishClick} disabled={isSubmitting} className="gap-2">
                {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                {pendingPropertyId ? 'Retry media upload' : 'Publish listing'}
              </Button>
            )}
          </div>
        </div>
      </form>
    </div>
  )
}
