import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Building2,
  ChevronRight,
  Clock,
  Loader2,
  Search,
  ShieldCheck,
  ShieldX,
  Star,
  XCircle,
} from 'lucide-react'
import { TableSkeleton } from '@/shared/skeletons'
import { Button } from '@/shared/components/ui/button'
import { Skeleton } from '@/shared/components/ui/skeleton'
import { usePropertyTypes } from '@/features/propertyTypes'
import {
  useProperties,
  useToggleFeatured,
  getPropertyThumbnail,
  PLACEHOLDER_IMAGE,
  formatINR,
  getSellerName,
  getVerificationStatus,
} from '@/features/properties'
import StatusBadge from '@/features/properties/components/StatusBadge'
import VerificationBadge from '@/features/properties/components/VerificationBadge'
import PropertyDetailPanel from '@/features/properties/components/PropertyDetailPanel'

const PAGE_SIZE = 10

const VERIFICATION_FILTER_OPTIONS = [
  { value: 'all', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'verified', label: 'Verified' },
  { value: 'rejected', label: 'Rejected' },
]

const STATUS_FILTER_OPTIONS = [
  { value: 'all', label: 'All Status' },
  { value: 'Available', label: 'Available' },
  { value: 'Pending', label: 'Pending' },
  { value: 'Sold', label: 'Sold' },
]

function formatDate(value) {
  if (!value) return '—'
  return new Date(value).toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

function StatCard({ label, value, icon: Icon, iconClass, valueClass }) {
  return (
    <div className="group relative overflow-hidden rounded-xl border border-border bg-card px-5 py-4 shadow-sm transition-shadow hover:shadow-md">
      <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-brand-forest/30 via-brand-terracotta/30 to-transparent" />
      <div className="flex items-center gap-3.5">
        <div className={`flex size-11 shrink-0 items-center justify-center rounded-xl ${iconClass}`}>
          <Icon className="size-5" />
        </div>
        <div className="min-w-0">
          <p className="text-xs font-medium text-muted-foreground">{label}</p>
          <p className={`font-sans text-2xl font-bold tabular-nums tracking-tight ${valueClass ?? 'text-foreground'}`}>{value}</p>
        </div>
      </div>
    </div>
  )
}

export default function Properties() {
  const [search, setSearch] = useState('')
  const [verificationFilter, setVerificationFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [cityFilter, setCityFilter] = useState('all')
  const [page, setPage] = useState(1)
  const [selectedId, setSelectedId] = useState(null)
  const [isDetailOpen, setIsDetailOpen] = useState(true)
  const { mutate: toggleFeatured, isPending: isTogglingFeatured, variables: togglingId } = useToggleFeatured()

  const { data, isLoading, isError, error } = useProperties({
    is_verified: 'all',
    is_visible: 'all',
  })
  const { data: typesRes } = usePropertyTypes()
  const propertyTypes = useMemo(() => typesRes?.data ?? [], [typesRes])
  const properties = useMemo(() => data?.data ?? [], [data])

  const stats = useMemo(() => {
    let pending = 0
    let verified = 0
    let rejected = 0
    for (const p of properties) {
      const status = getVerificationStatus(p)
      if (status === 'Approved') verified += 1
      else if (status === 'Rejected') rejected += 1
      else pending += 1  // Pending, RequestChanges, Resubmitted
    }
    return { pending, verified, rejected, total: properties.length }
  }, [properties])

  const cities = useMemo(() => {
    const set = new Set()
    for (const p of properties) {
      if (p.location_city) set.add(p.location_city)
    }
    return Array.from(set).sort()
  }, [properties])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return properties.filter((p) => {
      const vStatus = getVerificationStatus(p)
      if (verificationFilter === 'pending' && vStatus === 'Approved') return false
      if (verificationFilter === 'pending' && vStatus === 'Rejected') return false
      if (verificationFilter === 'verified' && vStatus !== 'Approved') return false
      if (verificationFilter === 'rejected' && vStatus !== 'Rejected') return false

      if (
        statusFilter !== 'all' &&
        String(p.status || 'Available') !== statusFilter
      ) {
        return false
      }

      if (typeFilter !== 'all' && p.property_type_name !== typeFilter) return false
      if (cityFilter !== 'all' && p.location_city !== cityFilter) return false

      if (!q) return true
      const seller = getSellerName(p).toLowerCase()
      return (
        String(p.title || '').toLowerCase().includes(q) ||
        seller.includes(q) ||
        String(p.location_city || '').toLowerCase().includes(q)
      )
    })
  }, [properties, search, verificationFilter, statusFilter, typeFilter, cityFilter])

  // Reset to page 1 when any filter changes (state-during-render pattern)
  const [prevFilterKey, setPrevFilterKey] = useState('')
  const filterKey = `${search}|${verificationFilter}|${statusFilter}|${typeFilter}|${cityFilter}`
  if (filterKey !== prevFilterKey) {
    setPrevFilterKey(filterKey)
    setPage(1)
  }

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage = Math.min(page, totalPages)
  const pageStart = (safePage - 1) * PAGE_SIZE
  const pageItems = filtered.slice(pageStart, pageStart + PAGE_SIZE)

  // Derive the active selected ID without an effect — clamp to current page
  const validSelectedId = useMemo(() => {
    if (!isDetailOpen || pageItems.length === 0) return null
    if (selectedId && pageItems.some((p) => p.id === selectedId)) return selectedId
    return pageItems[0]?.id ?? null
  }, [pageItems, selectedId, isDetailOpen])

  const pageNumbers = useMemo(() => {
    const pages = []
    const maxVisible = 5
    let start = Math.max(1, safePage - 2)
    let end = Math.min(totalPages, start + maxVisible - 1)
    start = Math.max(1, end - maxVisible + 1)
    for (let i = start; i <= end; i += 1) pages.push(i)
    return pages
  }, [safePage, totalPages])

  const showingFrom = filtered.length === 0 ? 0 : pageStart + 1
  const showingTo = Math.min(pageStart + PAGE_SIZE, filtered.length)

  return (
    <div className="flex h-[calc(100vh-7rem)] min-h-[640px] w-full min-w-0 flex-col gap-4 overflow-x-hidden">
      <div>
        <nav className="text-xs text-muted-foreground">
          <Link to="/" className="hover:text-foreground">
            Dashboard
          </Link>
          <span className="mx-1.5">/</span>
          <span className="text-foreground">Properties</span>
        </nav>
        <h1 className="mt-1 font-heading text-2xl font-semibold tracking-tight text-brand-forest">
          All Properties
        </h1>
      </div>

      {isLoading ? (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-[88px] w-full rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Pending Verification"
            value={stats.pending}
            icon={Clock}
            iconClass="bg-amber-50 text-amber-600"
            valueClass="text-amber-700"
          />
          <StatCard
            label="Verified"
            value={stats.verified}
            icon={ShieldCheck}
            iconClass="bg-emerald-50 text-emerald-600"
            valueClass="text-emerald-700"
          />
          <StatCard
            label="Rejected"
            value={stats.rejected}
            icon={ShieldX}
            iconClass="bg-red-50 text-red-600"
            valueClass="text-red-700"
          />
          <StatCard
            label="Total Properties"
            value={stats.total}
            icon={Building2}
            iconClass="bg-[#492615]/8 text-brand-forest"
            valueClass="text-brand-forest"
          />
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative w-full max-w-[220px] shrink-0 sm:w-[220px]">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title, owner or city..."
            className="h-9 w-full rounded-md border border-input bg-background pl-9 pr-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          />
        </div>
        <select
          value={verificationFilter}
          onChange={(e) => setVerificationFilter(e.target.value)}
          className="h-9 min-w-[7.5rem] flex-1 basis-0 rounded-md border border-input bg-background px-3 text-sm"
          aria-label="Verification filter"
        >
          {VERIFICATION_FILTER_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="h-9 min-w-[7.5rem] flex-1 basis-0 rounded-md border border-input bg-background px-3 text-sm"
          aria-label="Status filter"
        >
          {STATUS_FILTER_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="h-9 min-w-[7.5rem] flex-1 basis-0 rounded-md border border-input bg-background px-3 text-sm"
          aria-label="Property type filter"
        >
          <option value="all">All Type</option>
          {propertyTypes.map((t) => (
            <option key={t.id} value={t.name}>
              {t.name}
            </option>
          ))}
        </select>
        <select
          value={cityFilter}
          onChange={(e) => setCityFilter(e.target.value)}
          className="h-9 min-w-[7.5rem] flex-1 basis-0 rounded-md border border-input bg-background px-3 text-sm"
          aria-label="City filter"
        >
          <option value="all">All City</option>
          {cities.map((city) => (
            <option key={city} value={city}>
              {city}
            </option>
          ))}
        </select>
      </div>

      <div className="flex min-h-0 flex-1 overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        <div className="flex min-w-0 flex-1 flex-col">
          {isLoading && (
            <div className="p-4">
              <TableSkeleton columns={10} rows={5} />
            </div>
          )}

          {isError && (
            <p className="p-4 text-sm text-destructive">
              {error?.message || 'Failed to load properties.'}
            </p>
          )}

          {!isLoading && !isError && filtered.length === 0 && (
            <div className="flex flex-1 flex-col items-center justify-center gap-2 p-8 text-center">
              <XCircle className="size-8 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">No properties match your filters.</p>
            </div>
          )}

          {!isLoading && !isError && filtered.length > 0 && (
            <>
                 
  <div className="min-h-0 flex-1 overflow-x-auto overflow-y-auto">
    <table className="w-full min-w-[1100px] text-sm">
                  <thead className="sticky top-0 z-10 bg-muted/80 backdrop-blur-sm">
                    <tr className="border-b border-border text-left">
                      <th className="px-4 py-3 font-medium w-16">Image</th>
                      <th className="px-4 py-3 font-medium">Title</th>
                      <th className="px-4 py-3 font-medium">Type</th>
                      <th className="px-4 py-3 font-medium">City</th>
                      <th className="px-4 py-3 font-medium">Price</th>
                      <th className="px-4 py-3 font-medium">Status</th>
                      <th className="px-4 py-3 font-medium">Verification</th>
                      <th className="px-4 py-3 font-medium">Featured</th>
                      <th className="px-4 py-3 font-medium">Created</th>
                      <th className="w-10 px-2 py-3" />
                    </tr>
                  </thead>
                  <tbody>
                    {pageItems.map((prop) => {
                      const thumb = getPropertyThumbnail(prop)
                      const isSelected = selectedId === prop.id
                      return (
                        <tr
                          key={prop.id}
                          onClick={() => {
                            setSelectedId(prop.id)
                            setIsDetailOpen(true)
                          }}
                          className={`cursor-pointer border-b border-border transition-colors last:border-0 ${
                            isSelected ? 'bg-[#492615]/5 border-l-2 border-l-brand-forest' : 'hover:bg-muted/40'
                          }`}
                        >
                          <td className="px-4 py-3">
                            <img
                              src={thumb}
                              alt=""
                              className="h-11 w-14 rounded-md object-cover bg-muted"
                              loading="lazy"
                              onError={(e) => {
                                const img = e.currentTarget
                                if (!img.dataset.fallback) {
                                  img.dataset.fallback = '1'
                                  img.src = PLACEHOLDER_IMAGE
                                }
                              }}
                            />
                          </td>
                          <td className="px-4 py-3 min-w-0">
                            <p className="font-medium text-foreground truncate">{prop.title}</p>
                            <p className="text-xs text-muted-foreground truncate">{getSellerName(prop)}</p>
                          </td>
                          <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                            {prop.property_type_name || '—'}
                          </td>
                          <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                            {prop.location_city || '—'}
                          </td>
                          <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                            {formatINR(prop.asking_price)}
                          </td>
                          <td className="px-4 py-3">
                            <StatusBadge status={prop.status} />
                          </td>
                          <td className="px-4 py-3">
                            <VerificationBadge status={getVerificationStatus(prop)} />
                          </td>
                          <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                            <button
                              type="button"
                              title={prop.is_featured ? 'Remove from featured' : 'Mark as featured'}
                              disabled={isTogglingFeatured && togglingId === prop.id}
                              onClick={() => toggleFeatured(prop.id)}
                              className={`flex items-center justify-center rounded-full w-8 h-8 transition-colors ${
                                prop.is_featured
                                  ? 'bg-amber-100 text-amber-500 hover:bg-amber-200'
                                  : 'bg-muted text-muted-foreground hover:bg-amber-50 hover:text-amber-400'
                              }`}
                            >
                              {isTogglingFeatured && togglingId === prop.id
                                ? <Loader2 className="size-4 animate-spin" />
                                : <Star className={`size-4 ${prop.is_featured ? 'fill-amber-400' : ''}`} />
                              }
                            </button>
                          </td>
                          <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                            {formatDate(prop.created_at)}
                          </td>
                          <td className="px-2 py-3 text-muted-foreground">
                            <ChevronRight className="size-4" />
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
             
              <div className="flex flex-col gap-3 border-t border-border px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs text-muted-foreground">
                  Showing {showingFrom} to {showingTo} of {filtered.length} properties
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
              
            </>
          )}
        </div>

        {validSelectedId ? (
          <PropertyDetailPanel
            propertyId={validSelectedId}
            onClose={() => setIsDetailOpen(false)}
          />
        ) : null}
      </div>
    </div>
  )
}
