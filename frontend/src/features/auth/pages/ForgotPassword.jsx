import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Mail, Loader2, ArrowLeft, CheckCircle2, KeyRound } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { useForgotPassword } from '@/features/auth/hooks/useAuth'

const schema = z.object({
  email: z.string().email('Please enter a valid email address'),
})

export default function ForgotPassword() {
  const [submitted, setSubmitted] = useState(false)
  const { mutateAsync: forgotPassword, isPending } = useForgotPassword()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(schema) })

  const onSubmit = async (data) => {
    try {
      await forgotPassword({ email: data.email.trim().toLowerCase() })
      // Always show success — backend never reveals whether email exists
      setSubmitted(true)
    } catch {
      // Still show success to prevent email enumeration on the frontend
      setSubmitted(true)
    }
  }

  return (
    <div className="flex min-h-[75vh] items-center justify-center py-10 max-w-7xl mx-auto px-4">
      <div className="w-full max-w-md rounded-3xl border border-neutral-100 dark:border-neutral-850 bg-white dark:bg-neutral-900/60 p-8 shadow-xl flex flex-col gap-6 relative overflow-hidden">

        {/* Brand bar */}
        <div className="absolute top-0 left-0 w-full h-1.5 bg-brand-bronze" />

        {submitted ? (
          /* ── Success state ── */
          <div className="flex flex-col items-center text-center gap-4 py-4">
            <div className="h-16 w-16 rounded-full bg-green-50 dark:bg-green-900/20 flex items-center justify-center">
              <CheckCircle2 className="h-8 w-8 text-green-500" />
            </div>
            <div className="flex flex-col gap-1">
              <h2 className="font-serif text-2xl font-bold text-neutral-950 dark:text-white">Check your inbox</h2>
              <p className="text-sm text-neutral-500 leading-relaxed max-w-[300px] mx-auto">
                If that email is registered with RareNest, you'll receive a password reset link within a few minutes.
              </p>
            </div>
            <p className="text-xs text-neutral-400">The link expires in <strong>15 minutes</strong>. Check your spam folder if you don't see it.</p>
            <div className="border-t border-neutral-100 dark:border-neutral-800 w-full pt-4 mt-2">
              <Link
                to="/login"
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-bronze hover:underline transition-colors"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Back to Sign In
              </Link>
            </div>
          </div>
        ) : (
          /* ── Form state ── */
          <>
            {/* Title */}
            <div className="flex flex-col items-center text-center gap-2">
              <div className="inline-flex items-center gap-1.5 text-[9px] font-bold text-brand-bronze tracking-widest uppercase bg-brand-bronze/10 px-3 py-1 rounded-full mb-1">
                <KeyRound className="h-3 w-3" /> Password Recovery
              </div>
              <h1 className="font-serif text-3xl font-bold tracking-tight text-neutral-950 dark:text-white">Forgot Password?</h1>
              <p className="text-xs text-neutral-500 max-w-[300px]">
                Enter the email address linked to your account and we'll send you a reset link.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5 text-brand-bronze" /> Email Address
                </label>
                <input
                  type="email"
                  {...register('email')}
                  placeholder="name@example.com"
                  autoFocus
                  className={`h-11 rounded-xl bg-neutral-50/50 dark:bg-neutral-950 px-4 text-sm border outline-none transition-all placeholder:text-neutral-400 font-sans ${
                    errors.email
                      ? 'border-destructive ring-1 ring-destructive'
                      : 'border-neutral-200 dark:border-neutral-800 focus:border-brand-bronze/50 focus:ring-1 focus:ring-brand-bronze/20'
                  }`}
                />
                {errors.email && (
                  <span className="text-[10px] text-destructive font-semibold">{errors.email.message}</span>
                )}
              </div>

              <Button
                type="submit"
                disabled={isPending}
                className="w-full h-11 mt-1 bg-brand-bronze hover:bg-brand-bronze-dark text-white font-bold rounded-xl shadow-lg shadow-brand-bronze/10 transition-all duration-300 flex items-center justify-center gap-2"
              >
                {isPending ? (
                  <><Loader2 className="h-4 w-4 animate-spin" /> Sending Link…</>
                ) : (
                  <><Mail className="h-4 w-4" /> Send Reset Link</>
                )}
              </Button>
            </form>

            {/* Footer */}
            <div className="text-center text-xs text-neutral-400 border-t border-neutral-100 dark:border-neutral-800/40 pt-4 mt-2">
              Remember your password?{' '}
              <Link to="/login" className="font-bold text-brand-bronze hover:underline transition-colors">
                Sign In
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
