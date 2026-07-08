import React, { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  useBuilderApplications,
} from '../hooks/useBuilder'
import {
  Search,
  ChevronDown,
  ChevronRight,
  ShieldAlert,
  FileCheck,
  FileX,
  FileArchive,
  ShieldCheck,
  XCircle,
  Clock
} from 'lucide-react'
import { Input } from '@/shared/components/ui/input'
import { Skeleton } from '@/shared/components/ui/skeleton'
import { Button } from '@/shared/components/ui/button'

export default function BuilderApplications() {
  const navigate = useNavigate()
  const { data: appsRes, isLoading } = useBuilderApplications()

  const allApps = appsRes?.data || []

  // State
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('All Status')

  // Stats
  const totalApps = allApps.length
  const pendingCount = allApps.filter(a => a.status === 'Pending').length
  const approvedCount = allApps.filter(a => a.status === 'Approved').length
  const rejectedCount = allApps.filter(a => a.status === 'Rejected').length

  // Filtered Apps
  const filteredApps = useMemo(() => {
    return allApps.filter(app => {
      const matchesSearch = app.company_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            app.business_email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            app.contact_person_name?.toLowerCase().includes(searchQuery.toLowerCase())
      
      const matchesStatus = statusFilter === 'All Status' || app.status === statusFilter

      return matchesSearch && matchesStatus
    })
  }, [allApps, searchQuery, statusFilter])

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Pending':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400">
            <Clock className="h-3 w-3" />
            Pending
          </span>
        )
      case 'Approved':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-750 dark:bg-emerald-950/20 dark:text-emerald-400">
            <ShieldCheck className="h-3 w-3" />
            Approved
          </span>
        )
      case 'Rejected':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-750 dark:bg-rose-950/20 dark:text-rose-400">
            <XCircle className="h-3 w-3" />
            Rejected
          </span>
        )
      default:
        return null
    }
  }

  return (
    <div className="flex flex-col gap-6 p-6 max-w-7xl mx-auto w-full">
      {/* Main Content */}
      <div className="w-full">
        
        {/* Header */}
        <div className="flex flex-col gap-1 mb-8">
          <h1 className="font-heading text-2xl font-bold tracking-tight text-brand-forest">
            Builder Applications
          </h1>
          <p className="text-sm text-muted-foreground max-w-2xl">
            Review and verify builder applications before allowing them to publish builder project listings.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white dark:bg-neutral-900 p-5 rounded-2xl border border-neutral-200 dark:border-neutral-800 flex items-center gap-4 shadow-sm">
            <div className="h-10 w-10 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-600 dark:text-neutral-300">
              <FileArchive className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 leading-none">{totalApps}</p>
              <p className="text-xs text-neutral-500 font-medium mt-1">Total Applications</p>
            </div>
          </div>
          <div className="bg-white dark:bg-neutral-900 p-5 rounded-2xl border border-neutral-200 dark:border-neutral-800 flex items-center gap-4 shadow-sm">
            <div className="h-10 w-10 rounded-full bg-amber-50 dark:bg-amber-950/30 flex items-center justify-center text-amber-600 dark:text-amber-400">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 leading-none">{pendingCount}</p>
              <p className="text-xs text-neutral-500 font-medium mt-1">Pending Review</p>
            </div>
          </div>
          <div className="bg-white dark:bg-neutral-900 p-5 rounded-2xl border border-neutral-200 dark:border-neutral-800 flex items-center gap-4 shadow-sm">
            <div className="h-10 w-10 rounded-full bg-emerald-50 dark:bg-emerald-950/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <FileCheck className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 leading-none">{approvedCount}</p>
              <p className="text-xs text-neutral-500 font-medium mt-1">Approved</p>
            </div>
          </div>
          <div className="bg-white dark:bg-neutral-900 p-5 rounded-2xl border border-neutral-200 dark:border-neutral-800 flex items-center gap-4 shadow-sm">
            <div className="h-10 w-10 rounded-full bg-rose-50 dark:bg-rose-950/30 flex items-center justify-center text-rose-600 dark:text-rose-400">
              <FileX className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 leading-none">{rejectedCount}</p>
              <p className="text-xs text-neutral-500 font-medium mt-1">Rejected</p>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
            <Input 
              placeholder="Search by builder name, email..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-11 bg-background rounded-xl border border-input w-full"
            />
          </div>
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-11 px-4 bg-background border border-input rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-brand-bronze/20"
          >
            <option value="All Status">Filter: All Status</option>
            <option value="Pending">Pending</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>

        {/* List */}
        <div className="flex flex-col gap-3 pb-8">
          {isLoading ? (
            <Skeleton className="h-24 w-full rounded-2xl" />
          ) : filteredApps.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-neutral-500">No applications found matching your criteria.</p>
            </div>
          ) : (
            filteredApps.map((app) => {
              const companyInitials = app.company_name
                ? app.company_name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
                : 'BP'

              return (
                <div 
                  key={app.id} 
                  className="bg-card border border-border shadow-sm rounded-2xl overflow-hidden"
                >
                  <div className="p-5 flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <div className="h-10 w-10 rounded-full bg-brand-bronze/10 text-brand-bronze flex items-center justify-center font-bold text-sm shrink-0">
                        {companyInitials}
                      </div>
                      <div className="flex flex-col gap-1 min-w-0 pr-4">
                        <div className="flex items-center gap-3 flex-wrap">
                          <h3 className="font-bold text-neutral-900 dark:text-neutral-100 truncate max-w-[200px] sm:max-w-xs">{app.company_name}</h3>
                          {getStatusBadge(app.status)}
                        </div>
                        <p className="text-[11px] text-neutral-500 truncate">
                          Representative: <span className="font-medium text-neutral-700 dark:text-neutral-300">{app.contact_person_name}</span> 
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6 shrink-0">
                      <span className="text-xs text-neutral-500 font-medium hidden sm:block">
                        {new Date(app.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                      </span>
                      <Button
                        onClick={() => navigate(`/builders/applications/${app.id}`)}
                        variant="ghost"
                        className="h-9 font-semibold text-xs px-4 rounded-xl text-brand-bronze hover:bg-brand-bronze/10 border border-transparent hover:border-neutral-200"
                      >
                        View Application <ChevronRight className="ml-1 h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </div>
              )
            })
          )}
          
          {/* Pagination mockup */}
          {!isLoading && filteredApps.length > 0 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-xs text-neutral-500">Showing 1 to {filteredApps.length} of {filteredApps.length} applications</p>
              <div className="flex gap-2">
                <Button variant="outline" size="icon" className="h-8 w-8 rounded-lg" disabled><ChevronDown className="h-4 w-4 rotate-90" /></Button>
                <Button variant="outline" size="icon" className="h-8 w-8 rounded-lg bg-neutral-100 font-bold border-none">1</Button>
                <Button variant="outline" size="icon" className="h-8 w-8 rounded-lg" disabled><ChevronDown className="h-4 w-4 -rotate-90" /></Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
