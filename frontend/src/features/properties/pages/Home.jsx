import React from 'react'
import { Link,useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Sparkles, 
  ArrowRight, 
  Loader2, 
  MapPin, 
  SlidersHorizontal, 
  X, 
  Mail, 
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  DollarSign
} from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import PropertyCard from '@/features/properties/components/PropertyCard'
import { useProperties } from '@/features/properties'
import { usePropertyTypes } from '@/features/properties'
import { mapPropertyForCard } from '@/features/properties/lib/propertyUtils'
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
  const realProperties = propertiesRes?.data || []
  const apiTypes = typesRes?.data || []
  const navigate=useNavigate()
  // Category Carousel State
  const [activeCategory, setActiveCategory] = React.useState('All Homes')

  // Filter States
  const [minPrice, setMinPrice] = React.useState('')
  const [maxPrice, setMaxPrice] = React.useState('')
  const [maxSize, setMaxSize] = React.useState(3500)
  
  // Applied filters state
  const [appliedFilters, setAppliedFilters] = React.useState({
    minPrice: '',
    maxPrice: '',
    maxSize: 3500
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

  const displayProperties = realProperties.map(mapPropertyForCard)

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
      maxSize
    })
    toast.success('Filters applied successfully!')
  }

  const clearActiveFilters = () => {
    setMinPrice('')
    setMaxPrice('')
    setMaxSize(3500)
    setAppliedFilters({
      minPrice: '',
      maxPrice: '',
      maxSize: 3500
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

  // Featured Builders
  const builders = [
    {
      name: 'Mitti Collective',
      location: 'Jaipur, Rajasthan',
      specialty: 'Mud Homes, Earth Construction',
      rating: '4.9',
      image: 'https://images.unsplash.com/photo-1590069261209-f8e9b8642343?auto=format&fit=crop&w=400&q=80',
      badge: 'Earth Builder'
    },
    {
      name: 'Teak & Timber Co.',
      location: 'Coorg, Karnataka',
      specialty: 'Luxury A-Frames, Treehouses',
      rating: '4.8',
      image: 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=400&q=80',
      badge: 'Fine Timber'
    },
    {
      name: 'BoxSpace India',
      location: 'Mumbai, Maharashtra',
      specialty: 'Premium Container Homes, Modern Cabins',
      rating: '4.9',
      image: 'https://images.unsplash.com/photo-1524813686514-a57563d77965?auto=format&fit=crop&w=400&q=80',
      badge: 'Modular Expert'
    },
    {
      name: 'Canopy Builders',
      location: 'Wayanad, Kerala',
      specialty: 'Treehouses, Bamboo Structures',
      rating: '4.7',
      image: 'https://images.unsplash.com/photo-1502082553048-f009c37129b9?auto=format&fit=crop&w=400&q=80',
      badge: 'Canopy Craft'
    },
    {
      name: 'Floating Homes India',
      location: 'Alleppey, Kerala',
      specialty: 'Modern Boathouses, Floating Villas',
      rating: '4.9',
      image: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=400&q=80',
      badge: 'Eco Maritime'
    },
    {
      name: 'Dome & Earth Studio',
      location: 'Auroville, Tamil Nadu',
      specialty: 'Geodesic Domes, Superadobe',
      rating: '5.0',
      image: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=400&q=80',
      badge: 'Superadobe Vetted'
    }
  ]

  return (
    <div className="flex flex-col gap-16 md:gap-24 w-full pb-16">
      
      {/* 1. HERO HERO INTRO (FULL-WIDTH EDGE-TO-EDGE) */}
      <section className="relative bg-green-20 text-white min-h-[540px] flex  items-center w-full shadow-lg">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=2000&q=80" 
            alt="Hero mountain background" 
            className="w-full h-full object-cover brightness-[0.25] opacity-40 mix-blend-overlay"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-brand-forest via-brand-forest/90 to-transparent"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-20 sm:py-24 flex flex-col gap-6 items-center justify-center text-center">
          <div className="inline-flex items-center gap-2 bg-brand-terracotta/25 border border-brand-terracotta/40 px-4 py-1.5 rounded-full text-xs font-semibold tracking-wider text-brand-terracotta-light uppercase max-w-max">
            <Sparkles className="h-3.5 w-3.5" /> RareNest Marketplace
          </div>
          <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-normal leading-[1.1] tracking-tight max-w-3xl">
            Own a home that <br />
            <span className="italic text-brand-terracotta font-medium font-serif">tells a story.</span>
          </h1>
          <p className="text-brand-warm-white/85 font-sans font-light text-base sm:text-lg max-w-2xl leading-relaxed">
            Discover and acquire extraordinary alternative dwellings worldwide. Vetted micro-dwellings, clay earthships, timber cabins, and custom container sanctuaries built by master craftsmen.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 mt-4">
            <a 
              href="#dwellings" 
              className="bg-brand-terracotta hover:bg-brand-terracotta-light text-white px-7 py-4 rounded-xl font-bold shadow-lg shadow-brand-terracotta/20 transition-all duration-300 text-center flex items-center justify-center gap-2 group border-none"
            >
              Explore Dwellings
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </a>
            <button 
              onClick={() => setShowWaitlist(true)}
              className="bg-brand-forest-mid/60 hover:bg-brand-forest-mid/80 text-white border border-brand-forest-mid/80 px-7 py-4 rounded-xl font-bold backdrop-blur-sm transition-all duration-300"
            >
              Join Waitlist
            </button>
          </div>
        </div>
      </section>

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
                  <SlidersHorizontal className="h-4 w-4 text-brand-terracotta" /> Filter Dwellings
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
                      ? 'Verified properties will appear here once approved by our team.'
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
        <section id="builders" className="flex flex-col gap-10 scroll-mt-24">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
            <div className="flex flex-col gap-2 max-w-xl">
              <span className="text-[10px] font-bold text-brand-terracotta uppercase tracking-widest bg-brand-terracotta/10 px-3 py-1 rounded-full max-w-max">
                Master Craftspeople
              </span>
              <h2 className="font-serif text-3xl font-bold text-neutral-900 dark:text-white">
                Featured builders
              </h2>
              <p className="text-sm text-neutral-500 dark:text-neutral-400">
                Connect with verified alternative home builders, each vetted for structural quality and sustainability credentials.
              </p>
            </div>
            <button 
              onClick={() => toast.info('Builder directory expanding soon! Stay tuned.')}
              className="text-sm font-semibold text-brand-terracotta hover:text-brand-terracotta-light flex items-center gap-1"
            >
              Become Vetted Builder <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {builders.map((builder, idx) => (
              <div 
                key={idx}
                className="group bg-brand-cream border border-brand-sand p-5 rounded-2xl flex flex-col gap-4 shadow-sm hover:shadow-md transition-all duration-300"
              >
                {/* Cover area */}
                <div className="relative h-44 overflow-hidden rounded-xl bg-neutral-200">
                  <img 
                    src={builder.image} 
                    alt={builder.name}
                    className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500"
                    loading="lazy"
                  />
                  <span className="absolute top-3 left-3 bg-brand-forest/90 backdrop-blur px-2.5 py-0.5 rounded text-[9px] font-extrabold uppercase text-white tracking-widest">
                    {builder.badge}
                  </span>
                  <span className="absolute bottom-3 right-3 bg-white/95 dark:bg-neutral-900/95 px-2 py-0.5 rounded-lg text-xs font-bold text-brand-terracotta flex items-center gap-0.5 shadow-sm">
                    ★ <span className="text-neutral-800 dark:text-white font-extrabold">{builder.rating}</span>
                  </span>
                </div>

                {/* Bio area */}
                <div className="flex flex-col gap-1.5">
                  <h3 className="font-serif text-lg font-bold text-neutral-900 dark:text-white group-hover:text-brand-terracotta transition-colors">
                    {builder.name}
                  </h3>
                  <p className="text-xs text-neutral-400 font-bold flex items-center gap-1">
                    <MapPin className="h-3 w-3 text-brand-terracotta" /> {builder.location}
                  </p>
                  <p className="text-xs text-neutral-500 mt-1 leading-relaxed font-sans">
                    <span className="font-semibold text-neutral-700 dark:text-neutral-300">Specialty:</span> {builder.specialty}
                  </p>
                </div>

                {/* Action buttons */}
                <button 
                  onClick={() => {
                    toast.success(`Message query sent to ${builder.name}! They will get in touch with you shortly.`);
                  }}
                  className="w-full mt-2 border border-brand-terracotta/35 text-brand-terracotta hover:bg-brand-terracotta hover:text-white py-2.5 rounded-xl text-xs font-bold transition-all duration-300 bg-transparent"
                >
                  Inquire Consultation
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* 5. BOTTOM CTA PANEL */}
        <section className="relative rounded-3xl bg-brand-forest text-white p-8 sm:p-16 overflow-hidden shadow-2xl flex flex-col items-center text-center gap-6 border border-brand-forest-mid/45">
          <div className="absolute inset-0 z-0 opacity-15">
            <img 
              src="https://images.unsplash.com/photo-1473448912268-2022ce9509d8?auto=format&fit=crop&w=1200&q=80" 
              alt="Forest backdrop overlay" 
              className="w-full h-full object-cover"
            />
          </div>

          <div className="relative z-10 max-w-xl flex flex-col gap-4">
            <h2 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight leading-tight">
              Own a home the world <br />has never seen before
            </h2>
            <p className="text-sm sm:text-base text-brand-warm-white/80 leading-relaxed font-light">
              Join hundreds of visionary families who have discovered that extraordinary living does not have to match standard cookie-cutter real estate.
            </p>
          </div>

          <div className="relative z-10 flex flex-col sm:flex-row gap-4 mt-2 w-full justify-center max-w-sm">
           <Button
                             variant="outline"
                             size="xl"
                             onClick={() => navigate('/properties/create')}
                             className="bg-brand-terracotta hover:bg-brand-terracotta-light text-white px-7 py-4 rounded-xl font-bold shadow-lg shadow-brand-terracotta/20 transition-all duration-300 text-center  border-none"
                           >
                             
                             List a Property
                           </Button>
            <button
              onClick={() => setShowWaitlist(true)}
              className="bg-brand-forest-mid/60 hover:bg-brand-forest-mid/80 border border-brand-forest-mid/80 text-white px-6 py-3 rounded-xl font-bold transition-all duration-300 text-sm"
            >
              Join Waitlist
            </button>
          </div>
        </section>
      </div>

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
