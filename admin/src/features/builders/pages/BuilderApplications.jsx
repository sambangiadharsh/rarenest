import React from 'react'
import {
  useBuilderApplications,
  useReviewBuilderApplication,
} from '../hooks/useBuilder'
import {
  Building2,
  Check,
  X,
  User,
  Mail,
  Phone,
  Clock,
  Loader2,
  Building,
  ShieldAlert,
} from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import WifiLoader from '@/shared/components/ui/WifiLoader'
import { toast } from 'sonner'

export default function BuilderApplications() {
  const { data: appsRes, isLoading } = useBuilderApplications()
  const reviewMutation = useReviewBuilderApplication()

  const allApps = appsRes?.data || []
  const pendingApps = allApps.filter((a) => a.status === 'Pending')

  const handleReview = async (id, status) => {
    try {
      await reviewMutation.mutateAsync({ id, status })
      toast.success(`Application successfully ${status.toLowerCase()}!`)
    } catch (err) {
      toast.error(err.message || 'Failed to review application.')
    }
  }

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
          Builder Applications
        </h1>
        <p className="text-sm text-muted-foreground max-w-2xl">
          Review and verify builder applications before allowing them to publish builder project listings.
        </p>
      </div>

      {/* Content */}
      <div className="mt-4">
        {pendingApps.length === 0 ? (
          <div className="text-center py-16 bg-neutral-50 dark:bg-neutral-900/40 border border-dashed border-neutral-200 dark:border-neutral-800 rounded-2xl flex flex-col items-center justify-center p-6 gap-3">
            <Building className="h-10 w-10 text-neutral-350 dark:text-neutral-700" />
            <h3 className="font-serif text-lg font-bold text-neutral-700 dark:text-neutral-350">No Pending Applications</h3>
            <p className="text-xs text-neutral-400 max-w-sm">
              There are no builder registrations currently waiting for administrator verification.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {pendingApps.map((app) => {
              const fullName = `${app.first_name || ''} ${app.last_name || ''}`.trim() || 'Builder'
              const companyInitials = app.company_name
                ? app.company_name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
                : 'BP'

              return (
                <div
                  key={app.id}
                  className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-850 rounded-2xl p-6 shadow-sm flex flex-col justify-between gap-5 relative overflow-hidden"
                >
                  <div className="absolute top-0 left-0 w-1.5 h-full bg-brand-terracotta" />

                  <div className="flex flex-col gap-4 pl-2">
                    <div className="flex items-start gap-4">
                      {/* Builder logo placeholder */}
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-terracotta/10 text-brand-terracotta font-bold text-lg">
                        {companyInitials}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="font-heading text-lg font-bold text-neutral-900 dark:text-white leading-tight truncate">
                            {app.company_name}
                          </h3>
                          <span className="flex items-center gap-1 shrink-0 text-[10px] font-medium text-neutral-450 bg-neutral-50 dark:bg-neutral-950 px-2 py-0.5 rounded-full border border-neutral-100 dark:border-neutral-800">
                            <Clock className="h-3 w-3" />
                            {new Date(app.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="mt-1 text-xs text-neutral-500 flex items-center gap-1.5">
                          <User className="h-3.5 w-3.5" />
                          Representative: {fullName}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 pt-1">
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider bg-amber-50 text-amber-700 border border-amber-250 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/30 px-2 py-0.5 rounded-full">
                        <ShieldAlert className="h-3 w-3" />
                        Pending Verification
                      </span>
                    </div>

                    <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed bg-neutral-50/50 dark:bg-neutral-950/40 p-4 rounded-xl border border-neutral-100 dark:border-neutral-850">
                      {app.company_description}
                    </p>

                    <div className="flex flex-wrap gap-x-5 gap-y-2 text-xs text-neutral-500 pt-1 border-t border-neutral-100 dark:border-neutral-850">
                      {app.email && (
                        <span className="flex items-center gap-1.5">
                          <Mail className="h-3.5 w-3.5 text-neutral-450" />
                          {app.email}
                        </span>
                      )}
                      {app.phone && (
                        <span className="flex items-center gap-1.5">
                          <Phone className="h-3.5 w-3.5 text-neutral-450" />
                          {app.phone}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 pl-2 pt-3 border-t border-neutral-100 dark:border-neutral-850">
                    <Button
                      onClick={() => handleReview(app.id, 'Approved')}
                      disabled={reviewMutation.isPending && reviewMutation.variables?.id === app.id}
                      className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-10 gap-1.5 rounded-xl shadow-sm"
                    >
                      {reviewMutation.isPending && reviewMutation.variables?.id === app.id && reviewMutation.variables?.status === 'Approved' ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin mr-1" />
                          Approving...
                        </>
                      ) : (
                        <>
                          <Check className="h-4 w-4" />
                          Approve
                        </>
                      )}
                    </Button>
                    <Button
                      onClick={() => handleReview(app.id, 'Rejected')}
                      disabled={reviewMutation.isPending && reviewMutation.variables?.id === app.id}
                      variant="outline"
                      className="flex-1 border-rose-200 text-rose-600 hover:bg-rose-50 hover:text-rose-700 font-bold h-10 gap-1.5 rounded-xl dark:border-rose-900/30 dark:hover:bg-rose-950/20"
                    >
                      {reviewMutation.isPending && reviewMutation.variables?.id === app.id && reviewMutation.variables?.status === 'Rejected' ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin mr-1" />
                          Rejecting...
                        </>
                      ) : (
                        <>
                          <X className="h-4 w-4" />
                          Reject
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
