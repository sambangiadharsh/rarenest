import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import {
  ArrowLeft,
  Star,
  PenLine,
  ShieldCheck,
  Mail,
  Phone,
  CalendarDays,
  Building2,
  MessageSquare,
  Loader2,
  Globe,
} from 'lucide-react'
import { toast } from 'sonner'
import { useBuilderProfile, useBuilderReviews } from '../hooks/useBuilder'
import ReviewModal from '../components/ReviewModal'
import { useProperties } from '@/features/properties'
import PropertyCard from '@/features/properties/components/PropertyCard'
import { mapPropertyForCard } from '@/features/properties/lib/propertyUtils'
import WifiLoader from '@/shared/components/ui/WifiLoader'
import { getApiOrigin } from '@/shared/config/api'

function resolveUrl(url) {
  if (!url) return ''
  if (url.startsWith('http')) return url
  return `${getApiOrigin()}${url.startsWith('/') ? '' : '/'}${url}`
}

/* ─── helpers ─────────────────────────────────────────────── */
const PALETTE = [
  { bg: '#ede9fe', text: '#7c3aed', ring: '#c4b5fd' },
  { bg: '#dcfce7', text: '#16a34a', ring: '#86efac' },
  { bg: '#fce7f3', text: '#db2777', ring: '#f9a8d4' },
  { bg: '#fef9c3', text: '#ca8a04', ring: '#fde047' },
  { bg: '#dbeafe', text: '#2563eb', ring: '#93c5fd' },
  { bg: '#ffedd5', text: '#ea580c', ring: '#fdba74' },
]

function palette(name) {
  let h = 0
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h)
  return PALETTE[Math.abs(h) % PALETTE.length]
}

function Stars({ value, size = 16 }) {
  return (
    <span className="inline-flex items-center gap-[2px]">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          style={{ width: size, height: size }}
          className={s <= Math.round(value) ? 'fill-amber-400 text-amber-400' : 'fill-neutral-200 text-neutral-200'}
        />
      ))}
    </span>
  )
}

function timeAgo(d) {
  const date = new Date(d)
  if (isNaN(date.getTime())) return ''
  const s = Math.floor((Date.now() - date.getTime()) / 1000)
  if (s < 0) return 'just now'
  if (s < 60) return 'just now'
  if (s < 3600) return `${Math.floor(s / 60)}m ago`
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`
  if (s < 2592000) return `${Math.floor(s / 86400)}d ago`
  if (s < 31536000) return `${Math.floor(s / 2592000)}mo ago`
  return `${Math.floor(s / 31536000)}y ago`
}

/* corner crop-mark, the page's one signature device — nods to a builder's
   site-plan annotations without going full "blueprint theme" */
function CornerBracket({ className }) {
  return (
    <svg viewBox="0 0 20 20" className={className} fill="none">
      <path d="M1 8V2a1 1 0 0 1 1-1h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

/* ─── component ───────────────────────────────────────────── */
export default function BuilderProfile() {
  const { id } = useParams()
  const { isAuthenticated } = useSelector((s) => s.auth)
  const [reviewOpen, setReviewOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('properties')

  const { data: bRes, isLoading: bLoading, isError: bError } = useBuilderProfile(id)
  const { data: rRes, isLoading: rLoading } = useBuilderReviews(id)

  const builder  = bRes?.data
  const reviews  = rRes?.data ?? []

  const { data: pRes, isLoading: pLoading } = useProperties(
    { seller_id: builder?.user_id },
    { enabled: !!builder?.user_id }
  )
  const rawProperties = pRes?.data ?? []
  const properties = rawProperties.map(mapPropertyForCard)

  const openReview = () => {
    if (!isAuthenticated) { toast.error('Please log in to write a review.'); return }
    setReviewOpen(true)
  }

  /* loading */
  if (bLoading) return (
    <div className="flex min-h-screen items-center justify-center">
      <WifiLoader />
    </div>
  )

  /* not found */
  if (bError || !builder) return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 text-center px-4">
      <span className="text-6xl">🏗️</span>
      <h1 className="font-serif text-2xl font-bold text-neutral-900 dark:text-white">Builder not found</h1>
      <Link to="/" className="inline-flex items-center gap-2 text-sm font-medium text-brand-terracotta hover:underline">
        <ArrowLeft className="h-4 w-4" /> Back to home
      </Link>
    </div>
  )

  const fn        = builder.first_name ?? ''
  const ln        = builder.last_name  ?? ''
  const name      = `${fn} ${ln}`.trim() || 'Builder'
  const company   = builder.company_name
  const initials  = company
    ? company.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
    : `${fn[0] ?? ''}${ln[0] ?? ''}`.toUpperCase() || '?'
  const pal       = palette(company || name)
  const rating    = Number(builder.average_rating ?? 0)
  const total     = Number(builder.total_reviews  ?? 0)
  const memberSince = builder.created_at ? new Date(builder.created_at).getFullYear() : null

  return (
    <div className="min-h-screen bg-[#f7f7f8] dark:bg-neutral-950">

      {/* ══════════════ BANNER ══════════════ */}
      <div className="relative h-52 w-full overflow-hidden bg-gradient-to-br from-[#16241c] via-[#122019] to-[#25402f]">
        {/* fine site-plan grid, replaces generic dot mesh */}
        <svg className="absolute inset-0 h-full w-full opacity-[0.09]" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" x="0" y="0" width="28" height="28" patternUnits="userSpaceOnUse">
              <path d="M0 0H28V28" fill="none" stroke="white" strokeWidth="0.75" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
        {/* soft warmth, kept subtle so the grid reads first */}
        <div className="absolute -bottom-16 right-0 h-56 w-56 rounded-full bg-[#C9A227]/10 blur-3xl" />

        {/* dimension rule along the bottom edge — a quiet nod to a site plan */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-white/10" />
        <span className="absolute bottom-2 right-4 font-mono text-[10px] tracking-widest text-white/30">
          BUILDER PROFILE
        </span>

        <Link
          to="/"
          className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/15 px-3 py-1.5 text-xs font-medium text-white/80 hover:bg-white/20 hover:text-white transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back
        </Link>
      </div>

      {/* ══════════════ PROFILE CARD ══════════════ */}
      <div className="relative mx-auto max-w-4xl px-4">
        <div className="relative -mt-16 rounded-2xl bg-white dark:bg-neutral-900 shadow-xl border border-neutral-100 dark:border-neutral-800 px-6 pt-6 pb-7">

          <div className="flex flex-col sm:flex-row sm:items-start gap-5">

            {/* Avatar, framed with crop-mark corners like a plan annotation */}
            <div className="relative shrink-0 h-24 w-24">
              {builder.company_logo_url ? (
                <div 
                  className="h-full w-full rounded-2xl flex items-center justify-center shadow-lg overflow-hidden bg-white"
                  style={{ boxShadow: `0 0 0 4px ${pal.ring}55` }}
                >
                  <img 
                    src={resolveUrl(builder.company_logo_url)} 
                    alt={`${company || name} logo`} 
                    className="w-full h-full object-cover" 
                  />
                </div>
              ) : (
                <div
                  className="h-full w-full rounded-2xl flex items-center justify-center text-3xl font-black font-serif shadow-lg"
                  style={{ backgroundColor: pal.bg, color: pal.text, boxShadow: `0 0 0 4px ${pal.ring}55` }}
                >
                  {initials}
                </div>
              )}
              <CornerBracket className="absolute -top-1.5 -left-1.5 h-4 w-4 text-[#C9A227]" />
              <CornerBracket className="absolute -top-1.5 -right-1.5 h-4 w-4 rotate-90 text-[#C9A227]" />
              <CornerBracket className="absolute -bottom-1.5 -left-1.5 h-4 w-4 -rotate-90 text-[#C9A227]" />
              <CornerBracket className="absolute -bottom-1.5 -right-1.5 h-4 w-4 rotate-180 text-[#C9A227]" />
              <span className="absolute -bottom-1.5 -right-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 ring-2 ring-white dark:ring-neutral-900">
                <ShieldCheck className="h-3.5 w-3.5 text-white" />
              </span>
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <span className="font-mono text-[10px] font-semibold uppercase tracking-widest text-[#C9A227]">
                    Verified Builder
                  </span>
                  <h1 className="mt-0.5 font-serif text-2xl font-bold text-neutral-900 dark:text-white leading-tight">
                    {company || name}
                  </h1>
                  {company && (
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                      Owner: {name}
                    </p>
                  )}
                  <div className="mt-1.5 flex flex-wrap items-center gap-2">
                    <Stars value={rating} size={15} />
                    <span className="font-mono text-sm font-bold text-neutral-800 dark:text-white">
                      {rating > 0 ? rating.toFixed(1) : '—'}
                    </span>
                    <span className="text-sm text-neutral-400">
                      · {total} {total === 1 ? 'review' : 'reviews'}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={openReview}
                  className="inline-flex items-center gap-2 rounded-xl bg-brand-terracotta px-4 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-brand-terracotta/90 active:scale-95 transition-all"
                >
                  <PenLine className="h-4 w-4" />
                  Write a Review
                </button>
              </div>

              {/* stat chips, mono labels read like a spec line */}
              <div className="mt-4 flex flex-wrap gap-2">
                <StatChip icon={<MessageSquare className="h-3.5 w-3.5" />} label={`${total} Reviews`} />
                {memberSince && (
                  <StatChip icon={<CalendarDays className="h-3.5 w-3.5" />} label={`Since ${memberSince}`} />
                )}
                {builder.email && (
                  <StatChip icon={<Mail className="h-3.5 w-3.5" />} label={builder.email} href={`mailto:${builder.email}`} />
                )}
                {builder.phone && (
                  <StatChip icon={<Phone className="h-3.5 w-3.5" />} label={builder.phone} href={`tel:${builder.phone}`} />
                )}
                {(() => {
                  let links = []
                  if (builder.social_links) {
                    try { links = JSON.parse(builder.social_links) } catch(e) {}
                  }
                  return links.map((link, idx) => (
                    <StatChip 
                      key={idx} 
                      icon={<Globe className="h-3.5 w-3.5" />} 
                      label={link.platform} 
                      href={link.url.startsWith('http') ? link.url : `https://${link.url}`} 
                      target="_blank" 
                    />
                  ))
                })()}
              </div>
            </div>
          </div>

          {/* Bio */}
          {builder.bio && (
            <div className="mt-5 rounded-xl bg-[#FBF8F2] dark:bg-neutral-800/60 border border-neutral-100 dark:border-neutral-800 px-5 py-4">
              <p className="text-sm leading-7 text-neutral-600 dark:text-neutral-400">{builder.bio}</p>
            </div>
          )}
        </div>

        {/* Pill tabs with counts — consistent with the rest of the product */}
        <div className="mt-8 inline-flex items-center gap-1 rounded-full bg-neutral-100 dark:bg-neutral-900 p-1">
          <PillTab active={activeTab === 'properties'} onClick={() => setActiveTab('properties')}>
            Properties <Count>{properties.length}</Count>
          </PillTab>
          <PillTab active={activeTab === 'reviews'} onClick={() => setActiveTab('reviews')}>
            Reviews <Count>{total}</Count>
          </PillTab>
        </div>

        {/* ══════════════ PROPERTIES TAB ══════════════ */}
        {activeTab === 'properties' && (
          <div className="mt-6 pb-16">
            {pLoading ? (
              <div className="flex justify-center py-16">
                <Loader2 className="h-6 w-6 animate-spin text-brand-terracotta" />
              </div>
            ) : properties.length === 0 ? (
              <EmptyState
                icon={<Building2 className="h-6 w-6 text-neutral-300 dark:text-neutral-600" />}
                title="No properties listed"
                subtitle="This builder hasn't listed any properties yet."
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in duration-300">
                {properties.map((prop, idx) => (
                  <PropertyCard key={prop.id} property={prop} index={idx} layout="grid" />
                ))}
              </div>
            )}
          </div>
        )}

        {/* ══════════════ REVIEWS TAB ══════════════ */}
        {activeTab === 'reviews' && (
          <div className="mt-6 pb-16">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-serif text-lg font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                Reviews
                {total > 0 && <Count>{total}</Count>}
              </h2>

              {rating > 0 && (
                <div className="hidden sm:flex items-center gap-2 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 px-4 py-2 shadow-sm">
                  <span className="font-serif text-2xl font-black text-neutral-900 dark:text-white">{rating.toFixed(1)}</span>
                  <div className="flex flex-col">
                    <Stars value={rating} size={12} />
                    <span className="font-mono text-[10px] text-neutral-400 mt-0.5">out of 5</span>
                  </div>
                </div>
              )}
            </div>

            {rLoading && (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="h-6 w-6 animate-spin text-brand-terracotta" />
              </div>
            )}

            {!rLoading && reviews.length === 0 && (
              <EmptyState
                icon={<Star className="h-6 w-6 text-neutral-300 dark:text-neutral-600" />}
                title="No reviews yet"
                subtitle="Be the first to share your experience."
                action={
                  <button
                    type="button"
                    onClick={openReview}
                    className="inline-flex items-center gap-2 rounded-xl bg-brand-terracotta px-4 py-2 text-sm font-semibold text-white hover:bg-brand-terracotta/90 transition-colors"
                  >
                    <PenLine className="h-3.5 w-3.5" />
                    Write the first review
                  </button>
                }
              />
            )}

            {!rLoading && reviews.length > 0 && (
              <div className="grid gap-4 sm:grid-cols-2">
                {reviews.map((rev) => {
                  const rn   = `${rev.reviewer_first_name ?? ''} ${rev.reviewer_last_name ?? ''}`.trim() || 'Anonymous'
                  const ri   = rn.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()
                  const rpal = palette(rn)
                  return (
                    <div
                      key={rev.id}
                      className="group relative flex flex-col gap-3 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 p-5 shadow-sm hover:shadow-md transition-shadow overflow-hidden"
                    >
                      <div
                        className="absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl"
                        style={{ backgroundColor: rpal.text }}
                      />

                      <div className="flex items-start justify-between gap-3 pl-2">
                        <div className="flex items-center gap-2.5">
                          <div
                            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-xs font-bold"
                            style={{ backgroundColor: rpal.bg, color: rpal.text }}
                          >
                            {ri}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-neutral-900 dark:text-white leading-tight">{rn}</p>
                            <Stars value={rev.rating} size={12} />
                          </div>
                        </div>
                        <span className="shrink-0 font-mono text-[11px] font-medium text-neutral-400">
                          {timeAgo(rev.created_at)}
                        </span>
                      </div>

                      {rev.comment && (
                        <p className="pl-2 text-sm leading-6 text-neutral-600 dark:text-neutral-400">
                          {rev.comment}
                        </p>
                      )}

                      <div className="absolute bottom-3 right-4 flex items-center gap-0.5 rounded-full bg-amber-50 dark:bg-amber-900/20 px-2 py-0.5">
                        <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                        <span className="font-mono text-[11px] font-bold text-amber-600 dark:text-amber-400">{rev.rating}</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {reviewOpen && <ReviewModal builderId={id} onClose={() => setReviewOpen(false)} />}
    </div>
  )
}

/* ─── tiny sub-components ─────────────────────────────────── */
function StatChip({ icon, label, href, target }) {
  const cls = 'inline-flex items-center gap-1.5 rounded-full bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 px-3 py-1 font-mono text-[11px] font-medium text-neutral-600 dark:text-neutral-400 hover:border-[#C9A227]/60 hover:text-[#a9821a] transition-colors'
  return href
    ? <a href={href} target={target} rel={target === '_blank' ? 'noreferrer' : undefined} className={cls}>{icon}{label}</a>
    : <span className={cls}>{icon}{label}</span>
}

function PillTab({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold transition-all duration-200 ${
        active
          ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white shadow-sm'
          : 'text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200'
      }`}
    >
      {children}
    </button>
  )
}

function Count({ children }) {
  return (
    <span className="rounded-full bg-neutral-100 dark:bg-neutral-800 px-2 py-0.5 font-mono text-[11px] font-bold text-neutral-500">
      {children}
    </span>
  )
}

function EmptyState({ icon, title, subtitle, action }) {
  return (
    <div className="flex flex-col items-center gap-4 rounded-2xl border-2 border-dashed border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 py-16 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-neutral-100 dark:bg-neutral-800">
        {icon}
      </div>
      <div>
        <p className="font-semibold text-neutral-900 dark:text-white">{title}</p>
        <p className="text-sm text-neutral-400 mt-1">{subtitle}</p>
      </div>
      {action}
    </div>
  )
} 



