import { Link } from 'react-router-dom'
import { ArrowLeft, Ticket } from 'lucide-react'
import ContentPageLayout from '@/shared/components/content/ContentPageLayout'
import { Button } from '@/shared/components/ui/button'
import { useMyTickets } from '../hooks/useSupport'

const statusColors = {
  Open: 'bg-blue-100 text-blue-700',
  'In Progress': 'bg-amber-100 text-amber-700',
  'Waiting for User': 'bg-purple-100 text-purple-700',
  Resolved: 'bg-emerald-100 text-emerald-700',
  Closed: 'bg-gray-100 text-gray-600',
}
export default function TicketListPage() {
  const { data: tickets = [], isLoading } = useMyTickets()

  return (
    <ContentPageLayout title="My Support Tickets" subtitle="Track your support requests">
      <div className="mb-6 flex items-center justify-between">
        <Link to="/support" className="inline-flex items-center gap-1 text-sm text-brand-terracotta hover:underline">
          <ArrowLeft className="h-4 w-4" /> Back to Support
        </Link>
        <Button asChild size="sm" className="bg-brand-terracotta hover:bg-brand-terracotta/90">
          <Link to="/support/new">New ticket</Link>
        </Button>
      </div>

      {isLoading ? (
        <p className="text-center text-sm text-muted-foreground">Loading tickets...</p>
      ) : tickets.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-16 text-center">
          <Ticket className="h-12 w-12 text-muted-foreground/40" />
          <p className="text-muted-foreground">No support tickets yet</p>
          <Button asChild className="bg-brand-terracotta hover:bg-brand-terracotta/90">
            <Link to="/support/new">Create your first ticket</Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {tickets.map((ticket) => (
            <Link
              key={ticket.id}
              to={`/support/${ticket.id}`}
              className="block rounded-xl border border-brand-sand bg-white p-4 transition-shadow hover:shadow-md dark:border-neutral-800 dark:bg-neutral-900"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold">{ticket.subject}</p>
                  <p className="text-xs text-muted-foreground">{ticket.category}</p>
                </div>
                <span className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-bold ${statusColors[ticket.status] || ''}`}>
                  {ticket.status}
                </span>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                {new Date(ticket.created_at).toLocaleString()}
              </p>
            </Link>
          ))}
        </div>
      )}
    </ContentPageLayout>
  )
}
