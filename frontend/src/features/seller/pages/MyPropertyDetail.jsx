import { useState } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import {
  ArrowLeft,
  Loader2,
  MapPin,
  Pencil,
  MoreVertical,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  RefreshCw,
  Upload,
  Send,
} from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/shared/components/ui/button'
import {
  useProperty,
  usePropertyVerificationHistory,
  useResubmitProperty,
  usePropertyEnquiries,
} from '@/features/properties'
import {
  getPropertyThumbnail,
  parseSpecialFeatures,
  resolveMediaUrl,
} from '@/features/properties/lib/propertyUtils'
import { formatPropertyAge } from '@/features/properties/constants/propertyAge'

function formatPrice(val) {
  const n = Number(val)
  if (Number.isNaN(n)) return '—'
  if (n >= 10000000) return `₹ ${(n / 10000000).toFixed(2)} Cr`
  if (n >= 100000) return `₹ ${(n / 100000).toFixed(1)} L`
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n)
}

function formatDateTime(value) {
  if (!value) return '—'
  return new Date(value).toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function formatDate(value) {
  if (!value) return '—'
  return new Date(value).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

function VerificationStatusSection({ property, onResubmit, isResubmitting }) {
  const status = property.verification_status

  const statusConfig = {
    Approved: {
      label: 'Approved',
      bg: 'bg-green-50 border-green-200',
      badge: 'bg-green-100 text-green-700 border-green-200',
      icon: <CheckCircle2 className="h-4 w-4 text-green-600" />,
      message: 'This property has been approved by admin.',
      textColor: 'text-green-700',
    },
    Rejected: {
      label: 'Rejected',
      bg: 'bg-red-50 border-red-200',
      badge: 'bg-red-100 text-red-700 border-red-200',
      icon: <XCircle className="h-4 w-4 text-red-600" />,
      message: 'This property has been rejected by admin.',
      textColor: 'text-red-700',
    },
    RequestChanges: {
      label: 'Changes Requested',
      bg: 'bg-orange-50 border-orange-200',
      badge: 'bg-orange-100 text-orange-700 border-orange-200',
      icon: <AlertCircle className="h-4 w-4 text-orange-600" />,
      message: 'Admin has requested changes to this property.',
      textColor: 'text-orange-700',
    },
    Resubmitted: {
      label: 'Resubmitted',
      bg: 'bg-blue-50 border-blue-200',
      badge: 'bg-blue-100 text-blue-700 border-blue-200',
      icon: <RefreshCw className="h-4 w-4 text-blue-600" />,
      message: 'You have resubmitted this property. Awaiting admin review.',
      textColor: 'text-blue-700',
    },
  }

  const cfg = statusConfig[status] ?? {
    label: 'Pending Review',
    bg: 'bg-amber-50 border-amber-200',
    badge: 'bg-amber-100 text-amber-700 border-amber-200',
    icon: <Clock className="h-4 w-4 text-amber-600" />,
    message: 'This property is pending admin review.',
    textColor: 'text-amber-700',
  }

  const canResubmit = status === 'Rejected' || status === 'RequestChanges'

  return (
    <div className={`rounded-xl border p-4 ${cfg.bg}`}>
      <h3 className="mb-3 text-sm font-semibold text-neutral-700">Verification Status</h3>

      <div className={`mb-3 inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-wide ${cfg.badge}`}>
        {cfg.icon}
        {cfg.label}
      </div>

      <p className={`mb-3 text-sm ${cfg.textColor}`}>{cfg.message}</p>

      {property.last_rejection_reason && (
        <div className="mb-3">
          <p className="text-xs font-semibold text-neutral-600">Reason</p>
          <p className="mt-1 text-sm text-neutral-700 leading-relaxed">
            {property.last_rejection_reason}
          </p>
        </div>
      )}

      {property.updated_at && status !== 'PendingReview' && (
        <div className="mb-3 flex flex-col gap-1">
          <div className="flex items-center gap-6 text-xs text-neutral-500">
            <span>
              <span className="font-medium text-neutral-700">
                {status === 'Approved' ? 'Approved On' : status === 'Resubmitted' ? 'Resubmitted On' : 'Last Updated'}:
              </span>{' '}
              {formatDateTime(property.updated_at)}
            </span>
          </div>
          <p className="text-xs text-neutral-500">
            <span className="font-medium text-neutral-700">Reviewed By:</span> Admin Team
          </p>
        </div>
      )}

      {canResubmit && (
        <div className="mt-4 flex flex-col gap-2">
          <Link
            to={`/properties/${property.id}/edit`}
            className="flex items-center justify-center gap-2 rounded-lg border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50 transition-colors"
          >
            <Upload className="h-4 w-4" /> Edit & Upload Documents
          </Link>
          <button
            type="button"
            disabled={isResubmitting}
            onClick={onResubmit}
            className="flex items-center justify-center gap-2 rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-700 transition-colors disabled:opacity-60"
          >
            {isResubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            Resubmit Property
          </button>
        </div>
      )}
    </div>
  )
}

function HistoryDot({ status }) {
  switch (status) {
    case 'Approved':
      return <div className="mt-0.5 h-3 w-3 shrink-0 rounded-full bg-green-500 ring-2 ring-green-100" />
    case 'Rejected':
      return <div className="mt-0.5 h-3 w-3 shrink-0 rounded-full bg-red-500 ring-2 ring-red-100" />
    case 'RequestChanges':
      return <div className="mt-0.5 h-3 w-3 shrink-0 rounded-full bg-orange-500 ring-2 ring-orange-100" />
    case 'Resubmitted':
      return <div className="mt-0.5 h-3 w-3 shrink-0 rounded-full bg-blue-500 ring-2 ring-blue-100" />
    default:
      return <div className="mt-0.5 h-3 w-3 shrink-0 rounded-full bg-amber-400 ring-2 ring-amber-100" />
  }
}

function historyLabel(status) {
  const map = {
    Approved: 'Approved',
    Rejected: 'Rejected',
    RequestChanges: 'Changes Requested',
    Resubmitted: 'Resubmitted',
    PendingReview: 'Pending Review',
  }
  return map[status] ?? status
}

function VerificationHistory({ history, propertyCreatedAt }) {
  const entries = [
    ...history,
    {
      _synthetic: true,
      new_status: 'Submitted',
      reason: 'Property submitted by you.',
      created_at: propertyCreatedAt,
    },
  ]

  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-4 dark:border-neutral-700 dark:bg-neutral-900">
      <h3 className="mb-4 text-sm font-semibold text-neutral-700 dark:text-neutral-200">Verification History</h3>
      <div className="flex flex-col gap-4">
        {entries.map((entry, idx) => (
          <div key={entry.id ?? `_syn_${idx}`} className="flex gap-3">
            <div className="flex flex-col items-center">
              {entry._synthetic ? (
                <div className="mt-0.5 h-3 w-3 shrink-0 rounded-full bg-neutral-400 ring-2 ring-neutral-100" />
              ) : (
                <HistoryDot status={entry.new_status} />
              )}
              {idx < entries.length - 1 && (
                <div className="mt-1.5 h-full w-px bg-neutral-200 dark:bg-neutral-700" style={{ minHeight: 24 }} />
              )}
            </div>
            <div className="pb-2 min-w-0">
              <p className="text-sm font-semibold text-neutral-800 dark:text-neutral-100">
                {entry._synthetic ? 'Submitted' : historyLabel(entry.new_status)}
              </p>
              <p className="mt-0.5 text-xs text-neutral-400">{formatDateTime(entry.created_at)}</p>
              {entry.reason && (
                <p className="mt-1 text-xs text-neutral-500 leading-relaxed">{entry.reason}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

const TABS = ['Overview', 'Amenities', 'Enquiries']

export default function MyPropertyDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useSelector((state) => state.auth)
  const [activeTab, setActiveTab] = useState('Overview')
  const [menuOpen, setMenuOpen] = useState(false)

  const { data, isLoading, isError, error } = useProperty(id)
  const { data: historyRes, isLoading: isHistoryLoading } = usePropertyVerificationHistory(id)
  const { data: enquiriesRes, isLoading: isEnquiriesLoading } = usePropertyEnquiries(id)
  const { mutateAsync: resubmit, isPending: isResubmitting } = useResubmitProperty()

  const property = data?.data
  const history = historyRes?.data ?? []
  const enquiries = enquiriesRes?.data ?? []

  const isOwner = user && property && String(user.id) === String(property.seller_id)

  const handleResubmit = async () => {
    try {
      const res = await resubmit(id)
      if (!res?.success) {
        toast.error(res?.message || 'Failed to resubmit property.')
        return
      }
      toast.success('Property resubmitted successfully. Admin will review shortly.')
    } catch (err) {
      toast.error(err.message || 'Failed to resubmit property.')
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-violet-600" />
      </div>
    )
  }

  if (isError || !property) {
    return (
      <div className="mx-auto max-w-lg py-20 text-center">
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">Property not found</h1>
        <p className="mt-2 text-sm text-neutral-500">
          {error?.message || 'This listing may have been removed.'}
        </p>
        <Link
          to="/dashboard"
          className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-violet-600 hover:underline"
        >
          <ArrowLeft className="h-4 w-4" /> Back to My Properties
        </Link>
      </div>
    )
  }

  if (!isOwner) {
    return (
      <div className="mx-auto max-w-lg py-20 text-center">
        <h1 className="text-2xl font-bold text-neutral-900">Not authorized</h1>
        <p className="mt-2 text-sm text-neutral-500">You don't have permission to view this page.</p>
        <Link to="/dashboard" className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-violet-600 hover:underline">
          <ArrowLeft className="h-4 w-4" /> Back to My Properties
        </Link>
      </div>
    )
  }

  const thumbnail = getPropertyThumbnail(property)
  const features = parseSpecialFeatures(property.special_features)
  const ageLabel =
    property.property_age != null && property.property_age !== ''
      ? formatPropertyAge(property.property_age)
      : null
  const locationLabel = [property.location_city, property.location_state].filter(Boolean).join(', ') || property.location_district || '—'

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 py-6">
      {/* Back Link */}
      <Link
        to="/dashboard"
        className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-neutral-500 hover:text-violet-600 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" /> Back to My Properties
      </Link>

      {/* Property Header */}
      <div className="mb-6 overflow-hidden rounded-2xl border border-neutral-200 bg-white dark:border-neutral-700 dark:bg-neutral-900">
        <div className="flex flex-col sm:flex-row gap-0">
          {/* Image */}
          <div className="h-48 sm:h-auto sm:w-64 sm:min-w-[16rem] shrink-0 overflow-hidden bg-neutral-100">
            <img
              src={thumbnail}
              alt={property.title}
              className="h-full w-full object-cover"
              onError={(e) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=400&q=60' }}
            />
          </div>

          {/* Info */}
          <div className="flex flex-1 flex-col justify-between p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h1 className="text-xl font-bold text-neutral-900 dark:text-white sm:text-2xl">
                  {property.title}
                </h1>
                <p className="mt-1 flex items-center gap-1.5 text-sm text-neutral-500">
                  <MapPin className="h-3.5 w-3.5 text-violet-500" /> {locationLabel}
                </p>
                <p className="mt-2 text-2xl font-bold text-neutral-900 dark:text-white">
                  {formatPrice(property.asking_price)}
                </p>
                <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-neutral-500">
                  <span className="rounded-full bg-neutral-100 px-2.5 py-0.5 font-medium dark:bg-neutral-800">
                    {property.property_type_name || 'Property'}
                  </span>
                  {property.size_sqft && (
                    <span>{Number(property.size_sqft).toLocaleString('en-IN')} Sq.ft</span>
                  )}
                  {ageLabel && <span>{ageLabel}</span>}
                </div>
              </div>

              {/* Actions */}
              <div className="relative flex shrink-0 items-center gap-2">
                <Link
                  to={`/properties/${id}/edit`}
                  className="hidden sm:flex items-center gap-1.5 rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50 transition-colors dark:border-neutral-600 dark:bg-neutral-800"
                >
                  <Pencil className="h-3.5 w-3.5" /> Edit Property
                </Link>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setMenuOpen((o) => !o)}
                    className="flex h-9 w-9 items-center justify-center rounded-lg border border-neutral-200 bg-white text-neutral-500 hover:bg-neutral-50 transition-colors dark:border-neutral-600 dark:bg-neutral-800"
                  >
                    <MoreVertical className="h-4 w-4" />
                  </button>
                  {menuOpen && (
                    <div className="absolute right-0 top-10 z-20 w-44 rounded-xl border border-neutral-200 bg-white py-1 shadow-lg dark:border-neutral-700 dark:bg-neutral-800">
                      <Link
                        to={`/properties/${id}/edit`}
                        onClick={() => setMenuOpen(false)}
                        className="flex items-center gap-2.5 px-3.5 py-2 text-sm text-neutral-700 hover:bg-neutral-50 dark:text-neutral-200 dark:hover:bg-neutral-700"
                      >
                        <Pencil className="h-4 w-4 text-neutral-400" /> Edit Property
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6 flex gap-0 border-b border-neutral-200 dark:border-neutral-700">
        {TABS.map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px ${
              activeTab === tab
                ? 'border-violet-600 text-violet-600'
                : 'border-transparent text-neutral-500 hover:text-neutral-700'
            }`}
          >
            {tab === 'Enquiries' ? `Enquiries (${enquiries.length})` : tab}
          </button>
        ))}
      </div>

      {/* Tab: Overview */}
      {activeTab === 'Overview' && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Left: Property Info + Verification */}
          <div className="flex flex-col gap-6 lg:col-span-2">
            {/* Property Information */}
            <div className="rounded-xl border border-neutral-200 bg-white p-4 dark:border-neutral-700 dark:bg-neutral-900">
              <h3 className="mb-4 text-sm font-semibold text-neutral-700 dark:text-neutral-200">Property Information</h3>
              <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                {[
                  { label: 'Property Type', value: property.property_type_name },
                  { label: 'Listed On', value: formatDate(property.created_at) },
                  { label: 'Built-up Area', value: property.size_sqft ? `${Number(property.size_sqft).toLocaleString('en-IN')} Sq.ft` : null },
                  { label: 'Property Age', value: ageLabel },
                  { label: 'City', value: property.location_city },
                  { label: 'District', value: property.location_district },
                  { label: 'State', value: property.location_state },
                  { label: 'Status', value: property.status },
                ].map(({ label, value }) => (
                  <div key={label}>
                    <p className="text-xs text-neutral-400">{label}</p>
                    <p className="mt-0.5 text-sm font-medium text-neutral-800 dark:text-neutral-100">{value || '—'}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Verification Status */}
            <VerificationStatusSection
              property={property}
              onResubmit={handleResubmit}
              isResubmitting={isResubmitting}
            />
          </div>

          {/* Right: Verification History */}
          <div className="lg:col-span-1">
            {isHistoryLoading ? (
              <div className="flex items-center justify-center rounded-xl border border-neutral-200 bg-white p-8 dark:border-neutral-700 dark:bg-neutral-900">
                <Loader2 className="h-5 w-5 animate-spin text-violet-500" />
              </div>
            ) : (
              <VerificationHistory history={history} propertyCreatedAt={property.created_at} />
            )}
          </div>
        </div>
      )}

      {/* Tab: Amenities */}
      {activeTab === 'Amenities' && (
        <div className="rounded-xl border border-neutral-200 bg-white p-5 dark:border-neutral-700 dark:bg-neutral-900">
          <h3 className="mb-4 text-sm font-semibold text-neutral-700 dark:text-neutral-200">Special Features & Amenities</h3>
          {features.length === 0 ? (
            <p className="text-sm text-neutral-400">No amenities listed for this property.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {features.map((feature) => (
                <span
                  key={feature}
                  className="rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1.5 text-sm font-medium text-neutral-700 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200"
                >
                  {feature}
                </span>
              ))}
            </div>
          )}

          {property.property_story && (
            <div className="mt-6">
              <h4 className="mb-2 text-sm font-semibold text-neutral-700 dark:text-neutral-200">Property Story</h4>
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
                {property.property_story}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Tab: Enquiries */}
      {activeTab === 'Enquiries' && (
        <div className="rounded-xl border border-neutral-200 bg-white dark:border-neutral-700 dark:bg-neutral-900 overflow-hidden">
          {isEnquiriesLoading ? (
            <div className="flex items-center justify-center p-12">
              <Loader2 className="h-6 w-6 animate-spin text-violet-500" />
            </div>
          ) : enquiries.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 p-12 text-center">
              <Send className="h-8 w-8 text-neutral-300" />
              <p className="text-sm text-neutral-400">No enquiries yet for this property.</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-neutral-100 bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800">
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-neutral-500">Buyer</th>
                  <th className="hidden px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-neutral-500 sm:table-cell">Email</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-neutral-500">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-neutral-700">
                {enquiries.map((enquiry) => {
                  const name = [enquiry.buyer_first_name, enquiry.buyer_last_name].filter(Boolean).join(' ') || 'Buyer'
                  return (
                    <tr key={enquiry.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/50">
                      <td className="px-4 py-3 font-medium text-neutral-800 dark:text-neutral-100">{name}</td>
                      <td className="hidden px-4 py-3 text-neutral-500 sm:table-cell">{enquiry.buyer_email || '—'}</td>
                      <td className="px-4 py-3 text-neutral-500">{formatDate(enquiry.created_at)}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  )
}
