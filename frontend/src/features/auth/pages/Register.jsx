import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useDispatch } from 'react-redux'
import { setCredentials } from '@/app/store/authSlice'
import { useRegister } from '@/features/auth'
import { Button } from '@/shared/components/ui/button'
import { toast } from 'sonner'
import { Sparkles, Mail, Lock, User, Loader2, Award, Phone, MapPin } from 'lucide-react'

const registerSchema = z.object({
  first_name: z.string().min(2, 'First name must be at least 2 characters long'),
  last_name: z.string().min(1, 'Last name must be at least 1 character long'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
  phone: z.string().min(8, 'Phone number must be at least 8 characters long').max(20, 'Phone must be at most 20 characters'),
  address: z.string().optional().or(z.literal('')),
  role: z.enum(['buyer', 'seller'], {
    required_error: 'Please select an account type',
  }),
})

export default function Register() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { mutateAsync: registerUser, isPending: isLoading } = useRegister()

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      role: 'buyer'
    }
  })

  const selectedRole = watch('role')

  const onSubmit = async (data) => {
    try {
      const formattedRole = data.role.charAt(0).toUpperCase() + data.role.slice(1) // 'Buyer' or 'Seller'

      const payload = {
        email: data.email,
        password: data.password,
        first_name: data.first_name.trim(),
        last_name: data.last_name.trim(),
        phone: data.phone || '',
        address: data.address || '',
        role: formattedRole
      }

      const res = await registerUser(payload)
      if (res.success) {
        const userData = {
          id: res.user.id,
          name: `${res.user.first_name || ''} ${res.user.last_name || ''}`.trim() || res.user.email.split('@')[0],
          email: res.user.email,
          role: res.user.role.toLowerCase()
        }
        dispatch(setCredentials(userData))
        toast.success(`Welcome to Rarenest, ${userData.name}!`)
        navigate('/')
      } else {
        toast.error(res.message || 'Registration failed.')
      }
    } catch (err) {
      toast.error(err.message || 'Registration failed. Please try again.')
    }
  }

  return (
    <div className="flex min-h-[85vh] items-center justify-center py-10 max-w-7xl mx-auto px-4">
      <div className="w-full max-w-md rounded-3xl border border-neutral-100 dark:border-neutral-850 bg-white dark:bg-neutral-900/60 p-8 shadow-xl flex flex-col gap-6 relative overflow-hidden">
        {/* Top brand color outline bar */}
        <div className="absolute top-0 left-0 w-full h-1.5 bg-brand-bronze"></div>

        {/* Title */}
        <div className="flex flex-col items-center text-center gap-2">
          <div className="inline-flex items-center gap-1.5 text-[9px] font-bold text-brand-bronze tracking-widest uppercase bg-brand-bronze/10 px-3 py-1 rounded-full mb-1">
            <Sparkles className="h-3 w-3" /> New Journey
          </div>
          <h1 className="font-serif text-3xl font-bold tracking-tight text-neutral-950 dark:text-white">Create Account</h1>
          <p className="text-xs text-neutral-500 max-w-[280px]">
            Sign up to discover alternative dwellings or list your custom residences.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          
          {/* Role selector */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider flex items-center gap-1.5">
              <Award className="h-3.5 w-3.5 text-brand-bronze" /> Account Objective
            </label>
            <div className="grid grid-cols-2 gap-3 mt-0.5">
              <button
                type="button"
                onClick={() => setValue('role', 'buyer')}
                className={`py-3 px-3 rounded-xl border text-sm font-bold transition-all duration-300 flex flex-col items-center gap-0.5 ${
                  selectedRole === 'buyer'
                    ? 'border-brand-bronze bg-brand-bronze/10 text-brand-bronze scale-[1.02]'
                    : 'border-neutral-200 dark:border-neutral-850 bg-transparent text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-950/40 hover:text-neutral-600'
                }`}
              >
                <span>Buyer</span>
                <span className="text-[9px] font-semibold opacity-75">Find Rare Homes</span>
              </button>
              <button
                type="button"
                onClick={() => setValue('role', 'seller')}
                className={`py-3 px-3 rounded-xl border text-sm font-bold transition-all duration-300 flex flex-col items-center gap-0.5 ${
                  selectedRole === 'seller'
                    ? 'border-brand-bronze bg-brand-bronze/10 text-brand-bronze scale-[1.02]'
                    : 'border-neutral-200 dark:border-neutral-850 bg-transparent text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-950/40 hover:text-neutral-600'
                }`}
              >
                <span>Seller / Builder</span>
                <span className="text-[9px] font-semibold opacity-75">Publish & Build</span>
              </button>
            </div>
          </div>

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
                className={`h-11 rounded-xl bg-neutral-50/50 dark:bg-neutral-950 px-4 text-sm border outline-none transition-all placeholder:text-neutral-400 font-sans ${
                  errors.first_name 
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
                className={`h-11 rounded-xl bg-neutral-50/50 dark:bg-neutral-950 px-4 text-sm border outline-none transition-all placeholder:text-neutral-400 font-sans ${
                  errors.last_name 
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
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider flex items-center gap-1.5">
              <Lock className="h-3.5 w-3.5 text-brand-bronze" /> Create Password
            </label>
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

          {/* Phone */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider flex items-center gap-1.5">
              <Phone className="h-3.5 w-3.5 text-brand-bronze" /> Phone Number
            </label>
            <input
              type="tel"
              {...register('phone')}
              placeholder="+1 (555) 000-0000"
              className={`h-11 rounded-xl bg-neutral-50/50 dark:bg-neutral-950 px-4 text-sm border outline-none transition-all placeholder:text-neutral-400 font-sans ${
                errors.phone 
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
              className={`h-11 rounded-xl bg-neutral-50/50 dark:bg-neutral-950 px-4 text-sm border outline-none transition-all placeholder:text-neutral-400 font-sans ${
                errors.address 
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

        {/* Footer */}
        <div className="text-center text-xs text-neutral-400 border-t border-neutral-100 dark:border-neutral-800/40 pt-4 mt-2">
          Already have an account?{' '}
          <Link to="/login" className="font-bold text-brand-bronze hover:underline transition-colors">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  )
}
