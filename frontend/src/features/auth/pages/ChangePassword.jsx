import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import {
  Loader2,
  
  Lock,
  Eye,
  EyeOff,
} from 'lucide-react'
import { toast } from 'sonner'
import RequireAuth from '@/shared/components/auth/RequireAuth'
import { Button } from '@/shared/components/ui/button'

import { useChangePassword } from '@/features/auth/hooks/useProfile'



function PasswordInput({ id, placeholder, registration, error }) {
  const [show, setShow] = useState(false)
  return (
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
  )
}

function ChangePasswordForm() {
  const { mutateAsync: changePassword, isPending } = useChangePassword()
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm({ defaultValues: { current_password: '', new_password: '', confirm_password: '' } })

  const onSubmit = async (formData) => {
    try {
      const res = await changePassword(formData)
      if (res?.success) {
        toast.success('Password changed successfully.')
        reset()
      } else {
        toast.error(res?.message || 'Could not change password.')
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || err.message || 'Could not change password.')
    }
  }

  return (
    <div className="rounded-3xl border border-neutral-100 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-2xl overflow-hidden">

      {/* Card header */}
      <div className="px-7 sm:px-9 pt-8 pb-5 border-b border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
        <div>
          <h2 className="font-serif text-xl font-bold text-neutral-950 dark:text-white">Change Password</h2>
          <p className="text-xs text-neutral-400 mt-0.5">Choose a strong password with at least 6 characters.</p>
        </div>
        <div className="h-10 w-10 rounded-2xl bg-brand-sand/50 flex items-center justify-center">
          <Lock className="h-4 w-4 text-brand-bronze" />
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="px-7 sm:px-9 py-7 flex flex-col gap-6">

          {/* Current password */}
          <div className="flex flex-col gap-2">
            <label htmlFor="current_password" className="text-xs font-bold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider flex items-center gap-1.5">
              <Lock className="h-3.5 w-3.5 text-brand-bronze" /> Current Password
            </label>
            <PasswordInput
              id="current_password"
              placeholder="Enter your current password"
              registration={register('current_password', { required: 'Current password is required' })}
              error={errors.current_password}
            />
            {errors.current_password && (
              <span className="text-[10px] text-destructive font-semibold">{errors.current_password.message}</span>
            )}
          </div>

          <div className="border-t border-neutral-100 dark:border-neutral-800" />

          {/* New password */}
          <div className="flex flex-col gap-2">
            <label htmlFor="new_password" className="text-xs font-bold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider flex items-center gap-1.5">
              <Lock className="h-3.5 w-3.5 text-brand-bronze" /> New Password
            </label>
            <PasswordInput
              id="new_password"
              placeholder="At least 6 characters"
              registration={register('new_password', {
                required: 'New password is required',
                minLength: { value: 6, message: 'Must be at least 6 characters' },
              })}
              error={errors.new_password}
            />
            {errors.new_password && (
              <span className="text-[10px] text-destructive font-semibold">{errors.new_password.message}</span>
            )}
          </div>

          {/* Confirm password */}
          <div className="flex flex-col gap-2">
            <label htmlFor="confirm_password" className="text-xs font-bold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider flex items-center gap-1.5">
              <Lock className="h-3.5 w-3.5 text-brand-bronze" /> Confirm New Password
            </label>
            <PasswordInput
              id="confirm_password"
              placeholder="Repeat your new password"
              registration={register('confirm_password', {
                required: 'Please confirm your new password',
                validate: (val) => val === watch('new_password') || 'Passwords do not match',
              })}
              error={errors.confirm_password}
            />
            {errors.confirm_password && (
              <span className="text-[10px] text-destructive font-semibold">{errors.confirm_password.message}</span>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-7 sm:px-9 py-5 border-t border-neutral-100 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-950/30 flex items-center justify-between gap-4">
          <p className="text-xs text-neutral-400">You will remain logged in after changing your password.</p>
          <Button
            type="submit"
            disabled={isPending}
            className="rounded-xl bg-brand-bronze hover:bg-brand-bronze-dark text-white font-bold px-6 shadow-lg shadow-brand-bronze/20 gap-2 min-w-[160px]"
          >
            {isPending
              ? <><Loader2 className="h-4 w-4 animate-spin" /> Updating…</>
              : <><Lock className="h-4 w-4" /> Update Password</>
            }
          </Button>
        </div>
      </form>
    </div>
  )
}

export default function Profile() {
  return (
    <RequireAuth>
      <div className="bg-brand-cream/30 dark:bg-neutral-950 min-h-screen py-12">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 flex flex-col gap-8">
         
          <ChangePasswordForm />
        </div>
      </div>
    </RequireAuth>
  )
}
