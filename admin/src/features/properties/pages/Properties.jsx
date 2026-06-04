import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Building2,
  ChevronRight,
  Clock,
  Filter,
  Search,
  ShieldCheck,
  ShieldX,
  XCircle,
} from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Skeleton } from '@/shared/components/ui/skeleton'
import { usePropertyTypes } from '@/features/propertyTypes'
import {
  useProperties,
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

function StatCard({ label, value, icon: Icon, iconClass }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 shadow-sm">
      <div className={`flex size-10 items-center justify-center rounded-lg ${iconClass}`}>
        <Icon className="size-5" />
      </div>
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-2xl font-semibold text-foreground">{value}</p>
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

  const { data, isLoading, isError, error } = useProperties({
    is_verified: 'all',
    is_visible: 'all',
  })
  const { data: typesRes } = usePropertyTypes()
  const propertyTypes = typesRes?.data ?? []
  const properties = data?.data ?? []

  const stats = useMemo(() => {
    let pending = 0
    let verified = 0
    let rejected = 0
    for (const p of properties) {
      const status = getVerificationStatus(p)
      if (status === 'Verified') verified += 1
      else if (status === 'Rejected') rejected += 1
      else pending += 1
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
      if (verificationFilter === 'pending' && vStatus !== 'Pending') return false
      if (verificationFilter === 'verified' && vStatus !== 'Verified') return false
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

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage = Math.min(page, totalPages)
  const pageStart = (safePage - 1) * PAGE_SIZE
  const pageItems = filtered.slice(pageStart, pageStart + PAGE_SIZE)

  useEffect(() => {
    setPage(1)
  }, [search, verificationFilter, statusFilter, typeFilter, cityFilter])

  useEffect(() => {
    if (pageItems.length === 0) {
      setSelectedId(null)
      return
    }
    if (!isDetailOpen) return

    const stillVisible = selectedId && pageItems.some((p) => p.id === selectedId)
    if (!stillVisible) {
      setSelectedId(pageItems[0].id)
    }
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
    <div className="flex h-[calc(100vh-7rem)] min-h-[640px] flex-col gap-4">
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

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Pending Verification"
          value={stats.pending}
          icon={Clock}
          iconClass="bg-amber-100 text-amber-700"
        />
        <StatCard
          label="Verified"
          value={stats.verified}
          icon={ShieldCheck}
          iconClass="bg-emerald-100 text-emerald-700"
        />
        <StatCard
          label="Rejected"
          value={stats.rejected}
          icon={ShieldX}
          iconClass="bg-red-100 text-red-700"
        />
        <StatCard
          label="Total Properties"
          value={stats.total}
          icon={Building2}
          iconClass="bg-blue-100 text-blue-700"
        />
      </div>

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
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-9 min-w-[7.5rem] flex-1 basis-0 gap-1.5"
        >
          <Filter className="size-4" />
          Filter
        </Button>
      </div>

      <div className="flex min-h-0 flex-1 overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        <div className="flex min-w-0 flex-1 flex-col">
          {isLoading && (
            <div className="space-y-3 p-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-14 w-full" />
              ))}
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
              <div className="min-h-0 flex-1 overflow-auto">
                <table className="w-full text-sm">
                  <thead className="sticky top-0 z-10 bg-muted/80 backdrop-blur-sm">
                    <tr className="border-b border-border text-left">
                      <th className="px-4 py-3 font-medium w-16">Image</th>
                      <th className="px-4 py-3 font-medium">Title</th>
                      <th className="px-4 py-3 font-medium">Type</th>
                      <th className="px-4 py-3 font-medium">City</th>
                      <th className="px-4 py-3 font-medium">Price</th>
                      <th className="px-4 py-3 font-medium">Status</th>
                      <th className="px-4 py-3 font-medium">Verification</th>
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
                            isSelected ? 'bg-blue-50/80' : 'hover:bg-muted/40'
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
                          <td className="px-4 py-3">
                            <p className="font-medium text-foreground">{prop.title}</p>
                            <p className="text-xs text-muted-foreground">{getSellerName(prop)}</p>
                          </td>
                          <td className="px-4 py-3 text-muted-foreground">
                            {prop.property_type_name || '—'}
                          </td>
                          <td className="px-4 py-3 text-muted-foreground">
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

        {isDetailOpen && selectedId ? (
          <PropertyDetailPanel
            propertyId={selectedId}
            onClose={() => setIsDetailOpen(false)}
          />
        ) : (
          !isLoading &&
          !isError &&
          filtered.length > 0 && (
            <aside className="hidden w-[480px] shrink-0 items-center justify-center border-l border-border bg-muted/20 p-8 text-center text-sm text-muted-foreground lg:flex">
              Select a property to view details
            </aside>
          )
        )}
      </div>
    </div>
  )
}
