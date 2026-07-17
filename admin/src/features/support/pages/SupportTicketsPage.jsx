import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Ticket, Clock, AlertCircle } from 'lucide-react'
import { Input } from '@/shared/components/ui/input'
import { Skeleton } from '@/shared/components/ui/skeleton'
import { useAdminTickets } from '../hooks/useSupportAdmin'
import { TICKET_CATEGORIES, TICKET_PRIORITIES, TICKET_STATUSES } from '../api/supportApi'

const statusColors = {
  Open: 'bg-blue-100 text-blue-700',
  'In Progress': 'bg-amber-100 text-amber-700',
  'Waiting for User': 'bg-purple-100 text-purple-700',
  Resolved: 'bg-emerald-100 text-emerald-700',
  Closed: 'bg-gray-100 text-gray-600',
}

const priorityColors = {
  High: 'text-red-600',
  Medium: 'text-amber-600',
  Low: 'text-gray-500',
}

export default function SupportTicketsPage() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [category, setCategory] = useState('')
  const [priority, setPriority] = useState('')

  const filters = useMemo(() => ({
    search: search || undefined,
    status: status || undefined,
    category: category || undefined,
    priority: priority || undefined,
  }), [search, status, category, priority])

  const { data, isLoading } = useAdminTickets(filters)
  const tickets = data?.tickets ?? []
  const count = data?.count ?? 0

  const openCount = tickets.filter((t) => t.status === 'Open').length
  const highCount = tickets.filter((t) => t.priority === 'High').length

  return (
    <div className="flex flex-col gap-6 p-6 max-w-7xl mx-auto w-full">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Support Tickets</h1>
        <p className="text-sm text-muted-foreground">Manage user support requests</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border bg-card p-4">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Ticket className="h-4 w-4" />
            <span className="text-sm">Total</span>
          </div>
          <p className="mt-1 text-2xl font-bold">{count}</p>
        </div>
        <div className="rounded-xl border bg-card p-4">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span className="text-sm">Open (page)</span>
          </div>
          <p className="mt-1 text-2xl font-bold">{openCount}</p>
        </div>
        <div className="rounded-xl border bg-card p-4">
          <div className="flex items-center gap-2 text-muted-foreground">
            <AlertCircle className="h-4 w-4" />
            <span className="text-sm">High priority</span>
          </div>
          <p className="mt-1 text-2xl font-bold text-red-600">{highCount}</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="relative min-w-[200px] flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search tickets..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="rounded-lg border bg-background px-3 py-2 text-sm"
        >
          <option value="">All statuses</option>
          {TICKET_STATUSES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="rounded-lg border bg-background px-3 py-2 text-sm"
        >
          <option value="">All categories</option>
          {TICKET_CATEGORIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <select
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
          className="rounded-lg border bg-background px-3 py-2 text-sm"
        >
          <option value="">All priorities</option>
          {TICKET_PRIORITIES.map((p) => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
      </div>

      <div className="rounded-xl border bg-card overflow-hidden">
        {isLoading ? (
          <div className="p-6 space-y-3">
            {[1, 2, 3].map((i) => <Skeleton key={i} className="h-14 w-full" />)}
          </div>
        ) : tickets.length === 0 ? (
          <p className="p-8 text-center text-sm text-muted-foreground">No tickets found</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/50">
              <tr>
                <th className="px-4 py-3 text-left font-medium">Subject</th>
                <th className="px-4 py-3 text-left font-medium">User</th>
                <th className="px-4 py-3 text-left font-medium">Category</th>
                <th className="px-4 py-3 text-left font-medium">Priority</th>
                <th className="px-4 py-3 text-left font-medium">Status</th>
                <th className="px-4 py-3 text-left font-medium">Created</th>
              </tr>
            </thead>
            <tbody>
              {tickets.map((ticket) => (
                <tr
                  key={ticket.id}
                  onClick={() => navigate(`/support/tickets/${ticket.id}`)}
                  className="cursor-pointer border-b transition-colors hover:bg-muted/30"
                >
                  <td className="px-4 py-3 font-medium">{ticket.subject}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {ticket.user_first_name} {ticket.user_last_name}
                    <br />
                    <span className="text-xs">{ticket.user_email}</span>
                  </td>
                  <td className="px-4 py-3">{ticket.category}</td>
                  <td className={`px-4 py-3 font-semibold ${priorityColors[ticket.priority]}`}>
                    {ticket.priority}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${statusColors[ticket.status]}`}>
                      {ticket.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {new Date(ticket.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
