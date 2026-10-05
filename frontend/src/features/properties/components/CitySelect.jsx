import React, { useCallback } from 'react'
import AsyncSelect from 'react-select/async'
import { useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import { getApiOrigin } from '@/shared/config/api'

// Simple debounce helper
const debounce = (func, delay) => {
  let timer
  return (...args) => {
    clearTimeout(timer)
    timer = setTimeout(() => func(...args), delay)
  }
}

export default function CitySelect({ value, onChange, placeholder = 'Enter city name' }) {
  const queryClient = useQueryClient()

  // React Query cached fetcher
  const loadOptions = useCallback(
    (inputValue, callback) => {
      // Backend expects q length >= 3
      if (inputValue.trim().length < 3) {
        callback([])
        return
      }

      const keyword = inputValue.trim()

      queryClient
        .fetchQuery({
          queryKey: ['cities-search', keyword],
          queryFn: async () => {
            const res = await axios.get(`${getApiOrigin()}/api/cities/search?q=${keyword}`)
            return res.data.map((item) => ({
              value: item.city,
              label: `${item.city}, ${item.state}`,
              city: item.city,
              state: item.state,
            }))
          },
          staleTime: 5 * 60 * 1000, // Cache for 5 minutes
        })
        .then((data) => callback(data))
        .catch(() => callback([]))
    },
    [queryClient]
  )

  // Debouncing loadOptions (300ms)
  const debouncedLoadOptions = useCallback(
    debounce((inputValue, callback) => {
      loadOptions(inputValue, callback)
    }, 300),
    [loadOptions]
  )

  // Format value for react-select from simple string
  const getSelectValue = () => {
    if (!value) return null
    return { value, label: value }
  }

  return (
    <div className="w-full select-container">
      <AsyncSelect
        loadOptions={debouncedLoadOptions}
        value={getSelectValue()}
        onChange={(option) => onChange(option ? option.value : '')}
        placeholder={placeholder}
        isClearable
        cacheOptions
        unstyled
        classNames={{
          control: () => 'bg-transparent border-none text-neutral-900 dark:text-white text-sm font-semibold p-0 cursor-pointer min-h-0 flex items-center',
          placeholder: () => 'text-neutral-400 dark:text-neutral-500 font-semibold text-sm',
          input: () => 'text-neutral-900 dark:text-white text-sm font-semibold outline-none',
          singleValue: () => 'text-neutral-900 dark:text-white text-sm font-semibold',
          menu: () => 'bg-white dark:bg-neutral-950 border border-neutral-250 dark:border-neutral-800 rounded-2xl shadow-xl mt-2 w-[280px] p-2 z-50',
          menuList: () => 'flex flex-col gap-1',
          noOptionsMessage: () => 'text-xs text-neutral-400 p-2 font-medium text-center',
          loadingMessage: () => 'text-xs text-neutral-400 p-2 font-medium text-center',
          option: ({ isFocused, isSelected }) =>
            `px-3 py-2 text-xs font-semibold rounded-xl cursor-pointer transition-colors ${
              isSelected
                ? 'bg-brand-terracotta text-white'
                : isFocused
                  ? 'bg-neutral-50 dark:bg-neutral-900 text-neutral-800 dark:text-neutral-200'
                  : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-900/60'
            }`,
          valueContainer: () => 'flex items-center gap-1 flex-1 min-w-0',
          indicatorsContainer: () => 'flex items-center gap-1',
          clearIndicator: () => 'text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 cursor-pointer p-0.5',
        }}
      />
    </div>
  )
}
