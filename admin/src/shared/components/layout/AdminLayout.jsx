import { Outlet } from 'react-router-dom'
import { TooltipProvider } from '@/shared/components/ui/tooltip'
import { SidebarInset, SidebarProvider } from '@/shared/components/ui/sidebar'
import AppSidebar from './AppSidebar'
import AdminHeader from './AdminHeader'

export default function AdminLayout() {
  return (
    <TooltipProvider>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset className="min-w-0">
          <AdminHeader />
          <main className="flex-1 min-w-0 overflow-y-auto overflow-x-hidden p-4 md:p-6">
            <Outlet />
          </main>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  )
}
