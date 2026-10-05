import React from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { Heart, Menu, X, PlusCircle } from 'lucide-react'
import { motion } from 'framer-motion'
import { Button } from '@/shared/components/ui/button'
import { logout } from '@/app/store/authSlice'
import { useLogout } from '@/features/auth'
import { toast } from 'sonner'
import { getAdminLoginUrl } from '@/shared/config/app'
import AccountMenu from './AccountMenu'
import NotificationBell from '@/features/notifications/components/NotificationBell'
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
  const location = useLocation()
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

  // Smooth scroll helper for hash-links
  React.useEffect(() => {
    if (location.hash) {
      const id = location.hash.replace('#', '')
      const scrollTimer = setTimeout(() => {
        const element = document.getElementById(id)
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' })
        }
      }, 100)
      return () => clearTimeout(scrollTimer)
    }
  }, [location])

  const isLinkActive = (path, hash) => {
    if (hash) {
      return location.pathname === path && location.hash === `#${hash}`
    }
    if (path === '/') {
      return location.pathname === '/' && (!location.hash || location.hash === '')
    }
    return location.pathname.startsWith(path) && !location.hash
  }

  const isAdmin = user?.role?.toLowerCase() === 'admin'

  const handleListProperty = (closeMenu) => {
    if (closeMenu) closeMenu()
    if (!isAuthenticated) {
      setGuestListingOpen(true)
      return
    }
    navigate('/properties/create')
  }

  const navItems = [
    { label: 'Explore', path: '/', hash: '' },
    { label: 'Builders', path: '/', hash: 'builders' },
    { label: 'How it works', path: '/', hash: 'how-it-works' },
    ...(!isAdmin ? [{ label: 'Listings', path: '/properties', hash: '' }] : []),
  ]

  const navIcons = (
    <>
      <NavIconButton
        icon={Heart}
        label="Wishlist"
        onClick={handleWishlistClick}
        badgeCount={wishlistCount}
      />
      {isAuthenticated && <NotificationBell />}
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
                className="h-25 w-auto object-contain"
              />
            </Link>
          </div>

          {/* Capsule Pill Header Navigation Bar applied strictly to Explore, Builders, How it works, Listings */}
          <nav className="hidden md:flex items-center ml-auto mr-6">
            <div className="flex items-center gap-1 rounded-full bg-white/10 p-1.5 backdrop-blur-md border border-white/15 shadow-inner">
              {navItems.map((item) => {
                const active = isLinkActive(item.path, item.hash)
                const targetUrl = item.hash ? `${item.path}#${item.hash}` : item.path

                return (
                  <Link
                    key={item.label}
                    to={targetUrl}
                    className={`relative rounded-full px-5 py-2 text-sm font-semibold transition-colors duration-200 select-none ${
                      active ? 'text-brand-forest font-bold' : 'text-brand-warm-white/80 hover:text-white'
                    }`}
                  >
                    {active && (
                      <motion.span
                        layoutId="activeHeaderPill"
                        className="absolute inset-0 bg-brand-cream rounded-full shadow-md"
                        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                      />
                    )}
                    <span className="relative z-10">{item.label}</span>
                  </Link>
                )
              })}

              {isAuthenticated && isAdmin && (
                <a
                  href={getAdminLoginUrl()}
                  className="relative rounded-full px-4 py-2 text-sm font-semibold text-brand-warm-white/80 hover:text-white transition-colors"
                >
                  <span className="relative z-10">Admin Portal</span>
                </a>
              )}
            </div>
          </nav>

          <div className="hidden md:flex items-center gap-2">
            {!isAdmin && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleListProperty()}
                className="gap-1.5 border-brand-terracotta/40 text-brand-terracotta hover:bg-brand-terracotta hover:text-white font-semibold transition-all duration-300 rounded-full px-4"
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
            <div className="flex flex-col gap-2">
              <div className="flex flex-col gap-1.5 bg-white/5 p-2 rounded-2xl border border-white/10">
                {navItems.map((item) => {
                  const active = isLinkActive(item.path, item.hash)
                  const targetUrl = item.hash ? `${item.path}#${item.hash}` : item.path
                  return (
                    <Link
                      key={item.label}
                      to={targetUrl}
                      onClick={closeMobile}
                      className={`flex items-center justify-between rounded-xl px-4 py-2.5 text-sm font-semibold transition-all ${
                        active
                          ? 'bg-brand-cream text-brand-forest shadow-sm font-bold'
                          : 'text-brand-warm-white/90 hover:bg-white/10'
                      }`}
                    >
                      <span>{item.label}</span>
                    </Link>
                  )
                })}
              </div>

              {isAuthenticated && isAdmin && (
                <a
                  href={getAdminLoginUrl()}
                  onClick={closeMobile}
                  className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-brand-warm-white/95 hover:bg-brand-forest-mid/55 transition-colors font-bold"
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
