import { Link } from 'react-router-dom'
import { Briefcase, MapPin } from 'lucide-react'
import ContentPageLayout from '@/components/ContentPageLayout'
import { useCareers } from '@/hooks/useCareers'
import usePageMeta from '@/hooks/usePageMeta'

export default function Careers() {
  const { data, isLoading } = useCareers()
  const careers = data?.data ?? []

  usePageMeta({
    title: 'Careers | RareNest',
    description: 'Join the RareNest team and help shape extraordinary living.',
  })

  return (
    <ContentPageLayout
      title="Careers"
      subtitle="Explore open positions at RareNest."
    >
      {isLoading ? (
        <div className="animate-pulse space-y-4">
          <div className="h-24 w-full rounded-xl bg-muted" />
          <div className="h-24 w-full rounded-xl bg-muted" />
        </div>
      ) : careers.length === 0 ? (
        <p className="text-muted-foreground">
          There are no open positions at the moment. Check back soon.
        </p>
      ) : (
        <div className="space-y-4">
          {careers.map((career) => (
            <Link
              key={career.id}
              to={`/careers/${career.id}`}
              className="block rounded-xl border border-border p-6 transition-colors hover:border-brand-bronze/50 hover:bg-muted/30"
            >
              <div className="flex items-start gap-3">
                <Briefcase className="mt-0.5 size-5 text-brand-bronze shrink-0" />
                <div>
                  <h2 className="font-semibold text-foreground">{career.title}</h2>
                  <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-sm text-muted-foreground">
                    {career.department && <span>{career.department}</span>}
                    {career.location && (
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="size-3.5" />
                        {career.location}
                      </span>
                    )}
                    {career.employment_type && <span>{career.employment_type}</span>}
                  </div>
                  {career.salary_range && (
                    <p className="mt-2 text-sm text-muted-foreground">{career.salary_range}</p>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </ContentPageLayout>
  )
}
