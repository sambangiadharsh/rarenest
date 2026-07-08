import React, { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useDispatch } from 'react-redux'
import { setCredentials } from '@/app/store/authSlice'
import { useLogin } from '@/features/auth'
import { Button } from '@/shared/components/ui/button'
import { toast } from 'sonner'
import { LogIn, Mail, Lock, Loader2, Eye, EyeOff } from 'lucide-react'
import { getAdminLoginUrl } from '@/shared/config/app'
import { mapApiUserToCredentials } from '@/shared/lib/authHelpers'
import GoogleAuthButton from '../components/GoogleAuthButton'
import AuthSidepanel from '@/assets/AuthSidePanel.png'

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
})

export default function Login() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const { mutateAsync: login, isPending: isLoading } = useLogin()
  const [showPassword, setShowPassword] = useState(false)

  React.useEffect(() => {
    const params = new URLSearchParams(location.search)
    if (params.get('expired') === 'true') {
      // Small timeout to allow component/toaster mount
      const t = setTimeout(() => {
        toast.error('Session Expired. Please log in again.')
        navigate('/login', { replace: true })
      }, 100)
      return () => clearTimeout(t)
    }
  }, [location.search, navigate])

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

        const userData = mapApiUserToCredentials(res.user)
        dispatch(setCredentials(userData))
        toast.success(`Welcome back, ${userData.name}!`)
        navigate('/', { replace: true })
      } else {
        toast.error(res.message || 'Login failed.')
      }
    } catch (err) {
      toast.error(err.message || 'Login failed. Please check your credentials.')
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-80px)] w-full bg-[#fcf9f5] dark:bg-neutral-950 items-center justify-center p-4 sm:p-8">

      {/* Unified Auth Card - CSS grid gives both columns a definite, equal height (flex "stretch" height isn't always treated as definite for absolutely-positioned children, which is why the image was overflowing) */}
      <div className="w-full max-w-[1040px] grid grid-cols-1 lg:grid-cols-2 bg-white dark:bg-neutral-900 rounded-[2rem] shadow-[0_20px_60px_rgb(0,0,0,0.08)] dark:shadow-[0_20px_60px_rgb(0,0,0,0.3)] overflow-hidden border border-neutral-100 dark:border-neutral-850">

        {/* Left Panel - Image fills the grid cell exactly, cropped via object-cover */}
       
       <div className="hidden lg:flex items-center justify-center p-8 bg-[#FCF9F5] min-h-[300px]">
  <img
    src={AuthSidepanel}
    alt="Real Estate"
    className="max-w-full max-h-full object-contain"
  />
</div>

        {/* Right Panel - Form */}
        <div className="w-full flex flex-col justify-center relative p-8 sm:p-10 lg:p-12">
            
            {/* Top Brand Color Bar */}
            <div className="absolute top-0 left-0 w-full h-2.5 bg-brand-bronze lg:rounded-tr-[2rem] rounded-t-[2rem] lg:rounded-tl-none"></div>

            {/* Title */}
            <div className="flex flex-col items-center text-center gap-2 mb-8">
              
              <h1 className="font-serif text-[32px] sm:text-[36px] leading-tight font-bold tracking-tight text-neutral-950 dark:text-white mt-1">Welcome Back</h1>
              <p className="text-[13px] text-neutral-500 max-w-[300px] mt-1 leading-relaxed">
                Sign in to access your saved homes, builder directory, and dashboard.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6 w-full">
              {/* Email */}
              <div className="flex flex-col gap-2">
                <label className="text-[11px] font-bold text-neutral-800 dark:text-neutral-300 uppercase tracking-widest flex items-center gap-2">
                  <Mail className="h-4 w-4 text-brand-bronze" /> Email Address
                </label>
                <input
                  type="email"
                  {...register('email')}
                  placeholder="name@example.com"
                  className={`h-12 rounded-[14px] bg-[#f9fafb] dark:bg-neutral-950 px-4 text-sm border outline-none transition-all placeholder:text-neutral-400 font-sans ${
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
                  <label className="text-[11px] font-bold text-neutral-800 dark:text-neutral-300 uppercase tracking-widest flex items-center gap-2">
                    <Lock className="h-4 w-4 text-brand-bronze" /> Password
                  </label>
                  <Link
                    to="/forgot-password"
                    className="text-[11px] font-semibold text-neutral-500 hover:text-brand-bronze transition-colors"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    {...register('password')}
                    placeholder="••••••••"
                    className={`h-12 w-full rounded-[14px] bg-[#f9fafb] dark:bg-neutral-950 px-4 pr-10 text-sm border outline-none transition-all placeholder:text-neutral-400 font-sans ${
                      errors.password 
                        ? 'border-destructive ring-1 ring-destructive' 
                        : 'border-neutral-200 dark:border-neutral-800 focus:border-brand-bronze/50 focus:ring-1 focus:ring-brand-bronze/20'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 focus:outline-none"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password && (
                  <span className="text-[10px] text-destructive font-semibold">{errors.password.message}</span>
                )}
              </div>

              {/* Submit */}
              <Button 
                type="submit" 
                className="w-full h-12 mt-2 bg-brand-bronze hover:bg-brand-bronze-dark text-white font-bold rounded-[14px] shadow-[0_4px_14px_rgba(198,108,48,0.35)] hover:shadow-[0_6px_20px_rgba(198,108,48,0.25)] transition-all duration-300 flex items-center justify-center gap-2 text-[15px]" 
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Signing In...
                  </>
                ) : (
                  <>
                    Sign In
                  </>
                )}
              </Button>
            </form>

            <div className="relative my-7 flex items-center justify-center w-full">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-neutral-100 dark:border-neutral-800/60"></div>
              </div>
              <span className="relative bg-white dark:bg-neutral-900 px-4 text-[10px] uppercase text-neutral-400 font-bold tracking-widest">Or</span>
            </div>

            <div className="w-full">
              <GoogleAuthButton className="h-12 text-[15px] rounded-[14px]" />
            </div>

            {/* Footer */}
            <div className="text-center text-sm text-neutral-500 pt-7 mt-2 w-full">
              Don't have an account?{' '}
              <Link to="/register" className="font-bold text-brand-bronze hover:underline transition-colors">
                Register now
              </Link>
            </div>
        </div>
      </div>
    </div>
  )
}