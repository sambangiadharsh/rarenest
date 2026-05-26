import { Link } from 'react-router-dom'
import ContentPageLayout from '@/components/ContentPageLayout'
import HtmlContent from '@/components/HtmlContent'
import { Button } from '@/components/ui/button'
import { useCmsPage } from '@/hooks/useCms'
import usePageMeta from '@/hooks/usePageMeta'

export default function About() {
  const { data, isLoading, isError } = useCmsPage('about_us')
  const page = data?.data

  usePageMeta({
    title: page?.meta_title || page?.title || 'About Us | RareNest',
    description: page?.meta_description,
  })

  if (isLoading) {
    return (
      <ContentPageLayout title="About Us">
        <div className="animate-pulse space-y-4">
          <div className="h-4 w-3/4 rounded bg-muted" />
          <div className="h-4 w-full rounded bg-muted" />
          <div className="h-4 w-5/6 rounded bg-muted" />
        </div>
      </ContentPageLayout>
    )
  }

  if (isError || !page) {
    return (
      <ContentPageLayout title="About Us">
        <p className="text-muted-foreground">This page is not available at the moment.</p>
        <Button asChild className="mt-6">
          <Link to="/">Back to home</Link>
        </Button>
      </ContentPageLayout>
    )
  }

  return (
    <ContentPageLayout title={page.title}>
      <HtmlContent html={page.content} />
    </ContentPageLayout>
  )
}
