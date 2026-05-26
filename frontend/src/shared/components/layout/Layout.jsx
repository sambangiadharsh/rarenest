import React from 'react'
import { Outlet } from 'react-router-dom'
import Header from './Header'
import Footer from './Footer'
import { Toaster } from 'sonner'

export default function Layout() {
  return (
    <div className="flex min-h-screen flex-col bg-background font-sans text-foreground antialiased selection:bg-primary/15">
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
    </div>
  )
}
