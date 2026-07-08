import React from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { Home, Heart, Bell, Menu, X, PlusCircle } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { logout } from '@/app/store/authSlice'
import { useLogout } from '@/features/auth'
import { toast } from 'sonner'
import { getAdminLoginUrl } from '@/shared/config/app'
import AccountMenu from './AccountMenu'
import { useWishlistContext } from '@/features/wishlist'
import GuestListingModal from '@/features/properties/components/GuestListingModal'
import Logo from '@/assets/Logo.png'

function NavIconButton({
  icon: Icon,
  label,
  onClick,
  className,
  badgeCount = 0,
}) {
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={onClick}
      title={label}
      aria-label={label}
      className={`relative rounded-full hover:bg-brand-forest-mid/40 ${className || ''
        }`}
    >
      <Icon className="h-4 w-4 text-brand-warm-white/80 hover:text-brand-terracotta transition-colors" />

      {badgeCount > 0 && (
        <span className="absolute -right-1 -top-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-brand-terracotta px-1 text-[10px] font-bold text-white">
          {badgeCount > 99 ? '99+' : badgeCount}
        </span>
      )}
    </Button>
  )
}
export default function Header() {
  const { isAuthenticated, user } = useSelector((state) => state.auth)
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { mutateAsync: logoutApi } = useLogout()
  const [isOpen, setIsOpen] = React.useState(false)
  const [guestListingOpen, setGuestListingOpen] = React.useState(false)

  const { wishlistedIds } = useWishlistContext()
  const wishlistCount = wishlistedIds.size
  const handleLogout = async () => {
    try {
      await logoutApi()
    } catch {
      // Fallback
    }
    dispatch(logout())
    toast.success('Successfully logged out!')
    navigate('/')
  }

  const closeMobile = () => setIsOpen(false)

  const handleWishlistClick = () => {
    if (!isAuthenticated) {
      navigate('/login')
      return
    }
    navigate('/wishlist')
  }

  const handlePlaceholderIcon = (feature) => {
    if (!isAuthenticated) {
      navigate('/login')
      return
    }
    toast.info(`${feature} coming soon`)
  }

  const activeStyle = ({ isActive }) =>
    `relative text-sm font-semibold tracking-wide transition-colors duration-300 ${isActive
      ? 'text-brand-terracotta font-extrabold'
      : 'text-brand-warm-white/80 hover:text-white'
    }`

  const isAdmin = user?.role?.toLowerCase() === 'admin'

  const handleListProperty = (closeMenu) => {
    if (closeMenu) closeMenu()
    if (!isAuthenticated) {
      setGuestListingOpen(true)
      return
    }
    navigate('/properties/create')
  }

  const navIcons = (
    <>
      <NavIconButton
        icon={Heart}
        label="Wishlist"
        onClick={handleWishlistClick}
        badgeCount={wishlistCount}
      />
      <NavIconButton
        icon={Bell}
        label="Notifications"
        onClick={() => handlePlaceholderIcon('Notifications')}
      />
    </>
  )

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-brand-forest-mid/30 bg-brand-forest text-white backdrop-blur-md transition-all duration-300 shadow-md">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <Link
              to="/"
              className="flex items-center gap-3 transition-opacity hover:opacity-90"
            >
              <img
                src={Logo}
                alt="RareNest"
                className="h-20 w-auto object-contain"
              />
            </Link>
          </div>

          <nav className="hidden md:flex items-center gap-8">
            <NavLink to="/" className={activeStyle}>
              Explore
            </NavLink>
            <a
              href="/#builders"
              className="text-sm font-semibold tracking-wide text-brand-warm-white/80 hover:text-white transition-colors"
            >
              Builders
            </a>
            <a
              href="/#how-it-works"
              className="text-sm font-semibold tracking-wide text-brand-warm-white/80 hover:text-white transition-colors"
            >
              How it works
            </a>
            {!isAdmin && (
              <NavLink to="/properties" className={activeStyle}>
                Catalog
              </NavLink>
            )}
            {isAuthenticated && isAdmin && (
              <a
                href={getAdminLoginUrl()}
                className="text-sm font-semibold tracking-wide text-brand-warm-white/80 hover:text-white transition-colors"
              >
                Admin Portal
              </a>
            )}
          </nav>

          <div className="hidden md:flex items-center gap-2">
            {!isAdmin && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleListProperty()}
                className="gap-1.5 border-brand-terracotta/40 text-brand-terracotta hover:bg-brand-terracotta hover:text-white font-semibold transition-all duration-300"
              >
                <PlusCircle className="h-4 w-4" />
                List a Property
              </Button>
            )}
            {isAuthenticated ? (
              <>
                {navIcons}
                <AccountMenu
                  isAuthenticated={isAuthenticated}
                  user={user}
                  isAdmin={isAdmin}
                  onLogout={handleLogout}
                />
              </>
            ) : (
              <AccountMenu
                isAuthenticated={false}
                user={null}
                isAdmin={false}
                onLogout={handleLogout}
              />
            )}
          </div>

          <div className="flex items-center gap-1 md:hidden">
            {navIcons}
            <AccountMenu
              isAuthenticated={isAuthenticated}
              user={user}
              isAdmin={isAdmin}
              onLogout={handleLogout}
              onNavigate={closeMobile}
              className="px-2"
            />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(!isOpen)}
              className="rounded-full hover:bg-brand-forest-mid/45"
              aria-label={isOpen ? 'Close menu' : 'Open menu'}
            >
              {isOpen ? (
                <X className="h-5 w-5 text-white" />
              ) : (
                <Menu className="h-5 w-5 text-white" />
              )}
            </Button>
          </div>
        </div>

        {isOpen && (
          <div className="md:hidden border-b border-brand-forest-mid/50 bg-brand-forest/98 px-4 pt-2 pb-6 shadow-xl backdrop-blur-md animate-in fade-in slide-in-from-top-5 duration-200">
            <div className="flex flex-col gap-3">
              <Link
                to="/"
                onClick={closeMobile}
                className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-brand-warm-white/95 hover:bg-brand-forest-mid/55 transition-colors"
              >
                <Home className="h-4 w-4 text-brand-terracotta" /> Explore
              </Link>
              <a
                href="/#builders"
                onClick={closeMobile}
                className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-brand-warm-white/95 hover:bg-brand-forest-mid/55 transition-colors"
              >
                Builders
              </a>
              <a
                href="/#how-it-works"
                onClick={closeMobile}
                className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-brand-warm-white/95 hover:bg-brand-forest-mid/55 transition-colors"
              >
                How it works
              </a>
              {!isAdmin && (
                <Link
                  to="/properties"
                  onClick={closeMobile}
                  className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-brand-warm-white/95 hover:bg-brand-forest-mid/55 transition-colors"
                >
                  Catalog
                </Link>
              )}
              {isAuthenticated && isAdmin && (
                <a
                  href={getAdminLoginUrl()}
                  onClick={closeMobile}
                  className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-brand-warm-white/95 hover:bg-brand-forest-mid/55 transition-colors"
                >
                  Admin Portal
                </a>
              )}

              <hr className="border-brand-forest-mid/50 my-2" />

              {!isAdmin && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    handleListProperty(closeMobile)
                  }}
                  className="justify-start gap-1.5 border-brand-terracotta/40 text-brand-terracotta hover:bg-brand-terracotta hover:text-white font-semibold rounded-xl"
                >
                  <PlusCircle className="h-4 w-4" />
                  List a Property
                </Button>
              )}
              {isAuthenticated && (
                <div className="px-2 text-xs font-semibold text-brand-warm-white/60">
                  Signed in as:{' '}
                  <span className="text-white font-bold">
                    {user.name || user.email}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      <GuestListingModal
        open={guestListingOpen}
        onClose={() => setGuestListingOpen(false)}
      />
    </>
  )
}
