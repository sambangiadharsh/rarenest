import { useLocation, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { LogOut, Bell } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/shared/components/ui/button'
import { Separator } from '@/shared/components/ui/separator'
import { SidebarTrigger } from '@/shared/components/ui/sidebar'
import { routeTitles } from '@/shared/config/nav'
import { logout } from '@/app/store/authSlice'
import { useLogout } from '@/features/auth'

function getInitials(name) {
  if (!name) return 'A'
  const parts = name.trim().split(' ')
  if (parts.length === 1) return parts[0][0].toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

export default function AdminHeader() {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { user } = useSelector((state) => state.auth)
  const { mutateAsync: logoutApi } = useLogout()
  const title = routeTitles[pathname] ?? 'Admin'

  const displayName = user?.name || user?.email || 'Admin'
  const initials = getInitials(displayName)

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
    <header className="flex h-14 shrink-0 items-center gap-2 border-b border-border bg-background/95 px-4 backdrop-blur-sm">
      <SidebarTrigger className="-ml-1 text-muted-foreground hover:text-foreground" />
      <Separator orientation="vertical" className="mr-2 h-4" />

      <div className="flex flex-1 items-center justify-between gap-4 min-w-0">
        <h1 className="font-heading text-base font-semibold text-brand-forest truncate">{title}</h1>

        <div className="flex shrink-0 items-center gap-2">
          {/* Notification bell */}
          <Button variant="ghost" size="icon" className="size-8 text-muted-foreground hover:text-foreground">
            <Bell className="size-4" />
            <span className="sr-only">Notifications</span>
          </Button>

          <Separator orientation="vertical" className="h-4" />

          {/* User info + avatar */}
          <div className="flex items-center gap-2.5">
            <div className="hidden flex-col items-end sm:flex">
              <span className="text-xs font-medium text-foreground leading-none">{displayName}</span>
              <span className="mt-0.5 text-[10px] text-muted-foreground leading-none">Administrator</span>
            </div>
            <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-brand-forest text-[11px] font-semibold text-white">
              {initials}
            </div>
          </div>

          <Separator orientation="vertical" className="h-4" />

          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="gap-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/5"
          >
            <LogOut className="size-4" />
            <span className="hidden sm:inline text-xs">Logout</span>
          </Button>
        </div>
      </div>
    </header>
  )
}
