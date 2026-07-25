import React, { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Header from './Header'
import Footer from './Footer'
import { Toaster } from 'sonner'
import { WishlistProvider } from '@/features/wishlist/context/WishlistContext'
import CustomerSupportWidget from './CustomerSupportWidget'

function ScrollToTop() {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
  }, [pathname])

  return null
}

export default function Layout() {
  return (
    <WishlistProvider>
      <div className="flex min-h-screen flex-col bg-background font-sans text-foreground antialiased selection:bg-primary/15">
        <ScrollToTop />

        {/* Dynamic Header */}
        <Header />

        {/* Main Content Area */}
        <main className="flex-1 w-full">
          <Outlet />
        </main>

        {/* Dynamic Footer */}
        <Footer />

        {/* Global Smooth Toast Notifications */}
        <Toaster position="bottom-right" richColors closeButton />

        {/* Customer Support Chat Widget */}
        <CustomerSupportWidget />
      </div>
    </WishlistProvider>
  )
}

