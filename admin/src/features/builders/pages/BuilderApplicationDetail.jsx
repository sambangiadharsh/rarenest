import React, { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useBuilderApplications, useReviewBuilderApplication } from '../hooks/useBuilder'
import { getApiOrigin } from '@/shared/config/api'
import Swal from 'sweetalert2'
import {
  ArrowLeft,
  Building2,
  Mail,
  Phone,
  MapPin,
  FileText,
  FileImage,
  Clock,
  ShieldCheck,
  XCircle,
  CheckCircle2,
  XOctagon,
  Calendar,
  User,
  ZoomIn,
  ZoomOut,
  ChevronLeft,
  ChevronRight,
  Briefcase,
  Globe,
  Hash
} from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Skeleton } from '@/shared/components/ui/skeleton'
import { toast } from 'sonner'

export default function BuilderApplicationDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { data: appsRes, isLoading } = useBuilderApplications()
  const reviewMutation = useReviewBuilderApplication()

  const allApps = appsRes?.data || []
  const app = allApps.find(a => String(a.id) === String(id))

  const [selectedDoc, setSelectedDoc] = useState(null)

  // Touch handlers for swipe
  const [touchStart, setTouchStart] = useState(null)
  const [touchEnd, setTouchEnd] = useState(null)
  const minSwipeDistance = 50

  const onTouchStart = (e) => {
    setTouchEnd(null)
    setTouchStart(e.targetTouches ? e.targetTouches[0].clientX : e.clientX)
  }

  const onTouchMove = (e) => setTouchEnd(e.targetTouches ? e.targetTouches[0].clientX : e.clientX)

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return
    const distance = touchStart - touchEnd
    const isLeftSwipe = distance > minSwipeDistance
    const isRightSwipe = distance < -minSwipeDistance

    if (isLeftSwipe || isRightSwipe) {
      navigateDoc(isLeftSwipe ? 'next' : 'prev')
    }
  }

  const navigateDoc = (direction) => {
    if (!selectedDoc || !app) return
    const docs = getDocuments(app)
    const currentIndex = docs.findIndex(d => d.url === selectedDoc.url)
    if (direction === 'next' && currentIndex < docs.length - 1) {
      setSelectedDoc(docs[currentIndex + 1])
    }
    if (direction === 'prev' && currentIndex > 0) {
      setSelectedDoc(docs[currentIndex - 1])
    }
  }

  if (isLoading) {
    return (
      <div className="p-8 space-y-4">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (!app) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-xl font-bold">Application not found</h2>
        <Button onClick={() => navigate('/builders/applications')} className="mt-4">Back to List</Button>
      </div>
    )
  }

  const handleReview = async (status) => {
    const result = await Swal.fire({
      title: `${status} Application?`,
      text: `Are you sure you want to ${status.toLowerCase()} this application?`,
      icon: status === 'Approved' ? 'success' : 'warning',
      showCancelButton: true,
      confirmButtonColor: status === 'Approved' ? '#059669' : '#dc2626',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, continue',
      cancelButtonText: 'Cancel',
      backdrop: true,
      allowOutsideClick: false,
      allowEscapeKey: true
    })
    if (result.isConfirmed) {
      try {
        await reviewMutation.mutateAsync({ id: app.id, status })
        toast.success(`Application ${status.toLowerCase()} successfully!`)
        Swal.fire('Success!', `Application has been ${status.toLowerCase()}.`, 'success')
      } catch (err) {
        toast.error(err.response?.data?.message || `Failed to ${status.toLowerCase()} application`)
        Swal.fire('Error!', err.response?.data?.message || `Failed to ${status.toLowerCase()} application`, 'error')
      }
    }
  }

  const getDocuments = (app) => {
    return [
      { name: 'Business Registration Certificate', url: app.business_registration_certificate_url, required: true },
      { name: 'Applicant Government ID', url: app.applicant_government_id_url, required: true },
      { name: 'GST Certificate', url: app.gst_certificate_url, required: false },
      { name: 'RERA Certificate', url: app.rera_certificate_url, required: false },
      { name: 'Company Logo', url: app.company_logo_url, required: false },
    ]
    .filter(d => d.url)
    .map(d => ({
      ...d,
      type: getDocType(d.url)
    }))
  }

  const getDocType = (url) => {
    if (!url) return 'Unknown'
    return url.toLowerCase().endsWith('.pdf') ? 'PDF' : 'JPG'
  }

  const getFullUrl = (url) => {
    if (!url) return ''
    if (url.startsWith('http')) return url
    const origin = getApiOrigin()
    return `${origin}${url.startsWith('/') ? '' : '/'}${url}`
  }

  const docs = getDocuments(app)

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Pending':
        return (
          <span className="inline-flex items-center gap-1 text-sm font-bold px-3 py-1 rounded-full bg-amber-50 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400">
            <Clock className="h-4 w-4" />
            Pending
          </span>
        )
      case 'Approved':
        return (
          <span className="inline-flex items-center gap-1 text-sm font-bold px-3 py-1 rounded-full bg-emerald-50 text-emerald-750 dark:bg-emerald-950/20 dark:text-emerald-400">
            <ShieldCheck className="h-4 w-4" />
            Approved
          </span>
        )
      case 'Rejected':
        return (
          <span className="inline-flex items-center gap-1 text-sm font-bold px-3 py-1 rounded-full bg-rose-50 text-rose-750 dark:bg-rose-950/20 dark:text-rose-400">
            <XCircle className="h-4 w-4" />
            Rejected
          </span>
        )
      default:
        return null
    }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] w-full overflow-hidden bg-background dark:bg-neutral-950 font-sans relative">
      
      {/* Header */}
      <div className="shrink-0 p-6 md:p-8 pb-0 flex items-center justify-between z-10">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/builders/applications')} className="rounded-full h-10 w-10 bg-card shadow-sm border border-border">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="font-heading text-2xl font-bold tracking-tight text-brand-forest flex items-center gap-3">
              {app.company_name}
              {getStatusBadge(app.status)}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">Application ID: #{app.id.substring(0, 8).toUpperCase()}</p>
          </div>
        </div>
        
        {/* Actions */}
        {app.status === 'Pending' && (
          <div className="flex gap-3">
            <Button 
              variant="outline"
              onClick={() => handleReview('Rejected')}
              disabled={reviewMutation.isPending}
              className="border-rose-200 text-rose-700 hover:bg-rose-50 hover:border-rose-300 dark:border-rose-900/30 dark:text-rose-400 dark:hover:bg-rose-950/30"
            >
              <XOctagon className="mr-2 h-4 w-4" />
              Reject Application
            </Button>
            <Button 
              onClick={() => handleReview('Approved')}
              disabled={reviewMutation.isPending}
              className="bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm"
            >
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Approve Builder
            </Button>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-6 md:p-8 flex flex-col xl:flex-row gap-6">
        
        {/* Left Column: Overview */}
          <div className="flex flex-col gap-6 w-full xl:w-1/3 shrink-0">
          <div className="bg-card rounded-2xl border border-border p-6 shadow-sm">
            <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
              <Building2 className="h-5 w-5 text-brand-bronze" />
              Company Details
            </h2>
            <div className="space-y-4">
              <div>
                <p className="text-xs text-neutral-500 font-medium uppercase tracking-wider mb-1">Description</p>
                <p className="text-sm text-neutral-700 dark:text-neutral-300 bg-background dark:bg-neutral-800/50 p-3 rounded-xl border border-input">
                  {app.company_description}
                </p>
              </div>
              <div className="grid grid-cols-1 gap-4">
                <div className="flex items-start gap-3">
                  <User className="h-4 w-4 text-neutral-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs text-neutral-500 font-medium">Representative</p>
                    <p className="text-sm font-semibold text-neutral-900 dark:text-white">{app.contact_person_name}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Mail className="h-4 w-4 text-neutral-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs text-neutral-500 font-medium">Business Email</p>
                    <p className="text-sm font-semibold text-neutral-900 dark:text-white">{app.business_email}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Phone className="h-4 w-4 text-neutral-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs text-neutral-500 font-medium">Phone Number</p>
                    <p className="text-sm font-semibold text-neutral-900 dark:text-white">{app.business_phone}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="h-4 w-4 text-neutral-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs text-neutral-500 font-medium">Address</p>
                    <p className="text-sm font-semibold text-neutral-900 dark:text-white">
                      {app.office_address}
                      <br />
                      <span className="text-neutral-500 font-normal">{app.city}, {app.state}</span>
                    </p>
                  </div>
                </div>
                {app.website && (
                  <div className="flex items-start gap-3">
                    <Globe className="h-4 w-4 text-neutral-400 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs text-neutral-500 font-medium">Website</p>
                      <a href={app.website} target="_blank" rel="noreferrer" className="text-sm font-semibold text-brand-bronze hover:underline">{app.website}</a>
                    </div>
                  </div>
                )}
                <div className="flex items-start gap-3">
                  <Briefcase className="h-4 w-4 text-neutral-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs text-neutral-500 font-medium">Company Reg. Number</p>
                    <p className="text-sm font-semibold text-neutral-900 dark:text-white">{app.company_registration_number}</p>
                  </div>
                </div>
                {app.gst_number && (
                  <div className="flex items-start gap-3">
                    <Hash className="h-4 w-4 text-neutral-400 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs text-neutral-500 font-medium">GST Number</p>
                      <p className="text-sm font-semibold text-neutral-900 dark:text-white">{app.gst_number}</p>
                    </div>
                  </div>
                )}
                {app.rera_number && (
                  <div className="flex items-start gap-3">
                    <Hash className="h-4 w-4 text-neutral-400 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs text-neutral-500 font-medium">RERA Number</p>
                      <p className="text-sm font-semibold text-neutral-900 dark:text-white">{app.rera_number}</p>
                    </div>
                  </div>
                )}
                <div className="flex items-start gap-3">
                  <Calendar className="h-4 w-4 text-neutral-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs text-neutral-500 font-medium">Submitted On</p>
                    <p className="text-sm font-semibold text-neutral-900 dark:text-white">{new Date(app.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                </div>
                
                {(() => {
                  let socialLinks = []
                  if (app.social_links) {
                    try {
                      socialLinks = JSON.parse(app.social_links)
                    } catch (e) {}
                  }
                  if (socialLinks.length === 0) return null
                  return (
                    <div className="col-span-1 pt-4 mt-2 border-t border-border">
                      <p className="text-xs text-neutral-500 font-medium uppercase tracking-wider mb-3">Social Links</p>
                      <div className="flex flex-col gap-3">
                        {socialLinks.map((link, idx) => (
                          <div key={idx} className="flex items-start gap-3">
                            <Globe className="h-4 w-4 text-neutral-400 mt-0.5 shrink-0" />
                            <div className="min-w-0">
                              <p className="text-xs text-neutral-500 font-medium">{link.platform}</p>
                              <a href={link.url} target="_blank" rel="noreferrer" className="text-sm font-semibold text-brand-bronze hover:underline truncate block">
                                {link.url}
                              </a>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                })()}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Document Preview */}
        <div className="flex-1 bg-card rounded-2xl border border-border shadow-sm flex flex-col overflow-hidden min-h-[700px]">
          {selectedDoc ? (
            <>
              <div className="shrink-0 p-4 border-b border-border flex items-center justify-between bg-muted/30">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-brand-bronze/10 text-brand-bronze flex items-center justify-center">
                     {selectedDoc.type === 'PDF' ? <FileText className="h-5 w-5" /> : <FileImage className="h-5 w-5" />}
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground dark:text-neutral-100">{selectedDoc.name}</h3>
                    <a href={getFullUrl(selectedDoc.url)} target="_blank" rel="noreferrer" className="text-xs font-medium text-brand-bronze hover:underline">
                      Open in new tab
                    </a>
                  </div>
                </div>
              </div>
              <div 
                className="flex-1 relative bg-muted/30 p-4 flex items-center justify-center group select-none overflow-hidden"
                onTouchStart={onTouchStart}
                onTouchMove={onTouchMove}
                onTouchEnd={onTouchEnd}
                onMouseDown={onTouchStart}
                onMouseMove={touchStart ? onTouchMove : undefined}
                onMouseUp={onTouchEnd}
                onMouseLeave={() => { if (touchStart) onTouchEnd(); setTouchStart(null); setTouchEnd(null); }}
              >
                {/* Navigation Arrows */}
                <div className="absolute inset-y-0 left-4 flex items-center opacity-0 group-hover:opacity-100 transition-opacity z-20">
                  <Button variant="outline" size="icon" className="h-10 w-10 rounded-full shadow-sm bg-card/90" onClick={() => navigateDoc('prev')}>
                    <ChevronLeft className="h-5 w-5" />
                  </Button>
                </div>
                <div className="absolute inset-y-0 right-4 flex items-center opacity-0 group-hover:opacity-100 transition-opacity z-20">
                  <Button variant="outline" size="icon" className="h-10 w-10 rounded-full shadow-sm bg-card/90" onClick={() => navigateDoc('next')}>
                    <ChevronRight className="h-5 w-5" />
                  </Button>
                </div>

                <div className="w-full h-full rounded-xl bg-background border border-input shadow-sm flex items-center justify-center overflow-hidden pointer-events-none">
                  {selectedDoc.type === 'PDF' || selectedDoc.url?.toLowerCase().endsWith('.pdf') ? (
                    <iframe src={getFullUrl(selectedDoc.url)} className="w-full h-full border-none pointer-events-auto" title={selectedDoc.name} />
                  ) : (
                    <img src={getFullUrl(selectedDoc.url)} alt={selectedDoc.name} className="max-w-full max-h-full object-contain p-2" onError={(e) => { e.target.style.display = 'none'; }} />
                  )}
                </div>

                {/* Zoom controls mockup */}
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-card/90 backdrop-blur-sm border border-border shadow-sm rounded-full flex items-center gap-1 p-1 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                  <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-muted/40 text-neutral-600"><ZoomOut className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-muted/40 text-neutral-600"><ZoomIn className="h-4 w-4" /></Button>
                  <span className="text-xs font-bold px-2 w-12 text-center text-neutral-700">100%</span>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-muted-foreground gap-4 bg-muted/30">
               <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center">
                  <FileText className="h-10 w-10 text-muted-foreground dark:text-neutral-600" />
                </div>
               <div>
                 <p className="font-bold text-foreground">Select a document</p>
                 <p className="text-sm mt-1 text-muted-foreground">Choose a document from the verification list to view it here.</p>
               </div>
            </div>
          )}

          <div className="bg-card rounded-b-2xl border-t border-border p-6 shadow-sm">
            <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
              <FileText className="h-5 w-5 text-brand-bronze" />
              Verification Documents
            </h2>
            <div className="flex gap-3 overflow-x-auto pb-2 snap-x hide-scrollbar">
              {docs.map((doc, idx) => (
                <div
                  key={idx}
                  onClick={() => setSelectedDoc(doc)}
                  className={`shrink-0 w-28 sm:w-32 rounded-xl border ${selectedDoc?.url === doc.url ? 'border-brand-bronze ring-1 ring-brand-bronze/30 bg-brand-bronze/5' : 'border-border dark:border-neutral-800 bg-card dark:bg-neutral-950/50 hover:border-border hover:bg-muted/40 dark:hover:bg-neutral-800/50'} p-3 flex flex-col items-center gap-3 cursor-pointer transition-all snap-start group`}
                >
                  <div className="h-16 w-16 rounded-lg bg-muted dark:bg-neutral-800 flex items-center justify-center text-neutral-500 overflow-hidden relative shrink-0 border border-border group-hover:scale-105 transition-transform">
                    {doc.type === 'PDF' ? (
                      <iframe src={`${getFullUrl(doc.url)}#toolbar=0&navpanes=0&scrollbar=0&view=FitH`} className="absolute w-[400%] h-[400%] top-0 left-0 origin-top-left scale-25 pointer-events-none opacity-80 bg-card" tabIndex={-1} />
                    ) : (
                      <img src={getFullUrl(doc.url)} alt="" className="w-full h-full object-cover" onError={(e) => { e.target.style.display = 'none'; }} />
                    )}
                  </div>
                  <div className="text-center w-full">
                    <p className="text-[10px] font-bold text-neutral-900 dark:text-neutral-100 truncate" title={doc.name}>{doc.name}</p>
                    <p className="text-[9px] font-medium text-neutral-500">{doc.type}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
