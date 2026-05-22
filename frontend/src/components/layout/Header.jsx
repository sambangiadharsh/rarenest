import React from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { Home, Heart, User, LogOut, Menu, X, PlusCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { logout } from '@/store/authSlice'
import { useLogout } from '@/hooks/useAuth'
import { toast } from 'sonner'
import { getAdminLoginUrl } from '@/config/app'

export default function Header() {
  const { isAuthenticated, user } = useSelector((state) => state.auth)
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { mutateAsync: logoutApi } = useLogout()
  const [isOpen, setIsOpen] = React.useState(false)

  const handleLogout = async () => {
    try {
      await logoutApi()
    } catch (err) {
      // Fallback
    }
    dispatch(logout())
    toast.success('Successfully logged out!')
    navigate('/')
  }

  const activeStyle = ({ isActive }) =>
    `relative text-sm font-semibold tracking-wide transition-colors duration-300 ${
      isActive
        ? 'text-brand-terracotta font-extrabold'
        : 'text-brand-warm-white/80 hover:text-white'
    }`

  const isAdmin = user?.role?.toLowerCase() === 'admin'
  const isSeller = user?.role?.toLowerCase() === 'seller'

  return (
    <header className="sticky top-0 z-50 w-full border-b border-brand-forest-mid/30 bg-brand-forest text-white backdrop-blur-md transition-all duration-300 shadow-md">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <div className="flex items-center gap-2">
          <Link to="/" className="flex items-center gap-1">
            <span className="font-serif text-2xl font-black tracking-tight text-white">
              Rare<span className="text-brand-terracotta">Nest</span>
            </span>
          </Link>
        </div>

        {/* Desktop Navigation */}
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
          {isAuthenticated && !isAdmin && (
            <NavLink to="/wishlist" className={activeStyle}>
              Wishlist
            </NavLink>
          )}
          {isAuthenticated && isSeller && (
            <NavLink to="/dashboard" className={activeStyle}>
              Dashboard
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

        {/* Action Buttons */}
        <div className="hidden md:flex items-center gap-4">
          {isAuthenticated ? (
            <div className="flex items-center gap-4">
              {!isAdmin && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => navigate('/properties/create')} 
                  className="gap-1.5 border-brand-terracotta/40 text-brand-terracotta hover:bg-brand-terracotta hover:text-white font-semibold transition-all duration-300"
                >
                  <PlusCircle className="h-4 w-4" />
                  List a Property
                </Button>
              )}
              <div className="flex items-center gap-2 rounded-full bg-brand-forest-mid/60 px-4 py-2 border border-brand-forest-mid/80 shadow-inner">
                <User className="h-4 w-4 text-brand-terracotta" />
                <span className="text-sm font-semibold text-brand-warm-white">{user.name || user.email}</span>
              </div>
              <Button variant="ghost" size="icon" onClick={handleLogout} title="Log Out" className="hover:bg-brand-forest-mid/40 rounded-full">
                <LogOut className="h-4 w-4 text-brand-warm-white/60 hover:text-brand-terracotta transition-colors" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" className="font-semibold text-brand-warm-white/80 hover:text-white hover:bg-brand-forest-mid/40" asChild>
                <Link to="/login">Sign In</Link>
              </Button>
              <Button 
                size="sm" 
                className="bg-brand-terracotta hover:bg-brand-terracotta/90 text-white font-semibold shadow-md transition-all duration-300 rounded-xl px-5 border-none" 
                asChild
              >
                <Link to="/register">List a Property</Link>
              </Button>
            </div>
          )}
        </div>

        {/* Mobile menu button */}
        <div className="md:hidden">
          <Button variant="ghost" size="icon" onClick={() => setIsOpen(!isOpen)} className="rounded-full hover:bg-brand-forest-mid/45">
            {isOpen ? <X className="h-5 w-5 text-white" /> : <Menu className="h-5 w-5 text-white" />}
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden border-b border-brand-forest-mid/50 bg-brand-forest/98 px-4 pt-2 pb-6 shadow-xl backdrop-blur-md animate-in fade-in slide-in-from-top-5 duration-200">
          <div className="flex flex-col gap-3">
            <Link
              to="/"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-brand-warm-white/95 hover:bg-brand-forest-mid/55 transition-colors"
            >
              <Home className="h-4 w-4 text-brand-terracotta" /> Explore
            </Link>
            <a
              href="/#builders"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-brand-warm-white/95 hover:bg-brand-forest-mid/55 transition-colors"
            >
              Builders
            </a>
            <a
              href="/#how-it-works"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-brand-warm-white/95 hover:bg-brand-forest-mid/55 transition-colors"
            >
              How it works
            </a>
            {!isAdmin && (
              <Link
                to="/properties"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-brand-warm-white/95 hover:bg-brand-forest-mid/55 transition-colors"
              >
                Catalog
              </Link>
            )}
            {isAuthenticated && !isAdmin && (
              <Link
                to="/wishlist"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-brand-warm-white/95 hover:bg-brand-forest-mid/55 transition-colors"
              >
                <Heart className="h-4 w-4 text-brand-terracotta" /> Wishlist
              </Link>
            )}
            {isAuthenticated && isSeller && (
              <Link
                to="/dashboard"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-brand-warm-white/95 hover:bg-brand-forest-mid/55 transition-colors"
              >
                Dashboard
              </Link>
            )}
            {isAuthenticated && isAdmin && (
              <a
                href={getAdminLoginUrl()}
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-brand-warm-white/95 hover:bg-brand-forest-mid/55 transition-colors"
              >
                Admin Portal
              </a>
            )}

            <hr className="border-brand-forest-mid/50 my-2" />

            {isAuthenticated ? (
              <div className="flex flex-col gap-3 px-2">
                <div className="px-2 text-xs font-semibold text-brand-warm-white/60">
                  Signed in as: <span className="text-white font-bold">{user.name || user.email}</span>
                </div>
                {!isAdmin && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => { setIsOpen(false); navigate('/properties/create') }} 
                    className="justify-start gap-1.5 border-brand-terracotta/40 text-brand-terracotta hover:bg-brand-terracotta hover:text-white font-semibold rounded-xl"
                  >
                    <PlusCircle className="h-4 w-4" />
                    List a Property
                  </Button>
                )}
                <Button 
                  variant="destructive" 
                  size="sm" 
                  onClick={() => { setIsOpen(false); handleLogout() }} 
                  className="justify-start gap-1.5 rounded-xl font-semibold bg-brand-terracotta hover:bg-brand-terracotta/90 text-white border-none"
                >
                  <LogOut className="h-4 w-4" />
                  Log Out
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3 mt-1">
                <Button variant="outline" size="sm" asChild onClick={() => setIsOpen(false)} className="rounded-xl font-semibold border-brand-warm-white/30 text-brand-warm-white hover:bg-brand-forest-mid/60 hover:text-white bg-transparent">
                  <Link to="/login">Sign In</Link>
                </Button>
                <Button size="sm" asChild onClick={() => setIsOpen(false)} className="bg-brand-terracotta hover:bg-brand-terracotta/90 text-white font-semibold rounded-xl border-none">
                  <Link to="/register">List a Property</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
