import { useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Star, X, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/shared/components/ui/button'
import { useSubmitBuilderReview } from '../hooks/useBuilder'

const reviewSchema = z.object({
  rating: z.number().min(1, 'Please select a rating.'),
  comment: z.string().max(1000, 'Comment is too long').optional(),
})

export default function ReviewModal({ builderId, onClose }) {
  const [hovered, setHovered] = useState(0)
  const [submitted, setSubmitted] = useState(false)

  const {
    register,
    handleSubmit: hookFormSubmit,
    control,
    watch,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(reviewSchema),
    defaultValues: { rating: 0, comment: '' }
  })

  const { mutateAsync, isPending } = useSubmitBuilderReview(builderId)

  const onSubmit = async (data) => {
    try {
      await mutateAsync({ rating: data.rating, comment: data.comment })
      setSubmitted(true)
    } catch (err) {
      toast.error(err.message || 'Failed to submit review.')
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-2xl border border-brand-sand bg-white shadow-xl dark:border-neutral-800 dark:bg-neutral-900">
        <div className="flex items-center justify-between border-b border-brand-sand p-5 dark:border-neutral-800">
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-white">
            Write a Review
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-neutral-400 transition-colors hover:text-neutral-600 dark:hover:text-neutral-200"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {submitted ? (
          <div className="p-8 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
              <Star className="h-7 w-7 fill-emerald-400 text-emerald-400" />
            </div>
            <h3 className="text-base font-semibold text-neutral-900 dark:text-white">
              Review submitted successfully.
            </h3>
            <p className="mt-2 text-sm text-neutral-500">
              Pending admin approval. It will appear once reviewed.
            </p>
            <Button className="mt-6 bg-brand-terracotta hover:bg-brand-terracotta/90" onClick={onClose}>
              Close
            </Button>
          </div>
        ) : (
          <form onSubmit={hookFormSubmit(onSubmit)} className="space-y-5 p-5">
            <div>
              <p className="mb-2 text-sm font-medium text-neutral-700 dark:text-neutral-300">
                Rating
              </p>
              <Controller
                name="rating"
                control={control}
                render={({ field }) => (
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => field.onChange(star)}
                        onMouseEnter={() => setHovered(star)}
                        onMouseLeave={() => setHovered(0)}
                        className="rounded p-0.5 transition-transform hover:scale-110"
                      >
                        <Star
                          className={`h-8 w-8 transition-colors ${
                            star <= (hovered || field.value)
                              ? 'fill-amber-400 text-amber-400'
                              : 'text-neutral-300 dark:text-neutral-600'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                )}
              />
              {errors.rating && <span className="text-[10px] text-destructive font-semibold mt-1 block">{errors.rating.message}</span>}
            </div>

            <div>
              <label
                htmlFor="review-comment"
                className="mb-2 block text-sm font-medium text-neutral-700 dark:text-neutral-300"
              >
                Comment <span className="text-neutral-400">(optional)</span>
              </label>
              <textarea
                id="review-comment"
                {...register('comment')}
                rows={4}
                maxLength={1000}
                placeholder="Share your experience with this builder..."
                className={`w-full resize-none rounded-xl border bg-white px-4 py-3 text-sm text-neutral-900 placeholder-neutral-400 focus:outline-none dark:bg-neutral-800 dark:text-white transition ${errors.comment ? 'border-destructive focus:ring-1 focus:ring-destructive' : 'border-brand-sand focus:border-brand-terracotta dark:border-neutral-700'}`}
              />
              <p className="mt-1 text-right text-xs text-neutral-400">
                {watch('comment')?.length || 0}/1000
              </p>
              {errors.comment && <span className="text-[10px] text-destructive font-semibold">{errors.comment.message}</span>}
            </div>

            <div className="flex gap-3 pt-1">
              <Button
                type="button"
                variant="outline"
                className="flex-1 border-brand-sand"
                onClick={onClose}
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-brand-terracotta hover:bg-brand-terracotta/90"
                disabled={isPending}
              >
                {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Submit'}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
