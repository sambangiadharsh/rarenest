import { useState } from 'react'
import { useDispatch } from 'react-redux'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Loader2, Home, HardHat, Search } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/shared/components/ui/button'
import { setCredentials } from '@/app/store/authSlice'
import { useUpdateRole } from '@/features/auth'
import { mapApiUserToCredentials } from '@/shared/lib/authHelpers'

const ROLES = [
  {
    value: 'Buyer',
    label: 'Buyer',
    sub: 'Find & explore rare homes',
    icon: Search,
  },
  {
    value: 'Seller',
    label: 'Seller',
    sub: 'List your properties',
    icon: Home,
  },
  {
    value: 'Builder',
    label: 'Builder',
    sub: 'Build & craft residences',
    icon: HardHat,
  },
]

export default function RoleSelectionModal({ open, onClose, onRoleSelected }) {
  const dispatch = useDispatch()
  const [selected, setSelected] = useState(null)
  const { mutateAsync: updateRole, isPending } = useUpdateRole()

  const handleConfirm = async () => {
    if (!selected) return
    try {
      const res = await updateRole({ role: selected })
      if (res?.success && res.data) {
        const updated = mapApiUserToCredentials(res.data)
        dispatch(setCredentials(updated))
        toast.success(`You're now set as a ${selected}.`)
        onClose()
        onRoleSelected?.(selected.toLowerCase())
      } else {
        toast.error('Could not update your role. Please try again.')
      }
    } catch (err) {
      toast.error(err?.message || 'Could not update your role.')
    }
  }

  if (!open) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-neutral-950/60 backdrop-blur-sm"
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 12 }}
          className="relative z-10 flex w-full max-w-md flex-col gap-6 rounded-3xl border border-brand-sand bg-white p-6 shadow-2xl sm:p-8 dark:border-neutral-850 dark:bg-neutral-900"
        >
          <button
            type="button"
            onClick={onClose}
            className="absolute right-4 top-4 rounded-full p-1.5 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-700 dark:hover:bg-neutral-800"
          >
            <X className="h-4 w-4" />
          </button>

          <div className="mt-2 text-center">
            <h3 className="font-serif text-2xl font-bold text-neutral-950 dark:text-white">
              How would you like to use Rarenest?
            </h3>
            <p className="mt-1 text-xs text-neutral-500">
              Choose your role to get started. This can't be changed later.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {ROLES.map(({ value, label, sub, icon: Icon }) => (
              <button
                key={value}
                type="button"
                onClick={() => setSelected(value)}
                className={`flex flex-col items-center gap-2 rounded-2xl border py-4 px-2 text-sm font-bold transition-all duration-200 ${
                  selected === value
                    ? 'border-brand-bronze bg-brand-bronze/10 text-brand-bronze scale-[1.03]'
                    : 'border-neutral-200 dark:border-neutral-800 text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-950/40 hover:text-neutral-600'
                }`}
              >
                <Icon className={`h-6 w-6 ${selected === value ? 'text-brand-bronze' : 'text-neutral-400'}`} />
                <span>{label}</span>
                <span className="text-[9px] font-semibold opacity-70 text-center leading-tight">{sub}</span>
              </button>
            ))}
          </div>

          <Button
            onClick={handleConfirm}
            disabled={!selected || isPending}
            className="w-full gap-2 bg-brand-bronze hover:bg-brand-bronze/90 text-white font-bold"
          >
            {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            Continue as {selected || '…'}
          </Button>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
