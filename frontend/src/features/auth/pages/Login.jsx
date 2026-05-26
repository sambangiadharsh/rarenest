import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useDispatch } from 'react-redux'
import { setCredentials } from '@/app/store/authSlice'
import { useLogin } from '@/features/auth'
import { Button } from '@/shared/components/ui/button'
import { toast } from 'sonner'
import { LogIn, Sparkles, Mail, Lock, Loader2 } from 'lucide-react'
import { getAdminLoginUrl } from '@/shared/config/app'

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
})

export default function Login() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { mutateAsync: login, isPending: isLoading } = useLogin()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data) => {
    try {
      const res = await login(data)
      if (res.success) {
        if (res.user.role?.toLowerCase() === 'admin') {
          toast.info('Admin accounts use the admin portal. Redirecting…')
          window.location.href = getAdminLoginUrl()
          return
        }

        // Backend user contains id, email, role, first_name, last_name
        const userData = {
          id: res.user.id,
          name: `${res.user.first_name || ''} ${res.user.last_name || ''}`.trim() || res.user.email.split('@')[0],
          email: res.user.email,
          role: res.user.role.toLowerCase(), // frontend expects lowercase ('seller', 'buyer')
        }
        dispatch(setCredentials(userData))
        toast.success(`Welcome back, ${userData.name}!`)
        navigate('/')
      } else {
        toast.error(res.message || 'Login failed.')
      }
    } catch (err) {
      toast.error(err.message || 'Login failed. Please check your credentials.')
    }
  }

  return (
    <div className="flex min-h-[75vh] items-center justify-center py-10 max-w-7xl mx-auto px-4">
      <div className="w-full max-w-md rounded-3xl border border-neutral-100 dark:border-neutral-850 bg-white dark:bg-neutral-900/60 p-8 shadow-xl flex flex-col gap-6 relative overflow-hidden">
        {/* Soft elegant top color highlight */}
        <div className="absolute top-0 left-0 w-full h-1.5 bg-brand-bronze"></div>

        {/* Title */}
        <div className="flex flex-col items-center text-center gap-2">
          <div className="inline-flex items-center gap-1.5 text-[9px] font-bold text-brand-bronze tracking-widest uppercase bg-brand-bronze/10 px-3 py-1 rounded-full mb-1">
            <Sparkles className="h-3 w-3" /> Secure Gate
          </div>
          <h1 className="font-serif text-3xl font-bold tracking-tight text-neutral-950 dark:text-white">Welcome Back</h1>
          <p className="text-xs text-neutral-500 max-w-[280px]">
            Sign in to access your saved homes, builder directory, and dashboard.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
          {/* Email */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider flex items-center gap-1.5">
              <Mail className="h-3.5 w-3.5 text-brand-bronze" /> Email Address
            </label>
            <input
              type="email"
              {...register('email')}
              placeholder="name@example.com"
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

          {/* Password */}
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider flex items-center gap-1.5">
                <Lock className="h-3.5 w-3.5 text-brand-bronze" /> Password
              </label>
              <span 
                onClick={() => toast.info('Password recovery is managed by the backend identity server.')}
                className="text-[10px] font-semibold text-neutral-400 hover:text-brand-bronze cursor-pointer transition-colors"
              >
                Forgot password?
              </span>
            </div>
            <input
              type="password"
              {...register('password')}
              placeholder="••••••••"
              className={`h-11 rounded-xl bg-neutral-50/50 dark:bg-neutral-950 px-4 text-sm border outline-none transition-all placeholder:text-neutral-400 font-sans ${
                errors.password 
                  ? 'border-destructive ring-1 ring-destructive' 
                  : 'border-neutral-200 dark:border-neutral-800 focus:border-brand-bronze/50 focus:ring-1 focus:ring-brand-bronze/20'
              }`}
            />
            {errors.password && (
              <span className="text-[10px] text-destructive font-semibold">{errors.password.message}</span>
            )}
          </div>

          {/* Submit */}
          <Button 
            type="submit" 
            className="w-full h-11 mt-2 bg-brand-bronze hover:bg-brand-bronze-dark text-white font-bold rounded-xl shadow-lg shadow-brand-bronze/10 transition-all duration-300 flex items-center justify-center gap-2" 
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Signing In...
              </>
            ) : (
              <>
                <LogIn className="h-4 w-4" />
                Sign In
              </>
            )}
          </Button>
        </form>

        {/* Footer */}
        <div className="text-center text-xs text-neutral-400 border-t border-neutral-100 dark:border-neutral-800/40 pt-4 mt-2">
          Don't have an account?{' '}
          <Link to="/register" className="font-bold text-brand-bronze hover:underline transition-colors">
            Register now
          </Link>
        </div>
      </div>
    </div>
  )
}
