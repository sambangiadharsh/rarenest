import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Lock, Loader2, Eye, EyeOff, CheckCircle2, AlertTriangle, LogIn } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { useResetPassword } from '@/features/auth/hooks/useAuth'

const schema = z
  .object({
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirm_password: z.string(),
  })
  .refine((d) => d.password === d.confirm_password, {
    message: 'Passwords do not match',
    path: ['confirm_password'],
  })

function PasswordField({ id, label, placeholder, registration, error }) {
  const [show, setShow] = useState(false)
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-xs font-bold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider flex items-center gap-1.5">
        <Lock className="h-3.5 w-3.5 text-brand-bronze" /> {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type={show ? 'text' : 'password'}
          placeholder={placeholder}
          {...registration}
          className={`h-11 w-full rounded-xl bg-neutral-50/50 dark:bg-neutral-950 px-4 pr-11 text-sm border outline-none transition-all placeholder:text-neutral-400 font-sans ${
            error
              ? 'border-destructive ring-1 ring-destructive'
              : 'border-neutral-200 dark:border-neutral-800 focus:border-brand-bronze/50 focus:ring-1 focus:ring-brand-bronze/20'
          }`}
        />
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          className="absolute inset-y-0 right-3 flex items-center text-neutral-400 hover:text-neutral-600"
          tabIndex={-1}
        >
          {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
      {error && <span className="text-[10px] text-destructive font-semibold">{error.message}</span>}
    </div>
  )
}

export default function ResetPassword() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  const navigate = useNavigate()
  const [done, setDone] = useState(false)
  const [serverError, setServerError] = useState('')
  const { mutateAsync: resetPassword, isPending } = useResetPassword()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(schema) })

  const onSubmit = async (data) => {
    setServerError('')
    try {
      const res = await resetPassword({ token, password: data.password, confirm_password: data.confirm_password })
      if (res?.success) {
        setDone(true)
        setTimeout(() => navigate('/login', { replace: true }), 3000)
      } else {
        setServerError(res?.message || 'Something went wrong. Please try again.')
      }
    } catch (err) {
      setServerError(err?.response?.data?.message || 'Reset link is invalid or has expired.')
    }
  }

  /* ── No token in URL ── */
  if (!token) {
    return (
      <div className="flex min-h-[75vh] items-center justify-center py-10 max-w-7xl mx-auto px-4">
        <div className="w-full max-w-md rounded-3xl border border-neutral-100 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 p-8 shadow-xl flex flex-col items-center gap-4 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1.5 bg-brand-bronze" />
          <div className="h-16 w-16 rounded-full bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center">
            <AlertTriangle className="h-8 w-8 text-amber-500" />
          </div>
          <h2 className="font-serif text-2xl font-bold text-neutral-950 dark:text-white">Invalid Link</h2>
          <p className="text-sm text-neutral-500 leading-relaxed max-w-[280px]">
            This reset link is missing or malformed. Please request a new one.
          </p>
          <Link
            to="/forgot-password"
            className="mt-2 inline-flex items-center gap-1.5 text-sm font-bold text-brand-bronze hover:underline"
          >
            Request a new link
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-[75vh] items-center justify-center py-10 max-w-7xl mx-auto px-4">
      <div className="w-full max-w-md rounded-3xl border border-neutral-100 dark:border-neutral-850 bg-white dark:bg-neutral-900/60 p-8 shadow-xl flex flex-col gap-6 relative overflow-hidden">

        {/* Brand bar */}
        <div className="absolute top-0 left-0 w-full h-1.5 bg-brand-bronze" />

        {done ? (
          /* ── Success state ── */
          <div className="flex flex-col items-center text-center gap-4 py-4">
            <div className="h-16 w-16 rounded-full bg-green-50 dark:bg-green-900/20 flex items-center justify-center">
              <CheckCircle2 className="h-8 w-8 text-green-500" />
            </div>
            <div className="flex flex-col gap-1">
              <h2 className="font-serif text-2xl font-bold text-neutral-950 dark:text-white">Password Reset!</h2>
              <p className="text-sm text-neutral-500 leading-relaxed max-w-[280px] mx-auto">
                Your password has been updated. Redirecting you to Sign In…
              </p>
            </div>
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 text-sm font-bold text-brand-bronze hover:underline"
            >
              <LogIn className="h-3.5 w-3.5" /> Go to Sign In now
            </Link>
          </div>
        ) : (
          /* ── Form state ── */
          <>
            {/* Title */}
            <div className="flex flex-col items-center text-center gap-2">
              <div className="inline-flex items-center gap-1.5 text-[9px] font-bold text-brand-bronze tracking-widest uppercase bg-brand-bronze/10 px-3 py-1 rounded-full mb-1">
                <Lock className="h-3 w-3" /> Secure Reset
              </div>
              <h1 className="font-serif text-3xl font-bold tracking-tight text-neutral-950 dark:text-white">New Password</h1>
              <p className="text-xs text-neutral-500 max-w-[280px]">
                Choose a strong password with at least 6 characters.
              </p>
            </div>

            {/* Server error */}
            {serverError && (
              <div className="flex items-start gap-2 rounded-xl bg-destructive/10 border border-destructive/20 px-4 py-3">
                <AlertTriangle className="h-4 w-4 text-destructive mt-0.5 shrink-0" />
                <p className="text-xs text-destructive font-semibold leading-relaxed">{serverError}</p>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
              <PasswordField
                id="password"
                label="New Password"
                placeholder="At least 6 characters"
                registration={register('password')}
                error={errors.password}
              />
              <PasswordField
                id="confirm_password"
                label="Confirm New Password"
                placeholder="Repeat your new password"
                registration={register('confirm_password')}
                error={errors.confirm_password}
              />

              <Button
                type="submit"
                disabled={isPending}
                className="w-full h-11 mt-1 bg-brand-bronze hover:bg-brand-bronze-dark text-white font-bold rounded-xl shadow-lg shadow-brand-bronze/10 transition-all duration-300 flex items-center justify-center gap-2"
              >
                {isPending ? (
                  <><Loader2 className="h-4 w-4 animate-spin" /> Resetting…</>
                ) : (
                  <><Lock className="h-4 w-4" /> Reset Password</>
                )}
              </Button>
            </form>

            {/* Footer */}
            <div className="text-center text-xs text-neutral-400 border-t border-neutral-100 dark:border-neutral-800/40 pt-4 mt-2">
              Link expired?{' '}
              <Link to="/forgot-password" className="font-bold text-brand-bronze hover:underline transition-colors">
                Request a new one
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
