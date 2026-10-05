import React, { useState, useRef, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { useNavigate, Link } from 'react-router-dom'
import { Home, PlusCircle, MoreVertical, Eye, Pencil, Trash2, Search, ArrowUpDown, SlidersHorizontal, X } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/shared/components/ui/button'
import PageLoader from '@/shared/components/ui/PageLoader'
import { useProperties, useDeleteProperty, useUpdateProperty } from '@/features/properties'
import { getPropertyThumbnail } from '@/features/properties/lib/propertyUtils'

function isBitTruthy(v) {
  return v === true || v === 1 || v === '1'
}

function formatDate(value) {
  if (!value) return '—'
  return new Date(value).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

function VerificationBadge({ status }) {
  switch (status) {
    case 'Approved':
      return (
        <span className="inline-flex items-center rounded-full bg-emerald-50 dark:bg-emerald-950/30 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide text-emerald-700 dark:text-emerald-300 border border-emerald-250/30">
          Verified
        </span>
      )
    case 'Rejected':
      return (
        <div className="flex flex-col items-start gap-1">
          <span className="inline-flex items-center rounded-full bg-brand-terracotta/10 dark:bg-brand-terracotta/20 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide text-brand-terracotta dark:text-brand-terracotta-light border border-brand-terracotta/20">
            Rejected
          </span>
          <span className="text-[11px] text-brand-terracotta/80 flex items-center gap-1">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-brand-terracotta" />
            Reason available
          </span>
        </div>
      )
    case 'RequestChanges':
      return (
        <div className="flex flex-col items-start gap-1">
          <span className="inline-flex items-center rounded-full bg-amber-50 dark:bg-amber-950/20 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide text-amber-700 dark:text-amber-355 border border-amber-200/50">
            Changes Requested
          </span>
          <span className="text-[11px] text-amber-600 flex items-center gap-1">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-amber-400" />
            Reason available
          </span>
        </div>
      )
    case 'Resubmitted':
      return (
        <span className="inline-flex items-center rounded-full bg-blue-50 dark:bg-blue-950/25 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide text-blue-700 dark:text-blue-300 border border-blue-200/50">
          Resubmitted
        </span>
      )
    default:
      return (
        <span className="inline-flex items-center rounded-full bg-amber-50 dark:bg-amber-950/20 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide text-amber-700 dark:text-amber-400 border border-amber-200">
          Pending
        </span>
      )
  }
}

function ActionMenu({ propertyId, onDelete }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const navigate = useNavigate()

  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    if (open) document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open])

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex h-8 w-8 items-center justify-center rounded-lg text-neutral-500 hover:bg-neutral-100 hover:text-neutral-700 transition-colors"
      >
        <MoreVertical className="h-4 w-4" />
      </button>
      {open && (
        <div className="absolute right-0 top-9 z-20 w-44 rounded-xl border border-neutral-200 bg-white dark:bg-neutral-900 dark:border-neutral-800 py-1 shadow-lg">
          <button
            type="button"
            onClick={() => { navigate(`/my-properties/${propertyId}`); setOpen(false) }}
            className="flex w-full items-center gap-2.5 px-3.5 py-2 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800"
          >
            <Eye className="h-4 w-4 text-neutral-400" /> View Details
          </button>
          <button
            type="button"
            onClick={() => { navigate(`/properties/${propertyId}/edit`); setOpen(false) }}
            className="flex w-full items-center gap-2.5 px-3.5 py-2 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800"
          >
            <Pencil className="h-4 w-4 text-neutral-400" /> Edit Property
          </button>
          <div className="my-1 border-t border-neutral-100 dark:border-neutral-800" />
          <button
            type="button"
            onClick={() => { onDelete(propertyId); setOpen(false) }}
            className="flex w-full items-center gap-2.5 px-3.5 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-955/30"
          >
            <Trash2 className="h-4 w-4" /> Delete
          </button>
        </div>
      )}
    </div>
  )
}

export default function SellerDashboard() {
  const { user } = useSelector((state) => state.auth)
  const navigate = useNavigate()

  const { data: propertiesRes, isLoading } = useProperties(
    { seller_id: user?.id, is_verified: 'all' },
    { enabled: !!user?.id },
  )
  const myProperties = propertiesRes?.data || []

  const { mutateAsync: deleteProperty } = useDeleteProperty()
  const { mutateAsync: updateProperty } = useUpdateProperty()
  const [deletingId, setDeletingId] = useState(null)

  // Filters & Sorting State
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('All')
  const [sortBy, setSortBy] = useState('latest')
  const [sortOpen, setSortOpen] = useState(false)

  const handleVisibilityToggle = async (prop) => {
    const isVerified = prop.verification_status === 'Approved'
    if (!isVerified) return
    const nextVisible = !isBitTruthy(prop.is_visible)
    try {
      await updateProperty({ id: prop.id, is_visible: nextVisible })
      toast.success(nextVisible ? 'Property is now visible in the feed.' : 'Property hidden from the feed.')
    } catch (err) {
      toast.error(err.message || 'Failed to update visibility.')
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this property?')) return
    setDeletingId(id)
    try {
      await deleteProperty(id)
      toast.success('Property deleted.')
    } catch (err) {
      toast.error(err.message || 'Failed to delete property.')
    } finally {
      setDeletingId(null)
    }
  }

  const totalCount = myProperties.length
  const verifiedCount = myProperties.filter((p) => p.verification_status === 'Approved' || (!p.verification_status && isBitTruthy(p.is_verified))).length
  const rejectedCount = myProperties.filter((p) => p.verification_status === 'Rejected' || p.verification_status === 'RequestChanges').length
  const pendingCount = myProperties.filter((p) => !p.verification_status || p.verification_status === 'PendingReview' || p.verification_status === 'Resubmitted').length

  // Filter & Sort properties
  const filteredAndSortedProperties = React.useMemo(() => {
    let result = [...myProperties]

    // 1. Search Filter (Strictly by title as requested)
    if (searchTerm.trim()) {
      const query = searchTerm.toLowerCase().trim()
      result = result.filter((p) => p.title?.toLowerCase().includes(query))
    }

    // 2. Status Filter
    if (selectedStatus !== 'All') {
      result = result.filter((p) => {
        if (selectedStatus === 'Verified') {
          return p.verification_status === 'Approved' || (!p.verification_status && isBitTruthy(p.is_verified))
        }
        if (selectedStatus === 'Rejected') {
          return p.verification_status === 'Rejected' || p.verification_status === 'RequestChanges'
        }
        if (selectedStatus === 'Pending') {
          return !p.verification_status || p.verification_status === 'PendingReview' || p.verification_status === 'Resubmitted'
        }
        return true
      })
    }

    // 3. Sorting (latest to oldest, oldest to latest)
    if (sortBy === 'latest') {
      result.sort((a, b) => new Date(b.created_at || b.updated_at || 0) - new Date(a.created_at || a.updated_at || 0))
    } else if (sortBy === 'oldest') {
      result.sort((a, b) => new Date(a.created_at || a.updated_at || 0) - new Date(b.created_at || b.updated_at || 0))
    }

    return result
  }, [myProperties, searchTerm, selectedStatus, sortBy])

  const summaryCards = [
    { label: 'Total Properties', value: totalCount, color: 'bg-brand-forest/10 dark:bg-brand-forest/20 text-brand-forest dark:text-brand-cream border-brand-forest/25' },
    { label: 'Verified', value: verifiedCount, color: 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/30' },
    { label: 'Rejected', value: rejectedCount, color: 'bg-brand-terracotta/10 dark:bg-brand-terracotta/20 text-brand-terracotta dark:text-brand-terracotta-light border-brand-terracotta/25' },
    { label: 'Pending', value: pendingCount, color: 'bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400 border-amber-100 dark:border-amber-900/30' },
  ]

  if (isLoading) {
    return (
      <PageLoader />
    )
  }

  return (
    <div className="mx-auto max-w-6xl w-full px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-serif font-bold text-neutral-900 dark:text-white">My Properties</h1>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">Manage all your listed properties and verification requests</p>
        </div>
        <Button
          onClick={() => navigate('/properties/create')}
          className="gap-2 bg-brand-forest hover:bg-brand-forest/90 text-white shadow-md font-semibold transition-all duration-300 rounded-xl"
        >
          <PlusCircle className="h-4 w-4" /> Add Property
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {summaryCards.map((card) => (
          <div
            key={card.label}
            className={`rounded-2xl border p-4 shadow-sm transition-all duration-300 hover:shadow-md ${card.color}`}
          >
            <p className="text-xs font-semibold uppercase tracking-wider opacity-75">{card.label}</p>
            <p className="mt-2 text-3xl font-serif font-extrabold">{card.value}</p>
          </div>
        ))}
      </div>

      {/* Properties Section */}
      {myProperties.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/30 py-16 text-center shadow-sm">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-brand-forest/10 text-brand-forest dark:bg-brand-forest/20">
            <Home className="h-6 w-6" />
          </div>
          <h3 className="text-base font-bold text-neutral-900 dark:text-white font-serif">No Properties Yet</h3>
          <p className="mt-2 max-w-xs text-xs text-neutral-555 dark:text-neutral-400">
            List your first property to get started. Properties appear here after they are registered.
          </p>
          <Button
            onClick={() => navigate('/properties/create')}
            className="mt-5 gap-2 bg-brand-forest hover:bg-brand-forest/90 text-white font-semibold rounded-xl"
          >
            <PlusCircle className="h-4 w-4" /> Add First Property
          </Button>
        </div>
      ) : (
        <div className="flex flex-col gap-5">
          {/* Controls Bar */}
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-neutral-50/70 dark:bg-neutral-900/40 p-4 rounded-2xl border border-neutral-150 dark:border-neutral-800/80 shadow-sm">
            {/* Search by Title */}
            <div className="relative w-full md:max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
              <input
                type="text"
                placeholder="Search properties by title..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full h-10 rounded-xl bg-white dark:bg-neutral-950 pl-10 pr-10 text-xs border border-neutral-200 dark:border-neutral-800 outline-none focus:border-brand-forest focus:ring-2 focus:ring-brand-forest/10 transition-all placeholder:text-neutral-400 font-sans"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 transition-colors"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            {/* Filters and Sorting selectors */}
            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-between md:justify-end">
              {/* Status pills selector */}
              <div className="flex rounded-xl border border-neutral-250/60 dark:border-neutral-800 bg-white dark:bg-neutral-950 p-1 gap-1 shrink-0">
                {['All', 'Verified', 'Pending', 'Rejected'].map((status) => (
                  <button
                    key={status}
                    type="button"
                    onClick={() => setSelectedStatus(status)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer ${
                      selectedStatus === status
                        ? 'bg-brand-forest text-white shadow-sm'
                        : 'text-neutral-600 hover:text-neutral-950 dark:text-neutral-400 dark:hover:text-white'
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>

              {/* Custom Sort Selector */}
              <div className="relative shrink-0 z-30">
                <button
                  type="button"
                  onClick={() => setSortOpen(!sortOpen)}
                  className="flex items-center gap-2 h-10 pl-9 pr-8 rounded-xl bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 text-xs font-semibold text-neutral-700 dark:text-neutral-300 hover:border-neutral-300 dark:hover:border-neutral-700 transition-all cursor-pointer relative"
                >
                  <ArrowUpDown className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-400" />
                  <span>Sort: {sortBy === 'latest' ? 'Latest First' : 'Oldest First'}</span>
                  <span className="text-[8px] text-neutral-450 ml-1">▼</span>
                </button>
                {sortOpen && (
                  <>
                    <div className="fixed inset-0 z-20" onClick={() => setSortOpen(false)} />
                    <div className="absolute right-0 mt-1.5 w-40 bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-xl shadow-xl z-30 overflow-hidden animate-in fade-in slide-in-from-top-1 duration-150">
                      {[
                        { label: 'Latest First', value: 'latest' },
                        { label: 'Oldest First', value: 'oldest' },
                      ].map((item) => (
                        <button
                          key={item.value}
                          type="button"
                          onClick={() => {
                            setSortBy(item.value)
                            setSortOpen(false)
                          }}
                          className={`w-full px-4 py-2.5 text-xs font-semibold text-left cursor-pointer transition-colors duration-200 ${
                            sortBy === item.value
                              ? 'bg-brand-forest text-white'
                              : 'text-neutral-600 hover:bg-neutral-50 dark:text-neutral-400 dark:hover:bg-neutral-900'
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Filtering empty state */}
          {filteredAndSortedProperties.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 py-16 text-center shadow-sm">
              <span className="text-3xl mb-3">🔍</span>
              <h3 className="text-base font-bold text-neutral-900 dark:text-white font-serif">No Matching Properties</h3>
              <p className="mt-2 max-w-xs text-xs text-neutral-500 dark:text-neutral-400">
                We couldn't find any properties matching "{searchTerm}" under the current filters.
              </p>
              <Button
                onClick={() => {
                  setSearchTerm('')
                  setSelectedStatus('All')
                }}
                variant="outline"
                className="mt-5 rounded-xl border-brand-terracotta text-brand-terracotta hover:bg-brand-terracotta hover:text-white font-semibold cursor-pointer"
              >
                Clear Search & Filters
              </Button>
            </div>
          ) : (
            <div className="overflow-hidden rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 shadow-sm">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/40">
                    <th className="px-4 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                      Property
                    </th>
                    <th className="px-4 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                      Status
                    </th>
                    <th className="hidden px-4 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 sm:table-cell">
                      Last Updated
                    </th>
                    <th className="px-4 py-3.5 text-right text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                  {filteredAndSortedProperties.map((prop) => (
                    <tr
                      key={prop.id}
                      className={`hover:bg-neutral-50 dark:hover:bg-neutral-900/30 transition-colors ${deletingId === prop.id ? 'opacity-50' : ''}`}
                    >
                      {/* Property cell */}
                      <td className="px-4 py-3.5 align-middle">
                        <div className="flex items-center gap-3">
                          <div className="h-12 w-16 shrink-0 overflow-hidden rounded-lg bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-800">
                            <img
                              src={getPropertyThumbnail(prop)}
                              alt={prop.title}
                              className="h-full w-full object-cover"
                              onError={(e) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=200&q=60' }}
                            />
                          </div>
                          <div className="min-w-0">
                            <p className="truncate font-semibold text-neutral-900 dark:text-white max-w-[160px] sm:max-w-xs">
                              {prop.title}
                            </p>
                            <p className="truncate text-xs text-neutral-550 dark:text-neutral-400 max-w-[160px] sm:max-w-xs">
                              {[prop.location_city, prop.location_state].filter(Boolean).join(', ') || prop.location_district || '—'}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Status cell */}
                      <td className="px-4 py-3.5 align-middle">
                        <VerificationBadge status={prop.verification_status} />
                      </td>

                      {/* Last Updated cell */}
                      <td className="hidden px-4 py-3.5 text-neutral-500 dark:text-neutral-400 sm:table-cell align-middle">
                        {formatDate(prop.updated_at)}
                      </td>

                      {/* Actions cell */}
                      <td className="px-4 py-3.5 align-middle">
                        <div className="flex items-center justify-end gap-2.5">
                          {/* Visibility toggle */}
                          {(() => {
                            const isVerified = prop.verification_status === 'Approved'
                            const isVisible = isBitTruthy(prop.is_visible)
                            return (
                              <button
                                type="button"
                                role="switch"
                                aria-checked={isVisible && isVerified}
                                disabled={!isVerified}
                                onClick={() => handleVisibilityToggle(prop)}
                                title={isVerified ? (isVisible ? 'Hide from feed' : 'Show in feed') : 'Available after verification'}
                                className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none ${
                                  !isVerified
                                    ? 'cursor-not-allowed bg-neutral-200 dark:bg-neutral-800 opacity-50'
                                    : isVisible
                                      ? 'cursor-pointer bg-emerald-500 dark:bg-emerald-600'
                                      : 'cursor-pointer bg-neutral-300 dark:bg-neutral-700'
                                }`}
                              >
                                <span
                                  className={`inline-block h-3.5 w-3.5 rounded-full bg-white shadow transition-transform ${
                                    isVisible && isVerified ? 'translate-x-4' : 'translate-x-0'
                                  }`}
                                />
                              </button>
                            )
                          })()}
                          <Link
                            to={`/my-properties/${prop.id}`}
                            className="hidden rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 px-3 py-1.5 text-xs font-semibold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-750 transition-colors sm:block"
                          >
                            View Details
                          </Link>
                          <ActionMenu propertyId={prop.id} onDelete={handleDelete} />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
