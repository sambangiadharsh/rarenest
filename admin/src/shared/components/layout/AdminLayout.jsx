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
        <SidebarInset>
          <AdminHeader />
          <main className="flex-1 overflow-auto p-4 md:p-6">
            <Outlet />
          </main>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  )
}
