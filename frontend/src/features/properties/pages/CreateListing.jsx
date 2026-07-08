import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
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
  Building2,
  Bed,
  Bath,
  Trash2,
} from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { usePropertyTypes } from '@/features/properties'
import { useBuilderByUser, useMyBuilderApplication, useSubmitBuilderApplication } from '@/features/builders'
import { useProfile } from '@/features/auth/hooks/useProfile'
import {
  
  MAX_IMAGES,
  MAX_VIDEOS,
  MAX_IMAGE_BYTES,
  MAX_VIDEO_BYTES,
} from '@/features/properties/constants/specialFeatures'
import PropertyFeaturesFormSection from '../components/PropertyFeaturesFormSection'
import { useDraftPersistence } from '../hooks/useDraftPersistence'
import * as draftService from '../services/propertyDraftService'

const listingSchema = z.object({
  title: z.string().min(2).max(255),
  property_type_id: z.string().uuid('Select a property type'),
  asking_price: z.preprocess((v) => Number(v), z.number().positive()),
  size_sqft: z.preprocess((v) => Number(v), z.number().positive()),
  city: z.string().max(100).optional().or(z.literal('')),
  state: z.string().min(1, 'State is required').max(100),
  district: z.string().min(1, 'District is required').max(100),
  area: z.string().min(2).max(30),
  pincode: z.string().min(6).max(10),
  contact_email: z.string().email(),
  contact_phone: z.string().min(8).max(20),
  property_story: z.string().min(10),
  property_age: z.preprocess((v) => Number(v), z.number().int().min(0).max(200)),
  beds: z.preprocess((v) => (v === '' || v === undefined || v === null ? null : Number(v)), z.number().int().nonnegative().nullable().optional()),
  baths: z.preprocess((v) => (v === '' || v === undefined || v === null ? null : Number(v)), z.number().int().nonnegative().nullable().optional()),
  special_features: z.array(z.string()).optional(),
  selectedFeatureIds: z.array(z.string()).min(1, 'Please select at least one feature'),
  images: z.number().min(1, 'Please upload at least one property image.'),
  listing_type: z.enum(['Individual', 'BuilderProject']).default('Individual'),
})

const STEP_CONFIG = [
  {
    number: 1,
    label: 'Type',
    title: 'Listing Type',
    description: 'Choose between an individual sale or builder project.',
    fields: ['listing_type'],
  },
  {
    number: 2,
    label: 'Basics',
    title: 'Property Basics',
    description: 'Title, type, price, size, age and location.',
    fields: [
      'title', 'property_type_id', 'asking_price',
      'size_sqft', 'property_age', 'beds', 'baths', 'city',
      'state', 'district', 'area', 'pincode',
    ],
  },
  {
    number: 3,
    label: 'Details',
    title: 'Story & Contact',
    description: 'How buyers reach you and what makes this place rare.',
    fields: ['contact_email', 'contact_phone', 'property_story', 'selectedFeatureIds'],
  },
  {
    number: 4,
    label: 'Media',
    title: 'Photos & Videos',
    description: 'Show the world what makes your property unique.',
    fields: [],
  },
]

function FieldLabel({ icon: Icon, children, required = false }) {
  return (
    <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider flex items-center gap-1.5">
      {Icon && <Icon className="h-3.5 w-3.5 text-brand-bronze" />}
      <span>{children}</span>
      {required && (
        <span className="text-red-500 text-sm leading-none">*</span>
      )}
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

export default function CreateListing() {
  const navigate = useNavigate()
  const { isAuthenticated, user } = useSelector((state) => state.auth)
  const { data: typesRes, isLoading: typesLoading } = usePropertyTypes()
  const propertyTypes = typesRes?.data || []

  // Builder status queries
  const { data: builderRes, isLoading: builderLoading } = useBuilderByUser(user?.id, { enabled: !!user?.id })
  const { data: appRes, isLoading: appLoading, refetch: refetchApp } = useMyBuilderApplication({ enabled: !!user?.id })
  const { mutateAsync: submitApplication, isPending: submittingApp } = useSubmitBuilderApplication()

  const builderProfile = builderRes?.data
  const builderApp = appRes?.data

  // Fetch logged in user's profile details
  const { data: profileRes } = useProfile({ enabled: isAuthenticated })
  const profile = profileRes?.data

  const [images, setImages] = React.useState([])
  const [videos, setVideos] = React.useState([])
  const [uploadedDraftMedia, setUploadedDraftMedia] = React.useState([])
  const [thumbnailIndex, setThumbnailIndex] = React.useState(0)
  const [currentStep, setCurrentStep] = React.useState(1)
  const imagesRef = React.useRef([])
  const [isPublishing, setIsPublishing] = React.useState(false)
  const [isUploadingDraftMedia, setIsUploadingDraftMedia] = React.useState(false)
  const [showDraftModal, setShowDraftModal] = React.useState(false)
  const [showConfirmDelete, setShowConfirmDelete] = React.useState(false)
  const [pendingDraft, setPendingDraft] = React.useState(null)

  const {
    register,
    handleSubmit,
    control,
    trigger,
    setValue,
    getValues,
    reset,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(listingSchema),
    defaultValues: { selectedFeatureIds: [], listing_type: 'Individual', state: '', district: '', city: '', images: 0, beds: '', baths: '' },
  })

  const stateVal = watch('state')
  const districtVal = watch('district')

  const listingType = watch('listing_type')

  const restoreDraft = React.useCallback((draftData, step) => {
    reset({
      selectedFeatureIds: [],
      listing_type: 'Individual',
      state: '',
      district: '',
      city: '',
      images: 0,
      beds: '',
      baths: '',
      ...draftData,
    })
    if (step) setCurrentStep(Math.max(1, Math.min(step, STEP_CONFIG.length)))
  }, [reset])

  const handleDraftFound = React.useCallback((draftInfo, applyFn) => {
    // If user hasn't clicked Continue yet (no backend draft exists), restore automatically
    if (!draftInfo.draftId) {
      applyFn(draftInfo)
      return
    }
    setPendingDraft({ info: draftInfo, apply: applyFn })
    setShowDraftModal(true)
  }, [])

  const draft = useDraftPersistence({
    draftType: 'Create',
    currentStep,
    getDraftData: getValues,
    restoreDraft,
    onDraftFound: handleDraftFound,
    enabled: isAuthenticated,
  })

  const handleContinueDraft = () => {
    if (pendingDraft) {
      pendingDraft.apply(pendingDraft.info)
    }
    setShowDraftModal(false)
    setShowConfirmDelete(false)
    setPendingDraft(null)
  }

  const handleStartNewClick = () => {
    setShowConfirmDelete(true)
  }

  const handleConfirmDelete = async () => {
    const draftIdToDelete = pendingDraft?.info?.draftId
    await draft.clearDraft(draftIdToDelete)
    setShowConfirmDelete(false)
    setShowDraftModal(false)
    setPendingDraft(null)
  }

  React.useEffect(() => {
    setUploadedDraftMedia(draft.draftMedia || [])
    const uploadedImages = (draft.draftMedia || []).filter((m) => m.media_type === 'Image').length
    setValue('images', uploadedImages + images.length, { shouldValidate: uploadedImages > 0 })
  }, [draft.draftMedia, images.length, setValue])

  React.useEffect(() => {
    const subscription = watch((value, { type }) => {
      if (type) draft.scheduleLocalSave()
    })
    return () => subscription.unsubscribe()
  }, [draft, watch])

  React.useEffect(() => {
    if (!isAuthenticated) navigate('/login', { replace: true })
  }, [isAuthenticated, navigate])

  // Automatically pre-fill contact_email and contact_phone with logged-in user details
  const hasSetDefaults = React.useRef(false)
  React.useEffect(() => {
    if (hasSetDefaults.current) return

    if (user?.email) {
      setValue('contact_email', user.email)
    }

    if (isAuthenticated) {
      if (profileRes) {
        if (profile?.phone) {
          setValue('contact_phone', profile.phone)
        }
        hasSetDefaults.current = true
      }
    } else {
      hasSetDefaults.current = true
    }
  }, [user, profileRes, profile, setValue, isAuthenticated])

  const ensureDraft = async () => {
    const saved = await draft.syncBackend(currentStep)
    return saved?.id || draft.draftId
  }

  const uploadDraftFiles = async ({ imageFiles = [], videoFiles = [], thumbIndex = thumbnailIndex }) => {
    if (!imageFiles.length && !videoFiles.length) return []
    const draftId = await ensureDraft()
    if (!draftId) throw new Error('Unable to save draft before uploading media')
    const formData = new FormData()
    imageFiles.forEach((file) => formData.append('images', file))
    videoFiles.forEach((file) => formData.append('videos', file))
    formData.append('thumbnail_index', String(thumbIndex))
    setIsUploadingDraftMedia(true)
    try {
      const res = await draftService.uploadPropertyDraftMedia(draftId, formData)
      if (!res.success) throw new Error(res.message || 'Media upload failed')
      setUploadedDraftMedia((prev) => {
        const next = [...prev, ...(res.data || [])]
        draft.setDraftMedia(next)
        setValue('images', next.filter((m) => m.media_type === 'Image').length, { shouldValidate: true })
        return next
      })
      return res.data || []
    } finally {
      setIsUploadingDraftMedia(false)
    }
  }

  const validateAndSetImages = async (fileList) => {
    const files = Array.from(fileList)
    if (!files.length) return
    const uploadedImages = uploadedDraftMedia.filter((m) => m.media_type === 'Image').length
    if (uploadedImages + images.length + files.length > MAX_IMAGES) { toast.error(`Maximum ${MAX_IMAGES} images allowed`); return }
    for (const f of files) {
      if (f.size > MAX_IMAGE_BYTES) { toast.error(`"${f.name}" exceeds 5MB`); return }
      if (!f.type.startsWith('image/')) { toast.error(`"${f.name}" is not an image`); return }
    }
    const previews = files.map((file) => ({ file, preview: URL.createObjectURL(file) }))
    setImages((prev) => {
      const next = [...prev, ...previews]
      setValue('images', next.length, { shouldValidate: true })
      return next
    })
    if (images.length === 0) setThumbnailIndex(0)
    try {
      await uploadDraftFiles({ imageFiles: files, thumbIndex: images.length === 0 ? 0 : thumbnailIndex })
      toast.success('Media uploaded to your draft.')
    } catch (err) {
      toast.error(err.message || 'Media upload failed. It is still available until you leave this page.')
    }
  }

  const validateAndSetVideos = async (fileList) => {
    const files = Array.from(fileList)
    if (!files.length) return
    const uploadedVideos = uploadedDraftMedia.filter((m) => m.media_type === 'Video').length
    if (uploadedVideos + videos.length + files.length > MAX_VIDEOS) { toast.error(`Maximum ${MAX_VIDEOS} videos allowed`); return }
    for (const f of files) {
      if (f.size > MAX_VIDEO_BYTES) { toast.error(`"${f.name}" exceeds 50MB`); return }
      if (!f.type.startsWith('video/')) { toast.error(`"${f.name}" is not a video`); return }
    }
    setVideos((prev) => [...prev, ...files.map((file) => ({ file, name: file.name }))])
    try {
      await uploadDraftFiles({ videoFiles: files })
      toast.success('Media uploaded to your draft.')
    } catch (err) {
      toast.error(err.message || 'Media upload failed. It is still available until you leave this page.')
    }
  }

  const removeImageAt = (i) => {
    setImages((prev) => {
      const next = prev.filter((_, idx) => idx !== i)
      const t = prev[i]; if (t?.preview) URL.revokeObjectURL(t.preview)
      setValue('images', next.length, { shouldValidate: true })
      return next
    })
    setThumbnailIndex((prev) => i === prev ? 0 : i < prev ? prev - 1 : prev)
  }

  const removeVideoAt = (i) => setVideos((prev) => prev.filter((_, idx) => idx !== i))

  React.useEffect(() => { imagesRef.current = images }, [images])
  React.useEffect(() => {
    return () => { imagesRef.current.forEach((img) => { if (img.preview) URL.revokeObjectURL(img.preview) }) }
  }, [])

  const onSubmit = async () => {
    setIsPublishing(true)
    try {
      if (isUploadingDraftMedia) {
        toast.error('Please wait for media upload to finish.')
        return
      }
      const uploadedImages = uploadedDraftMedia.filter((m) => m.media_type === 'Image').length
      if (uploadedImages < 1) {
        toast.error('Please upload at least one image before publishing.')
        return
      }
      const saved = await draft.syncBackend(currentStep)
      const draftId = saved?.id || draft.draftId
      if (!draftId) throw new Error('Unable to save draft before publishing')
      const res = await draftService.publishCreateDraft(draftId)
      if (!res.success) { toast.error(res.message || 'Failed to publish listing'); return }
      await draft.clearDraft()
      toast.success('Listing submitted! Pending admin verification.')
      navigate(`/properties/${res.data.id}`)
    } catch (err) {
      toast.error(err.message || 'Failed to create listing')
    } finally {
      setIsPublishing(false)
    }
  }

  const isSubmitting = isPublishing || isUploadingDraftMedia
  const totalSteps = STEP_CONFIG.length
  const activeStep = STEP_CONFIG[currentStep - 1]

  const goToNextStep = async () => {
    const fields = activeStep?.fields || []
    if (fields.length && !(await trigger(fields))) return

    if (currentStep === 1 && listingType === 'BuilderProject') {
      if (!builderProfile || builderProfile.builder_status !== 'Approved') {
        toast.error('You need an approved builder profile to continue with a Builder Project listing.')
        return
      }
    }

    const nextStep = Math.min(currentStep + 1, totalSteps)
    setCurrentStep(nextStep)
    try { await draft.syncBackend(nextStep) } catch { /* local draft is already saved */ }
  }

  const goToPreviousStep = () => setCurrentStep((p) => Math.max(p - 1, 1))

  const handleFormSubmit = async (e) => {
    e.preventDefault()
    if (currentStep < totalSteps) { await goToNextStep(); return }
  }

  return (
    <div className="min-h-screen bg-brand-cream/30">
      {showDraftModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-neutral-950/40 backdrop-blur-md p-4 animate-in fade-in duration-300">
          <div className="bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl rounded-[2rem] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.15)] max-w-[400px] w-full p-8 border border-white/50 dark:border-neutral-800/50 animate-in zoom-in-95 slide-in-from-bottom-4 duration-500 overflow-hidden relative">
            {/* Decorative background glow */}
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-brand-bronze/20 rounded-full blur-[3rem] pointer-events-none" />
            <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-brand-forest/10 rounded-full blur-[3rem] pointer-events-none" />
            
            <div className="relative z-10 flex flex-col items-center text-center">
              {!showConfirmDelete ? (
                <>
                  <div className="h-16 w-16 rounded-2xl bg-brand-bronze/10 flex items-center justify-center mb-6 shadow-sm border border-brand-bronze/20">
                    <FileText className="h-8 w-8 text-brand-bronze" strokeWidth={1.5} />
                  </div>
                  <h3 className="font-serif text-2xl font-bold text-neutral-950 dark:text-white mb-3">Saved Draft Found</h3>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-8 leading-relaxed max-w-[280px]">
                    We noticed you were working on a property listing. Would you like to pick up where you left off?
                  </p>
                  
                  <div className="flex flex-col gap-3 w-full">
                    <Button 
                      onClick={handleContinueDraft} 
                      className="w-full bg-brand-bronze hover:bg-brand-bronze/90 text-white font-bold h-12 rounded-2xl shadow-[0_8px_16px_-4px_rgba(212,163,115,0.4)] transition-all hover:-translate-y-0.5"
                    >
                      Continue Draft
                    </Button>
                    <Button 
                      onClick={handleStartNewClick} 
                      variant="outline" 
                      className="w-full font-bold h-12 rounded-2xl border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
                    >
                      Start New Listing
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <div className="h-16 w-16 rounded-2xl bg-red-500/10 flex items-center justify-center mb-6 shadow-sm border border-red-500/20">
                    <Trash2 className="h-8 w-8 text-red-500" strokeWidth={1.5} />
                  </div>
                  <h3 className="font-serif text-2xl font-bold text-neutral-950 dark:text-white mb-3">Delete Draft?</h3>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-8 leading-relaxed max-w-[280px]">
                    Are you sure you want to start a new listing? Your previous draft will be permanently deleted.
                  </p>
                  
                  <div className="flex flex-col gap-3 w-full">
                    <Button 
                      onClick={handleConfirmDelete} 
                      className="w-full bg-red-600 hover:bg-red-700 text-white font-bold h-12 rounded-2xl shadow-[0_8px_16px_-4px_rgba(220,38,38,0.4)] transition-all hover:-translate-y-0.5"
                    >
                      Yes, Delete & Start New
                    </Button>
                    <Button 
                      onClick={() => setShowConfirmDelete(false)} 
                      variant="outline" 
                      className="w-full font-bold h-12 rounded-2xl border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
                    >
                      Go Back
                    </Button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

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

                {/* ─── STEP 1: Listing Type ─── */}
                {currentStep === 1 && (
                  <div className="flex flex-col gap-6">
                    <Controller
                      name="listing_type"
                      control={control}
                      render={({ field }) => (
                        <div className="grid sm:grid-cols-2 gap-4">
                          <button
                            type="button"
                            onClick={() => {
                              field.onChange('Individual')
                            }}
                            className={`flex flex-col items-start gap-4 rounded-2xl border p-6 text-left transition-all duration-200 ${
                              field.value === 'Individual'
                                ? 'border-brand-bronze bg-brand-bronze/5 dark:bg-brand-bronze/10 ring-2 ring-brand-bronze/20'
                                : 'border-neutral-200 dark:border-neutral-800 hover:border-brand-bronze/30 hover:bg-brand-bronze/5'
                            }`}
                          >
                            <div className="h-10 w-10 rounded-xl bg-brand-forest/10 flex items-center justify-center">
                              <Tag className="h-5 w-5 text-brand-forest" />
                            </div>
                            <div>
                              <h3 className="font-bold text-neutral-900 dark:text-neutral-100">Individual Listing</h3>
                              <p className="text-xs text-neutral-500 mt-1">
                                Perfect for listing a single property, plot, or home. Open to all registered users.
                              </p>
                            </div>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              field.onChange('BuilderProject')
                            }}
                            className={`flex flex-col items-start gap-4 rounded-2xl border p-6 text-left transition-all duration-200 ${
                              field.value === 'BuilderProject'
                                ? 'border-brand-bronze bg-brand-bronze/5 dark:bg-brand-bronze/10 ring-2 ring-brand-bronze/20'
                                : 'border-neutral-200 dark:border-neutral-800 hover:border-brand-bronze/30 hover:bg-brand-bronze/5'
                            }`}
                          >
                            <div className="h-10 w-10 rounded-xl bg-brand-forest/10 flex items-center justify-center">
                              <Building2 className="h-5 w-5 text-brand-forest" />
                            </div>
                            <div>
                              <h3 className="font-bold text-neutral-900 dark:text-neutral-100">Builder Project</h3>
                              <p className="text-xs text-neutral-500 mt-1">
                                For developers and builders listing large projects, residential complexes, or societies. Requires builder approval.
                              </p>
                            </div>
                          </button>
                        </div>
                      )}
                    />

                    {/* Builder Approval Status / Form for BuilderProject selection */}
                    {listingType === 'BuilderProject' && (
                      <div className="mt-4 p-6 rounded-2xl border border-neutral-100 dark:border-neutral-805 bg-neutral-50/50 dark:bg-neutral-900/30">
                        {builderLoading || appLoading ? (
                          <div className="flex justify-center py-6">
                            <Loader2 className="h-6 w-6 animate-spin text-brand-bronze" />
                          </div>
                        ) : builderProfile?.builder_status === 'Approved' ? (
                          <div className="flex items-center gap-3 text-emerald-650 bg-emerald-50 dark:bg-emerald-950/20 p-4 rounded-xl border border-emerald-100 dark:border-emerald-900/30">
                            <Check className="h-5 w-5 shrink-0" />
                            <div>
                              <p className="text-sm font-semibold">Builder Profile Approved</p>
                              <p className="text-xs text-neutral-500 mt-0.5">
                                You can list this property under your builder profile: <strong>{builderProfile.company_name}</strong>.
                              </p>
                            </div>
                          </div>
                        ) : builderApp?.status === 'Pending' ? (
                          <div className="flex items-start gap-3 text-amber-600 bg-amber-50 dark:bg-amber-950/20 p-4 rounded-xl border border-amber-100 dark:border-amber-900/30">
                            <Clock className="h-5 w-5 shrink-0 mt-0.5 animate-pulse" />
                            <div>
                              <p className="text-sm font-semibold">Application Pending Review</p>
                              <p className="text-xs text-neutral-550 mt-0.5 leading-relaxed">
                                Your application to register as a builder is currently being reviewed by our administrators.
                                You will be able to post Builder Projects as soon as it is approved.
                              </p>
                            </div>
                          </div>
                        ) : builderApp?.status === 'Rejected' ? (
                          <div className="flex flex-col gap-4 text-red-650 bg-red-50 dark:bg-red-950/20 p-4 rounded-xl border border-red-100 dark:border-red-900/30">
                            <div className="flex items-start gap-3">
                              <X className="h-5 w-5 shrink-0 mt-0.5" />
                              <div>
                                <p className="text-sm font-semibold">Application Rejected</p>
                                <p className="text-xs text-neutral-550 mt-0.5 leading-relaxed">
                                  Your previous builder application was rejected. You can submit a new application below with updated information.
                                </p>
                              </div>
                            </div>
                            <hr className="border-red-100 dark:border-red-900/30" />
                            <div>
                              <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-750 dark:text-neutral-300 mb-2">Reapply as Builder</h4>
                              <Button
                                type="button"
                                onClick={() => navigate('/builders/apply?returnTo=/properties/create&listingType=BuilderProject')}
                                className="w-fit bg-brand-bronze hover:bg-brand-bronze/90 text-white font-bold h-10 rounded-xl"
                              >
                                Apply for Builder Verification
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex flex-col gap-4">
                            <div className="flex items-start gap-3 text-amber-600 bg-amber-50 dark:bg-amber-950/20 p-4 rounded-xl border border-amber-100 dark:border-amber-900/30">
                              
                              <div>
                                <p className="text-sm font-semibold">Builder Approval Required</p>
                                <p className="text-xs text-neutral-550 mt-0.5 leading-relaxed mb-4">
                                  To publish Builder Projects, your builder profile must first be verified.
                                </p>
                                <Button
                                  type="button"
                                  onClick={() => navigate('/builders/apply?returnTo=/properties/create&listingType=BuilderProject')}
                                  className="w-fit bg-brand-bronze hover:bg-brand-bronze/90 text-white font-bold h-10 rounded-xl"
                                >
                                  Apply for Builder Verification
                                </Button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* ─── STEP 2: Basics ─── */}
                {currentStep === 2 && (
                  <div className="flex flex-col gap-6">
                    {/* Title */}
                    <div className="flex flex-col gap-2">
                      <FieldLabel icon={Tag} required>Property Title</FieldLabel>
                      <FieldInput
                        type="text"
                        {...register('title')}
                        placeholder="e.g. Himalayan Earthship Retreat"
                        error={errors.title}
                      />
                      <FieldError message={errors.title?.message} />
                    </div>

                    {/* Type + Price */}
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="flex flex-col gap-2">
                        <FieldLabel icon={Tag} required>Property Type</FieldLabel>
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
                        {!typesLoading && !propertyTypes.length && (
                          <span className="text-[10px] text-neutral-400">No types available — ask admin.</span>
                        )}
                      </div>
                      <div className="flex flex-col gap-2">
                        <FieldLabel icon={IndianRupee} required>Asking Price (INR)</FieldLabel>
                        <FieldInput
                          type="number"
                          {...register('asking_price')}
                          placeholder="e.g. 4500000"
                          error={errors.asking_price}
                        />
                        <FieldError message={errors.asking_price?.message} />
                      </div>
                    </div>

                    {/* Size + Age */}
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="flex flex-col gap-2">
                        <FieldLabel icon={Maximize2} required>Size (sq ft)</FieldLabel>
                        <FieldInput
                          type="number"
                          {...register('size_sqft')}
                          placeholder="e.g. 1200"
                          error={errors.size_sqft}
                        />
                        <FieldError message={errors.size_sqft?.message} />
                      </div>
                      <div className="flex flex-col gap-2">
                        <FieldLabel icon={Clock} required>Property Age (years)</FieldLabel>
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
                    </div>

                    {/* Beds + Baths */}
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="flex flex-col gap-2">
                        <FieldLabel icon={Bed}>Beds</FieldLabel>
                        <FieldInput
                          type="number"
                          min={0}
                          max={100}
                          {...register('beds')}
                          placeholder="e.g. 3"
                          error={errors.beds}
                        />
                        <FieldError message={errors.beds?.message} />
                      </div>
                      <div className="flex flex-col gap-2">
                        <FieldLabel icon={Bath}>Baths</FieldLabel>
                        <FieldInput
                          type="number"
                          min={0}
                          max={100}
                          {...register('baths')}
                          placeholder="e.g. 2"
                          error={errors.baths}
                        />
                        <FieldError message={errors.baths?.message} />
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
                          <FieldLabel required>District</FieldLabel>
                          <Controller
                            name="district"
                            control={control}
                            render={({ field: { onChange, value } }) => (
                              <LocationSelect
                                key={`district-${stateVal}`}
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
                          <FieldLabel required>City</FieldLabel>
                          <Controller
                            name="city"
                            control={control}
                            render={({ field: { onChange, value } }) => (
                              <LocationSelect
                                key={`city-${stateVal}-${districtVal}`}
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
                          <FieldLabel required>Area</FieldLabel>
                          <FieldInput
                            type="text"
                            {...register('area')}
                            placeholder="e.g. Tapovan"
                            error={errors.area}
                          />
                          <FieldError message={errors.area?.message} />
                        </div>
                        <div className="flex flex-col gap-2">
                          <FieldLabel required>Pincode</FieldLabel>
                          <FieldInput
                            type="text"
                            {...register('pincode')}
                            placeholder="e.g. 249192"
                            error={errors.pincode}
                          />
                          <FieldError message={errors.pincode?.message} />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* ─── STEP 3: Details ─── */}
                {currentStep === 3 && (
                  <div className="flex flex-col gap-6">
                    {/* Contact */}
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="flex flex-col gap-2">
                        <FieldLabel icon={Mail} required>Contact Email</FieldLabel>
                        <FieldInput
                          type="email"
                          {...register('contact_email')}
                          placeholder="seller@example.com"
                          error={errors.contact_email}
                        />
                        <FieldError message={errors.contact_email?.message} />
                      </div>
                      <div className="flex flex-col gap-2">
                        <FieldLabel icon={Phone} required>Contact Phone</FieldLabel>
                        <FieldInput
                          type="tel"
                          {...register('contact_phone')}
                          placeholder="+91 98765 43210"
                          error={errors.contact_phone}
                        />
                        <FieldError message={errors.contact_phone?.message} />
                      </div>
                    </div>

                    {/* Story */}
                    <div className="flex flex-col gap-2">
                      <FieldLabel icon={FileText} required>Property Story</FieldLabel>
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

                    {/* Property Features */}
                    <div className="flex flex-col gap-3">
                      <FieldLabel icon={Sparkles} required>Property Features</FieldLabel>
                      <Controller
                        name="selectedFeatureIds"
                        control={control}
                        render={({ field }) => (
                          <PropertyFeaturesFormSection
                            selectedFeatureIds={field.value || []}
                            onChange={field.onChange}
                          />
                        )}
                      />
                      <FieldError message={errors.selectedFeatureIds?.message} />
                    </div>
                  </div>
                )}

                {/* ─── STEP 4: Media ─── */}
                {currentStep === 4 && (
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
                    {errors.images?.message && (
                      <div className="mt-2 text-sm text-destructive font-semibold">{errors.images.message}</div>
                    )}

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
                      Publish Listing
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
