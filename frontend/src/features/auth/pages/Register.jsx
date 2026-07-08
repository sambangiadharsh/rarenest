import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useDispatch } from 'react-redux'
import { setCredentials } from '@/app/store/authSlice'
import { useRegister } from '@/features/auth'
import { Button } from '@/shared/components/ui/button'
import { toast } from 'sonner'
import { Sparkles, Mail, Lock, User, Loader2, Award, Phone, MapPin, Eye, EyeOff } from 'lucide-react'
import { mapApiUserToCredentials } from '@/shared/lib/authHelpers'
import GoogleAuthButton from '../components/GoogleAuthButton'
import AuthSidepanel from '@/assets/AuthSidepanel.png'

const registerSchema = z.object({
  first_name: z.string().min(2, 'First name must be at least 2 characters long'),
  last_name: z.string().min(1, 'Last name must be at least 1 character long'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
  phone: z.string().min(8, 'Phone number must be at least 8 characters long').max(20, 'Phone must be at most 20 characters'),
  address: z.string().optional().or(z.literal('')),
})

export default function Register() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { mutateAsync: registerUser, isPending: isLoading } = useRegister()
  const [showPassword, setShowPassword] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      first_name: '',
      last_name: '',
      email: '',
      password: '',
      phone: '',
      address: '',
    }
  })

  const onSubmit = async (data) => {
    try {
      const payload = {
        email: data.email,
        password: data.password,
        first_name: data.first_name.trim(),
        last_name: data.last_name.trim(),
        phone: data.phone || '',
        address: data.address || '',
        role: 'User'
      }

      const res = await registerUser(payload)
      if (res.success) {
        const userData = mapApiUserToCredentials(res.user)
        dispatch(setCredentials(userData))
        toast.success(`Welcome to Rarenest, ${userData.name}!`)
        navigate('/', { replace: true })
      } else {
        toast.error(res.message || 'Registration failed.')
      }
    } catch (err) {
      toast.error(err.message || 'Registration failed. Please try again.')
    }
  }

  return (
        <div className="flex min-h-[calc(100vh-80px)] w-full bg-[#fcf9f5] dark:bg-neutral-950 items-center justify-center p-4 sm:p-8">

      {/* Unified Auth Card - CSS grid gives both columns a definite, equal height (flex "stretch" height isn't always treated as definite for absolutely-positioned children, which is why the image was overflowing) */}
      <div className="w-full max-w-[1040px] grid grid-cols-1 lg:grid-cols-2 bg-white dark:bg-neutral-900 rounded-[2rem] shadow-[0_20px_60px_rgb(0,0,0,0.08)] dark:shadow-[0_20px_60px_rgb(0,0,0,0.3)] overflow-hidden border border-neutral-100 dark:border-neutral-850">

        {/* Left Side - Image */}
         <div className="hidden lg:flex items-center justify-center p-8 bg-[#FCF9F5] min-h-[300px]">
          <img
            src={AuthSidepanel}
            alt="Real Estate"
            className="max-w-full max-h-full object-contain"
          />
        </div>

        {/* Right Side - Form */}
        <div className="w-full p-8 md:p-12 flex flex-col gap-6 relative justify-center">
          {/* Top brand color outline bar for mobile */}
          <div className="absolute top-0 left-0 w-full h-1.5 bg-brand-bronze md:hidden"></div>

          {/* Title */}
          <div className="flex flex-col items-center text-center gap-2">
            <h1 className="font-serif text-3xl font-bold tracking-tight text-neutral-950 dark:text-white">Create Account</h1>
            <p className="text-xs text-neutral-500 max-w-[280px]">
              Sign up to discover alternative dwellings or list your custom residences.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 max-w-sm mx-auto w-full">

            {/* First & Last Name */}
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5 text-brand-bronze" /> First Name
                </label>
                <input
                  type="text"
                  {...register('first_name')}
                  placeholder="Alex"
                  className={`h-11 rounded-xl bg-neutral-50/50 dark:bg-neutral-950 px-4 text-sm border outline-none transition-all placeholder:text-neutral-400 font-sans ${errors.first_name
                      ? 'border-destructive ring-1 ring-destructive'
                      : 'border-neutral-200 dark:border-neutral-800 focus:border-brand-bronze/50 focus:ring-1 focus:ring-brand-bronze/20'
                    }`}
                />
                {errors.first_name && (
                  <span className="text-[10px] text-destructive font-semibold">{errors.first_name.message}</span>
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5 text-brand-bronze" /> Last Name
                </label>
                <input
                  type="text"
                  {...register('last_name')}
                  placeholder="Mercer"
                  className={`h-11 rounded-xl bg-neutral-50/50 dark:bg-neutral-950 px-4 text-sm border outline-none transition-all placeholder:text-neutral-400 font-sans ${errors.last_name
                      ? 'border-destructive ring-1 ring-destructive'
                      : 'border-neutral-200 dark:border-neutral-800 focus:border-brand-bronze/50 focus:ring-1 focus:ring-brand-bronze/20'
                    }`}
                />
                {errors.last_name && (
                  <span className="text-[10px] text-destructive font-semibold">{errors.last_name.message}</span>
                )}
              </div>
            </div>

            {/* Email */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5 text-brand-bronze" /> Email Address
              </label>
              <input
                type="email"
                {...register('email')}
                placeholder="name@example.com"
                className={`h-11 rounded-xl bg-neutral-50/50 dark:bg-neutral-950 px-4 text-sm border outline-none transition-all placeholder:text-neutral-400 font-sans ${errors.email
                    ? 'border-destructive ring-1 ring-destructive'
                    : 'border-neutral-200 dark:border-neutral-800 focus:border-brand-bronze/50 focus:ring-1 focus:ring-brand-bronze/20'
                  }`}
              />
              {errors.email && (
                <span className="text-[10px] text-destructive font-semibold">{errors.email.message}</span>
              )}
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider flex items-center gap-1.5">
                <Lock className="h-3.5 w-3.5 text-brand-bronze" /> Create Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  {...register('password')}
                  placeholder="••••••••"
                  className={`h-11 w-full rounded-xl bg-neutral-50/50 dark:bg-neutral-950 px-4 pr-10 text-sm border outline-none transition-all placeholder:text-neutral-400 font-sans ${errors.password
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

            {/* Phone */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider flex items-center gap-1.5">
                <Phone className="h-3.5 w-3.5 text-brand-bronze" /> Phone Number
              </label>
              <input
                type="tel"
                {...register('phone')}
                placeholder="+1 (555) 000-0000"
                className={`h-11 rounded-xl bg-neutral-50/50 dark:bg-neutral-950 px-4 text-sm border outline-none transition-all placeholder:text-neutral-400 font-sans ${errors.phone
                    ? 'border-destructive ring-1 ring-destructive'
                    : 'border-neutral-200 dark:border-neutral-800 focus:border-brand-bronze/50 focus:ring-1 focus:ring-brand-bronze/20'
                  }`}
              />
              {errors.phone && (
                <span className="text-[10px] text-destructive font-semibold">{errors.phone.message}</span>
              )}
            </div>

            {/* Address */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-brand-bronze" /> Address (Optional)
              </label>
              <input
                type="text"
                {...register('address')}
                placeholder="123 Luxury Lane, Beverly Hills, CA"
                className={`h-11 rounded-xl bg-neutral-50/50 dark:bg-neutral-950 px-4 text-sm border outline-none transition-all placeholder:text-neutral-400 font-sans ${errors.address
                    ? 'border-destructive ring-1 ring-destructive'
                    : 'border-neutral-200 dark:border-neutral-800 focus:border-brand-bronze/50 focus:ring-1 focus:ring-brand-bronze/20'
                  }`}
              />
              {errors.address && (
                <span className="text-[10px] text-destructive font-semibold">{errors.address.message}</span>
              )}
            </div>

            {/* Submit */}
            <Button
              type="submit"
              className="w-full h-11 mt-3 bg-brand-bronze hover:bg-brand-bronze-dark text-white font-bold rounded-xl shadow-lg shadow-brand-bronze/10 transition-all duration-300 flex items-center justify-center"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Registering...
                </>
              ) : (
                <>
                  Sign Up
                </>
              )}
            </Button>
          </form>

          <div className="relative my-2 flex items-center justify-center max-w-sm mx-auto w-full">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-neutral-100 dark:border-neutral-800/40"></div>
            </div>
            <span className="relative bg-white dark:bg-neutral-900 px-3 text-[10px] uppercase text-neutral-400 font-bold">Or</span>
          </div>

          <div className="max-w-sm mx-auto w-full">
            <GoogleAuthButton />
          </div>

          {/* Footer */}
          <div className="text-center text-xs text-neutral-400 border-t border-neutral-100 dark:border-neutral-800/40 pt-4 mt-2 max-w-sm mx-auto w-full">
            Already have an account?{' '}
            <Link to="/login" className="font-bold text-brand-bronze hover:underline transition-colors">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

