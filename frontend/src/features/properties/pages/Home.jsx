import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Loader2,
  MapPin,
  SlidersHorizontal,
  X,
  Mail,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  Star,
  ShieldCheck,
  Building2,
  Sparkles,
  ArrowRight,
} from 'lucide-react'
import { useBuilders } from '@/features/builders'
import { Button } from '@/shared/components/ui/button'
import PropertyCard from '@/features/properties/components/PropertyCard'
import { useProperties } from '@/features/properties'
import { usePropertyTypes } from '@/features/properties'
import { mapPropertyForCard } from '@/features/properties/lib/propertyUtils'
import { HeroSwiper, useActiveBanners } from '@/features/heroBanners'
import { toast } from 'sonner'

const typeIcons = {
  'wood house': '🌲',
  'mud house': '🧱',
  'container home': '📦',
  treehouse: '🍁',
  'boat house': '⛵',
}

export default function Home() {
  const { data: propertiesRes, isLoading } = useProperties()
  const { data: typesRes, isLoading: typesLoading } = usePropertyTypes()
  const { data: bannersRes } = useActiveBanners()
  const { data: buildersRes, isLoading: buildersLoading } = useBuilders()
  const builderCarouselRef = React.useRef(null)

  const scrollBuilders = (dir) => {
    const el = builderCarouselRef.current
    if (!el) return
    el.scrollBy({ left: dir * 280, behavior: 'smooth' })
  }
  const activeBanners = bannersRes?.data ?? []
  const realProperties = propertiesRes?.data || []
  const apiTypes = typesRes?.data || []
  const navigate=useNavigate()
  // Category Carousel State
  const [activeCategory, setActiveCategory] = React.useState('All Homes')

  // Filter States
  const [minPrice, setMinPrice] = React.useState('')
  const [maxPrice, setMaxPrice] = React.useState('')
  const [maxSize, setMaxSize] = React.useState(3500)
  const [statusFilter, setStatusFilter] = React.useState('All')
  const [statusOpen, setStatusOpen] = React.useState(false)
  
  // Applied filters state
  const [appliedFilters, setAppliedFilters] = React.useState({
    minPrice: '',
    maxPrice: '',
    maxSize: 3500,
    status: 'All'
  })

  // Waitlist State
  const [showWaitlist, setShowWaitlist] = React.useState(false)
  const [waitlistEmail, setWaitlistEmail] = React.useState('')
  const [waitlistSubmitted, setWaitlistSubmitted] = React.useState(false)

  const categories = [
    { name: 'All Homes', icon: '🏡' },
    ...apiTypes.map((t) => ({
      name: t.name,
      icon: typeIcons[t.name?.toLowerCase()] || '🏠',
    })),
  ]

  const displayProperties = realProperties
    .filter((p) => p.is_featured === true || p.is_featured === 1)
    .map(mapPropertyForCard)

  const categoryMatches = (propType, catName) => {
    if (catName === 'All Homes') return true
    const normalizedProp = propType?.toLowerCase().trim() || ''
    const normalizedCat = catName?.toLowerCase().trim() || ''
    return (
      normalizedProp === normalizedCat ||
      normalizedProp.includes(normalizedCat) ||
      normalizedCat.includes(normalizedProp)
    )
  }

  const effectiveCategory =
    apiTypes.length === 0 ? 'All Homes' : activeCategory

  const filteredProperties = displayProperties.filter((prop) => {
    // 0. Status Filter
    const status = prop.status?.toLowerCase() || 'available'
    const appliedStatus = appliedFilters.status.toLowerCase()
    if (appliedStatus !== 'all' && status !== appliedStatus) return false

    // 1. Category Filter
    if (!categoryMatches(prop.property_type, effectiveCategory)) return false

    // 2. Price Filter
    const price = prop.asking_price
    if (appliedFilters.minPrice && price < Number(appliedFilters.minPrice)) return false
    if (appliedFilters.maxPrice && price > Number(appliedFilters.maxPrice)) return false

    // 3. Size Filter
    if (prop.size_sqft > appliedFilters.maxSize) return false

    return true
  })

  const applyActiveFilters = () => {
    setAppliedFilters({
      minPrice,
      maxPrice,
      maxSize,
      status: statusFilter
    })
    toast.success('Filters applied successfully!')
  }

  const clearActiveFilters = () => {
    setMinPrice('')
    setMaxPrice('')
    setMaxSize(3500)
    setStatusFilter('All')
    setStatusOpen(false)
    setAppliedFilters({
      minPrice: '',
      maxPrice: '',
      maxSize: 3500,
      status: 'All'
    })
    toast.success('Filters reset!')
  }

  const handleWaitlistSubmit = (e) => {
    e.preventDefault()
    if (!waitlistEmail || !waitlistEmail.includes('@')) {
      toast.error('Please enter a valid email address.')
      return
    }
    setWaitlistSubmitted(true)
    toast.success('Wonderful! You have been successfully added to our priority waitlist.')
    setTimeout(() => {
      setShowWaitlist(false)
      setWaitlistEmail('')
      setWaitlistSubmitted(false)
    }, 2500)
  }

  const realBuilders = (buildersRes?.data ?? []).filter(
    (builder) => builder.builder_status === 'Approved' && (builder.is_featured === 1 || builder.is_featured === true)
  )

  return (
    <div className="flex flex-col gap-16 md:gap-24 w-full pb-16">
      
      {/* 1. HERO CAROUSEL */}
      <HeroSwiper
        banners={activeBanners}
        onWaitlist={() => setShowWaitlist(true)}
      />

      {/* CENTERED LAYOUT WRAPPER FOR REST OF CONTENT */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex flex-col gap-16 md:gap-24">
        
        {/* 2. DWELLINGS SECTION */}
        <section id="dwellings" className="flex flex-col gap-8 scroll-mt-24">
          <div className="flex flex-col gap-2">
            <h2 className="font-serif text-3xl font-bold text-neutral-900 dark:text-white">
              Browse Alternative Masterpieces
            </h2>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              Select a theme below to instantly filter the world's most unique structures.
            </p>
          </div>

          {/* Categories Carousel — from admin property types API */}
          {apiTypes.length > 0 && (
          <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-neutral-250 scrollbar-track-transparent -mx-4 px-4 sm:mx-0 sm:px-0">
            {typesLoading ? (
              <div className="flex items-center gap-2 px-4 py-3 text-sm text-neutral-400">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading categories...
              </div>
            ) : (
            categories.map((cat) => (
              <button
                key={cat.name}
                onClick={() => setActiveCategory(cat.name)}
                className={`flex items-center gap-2 px-5 py-3 rounded-full text-sm font-semibold tracking-wide shrink-0 transition-all duration-300 border ${
                  activeCategory === cat.name
                    ? 'bg-brand-forest border-brand-forest text-white shadow-md scale-[1.03]'
                    : 'bg-white border-brand-sand hover:border-neutral-350 text-neutral-600 dark:bg-neutral-900 dark:border-neutral-850 dark:text-neutral-350'
                }`}
              >
                <span className="text-base">{cat.icon}</span>
                <span>{cat.name}</span>
              </button>
            ))
            )}
          </div>
          )}

          {/* Main Interface Layout Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            
            {/* LEFT COLUMN: Sticky Filter Sidebar */}
            <div className="lg:col-span-1 lg:sticky lg:top-28 h-fit bg-brand-cream border border-brand-sand rounded-2xl p-5 flex flex-col gap-6 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="font-serif text-lg font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                  <SlidersHorizontal className="h-4 w-4 text-brand-terracotta" /> Filter
                </span>
                <button 
                  onClick={clearActiveFilters}
                  className="text-xs font-semibold text-neutral-400 hover:text-brand-terracotta transition-colors"
                >
                  Reset All
                </button>
              </div>

              {/* Price Inputs */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider">
                  Price Range (₹)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <input 
                    type="number"
                    placeholder="Min"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    className="w-full bg-white dark:bg-neutral-900 border border-brand-sand rounded-xl px-3 py-2 text-sm outline-none focus:border-brand-terracotta/50 transition-colors"
                  />
                  <input 
                    type="number"
                    placeholder="Max"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    className="w-full bg-white dark:bg-neutral-900 border border-brand-sand rounded-xl px-3 py-2 text-sm outline-none focus:border-brand-terracotta/50 transition-colors"
                  />
                </div>
              </div>

              {/* Property Status Filter (Custom Dropdown) */}
              <div className="flex flex-col gap-2 relative z-20">
                <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider">
                  Property Status
                </label>
                <div>
                  <button
                    type="button"
                    onClick={() => setStatusOpen(!statusOpen)}
                    className="w-full flex items-center justify-between bg-white dark:bg-neutral-900 border border-brand-sand rounded-xl px-3 py-2 text-sm outline-none focus:border-brand-terracotta/50 transition-all cursor-pointer text-left font-sans font-medium text-neutral-700 dark:text-neutral-300"
                  >
                    <span className="flex items-center gap-1.5">
                      <span className={`h-1.5 w-1.5 rounded-full ${
                        statusFilter === 'Available' ? 'bg-emerald-500' :
                        statusFilter === 'Pending' ? 'bg-amber-500' :
                        statusFilter === 'Sold' ? 'bg-rose-500' : 'bg-neutral-400'
                      }`} />
                      {statusFilter === 'All' ? 'All Statuses' : statusFilter}
                    </span>
                    <span className="text-neutral-400 text-xs">▼</span>
                  </button>
                  
                  {statusOpen && (
                    <>
                      <div className="fixed inset-0 z-30" onClick={() => setStatusOpen(false)} />
                      <div className="absolute left-0 right-0 mt-1.5 bg-white dark:bg-neutral-900 border border-brand-sand rounded-xl shadow-xl z-40 overflow-hidden animate-in fade-in slide-in-from-top-1 duration-150">
                        {[
                          { label: 'All Statuses', value: 'All', color: 'bg-neutral-400' },
                          { label: 'Available', value: 'Available', color: 'bg-emerald-500' },
                          { label: 'Pending', value: 'Pending', color: 'bg-amber-500' },
                          { label: 'Sold', value: 'Sold', color: 'bg-rose-500' }
                        ].map((item) => (
                          <button
                            key={item.value}
                            type="button"
                            onClick={() => {
                              setStatusFilter(item.value)
                              setStatusOpen(false)
                            }}
                            className={`w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-left cursor-pointer transition-colors duration-200 ${
                              statusFilter === item.value
                                ? 'bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white font-bold'
                                : 'text-neutral-600 hover:bg-neutral-50 dark:text-neutral-400 dark:hover:bg-neutral-800'
                            }`}
                          >
                            <span className={`h-1.5 w-1.5 rounded-full ${item.color}`} />
                            {item.label}
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Size Slider */}
              <div className="flex flex-col gap-3">
                <div className="flex justify-between items-center text-xs font-bold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider">
                  <span>Maximum Area</span>
                  <span className="text-brand-terracotta font-bold normal-case font-sans text-sm">
                    {maxSize >= 3500 ? 'Any Size' : `${maxSize} sqft`}
                  </span>
                </div>
                <input 
                  type="range"
                  min="100"
                  max="3500"
                  step="100"
                  value={maxSize}
                  onChange={(e) => setMaxSize(Number(e.target.value))}
                  className="w-full h-1.5 bg-neutral-200 dark:bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-brand-terracotta"
                />
                <div className="flex justify-between text-[10px] text-neutral-400 font-semibold">
                  <span>100 sqft</span>
                  <span>3500 sqft</span>
                </div>
              </div>

              {/* Apply Action Buttons */}
              <button
                onClick={applyActiveFilters}
                className="w-full bg-brand-terracotta hover:bg-brand-terracotta-light text-white font-bold py-2.5 rounded-xl transition-all duration-300 shadow-sm text-sm border-none"
              >
                Apply Filters
              </button>
            </div>

            {/* RIGHT COLUMN: Listings Grid */}
            <div className="lg:col-span-3">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-24 gap-3">
                  <Loader2 className="h-10 w-10 animate-spin text-brand-terracotta" />
                  <p className="text-sm font-semibold text-neutral-400">Loading catalog...</p>
                </div>
              ) : filteredProperties.length === 0 ? (
                <div className="text-center py-20 bg-brand-cream border border-dashed border-brand-sand rounded-2xl flex flex-col items-center justify-center p-6 gap-3">
                  <span className="text-4xl">🏝</span>
                  <h3 className="font-serif text-lg font-bold text-neutral-800 dark:text-neutral-200">
                    {displayProperties.length === 0 ? 'No Listings Yet' : 'No Match Found'}
                  </h3>
                  <p className="text-sm text-neutral-500 max-w-sm">
                    {displayProperties.length === 0
                      ? 'Featured properties will appear here once our team marks them as featured.'
                      : 'No residences match your filters. Try expanding your search or resetting filters.'}
                  </p>
                  <button 
                    onClick={clearActiveFilters}
                    className="mt-2 text-sm font-bold text-brand-terracotta hover:text-brand-terracotta-light underline decoration-dotted"
                  >
                    Reset Active Filters
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                  {filteredProperties.map((prop, idx) => (
                    <PropertyCard key={prop.id} property={prop} index={idx} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* 3. HOW IT WORKS PANEL */}
        <section id="how-it-works" className="flex flex-col items-center text-center gap-12 py-16 border-y border-brand-sand scroll-mt-24">
          <div className="flex flex-col gap-3 max-w-xl">
            <span className="text-[10px] font-bold text-brand-terracotta uppercase tracking-widest bg-brand-terracotta/10 px-3 py-1 rounded-full max-w-max mx-auto">
              Simple Process
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-neutral-900 dark:text-white leading-tight">
              How RareNest works
            </h2>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed font-sans">
              Whether you're buying a dream organic sanctuary or listing a vetted master design, we make it beautifully simple.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 w-full max-w-5xl mt-2">
            {/* Step 1 */}
            <div className="flex flex-col items-center gap-4 group">
              <span className="font-serif text-6xl font-black text-brand-terracotta/10 group-hover:text-brand-terracotta/20 transition-colors duration-300">
                01
              </span>
              <div className="text-4xl w-16 h-16 rounded-full bg-brand-cream border border-brand-sand flex items-center justify-center filter drop-shadow-sm group-hover:scale-105 transition-transform duration-300">
                🔍
              </div>
              <h3 className="font-serif text-lg font-bold text-neutral-900 dark:text-white">
                Discover your dream
              </h3>
              <p className="text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed max-w-xs font-sans">
                Browse curated alternative homes filtered by type, location, price, and sustainability credentials.
              </p>
            </div>

            {/* Step 2 */}
            <div className="flex flex-col items-center gap-4 group">
              <span className="font-serif text-6xl font-black text-brand-terracotta/10 group-hover:text-brand-terracotta/20 transition-colors duration-300">
                02
              </span>
              <div className="text-4xl w-16 h-16 rounded-full bg-brand-cream border border-brand-sand flex items-center justify-center filter drop-shadow-sm group-hover:scale-105 transition-transform duration-300">
                🤝
              </div>
              <h3 className="font-serif text-lg font-bold text-neutral-900 dark:text-white">
                Connect with builders
              </h3>
              <p className="text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed max-w-xs font-sans">
                Talk directly with property owners or connect with verified builders who can custom-build your perfect alternative home.
              </p>
            </div>

            {/* Step 3 */}
            <div className="flex flex-col items-center gap-4 group">
              <span className="font-serif text-6xl font-black text-brand-terracotta/10 group-hover:text-brand-terracotta/20 transition-colors duration-300">
                03
              </span>
              <div className="text-4xl w-16 h-16 rounded-full bg-brand-cream border border-brand-sand flex items-center justify-center filter drop-shadow-sm group-hover:scale-105 transition-transform duration-300">
                🏡
              </div>
              <h3 className="font-serif text-lg font-bold text-neutral-900 dark:text-white">
                Move into your story
              </h3>
              <p className="text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed max-w-xs font-sans">
                We support you through legal diligence, financing parameters, architectural inspection, and title verification.
              </p>
            </div>
          </div>
        </section>

        {/* 4. FEATURED BUILDERS PANEL */}
        <section id="builders" className="flex flex-col gap-8 scroll-mt-24">
          {/* Header row */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="flex flex-col gap-2">
              
              <h2 className="font-serif text-3xl font-bold text-neutral-900 dark:text-white">
                Featured Builders
              </h2>
              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                Explore top-rated builders with trusted quality and exceptional projects.
              </p>
            </div>

            {/* Nav arrows — only when there are builders */}
            {!buildersLoading && realBuilders.length > 0 && (
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => scrollBuilders(-1)}
                  aria-label="Scroll left"
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-brand-sand bg-white dark:bg-neutral-900 dark:border-neutral-700 shadow-sm text-neutral-600 dark:text-neutral-300 hover:border-brand-terracotta hover:text-brand-terracotta transition-colors"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => scrollBuilders(1)}
                  aria-label="Scroll right"
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-brand-sand bg-white dark:bg-neutral-900 dark:border-neutral-700 shadow-sm text-neutral-600 dark:text-neutral-300 hover:border-brand-terracotta hover:text-brand-terracotta transition-colors"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>

          {/* Loading */}
          {buildersLoading && (
            <div className="flex items-center justify-center py-16 gap-3">
              <Loader2 className="h-7 w-7 animate-spin text-brand-terracotta" />
              <span className="text-sm text-neutral-400">Loading builders...</span>
            </div>
          )}

          {/* Empty */}
          {!buildersLoading && realBuilders.length === 0 && (
            <div className="text-center py-16 bg-brand-cream border border-dashed border-brand-sand rounded-2xl flex flex-col items-center gap-3">
              <span className="text-4xl">🏗️</span>
              <p className="text-sm text-neutral-500">No builders registered yet.</p>
            </div>
          )}

          {/* Carousel */}
          {!buildersLoading && realBuilders.length > 0 && (
            <div
              ref={builderCarouselRef}
              className="flex gap-5 overflow-x-auto pb-3 -mx-4 px-4 sm:mx-0 sm:px-0 scroll-smooth snap-x snap-mandatory"
              style={{ scrollbarWidth: 'none' }}
            >
              {realBuilders.map((builder, idx) => {
                const AVATAR_COLORS = [
                  'bg-purple-100 text-purple-600',
                  'bg-teal-100 text-teal-600',
                  'bg-orange-100 text-orange-600',
                  'bg-sky-100 text-sky-600',
                  'bg-rose-100 text-rose-600',
                  'bg-emerald-100 text-emerald-600',
                ]
                const colorClass = AVATAR_COLORS[idx % AVATAR_COLORS.length]
                const firstName = builder.first_name ?? ''
                const lastName = builder.last_name ?? ''
                const fullName = `${firstName} ${lastName}`.trim() || 'Builder'
                const displayName = builder.company_name || fullName
                const initials = builder.company_name
                  ? builder.company_name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
                  : `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() || '??'
                const rating = Number(builder.average_rating ?? 0)
                const totalReviews = Number(builder.total_reviews ?? 0)
                const propertiesCount = Number(builder.properties_count ?? 0)

                return (
                  <div
                    key={builder.id}
                    className="group snap-start shrink-0 w-[240px] bg-white dark:bg-neutral-900 border border-brand-sand dark:border-neutral-800 rounded-2xl p-5 flex flex-col items-center gap-4 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 text-center"
                  >
                    {/* Avatar */}
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold ring-4 ring-brand-sand/60 dark:ring-neutral-800 ${colorClass}`}>
                      {initials}
                    </div>

                    {/* Name + rating */}
                    <div className="flex flex-col gap-1.5 w-full">
                      <h3 className="font-semibold text-base text-neutral-900 dark:text-white leading-tight truncate" title={displayName}>
                        {displayName}
                      </h3>
                      <p className="text-[11px] text-neutral-500 dark:text-neutral-400 truncate">
                        Owner: {fullName}
                      </p>

                      <div className="flex items-center justify-center gap-1">
                        <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                        <span className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                          {rating > 0 ? rating.toFixed(1) : '—'}
                        </span>
                        <span className="text-xs text-neutral-400">
                          ({totalReviews})
                        </span>
                      </div>

                      <span className="inline-flex items-center justify-center gap-1 text-[11px] font-semibold text-brand-forest dark:text-emerald-400">
                        <ShieldCheck className="h-3.5 w-3.5" />
                        Verified Builder
                      </span>
                    </div>

                    {/* Divider */}
                    <div className="w-full border-t border-brand-sand dark:border-neutral-800" />

                    {/* Stats */}
                    <div className="flex flex-col gap-1.5 w-full text-xs text-neutral-500 dark:text-neutral-400">
                      <span className="flex items-center justify-center gap-1.5">
                        <Building2 className="h-3.5 w-3.5 text-brand-terracotta shrink-0" />
                        {propertiesCount} {propertiesCount === 1 ? 'Property' : 'Properties'} Listed
                      </span>
                    </div>

                    {/* CTA */}
                    <Link
                      to={`/builders/${builder.id}`}
                      className="w-full bg-brand-forest hover:bg-brand-forest/90 text-white text-sm font-semibold py-2.5 rounded-xl transition-all duration-300 text-center block"
                    >
                      View Profile
                    </Link>
                  </div>
                )
              })}
            </div>
          )}
        </section>

      </div>

      {/* 5. BOTTOM CTA PANEL — full width */}
      <section className="relative bg-brand-forest text-white overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img src="https://images.unsplash.com/photo-1473448912268-2022ce9509d8?auto=format&fit=crop&w=1600&q=80" alt="" aria-hidden="true" className="w-full h-full object-cover opacity-10" />
          <div className="absolute inset-0 bg-gradient-to-r from-brand-forest via-brand-forest/95 to-brand-forest-mid/80" />
        </div>
        <div className="absolute -right-24 top-1/2 -translate-y-1/2 w-72 h-72 rounded-full bg-brand-terracotta/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-8">

            {/* Text */}
            <div className="flex flex-col gap-2 text-center sm:text-left">
              <h2 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight leading-snug">
                Own a home the world{' '}
                <span className="text-brand-terracotta-light italic">has never seen</span> before
              </h2>
              <p className="text-sm text-brand-warm-white/60 max-w-md">
                Join visionary families discovering extraordinary living beyond cookie-cutter real estate.
              </p>
            </div>

            {/* Buttons */}
            <div className="flex items-center gap-3 shrink-0">
              <Button
                onClick={() => navigate('/properties/create')}
                className="h-10 px-6 rounded-xl bg-brand-terracotta hover:bg-brand-terracotta-light text-white font-bold text-sm border-none shadow-lg shadow-brand-terracotta/20 transition-all duration-300 flex items-center gap-2 group"
              >
                List a Property
                <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
              </Button>
              <button
                onClick={() => setShowWaitlist(true)}
                className="h-10 px-6 rounded-xl bg-white/8 hover:bg-white/14 border border-white/15 text-white font-bold text-sm transition-all duration-300 backdrop-blur-sm"
              >
                Join Waitlist
              </button>
            </div>

          </div>
        </div>
      </section>

      {/* 6. INTERACTIVE WAITLIST MODAL */}
      <AnimatePresence>
        {showWaitlist && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowWaitlist(false)}
              className="absolute inset-0 bg-neutral-950/60 backdrop-blur-sm"
            />

            {/* Modal Body */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-md bg-white dark:bg-neutral-900 border border-brand-sand rounded-3xl p-6 sm:p-8 shadow-2xl z-10 flex flex-col gap-6"
            >
              <button 
                onClick={() => setShowWaitlist(false)}
                className="absolute top-4 right-4 p-1.5 hover:bg-neutral-50 dark:hover:bg-neutral-850 rounded-full text-neutral-400 hover:text-neutral-700 dark:hover:text-white transition-colors"
              >
                <X className="h-4.5 w-4.5" />
              </button>

              <div className="flex flex-col gap-2 text-center items-center mt-2">
                <div className="w-12 h-12 rounded-full bg-brand-terracotta/10 flex items-center justify-center text-xl text-brand-terracotta mb-1">
                  ✉
                </div>
                <h3 className="font-serif text-2xl font-bold text-neutral-950 dark:text-white">
                  Join the RareNest Waitlist
                </h3>
                <p className="text-xs text-neutral-500 max-w-xs leading-relaxed">
                  Be the first to receive notifications when rare properties (mud homes, containers, dome villas) are listed in your preferred zones.
                </p>
              </div>

              {waitlistSubmitted ? (
                <div className="flex flex-col items-center justify-center py-6 text-center gap-3 animate-in fade-in zoom-in-95 duration-300">
                  <CheckCircle2 className="h-12 w-12 text-green-500" />
                  <h4 className="font-bold text-neutral-900 dark:text-white">You're on the list!</h4>
                  <p className="text-xs text-neutral-500 max-w-[240px]">
                    We have successfully queued your address. Prepare to discover rare dwelling alerts.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleWaitlistSubmit} className="flex flex-col gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                      Your Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                      <input 
                        type="email"
                        required
                        placeholder="name@example.com"
                        value={waitlistEmail}
                        onChange={(e) => setWaitlistEmail(e.target.value)}
                        className="w-full bg-neutral-50 dark:bg-neutral-950 border border-brand-sand rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none focus:border-brand-terracotta/50 transition-colors"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-brand-terracotta hover:bg-brand-terracotta-light text-white font-semibold py-2.5 rounded-xl transition-all duration-300 shadow-sm border-none"
                  >
                    Subscribe Priority Access
                  </button>
                </form>
              )}

              <div className="text-[10px] text-neutral-400 text-center">
                We respect your inbox. You can unsubscribe at any point.
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  )
}
