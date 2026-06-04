import { Link, useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { motion } from 'framer-motion'
import { Heart, Loader2, MapPin, Calendar, ArrowRight } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/shared/components/ui/button'
import {
  formatPriceOnwards,
  PLACEHOLDER_IMAGE,
  getDaysAgo,
} from '@/features/properties/lib/propertyUtils'
import { useWishlistIds, useToggleWishlist } from '@/features/wishlist'

export default function PropertyCard({
  property,
  index = 0,
  layout = 'grid',
  className = '',
}) {
  const navigate = useNavigate()
  const { isAuthenticated } = useSelector((state) => state.auth)
  const { data: idsData } = useWishlistIds({ enabled: isAuthenticated })
  const { mutateAsync: toggleWishlist, isPending: isTogglingWishlist } =
    useToggleWishlist()

  const wishlistedIds = new Set(
    (idsData?.data ?? []).map((id) => String(id).toLowerCase()),
  )
  const isWishlisted = wishlistedIds.has(String(property.id).toLowerCase())

  const isList = layout === 'list'
  const cardImage = property.image || PLACEHOLDER_IMAGE

  const handleWishlistClick = async (e) => {
    e.preventDefault()
    e.stopPropagation()

    if (!isAuthenticated) {
      toast.error('Please log in to save properties to your wishlist.')
      navigate('/login')
      return
    }

    try {
      const res = await toggleWishlist({
        propertyId: property.id,
        isWishlisted,
      })

      if (res?.success) {
        toast.success(
          isWishlisted
            ? 'Removed from your wishlist.'
            : `"${property.title}" added to your wishlist!`,
        )
      } else {
        toast.error(res?.message || 'Could not update wishlist.')
      }
    } catch (err) {
      toast.error(err.message || 'Could not update wishlist.')
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: Math.min(index * 0.05, 0.3) }}
      whileHover={{ y: -6 }}
      className={className}
    >
      <Link
        to={`/properties/${property.id}`}
        className={`group flex overflow-hidden rounded-[24px] border border-brand-sand/60 bg-white shadow-[0_8px_30px_rgb(0,0,0,0.02)] transition-all duration-500 hover:border-brand-terracotta/20 hover:shadow-[0_20px_40px_rgba(176,91,59,0.08)] dark:border-neutral-850 dark:bg-neutral-900 ${
          isList ? 'flex-col sm:h-52 sm:flex-row' : 'flex-col'
        }`}
      >
        {/* Image Section */}
        <div
          className={`relative shrink-0 overflow-hidden bg-neutral-50 dark:bg-neutral-800 ${
            isList ? 'h-52 w-full sm:h-full sm:w-64' : 'h-56 w-full'
          }`}
        >
          <img
            key={`${property.id}-${cardImage}`}
            src={cardImage}
            alt={property.title}
            className="block h-full w-full object-cover transition-transform duration-1000 ease-out group-hover:scale-105"
            loading="lazy"
            decoding="async"
            onError={(e) => {
              const img = e.currentTarget
              if (!img.dataset.fallback) {
                img.dataset.fallback = '1'
                img.src = PLACEHOLDER_IMAGE
              }
            }}
          />
          
          {/* Top-Left Region Badge */}
          {/* {property.regionBadge && (
            <span className="absolute left-4 top-4 rounded-full bg-[#1b4332] px-3.5 py-1.5 text-[10px] font-extrabold uppercase tracking-wider text-[#E8F5E9] shadow-md transition-transform duration-300 group-hover:scale-95">
              {property.regionBadge}
            </span>
          )} */}

          {/* Wishlist Heart Icon */}
          <Button
            type="button"
            size="sm"
            variant="ghost"
            disabled={isTogglingWishlist}
            className={`absolute right-4 top-4 h-10 w-10 rounded-full bg-white p-0 shadow-md hover:bg-neutral-50 dark:bg-neutral-900 transition-all duration-300 ${
              isWishlisted
                ? 'text-brand-terracotta hover:text-brand-terracotta'
                : 'text-[#B05B3B] hover:text-brand-terracotta'
            }`}
            onClick={handleWishlistClick}
            aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
          >
            {isTogglingWishlist ? (
              <Loader2 className="h-4 w-4 animate-spin text-[#B05B3B]" />
            ) : (
              <Heart
                className={`h-4.5 w-4.5 transition-transform duration-300 hover:scale-110 ${
                  isWishlisted ? 'fill-[#B05B3B] text-[#B05B3B]' : 'text-[#B05B3B]'
                }`}
              />
            )}
          </Button>

          {/* Bottom-Left Availability/Status Badge */}
          {property.status && (
            <div
              className={`absolute left-4 bottom-4 flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[10px] font-extrabold uppercase tracking-wider shadow-md backdrop-blur-md transition-all duration-300 group-hover:translate-y-[-2px] ${
                property.status.toLowerCase() === 'available'
                  ? 'bg-emerald-50/95 text-[#2E7D32] dark:bg-emerald-950/90 dark:text-emerald-300'
                  : property.status.toLowerCase() === 'sold'
                  ? 'bg-red-50/95 text-red-700 dark:bg-red-950/90 dark:text-red-300'
                  : 'bg-amber-50/95 text-amber-700 dark:bg-amber-950/90 dark:text-amber-300'
              }`}
            >
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  property.status.toLowerCase() === 'available'
                    ? 'bg-[#4CAF50] animate-pulse'
                    : property.status.toLowerCase() === 'sold'
                    ? 'bg-red-500'
                    : 'bg-amber-500'
                }`}
              />
              {property.status}
            </div>
          )}
        </div>

        {/* Info Section */}
        <div className="flex flex-grow flex-col justify-between p-5">
          <div className="flex flex-col gap-1.5">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#B05B3B] line-clamp-1">
              {property.property_type}
            </p>
            <h3 className="font-serif text-lg font-bold leading-tight text-neutral-900 transition-colors duration-300 group-hover:text-[#B05B3B] dark:text-white line-clamp-1">
              {property.title}
            </h3>
            <p className="flex items-center gap-1.5 text-xs font-semibold text-neutral-500 dark:text-neutral-400">
              <MapPin className="h-3.5 w-3.5 shrink-0 text-[#B05B3B]" />
              <span className="line-clamp-1">{property.locationLabel}</span>
            </p>
          </div>

          <div className="mt-3 flex flex-col gap-3">
            {/* Divider 1 */}
            <hr className="border-t border-brand-sand/60 dark:border-neutral-800" />

            {/* Price & Size Row */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1 font-sans text-lg font-extrabold text-neutral-950 dark:text-white">
                <span>{formatPriceOnwards(property.asking_price)}</span>
                <span className="text-[#B05B3B] text-[10px] align-middle">▼</span>
              </div>
              <p className="text-xs font-bold text-neutral-500 dark:text-neutral-400">
                {Number(property.size_sqft).toLocaleString('en-IN')} sqft
              </p>
            </div>

            {/* Divider 2 */}
            <hr className="border-t border-brand-sand/60 dark:border-neutral-800" />

            {/* Footer Row: Listed Days & View Details */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-[11px] font-semibold text-neutral-400 dark:text-neutral-500">
                <Calendar className="h-3.5 w-3.5" />
                <span>{getDaysAgo(property.created_at)}</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#B05B3B] transition-colors duration-300 group-hover:text-brand-terracotta">
                <span>View Details</span>
                <div className="flex h-6 w-6 items-center justify-center rounded-full border border-[#B05B3B] text-[#B05B3B] transition-all duration-300 group-hover:translate-x-0.5 group-hover:bg-[#B05B3B] group-hover:text-white dark:border-[#B05B3B]">
                  <ArrowRight className="h-3 w-3" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
