import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useDispatch } from 'react-redux'
import { useNavigate, useLocation } from 'react-router-dom'
import { LogIn, Loader2, Building2, Shield, Star, Eye, EyeOff } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'
import { setCredentials } from '@/app/store/authSlice'
import { useLogin } from '@/features/auth'
import GoogleAuthButton from '../components/GoogleAuthButton'
import Logo from '@/assets/Logo.png'
const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
})

const features = [
  { icon: Building2, text: 'Manage property listings & verifications' },
  { icon: Shield, text: 'Full platform control & oversight' },
  { icon: Star, text: 'Analytics, CMS & content management' },
]

export default function Login() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const [showPassword, setShowPassword] = useState(false)
  const { mutateAsync: login, isPending: isLoading } = useLogin()

  React.useEffect(() => {
    const params = new URLSearchParams(location.search)
    if (params.get('expired') === 'true') {
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
    defaultValues: {
      email: 'admin@rarenest.co',
      password: '',
    },
  })

  const onSubmit = async (data) => {
    try {
      const res = await login(data)
      if (!res.success) {
        toast.error(res.message || 'Login failed.')
        return
      }

      if (res.user.role?.toLowerCase() !== 'admin') {
        toast.error('Access denied. Admin credentials are required.')
        return
      }

      const userData = {
        id: res.user.id,
        name:
          `${res.user.first_name || ''} ${res.user.last_name || ''}`.trim() ||
          res.user.email.split('@')[0],
        email: res.user.email,
        role: res.user.role.toLowerCase(),
      }

      dispatch(setCredentials(userData))
      toast.success(`Welcome back, ${userData.name}!`)
      navigate('/', { replace: true })
    } catch (err) {
      toast.error(err.message || 'Login failed. Please check your credentials.')
    }
  }

  return (
    <div className="flex min-h-svh">
      {/* Left brand panel */}
      <div className="relative hidden flex-col overflow-hidden bg-[#492615] p-5 lg:flex lg:w-[45%]">
        {/* Decorative circles */}
        <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-[#492615]/40" />
        <div className="pointer-events-none absolute -bottom-16 -left-16 h-64 w-64 rounded-full bg-[#492615]/30" />
        <div className="pointer-events-none absolute bottom-40 right-10 h-40 w-40 rounded-full bg-[#492615]/20" />

        {/* Logo */}
        <div className="relative flex items-center">
             <img
                src={Logo}
                alt="RareNest"
                className="h-25 w-auto object-contain"
              />
            <p className="text-xs text-brand-sage">Admin Console</p>
        </div>

        {/* Center content */}
        <div className="relative space-y-8">
          <div>
            <h1 className="font-heading text-4xl font-bold leading-tight text-white">
              Manage your <br />
              <span className="text-brand-terracotta-light">real estate</span> <br />
              platform
            </h1>
            <p className="mt-4 text-sm leading-relaxed text-white">
              A powerful dashboard to oversee listings, users, enquiries, and all platform content from one place.
            </p>
          </div>
          <ul className="space-y-3">
            {features.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-3">
                <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-[#492615]/30">
                  <Icon className="size-4 text-brand-sage" />
                </div>
                <span className="text-sm text-brand-sand">{text}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Footer */}
        <p className="relative text-xs text-brand-sage/60">
          © 2025 RareNest. All rights reserved.
        </p>
      </div>

      {/* Right form panel */}
      <div className="flex flex-1 flex-col items-center justify-center bg-brand-warm-white px-6 py-12">
        {/* Mobile logo */}
        <div className="mb-8 flex items-center gap-2 lg:hidden">
          <div className="flex size-9 items-center justify-center rounded-xl bg-[#492615] shadow-lg">
            <span className="font-heading text-base font-bold text-white">R</span>
          </div>
          <span className="font-heading text-xl font-semibold text-brand-forest">RareNest Admin</span>
        </div>

        <div className="w-full max-w-[440px] rounded-[2rem] bg-white p-8 sm:p-10 shadow-[0_20px_60px_rgb(0,0,0,0.08)] border border-brand-sand/30">
          <div className="mb-8">
            <h2 className="font-heading text-2xl font-semibold text-brand-forest">Welcome back</h2>
            <p className="mt-1 text-sm text-muted-foreground">Sign in to your admin account to continue</p>
          </div>
         
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-foreground">
                Email address
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@rarenest.co"
                autoComplete="email"
                aria-invalid={!!errors.email}
                className="h-10 border-brand-sand bg-white focus-visible:ring-brand-forest/30"
                {...register('email')}
              />
              {errors.email && (
                <p className="text-xs text-destructive">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-foreground">
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  aria-invalid={!!errors.password}
                  className="h-10 border-brand-sand bg-white pr-10 focus-visible:ring-brand-forest/30"
                  {...register('password')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-destructive">{errors.password.message}</p>
              )}
            </div>
            
            <Button
              type="submit"
              className="h-10 w-full gap-2 bg-[#492615] text-white hover:bg-[#492615]/90"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Signing in…
                </>
              ) : (
                <>
                  <LogIn className="size-4" />
                  Sign in
                </>
              )}
            </Button>
          </form>

          <div className="relative mt-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-brand-sand"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-brand-warm-white px-2 text-muted-foreground">Or</span>
            </div>
          </div>

          <div className="mt-6">
            <GoogleAuthButton />
          </div>

          <p className="mt-8 text-center text-xs text-muted-foreground">
            Restricted to authorized administrators only.
          </p>
        </div>
      </div>
    </div>
  )
}



<div>
  <form>
    <input type="text" placeholder="name of agent"/>
    <input type="password" placeholder="address"/>
    <input type="number"/>
    <textarea row="3" cols="30"></textarea>
    <lable>options</lable>
    <input type="radio"/>
    <select>

      <options>
         <option>
          agent
         </option>
         <option>
          builder
         </option>
         <option>
          developer
         </option>
         <option>
          buyer
         </option>
         <option>
          seller
         </option>
      </options>
    </select>
    
    <button type="submit">Submit</button>

  </form>
  <p>
    <h1></h1>
    <strong></strong>
    <br></br>
    <hr>
    </hr>
    <table>
      <tr>
        <td>name</td>
        <td>address</td>
        <td>email</td>
        <td>phone

        </td>
        <td>
          property count
        </td>
        <td>
          <button>
            edit
          </button>
        </td>
      </tr>
    </table>
  </p>
</div>
