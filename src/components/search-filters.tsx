'use client';

import { useState, useEffect } from 'react';
import { PokemonFilters } from '@/types/api';
import { usePokemonTypes } from '@/hooks/use-pokemon';
import { cn, capitalizeFirst } from '@/lib/utils';

interface SearchFiltersProps {
  onFiltersChange: (filters: PokemonFilters) => void;
  initialFilters: PokemonFilters;
  onClearFilters: () => void;
  onApplyFilters: () => void;
  className?: string;
}

export function SearchFilters({ onFiltersChange, initialFilters, onClearFilters, onApplyFilters, className }: SearchFiltersProps) {
  const [filters, setFilters] = useState<PokemonFilters>(initialFilters);
  const [isExpanded, setIsExpanded] = useState(false);
  const [hasActiveFilters, setHasActiveFilters] = useState(false);
  const [filterErrors, setFilterErrors] = useState<Record<string, string>>({});

  // Sync local filters with initial filters
  useEffect(() => {
    setFilters(initialFilters);
  }, [initialFilters]);

  // Validate filter combinations
  useEffect(() => {
    const newFilters = { ...filters };
    let hasChanges = false;

    // Ensure min values are not greater than max values
    if (newFilters.minHeight && newFilters.maxHeight && newFilters.minHeight > newFilters.maxHeight) {
      newFilters.minHeight = newFilters.maxHeight;
      hasChanges = true;
    }

    if (newFilters.minWeight && newFilters.maxWeight && newFilters.minWeight > newFilters.maxWeight) {
      newFilters.minWeight = newFilters.maxWeight;
      hasChanges = true;
    }

    // Ensure values are within reasonable bounds
    if (newFilters.minHeight && newFilters.minHeight < 0) {
      newFilters.minHeight = 0;
      hasChanges = true;
    }

    if (newFilters.maxHeight && newFilters.maxHeight > 100) {
      newFilters.maxHeight = 100;
      hasChanges = true;
    }

    if (newFilters.minWeight && newFilters.minWeight < 0) {
      newFilters.minWeight = 0;
      hasChanges = true;
    }

    if (newFilters.maxWeight && newFilters.maxWeight > 10000) {
      newFilters.maxWeight = 10000;
      hasChanges = true;
    }

    if (hasChanges) {
      setFilters(newFilters);
    }
  }, [filters.minHeight, filters.maxHeight, filters.minWeight, filters.maxWeight]);
  
  const { data: pokemonTypes = [] } = usePokemonTypes();

  useEffect(() => {
    const activeFilters = Object.values(filters).filter(value => value && value !== '').length;
    setHasActiveFilters(activeFilters > 0);
  }, [filters]);

  // Debounced filter application for search input only
  useEffect(() => {
    // Handle empty/cleared search immediately
    if (!filters.name || filters.name.trim() === '') {
      if (initialFilters.name) {
        // Search was cleared, apply immediately
        console.log('🔍 Search cleared via useEffect - showing all Resources');
        const clearedFilters = { ...filters, name: undefined };
        onFiltersChange(clearedFilters);
        onApplyFilters();
        
        // Clear URL parameters when search is cleared
        clearURLParams();
      }
      return;
    }
    
    // Debounce non-empty search queries
    const timeoutId = setTimeout(() => {
      // Only auto-apply if search actually changed and has content
      if (filters.name && filters.name.trim() !== '' && filters.name !== initialFilters.name) {
        console.log('🔍 Applying debounced search:', filters.name);
        onFiltersChange(filters);
        onApplyFilters();
      }
    }, 800);

    return () => clearTimeout(timeoutId);
  }, [filters.name, onFiltersChange, onApplyFilters, initialFilters.name, filters]);

  const handleFilterChange = (key: keyof PokemonFilters, value: string) => {
    // Normalize the value - trim whitespace and handle empty strings
    const normalizedValue = value.trim();
    const filterValue = normalizedValue === '' ? undefined : normalizedValue;
    
    const newFilters = {
      ...filters,
      [key]: filterValue,
    };
    
    setFilters(newFilters);

    // Handle immediate search clearing for all edge cases
    if (key === 'name') {
      // Check if search is being cleared (empty, whitespace, or undefined)
      if (!value || value.trim() === '') {
        console.log('🔍 Immediate search clear - showing all Resources');
        const clearedFilters = { ...newFilters, name: undefined };
        onFiltersChange(clearedFilters);
        onApplyFilters();
        
        // Clear URL parameters when search is cleared
        clearURLParams();
      }
    }
  };

  const handleNumberFilterChange = (key: keyof PokemonFilters, value: string) => {
    // Handle empty string and invalid numbers
    const trimmedValue = value.trim();
    let numValue: number | undefined = undefined;
    let error = '';
    
    if (trimmedValue !== '') {
      const parsed = parseFloat(trimmedValue);
      
      if (isNaN(parsed)) {
        error = 'Please enter a valid number';
      } else if (parsed < 0) {
        error = 'Value must be positive';
      } else {
        // Validate bounds based on filter type
        if (key === 'minHeight' || key === 'maxHeight') {
          if (parsed > 100) {
            error = 'Height must be less than 100m';
          } else {
            numValue = parsed;
          }
        } else if (key === 'minWeight' || key === 'maxWeight') {
          if (parsed > 10000) {
            error = 'Weight must be less than 10,000kg';
          } else {
            numValue = parsed;
          }
        } else {
          numValue = parsed;
        }
      }
    }
    
    // Update filters and errors
    setFilters(prev => ({
      ...prev,
      [key]: numValue,
    }));
    
    setFilterErrors(prev => ({
      ...prev,
      [key]: error,
    }));
  };

  const handleClearFilters = () => {
    setFilters({});
    setFilterErrors({}); // Clear all error messages
    onClearFilters();
    // Also trigger apply to refresh the list
    setTimeout(() => {
      onApplyFilters();
    }, 100);
    
    // Clear URL parameters when all filters are cleared
    clearURLParams();
  };

  // Function to clear URL parameters
  const clearURLParams = () => {
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.search = '';
      window.history.replaceState({}, '', url.toString());
    }
  };

  const handleApplyFilters = () => {
    onFiltersChange(filters);
    onApplyFilters();
  };

  // Handle keyboard events for search input
  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const searchValue = (e.target as HTMLInputElement).value.trim();
      
      if (searchValue === '') {
        // Enter pressed on empty search - clear and show all
        console.log('🔍 Enter pressed on empty search - showing all Resources');
        const clearedFilters = { ...filters, name: undefined };
        onFiltersChange(clearedFilters);
        onApplyFilters();
        clearURLParams();
      } else {
        // Enter pressed with search text - apply immediately
        console.log('🔍 Enter pressed - applying search immediately:', searchValue);
        const updatedFilters = { ...filters, name: searchValue };
        onFiltersChange(updatedFilters);
        onApplyFilters();
      }
    }
    
    if (e.key === 'Escape') {
      // Escape key - clear search
      console.log('🔍 Escape pressed - clearing search');
      const clearedFilters = { ...filters, name: undefined };
      setFilters(clearedFilters);
      onFiltersChange(clearedFilters);
      onApplyFilters();
      clearURLParams();
    }
  };

  return (
    <div className={cn('bg-gradient-to-r from-primary-50 to-secondary-50 dark:from-dark-800 dark:to-dark-700 rounded-2xl shadow-lg border border-primary-200/50 dark:border-dark-600/50 p-6', className)}>
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
                         <input
               type="text"
               placeholder="Search Resources..."
               value={filters.name || ''}
               onChange={(e) => handleFilterChange('name', e.target.value)}
               onKeyDown={handleSearchKeyDown}
               className="w-full pl-10 pr-4 py-3 input-field placeholder-gray-500 dark:placeholder-gray-400"
             />
          </div>
          
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-2 px-5 py-3 text-sm font-medium text-primary-700 dark:text-primary-400 bg-glass border border-primary-200 dark:border-primary-600/30 rounded-xl hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all duration-200 shadow-sm"
          >
            <svg className={cn('w-4 h-4 transition-transform duration-200', isExpanded && 'rotate-180')} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
            {isExpanded ? 'Hide' : 'Show'} Filters
          </button>
          
                               {hasActiveFilters && (
            <>
              <div className="flex items-center gap-2 px-3 py-1 text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-600/30 rounded-lg">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.207A1 1 0 013 6.5V4z" />
                </svg>
                {Object.values(filters).filter(v => v && v !== '').length} active
              </div>
              <button
                onClick={handleApplyFilters}
                className="flex items-center gap-2 px-5 py-3 text-sm font-medium text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-600/30 rounded-xl hover:bg-green-100 dark:hover:bg-green-900/30 transition-all duration-200 shadow-sm"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.207A1 1 0 013 6.5V4z" />
                </svg>
                Apply
              </button>
              <button
                onClick={handleClearFilters}
                className="flex items-center gap-2 px-5 py-3 text-sm font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-600/30 rounded-xl hover:bg-red-100 dark:hover:bg-red-900/30 transition-all duration-200 shadow-sm"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Clear All
              </button>
            </>
          )}
        </div>

        {isExpanded && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pt-4 border-t border-primary-200/50 dark:border-primary-600/30">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                Type
              </label>
              <select
                value={filters.type || ''}
                onChange={(e) => handleFilterChange('type', e.target.value)}
                className="w-full px-4 py-3 input-field"
              >
                <option value="">All Types</option>
                {pokemonTypes.map((type) => (
                  <option key={type} value={type}>
                    {capitalizeFirst(type)}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                Generation
              </label>
              <select
                value={filters.generation || ''}
                onChange={(e) => handleFilterChange('generation', e.target.value)}
                className="w-full px-4 py-3 input-field"
              >
                <option value="">All Generations</option>
                <option value="1">Generation I (Kanto)</option>
                <option value="2">Generation II (Johto)</option>
                <option value="3">Generation III (Hoenn)</option>
                <option value="4">Generation IV (Sinnoh)</option>
                <option value="5">Generation V (Unova)</option>
                <option value="6">Generation VI (Kalos)</option>
                <option value="7">Generation VII (Alola)</option>
                <option value="8">Generation VIII (Galar)</option>
              </select>
            </div>

                         <div className="space-y-2">
               <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                 Min Height (m)
               </label>
               <input
                 type="number"
                 step="0.1"
                 placeholder="0.1"
                 value={filters.minHeight || ''}
                 onChange={(e) => handleNumberFilterChange('minHeight', e.target.value)}
                 className={cn(
                   "w-full px-4 py-3 input-field",
                   filterErrors.minHeight && "border-red-300 dark:border-red-600"
                 )}
               />
               {filterErrors.minHeight && (
                 <p className="text-xs text-red-500 dark:text-red-400">{filterErrors.minHeight}</p>
               )}
             </div>

                         <div className="space-y-2">
               <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                 Max Height (m)
               </label>
               <input
                 type="number"
                 step="0.1"
                 placeholder="10.0"
                 value={filters.maxHeight || ''}
                 onChange={(e) => handleNumberFilterChange('maxHeight', e.target.value)}
                 className={cn(
                   "w-full px-4 py-3 input-field",
                   filterErrors.maxHeight && "border-red-300 dark:border-red-600"
                 )}
               />
               {filterErrors.maxHeight && (
                 <p className="text-xs text-red-500 dark:text-red-400">{filterErrors.maxHeight}</p>
               )}
             </div>

                         <div className="space-y-2">
               <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                 Min Weight (kg)
               </label>
               <input
                 type="number"
                 step="0.1"
                 placeholder="0.1"
                 value={filters.minWeight || ''}
                 onChange={(e) => handleNumberFilterChange('minWeight', e.target.value)}
                 className={cn(
                   "w-full px-4 py-3 input-field",
                   filterErrors.minWeight && "border-red-300 dark:border-red-600"
                 )}
               />
               {filterErrors.minWeight && (
                 <p className="text-xs text-red-500 dark:text-red-400">{filterErrors.minWeight}</p>
               )}
             </div>

                         <div className="space-y-2">
               <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                 Max Weight (kg)
               </label>
               <input
                 type="number"
                 step="0.1"
                 placeholder="1000.0"
                 value={filters.maxWeight || ''}
                 onChange={(e) => handleNumberFilterChange('maxWeight', e.target.value)}
                 className={cn(
                   "w-full px-4 py-3 input-field",
                   filterErrors.maxWeight && "border-red-300 dark:border-red-600"
                 )}
               />
               {filterErrors.maxWeight && (
                 <p className="text-xs text-red-500 dark:text-red-400">{filterErrors.maxWeight}</p>
               )}
             </div>
          </div>
        )}
      </div>
    </div>
  );
}
