import { useEffect, useState } from 'react'
import {
  Car,
  Check,
  ChevronLeft,
  ChevronRight,
  Droplets,
  Loader2,
  MapPin,
  Shield,
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
import { useUpdateProperty, useVerifyProperty } from '@/features/properties/hooks/useProperties'
import StatusBadge from './StatusBadge'
import VerificationBadge from './VerificationBadge'
import {
  formatINR,
  formatPropertyAge,
  getPropertyImages,
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

export default function PropertyDetailPanel({ propertyId, onClose }) {
  const [activeTab, setActiveTab] = useState('property-info')
  const [activeImage, setActiveImage] = useState(0)

  const { data, isLoading, isError, error } = useProperty(propertyId, {
    enabled: Boolean(propertyId),
  })
  const { mutateAsync: verifyProperty, isPending: isVerifying } = useVerifyProperty()
  const { mutateAsync: updateProperty, isPending: isUpdating } = useUpdateProperty()

  const property = data?.data
  const images = property ? getPropertyImages(property) : []
  const imageCount = Math.max(images.length, 1)
  const heroImage =
    images[activeImage] || (property ? getPropertyThumbnail(property) : PLACEHOLDER_IMAGE)

  const features = parseSpecialFeatures(property?.special_features)
  const ageLabel =
    property?.property_age != null && property.property_age !== ''
      ? formatPropertyAge(property.property_age)
      : null

  const verificationStatus = property ? getVerificationStatus(property) : 'Pending'
  const enquiryCount = property?.enquiry_count ?? property?.enquiries?.length ?? 0
  const isBusy = isVerifying || isUpdating

  useEffect(() => {
    setActiveImage(0)
    setActiveTab('property-info')
  }, [propertyId])

  const goPrev = () => setActiveImage((i) => (i <= 0 ? imageCount - 1 : i - 1))
  const goNext = () => setActiveImage((i) => (i >= imageCount - 1 ? 0 : i + 1))

  const handleApprove = async () => {
    if (!propertyId) return
    try {
      await updateProperty({ id: propertyId, is_visible: true })
      const res = await verifyProperty({ id: propertyId, is_verified: true })
      if (!res?.success) {
        toast.error(res?.message || 'Failed to approve property.')
        return
      }
      toast.success('Property approved.')
    } catch (err) {
      toast.error(err.message || 'Failed to approve property.')
    }
  }

  const handleReject = async () => {
    if (!propertyId) return
    try {
      await verifyProperty({ id: propertyId, is_verified: false })
      const res = await updateProperty({ id: propertyId, is_visible: false })
      if (!res?.success) {
        toast.error(res?.message || 'Failed to reject property.')
        return
      }
      toast.success('Property rejected.')
    } catch (err) {
      toast.error(err.message || 'Failed to reject property.')
    }
  }

  const locationLine = property
    ? [property.location_district, property.location_city, property.location_state]
        .filter(Boolean)
        .join(', ')
    : ''

  const visibleThumbs = images.slice(0, 4)
  const extraImages = Math.max(0, images.length - 4)

  const tabs = [
    { id: 'property-info', label: 'Property Info' },
    { id: 'owner-info', label: 'Owner Info' },
    { id: 'enquiries', label: `Enquiries (${enquiryCount})` },
  ]

  return (
    <aside className="hidden lg:flex h-full w-[480px] min-w-[480px] max-w-[480px] shrink-0 flex-col border-l border-border bg-background overflow-hidden">
      <div className="flex items-center justify-between gap-2 border-b border-border px-4 py-3">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="text-base font-semibold text-foreground">Property Details</h2>
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
              <img
                src={heroImage}
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
              {imageCount > 1 && (
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
                    {activeImage + 1}/{imageCount}
                  </span>
                </>
              )}
            </div>

            {images.length > 0 && (
              <div className="flex gap-2 border-b border-border px-4 py-3">
                {visibleThumbs.map((src, idx) => (
                  <button
                    key={src}
                    type="button"
                    onClick={() => setActiveImage(idx)}
                    className={`relative h-14 w-20 shrink-0 overflow-hidden rounded-md border-2 ${
                      activeImage === idx ? 'border-blue-600' : 'border-transparent'
                    }`}
                  >
                    <img src={src} alt="" className="h-full w-full object-cover" />
                    {idx === 3 && extraImages > 0 && (
                      <span className="absolute inset-0 flex items-center justify-center bg-black/50 text-sm font-semibold text-white">
                        +{extraImages}
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
                        ? 'border-blue-600 text-blue-600'
                        : 'border-transparent text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {activeTab === 'property-info' && (
                <div className="grid gap-4 lg:grid-cols-[1fr_200px]">
                  <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                    <DetailField label="Property Type" value={property.property_type_name} />
                    <DetailField
                      label="Built-up Area"
                      value={
                        property.size_sqft
                          ? `${Number(property.size_sqft).toLocaleString('en-IN')} sq.ft`
                          : null
                      }
                    />
                    <DetailField label="Property Age" value={ageLabel} />
                    <DetailField label="City" value={property.location_city} />
                    <DetailField label="State" value={property.location_state} />
                    <DetailField label="District" value={property.location_district} />
                    <DetailField label="Contact email" value={property.contact_email} />
                    <DetailField label="Contact phone" value={property.contact_phone} />
                  </div>

                  <div className="rounded-lg border border-border bg-muted/30 p-3">
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
                            <Check className="size-3.5 text-emerald-600" />
                          </li>
                        )
                      })}
                      {features.length > 4 && (
                        <li>
                          <button
                            type="button"
                            className="text-xs font-medium text-blue-600 hover:underline"
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

      {property && (
        <div className="flex gap-2 border-t border-border bg-background p-4">
          <Button
            type="button"
            variant="outline"
            className="flex-1 border-red-200 text-red-700 hover:bg-red-50"
            disabled={isBusy}
            onClick={handleReject}
          >
            {isBusy ? <Loader2 className="size-4 animate-spin" /> : <X className="size-4" />}
            Reject Property
          </Button>
          <Button
            type="button"
            className="flex-1 bg-emerald-600 hover:bg-emerald-700"
            disabled={isBusy}
            onClick={handleApprove}
          >
            {isBusy ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4" />}
            Approve Property
          </Button>
        </div>
      )}
    </aside>
  )
}
