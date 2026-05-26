import React from 'react'
import { 
  Search, 
  SlidersHorizontal, 
  Grid, 
  List, 
  Sparkles, 
  Loader2, 
} from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import PropertyCard from '@/features/properties/components/PropertyCard'
import { useProperties } from '@/features/properties'
import { usePropertyTypes } from '@/features/properties'
import { mapPropertyForCard } from '@/features/properties/lib/propertyUtils'
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
  ]

  const displayProperties = realProperties.map(mapPropertyForCard)

  // Helper matching categories
  const categoryMatches = (propType, catName) => {
    if (catName === 'All Homes') return true
    const normalizedProp = propType?.toLowerCase().trim() || ''
    const normalizedCat = catName?.toLowerCase().trim() || ''
    return normalizedProp === normalizedCat || normalizedProp.includes(normalizedCat) || normalizedCat.includes(normalizedProp)
  }

  // Filter & Search Logic
  const filtered = displayProperties.filter((p) => {
    // 1. Search Query Filter
    const searchLower = search.toLowerCase()
    const titleMatch = p.title.toLowerCase().includes(searchLower)
    const locMatch = p.locationLabel.toLowerCase().includes(searchLower)
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
                <PropertyCard
                  key={prop.id}
                  property={prop}
                  index={idx}
                  layout={viewMode === 'list' ? 'list' : 'grid'}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
