import { useLocation, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { LogOut } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { routeTitles } from '@/config/nav'
import { logout } from '@/store/authSlice'
import { useLogout } from '@/hooks/useAuth'

export default function AdminHeader() {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { user } = useSelector((state) => state.auth)
  const { mutateAsync: logoutApi } = useLogout()
  const title = routeTitles[pathname] ?? 'Admin'

  const handleLogout = async () => {
    try {
      await logoutApi()
    } catch {
      // Cookie may already be cleared
    }
    dispatch(logout())
    toast.success('Successfully logged out')
    navigate('/login')
  }

  return (
    <header className="flex h-14 shrink-0 items-center gap-2 border-b border-border bg-background px-4">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="mr-2 h-4" />
      <h1 className="font-heading text-lg font-medium text-brand-forest">{title}</h1>
      <div className="ml-auto flex items-center gap-2">
        <span className="hidden text-xs text-muted-foreground sm:inline">
          {user?.name || user?.email || 'Admin'}
        </span>
        <Button variant="outline" size="sm" onClick={handleLogout}>
          <LogOut className="size-4" />
          <span className="hidden sm:inline">Logout</span>
        </Button>
      </div>
    </header>
  )
}
