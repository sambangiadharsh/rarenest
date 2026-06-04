import { getStatusBadgeClass } from '../lib/propertyUtils'

export default function StatusBadge({ status }) {
  if (!status) return <span className="text-muted-foreground">—</span>
  return <span className={getStatusBadgeClass(status)}>{status}</span>
}
