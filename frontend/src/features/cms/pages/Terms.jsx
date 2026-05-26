import { Link } from 'react-router-dom'
import ContentPageLayout from '@/shared/components/content/ContentPageLayout'
import HtmlContent from '@/shared/components/content/HtmlContent'
import { Button } from '@/shared/components/ui/button'
import { useCmsPage } from '@/features/cms'
import usePageMeta from '@/shared/hooks/usePageMeta'

export default function Terms() {
  const { data, isLoading, isError } = useCmsPage('terms_and_conditions')
  const page = data?.data

  usePageMeta({
    title: page?.meta_title || page?.title || 'Terms and Conditions | RareNest',
    description: page?.meta_description,
  })

  if (isLoading) {
    return (
      <ContentPageLayout title="Terms and Conditions">
        <div className="animate-pulse space-y-4">
          <div className="h-4 w-full rounded bg-muted" />
          <div className="h-4 w-full rounded bg-muted" />
        </div>
      </ContentPageLayout>
    )
  }

  if (isError || !page) {
    return (
      <ContentPageLayout title="Terms and Conditions">
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
