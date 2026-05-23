import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useSelector } from 'react-redux'
import {
  ArrowLeft,
  Heart,
  Loader2,
  Mail,
  MapPin,
  Phone,
  Send,
  Triangle,
} from 'lucide-react'
import { toast } from 'sonner'

import EnquiryModal from '@/components/EnquiryModal'
import { Button } from '@/components/ui/button'

import { useCreateEnquiry } from '@/hooks/useEnquiries'
import { useProperty } from '@/hooks/useProperties'
import { useAddToWishlist } from '@/hooks/useWishlist'

import {
  formatPriceOnwards,
  getPropertyImages,
  getPropertyThumbnail,
  parseSpecialFeatures,
  resolveMediaUrl,
} from '@/lib/propertyUtils'

export default function PropertyDetail() {
  const { id } = useParams()

  const { isAuthenticated } = useSelector((state) => state.auth)

  const [enquiryOpen, setEnquiryOpen] = useState(false)

  const { data, isLoading, isError, error } = useProperty(id)

  const { mutateAsync: addToWishlist, isPending: isAddingWishlist } =
    useAddToWishlist()

  const { mutateAsync: createEnquiry, isPending: isSendingEnquiry } =
    useCreateEnquiry()

  const property = data?.data

  const requireAuth = (actionLabel) => {
    if (isAuthenticated) return true

    toast.error(`Please log in to ${actionLabel}.`)
    return false
  }

  const handleAddToWishlist = async () => {
    if (!requireAuth('add to wishlist')) return

    try {
      const res = await addToWishlist(id)

      if (res?.success) {
        toast.success('Added to your wishlist!')
      } else {
        toast.error(res?.message || 'Could not add to wishlist.')
      }
    } catch (err) {
      toast.error(err.message || 'Could not add to wishlist.')
    }
  }

  const handleSendEnquiry = async () => {
    if (!isAuthenticated) {
      setEnquiryOpen(true)
      return
    }

    try {
      const res = await createEnquiry(id)

      if (res?.success) {
        toast.success('Your enquiry has been sent to the seller.')
      } else {
        toast.error(res?.message || 'Could not send enquiry.')
      }
    } catch (err) {
      toast.error(err.message || 'Could not send enquiry.')
    }
  }

  const images = property ? getPropertyImages(property) : []

  const heroImage =
    images[0] || (property ? getPropertyThumbnail(property) : '')

  const [activeImage, setActiveImage] = useState(0)

  useEffect(() => {
    setActiveImage(0)
  }, [id])

  const displayImage = images[activeImage] || heroImage

  const typeName = property?.property_type_name || 'Property'

  const city = property?.location_city || ''
  const state = property?.location_state || ''

  const locationLabel = [city, state].filter(Boolean).join(', ')

  const features = parseSpecialFeatures(property?.special_features)

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-brand-terracotta" />

        <p className="text-sm text-neutral-500">
          Loading property...
        </p>
      </div>
    )
  }

  if (isError || !property) {
    return (
      <div className="mx-auto max-w-lg py-20 text-center">
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">
          Property not found
        </h1>

        <p className="mt-2 text-sm text-neutral-500">
          {error?.message ||
            'This listing may be unavailable or pending verification.'}
        </p>

        <Link
          to="/"
          className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-brand-terracotta hover:underline"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to home
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl px-3 py-4">
      <Link
        to="/"
        className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-neutral-600 transition-colors hover:text-brand-terracotta"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to listings
      </Link>

      <div className="overflow-hidden rounded-2xl border border-brand-sand bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
        {/* HERO IMAGE */}
        <div className="relative aspect-[16/9] overflow-hidden bg-neutral-100 dark:bg-neutral-800">
          <img
            src={displayImage}
            alt={property.title}
            className="h-full w-full object-cover"
          />

          <span className="absolute left-4 top-4 rounded-full bg-brand-forest px-3 py-1 text-[10px] font-semibold uppercase tracking-wide text-white">
            {state || 'India'}
          </span>
        </div>

        {/* THUMBNAILS */}
        {images.length > 1 && (
          <div className="flex gap-2 overflow-x-auto border-b border-brand-sand p-4 dark:border-neutral-800">
            {images.map((src, idx) => (
              <button
                key={src}
                type="button"
                onClick={() => setActiveImage(idx)}
                className={`h-14 w-20 shrink-0 overflow-hidden rounded-lg border transition-all ${
                  activeImage === idx
                    ? 'border-brand-terracotta'
                    : 'border-transparent opacity-70 hover:opacity-100'
                }`}
              >
                <img
                  src={resolveMediaUrl(src)}
                  alt=""
                  className="h-full w-full object-cover"
                />
              </button>
            ))}
          </div>
        )}

        {/* CONTENT */}
        <div className="space-y-6 p-5 sm:p-6">
          {/* TITLE */}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-brand-terracotta">
              {typeName}
            </p>

            <h1 className="mt-2 text-2xl font-bold leading-snug text-neutral-900 dark:text-white sm:text-3xl">
              {property.title}
            </h1>

            <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-neutral-600 dark:text-neutral-400">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-brand-terracotta" />
                {locationLabel || property.location_district || '—'}
              </div>

              <div className="flex items-center gap-2">
                <Triangle className="h-4 w-4 rotate-180 fill-current text-brand-terracotta" />

                {Number(property.size_sqft).toLocaleString('en-IN')} sqft
              </div>
            </div>
          </div>

          {/* PRICE */}
          <div className="rounded-xl border border-brand-sand bg-brand-cream p-4 dark:border-neutral-800 dark:bg-neutral-950">
            <p className="text-xs font-medium uppercase tracking-wide text-neutral-500">
              Price
            </p>

            <h2 className="mt-1 text-2xl font-bold text-neutral-900 dark:text-white">
              {formatPriceOnwards(property.asking_price)}
            </h2>
          </div>

          {/* STORY */}
          {property.property_story && (
            <section>
              <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
                The story
              </h2>

              <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-neutral-600 dark:text-neutral-400">
                {property.property_story}
              </p>
            </section>
          )}

          {/* FEATURES */}
          {features.length > 0 && (
            <section>
              <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
                Special features
              </h2>

              <div className="mt-3 flex flex-wrap gap-2">
                {features.map((feature) => (
                  <span
                    key={feature}
                    className="rounded-full border border-brand-sand bg-brand-cream px-3 py-1 text-xs font-medium text-neutral-700 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-300"
                  >
                    {feature}
                  </span>
                ))}
              </div>
            </section>
          )}

          {/* CONTACT */}
          {(property.contact_email || property.contact_phone) && (
            <section className="rounded-xl border border-brand-sand bg-brand-cream p-4 dark:border-neutral-800 dark:bg-neutral-950">
              <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
                Contact seller
              </h2>

              <div className="mt-4 flex flex-col gap-3 text-sm">
                {property.contact_email && (
                  <a
                    href={`mailto:${property.contact_email}`}
                    className="flex items-center gap-2 text-brand-terracotta hover:underline"
                  >
                    <Mail className="h-4 w-4" />
                    {property.contact_email}
                  </a>
                )}

                {property.contact_phone && (
                  <a
                    href={`tel:${property.contact_phone}`}
                    className="flex items-center gap-2 text-brand-terracotta hover:underline"
                  >
                    <Phone className="h-4 w-4" />
                    {property.contact_phone}
                  </a>
                )}
              </div>
            </section>
          )}

          {/* ACTION BUTTONS */}
          <div className="border-t border-brand-sand pt-5 dark:border-neutral-800">
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button
                type="button"
                className="h-10 flex-1 gap-2 bg-brand-terracotta text-sm font-medium hover:bg-brand-terracotta/90"
                disabled={isSendingEnquiry}
                onClick={handleSendEnquiry}
              >
                {isSendingEnquiry ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}

                Send enquiry
              </Button>

              <Button
                type="button"
                variant="outline"
                className="h-10 flex-1 gap-2 border-brand-sand text-sm font-medium"
                disabled={isAddingWishlist}
                onClick={handleAddToWishlist}
              >
                {isAddingWishlist ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Heart className="h-4 w-4" />
                )}

                Add to wishlist
              </Button>
            </div>
          </div>
        </div>
      </div>

      <EnquiryModal
        open={enquiryOpen}
        onClose={() => setEnquiryOpen(false)}
        propertyId={id}
        propertyTitle={property.title}
      />
    </div>
  )
}