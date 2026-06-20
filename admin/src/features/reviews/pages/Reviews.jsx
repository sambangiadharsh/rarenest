import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import {
  Check,
  Clock,
  Loader2,
  Star,
  ThumbsDown,
  ThumbsUp,
  X,
  XCircle,
} from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Skeleton } from '@/shared/components/ui/skeleton'
import {
  usePendingReviews,
  useApprovedReviews,
  useRejectedReviews,
  useApproveReview,
  useRejectReview,
} from '../hooks/useReviews'

const TABS = [
  { key: 'pending', label: 'Pending', icon: Clock },
  { key: 'approved', label: 'Approved', icon: ThumbsUp },
  { key: 'rejected', label: 'Rejected', icon: ThumbsDown },
]

function formatDate(value) {
  if (!value) return '—'
  return new Date(value).toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

function StarDisplay({ value }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`h-3.5 w-3.5 ${
            star <= value
              ? 'fill-amber-400 text-amber-400'
              : 'text-neutral-300 dark:text-neutral-600'
          }`}
        />
      ))}
    </div>
  )
}

function StatusBadge({ status }) {
  const styles = {
    Pending: 'bg-amber-50 text-amber-700 border-amber-200',
    Approved: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    Rejected: 'bg-red-50 text-red-700 border-red-200',
  }
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${styles[status] ?? 'bg-muted text-muted-foreground border-border'}`}
    >
      {status}
    </span>
  )
}

function ReviewCard({ review, tab, onApprove, onReject, isActing, actingId }) {
  const builderName =
    `${review.builder_first_name ?? ''} ${review.builder_last_name ?? ''}`.trim() || '—'
  const reviewerName =
    `${review.reviewer_first_name ?? ''} ${review.reviewer_last_name ?? ''}`.trim() || '—'
  const adminName =
    review.admin_first_name
      ? `${review.admin_first_name} ${review.admin_last_name ?? ''}`.trim()
      : null

  const isBusy = isActing && actingId === review.id

  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-semibold text-foreground">{builderName}</p>
            <StatusBadge status={review.status} />
          </div>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Reviewed by <span className="font-medium text-foreground">{reviewerName}</span>
            {' · '}
            {formatDate(review.created_at)}
          </p>
        </div>
        <StarDisplay value={review.rating} />
      </div>

      {review.comment && (
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          {review.comment}
        </p>
      )}

      {(tab === 'approved' || tab === 'rejected') && adminName && (
        <p className="mt-3 text-xs text-muted-foreground">
          {tab === 'approved' ? 'Approved' : 'Rejected'} by{' '}
          <span className="font-medium text-foreground">{adminName}</span>
          {review.reviewed_at && ` on ${formatDate(review.reviewed_at)}`}
        </p>
      )}

      {tab === 'pending' && (
        <div className="mt-4 flex gap-2">
          <Button
            type="button"
            size="sm"
            className="gap-1.5 bg-emerald-600 hover:bg-emerald-700"
            disabled={isBusy}
            onClick={() => onApprove(review.id)}
          >
            {isBusy ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Check className="h-3.5 w-3.5" />
            )}
            Approve
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="gap-1.5 border-red-300 text-red-600 hover:bg-red-50 hover:text-red-700 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950"
            disabled={isBusy}
            onClick={() => onReject(review.id)}
          >
            {isBusy ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <X className="h-3.5 w-3.5" />
            )}
            Reject
          </Button>
        </div>
      )}
    </div>
  )
}

export default function Reviews() {
  const [tab, setTab] = useState('pending')

  const pendingQuery = usePendingReviews()
  const approvedQuery = useApprovedReviews()
  const rejectedQuery = useRejectedReviews()

  const { mutateAsync: approve, isPending: isApproving, variables: approvingId } = useApproveReview()
  const { mutateAsync: reject, isPending: isRejecting, variables: rejectingId } = useRejectReview()

  const activeQuery = {
    pending: pendingQuery,
    approved: approvedQuery,
    rejected: rejectedQuery,
  }[tab]

  const reviews = useMemo(() => activeQuery?.data?.data ?? [], [activeQuery])
  const counts = {
    pending: pendingQuery.data?.count ?? 0,
    approved: approvedQuery.data?.count ?? 0,
    rejected: rejectedQuery.data?.count ?? 0,
  }

  const handleApprove = async (reviewId) => {
    try {
      await approve(reviewId)
      toast.success('Review approved.')
    } catch (err) {
      toast.error(err.message || 'Failed to approve review.')
    }
  }

  const handleReject = async (reviewId) => {
    try {
      await reject(reviewId)
      toast.success('Review rejected.')
    } catch (err) {
      toast.error(err.message || 'Failed to reject review.')
    }
  }

  const isActing = isApproving || isRejecting
  const actingId = approvingId ?? rejectingId

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="font-heading text-2xl font-semibold tracking-tight text-brand-forest">
          Builder Reviews
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Moderate reviews submitted by users for builders.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 rounded-xl border border-border bg-muted/40 p-1 w-fit">
        {TABS.map(({ key, label, icon: Icon }) => {
          const count = counts[key]
          const active = tab === key
          return (
            <button
              key={key}
              type="button"
              onClick={() => setTab(key)}
              className={`flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                active
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
              <span
                className={`rounded-full px-1.5 py-0.5 text-xs font-semibold tabular-nums ${
                  active ? 'bg-brand-forest/10 text-brand-forest' : 'bg-muted text-muted-foreground'
                }`}
              >
                {count}
              </span>
            </button>
          )
        })}
      </div>

      {/* Content */}
      {activeQuery.isLoading && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-28 w-full rounded-xl" />
          ))}
        </div>
      )}

      {activeQuery.isError && (
        <p className="text-sm text-destructive">
          {activeQuery.error?.message || 'Failed to load reviews.'}
        </p>
      )}

      {!activeQuery.isLoading && !activeQuery.isError && reviews.length === 0 && (
        <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-border bg-card py-16 text-center">
          <XCircle className="h-8 w-8 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            No {tab} reviews found.
          </p>
        </div>
      )}

      {!activeQuery.isLoading && !activeQuery.isError && reviews.length > 0 && (
        <div className="space-y-4">
          {reviews.map((review) => (
            <ReviewCard
              key={review.id}
              review={review}
              tab={tab}
              onApprove={handleApprove}
              onReject={handleReject}
              isActing={isActing}
              actingId={actingId}
            />
          ))}
        </div>
      )}
    </div>
  )
}
