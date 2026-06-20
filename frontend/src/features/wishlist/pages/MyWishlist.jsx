import { Link } from 'react-router-dom'
import { Heart } from 'lucide-react'
import ContentPageLayout from '@/shared/components/content/ContentPageLayout'
import WifiLoader from '@/shared/components/ui/WifiLoader'
import RequireAuth from '@/shared/components/auth/RequireAuth'
import PropertyCard from '@/features/properties/components/PropertyCard'
import { mapPropertyForCard } from '@/features/properties/lib/propertyUtils'
import { useWishlist } from '@/features/wishlist/hooks/useWishlist'
import usePageMeta from '@/shared/hooks/usePageMeta'

function WishlistContent() {
  const { data, isLoading, isError } = useWishlist()
  const properties = data?.data ?? []

  usePageMeta({
    title: 'My Wishlist | RareNest',
    description: 'Properties you have saved on RareNest.',
  })

  if (isLoading) {
    return (
      <ContentPageLayout title="Wishlist" subtitle="Properties you have saved.">
        <div className="flex justify-center py-12">
          <WifiLoader />
        </div>
      </ContentPageLayout>
    )
  }

  if (isError) {
    return (
      <ContentPageLayout title="Wishlist" subtitle="Properties you have saved.">
        <p className="text-muted-foreground">
          Could not load your wishlist. Please try again later.
        </p>
      </ContentPageLayout>
    )
  }

  return (
    <ContentPageLayout title="Wishlist" subtitle="Properties you have saved.">
      {properties.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-muted/30 px-6 py-12 text-center">
          <Heart className="mx-auto h-10 w-10 text-muted-foreground/60" />
          <p className="mt-4 text-sm text-muted-foreground">
            Your wishlist is empty. Save properties you love to find them here.
          </p>
          <Link
            to="/properties"
            className="mt-4 inline-block text-sm font-semibold text-brand-terracotta hover:underline"
          >
            Browse the catalog
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {properties.map((property, index) => (
            <PropertyCard
              key={property.id}
              property={mapPropertyForCard(property)}
              index={index}
            />
          ))}
        </div>
      )}
    </ContentPageLayout>
  )
}

export default function MyWishlist() {
  return (
    <RequireAuth>
      <WishlistContent />
    </RequireAuth>
  )
}
