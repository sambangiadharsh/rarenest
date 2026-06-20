import { Building2, Loader2, MessageSquareText, Users, TrendingUp, ArrowUpRight } from 'lucide-react'
import { useDashboardStats } from '@/features/dashboard'

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
    gradient: 'from-brand-forest to-brand-forest-mid',
    bg: 'bg-brand-forest/8',
    iconColor: 'text-brand-forest',
  },
  {
    key: 'properties',
    title: 'Total Properties',
    description: 'All property listings on the platform.',
    icon: Building2,
    gradient: 'from-brand-terracotta to-brand-terracotta-light',
    bg: 'bg-brand-terracotta/8',
    iconColor: 'text-brand-terracotta',
  },
  {
    key: 'enquiries',
    title: 'Total Enquiries',
    description: 'All enquiries sent by buyers to sellers.',
    icon: MessageSquareText,
    gradient: 'from-brand-sage to-brand-forest-mid',
    bg: 'bg-brand-sage/15',
    iconColor: 'text-brand-sage',
  },
]

function StatCard({ title, value, description, icon: Icon, bg, iconColor }) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-sm transition-shadow hover:shadow-md">
      {/* Subtle top accent line */}
      <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-brand-forest/40 via-brand-terracotta/40 to-transparent" />

      <div className="flex items-start justify-between">
        <div className={`flex size-12 items-center justify-center rounded-xl ${bg}`}>
          <Icon className={`size-6 ${iconColor}`} />
        </div>
        <div className="flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700">
          <TrendingUp className="size-3" />
          Live
        </div>
      </div>

      <div className="mt-4">
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        <p className="mt-1 font-sans text-4xl font-bold tabular-nums tracking-tight text-brand-forest">
          {value}
        </p>
        <p className="mt-2 text-xs text-muted-foreground">{description}</p>
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
      <div className="relative overflow-hidden rounded-2xl bg-brand-forest px-8 py-7">
        <div className="pointer-events-none absolute -right-8 -top-8 h-40 w-40 rounded-full bg-brand-forest-mid/50" />
        <div className="pointer-events-none absolute bottom-0 right-32 h-24 w-24 rounded-full bg-brand-sage/20" />
        <div className="relative">
          <p className="text-xs font-medium uppercase tracking-widest text-brand-sage">Admin Dashboard</p>
          <h1 className="mt-1 font-heading text-2xl font-bold text-white">Welcome back, Admin</h1>
          <p className="mt-1.5 text-sm text-brand-sand/70">
            Here is the latest snapshot of your platform activity.
          </p>
        </div>
      </div>

      {isLoading && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" />
          Loading dashboard stats…
        </div>
      )}

      {isError && (
        <p className="rounded-lg border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {error?.message || 'Failed to load dashboard stats.'}
        </p>
      )}

      {!isLoading && !isError && (
        <>
          <div>
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Platform Overview
            </h2>
            <div className="grid gap-4 md:grid-cols-3">
              {STAT_CONFIG.map((cfg) => (
                <StatCard
                  key={cfg.key}
                  title={cfg.title}
                  value={formatCount(stats[cfg.key])}
                  description={cfg.description}
                  icon={cfg.icon}
                  bg={cfg.bg}
                  iconColor={cfg.iconColor}
                />
              ))}
            </div>
          </div>

          <div>
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Quick Actions
            </h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <QuickAction
                href="/properties"
                label="Review Properties"
                description="Verify or reject pending property listings"
              />
              <QuickAction
                href="/property-types"
                label="Manage Property Types"
                description="Add or update property categories"
              />
              <QuickAction
                href="/content/about-us"
                label="Update CMS Pages"
                description="Edit About, Privacy, Terms & more"
              />
            </div>
          </div>
        </>
      )}
    </div>
  )
}
