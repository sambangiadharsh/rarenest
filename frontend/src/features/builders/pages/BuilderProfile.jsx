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
  UserCircle2,
} from 'lucide-react'
import { toast } from 'sonner'
import { useBuilderProfile, useBuilderReviews } from '../hooks/useBuilder'
import ReviewModal from '../components/ReviewModal'
import { useProperties } from '@/features/properties'
import PropertyCard from '@/features/properties/components/PropertyCard'
import { mapPropertyForCard } from '@/features/properties/lib/propertyUtils'

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
  const s = Math.floor((Date.now() - new Date(d)) / 1000)
  if (s < 60) return 'just now'
  if (s < 3600) return `${Math.floor(s / 60)}m ago`
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`
  if (s < 2592000) return `${Math.floor(s / 86400)}d ago`
  if (s < 31536000) return `${Math.floor(s / 2592000)}mo ago`
  return `${Math.floor(s / 31536000)}y ago`
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
      <Loader2 className="h-8 w-8 animate-spin text-brand-terracotta" />
    </div>
  )

  /* not found */
  if (bError || !builder) return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 text-center px-4">
      <span className="text-6xl">🏗️</span>
      <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">Builder not found</h1>
      <Link to="/" className="inline-flex items-center gap-2 text-sm font-medium text-brand-terracotta hover:underline">
        <ArrowLeft className="h-4 w-4" /> Back to home
      </Link>
    </div>
  )

  const fn        = builder.first_name ?? ''
  const ln        = builder.last_name  ?? ''
  const name      = `${fn} ${ln}`.trim() || 'Builder'
  const initials  = `${fn[0] ?? ''}${ln[0] ?? ''}`.toUpperCase() || '?'
  const pal       = palette(name)
  const rating    = Number(builder.average_rating ?? 0)
  const total     = Number(builder.total_reviews  ?? 0)

  return (
    <div className="min-h-screen bg-[#f7f7f8] dark:bg-neutral-950">

      {/* ══════════════ BANNER ══════════════ */}
      <div className="relative h-52 w-full overflow-hidden bg-gradient-to-br from-[#1a3a2a] via-[#142c20] to-[#2d5a3d]">
        {/* mesh dots */}
        <svg className="absolute inset-0 h-full w-full opacity-[0.07]" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="dots" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
              <circle cx="2" cy="2" r="1.5" fill="white" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#dots)" />
        </svg>
        {/* glow orbs */}
        <div className="absolute -top-16 -left-16 h-64 w-64 rounded-full bg-purple-500/20 blur-3xl" />
        <div className="absolute -bottom-10 right-1/4 h-48 w-48 rounded-full bg-brand-terracotta/20 blur-3xl" />

        {/* back link */}
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

            {/* Avatar */}
            <div
              className="relative shrink-0 h-24 w-24 rounded-2xl flex items-center justify-center text-3xl font-black shadow-lg"
              style={{ backgroundColor: pal.bg, color: pal.text, boxShadow: `0 0 0 4px ${pal.ring}55` }}
            >
              {initials}
              {/* verified dot */}
              <span className="absolute -bottom-1.5 -right-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 ring-2 ring-white dark:ring-neutral-900">
                <ShieldCheck className="h-3.5 w-3.5 text-white" />
              </span>
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-brand-terracotta">
                    Verified Builder
                  </span>
                  <h1 className="mt-0.5 text-2xl font-bold text-neutral-900 dark:text-white leading-tight">
                    {name}
                  </h1>
                  <div className="mt-1.5 flex flex-wrap items-center gap-2">
                    <Stars value={rating} size={15} />
                    <span className="text-sm font-bold text-neutral-800 dark:text-white">
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

              {/* stat chips */}
              <div className="mt-4 flex flex-wrap gap-2">
                <StatChip icon={<MessageSquare className="h-3.5 w-3.5" />} label={`${total} Reviews`} />
                {builder.created_at && (
                  <StatChip
                    icon={<CalendarDays className="h-3.5 w-3.5" />}
                    label={`Since ${new Date(builder.created_at).getFullYear()}`}
                  />
                )}
                {builder.email && (
                  <StatChip icon={<Mail className="h-3.5 w-3.5" />} label={builder.email} href={`mailto:${builder.email}`} />
                )}
                {builder.phone && (
                  <StatChip icon={<Phone className="h-3.5 w-3.5" />} label={builder.phone} href={`tel:${builder.phone}`} />
                )}
              </div>
            </div>
          </div>

          {/* Bio */}
          {builder.bio && (
            <div className="mt-5 rounded-xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-100 dark:border-neutral-800 px-5 py-4">
              <p className="text-sm leading-7 text-neutral-600 dark:text-neutral-400">{builder.bio}</p>
            </div>
          )}
        </div>

        {/* Tabs switcher */}
        <div className="mt-8 flex border-b border-neutral-200 dark:border-neutral-800">
          <button
            onClick={() => setActiveTab('properties')}
            className={`pb-4 px-6 text-sm font-bold border-b-2 transition-all duration-200 ${
              activeTab === 'properties'
                ? 'border-brand-terracotta text-brand-terracotta'
                : 'border-transparent text-neutral-400 hover:text-neutral-600 dark:text-neutral-500 dark:hover:text-neutral-400'
            }`}
          >
            Properties ({properties.length})
          </button>
          <button
            onClick={() => setActiveTab('reviews')}
            className={`pb-4 px-6 text-sm font-bold border-b-2 transition-all duration-200 ${
              activeTab === 'reviews'
                ? 'border-brand-terracotta text-brand-terracotta'
                : 'border-transparent text-neutral-400 hover:text-neutral-600 dark:text-neutral-500 dark:hover:text-neutral-400'
            }`}
          >
            Reviews ({total})
          </button>
        </div>

        {/* ══════════════ PROPERTIES TAB ══════════════ */}
        {activeTab === 'properties' && (
          <div className="mt-6 pb-16">
            {pLoading ? (
              <div className="flex justify-center py-16">
                <Loader2 className="h-6 w-6 animate-spin text-brand-terracotta" />
              </div>
            ) : properties.length === 0 ? (
              <div className="flex flex-col items-center gap-4 rounded-2xl border-2 border-dashed border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 py-16 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-neutral-100 dark:bg-neutral-800">
                  <Building2 className="h-6 w-6 text-neutral-300 dark:text-neutral-600" />
                </div>
                <div>
                  <p className="font-semibold text-neutral-900 dark:text-white">No Properties Listed</p>
                  <p className="text-sm text-neutral-400 mt-1">This builder has not listed any properties yet.</p>
                </div>
              </div>
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
              <h2 className="text-lg font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                Reviews
                {total > 0 && (
                  <span className="rounded-full bg-neutral-100 dark:bg-neutral-800 px-2.5 py-0.5 text-sm font-semibold text-neutral-500">
                    {total}
                  </span>
                )}
              </h2>

              {/* Rating summary strip */}
              {rating > 0 && (
                <div className="hidden sm:flex items-center gap-2 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 px-4 py-2 shadow-sm">
                  <span className="text-2xl font-black text-neutral-900 dark:text-white">{rating.toFixed(1)}</span>
                  <div className="flex flex-col">
                    <Stars value={rating} size={12} />
                    <span className="text-[10px] text-neutral-400 mt-0.5">out of 5</span>
                  </div>
                </div>
              )}
            </div>

            {/* loading */}
            {rLoading && (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="h-6 w-6 animate-spin text-brand-terracotta" />
              </div>
            )}

            {/* empty */}
            {!rLoading && reviews.length === 0 && (
              <div className="flex flex-col items-center gap-4 rounded-2xl border-2 border-dashed border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 py-16 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-neutral-100 dark:bg-neutral-800">
                  <Star className="h-6 w-6 text-neutral-300 dark:text-neutral-600" />
                </div>
                <div>
                  <p className="font-semibold text-neutral-900 dark:text-white">No reviews yet</p>
                  <p className="text-sm text-neutral-400 mt-1">Be the first to share your experience.</p>
                </div>
                <button
                  type="button"
                  onClick={openReview}
                  className="inline-flex items-center gap-2 rounded-xl bg-brand-terracotta px-4 py-2 text-sm font-semibold text-white hover:bg-brand-terracotta/90 transition-colors"
                >
                  <PenLine className="h-3.5 w-3.5" />
                  Write the first review
                </button>
              </div>
            )}

            {/* review cards */}
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
                      {/* left accent bar */}
                      <div
                        className="absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl"
                        style={{ backgroundColor: rpal.text }}
                      />

                      {/* header */}
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
                        <span className="shrink-0 text-[11px] font-medium text-neutral-400">
                          {timeAgo(rev.created_at)}
                        </span>
                      </div>

                      {/* comment */}
                      {rev.comment && (
                        <p className="pl-2 text-sm leading-6 text-neutral-600 dark:text-neutral-400">
                          {rev.comment}
                        </p>
                      )}

                      {/* star badge bottom-right */}
                      <div className="absolute bottom-3 right-4 flex items-center gap-0.5 rounded-full bg-amber-50 dark:bg-amber-900/20 px-2 py-0.5">
                        <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                        <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400">{rev.rating}</span>
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

/* ─── tiny sub-component ──────────────────────────────────── */
function StatChip({ icon, label, href }) {
  const cls = 'inline-flex items-center gap-1.5 rounded-full bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 px-3 py-1 text-xs font-medium text-neutral-600 dark:text-neutral-400 hover:border-brand-terracotta/50 hover:text-brand-terracotta transition-colors'
  return href
    ? <a href={href} className={cls}>{icon}{label}</a>
    : <span className={cls}>{icon}{label}</span>
}
