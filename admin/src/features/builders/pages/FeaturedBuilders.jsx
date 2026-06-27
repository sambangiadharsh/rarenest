import React from 'react'
import {
  useBuilders,
  useToggleBuilderFeatured,
} from '../hooks/useBuilder'
import {
  Building2,
  Award,
  Trash2,
  Loader2,
  Star,
} from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import WifiLoader from '@/shared/components/ui/WifiLoader'
import { toast } from 'sonner'

export default function FeaturedBuilders() {
  const { data: buildersRes, isLoading } = useBuilders()
  const toggleFeaturedMutation = useToggleBuilderFeatured()

  const builders = buildersRes?.data || []
  const featuredBuilders = builders.filter((b) => b.is_featured === 1 || b.is_featured === true)

  const handleRemoveFeatured = async (id) => {
    try {
      await toggleFeaturedMutation.mutateAsync(id)
      toast.success('Builder removed from featured list.')
    } catch (err) {
      toast.error(err.message || 'Failed to remove featured status.')
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
          Featured Builders
        </h1>
        <p className="text-sm text-muted-foreground max-w-2xl">
          Promote premium partner builders to the home page carousel. Add or remove developers from featured partner slots.
        </p>
      </div>

      {/* Content */}
      <div className="mt-4">
        {featuredBuilders.length === 0 ? (
          <div className="text-center py-16 bg-neutral-50 dark:bg-neutral-900/40 border border-dashed border-neutral-200 dark:border-neutral-800 rounded-2xl flex flex-col items-center justify-center p-6 gap-3">
            <Award className="h-10 w-10 text-neutral-300 dark:text-neutral-700" />
            <h3 className="font-serif text-lg font-bold text-neutral-700 dark:text-neutral-350">No Featured Builders</h3>
            <p className="text-xs text-neutral-400 max-w-sm">
              There are currently no builders promoted to the featured showcase. Go to Approved Builders to feature one.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredBuilders.map((builder) => {
              const fullName = `${builder.first_name || ''} ${builder.last_name || ''}`.trim() || 'Builder'
              const companyInitials = builder.company_name
                ? builder.company_name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
                : 'BP'

              return (
                <div
                  key={builder.id}
                  className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 shadow-sm flex flex-col justify-between gap-5 relative overflow-hidden"
                >
                  <div className="absolute top-0 left-0 w-full h-1 bg-amber-500" />

                  <div className="flex flex-col gap-4">
                    <div className="flex items-start gap-4">
                      {/* Logo */}
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 font-bold text-lg">
                        {companyInitials}
                      </div>

                      <div className="min-w-0 flex-1">
                        <h3 className="font-heading text-lg font-bold text-neutral-900 dark:text-white leading-tight truncate">
                          {builder.company_name || fullName}
                        </h3>
                        <p className="text-xs text-neutral-500 mt-1">
                          Rep: {fullName}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-1.5 text-xs text-neutral-500 pt-3 border-t border-neutral-100 dark:border-neutral-850">
                      <div className="flex items-center justify-between">
                        <span>Rating</span>
                        <div className="flex items-center gap-1 font-bold text-neutral-900 dark:text-white">
                          <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                          <span>{Number(builder.average_rating || 0) > 0 ? Number(builder.average_rating).toFixed(1) : '—'}</span>
                          <span className="text-neutral-400 font-normal">({builder.total_reviews || 0})</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Featured Since</span>
                        <span className="font-semibold text-neutral-900 dark:text-white">
                          {new Date(builder.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Active Projects</span>
                        <span className="font-semibold text-neutral-900 dark:text-white">
                          {builder.properties_count || 0}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-neutral-100 dark:border-neutral-850">
                    <Button
                      onClick={() => handleRemoveFeatured(builder.id)}
                      disabled={toggleFeaturedMutation.isPending && toggleFeaturedMutation.variables === builder.id}
                      variant="outline"
                      className="w-full border-rose-200 text-rose-600 hover:bg-rose-50 hover:text-rose-700 font-bold h-10 gap-1.5 rounded-xl dark:border-rose-900/30 dark:hover:bg-rose-950/20"
                    >
                      {toggleFeaturedMutation.isPending && toggleFeaturedMutation.variables === builder.id ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin mr-1" />
                          Removing...
                        </>
                      ) : (
                        <>
                          <Trash2 className="h-4 w-4" />
                          Remove Featured
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
