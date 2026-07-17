import { useParams, Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { ArrowLeft, Loader2, User } from 'lucide-react'
import { toast } from 'sonner'
import TicketChat from '../components/TicketChat'
import {
  useAdminTicket,
  useAdmins,
  useAssignTicket,
  useUpdateTicketStatus,
  useUpdateTicketPriority,
} from '../hooks/useSupportAdmin'
import { TICKET_STATUSES, TICKET_PRIORITIES } from '../api/supportApi'

export default function SupportTicketDetailPage() {
  const { id } = useParams()
  const { user } = useSelector((state) => state.auth)

  const { data: ticket, isLoading } = useAdminTicket(id)
  const { data: admins = [] } = useAdmins()
  const { mutateAsync: assign } = useAssignTicket()
  const { mutateAsync: updateStatus } = useUpdateTicketStatus()
  const { mutateAsync: updatePriority } = useUpdateTicketPriority()

  const handleAssign = async (adminId) => {
    try {
      await assign({ ticketId: id, adminId })
      toast.success('Ticket assigned')
    } catch (err) {
      toast.error(err.message || 'Failed to assign')
    }
  }

  const handleStatus = async (status) => {
    try {
      await updateStatus({ ticketId: id, status })
      toast.success('Status updated')
    } catch (err) {
      toast.error(err.message || 'Failed to update status')
    }
  }

  const handlePriority = async (priority) => {
    try {
      await updatePriority({ ticketId: id, priority })
      toast.success('Priority updated')
    } catch (err) {
      toast.error(err.message || 'Failed to update priority')
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!ticket) {
    return <p className="p-8 text-center text-muted-foreground">Ticket not found</p>
  }

  return (
    <div className="mx-auto max-w-5xl p-6">
      <Link
        to="/support/tickets"
        className="mb-4 inline-flex items-center gap-1 text-sm text-primary hover:underline"
      >
        <ArrowLeft className="h-4 w-4" /> Back to tickets
      </Link>

      <div className="mb-6 grid gap-6 lg:grid-cols-[1fr_280px]">
        <div className="rounded-xl border bg-card p-5">
          <h1 className="text-xl font-bold">{ticket.subject}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{ticket.category}</p>
          <p className="mt-4 text-sm">{ticket.description}</p>
        </div>

        <div className="space-y-4 rounded-xl border bg-card p-5">
          <div className="flex items-center gap-2 text-sm">
            <User className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="font-medium">{ticket.user_first_name} {ticket.user_last_name}</p>
              <p className="text-xs text-muted-foreground">{ticket.user_email}</p>
              {ticket.user_phone && (
                <p className="text-xs text-muted-foreground">{ticket.user_phone}</p>
              )}
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">Assign to</label>
            <select
              value={ticket.assigned_admin_id || ''}
              onChange={(e) => handleAssign(e.target.value)}
              className="w-full rounded-lg border px-3 py-2 text-sm"
            >
              <option value="">Unassigned</option>
              {admins.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.first_name} {a.last_name}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => handleAssign(user.id)}
              className="mt-2 text-xs text-primary hover:underline"
            >
              Assign to me
            </button>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">Status</label>
            <select
              value={ticket.status}
              onChange={(e) => handleStatus(e.target.value)}
              className="w-full rounded-lg border px-3 py-2 text-sm"
            >
              {TICKET_STATUSES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-muted-foreground">Priority</label>
            <select
              value={ticket.priority}
              onChange={(e) => handlePriority(e.target.value)}
              className="w-full rounded-lg border px-3 py-2 text-sm"
            >
              {TICKET_PRIORITIES.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="rounded-xl border bg-card p-5">
        <h2 className="mb-4 font-semibold">Conversation</h2>
        <TicketChat ticketId={id} conversationId={ticket.conversation_id} />
      </div>
    </div>
  )
}
