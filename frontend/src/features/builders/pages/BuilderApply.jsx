import React from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { toast } from 'sonner'
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  Check,
  CheckCircle2,
  FileText,
  Globe,
  Loader2,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  Upload,
  User,
  X,
  Plus,
  Link as LinkIcon,
} from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { useProfile } from '@/features/auth/hooks/useProfile'
import { useSubmitBuilderApplication } from '@/features/builders/hooks/useBuilder'

const ACCEPTED_TYPES = ['application/pdf', 'image/jpeg', 'image/png']

const steps = [
  { number: 1, title: 'Applicant & Company', description: 'Business identity and public profile.' },
  { number: 2, title: 'Contact & Address', description: 'How RareNest can verify and reach you.' },
  { number: 3, title: 'Verification', description: 'Documents required for review.' },
]

const initialForm = {
  company_name: '',
  company_description: '',
  company_registration_number: '',
  contact_person_name: '',
  business_email: '',
  business_phone: '',
  office_address: '',
  city: '',
  state: '',
  is_primary_contact: false,
  gst_number: '',
  rera_number: '',
  declaration_accepted: false,
  social_links: [],
}

const initialFiles = {
  company_logo: null,
  business_registration_certificate: null,
  applicant_government_id: null,
  gst_certificate: null,
  rera_certificate: null,
}

function Field({ label, required, icon: Icon, error, helper, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300">
        {Icon && <Icon className="h-3.5 w-3.5 text-brand-bronze" />}
        {label}
        {required && <span className="text-red-500">*</span>}
      </label>
      {children}
      {helper && !error && <span className="text-xs text-neutral-500">{helper}</span>}
      {error && <span className="text-xs font-semibold text-destructive">{error}</span>}
    </div>
  )
}

function TextInput({ error, ...props }) {
  return (
    <input
      {...props}
      className={`h-11 w-full rounded-xl border bg-neutral-50/50 px-4 text-sm outline-none transition-all placeholder:text-neutral-400 dark:bg-neutral-950 ${
        error
          ? 'border-destructive ring-1 ring-destructive'
          : 'border-neutral-200 focus:border-brand-bronze/50 focus:ring-1 focus:ring-brand-bronze/20 dark:border-neutral-800'
      }`}
    />
  )
}

function TextArea({ error, ...props }) {
  return (
    <textarea
      {...props}
      className={`min-h-32 w-full resize-none rounded-xl border bg-neutral-50/50 px-4 py-3 text-sm outline-none transition-all placeholder:text-neutral-400 dark:bg-neutral-950 ${
        error
          ? 'border-destructive ring-1 ring-destructive'
          : 'border-neutral-200 focus:border-brand-bronze/50 focus:ring-1 focus:ring-brand-bronze/20 dark:border-neutral-800'
      }`}
    />
  )
}

function FileField({ label, required, file, error, helper, onChange }) {
  return (
    <Field label={label} required={required} icon={FileText} error={error} helper={helper || 'PDF, JPG, JPEG, or PNG up to 5MB.'}>
      <label className={`flex min-h-24 cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed bg-neutral-50/60 px-4 py-5 text-center transition-colors hover:bg-brand-cream/70 dark:bg-neutral-950 ${
        error ? 'border-destructive' : 'border-neutral-250 dark:border-neutral-800'
      }`}>
        <Upload className="h-5 w-5 text-brand-bronze" />
        <span className="text-sm font-semibold text-neutral-800 dark:text-neutral-100">
          {file ? file.name : 'Choose file'}
        </span>
        <span className="text-xs text-neutral-500">
          {file ? `${Math.ceil(file.size / 1024)} KB selected` : 'Click to browse documents'}
        </span>
        <input
          type="file"
          className="hidden"
          accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
          onChange={(event) => onChange(event.target.files?.[0] || null)}
        />
      </label>
    </Field>
  )
}

function isValidFile(file) {
  return !file || ACCEPTED_TYPES.includes(file.type)
}

function isEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

function isUrl(value) {
  if (!value) return true
  try {
    new URL(value.startsWith('http') ? value : `https://${value}`)
    return true
  } catch {
    return false
  }
}

export default function BuilderApply() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { isAuthenticated, user } = useSelector((state) => state.auth)
  const { data: profileRes } = useProfile({ enabled: isAuthenticated })
  const submitMutation = useSubmitBuilderApplication()
  const profile = profileRes?.data

  const [currentStep, setCurrentStep] = React.useState(1)
  const [form, setForm] = React.useState(initialForm)
  const [files, setFiles] = React.useState(initialFiles)
  const [errors, setErrors] = React.useState({})
  const [uploadProgress, setUploadProgress] = React.useState(0)

  const applicantName = `${profile?.first_name || user?.first_name || ''} ${profile?.last_name || user?.last_name || ''}`.trim()
  const applicantEmail = profile?.email || user?.email || ''
  const applicantPhone = profile?.phone || user?.phone || ''

  const updateField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }))
    setErrors((prev) => ({ ...prev, [key]: undefined }))
  }

  const updateFile = (key, file) => {
    setFiles((prev) => ({ ...prev, [key]: file }))
    setErrors((prev) => ({ ...prev, [key]: undefined }))
  }

  const availablePlatforms = ['Website', 'Facebook', 'Instagram', 'YouTube', 'LinkedIn']

  const addSocialLink = () => {
    setForm(prev => ({
      ...prev,
      social_links: [...prev.social_links, { platform: '', url: '' }]
    }))
  }

  const updateSocialLink = (index, field, value) => {
    setForm(prev => {
      const newLinks = [...prev.social_links]
      newLinks[index] = { ...newLinks[index], [field]: value }
      return { ...prev, social_links: newLinks }
    })
    setErrors(prev => ({ ...prev, [`social_link_${index}_${field}`]: undefined }))
  }

  const removeSocialLink = (index) => {
    setForm(prev => {
      const newLinks = [...prev.social_links]
      newLinks.splice(index, 1)
      return { ...prev, social_links: newLinks }
    })
  }
  
  const getAvailablePlatformsForIndex = (currentIndex) => {
    const selectedPlatforms = form.social_links.map(link => link.platform).filter(Boolean)
    return availablePlatforms.filter(p => !selectedPlatforms.includes(p) || form.social_links[currentIndex].platform === p)
  }

  const handlePrimaryContact = (checked) => {
    setForm((prev) => ({
      ...prev,
      is_primary_contact: checked,
      ...(checked
        ? {
            contact_person_name: applicantName,
            business_email: applicantEmail,
            business_phone: applicantPhone,
          }
        : {}),
    }))
  }

function isPhone(value) {
  // basic check: optional +, digits, spaces, hyphens, 10 to 15 chars
  return /^\+?[\d\s-]{10,15}$/.test(value.trim())
}

function isGst(value) {
  // standard India GST format
  return /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(value.toUpperCase().trim())
}

  const validateStep = (step) => {
    const nextErrors = {}
    if (step === 1) {
      if (!form.company_name.trim() || form.company_name.trim().length < 3) nextErrors.company_name = 'Company name must be at least 3 characters.'
      if (!form.company_description.trim() || form.company_description.trim().length < 20) nextErrors.company_description = 'Description must be at least 20 characters.'
      if (!form.company_registration_number.trim() || form.company_registration_number.trim().length < 5) nextErrors.company_registration_number = 'Enter a valid registration number.'
      if (!isValidFile(files.company_logo)) nextErrors.company_logo = 'Company logo must be PDF, JPG, JPEG, or PNG.'
    }
    if (step === 2) {
      if (!form.contact_person_name.trim() || form.contact_person_name.trim().length < 2) nextErrors.contact_person_name = 'Contact person name is required.'
      if (!isEmail(form.business_email.trim())) nextErrors.business_email = 'Enter a valid business email.'
      if (!form.business_phone.trim() || !isPhone(form.business_phone)) nextErrors.business_phone = 'Enter a valid business phone number (10-15 digits).'
      if (!form.office_address.trim() || form.office_address.trim().length < 10) nextErrors.office_address = 'Please enter a complete office address.'
      if (!form.city.trim()) nextErrors.city = 'City is required.'
      if (!form.state.trim()) nextErrors.state = 'State is required.'
      
      form.social_links.forEach((link, idx) => {
        if (link.platform && !link.url.trim()) {
           nextErrors[`social_link_${idx}_url`] = 'URL is required if platform is selected.'
        } else if (link.url.trim() && !link.platform) {
           nextErrors[`social_link_${idx}_platform`] = 'Platform is required if URL is entered.'
        } else if (link.url.trim() && !isUrl(link.url.trim())) {
           nextErrors[`social_link_${idx}_url`] = 'Enter a valid URL.'
        }
      })
    }
    if (step === 3) {
      if (!files.business_registration_certificate) nextErrors.business_registration_certificate = 'Business registration certificate is required.'
      if (!files.applicant_government_id) nextErrors.applicant_government_id = 'Government ID is required.'
      if (form.gst_number.trim() && !isGst(form.gst_number)) nextErrors.gst_number = 'Enter a valid 15-character GST number.'
      if (form.rera_number.trim() && form.rera_number.trim().length < 5) nextErrors.rera_number = 'Enter a valid RERA number.'
      Object.entries(files).forEach(([key, file]) => {
        if (!isValidFile(file)) nextErrors[key] = 'File must be PDF, JPG, JPEG, or PNG.'
      })
      if (!form.declaration_accepted) nextErrors.declaration_accepted = 'Please accept the declaration to submit.'
    }
    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const goNext = () => {
    if (!validateStep(currentStep)) return
    setCurrentStep((step) => Math.min(step + 1, steps.length))
  }

  const goBack = () => setCurrentStep((step) => Math.max(step - 1, 1))

  const returnToCreateListing = () => {
    const returnTo = searchParams.get('returnTo') || '/properties/create'
    const listingType = searchParams.get('listingType') || 'BuilderProject'
    navigate(`${returnTo}?listingType=${encodeURIComponent(listingType)}`)
  }

  const handleSubmit = async () => {
    if (!validateStep(3)) return
    const formData = new FormData()
    Object.entries(form).forEach(([key, value]) => {
      if (key === 'social_links') {
        formData.append(key, JSON.stringify(value))
      } else {
        formData.append(key, value === true ? 'true' : value === false ? 'false' : value)
      }
    })
    Object.entries(files).forEach(([key, file]) => {
      if (file) formData.append(key, file)
    })

    try {
      setUploadProgress(1)
      await submitMutation.mutateAsync({
        formData,
        onUploadProgress: (event) => {
          if (!event.total) return
          setUploadProgress(Math.round((event.loaded * 100) / event.total))
        },
      })
      toast.success('Builder application submitted successfully.')
      returnToCreateListing()
    } catch (err) {
      toast.error(err.message || 'Failed to submit builder application.')
      setUploadProgress(0)
    }
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-brand-warm-white dark:bg-neutral-950">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8">
        <button
          type="button"
          onClick={returnToCreateListing}
          className="inline-flex w-fit items-center gap-2 text-sm font-semibold text-neutral-600 transition-colors hover:text-brand-bronze dark:text-neutral-300"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to listing
        </button>

        <div className="grid gap-8 lg:grid-cols-[320px_1fr]">
          <aside className="h-fit rounded-2xl border border-brand-sand bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-bronze/10 text-brand-bronze">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <h1 className="font-heading text-xl font-bold text-neutral-950 dark:text-white">Builder Verification</h1>
                <p className="text-xs text-neutral-500">Apply to publish Builder Projects.</p>
              </div>
            </div>

            <div className="mt-8 flex flex-col gap-4">
              {steps.map((step) => {
                const isActive = currentStep === step.number
                const isDone = currentStep > step.number
                return (
                  <div key={step.number} className="flex gap-3">
                    <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                      isDone
                        ? 'bg-emerald-600 text-white'
                        : isActive
                          ? 'bg-brand-bronze text-white'
                          : 'bg-neutral-100 text-neutral-500 dark:bg-neutral-800'
                    }`}>
                      {isDone ? <Check className="h-4 w-4" /> : step.number}
                    </div>
                    <div>
                      <p className={`text-sm font-bold ${isActive ? 'text-brand-bronze' : 'text-neutral-850 dark:text-neutral-100'}`}>
                        {step.title}
                      </p>
                      <p className="text-xs leading-5 text-neutral-500">{step.description}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </aside>

          <section className="rounded-2xl border border-brand-sand bg-white p-5 shadow-sm dark:border-neutral-800 dark:bg-neutral-900 sm:p-7">
            {currentStep === 1 && (
              <div className="flex flex-col gap-5">
                <div>
                  <h2 className="font-heading text-2xl font-bold text-neutral-950 dark:text-white">Applicant & Company Information</h2>
                  <p className="mt-1 text-sm text-neutral-500">Tell us about the builder or company you represent.</p>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Company Name" required icon={Building2} error={errors.company_name}>
                    <TextInput value={form.company_name} onChange={(e) => updateField('company_name', e.target.value)} error={errors.company_name} placeholder="e.g. Earth Residence Co." />
                  </Field>
                  <Field label="Company Registration Number" required icon={FileText} error={errors.company_registration_number}>
                    <TextInput value={form.company_registration_number} onChange={(e) => updateField('company_registration_number', e.target.value)} error={errors.company_registration_number} placeholder="Registration or CIN number" />
                  </Field>
                  <div className="sm:col-span-2">
                    <Field label="Company Description" required icon={FileText} error={errors.company_description} helper="Include your build focus, experience, and project credentials.">
                      <TextArea value={form.company_description} onChange={(e) => updateField('company_description', e.target.value)} error={errors.company_description} placeholder="Describe the company and its work..." />
                    </Field>
                  </div>
                  <FileField label="Company Logo" file={files.company_logo} error={errors.company_logo} onChange={(file) => updateFile('company_logo', file)} helper="Optional. JPG, PNG, or PDF." />
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="flex flex-col gap-5">
                <div>
                  <h2 className="font-heading text-2xl font-bold text-neutral-950 dark:text-white">Business Contact & Address</h2>
                  <p className="mt-1 text-sm text-neutral-500">Provide the primary contact details for verification.</p>
                </div>
                <label className="flex items-start gap-3 rounded-xl border border-brand-sand bg-brand-cream/40 p-4 text-sm dark:border-neutral-800 dark:bg-neutral-950">
                  <input
                    type="checkbox"
                    checked={form.is_primary_contact}
                    onChange={(e) => handlePrimaryContact(e.target.checked)}
                    className="mt-1 h-4 w-4 rounded border-neutral-300 accent-brand-bronze"
                  />
                  <span>
                    <span className="block font-semibold text-neutral-850 dark:text-neutral-100">I am the primary contact for this company.</span>
                    <span className="text-xs text-neutral-500">Use your RareNest profile name, email, and phone for the business contact fields.</span>
                  </span>
                </label>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Contact Person Name" required icon={User} error={errors.contact_person_name}>
                    <TextInput value={form.contact_person_name} onChange={(e) => updateField('contact_person_name', e.target.value)} error={errors.contact_person_name} />
                  </Field>
                  <Field label="Business Email" required icon={Mail} error={errors.business_email}>
                    <TextInput value={form.business_email} onChange={(e) => updateField('business_email', e.target.value)} error={errors.business_email} />
                  </Field>
                  <Field label="Business Phone" required icon={Phone} error={errors.business_phone}>
                    <TextInput value={form.business_phone} onChange={(e) => updateField('business_phone', e.target.value)} error={errors.business_phone} />
                  </Field>
                  <Field label="Office Address" required icon={MapPin} error={errors.office_address}>
                    <TextInput value={form.office_address} onChange={(e) => updateField('office_address', e.target.value)} error={errors.office_address} />
                  </Field>
                  <Field label="City" required icon={MapPin} error={errors.city}>
                    <TextInput value={form.city} onChange={(e) => updateField('city', e.target.value)} error={errors.city} />
                  </Field>
                  <Field label="State" required icon={MapPin} error={errors.state}>
                    <TextInput value={form.state} onChange={(e) => updateField('state', e.target.value)} error={errors.state} />
                  </Field>
                </div>

                <div className="mt-4 pt-6 border-t border-brand-sand dark:border-neutral-800">
                  <div className="mb-4">
                    <h3 className="font-heading text-lg font-bold text-neutral-950 dark:text-white flex items-center gap-2">
                      <LinkIcon className="h-4 w-4 text-brand-bronze" />
                      Social Links <span className="text-sm font-normal text-neutral-500">(Optional)</span>
                    </h3>
                    <p className="mt-1 text-sm text-neutral-500">Connect your business profiles to build trust.</p>
                  </div>
                  
                  <div className="flex flex-col gap-3">
                    {form.social_links.map((link, index) => {
                      const available = getAvailablePlatformsForIndex(index)
                      return (
                        <div key={index} className="flex items-start gap-2 sm:gap-3">
                          <div className="w-1/3 sm:w-1/4">
                            <select
                              value={link.platform}
                              onChange={(e) => updateSocialLink(index, 'platform', e.target.value)}
                              className={`h-11 w-full rounded-xl border bg-neutral-50/50 px-3 text-sm outline-none transition-all dark:bg-neutral-950 ${
                                errors[`social_link_${index}_platform`] ? 'border-destructive ring-1 ring-destructive' : 'border-neutral-200 focus:border-brand-bronze/50 focus:ring-1 focus:ring-brand-bronze/20 dark:border-neutral-800'
                              }`}
                            >
                              <option value="">Platform...</option>
                              {available.map(p => (
                                <option key={p} value={p}>{p}</option>
                              ))}
                            </select>
                            {errors[`social_link_${index}_platform`] && <span className="text-[10px] text-destructive mt-1 block">{errors[`social_link_${index}_platform`]}</span>}
                          </div>
                          
                          <div className="flex-1">
                            <TextInput 
                              placeholder="https://"
                              value={link.url}
                              onChange={(e) => updateSocialLink(index, 'url', e.target.value)}
                              error={errors[`social_link_${index}_url`]}
                            />
                            {errors[`social_link_${index}_url`] && <span className="text-[10px] text-destructive mt-1 block">{errors[`social_link_${index}_url`]}</span>}
                          </div>
                          
                          <button
                            type="button"
                            onClick={() => removeSocialLink(index)}
                            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-neutral-200 bg-white text-neutral-500 transition-colors hover:border-destructive hover:text-destructive dark:border-neutral-800 dark:bg-neutral-950 dark:hover:border-destructive"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      )
                    })}
                  </div>

                  {form.social_links.length < availablePlatforms.length && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={addSocialLink}
                      className="mt-4 rounded-xl border-dashed"
                    >
                      <Plus className="mr-1.5 h-4 w-4" />
                      Add Social Link
                    </Button>
                  )}
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="flex flex-col gap-5">
                <div>
                  <h2 className="font-heading text-2xl font-bold text-neutral-950 dark:text-white">Verification Documents</h2>
                  <p className="mt-1 text-sm text-neutral-500">Upload documents that help RareNest verify your builder profile.</p>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <FileField label="Business Registration Certificate" required file={files.business_registration_certificate} error={errors.business_registration_certificate} onChange={(file) => updateFile('business_registration_certificate', file)} />
                  <FileField label="Government ID of Applicant" required file={files.applicant_government_id} error={errors.applicant_government_id} onChange={(file) => updateFile('applicant_government_id', file)} />
                  <Field label="GST Number" error={errors.gst_number} helper="Optional.">
                    <TextInput value={form.gst_number} onChange={(e) => updateField('gst_number', e.target.value)} error={errors.gst_number} />
                  </Field>
                  <FileField label="GST Certificate" file={files.gst_certificate} error={errors.gst_certificate} onChange={(file) => updateFile('gst_certificate', file)} helper="Optional." />
                  <Field label="RERA Number" error={errors.rera_number} helper="Optional.">
                    <TextInput value={form.rera_number} onChange={(e) => updateField('rera_number', e.target.value)} error={errors.rera_number} />
                  </Field>
                  <FileField label="RERA Certificate" file={files.rera_certificate} error={errors.rera_certificate} onChange={(file) => updateFile('rera_certificate', file)} helper="Optional." />
                </div>
                <label className={`flex items-start gap-3 rounded-xl border p-4 text-sm ${
                  errors.declaration_accepted ? 'border-destructive bg-red-50' : 'border-brand-sand bg-brand-cream/40 dark:border-neutral-800 dark:bg-neutral-950'
                }`}>
                  <input
                    type="checkbox"
                    checked={form.declaration_accepted}
                    onChange={(e) => updateField('declaration_accepted', e.target.checked)}
                    className="mt-1 h-4 w-4 rounded border-neutral-300 accent-brand-bronze"
                  />
                  <span>
                    <span className="block font-semibold text-neutral-850 dark:text-neutral-100">I certify that the information provided is accurate.</span>
                    <span className="text-xs text-neutral-500">I understand that RareNest may reject my application if any information is false.</span>
                    {errors.declaration_accepted && <span className="mt-1 block text-xs font-semibold text-destructive">{errors.declaration_accepted}</span>}
                  </span>
                </label>
              </div>
            )}

            {submitMutation.isPending && (
              <div className="mt-6 rounded-xl border border-brand-sand bg-brand-cream/50 p-4 dark:border-neutral-800 dark:bg-neutral-950">
                <div className="flex items-center justify-between text-xs font-semibold text-neutral-650 dark:text-neutral-300">
                  <span>Uploading application</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-white dark:bg-neutral-800">
                  <div className="h-full rounded-full bg-brand-bronze transition-all" style={{ width: `${uploadProgress}%` }} />
                </div>
              </div>
            )}

            <div className="mt-8 flex flex-col-reverse gap-3 border-t border-brand-sand pt-5 sm:flex-row sm:items-center sm:justify-between dark:border-neutral-800">
              <Button type="button" variant="outline" onClick={goBack} disabled={currentStep === 1 || submitMutation.isPending} className="h-11 rounded-xl">
                Previous
              </Button>
              {currentStep < steps.length ? (
                <Button type="button" onClick={goNext} className="h-11 rounded-xl bg-brand-bronze text-white hover:bg-brand-bronze/90">
                  Next
                  <ArrowRight className="h-4 w-4" />
                </Button>
              ) : (
                <Button type="button" onClick={handleSubmit} disabled={submitMutation.isPending} className="h-11 rounded-xl bg-brand-bronze text-white hover:bg-brand-bronze/90">
                  {submitMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                  Submit Application
                </Button>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
