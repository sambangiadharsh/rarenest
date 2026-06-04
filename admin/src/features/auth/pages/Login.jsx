import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useDispatch } from 'react-redux'
import { useNavigate, useLocation } from 'react-router-dom'
import { LogIn, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card'
import { setCredentials } from '@/app/store/authSlice'
import { useLogin } from '@/features/auth'

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
})

export default function Login() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation()
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
      navigate('/')
    } catch (err) {
      toast.error(
        err.message || 'Login failed. Please check your credentials.',
      )
    }
  }

  return (
    <div className="flex min-h-svh items-center justify-center bg-brand-cream p-4">
      <Card className="w-full max-w-md border-brand-sand">
        <CardHeader className="text-center">
          <div className="mx-auto mb-2 flex size-12 items-center justify-center rounded-xl bg-brand-forest text-primary-foreground">
            <span className="font-heading text-xl font-bold">R</span>
          </div>
          <CardTitle className="font-heading text-brand-forest">RareNest Admin</CardTitle>
          <CardDescription>Sign in to manage the platform</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@rarenest.co"
                autoComplete="email"
                aria-invalid={!!errors.email}
                {...register('email')}
              />
              {errors.email && (
                <p className="text-xs text-destructive">{errors.email.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                autoComplete="current-password"
                aria-invalid={!!errors.password}
                {...register('password')}
              />
              {errors.password && (
                <p className="text-xs text-destructive">{errors.password.message}</p>
              )}
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  <LogIn className="size-4" />
                  Sign in
                </>
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
