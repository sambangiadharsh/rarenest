import { Building2, MessageSquareText, Users, FileText, Building, AlertCircle } from 'lucide-react'
import { useDashboardStats } from '@/features/dashboard'
import PageLoader from '@/shared/components/ui/PageLoader'
import { Skeleton } from '@/shared/components/ui/skeleton'

function formatCount(value) {
  const n = Number(value ?? 0)
  return new Intl.NumberFormat('en-IN').format(Number.isNaN(n) ? 0 : n)
}

const STAT_CONFIG = [
  {
    key: 'users',
    title: 'Total Users',
    description: 'All registered accounts on RareNest.',
    icon: Users,
    tint: 'bg-violet-100',
    arc: 'bg-violet-200/70',
    titleColor: 'text-violet-700',
    iconColor: 'text-violet-700',
  },
  {
    key: 'properties',
    title: 'Total Properties',
    description: 'All property listings on the platform.',
    icon: Building2,
    tint: 'bg-sky-100',
    arc: 'bg-sky-100',
    titleColor: 'text-blue-700',
    iconColor: 'text-blue-700',
  },
  {
    key: 'enquiries',
    title: 'Total Enquiries',
    description: 'All enquiries sent by buyers to sellers.',
    icon: MessageSquareText,
    tint: 'bg-emerald-100',
    arc: 'bg-emerald-100',
    titleColor: 'text-emerald-700',
    iconColor: 'text-emerald-700',
  },
]

function StatCard({ title, value, description, icon: Icon, tint, arc, titleColor, iconColor }) {
  return (
    <div className="group relative min-h-[178px] overflow-hidden rounded-xl border border-brand-sand/70 bg-white px-6 py-6 shadow-[0_10px_28px_rgba(42,42,42,0.08)] transition-all hover:-translate-y-0.5 hover:shadow-[0_16px_34px_rgba(42,42,42,0.12)]">
      <div className={`pointer-events-none absolute -right-8 -top-24 size-52 rounded-full ${arc}`} />
      <div className={`pointer-events-none absolute right-6 top-7 flex size-16 items-center justify-center rounded-xl ${tint} shadow-sm`}>
        <Icon className={`size-8 ${iconColor}`} />
      </div>

      <div className="relative max-w-[65%]">
        <p className={`text-lg font-bold uppercase leading-snug ${titleColor}`}>{title}</p>
        <p className="mt-8 font-sans text-4xl font-semibold tabular-nums tracking-normal text-slate-800">
          {value}
        </p>
        <p className="mt-3 text-xs leading-5 text-muted-foreground">{description}</p>
      </div>
    </div>
  )
}

function QuickAction({ label, description, href }) {
  return (
    <a
      href={href}
      className="flex items-start gap-3 rounded-xl border border-border bg-card p-4 transition-colors hover:border-brand-forest/30 hover:bg-brand-cream"
    >
      <div className="mt-0.5 size-2 shrink-0 rounded-full bg-brand-terracotta" />
      <div>
        <p className="text-sm font-medium text-foreground">{label}</p>
        <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
      </div>
    </a>
  )
}

export default function Dashboard() {
  const { data, isLoading, isError, error } = useDashboardStats()
  const stats = data?.data ?? {}

  return (
    <div className="space-y-8">
      {/* Welcome banner */}
      <div className="relative overflow-hidden rounded-xl border border-brand-sand/70  px-8 py-7 shadow-sm">
        <div className="pointer-events-none absolute right-0 top-0 h-full w-48 " />
        <div className="pointer-events-none absolute bottom-0 right-24 h-20 w-32 rounded-t-full bg-brand-terracotta/15" />
        <div className="relative">
          <p className="text-xs font-medium uppercase tracking-widest text-brand-sage">Admin Dashboard</p>
          <h1 className="mt-1 font-heading text-2xl font-bold text-black">Welcome back, Admin</h1>
          <p className="mt-1.5 text-sm text-black/70">
            Here is the latest snapshot of your platform activity.
          </p>
        </div>
      </div>

      {isError && (
        <p className="rounded-lg border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {error?.message || 'Failed to load dashboard stats.'}
        </p>
      )}

      {!isError && (
        <div className="space-y-8">
          <div>
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Platform Overview
            </h2>
            {isLoading ? (
              <div className="grid gap-4 md:grid-cols-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-[178px] w-full rounded-xl" />
                ))}
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-3">
                {STAT_CONFIG.map((cfg) => (
                  <StatCard
                    key={cfg.key}
                    title={cfg.title}
                    value={formatCount(stats[cfg.key])}
                    description={cfg.description}
                    icon={cfg.icon}
                    tint={cfg.tint}
                    arc={cfg.arc}
                    titleColor={cfg.titleColor}
                    iconColor={cfg.iconColor}
                  />
                ))}
              </div>
            )}
          </div>

          <div>
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Quick Actions
            </h2>
            {isLoading ? (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-[74px] w-full rounded-xl" />
                ))}
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                <QuickAction
                  href="/properties"
                  label="Review Properties"
                  description="Verify or reject pending property listings"
                />
                <QuickAction
                  href="/properties/types"
                  label="Manage Property Types"
                  description="Add or update property categories"
                />
                <QuickAction
                  href="/content/about-us"
                  label="Update CMS Pages"
                  description="Edit About, Privacy, Terms & more"
                />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
