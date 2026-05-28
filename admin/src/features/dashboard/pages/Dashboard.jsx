import { Building2, Loader2, MessageSquareText, Users } from 'lucide-react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card'
import { useDashboardStats } from '@/features/dashboard'

function formatCount(value) {
  const n = Number(value ?? 0)
  return new Intl.NumberFormat('en-IN').format(Number.isNaN(n) ? 0 : n)
}

function StatCard({ title, value, description, icon: Icon }) {
  return (
    <Card className="border-brand-sand">
      <CardHeader className="pb-2">
        <CardDescription>{title}</CardDescription>
        <CardTitle className="flex items-center gap-2 text-3xl text-brand-forest">
          <Icon className="size-6 text-brand-terracotta" />
          {value}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  )
}

export default function Dashboard() {
  const { data, isLoading, isError, error } = useDashboardStats()
  const stats = data?.data ?? {}

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold tracking-tight text-brand-forest">
          Welcome Back, Admin
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Here is the latest snapshot of your platform activity.
        </p>
      </div>

      {isLoading && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" />
          Loading dashboard stats...
        </div>
      )}

      {isError && (
        <p className="text-sm text-destructive">
          {error?.message || 'Failed to load dashboard stats.'}
        </p>
      )}

      {!isLoading && !isError && (
        <div className="grid gap-4 md:grid-cols-3">
          <StatCard
            title="Total Users"
            value={formatCount(stats.users)}
            description="All registered accounts on RareNest."
            icon={Users}
          />
          <StatCard
            title="Total Properties"
            value={formatCount(stats.properties)}
            description="All property listings created on the platform."
            icon={Building2}
          />
          <StatCard
            title="Total Enquiries"
            value={formatCount(stats.enquiries)}
            description="All enquiries sent by buyers to sellers."
            icon={MessageSquareText}
          />
        </div>
      )}
    </div>
  )
}