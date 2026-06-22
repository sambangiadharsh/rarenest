import React, { useState, useEffect, useMemo } from 'react'
import { Search, Sparkles, Check, X } from 'lucide-react'
import { getGroupedFeatures } from '../api/propertyFeatureApi'

export default function PropertyFeaturesFormSection({ selectedFeatureIds = [], onChange, disabled = false }) {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchText, setSearchText] = useState('')
  const [activeTab, setActiveTab] = useState('popular')

  useEffect(() => {
    let isMounted = true
    getGroupedFeatures()
      .then((res) => {
        if (isMounted && res.success) {
          setCategories(res.data || [])
        }
      })
      .catch((err) => {
        console.error('Failed to load property features:', err)
      })
      .finally(() => {
        if (isMounted) setLoading(false)
      })
    return () => {
      isMounted = false
    }
  }, [])

  const handleToggleFeature = (featureId) => {
    if (disabled) return
    const next = selectedFeatureIds.includes(featureId)
      ? selectedFeatureIds.filter((id) => id !== featureId)
      : [...selectedFeatureIds, featureId]
    onChange(next)
  }

  const popularFeatures = useMemo(() => {
    return categories.flatMap((cat) => cat.features.filter((f) => f.is_popular))
  }, [categories])

  const tabs = useMemo(() => {
    const t = []
    if (popularFeatures.length > 0) {
      t.push({ id: 'popular', label: 'Popular' })
    }
    categories.forEach((cat) => {
      t.push({ id: cat.id, label: cat.name })
    })
    return t
  }, [categories, popularFeatures])

  useEffect(() => {
    if (!loading && tabs.length > 0 && !tabs.find((t) => t.id === activeTab)) {
      setActiveTab(tabs[0].id)
    }
  }, [tabs, activeTab, loading])
  
  const searchResults = useMemo(() => {
    if (!searchText.trim()) return null
    const query = searchText.toLowerCase()
    const allFeatures = categories.flatMap(cat => cat.features)
    // deduplicate since popular features also exist in their categories
    const uniqueFeatures = Array.from(new Map(allFeatures.map(f => [f.id, f])).values())
    return uniqueFeatures.filter(f => f.name.toLowerCase().includes(query))
  }, [searchText, categories])

  const displayedFeatures = useMemo(() => {
    if (searchResults) return searchResults
    if (activeTab === 'popular') return popularFeatures
    const cat = categories.find(c => c.id === activeTab)
    return cat ? cat.features : []
  }, [activeTab, popularFeatures, categories, searchResults])

  if (loading) {
    return (
      <div className="space-y-4 py-6 px-5 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#202020]">
        <div className="flex justify-between items-center">
           <div className="h-5 bg-neutral-200 dark:bg-neutral-800 rounded w-1/4 animate-pulse" />
           <div className="h-6 w-20 bg-neutral-200 dark:bg-neutral-800 rounded-full animate-pulse" />
        </div>
        <div className="h-10 w-full bg-neutral-100 dark:bg-neutral-850 rounded-xl animate-pulse mt-2" />
        <div className="flex gap-2 mt-4">
           {[1, 2, 3].map(i => <div key={i} className="h-8 w-24 bg-neutral-200 dark:bg-neutral-800 rounded-full animate-pulse" />)}
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mt-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-16 bg-neutral-100 dark:bg-neutral-850 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  if (categories.length === 0) return null

  return (
    <div className="space-y-5 rounded-2xl border border-neutral-200 dark:border-[#2a2a2a] bg-white dark:bg-[#1e1e1e] p-5 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-brand-bronze">
          <Sparkles className="h-5 w-5" />
          <h2 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
            Property features
          </h2>
        </div>
        <div className="rounded-full bg-brand-bronze/10 px-3 py-1 text-xs font-semibold text-brand-bronze dark:bg-[#3d2a25] dark:text-[#f8b4a6]">
          {selectedFeatureIds.length} selected
        </div>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
        <input
          type="text"
          placeholder="Search features across all categories"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          disabled={disabled}
          className="w-full rounded-xl border border-neutral-200 dark:border-[#2a2a2a] bg-transparent py-2.5 pl-10 pr-4 text-sm text-neutral-900 dark:text-neutral-100 placeholder-neutral-500 focus:border-brand-bronze focus:outline-none focus:ring-1 focus:ring-brand-bronze transition-colors"
        />
      </div>

      {/* Selected features chips */}
      <div className="min-h-[24px]">
        {selectedFeatureIds.length === 0 ? (
          <div className="text-sm font-medium text-neutral-500 dark:text-[#888888]">
            No features selected yet
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {selectedFeatureIds.map(id => {
              const allFeatures = categories.flatMap(cat => cat.features)
              const feat = allFeatures.find(f => f.id === id)
              if (!feat) return null
              return (
                <span key={id} className="inline-flex items-center gap-1.5 rounded-full bg-[#E35A3E]/10 border border-[#E35A3E]/30 px-3 py-1 text-xs font-semibold text-[#E35A3E]">
                  {feat.name}
                  <button type="button" disabled={disabled} onClick={() => handleToggleFeature(id)} className="rounded-full p-0.5 hover:bg-[#E35A3E]/20 transition-colors">
                    <X className="h-3.5 w-3.5" />
                  </button>
                </span>
              )
            })}
          </div>
        )}
      </div>

      {/* Tabs */}
      {!searchText.trim() && (
        <div className="flex flex-wrap gap-2 pt-1 border-b border-neutral-100 dark:border-[#2a2a2a] pb-4">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`rounded-full px-5 py-1.5 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-[#E35A3E] text-white border border-[#E35A3E]' // Active Tab color matches mockup
                    : 'bg-transparent text-neutral-600 dark:text-[#b0b0b0] border border-neutral-200 dark:border-[#333] hover:bg-neutral-50 dark:hover:bg-[#2a2a2a]'
                }`}
              >
                {tab.label}
              </button>
            )
          })}
        </div>
      )}

      {/* Features Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 pt-2">
        {displayedFeatures.map((feat) => {
          const checked = selectedFeatureIds.includes(feat.id)
          return (
            <button
              key={feat.id}
              type="button"
              disabled={disabled}
              onClick={() => handleToggleFeature(feat.id)}
              className={`relative flex items-center gap-3 rounded-xl border p-4 text-sm font-medium transition-all text-left min-h-[60px] overflow-hidden ${
                checked
                  ? 'border-[#E35A3E] bg-[#E35A3E]/5 text-neutral-900 dark:text-white shadow-[0_0_0_1px_#E35A3E]'
                  : 'border-neutral-200 dark:border-[#333] text-neutral-700 dark:text-[#f0f0f0] hover:border-[#E35A3E]/50 hover:bg-neutral-50 dark:hover:bg-[#252525]'
              }`}
            >
              <span className="line-clamp-2 leading-tight relative z-10">{feat.name}</span>
              {checked && (
                <div className="absolute top-0 right-0 h-0 w-0 border-t-[26px] border-l-[26px] border-t-[#E35A3E] border-l-transparent">
                  <Check className="absolute -top-[23px] -left-[12px] h-3 w-3 stroke-[4] text-white" />
                </div>
              )}
            </button>
          )
        })}
        {displayedFeatures.length === 0 && (
          <div className="col-span-full py-6 text-center text-sm text-neutral-500">
            No features found.
          </div>
        )}
      </div>
    </div>
  )
}

