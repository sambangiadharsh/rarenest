import React, { useState } from 'react'
import {
  useBuilderApplications,
  useReviewBuilderApplication,
  useBuilders,
  useToggleBuilderFeatured
} from '../hooks/useBuilder'
import {
  Building2,
  Check,
  X,
  Star,
  User,
  Mail,
  Phone,
  Clock,
  Loader2,
  ShieldCheck,
  Building,
} from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import WifiLoader from '@/shared/components/ui/WifiLoader'
import { toast } from 'sonner'

export default function BuilderApplications() {
  const [activeTab, setActiveTab] = useState('pending')
  const { data: appsRes, isLoading: appsLoading } = useBuilderApplications()
  const { data: buildersRes, isLoading: buildersLoading } = useBuilders()

  const reviewMutation = useReviewBuilderApplication()
  const toggleFeaturedMutation = useToggleBuilderFeatured()

  const allApps = appsRes?.data || []
  const builders = buildersRes?.data || []

  const pendingApps = allApps.filter((a) => a.status === 'Pending')
  const historyApps = allApps.filter((a) => a.status !== 'Pending')

  const handleReview = async (id, status) => {
    try {
      await reviewMutation.mutateAsync({ id, status })
      toast.success(`Application successfully ${status.toLowerCase()}!`)
    } catch (err) {
      toast.error(err.message || 'Failed to review application.')
    }
  }

  const handleToggleFeatured = async (id) => {
    try {
      await toggleFeaturedMutation.mutateAsync(id)
      toast.success('Builder featured status updated!')
    } catch (err) {
      toast.error(err.message || 'Failed to update featured status.')
    }
  }

  const isLoading = appsLoading || buildersLoading

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
        <h1 className="font-serif text-3xl font-extrabold text-neutral-900 dark:text-white leading-tight">
          Builders Management
        </h1>
        <p className="text-sm text-neutral-500 max-w-2xl font-sans">
          Review builder registrations, approve professional credentials, and manage featured developer status.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-neutral-200 dark:border-neutral-800 gap-1 mt-2">
        <button
          onClick={() => setActiveTab('pending')}
          className={`pb-3.5 px-5 text-sm font-bold border-b-2 transition-all relative ${
            activeTab === 'pending'
              ? 'border-brand-bronze text-brand-bronze font-extrabold'
              : 'border-transparent text-neutral-450 hover:text-neutral-600 dark:text-neutral-500'
          }`}
        >
          Pending Applications
          {pendingApps.length > 0 && (
            <span className="ml-2 bg-brand-bronze text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
              {pendingApps.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('builders')}
          className={`pb-3.5 px-5 text-sm font-bold border-b-2 transition-all ${
            activeTab === 'builders'
              ? 'border-brand-bronze text-brand-bronze font-extrabold'
              : 'border-transparent text-neutral-450 hover:text-neutral-600 dark:text-neutral-500'
          }`}
        >
          Approved Builders
          {builders.length > 0 && (
            <span className="ml-2 bg-emerald-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
              {builders.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`pb-3.5 px-5 text-sm font-bold border-b-2 transition-all ${
            activeTab === 'history'
              ? 'border-brand-bronze text-brand-bronze font-extrabold'
              : 'border-transparent text-neutral-450 hover:text-neutral-600 dark:text-neutral-500'
          }`}
        >
          Application History
        </button>
      </div>

      {/* Content */}
      <div className="mt-4">
        {/* Pending Applications Tab */}
        {activeTab === 'pending' && (
          <div>
            {pendingApps.length === 0 ? (
              <div className="text-center py-16 bg-neutral-50 dark:bg-neutral-900/40 border border-dashed border-neutral-200 dark:border-neutral-800 rounded-2xl flex flex-col items-center justify-center p-6 gap-3">
                <Building className="h-10 w-10 text-neutral-300 dark:text-neutral-700" />
                <h3 className="font-serif text-lg font-bold text-neutral-700 dark:text-neutral-300">No Pending Applications</h3>
                <p className="text-xs text-neutral-400 max-w-sm">
                  There are no builder registrations currently waiting for administrator verification.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {pendingApps.map((app) => (
                  <div
                    key={app.id}
                    className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 shadow-sm flex flex-col justify-between gap-5 relative overflow-hidden"
                  >
                    <div className="absolute top-0 left-0 w-1.5 h-full bg-brand-bronze" />

                    <div className="flex flex-col gap-3.5 pl-2">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <span className="text-[10px] font-bold tracking-widest text-brand-bronze uppercase">
                            Builder Application
                          </span>
                          <h3 className="font-serif text-xl font-bold text-neutral-900 dark:text-white mt-0.5">
                            {app.company_name}
                          </h3>
                        </div>
                        <span className="flex items-center gap-1 text-[11px] font-medium text-neutral-400 bg-neutral-50 dark:bg-neutral-950 px-2.5 py-1 rounded-full border border-neutral-100 dark:border-neutral-800">
                          <Clock className="h-3 w-3" />
                          {new Date(app.created_at).toLocaleDateString()}
                        </span>
                      </div>

                      <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed bg-neutral-50/50 dark:bg-neutral-950/40 p-4 rounded-xl border border-neutral-100 dark:border-neutral-850">
                        {app.company_description}
                      </p>

                      <div className="flex flex-wrap gap-x-5 gap-y-2 text-xs text-neutral-500 pt-1.5">
                        <span className="flex items-center gap-1.5">
                          <User className="h-3.5 w-3.5 text-neutral-400" />
                          {app.first_name} {app.last_name}
                        </span>
                        {app.email && (
                          <span className="flex items-center gap-1.5">
                            <Mail className="h-3.5 w-3.5 text-neutral-400" />
                            {app.email}
                          </span>
                        )}
                        {app.phone && (
                          <span className="flex items-center gap-1.5">
                            <Phone className="h-3.5 w-3.5 text-neutral-400" />
                            {app.phone}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-3 pl-2 pt-3 border-t border-neutral-100 dark:border-neutral-850">
                      <Button
                        onClick={() => handleReview(app.id, 'Approved')}
                        disabled={reviewMutation.isPending}
                        className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-10 gap-1.5 rounded-xl shadow-md shadow-emerald-600/10"
                      >
                        {reviewMutation.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Check className="h-4 w-4" />
                        )}
                        Approve
                      </Button>
                      <Button
                        onClick={() => handleReview(app.id, 'Rejected')}
                        disabled={reviewMutation.isPending}
                        variant="outline"
                        className="flex-1 border-rose-200 text-rose-600 hover:bg-rose-50 hover:text-rose-700 font-bold h-10 gap-1.5 rounded-xl dark:border-rose-900/30 dark:hover:bg-rose-950/20"
                      >
                        {reviewMutation.isPending ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <X className="h-4 w-4" />
                        )}
                        Reject
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Approved Builders Tab */}
        {activeTab === 'builders' && (
          <div>
            {builders.length === 0 ? (
              <div className="text-center py-16 bg-neutral-50 dark:bg-neutral-900/40 border border-dashed border-neutral-200 dark:border-neutral-800 rounded-2xl flex flex-col items-center justify-center p-6 gap-3">
                <Building className="h-10 w-10 text-neutral-300 dark:text-neutral-700" />
                <h3 className="font-serif text-lg font-bold text-neutral-700 dark:text-neutral-300">No Approved Builders</h3>
                <p className="text-xs text-neutral-400 max-w-sm">
                  There are no verified builders currently registered. Approve pending applications to get started.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {builders.map((builder) => {
                  const fullName = `${builder.first_name || ''} ${builder.last_name || ''}`.trim() || 'Builder'
                  const rating = Number(builder.average_rating || 0)
                  return (
                    <div
                      key={builder.id}
                      className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-5 shadow-sm flex flex-col justify-between gap-5 relative overflow-hidden"
                    >
                      <div className="flex flex-col gap-4">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold tracking-widest text-emerald-600 uppercase bg-emerald-50 dark:bg-emerald-950/20 px-2 py-0.5 rounded-full">
                              <ShieldCheck className="h-3 w-3" />
                              Approved
                            </span>
                            <h3 className="font-bold text-lg text-neutral-900 dark:text-white mt-1.5 leading-tight">
                              {builder.company_name || fullName}
                            </h3>
                            <p className="text-xs text-neutral-500 mt-0.5 flex items-center gap-1">
                              <User className="h-3.5 w-3.5" />
                              Representative: {fullName}
                            </p>
                          </div>

                          <button
                            onClick={() => handleToggleFeatured(builder.id)}
                            title="Toggle featured status"
                            className={`p-2 rounded-xl border transition-all duration-300 flex items-center justify-center shrink-0 ${
                              builder.is_featured === 1 || builder.is_featured === true
                                ? 'bg-amber-500/10 border-amber-400 text-amber-500 shadow-sm'
                                : 'border-neutral-200 text-neutral-400 hover:border-amber-400 hover:text-amber-500 dark:border-neutral-800'
                            }`}
                          >
                            <Star className={`h-4.5 w-4.5 ${builder.is_featured === 1 || builder.is_featured === true ? 'fill-amber-500' : ''}`} />
                          </button>
                        </div>

                        {builder.bio && (
                          <p className="text-xs text-neutral-600 dark:text-neutral-450 line-clamp-3 leading-relaxed">
                            {builder.bio}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center justify-between border-t border-neutral-100 dark:border-neutral-850 pt-4 mt-1 text-xs">
                        <div className="flex items-center gap-1.5 text-neutral-500">
                          <Building2 className="h-4 w-4 text-neutral-400" />
                          <span>{builder.properties_count || 0} listings</span>
                        </div>
                        <div className="flex items-center gap-1 text-neutral-850 dark:text-neutral-200 font-bold">
                          <Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
                          <span>{rating > 0 ? rating.toFixed(1) : '—'}</span>
                          <span className="text-neutral-400 font-normal">({builder.total_reviews || 0})</span>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* Application History Tab */}
        {activeTab === 'history' && (
          <div>
            {historyApps.length === 0 ? (
              <div className="text-center py-16 bg-neutral-50 dark:bg-neutral-900/40 border border-dashed border-neutral-200 dark:border-neutral-800 rounded-2xl flex flex-col items-center justify-center p-6 gap-3">
                <Building className="h-10 w-10 text-neutral-300 dark:text-neutral-700" />
                <h3 className="font-serif text-lg font-bold text-neutral-700 dark:text-neutral-300">No Review History</h3>
                <p className="text-xs text-neutral-400 max-w-sm">
                  No applications have been processed yet. Actioned registrations will be archived here.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm">
                <table className="min-w-full divide-y divide-neutral-200 dark:divide-neutral-800 text-left text-sm">
                  <thead className="bg-neutral-50 dark:bg-neutral-950 font-bold text-neutral-700 dark:text-neutral-300">
                    <tr>
                      <th className="px-6 py-4">Company Name</th>
                      <th className="px-6 py-4">Representative</th>
                      <th className="px-6 py-4">Submitted Date</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4">Reviewed Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800 text-neutral-600 dark:text-neutral-400">
                    {historyApps.map((app) => (
                      <tr key={app.id} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-950/20">
                        <td className="px-6 py-4 font-bold text-neutral-900 dark:text-white">
                          {app.company_name}
                        </td>
                        <td className="px-6 py-4">
                          {app.first_name} {app.last_name}
                        </td>
                        <td className="px-6 py-4">
                          {new Date(app.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                            app.status === 'Approved'
                              ? 'bg-emerald-50 text-emerald-750 dark:bg-emerald-950/20 dark:text-emerald-400'
                              : 'bg-rose-50 text-rose-750 dark:bg-rose-950/20 dark:text-rose-450'
                          }`}>
                            {app.status === 'Approved' ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                            {app.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-neutral-400 text-xs">
                          {app.reviewed_at ? new Date(app.reviewed_at).toLocaleDateString() : '—'}
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
    </div>
  )
}
