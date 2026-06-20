import React from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import AsyncSelect from 'react-select/async'
import apiClient from '@/shared/lib/apiClient'
import LocationSelect from '@/components/common/LocationSelect'
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
  Eye,
  PencilLine,
} from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import PageLoader from '@/shared/components/ui/PageLoader'
import {
  useProperty,
  usePropertyTypes,
  useUpdateProperty,
  useUploadPropertyMedia,
} from '@/features/properties'
import {
  SPECIAL_FEATURES,
  MAX_IMAGES,
  MAX_VIDEOS,
  MAX_IMAGE_BYTES,
  MAX_VIDEO_BYTES,
} from '@/features/properties/constants/specialFeatures'
import {
  deletePropertyMedia,
  setPropertyThumbnail,
} from '@/features/properties/api/propertyApi'
import { resolveMediaUrl } from '@/features/properties/lib/propertyUtils'

const editSchema = z.object({
  title: z.string().min(2).max(255),
  property_type_id: z.string().uuid('Select a property type'),
  asking_price: z.preprocess((v) => Number(v), z.number().positive()),
  size_sqft: z.preprocess((v) => Number(v), z.number().positive()),
  city: z.string().max(100).optional().or(z.literal('')),
  state: z.string().min(1, 'State is required').max(100),
  district: z.string().min(1, 'District is required').max(100),
  area: z.string().min(2).max(100),
  pincode: z.string().min(6).max(10),
  contact_email: z.string().email(),
  contact_phone: z.string().min(8).max(20),
  property_story: z.string().min(10),
  property_age: z.preprocess((v) => Number(v), z.number().int().min(0).max(200)),
  special_features: z.array(z.string()).optional(),
  status: z.enum(['Available', 'Pending', 'Sold']),
  is_visible: z.boolean(),
})

const STEP_CONFIG = [
  {
    number: 1,
    label: 'Basics',
    title: 'Property Basics',
    description: 'Title, type, price, size, age, status and location.',
    fields: [
      'title', 'property_type_id', 'asking_price',
      'size_sqft', 'property_age', 'status',
      'city', 'state', 'district',
      'area', 'pincode',
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
    description: 'Manage existing media and add new files.',
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

const loadStateOptions = async (inputValue) => {
  try {
    const data = await apiClient.get('/locations/states')
    if (!inputValue) return data
    return data.filter((item) =>
      item.label.toLowerCase().includes(inputValue.toLowerCase())
    )
  } catch (err) {
    console.error('Failed to load states:', err)
    return []
  }
}

const loadDistrictOptions = (state) => async (inputValue) => {
  if (!state) return []
  try {
    const data = await apiClient.get(`/locations/districts?state=${encodeURIComponent(state)}`)
    if (!inputValue) return data
    return data.filter((item) =>
      item.label.toLowerCase().includes(inputValue.toLowerCase())
    )
  } catch (err) {
    console.error('Failed to load districts:', err)
    return []
  }
}

const loadCityOptions = (state, district) => async (inputValue) => {
  if (!state || !district) return []
  try {
    const data = await apiClient.get(`/locations/cities?state=${encodeURIComponent(state)}&district=${encodeURIComponent(district)}`)
    if (!inputValue) return data
    return data.filter((item) =>
      item.label.toLowerCase().includes(inputValue.toLowerCase())
    )
  } catch (err) {
    console.error('Failed to load cities:', err)
    return []
  }
}

export default function EditListing() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { isAuthenticated, user } = useSelector((state) => state.auth)

  const { data: propertyRes, isLoading: propertyLoading, isError } = useProperty(id)
  const { data: typesRes, isLoading: typesLoading } = usePropertyTypes()

  const property = propertyRes?.data
  const propertyTypes = typesRes?.data || []

  const [currentStep, setCurrentStep] = React.useState(1)

  // Existing media management
  const [removedMediaIds, setRemovedMediaIds] = React.useState(new Set())
  // Tracks only an explicit user click — null means "keep original"
  const [userSelectedThumbnailId, setUserSelectedThumbnailId] = React.useState(null)

  // New media (uploaded on save)
  const [newImages, setNewImages] = React.useState([])
  const [newVideos, setNewVideos] = React.useState([])
  const [newThumbnailIndex, setNewThumbnailIndex] = React.useState(0)
  const newImagesRef = React.useRef([])

  const { mutateAsync: updateProperty, isPending: isSaving } = useUpdateProperty()
  const { mutateAsync: uploadMedia, isPending: isUploading } = useUploadPropertyMedia()

  const {
    register,
    handleSubmit,
    control,
    trigger,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(editSchema),
    defaultValues: {
      title: '',
      property_type_id: '',
      asking_price: 0,
      size_sqft: 0,
      city: '',
      state: '',
      district: '',
      area: '',
      pincode: '',
      contact_email: '',
      contact_phone: '',
      property_story: '',
      property_age: 0,
      special_features: [],
      status: 'Available',
      is_visible: true,
    },
  })

  const stateVal = watch('state')
  const districtVal = watch('district')

  React.useEffect(() => {
    if (!isAuthenticated) navigate('/login', { replace: true })
  }, [isAuthenticated, navigate])

  React.useEffect(() => {
    if (!property) return
    if (user && String(property.seller_id) !== String(user.id) && user.role !== 'Admin') {
      toast.error('You are not authorized to edit this listing.')
      navigate(`/properties/${id}`, { replace: true })
      return
    }
    reset({
      title: property.title || '',
      property_type_id: property.property_type_id || '',
      asking_price: property.asking_price || 0,
      size_sqft: property.size_sqft || 0,
      city: property.location_city || '',
      state: property.location_state || '',
      district: property.location_district || '',
      area: property.Area || '',
      pincode: property.Pincode || '',
      contact_email: property.contact_email || '',
      contact_phone: property.contact_phone || '',
      property_story: property.property_story || '',
      property_age: property.property_age ?? 0,
      special_features: Array.isArray(property.special_features) ? property.special_features : [],
      status: property.status || 'Available',
      is_visible: property.is_visible === true || property.is_visible === 1 || property.is_visible === '1',
    })
  }, [property, user, reset, id, navigate])

  // Derived — no state needed for these read-only values
  const originalThumbnailId = React.useMemo(
    () => (property?.media || []).find((m) => m.is_thumbnail || m.is_thumbnail === 1)?.id ?? null,
    [property],
  )
  const effectiveThumbnailId = userSelectedThumbnailId ?? originalThumbnailId

  const existingImages = React.useMemo(
    () => (property?.media || []).filter((m) => m.media_type === 'Image' && !removedMediaIds.has(m.id)),
    [property, removedMediaIds],
  )
  const existingVideos = React.useMemo(
    () => (property?.media || []).filter((m) => m.media_type === 'Video' && !removedMediaIds.has(m.id)),
    [property, removedMediaIds],
  )

  const totalImages = existingImages.length + newImages.length
  const totalVideos = existingVideos.length + newVideos.length

  const validateAndSetImages = (fileList) => {
    const files = Array.from(fileList)
    if (!files.length) return
    if (totalImages + files.length > MAX_IMAGES) { toast.error(`Maximum ${MAX_IMAGES} images allowed`); return }
    for (const f of files) {
      if (f.size > MAX_IMAGE_BYTES) { toast.error(`"${f.name}" exceeds 5MB`); return }
      if (!f.type.startsWith('image/')) { toast.error(`"${f.name}" is not an image`); return }
    }
    setNewImages((prev) => [...prev, ...files.map((file) => ({ file, preview: URL.createObjectURL(file) }))])
  }

  const validateAndSetVideos = (fileList) => {
    const files = Array.from(fileList)
    if (!files.length) return
    if (totalVideos + files.length > MAX_VIDEOS) { toast.error(`Maximum ${MAX_VIDEOS} videos allowed`); return }
    for (const f of files) {
      if (f.size > MAX_VIDEO_BYTES) { toast.error(`"${f.name}" exceeds 50MB`); return }
      if (!f.type.startsWith('video/')) { toast.error(`"${f.name}" is not a video`); return }
    }
    setNewVideos((prev) => [...prev, ...files.map((file) => ({ file, name: file.name }))])
  }

  const removeNewImageAt = (i) => {
    setNewImages((prev) => {
      const t = prev[i]; if (t?.preview) URL.revokeObjectURL(t.preview)
      return prev.filter((_, idx) => idx !== i)
    })
    setNewThumbnailIndex((prev) => (i === prev ? 0 : i < prev ? prev - 1 : prev))
  }

  const removeNewVideoAt = (i) => setNewVideos((prev) => prev.filter((_, idx) => idx !== i))

  const markExistingRemoved = (mediaId) => {
    setRemovedMediaIds((prev) => new Set([...prev, mediaId]))
    if (userSelectedThumbnailId === mediaId) setUserSelectedThumbnailId(null)
  }

  React.useEffect(() => { newImagesRef.current = newImages }, [newImages])
  React.useEffect(() => {
    return () => { newImagesRef.current.forEach((img) => { if (img.preview) URL.revokeObjectURL(img.preview) }) }
  }, [])

  const onSubmit = async (data) => {
    try {
      const res = await updateProperty({ id, ...data })
      if (!res.success) { toast.error(res.message || 'Failed to update listing'); return }

      if (removedMediaIds.size > 0) {
        await Promise.all([...removedMediaIds].map((mediaId) => deletePropertyMedia(id, mediaId)))
      }

      if (newImages.length > 0 || newVideos.length > 0) {
        const formData = new FormData()
        newImages.forEach(({ file }) => formData.append('images', file))
        newVideos.forEach(({ file }) => formData.append('videos', file))
        formData.append('thumbnail_index', String(newThumbnailIndex))
        await uploadMedia({ propertyId: id, formData })
      } else if (effectiveThumbnailId && effectiveThumbnailId !== originalThumbnailId) {
        await setPropertyThumbnail(id, effectiveThumbnailId)
      }

      toast.success('Listing updated successfully!')
      navigate(`/properties/${id}`)
    } catch (err) {
      toast.error(err.message || 'Failed to update listing')
    }
  }

  const isSubmitting = isSaving || isUploading
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

  if (propertyLoading || typesLoading) {
    return (
      <PageLoader />
    )
  }

  if (isError || !property) {
    return (
      <div className="max-w-md mx-auto py-20 text-center flex flex-col gap-4">
        <h1 className="text-2xl font-extrabold tracking-tight">Listing not found</h1>
        <p className="text-sm text-neutral-500">The property you are trying to edit does not exist or has been removed.</p>
        <Button onClick={() => navigate('/dashboard')} className="w-fit mx-auto">Back to Dashboard</Button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-brand-cream/30">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 pb-20">

        <button
          onClick={() => navigate(-1)}
          className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-neutral-500 hover:text-brand-forest transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </button>

        <div className="grid lg:grid-cols-[300px_1fr] gap-8 items-start">

          {/* ── LEFT SIDEBAR ── */}
          <div className="lg:sticky lg:top-28 flex flex-col gap-4">
            <div className="rounded-3xl bg-brand-forest text-white p-7 relative overflow-hidden shadow-xl">
              <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/5" />
              <div className="absolute -right-2 -bottom-10 h-48 w-48 rounded-full bg-white/[0.03]" />

              <div className="relative">
                <div className="inline-flex items-center gap-1.5 text-[9px] font-bold text-brand-terracotta-light tracking-widest uppercase bg-white/10 px-3 py-1 rounded-full mb-4">
                  <PencilLine className="h-3 w-3" /> Edit Listing
                </div>
                <h1 className="font-serif text-2xl font-bold leading-snug mb-1">
                  Update Your<br />Property
                </h1>
                <p className="text-xs text-white/60 leading-relaxed mb-8">
                  Changes go live immediately after saving.
                </p>

                <div className="flex flex-col gap-0">
                  {STEP_CONFIG.map((step, idx) => {
                    const isDone = currentStep > step.number
                    const isActive = currentStep === step.number
                    const isLast = idx === STEP_CONFIG.length - 1
                    return (
                      <div key={step.number} className="flex items-start gap-3">
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
          </div>

          {/* ── RIGHT FORM CARD ── */}
          <div className="rounded-3xl border border-neutral-100 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-xl relative overflow-hidden">
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
                    <div className="flex flex-col gap-2">
                      <FieldLabel icon={Tag}>Property Title</FieldLabel>
                      <FieldInput
                        type="text"
                        {...register('title')}
                        placeholder="e.g. Himalayan Earthship Retreat"
                        error={errors.title}
                      />
                      <FieldError message={errors.title?.message} />
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="flex flex-col gap-2">
                        <FieldLabel icon={Tag}>Property Type</FieldLabel>
                        <select
                          {...register('property_type_id')}
                          disabled={typesLoading}
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
                      </div>
                      <div className="flex flex-col gap-2">
                        <FieldLabel icon={IndianRupee}>Asking Price (INR)</FieldLabel>
                        <FieldInput
                          type="number"
                          {...register('asking_price')}
                          placeholder="e.g. 4500000"
                          error={errors.asking_price}
                        />
                        <FieldError message={errors.asking_price?.message} />
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-3 gap-4">
                      <div className="flex flex-col gap-2">
                        <FieldLabel icon={Maximize2}>Size (sq ft)</FieldLabel>
                        <FieldInput
                          type="number"
                          {...register('size_sqft')}
                          placeholder="e.g. 1200"
                          error={errors.size_sqft}
                        />
                        <FieldError message={errors.size_sqft?.message} />
                      </div>
                      <div className="flex flex-col gap-2">
                        <FieldLabel icon={Clock}>Age (years)</FieldLabel>
                        <FieldInput
                          type="number"
                          min={0}
                          max={200}
                          {...register('property_age')}
                          placeholder="e.g. 3"
                          error={errors.property_age}
                        />
                        <FieldError message={errors.property_age?.message} />
                      </div>
                      <div className="flex flex-col gap-2">
                        <FieldLabel icon={Tag}>Status</FieldLabel>
                        <select
                          {...register('status')}
                          className={`h-11 w-full rounded-xl bg-neutral-50/50 dark:bg-neutral-950 px-4 text-sm border outline-none transition-all font-sans ${
                            errors.status
                              ? 'border-destructive ring-1 ring-destructive'
                              : 'border-neutral-200 dark:border-neutral-800 focus:border-brand-bronze/50 focus:ring-1 focus:ring-brand-bronze/20'
                          }`}
                        >
                          <option value="Available">Available</option>
                          <option value="Pending">Pending</option>
                          <option value="Sold">Sold</option>
                        </select>
                        <FieldError message={errors.status?.message} />
                      </div>
                    </div>

                    <div className="rounded-2xl border border-brand-sand/70 bg-brand-cream/40 p-5 flex flex-col gap-4">
                      <div className="flex items-center gap-2">
                        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-forest/10">
                          <MapPin className="h-3.5 w-3.5 text-brand-forest" />
                        </div>
                        <span className="text-xs font-bold uppercase tracking-wider text-brand-forest">Location</span>
                      </div>
                      <div className="grid sm:grid-cols-3 gap-3">
                        <div className="flex flex-col gap-2">
                          <FieldLabel>State</FieldLabel>
                          <Controller
                            name="state"
                            control={control}
                            render={({ field: { onChange, value } }) => (
                              <LocationSelect
                                value={value}
                                onChange={(val) => {
                                  onChange(val)
                                  setValue('district', '')
                                  setValue('city', '')
                                }}
                                loadOptions={loadStateOptions}
                                placeholder="Select/type state"
                                error={errors.state}
                              />
                            )}
                          />
                          <FieldError message={errors.state?.message} />
                        </div>
                        <div className="flex flex-col gap-2">
                          <FieldLabel>District</FieldLabel>
                          <Controller
                            name="district"
                            control={control}
                            render={({ field: { onChange, value } }) => (
                              <LocationSelect
                                value={value}
                                onChange={(val) => {
                                  onChange(val)
                                  setValue('city', '')
                                }}
                                loadOptions={loadDistrictOptions(stateVal)}
                                placeholder="Select/type district"
                                isDisabled={!stateVal}
                                error={errors.district}
                              />
                            )}
                          />
                          <FieldError message={errors.district?.message} />
                        </div>
                        <div className="flex flex-col gap-2">
                          <FieldLabel>City</FieldLabel>
                          <Controller
                            name="city"
                            control={control}
                            render={({ field: { onChange, value } }) => (
                              <LocationSelect
                                value={value}
                                onChange={onChange}
                                loadOptions={loadCityOptions(stateVal, districtVal)}
                                placeholder="Select/type city"
                                isDisabled={!districtVal}
                                error={errors.city}
                              />
                            )}
                          />
                          <FieldError message={errors.city?.message} />
                        </div>
                      </div>
                      <div className="grid sm:grid-cols-2 gap-3">
                        <div className="flex flex-col gap-2">
                          <FieldLabel>Area</FieldLabel>
                          <FieldInput type="text" {...register('area')} placeholder="e.g. Tapovan" error={errors.area} />
                          <FieldError message={errors.area?.message} />
                        </div>
                        <div className="flex flex-col gap-2">
                          <FieldLabel>Pincode</FieldLabel>
                          <FieldInput type="text" {...register('pincode')} placeholder="e.g. 249192" error={errors.pincode} />
                          <FieldError message={errors.pincode?.message} />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* ─── STEP 2: Details ─── */}
                {currentStep === 2 && (
                  <div className="flex flex-col gap-6">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="flex flex-col gap-2">
                        <FieldLabel icon={Mail}>Contact Email</FieldLabel>
                        <FieldInput type="email" {...register('contact_email')} placeholder="seller@example.com" error={errors.contact_email} />
                        <FieldError message={errors.contact_email?.message} />
                      </div>
                      <div className="flex flex-col gap-2">
                        <FieldLabel icon={Phone}>Contact Phone</FieldLabel>
                        <FieldInput type="tel" {...register('contact_phone')} placeholder="+91 98765 43210" error={errors.contact_phone} />
                        <FieldError message={errors.contact_phone?.message} />
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      <FieldLabel icon={FileText}>Property Story</FieldLabel>
                      <textarea
                        {...register('property_story')}
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

                    {/* Visibility toggle */}
                    <div className="rounded-2xl border border-brand-sand/70 bg-brand-cream/40 p-5 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-forest/10">
                          <Eye className="h-4 w-4 text-brand-forest" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-brand-forest">Visible to Public</p>
                          <p className="text-xs text-neutral-500">Hidden listings won't appear in the catalog or feeds.</p>
                        </div>
                      </div>
                      <Controller
                        name="is_visible"
                        control={control}
                        render={({ field }) => (
                          <button
                            type="button"
                            role="switch"
                            aria-checked={field.value}
                            onClick={() => field.onChange(!field.value)}
                            className={`relative inline-flex h-6 w-11 shrink-0 rounded-full border-2 border-transparent transition-colors ${
                              field.value ? 'bg-brand-forest' : 'bg-neutral-300 dark:bg-neutral-700'
                            }`}
                          >
                            <span
                              className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow ring-0 transition-transform ${
                                field.value ? 'translate-x-5' : 'translate-x-0'
                              }`}
                            />
                          </button>
                        )}
                      />
                    </div>
                  </div>
                )}

                {/* ─── STEP 3: Media ─── */}
                {currentStep === 3 && (
                  <div className="flex flex-col gap-6">
                    <p className="text-sm text-neutral-500 leading-relaxed">
                      Manage existing media or add new files. Up to <strong>{MAX_IMAGES} images</strong> (5 MB each) and{' '}
                      <strong>{MAX_VIDEOS} videos</strong> (50 MB each) total. Click an image to set it as the cover photo.
                    </p>

                    {/* Upload zones */}
                    <div className="grid sm:grid-cols-2 gap-3">
                      <label className={`group flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed p-8 transition-all cursor-pointer ${
                        totalImages >= MAX_IMAGES
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
                          disabled={totalImages >= MAX_IMAGES}
                          className="hidden"
                          onChange={(e) => { validateAndSetImages(e.target.files); e.target.value = '' }}
                        />
                      </label>

                      <label className={`group flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed p-8 transition-all cursor-pointer ${
                        totalVideos >= MAX_VIDEOS
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
                          disabled={totalVideos >= MAX_VIDEOS}
                          className="hidden"
                          onChange={(e) => { validateAndSetVideos(e.target.files); e.target.value = '' }}
                        />
                      </label>
                    </div>

                    {/* Existing images */}
                    {existingImages.length > 0 && (
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <Camera className="h-3.5 w-3.5 text-brand-bronze" />
                          <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                            Existing Images ({existingImages.length}/{MAX_IMAGES}) — click to set cover
                          </span>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                          {existingImages.map((img) => {
                            const isThumb = effectiveThumbnailId === img.id && newImages.length === 0
                            return (
                              <div
                                key={img.id}
                                className={`relative aspect-square rounded-2xl overflow-hidden border-2 transition-all duration-200 ${
                                  isThumb
                                    ? 'border-brand-bronze ring-2 ring-brand-bronze/30 shadow-md'
                                    : 'border-neutral-200 hover:border-brand-bronze/40'
                                }`}
                              >
                                <button
                                  type="button"
                                  onClick={() => markExistingRemoved(img.id)}
                                  className="absolute top-1.5 right-1.5 z-10 rounded-full bg-black/60 p-1 text-white hover:bg-black/80 transition-colors"
                                >
                                  <X className="h-3 w-3" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => { setUserSelectedThumbnailId(img.id); setNewThumbnailIndex(-1) }}
                                  className="h-full w-full"
                                >
                                  <img src={resolveMediaUrl(img.media_url)} alt="" className="h-full w-full object-cover" />
                                </button>
                                {isThumb && (
                                  <span className="absolute bottom-1.5 left-1.5 inline-flex items-center gap-1 rounded-full bg-brand-bronze px-2 py-0.5 text-[9px] font-bold text-white">
                                    <Star className="h-2.5 w-2.5 fill-current" /> Cover
                                  </span>
                                )}
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )}

                    {/* New images */}
                    {newImages.length > 0 && (
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <ImagePlus className="h-3.5 w-3.5 text-brand-bronze" />
                          <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                            New Images ({newImages.length}) — click to set cover
                          </span>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                          {newImages.map((img, idx) => (
                            <div
                              key={img.preview}
                              className={`relative aspect-square rounded-2xl overflow-hidden border-2 transition-all duration-200 ${
                                newThumbnailIndex === idx
                                  ? 'border-brand-bronze ring-2 ring-brand-bronze/30 shadow-md'
                                  : 'border-neutral-200 hover:border-brand-bronze/40'
                              }`}
                            >
                              <button
                                type="button"
                                onClick={() => removeNewImageAt(idx)}
                                className="absolute top-1.5 right-1.5 z-10 rounded-full bg-black/60 p-1 text-white hover:bg-black/80 transition-colors"
                              >
                                <X className="h-3 w-3" />
                              </button>
                              <button type="button" onClick={() => setNewThumbnailIndex(idx)} className="h-full w-full">
                                <img src={img.preview} alt="" className="h-full w-full object-cover" />
                              </button>
                              {newThumbnailIndex === idx && (
                                <span className="absolute bottom-1.5 left-1.5 inline-flex items-center gap-1 rounded-full bg-brand-bronze px-2 py-0.5 text-[9px] font-bold text-white">
                                  <Star className="h-2.5 w-2.5 fill-current" /> Cover
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Existing videos */}
                    {existingVideos.length > 0 && (
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <Video className="h-3.5 w-3.5 text-brand-bronze" />
                          <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                            Existing Videos ({existingVideos.length}/{MAX_VIDEOS})
                          </span>
                        </div>
                        <ul className="flex flex-col gap-2">
                          {existingVideos.map((v) => (
                            <li
                              key={v.id}
                              className="flex items-center justify-between gap-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 px-4 py-2.5"
                            >
                              <span className="flex items-center gap-2 text-sm text-neutral-700 truncate">
                                <Video className="h-3.5 w-3.5 shrink-0 text-neutral-400" />
                                {v.media_url.split('/').pop()}
                              </span>
                              <button
                                type="button"
                                onClick={() => markExistingRemoved(v.id)}
                                className="shrink-0 rounded-full p-1 text-neutral-400 hover:bg-neutral-200 hover:text-neutral-700 transition-colors"
                              >
                                <X className="h-3.5 w-3.5" />
                              </button>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* New videos */}
                    {newVideos.length > 0 && (
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <Video className="h-3.5 w-3.5 text-brand-bronze" />
                          <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                            New Videos ({newVideos.length})
                          </span>
                        </div>
                        <ul className="flex flex-col gap-2">
                          {newVideos.map((v, idx) => (
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
                                onClick={() => removeNewVideoAt(idx)}
                                className="shrink-0 rounded-full p-1 text-neutral-400 hover:bg-neutral-200 hover:text-neutral-700 transition-colors"
                              >
                                <X className="h-3.5 w-3.5" />
                              </button>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {totalImages === 0 && totalVideos === 0 && (
                      <div className="rounded-2xl border-2 border-dashed border-neutral-200 p-8 text-center">
                        <p className="text-sm text-neutral-400">No media yet — upload images or videos above.</p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Footer nav */}
              <div className="flex items-center justify-between gap-4 px-7 sm:px-9 py-5 border-t border-neutral-100 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-950/30 rounded-b-3xl">
                <div className="text-xs text-neutral-400">
                  {currentStep < totalSteps ? 'Fill in the details and continue.' : 'Review media and save changes.'}
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
                      Save Changes
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
