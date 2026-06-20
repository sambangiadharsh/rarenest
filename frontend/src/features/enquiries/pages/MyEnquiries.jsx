import { Link } from 'react-router-dom'
import { MessageSquare } from 'lucide-react'
import ContentPageLayout from '@/shared/components/content/ContentPageLayout'
import WifiLoader from '@/shared/components/ui/WifiLoader'
import RequireAuth from '@/shared/components/auth/RequireAuth'
import { useMyEnquiries } from '@/features/enquiries/hooks/useEnquiries'
import usePageMeta from '@/shared/hooks/usePageMeta'

function formatDate(value) {
  if (!value) return ''
  return new Date(value).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

function EnquiriesList() {
  const { data, isLoading, isError } = useMyEnquiries()
  const enquiries = data?.data ?? []

  usePageMeta({
    title: 'My Enquiries | RareNest',
    description: 'View property enquiries you have sent on RareNest.',
  })

  if (isLoading) {
    return (
      <ContentPageLayout title="Enquiries" subtitle="Properties you have enquired about.">
        <div className="flex justify-center py-12">
          <WifiLoader />
        </div>
      </ContentPageLayout>
    )
  }

  if (isError) {
    return (
      <ContentPageLayout title="Enquiries" subtitle="Properties you have enquired about.">
        <p className="text-muted-foreground">
          Could not load your enquiries. Please try again later.
        </p>
      </ContentPageLayout>
    )
  }

  return (
    <ContentPageLayout
      title="Enquiries"
      subtitle="Properties you have enquired about."
    >
      {enquiries.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-muted/30 px-6 py-12 text-center">
          <MessageSquare className="mx-auto h-10 w-10 text-muted-foreground/60" />
          <p className="mt-4 text-sm text-muted-foreground">
            You haven&apos;t sent any enquiries yet.
          </p>
          <Link
            to="/properties"
            className="mt-4 inline-block text-sm font-semibold text-brand-terracotta hover:underline"
          >
            Browse the catalog
          </Link>
        </div>
      ) : (
       
       <ul className="space-y-4">
  {enquiries.map((enquiry) => (
    <li key={enquiry.id}>
      <Link
        to={`/properties/${enquiry.property_id}`}
        className="group block rounded-2xl border border-border bg-card p-5 transition-all hover:border-brand-terracotta/30 hover:shadow-md"
      >
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-lg group-hover:text-brand-terracotta transition-colors">
              {enquiry.property_title || 'Property'}
            </h3>

            <p className="mt-2 text-sm text-muted-foreground">
              Enquiry sent on {formatDate(enquiry.created_at)}
            </p>
          </div>

          <div className="text-brand-terracotta font-medium">
            View →
          </div>
        </div>
      </Link>
    </li>
  ))}
</ul>
      )}
    </ContentPageLayout>
  )
}

export default function MyEnquiries() {
  return (
    <RequireAuth>
      <EnquiriesList />
    </RequireAuth>
  )
}



