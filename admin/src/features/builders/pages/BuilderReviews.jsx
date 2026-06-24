import React, { useMemo, useState } from 'react'
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
  Search,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
} from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import WifiLoader from '@/shared/components/ui/WifiLoader'
import {
  usePendingReviews,
  useApprovedReviews,
  useRejectedReviews,
  useApproveReview,
  useRejectReview,
} from '@/features/reviews'

function formatDate(value) {
  if (!value) return '—'
  return new Date(value).toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

function formatTime(value) {
  if (!value) return '—'
  return new Date(value).toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
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
    Pending: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/30',
    Approved: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/30',
    Rejected: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/20 dark:text-red-400 dark:border-red-900/30',
  }
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold ${styles[status] ?? 'bg-muted text-muted-foreground border-border'}`}
    >
      {status}
    </span>
  )
}

function ReviewCard({ review, onApprove, onReject, isApproving, isRejecting }) {
  const builderName = review.builder_company_name || 
    `${review.builder_first_name ?? ''} ${review.builder_last_name ?? ''}`.trim() || '—'
  const reviewerName =
    `${review.reviewer_first_name ?? ''} ${review.reviewer_last_name ?? ''}`.trim() || '—'
  const adminName =
    review.admin_first_name
      ? `${review.admin_first_name} ${review.admin_last_name ?? ''}`.trim()
      : null

  const isBusy = isApproving || isRejecting
  const [menuOpen, setMenuOpen] = useState(false)

  // Generate simple initials for reviewer avatar
  const reviewerInitials = reviewerName
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || '?'

  return (
    <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6 shadow-sm transition-shadow hover:shadow-md flex flex-col md:flex-row gap-6 justify-between items-start md:items-stretch">
      {/* LEFT SECTION */}
      <div className="flex-1 flex gap-4 items-start min-w-0">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand-forest/10 text-brand-forest font-bold text-lg">
          {reviewerInitials}
        </div>
        <div className="space-y-1.5 flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-bold text-neutral-900 dark:text-white truncate">
              {reviewerName}
            </span>
            <StatusBadge status={review.status} />
          </div>
          <StarDisplay value={review.rating} />
          <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed break-words">
            {review.comment || <span className="italic text-neutral-400">No comment provided.</span>}
          </p>
        </div>
      </div>

      {/* MIDDLE SECTION */}
      <div className="w-full md:w-56 shrink-0 flex flex-col gap-1 text-xs text-neutral-500 border-t md:border-t-0 md:border-l md:border-r border-neutral-100 dark:border-neutral-800 pt-4 md:pt-0 md:px-6 justify-center">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Builder</span>
          <p className="font-semibold text-neutral-900 dark:text-white truncate">{builderName}</p>
        </div>
        <div className="mt-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Project / Listing</span>
          <p className="font-medium text-neutral-650 dark:text-neutral-350 truncate">General Profile Review</p>
        </div>
        <div className="mt-2 text-[11px] flex items-center gap-1.5">
          <span>{formatDate(review.created_at)}</span>
          <span className="text-neutral-300 dark:text-neutral-700">·</span>
          <span>{formatTime(review.created_at)}</span>
        </div>
      </div>

      {/* RIGHT SECTION */}
      <div className="w-full md:w-56 shrink-0 flex flex-col justify-between items-stretch md:items-end gap-4">
        {/* Moderation Status Card */}
        <div className="text-right w-full">
          {review.status === 'Pending' ? (
            <div className="bg-amber-500/8 rounded-xl p-3 border border-amber-500/10 text-left md:text-right">
              <p className="text-xs font-semibold text-amber-700 dark:text-amber-400 flex items-center gap-1.5 justify-start md:justify-end">
                <Clock className="h-3.5 w-3.5" />
                Awaiting Moderation
              </p>
            </div>
          ) : (
            <div className={`rounded-xl p-3 border text-left md:text-right ${review.status === 'Approved' ? 'bg-emerald-500/8 border-emerald-500/10' : 'bg-rose-500/8 border-rose-500/10'}`}>
              <p className={`text-xs font-semibold flex items-center gap-1.5 justify-start md:justify-end ${review.status === 'Approved' ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-700 dark:text-rose-400'}`}>
                {review.status === 'Approved' ? <ThumbsUp className="h-3.5 w-3.5" /> : <ThumbsDown className="h-3.5 w-3.5" />}
                Moderated: {review.status}
              </p>
              {adminName && (
                <p className="text-[10px] text-neutral-450 mt-1">
                  By {adminName} on {formatDate(review.reviewed_at)}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Buttons / Actions */}
        <div className="flex items-center gap-2 justify-end">
          {review.status === 'Pending' && (
            <>
              <Button
                type="button"
                size="sm"
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-9 px-3 gap-1 rounded-lg"
                disabled={isBusy}
                onClick={() => onApprove(review.id)}
              >
                {isApproving ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />
                    Approving...
                  </>
                ) : (
                  <>
                    <Check className="h-3.5 w-3.5" />
                    Approve
                  </>
                )}
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="border-red-200 text-red-650 hover:bg-red-50 hover:text-red-700 font-bold h-9 px-3 gap-1 rounded-lg dark:border-red-900/30"
                disabled={isBusy}
                onClick={() => onReject(review.id)}
              >
                {isRejecting ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />
                    Rejecting...
                  </>
                ) : (
                  <>
                    <X className="h-3.5 w-3.5" />
                    Reject
                  </>
                )}
              </Button>
            </>
          )}

          {/* More actions menu */}
          <div className="relative">
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-9 w-9 rounded-lg border-neutral-200 dark:border-neutral-800"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              <MoreVertical className="h-4 w-4 text-neutral-500" />
            </Button>
            {menuOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                <div className="absolute right-0 mt-1.5 w-44 bg-white dark:bg-neutral-950 border border-neutral-250 dark:border-neutral-800 rounded-xl shadow-lg py-1.5 z-20 overflow-hidden animate-in fade-in slide-in-from-top-1 duration-150">
                  <a
                    href={`http://localhost:5173/builders/${review.builder_profile_id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block px-4 py-2 text-xs font-semibold text-neutral-700 dark:text-neutral-350 hover:bg-neutral-50 dark:hover:bg-neutral-900"
                    onClick={() => setMenuOpen(false)}
                  >
                    View Builder Profile
                  </a>
                  <button
                    type="button"
                    className="w-full text-left px-4 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20"
                    onClick={() => {
                      toast.error("Review deletion is currently restricted.")
                      setMenuOpen(false)
                    }}
                  >
                    Delete Review (Restricted)
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function BuilderReviews() {
  const pendingQuery = usePendingReviews()
  const approvedQuery = useApprovedReviews()
  const rejectedQuery = useRejectedReviews()

  const { mutateAsync: approve, isPending: isApproving, variables: approvingId } = useApproveReview()
  const { mutateAsync: reject, isPending: isRejecting, variables: rejectingId } = useRejectReview()

  // Filter & Search states
  const [search, setSearch] = useState('')
  const [builderFilter, setBuilderFilter] = useState('All')
  const [ratingFilter, setRatingFilter] = useState('All')
  const [statusFilter, setStatusFilter] = useState('All')
  const [currentPage, setCurrentPage] = useState(1)

  const pending = pendingQuery.data?.data || []
  const approved = approvedQuery.data?.data || []
  const rejected = rejectedQuery.data?.data || []

  // Combine reviews and sort by date desc
  const allReviews = useMemo(() => {
    return [...pending, ...approved, ...rejected].sort(
      (a, b) => new Date(b.created_at) - new Date(a.created_at)
    )
  }, [pending, approved, rejected])

  // Get unique builders list for filter dropdown
  const uniqueBuilders = useMemo(() => {
    const names = new Set()
    allReviews.forEach(r => {
      const name = r.builder_company_name || 
        `${r.builder_first_name ?? ''} ${r.builder_last_name ?? ''}`.trim()
      if (name) names.add(name)
    })
    return Array.from(names).sort()
  }, [allReviews])

  const filteredReviews = useMemo(() => {
    return allReviews.filter((r) => {
      // 1. Search Query
      if (search.trim()) {
        const query = search.toLowerCase()
        const reviewer = `${r.reviewer_first_name ?? ''} ${r.reviewer_last_name ?? ''}`.toLowerCase()
        const builder = (r.builder_company_name || `${r.builder_first_name ?? ''} ${r.builder_last_name ?? ''}`).toLowerCase()
        const comment = (r.comment || '').toLowerCase()
        if (!reviewer.includes(query) && !builder.includes(query) && !comment.includes(query)) {
          return false
        }
      }

      // 2. Builder Filter
      if (builderFilter !== 'All') {
        const name = r.builder_company_name || 
          `${r.builder_first_name ?? ''} ${r.builder_last_name ?? ''}`.trim()
        if (name !== builderFilter) return false
      }

      // 3. Rating Filter
      if (ratingFilter !== 'All') {
        if (Number(r.rating) !== Number(ratingFilter)) return false
      }

      // 4. Status Filter
      if (statusFilter !== 'All') {
        if (r.status !== statusFilter) return false
      }

      return true
    })
  }, [allReviews, search, builderFilter, ratingFilter, statusFilter])

  // Pagination calculations
  const PAGE_SIZE = 5
  const totalPages = Math.ceil(filteredReviews.length / PAGE_SIZE)
  const paginatedReviews = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE
    return filteredReviews.slice(start, start + PAGE_SIZE)
  }, [filteredReviews, currentPage])

  // Reset page when filters change
  React.useEffect(() => {
    setCurrentPage(1)
  }, [search, builderFilter, ratingFilter, statusFilter])

  const handleApprove = async (reviewId) => {
    try {
      await approve(reviewId)
      toast.success('Review approved successfully.')
    } catch (err) {
      toast.error(err.message || 'Failed to approve review.')
    }
  }

  const handleReject = async (reviewId) => {
    try {
      await reject(reviewId)
      toast.success('Review rejected successfully.')
    } catch (err) {
      toast.error(err.message || 'Failed to reject review.')
    }
  }

  const isActing = isApproving || isRejecting
  const actingId = approvingId ?? rejectingId
  const isLoading = pendingQuery.isLoading || approvedQuery.isLoading || rejectedQuery.isLoading

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <WifiLoader />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 p-6 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col gap-1.5">
        <h1 className="font-heading text-2xl font-bold tracking-tight text-brand-forest">
          Builder Reviews
        </h1>
        <p className="text-sm text-muted-foreground max-w-2xl">
          Moderate and manage reviews submitted for builders and their projects. Approve constructive feedback or reject spam.
        </p>
      </div>

      {/* Top Actions: Search and Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 bg-neutral-50 dark:bg-neutral-900/60 p-4 rounded-2xl border border-neutral-100 dark:border-neutral-800 mt-2">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
          <input
            type="text"
            placeholder="Search reviews..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl pl-9 pr-3 py-2 text-sm outline-none focus:border-brand-forest/50 transition-colors"
          />
        </div>

        {/* Builder Filter */}
        <select
          value={builderFilter}
          onChange={(e) => setBuilderFilter(e.target.value)}
          className="w-full bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl px-3 py-2 text-sm outline-none cursor-pointer focus:border-brand-forest/50"
        >
          <option value="All">All Builders</option>
          {uniqueBuilders.map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </select>

        {/* Rating Filter */}
        <select
          value={ratingFilter}
          onChange={(e) => setRatingFilter(e.target.value)}
          className="w-full bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl px-3 py-2 text-sm outline-none cursor-pointer focus:border-brand-forest/50"
        >
          <option value="All">All Ratings</option>
          <option value="5">5 Stars</option>
          <option value="4">4 Stars</option>
          <option value="3">3 Stars</option>
          <option value="2">2 Stars</option>
          <option value="1">1 Star</option>
        </select>

        {/* Status Filter */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="w-full bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl px-3 py-2 text-sm outline-none cursor-pointer focus:border-brand-forest/50"
        >
          <option value="All">All Statuses</option>
          <option value="Pending">Pending</option>
          <option value="Approved">Approved</option>
          <option value="Rejected">Rejected</option>
        </select>
      </div>

      {/* Reviews List */}
      <div className="mt-4 space-y-6">
        {filteredReviews.length === 0 ? (
          <div className="text-center py-16 bg-neutral-50 dark:bg-neutral-900/40 border border-dashed border-neutral-200 dark:border-neutral-800 rounded-2xl flex flex-col items-center justify-center p-6 gap-3">
            <XCircle className="h-10 w-10 text-neutral-300 dark:text-neutral-700" />
            <h3 className="font-serif text-lg font-bold text-neutral-700 dark:text-neutral-350">No Reviews Found</h3>
            <p className="text-xs text-neutral-400 max-w-sm">
              No builder reviews match the selected search criteria or filter options.
            </p>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              {paginatedReviews.map((review) => (
                <ReviewCard
                  key={review.id}
                  review={review}
                  onApprove={handleApprove}
                  onReject={handleReject}
                  isApproving={isApproving && approvingId === review.id}
                  isRejecting={isRejecting && rejectingId === review.id}
                />
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-4 mt-8 pt-4 border-t border-neutral-100 dark:border-neutral-850">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="rounded-lg h-9 gap-1"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(prev => prev - 1)}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                <span className="text-xs font-semibold text-neutral-500">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="rounded-lg h-9 gap-1"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(prev => prev + 1)}
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
