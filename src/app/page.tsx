'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { usePokemon } from '@/contexts/pokemon-context';
import { sortPokemon } from '@/lib/utils';
import { SearchFilters } from '@/components/search-filters';
import { PokemonCard } from '@/components/pokemon-card';
import { ThemeToggle } from '@/components/theme-toggle';
import { useInfiniteScroll } from '@/hooks/use-infinite-scroll';
import { PokemonFilters } from '@/types/api';

function ResourceExplorer() {
  const searchParams = useSearchParams();
  const { state, fetchPokemonList, setFilters, setSort, setPage, getCacheStats, loadNextPage, clearPokemonList } = usePokemon();
  const [showFavorites, setShowFavorites] = useState(false);
  const [showCacheStats, setShowCacheStats] = useState(false);

  // Infinite scroll hook
  const { lastElementRef } = useInfiniteScroll({
    loading: state.loading,
    hasMore: state.hasMore,
    onLoadMore: loadNextPage,
    threshold: 0.1
  });

  // Sync URL with state
  useEffect(() => {
    const params = new URLSearchParams();
    
    // Add page parameter
    if (state.currentPage > 1) {
      params.set('page', state.currentPage.toString());
    }
    
    // Add filter parameters
    if (state.filters.name) {
      params.set('name', state.filters.name);
    }
    if (state.filters.type) {
      params.set('type', state.filters.type);
    }
    if (state.filters.minHeight) {
      params.set('minHeight', state.filters.minHeight.toString());
    }
    if (state.filters.maxHeight) {
      params.set('maxHeight', state.filters.maxHeight.toString());
    }
    if (state.filters.minWeight) {
      params.set('minWeight', state.filters.minWeight.toString());
    }
    if (state.filters.maxWeight) {
      params.set('maxWeight', state.filters.maxWeight.toString());
    }
    
    // Add sort parameters
    if (state.sortConfig.field !== 'name' || state.sortConfig.direction !== 'asc') {
      params.set('sort', `${state.sortConfig.field}-${state.sortConfig.direction}`);
    }
    
    // Update URL without triggering navigation
    const newUrl = params.toString() ? `?${params.toString()}` : '';
    window.history.replaceState({}, '', newUrl);
  }, [state.currentPage, state.filters, state.sortConfig]);

  // Load state from URL on mount
  useEffect(() => {
    const page = searchParams.get('page');
    const name = searchParams.get('name');
    const type = searchParams.get('type');
    const minHeight = searchParams.get('minHeight');
    const maxHeight = searchParams.get('maxHeight');
    const minWeight = searchParams.get('minWeight');
    const maxWeight = searchParams.get('maxWeight');
    const sort = searchParams.get('sort');
    
    // Set filters from URL
    const filters: PokemonFilters = {};
    if (name) filters.name = name;
    if (type) filters.type = type;
    if (minHeight) filters.minHeight = parseInt(minHeight);
    if (maxHeight) filters.maxHeight = parseInt(maxHeight);
    if (minWeight) filters.minWeight = parseInt(minWeight);
    if (maxWeight) filters.maxWeight = parseInt(maxWeight);
    
    if (Object.keys(filters).length > 0) {
      setFilters(filters);
    }
    
    // Set sort from URL
    if (sort) {
      const [field, direction] = sort.split('-');
      setSort({ field: field as 'name' | 'id' | 'height' | 'weight', direction: direction as 'asc' | 'desc' });
    }
    
    // Set page from URL
    if (page) {
      setPage(parseInt(page));
    }
  }, [searchParams, setFilters, setSort, setPage]); // Added missing dependencies

  // Load initial data on mount only
  useEffect(() => {
    if (state.pokemonList.length === 0 && !state.loading) {
      console.log('🚀 Loading initial data');
      fetchPokemonList(1, state.filters, false);
    }
  }, [fetchPokemonList, state.filters, state.loading, state.pokemonList.length]); // Added missing dependencies

  const sortedPokemon = sortPokemon(state.pokemonList, state.sortConfig);
  const displayPokemon = showFavorites ? state.favorites : sortedPokemon;
  




  return (
    <div className="min-h-screen bg-gradient-primary">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="flex justify-between items-center mb-4">
            <button
              onClick={() => setShowCacheStats(!showCacheStats)}
              className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 transition-colors"
            >
              Cache Stats
            </button>
            <ThemeToggle />
          </div>
          <div className="relative inline-block">
            <h1 className="text-6xl font-black text-gradient mb-4">
              Resource Explorer
            </h1>
            <div className="absolute -inset-1 bg-gradient-to-r from-primary-600 via-secondary-600 to-pink-600 rounded-lg blur opacity-20"></div>
          </div>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Discover and explore the amazing world of Pokémon with detailed stats, abilities, and more
          </p>
          
          {/* Cache Stats */}
          {showCacheStats && (
            <div className="mt-4 p-4 bg-glass rounded-xl max-w-md mx-auto">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                <div className="flex justify-between">
                  <span>Cached Resources:</span>
                  <span className="font-semibold">{getCacheStats().pokemonCount}</span>
                </div>
                <div className="flex justify-between">
                  <span>Cached Pages:</span>
                  <span className="font-semibold">{getCacheStats().pageCount}</span>
                </div>
                <div className="flex justify-between">
                  <span>Current Page:</span>
                  <span className="font-semibold">{state.currentPage}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Search and Filters */}
        <div className="mb-8">
          <SearchFilters 
            onFiltersChange={setFilters}
            initialFilters={state.filters}
            onClearFilters={() => {
              console.log('🔄 Clearing all filters and URL params');
              setFilters({});
              clearPokemonList();
              fetchPokemonList(1, {}, false);
              
              // Clear URL parameters
              const url = new URL(window.location.href);
              url.search = '';
              window.history.replaceState({}, '', url.toString());
            }}
            onApplyFilters={() => {
              clearPokemonList();
              fetchPokemonList(1, state.filters, false);
            }}
          />
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowFavorites(!showFavorites)}
              className={cn(
                'flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl',
                showFavorites
                  ? 'btn-primary bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600'
                  : 'btn-secondary'
              )}
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              {showFavorites ? 'Show All Pokémon' : `Favorites (${state.favorites.length})`}
            </button>
          </div>

          {!showFavorites && (
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Sort by:</span>
              <select
                value={`${state.sortConfig.field}-${state.sortConfig.direction}`}
                onChange={(e) => {
                  const [field, direction] = e.target.value.split('-') as [string, 'asc' | 'desc'];
                  setSort({ field: field as 'name' | 'id' | 'height' | 'weight', direction });
                }}
                className="input-field text-sm"
              >
                <option value="name-asc">Name (A-Z)</option>
                <option value="name-desc">Name (Z-A)</option>
                <option value="id-asc">ID (Low to High)</option>
                <option value="id-desc">ID (High to Low)</option>
                <option value="height-asc">Height (Short to Tall)</option>
                <option value="height-desc">Height (Tall to Short)</option>
                <option value="weight-asc">Weight (Light to Heavy)</option>
                <option value="weight-desc">Weight (Heavy to Light)</option>
              </select>
            </div>
          )}
        </div>

        {/* Error State */}
        {state.error && (
          <div className="bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-2xl p-6 mb-8 dark:from-red-900/20 dark:to-pink-900/20 dark:border-red-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="bg-red-100 rounded-full p-2 mr-4 dark:bg-red-900/30">
                  <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-red-900 dark:text-red-100">Error loading Pokémon</h3>
                  <p className="text-red-700 dark:text-red-300">{state.error}</p>
                </div>
              </div>
              <button
                onClick={() => fetchPokemonList(state.currentPage, state.filters)}
                className="px-4 py-2 bg-red-100 text-red-700 rounded-xl hover:bg-red-200 transition-colors font-medium dark:bg-red-900/30 dark:text-red-300 dark:hover:bg-red-900/50"
              >
                Retry
              </button>
            </div>
          </div>
        )}

        {/* Loading State */}
        {state.loading && state.pokemonList.length === 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 12 }).map((_, i) => (
              <div 
                key={i} 
                className="card animate-pulse"
                style={{ animationDelay: `${i * 50}ms` }}
              >
                <div className="h-48 bg-gradient-to-br from-gray-200 to-gray-300 rounded-t-2xl dark:from-dark-600 dark:to-dark-700" />
                <div className="p-5 space-y-3">
                  <div className="h-6 bg-gray-200 rounded-lg w-3/4 dark:bg-dark-600" />
                  <div className="flex gap-2">
                    <div className="h-6 bg-gray-200 rounded-full w-16 dark:bg-dark-600" />
                    <div className="h-6 bg-gray-200 rounded-full w-20 dark:bg-dark-600" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="h-4 bg-gray-200 rounded dark:bg-dark-600" />
                    <div className="h-4 bg-gray-200 rounded dark:bg-dark-600" />
                  </div>
                  <div className="pt-2 border-t border-gray-100 dark:border-dark-600">
                    <div className="flex items-center justify-between">
                      <div className="h-4 bg-gray-200 rounded w-24 dark:bg-dark-600" />
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-2 bg-gray-200 rounded-full dark:bg-dark-600" />
                        <div className="h-4 bg-gray-200 rounded w-8 dark:bg-dark-600" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <>
            {/* Empty State */}
            {displayPokemon.length === 0 ? (
              <div className="text-center py-16">
                <div className="relative inline-block mb-6">
                  <div className="w-24 h-24 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full flex items-center justify-center mx-auto">
                    <svg className="w-12 h-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">No Pokémon found</h3>
                <p className="text-gray-600 text-lg max-w-md mx-auto">
                  {showFavorites 
                    ? 'You haven\'t added any Pokémon to your favorites yet. Start exploring!' 
                    : 'Try adjusting your search criteria or filters to find more Pokémon.'
                  }
                </p>
              </div>
            ) : (
              <>
                        {/* Resource Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
          {displayPokemon.map((pokemon, index) => (
            <div
              key={pokemon.id}
              ref={index === displayPokemon.length - 1 ? lastElementRef : undefined}
            >
              <PokemonCard pokemon={pokemon} />
            </div>
          ))}
          
          {/* Smooth skeleton loading animation for infinite scroll */}
          {state.loading && state.pokemonList.length > 0 && (
            <>
              {Array.from({ length: 8 }).map((_, i) => (
                <div 
                  key={`skeleton-${i}`} 
                  className="card animate-pulse"
                  style={{ animationDelay: `${i * 100}ms` }}
                >
                  <div className="h-48 bg-gradient-to-br from-gray-200 to-gray-300 rounded-t-2xl dark:from-dark-600 dark:to-dark-700"></div>
                  <div className="p-5 space-y-3">
                    <div className="h-6 bg-gray-200 rounded-lg w-3/4 dark:bg-dark-600"></div>
                    <div className="flex gap-2">
                      <div className="h-6 bg-gray-200 rounded-full w-16 dark:bg-dark-600"></div>
                      <div className="h-6 bg-gray-200 rounded-full w-20 dark:bg-dark-600"></div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="h-4 bg-gray-200 rounded dark:bg-dark-600"></div>
                      <div className="h-4 bg-gray-200 rounded dark:bg-dark-600"></div>
                    </div>
                    <div className="pt-2 border-t border-gray-100 dark:border-dark-600">
                      <div className="flex items-center justify-between">
                        <div className="h-4 bg-gray-200 rounded w-24 dark:bg-dark-600"></div>
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-2 bg-gray-200 rounded-full dark:bg-dark-600"></div>
                          <div className="h-4 bg-gray-200 rounded w-8 dark:bg-dark-600"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>

        {/* Initial Load Button */}
        {state.pokemonList.length === 0 && !state.loading && (
          <div className="text-center py-12">
            <button
              onClick={() => fetchPokemonList(1, state.filters, false)}
              className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-primary-500 to-secondary-600 text-white font-semibold rounded-xl hover:from-primary-600 hover:to-secondary-700 transform hover:scale-105 transition-all duration-200 shadow-lg"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span>Load Resources</span>
            </button>
          </div>
        )}

        {/* Loading State */}
        {state.loading && state.pokemonList.length === 0 && (
          <div className="text-center py-12">
            <div className="inline-flex items-center gap-3 px-6 py-3 bg-glass rounded-xl">
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-primary-200 border-t-primary-600"></div>
              <span className="text-gray-700 dark:text-gray-300 font-medium">
                Loading Resources...
              </span>
            </div>
          </div>
        )}

        {/* Resource count indicator */}
        {displayPokemon.length > 0 && (
          <div className="text-center py-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Showing {displayPokemon.length} of {state.totalCount} Resources
            </p>
          </div>
        )}

        {/* End of results indicator */}
        {!state.hasMore && !showFavorites && displayPokemon.length > 0 && (
          <div className="text-center py-8">
            <div className="inline-flex items-center gap-3 px-6 py-3 bg-glass rounded-xl">
              <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-gray-700 dark:text-gray-300 font-medium">
                You&apos;ve seen all {state.totalCount} Resources! 🎉
              </span>
            </div>
          </div>
        )}


              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-primary flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary-200 border-t-primary-600 mx-auto mb-4"></div>
            <div className="absolute inset-0 rounded-full border-4 border-secondary-200 border-t-secondary-600 animate-spin animate-delay-150"></div>
          </div>
          <p className="text-xl font-semibold text-gray-700">Loading Resource Explorer...</p>
        </div>
      </div>
    }>
      <ResourceExplorer />
    </Suspense>
  );
}

function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}
