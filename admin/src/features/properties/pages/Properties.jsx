import { useState } from 'react'
import { Building2, Check, Loader2, X } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/shared/components/ui/button'
import { Label } from '@/shared/components/ui/label'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card'
import { Skeleton } from '@/shared/components/ui/skeleton'
import {
  useProperties,
  useVerifyProperty,
  getPropertyThumbnail,
  PLACEHOLDER_IMAGE,
} from '@/features/properties'

const VERIFICATION_FILTERS = [
  { value: 'all', label: 'All properties', param: 'all' },
  { value: 'verified', label: 'Verified', param: 'true' },
  { value: 'unverified', label: 'Unverified', param: 'false' },
]

function formatDate(value) {
  if (!value) return '—'
  return new Date(value).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

function formatINR(val) {
  const n = Number(val)
  if (Number.isNaN(n)) return '—'
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(2)} Cr`
  if (n >= 100000) return `₹${(n / 100000).toFixed(1)} L`
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(n)
}

function isVerified(prop) {
  return prop.is_verified === true || prop.is_verified === 1
}

export default function Properties() {
  const [verificationFilter, setVerificationFilter] = useState('all')
  const filterConfig = VERIFICATION_FILTERS.find((f) => f.value === verificationFilter)
  const { data, isLoading, isError, error } = useProperties({
    is_verified: filterConfig?.param ?? 'all',
  })
  const { mutateAsync: verifyProperty, isPending: isVerifying, variables } =
    useVerifyProperty()

  const properties = data?.data ?? []

  const handleVerify = async (id, is_verified) => {
    try {
      const res = await verifyProperty({ id, is_verified })
      if (!res?.success) {
        toast.error(res?.message || 'Failed to update verification.')
        return
      }
      toast.success(
        is_verified
          ? 'Property verified. It will appear on the public home page.'
          : 'Property unverified. It is hidden from the public site.',
      )
    } catch (err) {
      toast.error(err.message || 'Failed to update verification.')
    }
  }

  const pendingId = isVerifying ? variables?.id : null

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold tracking-tight text-brand-forest">
          All Properties
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Review listings and verify properties before they appear on the public
          home page.
        </p>
      </div>

      <Card className="border-brand-sand">
        <CardHeader className="pb-4">
          <CardTitle className="text-base">Listings</CardTitle>
          <CardDescription>
            Filter by verification status. Verified properties are visible on the
            public site.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col gap-2 sm:max-w-xs">
            <Label htmlFor="verification-filter">Verification status</Label>
            <select
              id="verification-filter"
              value={verificationFilter}
              onChange={(e) => setVerificationFilter(e.target.value)}
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            >
              {VERIFICATION_FILTERS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {isLoading && (
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          )}

          {isError && (
            <p className="text-sm text-destructive">
              {error?.message || 'Failed to load properties.'}
            </p>
          )}

          {!isLoading && !isError && properties.length === 0 && (
            <div className="flex flex-col items-center gap-2 py-8 text-center">
              <Building2 className="size-8 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                No properties match this filter.
              </p>
            </div>
          )}

          {!isLoading && !isError && properties.length > 0 && (
            <div className="overflow-x-auto rounded-md border border-border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/50 text-left">
                    <th className="px-4 py-3 font-medium w-16">Image</th>
                    <th className="px-4 py-3 font-medium">Title</th>
                    <th className="px-4 py-3 font-medium">Type</th>
                    <th className="px-4 py-3 font-medium">City</th>
                    <th className="px-4 py-3 font-medium">Price</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium">Verified</th>
                    <th className="px-4 py-3 font-medium">Created</th>
                    <th className="px-4 py-3 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {properties.map((prop) => {
                    const verified = isVerified(prop)
                    const rowPending = pendingId === prop.id
                    const thumb = getPropertyThumbnail(prop)
                    return (
                      <tr
                        key={prop.id}
                        className="border-b border-border last:border-0"
                      >
                        <td className="px-4 py-3">
                          <img
                            src={thumb}
                            alt=""
                            className="h-12 w-16 rounded-md object-cover bg-muted"
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
                        <td className="px-4 py-3 font-medium">{prop.title}</td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {prop.property_type_name || '—'}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {prop.location_city || '—'}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {formatINR(prop.asking_price)}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {prop.status || '—'}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={
                              verified
                                ? 'inline-flex rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-800'
                                : 'inline-flex rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800'
                            }
                          >
                            {verified ? 'Yes' : 'No'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {formatDate(prop.created_at)}
                        </td>
                        <td className="px-4 py-3 text-right">
                          {verified ? (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              disabled={rowPending}
                              onClick={() => handleVerify(prop.id, false)}
                            >
                              {rowPending ? (
                                <Loader2 className="size-4 animate-spin" />
                              ) : (
                                <X className="size-4" />
                              )}
                              Unverify
                            </Button>
                          ) : (
                            <Button
                              type="button"
                              size="sm"
                              disabled={rowPending}
                              onClick={() => handleVerify(prop.id, true)}
                            >
                              {rowPending ? (
                                <Loader2 className="size-4 animate-spin" />
                              ) : (
                                <Check className="size-4" />
                              )}
                              Verify
                            </Button>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
