import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation, Pagination, Autoplay, EffectFade } from 'swiper/modules'
import { ArrowRight, MapPin, Home as HomeIcon, Search, X } from 'lucide-react'
import { usePropertyTypes } from '@/features/properties'
import { getApiOrigin } from '@/shared/config/api'
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'

import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'
import 'swiper/css/effect-fade'

function resolveImageUrl(url) {
  if (!url) return ''
  if (url.startsWith('http')) return url
  return `${getApiOrigin()}${url.startsWith('/') ? '' : '/'}${url}`
}

export default function HeroSwiper({ banners = [], onWaitlist }) {
  const navigate = useNavigate()
  const { data: typesRes } = usePropertyTypes()
  const propertyTypes = typesRes?.data || []

  // Search input states
  const [cityInput, setCityInput] = useState('')
  const [cityDropdownOpen, setCityDropdownOpen] = useState(false)
  const [citySearchTerm, setCitySearchTerm] = useState('')
  const [debouncedCitySearch, setDebouncedCitySearch] = useState('')

  const [typeInput, setTypeInput] = useState('')
  const [typeDropdownOpen, setTypeDropdownOpen] = useState(false)

  // Track active Swiper index for slide text syncing
  const [activeIndex, setActiveIndex] = useState(0)

  // Debouncing search input (300ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedCitySearch(citySearchTerm)
    }, 300)
    return () => clearTimeout(timer)
  }, [citySearchTerm])

  // React Query query to fetch cities
  const { data: citySuggestions = [], isLoading: isCitiesLoading } = useQuery({
    queryKey: ['cities-search', debouncedCitySearch],
    queryFn: async () => {
      if (debouncedCitySearch.trim().length < 3) return []
      const res = await axios.get(`${getApiOrigin()}/api/cities/search?q=${debouncedCitySearch}`)
      return res.data
    },
    enabled: debouncedCitySearch.trim().length >= 3,
    staleTime: 5 * 60 * 1000,
  })

  const handleSearch = () => {
    const params = new URLSearchParams()
    if (cityInput.trim()) params.append('city', cityInput.trim())
    if (typeInput) params.append('type', typeInput)
    navigate(`/properties?${params.toString()}`)
  }

  const slides = banners.length > 0 ? banners : [
    {
      id: 'default-1',
      title: 'Discover Spaces That Inspire',
      subtitle: 'From first homes to dream properties, find the perfect match with confidence.',
      image_url: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80',
    }
  ]

  const currentBanner = slides[activeIndex] || slides[0]

  return (
    <section className="relative w-full bg-neutral-950 min-h-[580px] overflow-visible">
      {/* Background Slider - Image and Gradients ONLY */}
      <Swiper
        modules={[Autoplay, EffectFade]}
        effect="fade"
        speed={1000}
        autoplay={{ delay: 6000, disableOnInteraction: false }}
        loop={slides.length > 1}
        onSlideChange={(swiper) => setActiveIndex(swiper.realIndex)}
        className="w-full h-[580px] z-0"
      >
        {slides.map((banner, idx) => (
          <SwiperSlide key={banner.id ?? idx}>
            <div className="relative h-full w-full bg-black">
              <img
                src={resolveImageUrl(banner.image_url)}
                alt="Banner Background"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-brand-forest/75 via-brand-forest/40 to-neutral-950/80" />
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Static Interactive Content Overlay */}
      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center text-center text-white px-4 sm:px-6 lg:px-8 pointer-events-none">
        <div className="max-w-4xl w-full flex flex-col gap-6 items-center pointer-events-auto">
          
          {/* Synced banner text */}
          <div className="flex flex-col gap-4 animate-in fade-in duration-300">
            <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl font-normal leading-[1.1] tracking-tight max-w-3xl mx-auto">
              {currentBanner.title}
            </h1>
            {currentBanner.subtitle && (
              <p className="text-brand-warm-white/85 font-sans font-light text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
                {currentBanner.subtitle}
              </p>
            )}
          </div>

          {/* Homepage Search Console Widget */}
          <div className="w-full max-w-3xl bg-white dark:bg-neutral-900 rounded-3xl p-3 flex flex-col md:flex-row items-center gap-2 shadow-2xl border border-neutral-100/10 dark:border-neutral-800/80 text-neutral-800 dark:text-neutral-200 mt-4 relative">
            
            {/* City Selector */}
            <div className="flex-1 flex items-center gap-3 px-4 py-2 border-b md:border-b-0 md:border-r border-neutral-100 dark:border-neutral-800 w-full relative">
              <MapPin className="h-5 w-5 text-brand-terracotta shrink-0" />
              <div 
                className="flex flex-col items-start flex-1 cursor-pointer select-none"
                onClick={() => {
                  setCityDropdownOpen(!cityDropdownOpen)
                  setTypeDropdownOpen(false)
                }}
              >
                <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-450">City</span>
                <span className="text-sm font-semibold text-neutral-900 dark:text-white truncate max-w-[150px]">
                  {cityInput || 'Enter city name'}
                </span>
              </div>
              {cityDropdownOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setCityDropdownOpen(false)} />
                  <div className="absolute left-1/2 -translate-x-1/2 md:left-0 md:translate-x-0 top-full mt-3 bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-3xl shadow-2xl z-50 p-4 w-[280px] sm:w-[320px] flex flex-col gap-3 animate-in fade-in slide-in-from-top-2 duration-200">
                    {/* Search Input Box */}
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-400" />
                      <input
                        type="text"
                        autoFocus
                        placeholder="Search city..."
                        value={citySearchTerm}
                        onChange={(e) => setCitySearchTerm(e.target.value)}
                        className="w-full bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl pl-9 pr-8 py-2 text-xs font-semibold outline-none focus:border-brand-terracotta transition-all text-neutral-900 dark:text-white"
                      />
                      {citySearchTerm && (
                        <button 
                          type="button"
                          onClick={() => setCitySearchTerm('')}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 cursor-pointer"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>

                    {/* Suggestions list */}
                    <div className="flex flex-col gap-1 max-h-48 overflow-y-auto">
                      {citySearchTerm.trim().length < 3 ? (
                        <p className="text-[11px] text-neutral-400 font-medium text-center py-4">
                          Type at least 3 characters to search
                        </p>
                      ) : isCitiesLoading ? (
                        <p className="text-[11px] text-neutral-400 font-medium text-center py-4 animate-pulse">
                          Loading cities...
                        </p>
                      ) : citySuggestions.length === 0 ? (
                        <p className="text-[11px] text-neutral-400 font-medium text-center py-4">
                          No cities found
                        </p>
                      ) : (
                        citySuggestions.map((item) => (
                          <button
                            key={`${item.city}-${item.state}`}
                            type="button"
                            onClick={() => {
                              setCityInput(item.city)
                              setCityDropdownOpen(false)
                            }}
                            className="w-full text-left px-3 py-2.5 text-xs font-semibold rounded-xl text-neutral-700 hover:bg-neutral-50 dark:text-neutral-300 dark:hover:bg-neutral-900 cursor-pointer transition-colors"
                          >
                            {item.city}, {item.state}
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Property Type Dropdown */}
            <div className="flex-1 flex items-center gap-3 px-4 py-2 relative w-full">
              <HomeIcon className="h-5 w-5 text-brand-terracotta shrink-0" />
              <div 
                className="flex flex-col items-start flex-1 cursor-pointer select-none" 
                onClick={() => {
                  setTypeDropdownOpen(!typeDropdownOpen)
                  setCityDropdownOpen(false)
                }}
              >
                <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-450">Property Type</span>
                <span className="text-sm font-semibold text-neutral-900 dark:text-white">
                  {typeInput || 'Select property type'}
                </span>
              </div>
              {typeDropdownOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setTypeDropdownOpen(false)} />
                  <div className="absolute left-1/2 -translate-x-1/2 md:left-auto md:right-0 md:translate-x-0 top-full mt-3 bg-white dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 rounded-3xl shadow-2xl z-50 p-4 w-[280px] sm:w-[450px] animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-[320px] overflow-visible">
                      <button
                        type="button"
                        onClick={() => { setTypeInput(''); setTypeDropdownOpen(false); }}
                        className={`px-3 py-2.5 rounded-xl text-xs font-semibold text-center border transition-all cursor-pointer truncate ${
                          !typeInput
                            ? 'bg-brand-terracotta border-brand-terracotta text-white shadow-md'
                            : 'bg-neutral-50 dark:bg-neutral-900 border-neutral-150 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800/80'
                        }`}
                      >
                        All Types
                      </button>
                      {propertyTypes.map((type) => (
                        <button
                          type="button"
                          key={type.id || type.name}
                          onClick={() => { setTypeInput(type.name); setTypeDropdownOpen(false); }}
                          className={`px-3 py-2.5 rounded-xl text-xs font-semibold text-center border transition-all cursor-pointer truncate ${
                            typeInput === type.name
                              ? 'bg-brand-terracotta border-brand-terracotta text-white shadow-md'
                              : 'bg-neutral-50 dark:bg-neutral-900 border-neutral-150 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800/80'
                          }`}
                        >
                          {type.name}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Search Button */}
            <button
              type="button"
              onClick={handleSearch}
              className="w-full md:w-auto bg-brand-terracotta hover:bg-brand-terracotta-light text-white px-8 py-3.5 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-md shadow-brand-terracotta/20 cursor-pointer"
            >
              <Search className="h-4.5 w-4.5" />
              <span>Search</span>
            </button>
          </div>

          {/* Explore & Waitlist Actions */}
          <div className="flex flex-col sm:flex-row gap-4 mt-2">
            <a
              href="#dwellings"
              onClick={(e) => {
                e.preventDefault()
                document.getElementById('dwellings')?.scrollIntoView({ behavior: 'smooth' })
              }}
              className="bg-brand-terracotta hover:bg-brand-terracotta-light text-white px-7 py-4 rounded-xl font-bold shadow-lg shadow-brand-terracotta/20 transition-all duration-300 text-center flex items-center justify-center gap-2 group border-none"
            >
              Explore Dwellings
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </a>
            <button
              onClick={onWaitlist}
              className="bg-white/15 hover:bg-white/25 text-white border border-white/30 px-7 py-4 rounded-xl font-bold backdrop-blur-sm transition-all duration-300 cursor-pointer"
            >
              Join Waitlist
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
