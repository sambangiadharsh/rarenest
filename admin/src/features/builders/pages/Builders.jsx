import React, { useState, useMemo } from 'react'
import {
  useBuilders,
  useToggleBuilderFeatured,
  useBuilderApplications,
} from '../hooks/useBuilder'
import {
  usePendingReviews,
  useApprovedReviews,
  useRejectedReviews,
} from '@/features/reviews'
import {
  Building2,
  Star,
  ShieldCheck,
  Building,
  ArrowUpRight,
  Loader2,
  FileText,
  Users,
  Award,
  Search,
} from 'lucide-react'
import { TableSkeleton } from '@/shared/skeletons'
import { Skeleton } from '@/shared/components/ui/skeleton'
import { Button } from '@/shared/components/ui/button'
import { toast } from 'sonner'

export default function Builders() {
  const { data: buildersRes, isLoading: isLoadingBuilders } = useBuilders()
  const { data: appsRes, isLoading: isLoadingApps } = useBuilderApplications()
  const pendingReviews = usePendingReviews()
  const approvedReviews = useApprovedReviews()
  const rejectedReviews = useRejectedReviews()

  const toggleFeaturedMutation = useToggleBuilderFeatured()

  const builders = buildersRes?.data || []
  const pendingApps = (appsRes?.data || []).filter(a => a.status === 'Pending').length
  const approvedBuildersCount = builders.length
  const featuredBuildersCount = builders.filter(b => b.is_featured === 1 || b.is_featured === true).length
  const reviewsCount = 
    (pendingReviews.data?.data?.length || 0) + 
    (approvedReviews.data?.data?.length || 0) + 
    (rejectedReviews.data?.data?.length || 0)

  const PAGE_SIZE = 10
  const [page, setPage] = useState(1)
  const [searchQuery, setSearchQuery] = useState('')
  const [featuredFilter, setFeaturedFilter] = useState('all')

  const filteredBuilders = useMemo(() => {
    return builders.filter((b) => {
      // Filter by featured
      const isFeatured = b.is_featured === 1 || b.is_featured === true
      if (featuredFilter === 'featured' && !isFeatured) return false
      if (featuredFilter === 'unfeatured' && isFeatured) return false

      // Filter by search query
      if (searchQuery.trim() !== '') {
        const query = searchQuery.toLowerCase()
        const company = (b.company_name || '').toLowerCase()
        const fullName = `${b.first_name || ''} ${b.last_name || ''}`.trim().toLowerCase()
        if (!company.includes(query) && !fullName.includes(query)) {
          return false
        }
      }

      return true
    })
  }, [builders, searchQuery, featuredFilter])

  // Reset to page 1 on filter change
  const [prevFilterKey, setPrevFilterKey] = useState('')
  const filterKey = `${searchQuery}|${featuredFilter}`
  if (filterKey !== prevFilterKey) {
    setPrevFilterKey(filterKey)
    setPage(1)
  }

  const totalPages = Math.max(1, Math.ceil(filteredBuilders.length / PAGE_SIZE))
  const safePage = Math.min(page, totalPages)
  const pageStart = (safePage - 1) * PAGE_SIZE
  const pageItems = filteredBuilders.slice(pageStart, pageStart + PAGE_SIZE)

  const pageNumbers = useMemo(() => {
    const pages = []
    const maxVisible = 5
    let start = Math.max(1, safePage - 2)
    let end = Math.min(totalPages, start + maxVisible - 1)
    start = Math.max(1, end - maxVisible + 1)
    for (let i = start; i <= end; i += 1) pages.push(i)
    return pages
  }, [safePage, totalPages])

  const showingFrom = filteredBuilders.length === 0 ? 0 : pageStart + 1
  const showingTo = Math.min(pageStart + PAGE_SIZE, filteredBuilders.length)

  const handleToggleFeatured = async (id) => {
    try {
      await toggleFeaturedMutation.mutateAsync(id)
      toast.success('Builder featured status updated!')
    } catch (err) {
      toast.error(err.message || 'Failed to update featured status.')
    }
  }

  const isLoading = isLoadingBuilders || isLoadingApps || pendingReviews.isLoading || approvedReviews.isLoading || rejectedReviews.isLoading

  return (
    <div className="flex flex-col gap-6 p-6 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col gap-1.5">
        <h1 className="font-heading text-2xl font-bold tracking-tight text-brand-forest">
          Approved Builders
        </h1>
        <p className="text-sm text-muted-foreground max-w-2xl">
          Manage all verified builders registered on the platform, view their stats, and toggle their featured partner status.
        </p>
      </div>

      {/* Metrics Cards */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-2">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-[100px] w-full rounded-2xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-2">
          {/* Pending Applications */}
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 flex items-center gap-4 shadow-sm">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-orange-50 text-orange-600 dark:bg-orange-950/20 dark:text-orange-400">
              <FileText className="h-6 w-6" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-neutral-500 dark:text-neutral-400">Pending Applications</span>
              <span className="text-2xl font-bold text-neutral-900 dark:text-white mt-1 leading-none">{pendingApps}</span>
              <span className="text-xs font-medium text-orange-600 dark:text-orange-400 mt-2">Needs attention</span>
            </div>
          </div>

          {/* Approved Builders */}
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 flex items-center gap-4 shadow-sm">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400">
              <Users className="h-6 w-6" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-neutral-500 dark:text-neutral-400">Approved Builders</span>
              <span className="text-2xl font-bold text-neutral-900 dark:text-white mt-1 leading-none">{approvedBuildersCount}</span>
              <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 mt-2">Active builders</span>
            </div>
          </div>

          {/* Reviews */}
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 flex items-center gap-4 shadow-sm">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600 dark:bg-blue-955/20 dark:text-blue-400">
              <Star className="h-6 w-6" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-neutral-500 dark:text-neutral-400">Reviews</span>
              <span className="text-2xl font-bold text-neutral-900 dark:text-white mt-1 leading-none">{reviewsCount}</span>
              <span className="text-xs font-medium text-blue-650 dark:text-blue-400 mt-2">Total reviews</span>
            </div>
          </div>

          {/* Featured Builders */}
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 flex items-center gap-4 shadow-sm">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-purple-50 text-purple-600 dark:bg-purple-950/20 dark:text-purple-400">
              <Award className="h-6 w-6" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-neutral-500 dark:text-neutral-400">Featured Builders</span>
              <span className="text-2xl font-bold text-neutral-900 dark:text-white mt-1 leading-none">{featuredBuildersCount}</span>
              <span className="text-xs font-medium text-purple-600 dark:text-purple-400 mt-2">Featured on site</span>
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="mt-4 flex flex-col gap-4">
        {/* Filters */}
        {builders.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative w-full max-w-[200px] shrink-0">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search company..."
                className="h-9 w-full rounded-md border border-input bg-background pl-9 pr-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
            </div>
            <select
              value={featuredFilter}
              onChange={(e) => setFeaturedFilter(e.target.value)}
              className="h-9 min-w-[140px] max-w-[160px] rounded-md border border-input bg-background px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <option value="all">All Builders</option>
              <option value="featured">Featured Only</option>
              <option value="unfeatured">Unfeatured Only</option>
            </select>
          </div>
        )}

        {isLoading ? (
          <div className="p-4 bg-card border border-border rounded-xl shadow-sm">
            <TableSkeleton columns={5} rows={5} />
          </div>
        ) : filteredBuilders.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-2 p-16 text-center border border-dashed border-border rounded-xl bg-card shadow-sm">
            <Building className="h-10 w-10 text-muted-foreground" />
            <h3 className="font-serif text-lg font-bold text-foreground mt-2">No Builders Found</h3>
            <p className="text-xs text-muted-foreground max-w-sm">
              {builders.length === 0 
                ? "There are no verified builders currently registered. Approve pending applications to get started."
                : "No builders match your current search and filter criteria."}
            </p>
          </div>
        ) : (
          <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm">
            <div className="min-h-0 flex-1 overflow-x-auto overflow-y-auto">
              <table className="w-full min-w-full text-left text-sm">
                <thead className="sticky top-0 z-10 bg-muted/80 backdrop-blur-sm">
                  <tr className="border-b border-border">
                    <th className="px-6 py-4 font-medium text-muted-foreground">Builder Info</th>
                    <th className="px-6 py-4 font-medium text-muted-foreground">Rating & Reviews</th>
                    <th className="px-6 py-4 font-medium text-muted-foreground">Projects</th>
                    <th className="px-6 py-4 font-medium text-muted-foreground">Status</th>
                    <th className="px-6 py-4 font-medium text-muted-foreground text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pageItems.map((builder) => {
                    const fullName = `${builder.first_name || ''} ${builder.last_name || ''}`.trim() || 'Builder'
                    const rating = Number(builder.average_rating || 0)
                    const isFeatured = builder.is_featured === 1 || builder.is_featured === true
                    const companyInitials = builder.company_name
                      ? builder.company_name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
                      : 'BP'

                    return (
                      <tr key={builder.id} className="border-b border-border transition-colors hover:bg-muted/40 last:border-0">
                        <td className="px-6 py-4 font-medium text-foreground">
                          <div className="flex items-center gap-3">
                            {/* Logo */}
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground font-bold text-sm">
                              {companyInitials}
                            </div>
                            <div>
                              <span className="font-bold text-foreground block">
                                {builder.company_name || fullName}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                Rep: {fullName}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1.5 font-bold text-foreground">
                            <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                            <span>{rating > 0 ? rating.toFixed(1) : '—'}</span>
                            <span className="text-muted-foreground font-normal">({builder.total_reviews || 0} reviews)</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 font-semibold text-foreground">
                          {builder.properties_count || 0} listings
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-750 dark:bg-emerald-950/20 dark:text-emerald-400">
                            <ShieldCheck className="h-3 w-3" />
                            Approved
                          </span>
                          {isFeatured && (
                            <span className="ml-2 inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-755 dark:bg-amber-955/20 dark:text-amber-450">
                              Featured ⭐
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className={`h-8 font-semibold rounded-lg ${isFeatured ? 'border-amber-250 text-amber-600 bg-amber-50/20 dark:border-amber-900/30' : ''}`}
                              onClick={() => handleToggleFeatured(builder.id)}
                              disabled={toggleFeaturedMutation.isPending && toggleFeaturedMutation.variables === builder.id}
                            >
                              {toggleFeaturedMutation.isPending && toggleFeaturedMutation.variables === builder.id ? (
                                <>
                                  <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />
                                  {isFeatured ? 'Removing...' : 'Featuring...'}
                                </>
                              ) : isFeatured ? (
                                'Remove Featured'
                              ) : (
                                'Feature Builder'
                              )}
                            </Button>
                            <a
                              href={`http://localhost:5173/builders/${builder.id}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-muted/40 transition-colors"
                            >
                              Profile <ArrowUpRight className="h-3 w-3" />
                            </a>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            <div className="flex flex-col gap-3 border-t border-border px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs text-muted-foreground">
                Showing {showingFrom} to {showingTo} of {filteredBuilders.length} builders
              </p>
              <div className="flex items-center gap-1">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={safePage <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  Prev
                </Button>
                {pageNumbers.map((n) => (
                  <Button
                    key={n}
                    type="button"
                    variant={n === safePage ? 'default' : 'outline'}
                    size="sm"
                    className="min-w-8 px-2"
                    onClick={() => setPage(n)}
                  >
                    {n}
                  </Button>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={safePage >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                >
                  Next
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
      </div>
  )
}
