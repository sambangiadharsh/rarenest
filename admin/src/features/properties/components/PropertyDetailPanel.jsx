import { useState } from 'react'
import {
  Car,
  Check,
  ChevronLeft,
  ChevronRight,
  Droplets,
  Loader2,
  MapPin,
  Shield,
  Play,
  Sun,
  Trees,
  Wifi,
  X,
  Zap,
} from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/shared/components/ui/button'
import { Skeleton } from '@/shared/components/ui/skeleton'
import { useProperty } from '@/features/properties/hooks/useProperty'
import { useVerifyProperty } from '@/features/properties/hooks/useProperties'
import StatusBadge from './StatusBadge'
import VerificationBadge from './VerificationBadge'
import {
  formatINR,
  formatPropertyAge,
  getPropertyImages,
  getPropertyMediaItems,
  getPropertyThumbnail,
  getSellerName,
  getVerificationStatus,
  parseSpecialFeatures,
  PLACEHOLDER_IMAGE,
} from '../lib/propertyUtils'

const AMENITY_ICONS = {
  'Solar Power': Sun,
  'Rainwater Harvesting': Droplets,
  'Private Parking': Car,
  '24x7 Security': Shield,
  'Smart Home': Wifi,
  'Garden / Outdoor Space': Trees,
  'Power Backup': Zap,
}

function formatDate(value) {
  if (!value) return '—'
  return new Date(value).toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

function DetailField({ label, value }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-0.5 text-sm font-medium text-foreground">{value || '—'}</p>
    </div>
  )
}

const VERIFICATION_OPTIONS = [
  { value: 'Approved', label: 'Approve' },
  { value: 'Rejected', label: 'Reject' },
  { value: 'RequestChanges', label: 'Request Changes' },
]

export default function PropertyDetailPanel({ propertyId, onClose }) {
  const [activeTab, setActiveTab] = useState('property-info')
  const [activeMedia, setActiveMedia] = useState(0)
  // tracks the last propertyId we have reset state for
  const [resetForId, setResetForId] = useState(propertyId)
  // user-selected status override; '' means "use whatever the property currently has"
  const [selectedStatus, setSelectedStatus] = useState('')
  const [reason, setReason] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  // React-recommended "adjusting state during render" pattern to reset on prop change
  if (propertyId !== resetForId) {
    setResetForId(propertyId)
    setActiveMedia(0)
    setActiveTab('property-info')
    setReason('')
    setSelectedStatus('')
  }

  const { data, isLoading, isError, error } = useProperty(propertyId, {
    enabled: Boolean(propertyId),
  })
  const { mutateAsync: verifyProperty } = useVerifyProperty()

  const property = data?.data
  const mediaItems = property ? getPropertyMediaItems(property) : []
  const images = property ? getPropertyImages(property) : []
  const mediaCount = Math.max(mediaItems.length, 1)
  const heroImage =
    images[0] || (property ? getPropertyThumbnail(property) : PLACEHOLDER_IMAGE)
  const displayMedia =
    mediaItems[activeMedia] || { type: 'Image', src: heroImage }

  const features = parseSpecialFeatures(property?.special_features)
  const ageLabel =
    property?.property_age != null && property.property_age !== ''
      ? formatPropertyAge(property.property_age)
      : null

  const verificationStatus = property ? getVerificationStatus(property) : 'Pending'
  const enquiryCount = property?.enquiry_count ?? property?.enquiries?.length ?? 0

  // Derive effective status: user pick → current property status → nothing
  const effectiveStatus = selectedStatus || property?.verification_status || ''

  const goPrev = () => setActiveMedia((i) => (i <= 0 ? mediaCount - 1 : i - 1))
  const goNext = () => setActiveMedia((i) => (i >= mediaCount - 1 ? 0 : i + 1))

  const handleSave = async () => {
    if (!propertyId || !effectiveStatus) return
    if ((effectiveStatus === 'Rejected' || effectiveStatus === 'RequestChanges') && !reason.trim()) {
      toast.error('Please provide a reason for this status.')
      return
    }
    setIsSaving(true)
    try {
      const res = await verifyProperty({ id: propertyId, status: effectiveStatus, reason: reason.trim() || null })
      if (!res?.success) {
        toast.error(res?.message || 'Failed to update verification status.')
        return
      }
      const label = VERIFICATION_OPTIONS.find((o) => o.value === effectiveStatus)?.label ?? effectiveStatus
      toast.success(`Property marked as "${label}".`)
    } catch (err) {
      toast.error(err.message || 'Failed to update verification status.')
    } finally {
      setIsSaving(false)
    }
  }

  const locationLine = property
    ? [property.location_district, property.location_city, property.location_state]
        .filter(Boolean)
        .join(', ')
    : ''

  const visibleThumbs = mediaItems.slice(0, 4)
  const extraMedia = Math.max(0, mediaItems.length - 4)

  const tabs = [
    { id: 'property-info', label: 'Property Info' },
    { id: 'owner-info', label: 'Owner Info' },
    { id: 'enquiries', label: `Enquiries (${enquiryCount})` },
  ]

  return (
      <aside className="flex h-full w-[450px] min-w-[450px] max-w-[450px] shrink-0 flex-col border-l border-border bg-card">
      <div className="flex items-center justify-between gap-2 border-b border-border bg-muted/30 px-4 py-3">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="font-heading text-base font-semibold text-brand-forest">Property Details</h2>
          {property && <VerificationBadge status={verificationStatus} />}
        </div>
        {onClose && (
          <Button type="button" variant="ghost" size="icon-sm" onClick={onClose}>
            <X className="size-4" />
            <span className="sr-only">Close</span>
          </Button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto overflow-x-hidden">
        {isLoading && (
          <div className="space-y-4 p-4">
            <Skeleton className="aspect-[16/10] w-full rounded-lg" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        )}

        {isError && (
          <p className="p-4 text-sm text-destructive">
            {error?.message || 'Failed to load property.'}
          </p>
        )}

        {!isLoading && !isError && property && (
          <>
            <div className="relative aspect-[16/10] bg-muted">
              {displayMedia.type === 'Video' ? (
                <video
                  key={displayMedia.src}
                  src={displayMedia.src}
                  controls
                  className="h-full w-full object-cover"
                />
              ) : (
                <img
                  src={displayMedia.src}
                  alt=""
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    const img = e.currentTarget
                    if (!img.dataset.fallback) {
                      img.dataset.fallback = '1'
                      img.src = PLACEHOLDER_IMAGE
                    }
                  }}
                />
              )}
              {mediaCount > 1 && (
                <>
                  <button
                    type="button"
                    onClick={goPrev}
                    className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-1.5 text-white hover:bg-black/70"
                  >
                    <ChevronLeft className="size-4" />
                  </button>
                  <button
                    type="button"
                    onClick={goNext}
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-1.5 text-white hover:bg-black/70"
                  >
                    <ChevronRight className="size-4" />
                  </button>
                  <span className="absolute bottom-2 right-2 rounded-md bg-black/60 px-2 py-0.5 text-xs text-white">
                    {activeMedia + 1}/{mediaCount}
                  </span>
                </>
              )}
            </div>

            {mediaItems.length > 0 && (
              <div className="flex gap-2 border-b border-border px-4 py-3">
                {visibleThumbs.map((item, idx) => (
                  <button
                    key={`${item.type}-${item.src}-${idx}`}
                    type="button"
                    onClick={() => setActiveMedia(idx)}
                    className={`relative h-14 w-20 shrink-0 overflow-hidden rounded-md border-2 ${
                      activeMedia === idx ? 'border-brand-forest' : 'border-transparent'
                    }`}
                  >
                    {item.type === 'Video' ? (
                      <div className="relative h-full w-full">
                        <video
                          src={item.src}
                          muted
                          preload="metadata"
                          className="h-full w-full object-cover"
                        />
                        <span className="absolute inset-0 flex items-center justify-center bg-black/25">
                          <Play className="size-4 fill-white text-white" />
                        </span>
                      </div>
                    ) : (
                      <img src={item.src} alt="" className="h-full w-full object-cover" />
                    )}
                    {idx === 3 && extraMedia > 0 && (
                      <span className="absolute inset-0 flex items-center justify-center bg-black/50 text-sm font-semibold text-white">
                        +{extraMedia}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}

            <div className="space-y-4 p-4">
              <div>
                <h3 className="text-lg font-semibold text-foreground">{property.title}</h3>
                <p className="mt-1 text-xl font-bold text-foreground">
                  {formatINR(property.asking_price)}
                  <span className="ml-2 text-sm font-normal text-muted-foreground">
                    Negotiable
                  </span>
                </p>
                <p className="mt-2 flex items-start gap-1.5 text-sm text-muted-foreground">
                  <MapPin className="mt-0.5 size-4 shrink-0" />
                  {locationLine || '—'}
                </p>
                <div className="mt-2">
                  <StatusBadge status={property.status} />
                </div>
              </div>

              <div className="flex gap-1 border-b border-border">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`border-b-2 px-3 py-2 text-sm font-medium transition-colors ${
                      activeTab === tab.id
                        ? 'border-brand-forest text-brand-forest'
                        : 'border-transparent text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {activeTab === 'property-info' && (
                <div className="grid gap-4 lg:grid-cols-[1fr_200px] min-w-0">
                  <div>
                    <div className="grid grid-cols-[1fr_1fr] gap-y-3 gap-x-8">
                      {[
                        { label: 'Property Type', value: property.property_type_name },
                        {
                          label: 'Built-up Area',
                          value: property.size_sqft
                            ? `${Number(property.size_sqft).toLocaleString('en-IN')} sq.ft`
                            : null,
                        },
                        { label: 'Property Age', value: ageLabel },
                        { label: 'City', value: property.location_city },
                        { label: 'State', value: property.location_state },
                        { label: 'District', value: property.location_district },
                        { label: 'Contact email', value: property.contact_email },
                        { label: 'Contact phone', value: property.contact_phone },
                      ].map((f) => (
                        <div key={f.label} className="contents">
                          <p className="text-xs text-muted-foreground">{f.label}</p>
                          <p className="mt-0.5 text-sm font-medium text-foreground">{f.value || '—'}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-lg border border-border bg-muted/30 p-3 min-w-0 w-full">
                    <h4 className="text-sm font-semibold text-foreground">Amenities</h4>
                    <ul className="mt-3 space-y-2">
                      {features.length === 0 && (
                        <li className="text-xs text-muted-foreground">No amenities listed</li>
                      )}
                      {features.map((feature) => {
                        const Icon = AMENITY_ICONS[feature] || Check
                        return (
                          <li key={feature} className="flex items-center gap-2 text-sm">
                            <Icon className="size-4 text-emerald-600" />
                            <span className="flex-1">{feature}</span>
                            {/* <Check className="size-3.5 text-emerald-600" /> */}
                          </li>
                        )
                      })}
                      {features.length > 4 && (
                        <li>
                          <button
                            type="button"
                            className="text-xs font-medium text-brand-forest hover:underline"
                          >
                            View all amenities
                          </button>
                        </li>
                      )}
                    </ul>
                  </div>

                  {property.property_story && (
                    <div className="col-span-full">
                      <h4 className="text-sm font-semibold text-foreground">Property story</h4>
                      <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
                        {property.property_story}
                      </p>
                    </div>
                  )}

                  <div className="col-span-full space-y-3 border-t border-border pt-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-muted-foreground">Verification Status</label>
                      <select
                        value={effectiveStatus}
                        onChange={(e) => setSelectedStatus(e.target.value)}
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                      >
                        <option value="">Select status…</option>
                        {VERIFICATION_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-muted-foreground">
                        Reason
                        {(effectiveStatus === 'Rejected' || effectiveStatus === 'RequestChanges') && (
                          <span className="ml-1 text-destructive">*</span>
                        )}
                      </label>
                      <textarea
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        placeholder="Add a reason or note for the seller…"
                        rows={3}
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                      />
                    </div>
                    <Button
                      type="button"
                      className="w-full bg-brand-forest hover:bg-brand-forest/90"
                      disabled={isSaving || !effectiveStatus}
                      onClick={handleSave}
                    >
                      {isSaving ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4" />}
                      Save Verification
                    </Button>
                  </div>
                </div>
              )}

              {activeTab === 'owner-info' && (
                <div className="grid grid-cols-2 gap-4">
                  <DetailField label="Owner name" value={getSellerName(property)} />
                  <DetailField label="Email" value={property.seller_email} />
                  <DetailField label="Phone" value={property.seller_phone} />
                  <DetailField label="Listed on" value={formatDate(property.created_at)} />
                </div>
              )}

              {activeTab === 'enquiries' && (
                <div className="space-y-3">
                  {(property.enquiries ?? []).length === 0 && (
                    <p className="text-sm text-muted-foreground">No enquiries yet.</p>
                  )}
                  {(property.enquiries ?? []).map((enquiry) => {
                    const buyerName = [enquiry.buyer_first_name, enquiry.buyer_last_name]
                      .filter(Boolean)
                      .join(' ')
                    return (
                      <div
                        key={enquiry.id}
                        className="rounded-lg border border-border px-3 py-2"
                      >
                        <p className="text-sm font-medium">{buyerName || 'Buyer'}</p>
                        <p className="text-xs text-muted-foreground">{enquiry.buyer_email}</p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {formatDate(enquiry.created_at)}
                        </p>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </>
        )}
      </div>

    </aside>
  )
}
