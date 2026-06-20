import React, { useCallback, useRef } from 'react';
import AsyncCreatableSelect from 'react-select/async-creatable';

export default function LocationSelect({
  value,
  onChange,
  loadOptions,
  placeholder,
  isDisabled,
  error,
}) {
  const timeoutRef = useRef(null);

  // Debounced load options
  const debouncedLoadOptions = useCallback(
    (inputValue, callback) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        loadOptions(inputValue)
          .then((options) => {
            callback(options);
          })
          .catch((err) => {
            console.error('Error loading options:', err);
            callback([]);
          });
      }, 300); // 300ms debounce delay
    },
    [loadOptions]
  );

  const selectValue = value ? { value, label: value } : null;

  return (
    <div className="w-full">
      <AsyncCreatableSelect
        cacheOptions
        defaultOptions
        value={selectValue}
        onChange={(newValue) => {
          onChange(newValue ? newValue.value : '');
        }}
        loadOptions={debouncedLoadOptions}
        placeholder={placeholder}
        isDisabled={isDisabled}
        isClearable
        unstyled
        menuPortalTarget={typeof window !== 'undefined' ? document.body : null}
        styles={{
          menuPortal: (base) => ({ ...base, zIndex: 9999 }),
        }}
        classNames={{
          control: ({ isFocused }) =>
            `flex h-11 w-full rounded-xl border bg-white/70 dark:bg-neutral-950 px-3 text-sm transition-all items-center ${
              isFocused
                ? 'border-brand-bronze/50 ring-1 ring-brand-bronze/20'
                : error
                  ? 'border-destructive ring-1 ring-destructive'
                  : 'border-neutral-200 dark:border-neutral-800 focus-within:border-brand-bronze/50'
            }`,
          valueContainer: () => 'flex items-center gap-1 overflow-hidden',
          indicatorsContainer: () => 'flex items-center gap-1',
          clearIndicator: () => 'text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 cursor-pointer p-1',
          dropdownIndicator: () => 'text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 cursor-pointer p-1',
          menu: () => 'mt-2 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 shadow-lg text-neutral-850 dark:text-neutral-200 overflow-hidden',
          option: ({ isFocused, isSelected }) =>
            `px-4 py-2 text-sm cursor-pointer transition-colors ${
              isSelected
                ? 'bg-brand-bronze text-white'
                : isFocused
                  ? 'bg-brand-bronze/10 text-neutral-900 dark:text-neutral-100'
                  : 'text-neutral-700 dark:text-neutral-300'
            }`,
          singleValue: () => 'text-neutral-900 dark:text-neutral-100',
          input: () => 'text-neutral-900 dark:text-neutral-100',
          placeholder: () => 'text-neutral-400',
          loadingMessage: () => 'px-4 py-2 text-sm text-neutral-400',
          noOptionsMessage: () => 'px-4 py-2 text-sm text-neutral-400',
        }}
        noOptionsMessage={({ inputValue }) =>
          !inputValue ? 'Type to search...' : 'No options found. Type to create new.'
        }
        formatCreateLabel={(inputValue) => `Use custom: "${inputValue}"`}
      />
    </div>
  );
}
