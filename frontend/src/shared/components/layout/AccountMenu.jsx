import { Link, useNavigate } from 'react-router-dom'
import {
  User,
  Home,
  MessageSquare,
  Heart,
  LifeBuoy,
  LogOut,
  ChevronDown,
} from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu'
import { cn } from '@/shared/lib/utils'

function MenuLinkItem({ to, icon: Icon, children, onNavigate }) {
  return (
    <DropdownMenuItem asChild className="cursor-pointer">
      <Link
        to={to}
        onClick={onNavigate}
        className="flex w-full items-center gap-2"
      >
        <Icon className="h-4 w-4 text-brand-terracotta" />
        {children}
      </Link>
    </DropdownMenuItem>
  )
}

export default function AccountMenu({
  isAuthenticated,
  user,
  isAdmin,
  onLogout,
  onNavigate,
  className,
  align = 'end',
}) {
  const navigate = useNavigate()

  const displayName =
    user?.name ||
    (user?.email ? user.email.split('@')[0] : 'Account')

  const handleLogout = () => {
    onNavigate?.()
    onLogout()
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            'gap-1.5 rounded-full border border-brand-forest-mid/80 bg-brand-forest-mid/60 px-3 py-2 font-semibold text-brand-warm-white hover:bg-brand-forest-mid/80 hover:text-white',
            className,
          )}
          aria-label="Account menu"
        >
          <User className="h-4 w-4 shrink-0 text-brand-terracotta" />
          {isAuthenticated && (
            <span className="max-w-[120px] truncate text-sm hidden sm:inline">
              {displayName}
            </span>
          )}
          <ChevronDown className="h-3.5 w-3.5 opacity-70" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align={align}
        className="min-w-48 border-brand-forest-mid/20 bg-white text-foreground shadow-lg"
      >
        {isAuthenticated ? (
          <>
            <MenuLinkItem to="/profile" icon={User} onNavigate={onNavigate}>
              My Profile
            </MenuLinkItem>
            {!isAdmin && (
              <MenuLinkItem to="/dashboard" icon={Home} onNavigate={onNavigate}>
                My Properties
              </MenuLinkItem>
            )}
            {!isAdmin && (
              <MenuLinkItem
                to="/enquiries"
                icon={MessageSquare}
                onNavigate={onNavigate}
              >
                Enquiries
              </MenuLinkItem>
            )}
            {!isAdmin && (
              <MenuLinkItem to="/wishlist" icon={Heart} onNavigate={onNavigate}>
                Wishlist
              </MenuLinkItem>
            )}
            <MenuLinkItem to="/contact" icon={LifeBuoy} onNavigate={onNavigate}>
              Help & Support
            </MenuLinkItem>
            <MenuLinkItem to="/profile" icon={User} onNavigate={onNavigate}>
              Reset Password
            </MenuLinkItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
              className="cursor-pointer gap-2"
              onSelect={handleLogout}
            >
              <LogOut className="h-4 w-4" />
              Logout
            </DropdownMenuItem>
          </>
        ) : (
          <>
            <DropdownMenuItem
              className="cursor-pointer"
              onSelect={() => {
                onNavigate?.()
                navigate('/login')
              }}
            >
              Sign In
            </DropdownMenuItem>
            <DropdownMenuItem asChild className="cursor-pointer">
              <Link
                to="/register"
                onClick={onNavigate}
                className="flex w-full items-center"
              >
                List a Property
              </Link>
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
