import React from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import {
  Loader2,
  Sparkles,
  ArrowLeft,
  MapPin,
  Save,
} from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import {
  useProperty,
  usePropertyTypes,
  useUpdateProperty,
} from '@/features/properties'
import { SPECIAL_FEATURES } from '@/features/properties/constants/specialFeatures'

const editListingSchema = z.object({
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
  status: z.enum(['Available', 'Pending', 'Sold']),
  is_visible: z.boolean(),
})

export default function EditListing() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { isAuthenticated, user } = useSelector((state) => state.auth)
  
  const { data: propertyRes, isLoading: propertyLoading, isError } = useProperty(id)
  const { data: typesRes, isLoading: typesLoading } = usePropertyTypes()

  const property = propertyRes?.data
  const propertyTypes = typesRes?.data || []

  const { mutateAsync: updateProperty, isPending: isSaving } = useUpdateProperty()

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(editListingSchema),
    defaultValues: {
      title: '',
      property_type_id: '',
      asking_price: 0,
      size_sqft: 0,
      location_city: '',
      location_state: '',
      location_district: '',
      contact_email: '',
      contact_phone: '',
      property_story: '',
      property_age: 0,
      special_features: [],
      status: 'Available',
      is_visible: true,
    },
  })

  // Initialize form when property details are loaded
  React.useEffect(() => {
    if (property) {
      // Ensure only the owner (or Admin) can edit
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
        location_city: property.location_city || '',
        location_state: property.location_state || '',
        location_district: property.location_district || '',
        contact_email: property.contact_email || '',
        contact_phone: property.contact_phone || '',
        property_story: property.property_story || '',
        property_age: property.property_age ?? 0,
        special_features: Array.isArray(property.special_features)
          ? property.special_features
          : [],
        status: property.status || 'Available',
        is_visible: property.is_visible === true || property.is_visible === 1 || property.is_visible === '1',
      })
    }
  }, [property, user, reset, id, navigate])

  const onSubmit = async (data) => {
    try {
      const res = await updateProperty({
        id,
        ...data,
      })
      if (res.success) {
        toast.success('Listing updated successfully!')
        navigate(`/properties/${id}`)
      } else {
        toast.error(res.message || 'Failed to update listing')
      }
    } catch (err) {
      toast.error(err.message || 'Failed to update listing')
    }
  }

  if (propertyLoading || typesLoading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground font-semibold">Loading listing details...</p>
      </div>
    )
  }

  if (isError || !property) {
    return (
      <div className="max-w-md mx-auto py-20 text-center flex flex-col gap-4">
        <h1 className="text-2xl font-extrabold tracking-tight">Listing not found</h1>
        <p className="text-sm text-muted-foreground">The property you are trying to edit does not exist or has been removed.</p>
        <Button onClick={() => navigate('/dashboard')} className="w-fit mx-auto">
          Back to Dashboard
        </Button>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 pb-20 flex flex-col gap-8">
      {/* Header section */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="rounded-full">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <div className="inline-flex items-center gap-1 text-[10px] font-bold text-primary tracking-wider uppercase bg-primary/10 px-2.5 py-0.5 rounded-full w-fit mb-1">
            <Sparkles className="h-3 w-3" /> Control Panel
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight">Edit listing</h1>
          <p className="text-sm text-muted-foreground">
            Update your property story, pricing, location, status, and public visibility.
          </p>
        </div>
      </div>

      {/* Editing Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
        <section className="rounded-2xl border border-border/40 bg-card p-5 sm:p-6 flex flex-col gap-4 shadow-sm">
          <h2 className="font-bold text-lg border-b border-border/40 pb-2 mb-2 text-foreground">Property Details</h2>
          
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold">Property title</label>
            <input
              type="text"
              {...register('title')}
              className="h-10 rounded-lg bg-muted/30 px-3 text-sm border border-border outline-none focus:border-primary/50 transition-colors"
              placeholder="e.g. Himalayan Earthship Retreat"
            />
            {errors.title && <span className="text-[10px] text-destructive">{errors.title.message}</span>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold">Property type</label>
              <select
                {...register('property_type_id')}
                className="h-10 rounded-lg bg-muted/30 px-3 text-sm border border-border outline-none focus:border-primary/50 transition-colors cursor-pointer"
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
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold">Asking price (INR)</label>
              <input
                type="number"
                {...register('asking_price')}
                className="h-10 rounded-lg bg-muted/30 px-3 text-sm border border-border outline-none focus:border-primary/50 transition-colors"
              />
              {errors.asking_price && (
                <span className="text-[10px] text-destructive">{errors.asking_price.message}</span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold">Size (sq ft)</label>
              <input
                type="number"
                {...register('size_sqft')}
                className="h-10 rounded-lg bg-muted/30 px-3 text-sm border border-border outline-none focus:border-primary/50 transition-colors"
              />
              {errors.size_sqft && (
                <span className="text-[10px] text-destructive">{errors.size_sqft.message}</span>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold">Property age (years)</label>
              <input
                type="number"
                min={0}
                max={200}
                {...register('property_age')}
                className="h-10 rounded-lg bg-muted/30 px-3 text-sm border border-border outline-none focus:border-primary/50 transition-colors"
              />
              {errors.property_age && (
                <span className="text-[10px] text-destructive">{errors.property_age.message}</span>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold">Status</label>
              <select
                {...register('status')}
                className="h-10 rounded-lg bg-muted/30 px-3 text-sm border border-border outline-none focus:border-primary/50 transition-colors cursor-pointer font-semibold"
              >
                <option value="Available">Available</option>
                <option value="Pending">Pending</option>
                <option value="Sold">Sold</option>
              </select>
              {errors.status && (
                <span className="text-[10px] text-destructive">{errors.status.message}</span>
              )}
            </div>
          </div>

          <div className="rounded-xl border border-border/40 bg-muted/10 p-4 sm:p-5 flex flex-col gap-4">
            <h3 className="font-semibold text-base flex items-center gap-2 text-foreground">
              <MapPin className="h-4 w-4 text-primary" /> Location
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold">City</label>
                <input
                  type="text"
                  {...register('location_city')}
                  className="h-10 rounded-lg bg-background px-3 text-sm border border-border outline-none focus:border-primary/50 transition-colors"
                />
                {errors.location_city && <span className="text-[10px] text-destructive">{errors.location_city.message}</span>}
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold">State</label>
                <input
                  type="text"
                  {...register('location_state')}
                  className="h-10 rounded-lg bg-background px-3 text-sm border border-border outline-none focus:border-primary/50 transition-colors"
                />
                {errors.location_state && <span className="text-[10px] text-destructive">{errors.location_state.message}</span>}
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold">District</label>
                <input
                  type="text"
                  {...register('location_district')}
                  className="h-10 rounded-lg bg-background px-3 text-sm border border-border outline-none focus:border-primary/50 transition-colors"
                />
                {errors.location_district && (
                  <span className="text-[10px] text-destructive">{errors.location_district.message}</span>
                )}
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-border/40 bg-card p-5 sm:p-6 flex flex-col gap-4 shadow-sm">
          <h2 className="font-bold text-lg border-b border-border/40 pb-2 mb-2 text-foreground">Contact & Story</h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold">Contact email</label>
              <input
                type="email"
                {...register('contact_email')}
                className="h-10 rounded-lg bg-muted/30 px-3 text-sm border border-border outline-none focus:border-primary/50 transition-colors"
              />
              {errors.contact_email && <span className="text-[10px] text-destructive">{errors.contact_email.message}</span>}
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold">Contact phone</label>
              <input
                type="tel"
                {...register('contact_phone')}
                className="h-10 rounded-lg bg-muted/30 px-3 text-sm border border-border outline-none focus:border-primary/50 transition-colors"
              />
              {errors.contact_phone && <span className="text-[10px] text-destructive">{errors.contact_phone.message}</span>}
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold">Property story</label>
            <textarea
              {...register('property_story')}
              rows={5}
              className="rounded-lg bg-muted/30 px-3 py-2 text-sm border border-border resize-y outline-none focus:border-primary/50 transition-colors"
              placeholder="Describe what makes this property unique..."
            />
            {errors.property_story && <span className="text-[10px] text-destructive">{errors.property_story.message}</span>}
          </div>

          <div className="rounded-xl border border-border/40 bg-muted/10 p-4 sm:p-5 flex flex-col gap-4">
            <h3 className="font-semibold text-base text-foreground">Special features</h3>
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
                          onChange={(e) => {
                            const next = e.target.checked
                              ? [...(field.value || []), feature]
                              : (field.value || []).filter((f) => f !== feature)
                            field.onChange(next)
                          }}
                          className="rounded border-border text-primary focus:ring-primary"
                        />
                        {feature}
                      </label>
                    )
                  })}
                </div>
              )}
            />
          </div>

          <div className="rounded-xl border border-border/40 bg-muted/10 p-4 sm:p-5 flex items-center justify-between gap-4">
            <div className="flex flex-col gap-1">
              <h3 className="font-semibold text-sm sm:text-base text-foreground">Visible to Public</h3>
              <p className="text-xs text-muted-foreground">If hidden, this listing will not appear in the search catalog or feeds.</p>
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
                  className={`relative inline-flex h-6 w-11 shrink-0 rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                    field.value ? 'bg-primary' : 'bg-muted'
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
        </section>

        {/* Buttons footer */}
        <div className="flex items-center justify-end gap-3 mt-4">
          <Button type="button" variant="outline" onClick={() => navigate(-1)} disabled={isSaving}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSaving} className="gap-2">
            {isSaving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            Save Changes
          </Button>
        </div>
      </form>
    </div>
  )
}
