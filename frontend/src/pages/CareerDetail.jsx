import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, Mail, MapPin } from 'lucide-react'
import ContentPageLayout from '@/components/ContentPageLayout'
import HtmlContent from '@/components/HtmlContent'
import { Button } from '@/components/ui/button'
import { useCareer } from '@/hooks/useCareers'
import usePageMeta from '@/hooks/usePageMeta'

export default function CareerDetail() {
  const { id } = useParams()
  const { data, isLoading, isError } = useCareer(id)
  const career = data?.data

  usePageMeta({
    title: career ? `${career.title} | Careers | RareNest` : 'Careers | RareNest',
    description: career?.description?.replace(/<[^>]+>/g, '').slice(0, 160),
  })

  if (isLoading) {
    return (
      <ContentPageLayout title="Loading...">
        <div className="animate-pulse space-y-4">
          <div className="h-4 w-full rounded bg-muted" />
          <div className="h-4 w-3/4 rounded bg-muted" />
        </div>
      </ContentPageLayout>
    )
  }

  if (isError || !career) {
    return (
      <ContentPageLayout title="Position not found">
        <p className="text-muted-foreground">This job posting is no longer available.</p>
        <Button asChild variant="outline" className="mt-6 gap-2">
          <Link to="/careers">
            <ArrowLeft className="size-4" />
            All careers
          </Link>
        </Button>
      </ContentPageLayout>
    )
  }

  return (
    <ContentPageLayout title={career.title}>
      <div className="mb-8 flex flex-wrap gap-3 text-sm text-muted-foreground">
        {career.department && <span>{career.department}</span>}
        {career.location && (
          <span className="inline-flex items-center gap-1">
            <MapPin className="size-3.5" />
            {career.location}
          </span>
        )}
        {career.employment_type && <span>{career.employment_type}</span>}
        {career.experience_level && <span>{career.experience_level}</span>}
        {career.salary_range && <span>{career.salary_range}</span>}
      </div>

      {career.description && (
        <section className="mb-8">
          <h2 className="mb-3 text-lg font-semibold">About the role</h2>
          <HtmlContent html={career.description} />
        </section>
      )}

      {career.requirements && (
        <section className="mb-8">
          <h2 className="mb-3 text-lg font-semibold">Requirements</h2>
          <HtmlContent html={career.requirements} />
        </section>
      )}

      {career.application_email && (
        <Button asChild className="gap-2">
          <a href={`mailto:${career.application_email}?subject=Application: ${encodeURIComponent(career.title)}`}>
            <Mail className="size-4" />
            Apply via email
          </a>
        </Button>
      )}

      <div className="mt-8">
        <Button asChild variant="ghost" className="gap-2 -ml-3">
          <Link to="/careers">
            <ArrowLeft className="size-4" />
            Back to all positions
          </Link>
        </Button>
      </div>
    </ContentPageLayout>
  )
}
