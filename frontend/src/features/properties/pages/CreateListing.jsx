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
  Check,
  IndianRupee,
  Maximize2,
  Clock,
  FileText,
  Phone,
  Mail,
  Tag,
  Camera,
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
  property_age: z.preprocess((v) => Number(v), z.number().int().min(0).max(200)),
  special_features: z.array(z.string()).optional(),
})

const STEP_CONFIG = [
  {
    number: 1,
    label: 'Basics',
    title: 'Property Basics',
    description: 'Title, type, price, size, age and location.',
    fields: [
      'title', 'property_type_id', 'asking_price',
      'size_sqft', 'property_age', 'location_city',
      'location_state', 'location_district',
    ],
  },
  {
    number: 2,
    label: 'Details',
    title: 'Story & Contact',
    description: 'How buyers reach you and what makes this place rare.',
    fields: ['contact_email', 'contact_phone', 'property_story', 'special_features'],
  },
  {
    number: 3,
    label: 'Media',
    title: 'Photos & Videos',
    description: 'Show the world what makes your property unique.',
    fields: [],
  },
]

function FieldLabel({ icon: Icon, children }) {
  return (
    <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider flex items-center gap-1.5">
      {Icon && <Icon className="h-3.5 w-3.5 text-brand-bronze" />}
      {children}
    </label>
  )
}

function FieldInput({ error, ...props }) {
  return (
    <input
      {...props}
      className={`h-11 w-full rounded-xl bg-neutral-50/50 dark:bg-neutral-950 px-4 text-sm border outline-none transition-all placeholder:text-neutral-400 font-sans ${
        error
          ? 'border-destructive ring-1 ring-destructive'
          : 'border-neutral-200 dark:border-neutral-800 focus:border-brand-bronze/50 focus:ring-1 focus:ring-brand-bronze/20'
      }`}
    />
  )
}

function FieldError({ message }) {
  if (!message) return null
  return <span className="text-[10px] text-destructive font-semibold">{message}</span>
}

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
    if (!isAuthenticated) navigate('/login', { replace: true })
  }, [isAuthenticated, navigate])

  const validateAndSetImages = (fileList) => {
    const files = Array.from(fileList)
    if (!files.length) return
    if (images.length + files.length > MAX_IMAGES) { toast.error(`Maximum ${MAX_IMAGES} images allowed`); return }
    for (const f of files) {
      if (f.size > MAX_IMAGE_BYTES) { toast.error(`"${f.name}" exceeds 5MB`); return }
      if (!f.type.startsWith('image/')) { toast.error(`"${f.name}" is not an image`); return }
    }
    const previews = files.map((file) => ({ file, preview: URL.createObjectURL(file) }))
    setImages((prev) => [...prev, ...previews])
    if (images.length === 0) setThumbnailIndex(0)
  }

  const validateAndSetVideos = (fileList) => {
    const files = Array.from(fileList)
    if (!files.length) return
    if (videos.length + files.length > MAX_VIDEOS) { toast.error(`Maximum ${MAX_VIDEOS} videos allowed`); return }
    for (const f of files) {
      if (f.size > MAX_VIDEO_BYTES) { toast.error(`"${f.name}" exceeds 50MB`); return }
      if (!f.type.startsWith('video/')) { toast.error(`"${f.name}" is not a video`); return }
    }
    setVideos((prev) => [...prev, ...files.map((file) => ({ file, name: file.name }))])
  }

  const removeImageAt = (i) => {
    setImages((prev) => {
      const t = prev[i]; if (t?.preview) URL.revokeObjectURL(t.preview)
      return prev.filter((_, idx) => idx !== i)
    })
    setThumbnailIndex((prev) => i === prev ? 0 : i < prev ? prev - 1 : prev)
  }

  const removeVideoAt = (i) => setVideos((prev) => prev.filter((_, idx) => idx !== i))

  React.useEffect(() => { imagesRef.current = images }, [images])
  React.useEffect(() => {
    return () => { imagesRef.current.forEach((img) => { if (img.preview) URL.revokeObjectURL(img.preview) }) }
  }, [])

  const uploadFilesForProperty = async (propertyId) => {
    if (!images.length && !videos.length) return
    const formData = new FormData()
    images.forEach(({ file }) => formData.append('images', file))
    videos.forEach(({ file }) => formData.append('videos', file))
    formData.append('thumbnail_index', String(thumbnailIndex))
    await uploadMedia({ propertyId, formData })
  }

  const onSubmit = async (data) => {
    try {
      let propertyId = pendingPropertyId
      if (!propertyId) {
        const res = await createProperty({
          ...data,
          special_features: data.special_features?.length ? data.special_features : undefined,
        })
        if (!res.success) { toast.error(res.message || 'Failed to create listing'); return }
        propertyId = res.data.id
      }
      try {
        await uploadFilesForProperty(propertyId)
        toast.success('Listing submitted! Pending admin verification.')
        navigate('/dashboard')
      } catch (uploadErr) {
        setPendingPropertyId(propertyId)
        toast.error(uploadErr.message || 'Listing saved but media upload failed — click Publish to retry.')
      }
    } catch (err) {
      toast.error(err.message || 'Failed to create listing')
    }
  }

  const isSubmitting = isCreating || isUploading
  const totalSteps = STEP_CONFIG.length
  const activeStep = STEP_CONFIG[currentStep - 1]

  const goToNextStep = async () => {
    const fields = activeStep?.fields || []
    if (fields.length && !(await trigger(fields))) return
    setCurrentStep((p) => Math.min(p + 1, totalSteps))
  }

  const goToPreviousStep = () => setCurrentStep((p) => Math.max(p - 1, 1))

  const handleFormSubmit = async (e) => {
    e.preventDefault()
    if (currentStep < totalSteps) { await goToNextStep(); return }
  }

  return (
    <div className="min-h-screen bg-brand-cream/30">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 pb-20">

        {/* Back */}
        <button
          onClick={() => navigate(-1)}
          className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-neutral-500 hover:text-brand-forest transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </button>

        <div className="grid lg:grid-cols-[300px_1fr] gap-8 items-start">

          {/* ── LEFT SIDEBAR ── */}
          <div className="lg:sticky lg:top-28 flex flex-col gap-4">

            {/* Brand panel */}
            <div className="rounded-3xl bg-brand-forest text-white p-7 relative overflow-hidden shadow-xl">
              {/* decorative circle */}
              <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/5" />
              <div className="absolute -right-2 -bottom-10 h-48 w-48 rounded-full bg-white/[0.03]" />

              <div className="relative">
                <div className="inline-flex items-center gap-1.5 text-[9px] font-bold text-brand-terracotta-light tracking-widest uppercase bg-white/10 px-3 py-1 rounded-full mb-4">
                  <Sparkles className="h-3 w-3" /> New Listing
                </div>
                <h1 className="font-serif text-2xl font-bold leading-snug mb-1">
                  List Your<br />Property
                </h1>
                <p className="text-xs text-white/60 leading-relaxed mb-8">
                  Reach rare-home seekers across India. Your listing goes live after admin review.
                </p>

                {/* Vertical stepper */}
                <div className="flex flex-col gap-0">
                  {STEP_CONFIG.map((step, idx) => {
                    const isDone = currentStep > step.number
                    const isActive = currentStep === step.number
                    const isLast = idx === STEP_CONFIG.length - 1
                    return (
                      <div key={step.number} className="flex items-start gap-3">
                        {/* Line + circle column */}
                        <div className="flex flex-col items-center">
                          <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 text-xs font-bold transition-all duration-300 ${
                            isDone
                              ? 'border-brand-terracotta bg-brand-terracotta text-white'
                              : isActive
                                ? 'border-brand-terracotta bg-transparent text-brand-terracotta-light'
                                : 'border-white/20 bg-transparent text-white/30'
                          }`}>
                            {isDone ? <Check className="h-3.5 w-3.5" /> : step.number}
                          </div>
                          {!isLast && (
                            <div className={`w-0.5 h-10 mt-0.5 transition-all duration-300 ${
                              isDone ? 'bg-brand-terracotta/60' : 'bg-white/10'
                            }`} />
                          )}
                        </div>
                        {/* Text */}
                        <div className="pb-10 last:pb-0 pt-1">
                          <p className={`text-xs font-bold uppercase tracking-wider transition-colors ${
                            isActive ? 'text-brand-terracotta-light' : isDone ? 'text-white/70' : 'text-white/30'
                          }`}>
                            {step.label}
                          </p>
                          <p className={`text-[11px] leading-relaxed transition-colors ${
                            isActive ? 'text-white/80' : isDone ? 'text-white/40' : 'text-white/20'
                          }`}>
                            {step.description}
                          </p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* Retry banner */}
            {pendingPropertyId && (
              <div className="rounded-2xl border border-amber-400/30 bg-amber-50 px-4 py-3 text-xs text-amber-800 font-medium leading-relaxed">
                Your listing was saved. Click <strong>Publish Listing</strong> to retry the media upload.
              </div>
            )}
          </div>

          {/* ── RIGHT FORM CARD ── */}
          <div className="rounded-3xl border border-neutral-100 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-xl relative overflow-hidden">
            {/* Top bronze accent */}
            <div className="absolute top-0 left-0 w-full h-1.5 bg-brand-bronze" />

            <form onSubmit={handleFormSubmit}>
              <div className="p-7 sm:p-9 pt-10">

                {/* Step header */}
                <div className="mb-8">
                  <div className="inline-flex items-center gap-1.5 text-[9px] font-bold text-brand-bronze tracking-widest uppercase bg-brand-bronze/10 px-3 py-1 rounded-full mb-3">
                    Step {currentStep} of {totalSteps}
                  </div>
                  <h2 className="font-serif text-3xl font-bold text-neutral-950 dark:text-white leading-tight mb-1">
                    {activeStep.title}
                  </h2>
                  <p className="text-sm text-neutral-500">{activeStep.description}</p>
                </div>

                {/* ─── STEP 1: Basics ─── */}
                {currentStep === 1 && (
                  <div className="flex flex-col gap-6">
                    {/* Title */}
                    <div className="flex flex-col gap-2">
                      <FieldLabel icon={Tag}>Property Title</FieldLabel>
                      <FieldInput
                        type="text"
                        {...register('title')}
                        disabled={!!pendingPropertyId}
                        placeholder="e.g. Himalayan Earthship Retreat"
                        error={errors.title}
                      />
                      <FieldError message={errors.title?.message} />
                    </div>

                    {/* Type + Price */}
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="flex flex-col gap-2">
                        <FieldLabel icon={Tag}>Property Type</FieldLabel>
                        <select
                          {...register('property_type_id')}
                          disabled={typesLoading || !!pendingPropertyId}
                          className={`h-11 w-full rounded-xl bg-neutral-50/50 dark:bg-neutral-950 px-4 text-sm border outline-none transition-all font-sans ${
                            errors.property_type_id
                              ? 'border-destructive ring-1 ring-destructive'
                              : 'border-neutral-200 dark:border-neutral-800 focus:border-brand-bronze/50 focus:ring-1 focus:ring-brand-bronze/20'
                          }`}
                        >
                          <option value="">Select type…</option>
                          {propertyTypes.map((t) => (
                            <option key={t.id} value={t.id}>{t.name}</option>
                          ))}
                        </select>
                        <FieldError message={errors.property_type_id?.message} />
                        {!typesLoading && !propertyTypes.length && (
                          <span className="text-[10px] text-neutral-400">No types available — ask admin.</span>
                        )}
                      </div>
                      <div className="flex flex-col gap-2">
                        <FieldLabel icon={IndianRupee}>Asking Price (INR)</FieldLabel>
                        <FieldInput
                          type="number"
                          {...register('asking_price')}
                          disabled={!!pendingPropertyId}
                          placeholder="e.g. 4500000"
                          error={errors.asking_price}
                        />
                        <FieldError message={errors.asking_price?.message} />
                      </div>
                    </div>

                    {/* Size + Age */}
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="flex flex-col gap-2">
                        <FieldLabel icon={Maximize2}>Size (sq ft)</FieldLabel>
                        <FieldInput
                          type="number"
                          {...register('size_sqft')}
                          disabled={!!pendingPropertyId}
                          placeholder="e.g. 1200"
                          error={errors.size_sqft}
                        />
                        <FieldError message={errors.size_sqft?.message} />
                      </div>
                      <div className="flex flex-col gap-2">
                        <FieldLabel icon={Clock}>Property Age (years)</FieldLabel>
                        <FieldInput
                          type="number"
                          min={0}
                          max={200}
                          {...register('property_age')}
                          disabled={!!pendingPropertyId}
                          placeholder="e.g. 3"
                          error={errors.property_age}
                        />
                        <FieldError message={errors.property_age?.message} />
                      </div>
                    </div>

                    {/* Location */}
                    <div className="rounded-2xl border border-brand-sand/70 bg-brand-cream/40 p-5 flex flex-col gap-4">
                      <div className="flex items-center gap-2">
                        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-forest/10">
                          <MapPin className="h-3.5 w-3.5 text-brand-forest" />
                        </div>
                        <span className="text-xs font-bold uppercase tracking-wider text-brand-forest">Location</span>
                      </div>
                      <div className="grid sm:grid-cols-3 gap-3">
                        <div className="flex flex-col gap-2">
                          <FieldLabel>City</FieldLabel>
                          <FieldInput
                            type="text"
                            {...register('location_city')}
                            disabled={!!pendingPropertyId}
                            placeholder="Rishikesh"
                            error={errors.location_city}
                          />
                          <FieldError message={errors.location_city?.message} />
                        </div>
                        <div className="flex flex-col gap-2">
                          <FieldLabel>State</FieldLabel>
                          <FieldInput
                            type="text"
                            {...register('location_state')}
                            disabled={!!pendingPropertyId}
                            placeholder="Uttarakhand"
                            error={errors.location_state}
                          />
                          <FieldError message={errors.location_state?.message} />
                        </div>
                        <div className="flex flex-col gap-2">
                          <FieldLabel>District</FieldLabel>
                          <FieldInput
                            type="text"
                            {...register('location_district')}
                            disabled={!!pendingPropertyId}
                            placeholder="Tehri Garhwal"
                            error={errors.location_district}
                          />
                          <FieldError message={errors.location_district?.message} />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* ─── STEP 2: Details ─── */}
                {currentStep === 2 && (
                  <div className="flex flex-col gap-6">
                    {/* Contact */}
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="flex flex-col gap-2">
                        <FieldLabel icon={Mail}>Contact Email</FieldLabel>
                        <FieldInput
                          type="email"
                          {...register('contact_email')}
                          disabled={!!pendingPropertyId}
                          placeholder="seller@example.com"
                          error={errors.contact_email}
                        />
                        <FieldError message={errors.contact_email?.message} />
                      </div>
                      <div className="flex flex-col gap-2">
                        <FieldLabel icon={Phone}>Contact Phone</FieldLabel>
                        <FieldInput
                          type="tel"
                          {...register('contact_phone')}
                          disabled={!!pendingPropertyId}
                          placeholder="+91 98765 43210"
                          error={errors.contact_phone}
                        />
                        <FieldError message={errors.contact_phone?.message} />
                      </div>
                    </div>

                    {/* Story */}
                    <div className="flex flex-col gap-2">
                      <FieldLabel icon={FileText}>Property Story</FieldLabel>
                      <textarea
                        {...register('property_story')}
                        disabled={!!pendingPropertyId}
                        rows={6}
                        placeholder="Describe what makes this property truly rare — the land, the build, the lifestyle it offers…"
                        className={`w-full rounded-xl bg-neutral-50/50 dark:bg-neutral-950 px-4 py-3 text-sm border outline-none transition-all placeholder:text-neutral-400 font-sans resize-y leading-relaxed ${
                          errors.property_story
                            ? 'border-destructive ring-1 ring-destructive'
                            : 'border-neutral-200 dark:border-neutral-800 focus:border-brand-bronze/50 focus:ring-1 focus:ring-brand-bronze/20'
                        }`}
                      />
                      <FieldError message={errors.property_story?.message} />
                    </div>

                    {/* Special features */}
                    <div className="flex flex-col gap-3">
                      <FieldLabel icon={Sparkles}>Special Features</FieldLabel>
                      <Controller
                        name="special_features"
                        control={control}
                        render={({ field }) => (
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                            {SPECIAL_FEATURES.map((feature) => {
                              const checked = (field.value || []).includes(feature)
                              return (
                                <button
                                  key={feature}
                                  type="button"
                                  disabled={!!pendingPropertyId}
                                  onClick={() => {
                                    const next = checked
                                      ? (field.value || []).filter((f) => f !== feature)
                                      : [...(field.value || []), feature]
                                    field.onChange(next)
                                  }}
                                  className={`flex items-center gap-2 rounded-xl border px-3 py-2.5 text-xs font-semibold transition-all duration-200 text-left ${
                                    checked
                                      ? 'border-brand-bronze bg-brand-bronze/10 text-brand-bronze shadow-sm scale-[1.01]'
                                      : 'border-neutral-200 dark:border-neutral-800 text-neutral-500 hover:border-brand-bronze/30 hover:bg-brand-bronze/5'
                                  }`}
                                >
                                  <div className={`h-3.5 w-3.5 shrink-0 rounded-full border transition-all ${
                                    checked ? 'bg-brand-bronze border-brand-bronze' : 'border-neutral-300'
                                  }`}>
                                    {checked && <Check className="h-3.5 w-3.5 text-white p-[1px]" />}
                                  </div>
                                  {feature}
                                </button>
                              )
                            })}
                          </div>
                        )}
                      />
                    </div>
                  </div>
                )}

                {/* ─── STEP 3: Media ─── */}
                {currentStep === 3 && (
                  <div className="flex flex-col gap-6">
                    <p className="text-sm text-neutral-500 leading-relaxed">
                      Upload up to <strong>{MAX_IMAGES} images</strong> (5 MB each) and <strong>{MAX_VIDEOS} videos</strong> (50 MB each).
                      Click an image to mark it as the cover photo.
                    </p>

                    {/* Upload zones */}
                    <div className="grid sm:grid-cols-2 gap-3">
                      <label className={`group flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed p-8 transition-all cursor-pointer ${
                        images.length >= MAX_IMAGES
                          ? 'border-neutral-200 opacity-50 cursor-not-allowed'
                          : 'border-brand-sand hover:border-brand-bronze/50 hover:bg-brand-bronze/5'
                      }`}>
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-forest/10 group-hover:bg-brand-bronze/10 transition-colors">
                          <ImagePlus className="h-5 w-5 text-brand-forest group-hover:text-brand-bronze transition-colors" />
                        </div>
                        <div className="text-center">
                          <p className="text-sm font-semibold text-neutral-700">Add Images</p>
                          <p className="text-xs text-neutral-400 mt-0.5">JPG, PNG, WebP · 5 MB max</p>
                        </div>
                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/webp"
                          multiple
                          disabled={images.length >= MAX_IMAGES}
                          className="hidden"
                          onChange={(e) => { validateAndSetImages(e.target.files); e.target.value = '' }}
                        />
                      </label>

                      <label className={`group flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed p-8 transition-all cursor-pointer ${
                        videos.length >= MAX_VIDEOS
                          ? 'border-neutral-200 opacity-50 cursor-not-allowed'
                          : 'border-brand-sand hover:border-brand-bronze/50 hover:bg-brand-bronze/5'
                      }`}>
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-forest/10 group-hover:bg-brand-bronze/10 transition-colors">
                          <Video className="h-5 w-5 text-brand-forest group-hover:text-brand-bronze transition-colors" />
                        </div>
                        <div className="text-center">
                          <p className="text-sm font-semibold text-neutral-700">Add Videos</p>
                          <p className="text-xs text-neutral-400 mt-0.5">MP4, WebM, MOV · 50 MB max</p>
                        </div>
                        <input
                          type="file"
                          accept="video/mp4,video/webm,video/quicktime"
                          multiple
                          disabled={videos.length >= MAX_VIDEOS}
                          className="hidden"
                          onChange={(e) => { validateAndSetVideos(e.target.files); e.target.value = '' }}
                        />
                      </label>
                    </div>

                    {/* Image grid */}
                    {images.length > 0 && (
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <Camera className="h-3.5 w-3.5 text-brand-bronze" />
                          <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                            Images ({images.length}/{MAX_IMAGES}) — click to set cover
                          </span>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                          {images.map((img, idx) => (
                            <div
                              key={img.preview}
                              className={`relative aspect-square rounded-2xl overflow-hidden border-2 transition-all duration-200 ${
                                thumbnailIndex === idx
                                  ? 'border-brand-bronze ring-2 ring-brand-bronze/30 shadow-md'
                                  : 'border-neutral-200 hover:border-brand-bronze/40'
                              }`}
                            >
                              <button
                                type="button"
                                onClick={() => removeImageAt(idx)}
                                className="absolute top-1.5 right-1.5 z-10 rounded-full bg-black/60 p-1 text-white hover:bg-black/80 transition-colors"
                              >
                                <X className="h-3 w-3" />
                              </button>
                              <button type="button" onClick={() => setThumbnailIndex(idx)} className="h-full w-full">
                                <img src={img.preview} alt="" className="h-full w-full object-cover" />
                              </button>
                              {thumbnailIndex === idx && (
                                <span className="absolute bottom-1.5 left-1.5 inline-flex items-center gap-1 rounded-full bg-brand-bronze px-2 py-0.5 text-[9px] font-bold text-white">
                                  <Star className="h-2.5 w-2.5 fill-current" /> Cover
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Video list */}
                    {videos.length > 0 && (
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <Video className="h-3.5 w-3.5 text-brand-bronze" />
                          <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                            Videos ({videos.length}/{MAX_VIDEOS})
                          </span>
                        </div>
                        <ul className="flex flex-col gap-2">
                          {videos.map((v, idx) => (
                            <li
                              key={`${v.name}-${idx}`}
                              className="flex items-center justify-between gap-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 px-4 py-2.5"
                            >
                              <span className="flex items-center gap-2 text-sm text-neutral-700 truncate">
                                <Video className="h-3.5 w-3.5 shrink-0 text-neutral-400" />
                                {v.name}
                              </span>
                              <button
                                type="button"
                                onClick={() => removeVideoAt(idx)}
                                className="shrink-0 rounded-full p-1 text-neutral-400 hover:bg-neutral-200 hover:text-neutral-700 transition-colors"
                              >
                                <X className="h-3.5 w-3.5" />
                              </button>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Footer nav */}
              <div className="flex items-center justify-between gap-4 px-7 sm:px-9 py-5 border-t border-neutral-100 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-950/30 rounded-b-3xl">
                <div className="text-xs text-neutral-400">
                  {currentStep < totalSteps ? 'Fill in the details and continue.' : 'Review your media and publish.'}
                </div>
                <div className="flex items-center gap-3">
                  {currentStep > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={goToPreviousStep}
                      disabled={isSubmitting}
                      className="rounded-xl border-neutral-200 text-neutral-600 hover:border-brand-forest/30 hover:text-brand-forest"
                    >
                      Back
                    </Button>
                  )}
                  {currentStep < totalSteps ? (
                    <Button
                      type="button"
                      onClick={goToNextStep}
                      disabled={isSubmitting}
                      className="rounded-xl bg-brand-forest hover:bg-brand-forest-mid text-white font-bold px-6 shadow-md shadow-brand-forest/20"
                    >
                      Continue
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      onClick={handleSubmit(onSubmit)}
                      disabled={isSubmitting}
                      className="rounded-xl bg-brand-bronze hover:bg-brand-bronze-dark text-white font-bold px-6 shadow-lg shadow-brand-bronze/20 gap-2"
                    >
                      {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                      {pendingPropertyId ? 'Retry Upload' : 'Publish Listing'}
                    </Button>
                  )}
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
