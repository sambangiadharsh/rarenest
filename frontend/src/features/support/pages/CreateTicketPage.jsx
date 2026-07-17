import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useNavigate, Link } from 'react-router-dom'
import { Loader2, ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'
import ContentPageLayout from '@/shared/components/content/ContentPageLayout'
import { Button } from '@/shared/components/ui/button'
import { SUPPORT_CATEGORIES } from '../api/supportApi'
import { useCreateTicket } from '../hooks/useSupport'

const schema = z.object({
  category: z.string().min(1, 'Select a category'),
  subject: z.string().min(3, 'Subject must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
})

export default function CreateTicketPage() {
  const navigate = useNavigate()
  const { mutateAsync: createTicket, isPending } = useCreateTicket()

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { category: '', subject: '', description: '' },
  })

  const onSubmit = async (data) => {
    try {
      const res = await createTicket(data)
      toast.success('Support ticket created')
      const ticketId = res?.data?.ticket?.id
      navigate(ticketId ? `/support/${ticketId}` : '/support/tickets')
    } catch (err) {
      toast.error(err.message || 'Failed to create ticket')
    }
  }

  return (
    <ContentPageLayout title="Create Support Ticket" subtitle="Describe your issue and we'll get back to you">
      <Link to="/support" className="mb-6 inline-flex items-center gap-1 text-sm text-brand-terracotta hover:underline">
        <ArrowLeft className="h-4 w-4" /> Back to Support
      </Link>

      <form onSubmit={handleSubmit(onSubmit)} className="mx-auto max-w-xl space-y-5">
        <div>
          <label className="mb-1 block text-sm font-medium">Category</label>
          <select
            {...register('category')}
            className="w-full rounded-xl border border-brand-sand bg-white px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900"
          >
            <option value="">Select category</option>
            {SUPPORT_CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          {errors.category && <p className="mt-1 text-xs text-red-500">{errors.category.message}</p>}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Subject</label>
          <input
            {...register('subject')}
            className="w-full rounded-xl border border-brand-sand bg-white px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900"
            placeholder="Brief summary of your issue"
          />
          {errors.subject && <p className="mt-1 text-xs text-red-500">{errors.subject.message}</p>}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Description</label>
          <textarea
            {...register('description')}
            rows={6}
            className="w-full rounded-xl border border-brand-sand bg-white px-3 py-2 text-sm dark:border-neutral-700 dark:bg-neutral-900"
            placeholder="Provide details about your issue..."
          />
          {errors.description && <p className="mt-1 text-xs text-red-500">{errors.description.message}</p>}
        </div>

        <Button type="submit" disabled={isPending} className="w-full bg-brand-terracotta hover:bg-brand-terracotta/90">
          {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Create ticket'}
        </Button>
      </form>
    </ContentPageLayout>
  )
}


