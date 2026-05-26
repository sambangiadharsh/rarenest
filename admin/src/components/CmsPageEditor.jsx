import { useEffect, useState } from 'react'
import { Loader2, Save } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import RichTextEditor from '@/components/RichTextEditor'
import { useCmsPageAdmin, useUpdateCmsPage } from '@/hooks/useCms'

const selectClassName =
  'flex h-9 w-full rounded-lg border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'

export default function CmsPageEditor({ pageKey, pageTitle, pageDescription }) {
  const { data, isLoading, isError, error } = useCmsPageAdmin(pageKey)
  const { mutateAsync: updatePage, isPending } = useUpdateCmsPage(pageKey)

  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [metaTitle, setMetaTitle] = useState('')
  const [metaDescription, setMetaDescription] = useState('')
  const [status, setStatus] = useState('Published')

  useEffect(() => {
    const page = data?.data
    if (page) {
      setTitle(page.title || '')
      setContent(page.content || '')
      setMetaTitle(page.meta_title || '')
      setMetaDescription(page.meta_description || '')
      setStatus(page.status || 'Published')
    }
  }, [data])

  const handleSave = async () => {
    if (!title.trim()) {
      toast.error('Title is required.')
      return
    }
    if (!content.trim() || content === '<p></p>') {
      toast.error('Content is required.')
      return
    }

    try {
      const res = await updatePage({
        title: title.trim(),
        content,
        meta_title: metaTitle.trim() || null,
        meta_description: metaDescription.trim() || null,
        status,
      })
      if (!res.success) {
        toast.error(res.message || 'Failed to save page.')
        return
      }
      toast.success('Page saved successfully.')
    } catch (err) {
      toast.error(err.message || 'Failed to save page.')
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold tracking-tight text-brand-forest">
          {pageTitle}
        </h1>
        {pageDescription && (
          <p className="mt-1 text-sm text-muted-foreground">{pageDescription}</p>
        )}
      </div>

      {isLoading ? (
        <Card>
          <CardContent className="pt-6 space-y-4">
            <Skeleton className="h-9 w-full" />
            <Skeleton className="h-[240px] w-full" />
          </CardContent>
        </Card>
      ) : isError ? (
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-destructive">{error?.message || 'Failed to load page.'}</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Page content</CardTitle>
            <CardDescription>
              Changes are reflected on the public site when status is Published.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Page title"
              />
            </div>

            <div className="space-y-2">
              <Label>Content</Label>
              <RichTextEditor
                value={content}
                onChange={setContent}
                placeholder="Write page content..."
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="meta_title">Meta title</Label>
                <Input
                  id="meta_title"
                  value={metaTitle}
                  onChange={(e) => setMetaTitle(e.target.value)}
                  placeholder="SEO title"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <select
                  id="status"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className={selectClassName}
                >
                  <option value="Published">Published</option>
                  <option value="Draft">Draft</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="meta_description">Meta description</Label>
              <textarea
                id="meta_description"
                value={metaDescription}
                onChange={(e) => setMetaDescription(e.target.value)}
                rows={3}
                className="flex w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                placeholder="SEO description"
              />
            </div>

            <Button onClick={handleSave} disabled={isPending}>
              {isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Save className="size-4" />
              )}
              Save changes
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
