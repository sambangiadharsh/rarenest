import { useState } from 'react'
import { Loader2, Pencil, Plus, Trash2 } from 'lucide-react'
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
import {
  useFaqsAdmin,
  useCreateFaq,
  useUpdateFaq,
  useDeleteFaq,
} from '@/hooks/useFaqs'

const selectClassName =
  'flex h-9 w-full rounded-lg border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'

const emptyForm = { question: '', answer: '', is_active: true }

export default function Faqs() {
  const { data, isLoading, isError, error } = useFaqsAdmin()
  const { mutateAsync: createFaq, isPending: isCreating } = useCreateFaq()
  const { mutateAsync: updateFaq, isPending: isUpdating } = useUpdateFaq()
  const { mutateAsync: deleteFaq, isPending: isDeleting } = useDeleteFaq()

  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [showForm, setShowForm] = useState(false)

  const faqs = data?.data ?? []
  const isSaving = isCreating || isUpdating

  const openCreate = () => {
    setEditingId(null)
    setForm(emptyForm)
    setShowForm(true)
  }

  const openEdit = (faq) => {
    setEditingId(faq.id)
    setForm({
      question: faq.question,
      answer: faq.answer,
      is_active: !!faq.is_active,
    })
    setShowForm(true)
  }

  const closeForm = () => {
    setShowForm(false)
    setEditingId(null)
    setForm(emptyForm)
  }

  const handleSave = async () => {
    if (!form.question.trim()) {
      toast.error('Question is required.')
      return
    }
    if (!form.answer.trim() || form.answer === '<p></p>') {
      toast.error('Answer is required.')
      return
    }

    try {
      if (editingId) {
        const res = await updateFaq({
          id: editingId,
          question: form.question.trim(),
          answer: form.answer,
          is_active: form.is_active,
        })
        if (!res.success) {
          toast.error(res.message || 'Failed to update FAQ.')
          return
        }
        toast.success('FAQ updated.')
      } else {
        const res = await createFaq({
          question: form.question.trim(),
          answer: form.answer,
          is_active: form.is_active,
        })
        if (!res.success) {
          toast.error(res.message || 'Failed to create FAQ.')
          return
        }
        toast.success('FAQ created.')
      }
      closeForm()
    } catch (err) {
      toast.error(err.message || 'Failed to save FAQ.')
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this FAQ?')) return
    try {
      await deleteFaq(id)
      toast.success('FAQ deleted.')
      if (editingId === id) closeForm()
    } catch (err) {
      toast.error(err.message || 'Failed to delete FAQ.')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-semibold tracking-tight text-brand-forest">
            FAQs
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Create and edit frequently asked questions for the public site.
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="size-4" />
          Add FAQ
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              {editingId ? 'Edit FAQ' : 'New FAQ'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Question</Label>
              <Input
                value={form.question}
                onChange={(e) => setForm((f) => ({ ...f, question: e.target.value }))}
                placeholder="Enter question"
              />
            </div>
            <div className="space-y-2">
              <Label>Answer</Label>
              <RichTextEditor
                value={form.answer}
                onChange={(answer) => setForm((f) => ({ ...f, answer }))}
                placeholder="Enter answer..."
              />
            </div>
            <div className="space-y-2 max-w-xs">
              <Label>Status</Label>
              <select
                value={form.is_active ? 'active' : 'inactive'}
                onChange={(e) =>
                  setForm((f) => ({ ...f, is_active: e.target.value === 'active' }))
                }
                className={selectClassName}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving && <Loader2 className="size-4 animate-spin" />}
                Save
              </Button>
              <Button variant="outline" onClick={closeForm}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">All FAQs</CardTitle>
          <CardDescription>{faqs.length} total</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : isError ? (
            <p className="text-sm text-destructive">{error?.message || 'Failed to load FAQs.'}</p>
          ) : faqs.length === 0 ? (
            <p className="text-sm text-muted-foreground">No FAQs yet. Add your first one above.</p>
          ) : (
            <div className="divide-y divide-border">
              {faqs.map((faq) => (
                <div
                  key={faq.id}
                  className="flex items-start justify-between gap-4 py-4 first:pt-0 last:pb-0"
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-sm">{faq.question}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {faq.is_active ? 'Active' : 'Inactive'}
                    </p>
                  </div>
                  <div className="flex shrink-0 gap-1">
                    <Button variant="ghost" size="icon-sm" onClick={() => openEdit(faq)}>
                      <Pencil className="size-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => handleDelete(faq.id)}
                      disabled={isDeleting}
                    >
                      <Trash2 className="size-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
