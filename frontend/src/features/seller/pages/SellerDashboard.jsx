import React, { useState, useRef, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { useNavigate, Link } from 'react-router-dom'
import { Home, PlusCircle, MoreVertical, Eye, Pencil, Trash2 } from 'lucide-react'
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
        <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide text-green-700 border border-green-200">
          Verified
        </span>
      )
    case 'Rejected':
      return (
        <div className="flex flex-col gap-1">
          <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide text-red-700 border border-red-200">
            Rejected
          </span>
          <span className="text-[11px] text-red-500 flex items-center gap-1">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-red-400" />
            Reason available
          </span>
        </div>
      )
    case 'RequestChanges':
      return (
        <div className="flex flex-col gap-1">
          <span className="inline-flex items-center rounded-full bg-orange-100 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide text-orange-700 border border-orange-200">
            Changes Requested
          </span>
          <span className="text-[11px] text-orange-500 flex items-center gap-1">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-orange-400" />
            Reason available
          </span>
        </div>
      )
    case 'Resubmitted':
      return (
        <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide text-blue-700 border border-blue-200">
          Resubmitted
        </span>
      )
    default:
      return (
        <span className="inline-flex items-center rounded-full bg-amber-100 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide text-amber-700 border border-amber-200">
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
        <div className="absolute right-0 top-9 z-20 w-44 rounded-xl border border-neutral-200 bg-white py-1 shadow-lg">
          <button
            type="button"
            onClick={() => { navigate(`/my-properties/${propertyId}`); setOpen(false) }}
            className="flex w-full items-center gap-2.5 px-3.5 py-2 text-sm text-neutral-700 hover:bg-neutral-50"
          >
            <Eye className="h-4 w-4 text-neutral-400" /> View Details
          </button>
          <button
            type="button"
            onClick={() => { navigate(`/properties/${propertyId}/edit`); setOpen(false) }}
            className="flex w-full items-center gap-2.5 px-3.5 py-2 text-sm text-neutral-700 hover:bg-neutral-50"
          >
            <Pencil className="h-4 w-4 text-neutral-400" /> Edit Property
          </button>
          <div className="my-1 border-t border-neutral-100" />
          <button
            type="button"
            onClick={() => { onDelete(propertyId); setOpen(false) }}
            className="flex w-full items-center gap-2.5 px-3.5 py-2 text-sm text-red-600 hover:bg-red-50"
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

  const summaryCards = [
    { label: 'Total Properties', value: totalCount, color: 'bg-violet-50 text-violet-700 border-violet-100' },
    { label: 'Verified', value: verifiedCount, color: 'bg-green-50 text-green-700 border-green-100' },
    { label: 'Rejected', value: rejectedCount, color: 'bg-red-50 text-red-700 border-red-100' },
    { label: 'Pending', value: pendingCount, color: 'bg-amber-50 text-amber-700 border-amber-100' },
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
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">My Properties</h1>
          <p className="mt-1 text-sm text-neutral-500">Manage all your properties in one place</p>
        </div>
        <Button
          onClick={() => navigate('/properties/create')}
          className="gap-2 bg-violet-600 hover:bg-violet-700 text-white shadow-sm"
        >
          <PlusCircle className="h-4 w-4" /> Add Property
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {summaryCards.map((card) => (
          <div
            key={card.label}
            className={`rounded-xl border p-4 ${card.color}`}
          >
            <p className="text-xs font-medium opacity-70">{card.label}</p>
            <p className="mt-1 text-2xl font-bold">{card.value}</p>
          </div>
        ))}
      </div>

      {/* Properties Table */}
      {myProperties.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-neutral-200 bg-neutral-50 py-16 text-center dark:border-neutral-700 dark:bg-neutral-900">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-violet-100 text-violet-600">
            <Home className="h-6 w-6" />
          </div>
          <h3 className="text-base font-semibold text-neutral-900 dark:text-white">No Properties Yet</h3>
          <p className="mt-1 max-w-xs text-sm text-neutral-500">
            Add your first property to get started. Properties appear here after you list them.
          </p>
          <Button
            onClick={() => navigate('/properties/create')}
            variant="outline"
            className="mt-4 gap-2"
          >
            <PlusCircle className="h-4 w-4" /> Add First Property
          </Button>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white dark:border-neutral-700 dark:bg-neutral-900">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-100 bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800">
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-neutral-500">
                  Property
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-neutral-500">
                  Status
                </th>
                <th className="hidden px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-neutral-500 sm:table-cell">
                  Last Updated
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-neutral-500">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-700">
              {myProperties.map((prop) => (
                <tr
                  key={prop.id}
                  className={`hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors ${deletingId === prop.id ? 'opacity-50' : ''}`}
                >
                  {/* Property cell */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-16 shrink-0 overflow-hidden rounded-lg bg-neutral-100">
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
                        <p className="truncate text-xs text-neutral-500 max-w-[160px] sm:max-w-xs">
                          {[prop.location_city, prop.location_state].filter(Boolean).join(', ') || prop.location_district || '—'}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Status cell */}
                  <td className="px-4 py-3">
                    <VerificationBadge status={prop.verification_status} />
                  </td>

                  {/* Last Updated cell */}
                  <td className="hidden px-4 py-3 text-neutral-500 sm:table-cell">
                    {formatDate(prop.updated_at)}
                  </td>

                  {/* Actions cell */}
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
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
                                ? 'cursor-not-allowed bg-neutral-200 opacity-50'
                                : isVisible
                                  ? 'cursor-pointer bg-green-500'
                                  : 'cursor-pointer bg-neutral-300'
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
                        className="hidden rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-xs font-medium text-neutral-700 hover:bg-neutral-50 transition-colors sm:block dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-300"
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
  )
}
