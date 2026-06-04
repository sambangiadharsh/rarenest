import { getVerificationBadgeClass } from '../lib/propertyUtils'

export default function VerificationBadge({ status }) {
  if (!status) return <span className="text-muted-foreground">—</span>
  return <span className={getVerificationBadgeClass(status)}>{status}</span>
}
