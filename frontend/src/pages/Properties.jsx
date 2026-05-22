import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Search, 
  SlidersHorizontal, 
  Grid, 
  List, 
  Sparkles, 
  Loader2, 
  MapPin, 
  Heart,
  ChevronRight 
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useProperties } from '@/hooks/useProperties'
import { usePropertyTypes } from '@/hooks/usePropertyTypes'
import { toast } from 'sonner'

export default function Properties() {
  const [search, setSearch] = React.useState('')
  const [viewMode, setViewMode] = React.useState('grid')
  const [activeCategory, setActiveCategory] = React.useState('All Homes')
  
  // Advanced Filters
  const [minPrice, setMinPrice] = React.useState('')
  const [maxPrice, setMaxPrice] = React.useState('')
  const [maxSize, setMaxSize] = React.useState(3500)
  
  // Applied filters state
  const [appliedFilters, setAppliedFilters] = React.useState({
    minPrice: '',
    maxPrice: '',
    maxSize: 3500
  })

  const { data: propertiesRes, isLoading } = useProperties()
  const { data: typesRes } = usePropertyTypes()
  const realProperties = propertiesRes?.data || []
  const apiTypes = typesRes?.data || []

  const typeIcons = {
    'wood house': '🌲',
    'mud house': '🧱',
    'container home': '📦',
    treehouse: '🍁',
    'boat house': '⛵',
  }

  const categories = [
    { name: 'All Homes', icon: '🏡' },
    ...apiTypes.map((t) => ({
      name: t.name,
      icon: typeIcons[t.name?.toLowerCase()] || '🏠',
    })),
    ...(apiTypes.length === 0
      ? [
          { name: 'Wood House', icon: '🌲' },
          { name: 'Mud House', icon: '🧱' },
          { name: 'Container Home', icon: '📦' },
          { name: 'Treehouse', icon: '🍁' },
          { name: 'Boat House', icon: '⛵' },
        ]
      : []),
  ]

  // Curated Luxury Fallbacks
  const curatedProperties = [
    {
      id: 'c1',
      title: 'Himalayan Earthship Retreat',
      property_type: 'Mud House',
      location_city: 'Kasol',
      location_state: 'Himachal Pradesh',
      location_address: '📍 Parvati Valley',
      asking_price: 14000000,
      size_sqft: 1400,
      beds: 3,
      baths: 2,
      tag: 'Earthship',
      image: 'https://images.unsplash.com/photo-1510798831971-661eb04b3739?auto=format&fit=crop&w=1200&q=80'
    },
    {
      id: 'c2',
      title: 'Himalayan A-Frame Chalet',
      property_type: 'Wood House',
      location_city: 'Manali',
      location_state: 'Himachal Pradesh',
      location_address: '📍 Solang Valley',
      asking_price: 5500000,
      size_sqft: 700,
      beds: 2,
      baths: 1,
      tag: 'A-Frame',
      image: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&w=1200&q=80'
    },
    {
      id: 'c3',
      title: 'Glass & Cedar Forest House',
      property_type: 'Wood House',
      location_city: 'Chikmagalur',
      location_state: 'Karnataka',
      location_address: '📍 Mullayanagiri Hills',
      asking_price: 23000000,
      size_sqft: 3200,
      beds: 5,
      baths: 4,
      tag: 'Luxury Timber',
      image: 'https://images.unsplash.com/photo-1549693578-d683be217e58?auto=format&fit=crop&w=1200&q=80'
    },
    {
      id: 'c4',
      title: 'Desert Container Stack',
      property_type: 'Container Home',
      location_city: 'Al Qudra',
      location_state: 'Dubai UAE',
      location_address: '📍 Al Qudra Desert',
      asking_price: 58000000,
      size_sqft: 3800,
      beds: 4,
      baths: 3,
      tag: 'Container Home',
      image: 'https://images.unsplash.com/photo-1595841696660-1e9cdd43c2c9?auto=format&fit=crop&w=1200&q=80'
    },
    {
      id: 'c5',
      title: 'Canopy Canopy Treehouse',
      property_type: 'Treehouse',
      location_city: 'Wayanad',
      location_state: 'Kerala',
      location_address: '📍 Vythiri Forest',
      asking_price: 9500000,
      size_sqft: 900,
      beds: 2,
      baths: 1.5,
      tag: 'Canopy Treehouse',
      image: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1200&q=80'
    },
    {
      id: 'c6',
      title: 'Luxury Alleppey Houseboat',
      property_type: 'Boat House',
      location_city: 'Alleppey',
      location_state: 'Kerala',
      location_address: '📍 Vembanad Lake Backwaters',
      asking_price: 18500000,
      size_sqft: 1800,
      beds: 3,
      baths: 3,
      tag: 'Modern Boathouse',
      image: 'https://images.unsplash.com/photo-1569336415962-a4bd9f69cd83?auto=format&fit=crop&w=1200&q=80'
    }
  ]

  // Map backend property data into unified frontend structure
  const thumbnailUrl = (prop, fallback) => {
    const thumb = prop.media?.find((m) => m.is_thumbnail && m.media_type === 'Image')
    const first = prop.media?.find((m) => m.media_type === 'Image')
    const url = thumb?.media_url || first?.media_url
    return url || fallback
  }

  const dbMappedProperties = realProperties.map((prop, idx) => {
    const typeName = prop.property_type_name || 'Unique Dwelling'
    const locParts = [prop.location_district, prop.location_city, prop.location_state].filter(Boolean)
    return {
      id: prop.id,
      title: prop.title,
      property_type: typeName,
      location_city: prop.location_city,
      location_state: prop.location_state || '',
      location_address: locParts.join(', '),
      asking_price: prop.asking_price,
      size_sqft: prop.size_sqft,
      beds: Math.max(1, Math.round(prop.size_sqft / 1200)),
      baths: Math.max(1, Math.round(prop.size_sqft / 1000 * 2) / 2),
      tag: typeName,
      image: thumbnailUrl(prop, curatedProperties[idx % curatedProperties.length].image),
    }
  })

  const allDisplayProperties = dbMappedProperties.length > 0 
    ? [...dbMappedProperties, ...curatedProperties] 
    : curatedProperties

  // Helper matching categories
  const categoryMatches = (propType, catName) => {
    if (catName === 'All Homes') return true
    const normalizedProp = propType?.toLowerCase().trim() || ''
    const normalizedCat = catName?.toLowerCase().trim() || ''
    return normalizedProp === normalizedCat || normalizedProp.includes(normalizedCat) || normalizedCat.includes(normalizedProp)
  }

  // Filter & Search Logic
  const filtered = allDisplayProperties.filter((p) => {
    // 1. Search Query Filter
    const searchLower = search.toLowerCase()
    const titleMatch = p.title.toLowerCase().includes(searchLower)
    const locMatch = p.location_address.toLowerCase().includes(searchLower)
    const typeMatch = p.property_type.toLowerCase().includes(searchLower)
    if (search && !titleMatch && !locMatch && !typeMatch) return false

    // 2. Category Pill Filter
    if (!categoryMatches(p.property_type, activeCategory)) return false

    // 3. Price Filter Parameters
    if (appliedFilters.minPrice && p.asking_price < Number(appliedFilters.minPrice)) return false
    if (appliedFilters.maxPrice && p.asking_price > Number(appliedFilters.maxPrice)) return false

    // 4. Size Filter Parameter
    if (p.size_sqft > appliedFilters.maxSize) return false

    return true
  })

  // Format Price in Lakhs/Crores
  const formatINR = (val) => {
    if (val >= 10000000) {
      return `₹${(val / 10000000).toFixed(2)} Cr`
    } else if (val >= 100000) {
      return `₹${(val / 100000).toFixed(1)} L`
    }
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val)
  }

  const handleApplyFilters = () => {
    setAppliedFilters({ minPrice, maxPrice, maxSize })
    toast.success('Filter criteria updated!')
  }

  const handleResetFilters = () => {
    setMinPrice('')
    setMaxPrice('')
    setMaxSize(3500)
    setAppliedFilters({ minPrice: '', maxPrice: '', maxSize: 3500 })
    toast.success('Filters cleared!')
  }

  return (
    <div className="flex flex-col gap-8 pt-10 pb-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* 1. Header Information Block */}
      <div className="flex flex-col gap-2">
        <div className="inline-flex items-center gap-1.5 text-xs font-bold tracking-wider text-brand-bronze uppercase bg-brand-bronze/10 px-3 py-1 rounded-full max-w-max">
          <Sparkles className="h-3.5 w-3.5" /> High Performance Catalog
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl font-extrabold tracking-tight text-neutral-900 dark:text-white">
          The Rare Dwelling Archive
        </h1>
        <p className="text-sm text-neutral-500 max-w-2xl font-sans leading-relaxed">
          Examine the ultimate collection of sustainable masterpieces. Fine wood frame structures, container stack residences, and earthship shells built to endure.
        </p>
      </div>

      {/* 2. Horizontal Filter Carousel */}
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-neutral-200 scrollbar-track-transparent">
        {categories.map((cat) => (
          <button
            key={cat.name}
            onClick={() => setActiveCategory(cat.name)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold tracking-wide shrink-0 transition-all duration-300 border ${
              activeCategory === cat.name
                ? 'bg-neutral-900 border-neutral-900 text-white dark:bg-white dark:border-white dark:text-neutral-950 shadow-sm'
                : 'bg-white border-neutral-100 hover:border-neutral-250 text-neutral-600 dark:bg-neutral-900 dark:border-neutral-850 dark:text-neutral-300 dark:hover:border-neutral-700'
            }`}
          >
            <span>{cat.icon}</span>
            <span>{cat.name}</span>
          </button>
        ))}
      </div>

      {/* 3. Search and View Controls Header */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-neutral-50 dark:bg-neutral-900/40 p-4 rounded-2xl border border-neutral-100 dark:border-neutral-850">
        
        {/* Search */}
        <div className="relative w-full md:max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
          <input
            type="text"
            placeholder="Search catalog by title, city or state..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-11 rounded-xl bg-white dark:bg-neutral-950 pl-10 pr-4 text-sm border border-neutral-200 dark:border-neutral-800 outline-none focus:border-brand-bronze/50 transition-all placeholder:text-neutral-400 font-sans"
          />
        </div>

        {/* View togglers & Layout trigger */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
          <div className="flex rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 p-1 gap-1 shrink-0">
            <Button
              variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
              size="icon-xs"
              onClick={() => setViewMode('grid')}
              className="rounded-lg h-8 w-8"
            >
              <Grid className="h-4 w-4 text-neutral-700 dark:text-neutral-300" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'secondary' : 'ghost'}
              size="icon-xs"
              onClick={() => setViewMode('list')}
              className="rounded-lg h-8 w-8"
            >
              <List className="h-4 w-4 text-neutral-700 dark:text-neutral-300" />
            </Button>
          </div>
        </div>
      </div>

      {/* 4. Filter and Properties Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Left Side Filter controls */}
        <div className="lg:col-span-1 h-fit bg-neutral-50/50 dark:bg-neutral-900/30 border border-neutral-100 dark:border-neutral-850 rounded-2xl p-5 flex flex-col gap-6 shadow-sm">
          <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800 pb-3">
            <span className="font-serif text-base font-bold text-neutral-900 dark:text-white flex items-center gap-2">
              <SlidersHorizontal className="h-4 w-4 text-brand-bronze" /> Filter Parameters
            </span>
            <button 
              onClick={handleResetFilters}
              className="text-xs font-semibold text-neutral-400 hover:text-brand-bronze transition-colors"
            >
              Reset
            </button>
          </div>

          {/* Price Range */}
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-bold text-neutral-700 dark:text-neutral-300 uppercase tracking-widest">
              Price Boundary (₹)
            </label>
            <div className="grid grid-cols-2 gap-2">
              <input 
                type="number"
                placeholder="Min Price"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                className="w-full bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-850 rounded-xl px-3 py-2 text-xs outline-none focus:border-brand-bronze/50 transition-all"
              />
              <input 
                type="number"
                placeholder="Max Price"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="w-full bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-850 rounded-xl px-3 py-2 text-xs outline-none focus:border-brand-bronze/50 transition-all"
              />
            </div>
          </div>

          {/* Size range */}
          <div className="flex flex-col gap-3">
            <div className="flex justify-between items-center text-[10px] font-bold text-neutral-700 dark:text-neutral-300 uppercase tracking-widest">
              <span>Maximum Size</span>
              <span className="text-brand-bronze font-bold normal-case text-xs font-sans">
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
              className="w-full h-1 bg-neutral-200 dark:bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-brand-bronze"
            />
            <div className="flex justify-between text-[9px] text-neutral-400 font-semibold">
              <span>100 sqft</span>
              <span>3500 sqft</span>
            </div>
          </div>

          <Button
            onClick={handleApplyFilters}
            className="w-full bg-brand-bronze hover:bg-brand-bronze-dark text-white font-semibold py-2.5 rounded-xl text-xs transition-all duration-300"
          >
            Apply Filters
          </Button>
        </div>

        {/* Right Side Cards Display grid */}
        <div className="lg:col-span-3">
          {isLoading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="h-10 w-10 animate-spin text-brand-bronze" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20 border border-dashed border-neutral-200 dark:border-neutral-850 rounded-2xl flex flex-col items-center justify-center p-6 gap-3">
              <span className="text-3xl">🏝</span>
              <h3 className="font-serif text-lg font-bold text-neutral-700 dark:text-neutral-200">No Matching Archives</h3>
              <p className="text-xs text-neutral-400 max-w-sm">
                We couldn't locate any alternative residences that conform to your exact parameters. Try clearing your search fields.
              </p>
              <Button onClick={handleResetFilters} variant="outline" size="sm" className="rounded-xl border-brand-bronze text-brand-bronze hover:bg-brand-bronze hover:text-white mt-1">
                Clear Filters
              </Button>
            </div>
          ) : (
            <div className={
              viewMode === 'grid' 
                ? "grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in duration-300" 
                : "flex flex-col gap-6 animate-in fade-in duration-300"
            }>
              {filtered.map((prop, idx) => (
                <motion.div
                  key={prop.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(idx * 0.04, 0.2) }}
                  className={`group overflow-hidden rounded-2xl border border-neutral-100 dark:border-neutral-850 bg-white dark:bg-neutral-900 hover:shadow-xl transition-all duration-300 flex ${
                    viewMode === 'grid' ? 'flex-col' : 'flex-col sm:flex-row h-auto sm:h-56'
                  }`}
                >
                  {/* Image */}
                  <div className={`relative overflow-hidden bg-neutral-100 dark:bg-neutral-800 shrink-0 ${
                    viewMode === 'grid' ? 'h-60 w-full' : 'h-56 sm:h-full w-full sm:w-72'
                  }`}>
                    <img
                      src={prop.image}
                      alt={prop.title}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-103"
                      loading="lazy"
                    />
                    <span className="absolute top-4 left-4 rounded-full bg-white/95 dark:bg-neutral-900/95 backdrop-blur px-3 py-1 text-[9px] font-bold text-brand-bronze shadow-sm uppercase tracking-wider border border-brand-bronze/10">
                      {prop.tag || prop.property_type}
                    </span>
                  </div>

                  {/* Body */}
                  <div className="p-6 flex flex-col justify-between flex-grow gap-4">
                    <div className="flex flex-col gap-1.5">
                      <div className="flex justify-between items-start gap-2">
                        <h3 className="font-serif font-bold text-base sm:text-lg text-neutral-950 dark:text-white group-hover:text-brand-bronze transition-colors line-clamp-1">
                          {prop.title}
                        </h3>
                        <span className="text-base sm:text-lg font-extrabold text-brand-bronze shrink-0">
                          {formatINR(prop.asking_price)}
                        </span>
                      </div>
                      <p className="text-xs text-neutral-400 font-semibold flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5 text-brand-bronze" />
                        {prop.location_address}
                      </p>
                    </div>

                    <div className="grid grid-cols-3 gap-2 border-t border-neutral-50 dark:border-neutral-800 pt-4 text-[10px] sm:text-xs text-neutral-400 text-center font-semibold">
                      <div className="flex flex-col bg-neutral-50 dark:bg-neutral-950/40 p-1.5 rounded-xl border border-neutral-100/40 dark:border-neutral-800/40">
                        <span className="text-neutral-900 dark:text-white font-bold">{prop.beds}</span>
                        <span className="text-[9px] text-neutral-400 font-bold uppercase tracking-wider">Beds</span>
                      </div>
                      <div className="flex flex-col bg-neutral-50 dark:bg-neutral-950/40 p-1.5 rounded-xl border border-neutral-100/40 dark:border-neutral-800/40">
                        <span className="text-neutral-900 dark:text-white font-bold">{prop.baths}</span>
                        <span className="text-[9px] text-neutral-400 font-bold uppercase tracking-wider">Baths</span>
                      </div>
                      <div className="flex flex-col bg-neutral-50 dark:bg-neutral-950/40 p-1.5 rounded-xl border border-neutral-100/40 dark:border-neutral-800/40">
                        <span className="text-neutral-900 dark:text-white font-bold">{prop.size_sqft.toLocaleString()}</span>
                        <span className="text-[9px] text-neutral-400 font-bold uppercase tracking-wider">Sq Ft</span>
                      </div>
                    </div>

                    <div className="flex justify-between items-center pt-2">
                      <button 
                        onClick={() => toast.info('Detailed blueprints, virtual tours, and legal papers will load here!')}
                        className="text-xs font-bold text-neutral-950 dark:text-white flex items-center gap-1 hover:text-brand-bronze transition-colors group/view"
                      >
                        Inspect Blueprint
                        <ChevronRight className="h-3.5 w-3.5 transition-transform group-hover/view:translate-x-0.5" />
                      </button>

                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="text-neutral-400 hover:text-destructive hover:bg-transparent rounded-full p-1 h-auto"
                        onClick={() => {
                          toast.success(`"${prop.title}" added to your wishlist!`);
                        }}
                      >
                        <Heart className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
