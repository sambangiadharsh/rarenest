import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Heart, MapPin, Triangle } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/shared/components/ui/button'
import { formatPriceOnwards } from '@/features/properties/lib/propertyUtils'

export default function PropertyCard({
  property,
  index = 0,
  layout = 'grid',
  className = '',
}) {
  const isList = layout === 'list'

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: Math.min(index * 0.05, 0.3) }}
      whileHover={{ y: -4 }}
      className={className}
    >
      <Link
        to={`/properties/${property.id}`}
        className={`group flex overflow-hidden rounded-2xl border border-brand-sand bg-white shadow-sm transition-all duration-300 hover:shadow-xl dark:border-neutral-850 dark:bg-neutral-900 ${
          isList ? 'flex-col sm:h-56 sm:flex-row' : 'flex-col'
        }`}
      >
        <div
          className={`relative shrink-0 overflow-hidden bg-neutral-100 dark:bg-neutral-800 ${
            isList ? 'h-56 w-full sm:h-full sm:w-72' : 'h-64 w-full'
          }`}
        >
          <img
            src={property.image}
            alt={property.title}
            className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            loading="lazy"
          />
          <span className="absolute left-4 top-4 rounded-full bg-brand-forest px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white shadow-sm">
            {property.regionBadge}
          </span>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            className="absolute right-4 top-4 h-9 w-9 rounded-full bg-white/95 p-0 text-neutral-400 shadow-sm hover:bg-white hover:text-destructive dark:bg-neutral-900/95"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              toast.success(`"${property.title}" added to your wishlist!`)
            }}
          >
            <Heart className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex flex-grow flex-col gap-4 p-6">
          <div className="flex flex-col gap-2">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-terracotta">
              {property.property_type}
            </p>
            <h3 className="font-serif text-xl font-bold leading-tight text-neutral-950 transition-colors group-hover:text-brand-terracotta dark:text-white">
              {property.title}
            </h3>
            <p className="flex items-center gap-1.5 text-sm font-medium text-neutral-500">
              <MapPin className="h-3.5 w-3.5 shrink-0 text-brand-terracotta" />
              <span className="line-clamp-1">{property.locationLabel}</span>
            </p>
          </div>

          <div className="mt-auto flex items-end justify-between border-t border-brand-sand pt-4 dark:border-neutral-800">
            <p className="font-serif text-lg font-bold text-neutral-950 dark:text-white">
              {formatPriceOnwards(property.asking_price)}
            </p>
            <p className="flex items-center gap-1.5 text-sm font-semibold text-neutral-600 dark:text-neutral-400">
              <Triangle className="h-3.5 w-3.5 rotate-180 fill-current text-brand-terracotta" />
              {Number(property.size_sqft).toLocaleString('en-IN')} sqft
            </p>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
