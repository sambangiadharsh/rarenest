import { useState } from 'react'
import { useDispatch } from 'react-redux'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, Loader2, Lock, Mail, Phone, Send, User, X } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/shared/components/ui/button'
import { useLogin } from '@/features/auth'
import { useCreateEnquiry, useGuestEnquiry } from '@/features/enquiries'
import { mapApiUserToCredentials } from '@/shared/lib/authHelpers'
import { setCredentials } from '@/app/store/authSlice'

export default function EnquiryModal({
  open,
  onClose,
  propertyId,
  propertyTitle,
}) {
  const dispatch = useDispatch()
  const [step, setStep] = useState('form')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [done, setDone] = useState(false)

  const { mutateAsync: guestEnquiry, isPending: isGuestPending } = useGuestEnquiry()
  const { mutateAsync: login, isPending: isLoginPending } = useLogin()
  const { mutateAsync: createEnquiry, isPending: isEnquiryPending } = useCreateEnquiry()

  const resetAndClose = () => {
    setStep('form')
    setName('')
    setEmail('')
    setPhone('')
    setPassword('')
    setDone(false)
    onClose()
  }

  const handleGuestSubmit = async (e) => {
    e.preventDefault()
    try {
      const res = await guestEnquiry({
        property_id: propertyId,
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
      })
      if (res?.success && res.user) {
        dispatch(setCredentials(mapApiUserToCredentials(res.user)))
        setDone(true)
        toast.success(
          res.emailSent
            ? "Enquiry sent. You're logged in — check your email for your password."
            : "Enquiry sent. You're logged in. Welcome email could not be sent.",
        )
      }
    } catch (err) {
      if (err.requiresLogin) {
        setStep('login')
        return
      }
      toast.error(err.message || 'Could not send enquiry.')
    }
  }

  const handleLoginSubmit = async (e) => {
    e.preventDefault()
    try {
      const res = await login({ email: email.trim(), password })
      if (!res?.success) {
        toast.error(res?.message || 'Login failed.')
        return
      }
      if (res.user.role?.toLowerCase() === 'admin') {
        toast.info('Please use the admin portal to sign in as admin.')
        return
      }
      dispatch(setCredentials(mapApiUserToCredentials(res.user)))
      const enquiryRes = await createEnquiry(propertyId)
      if (enquiryRes?.success) {
        setDone(true)
        toast.success('Enquiry sent successfully.')
      } else {
        toast.error(enquiryRes?.message || 'Could not send enquiry.')
      }
    } catch (err) {
      toast.error(err.message || 'Login failed.')
    }
  }

  const busy = isGuestPending || isLoginPending || isEnquiryPending

  if (!open) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={resetAndClose}
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
            onClick={resetAndClose}
            className="absolute right-4 top-4 rounded-full p-1.5 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-700 dark:hover:bg-neutral-800"
          >
            <X className="h-4 w-4" />
          </button>

          <div className="mt-2 text-center">
            <h3 className="font-serif text-2xl font-bold text-neutral-950 dark:text-white">
              {done ? 'All set' : step === 'login' ? 'Log in to enquire' : 'Send enquiry'}
            </h3>
            {propertyTitle && !done && (
              <p className="mt-1 text-xs text-neutral-500 line-clamp-2">{propertyTitle}</p>
            )}
          </div>

          {done ? (
            <div className="flex flex-col items-center gap-3 py-4 text-center">
              <CheckCircle2 className="h-12 w-12 text-green-500" />
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                Your enquiry has been sent to the seller.
              </p>
              <Button type="button" onClick={resetAndClose} className="w-full">
                Close
              </Button>
            </div>
          ) : step === 'login' ? (
            <form onSubmit={handleLoginSubmit} className="flex flex-col gap-4">
              <p className="text-center text-sm text-neutral-500">
                An account with this email already exists. Log in to send your enquiry.
              </p>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                  <input
                    type="email"
                    readOnly
                    value={email}
                    className="w-full rounded-xl border border-brand-sand bg-neutral-50 py-2.5 pl-10 pr-3 text-sm dark:border-neutral-800 dark:bg-neutral-950"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-xl border border-brand-sand py-2.5 pl-10 pr-3 text-sm outline-none focus:border-brand-terracotta/50 dark:border-neutral-800 dark:bg-neutral-950"
                  />
                </div>
              </div>
              <Button type="submit" disabled={busy} className="w-full gap-2">
                {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                Log in & send enquiry
              </Button>
              <button
                type="button"
                onClick={() => setStep('form')}
                className="text-xs font-semibold text-neutral-500 hover:text-brand-terracotta"
              >
                Back
              </button>
            </form>
          ) : (
            <form onSubmit={handleGuestSubmit} className="flex flex-col gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                  Full name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full rounded-xl border border-brand-sand py-2.5 pl-10 pr-3 text-sm outline-none focus:border-brand-terracotta/50 dark:border-neutral-800 dark:bg-neutral-950"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-xl border border-brand-sand py-2.5 pl-10 pr-3 text-sm outline-none focus:border-brand-terracotta/50 dark:border-neutral-800 dark:bg-neutral-950"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                  Phone
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full rounded-xl border border-brand-sand py-2.5 pl-10 pr-3 text-sm outline-none focus:border-brand-terracotta/50 dark:border-neutral-800 dark:bg-neutral-950"
                  />
                </div>
              </div>
              <Button
                type="submit"
                disabled={busy}
                className="w-full gap-2 bg-brand-terracotta hover:bg-brand-terracotta/90"
              >
                {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                Send enquiry
              </Button>
            </form>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
