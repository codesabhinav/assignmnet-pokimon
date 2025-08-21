'use client';

import { createContext, useContext, useReducer, useEffect } from 'react';
import { Pokemon, PokemonFilters, SortConfig } from '@/types/api';
import { pokemonApi } from '@/lib/api';

interface PokemonState {
  pokemonList: Pokemon[];
  favorites: Pokemon[];
  cache: Record<string, Pokemon>;
  pageCache: Record<string, Pokemon[]>; // Cache for paginated results
  loading: boolean;
  error: string | null;
  filters: PokemonFilters;
  sortConfig: SortConfig;
  currentPage: number;
  totalPages: number;
  hasMore: boolean; // For infinite scroll
  totalCount: number; // Total available Pokemon
}

type PokemonAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_POKEMON_LIST'; payload: Pokemon[] }
  | { type: 'APPEND_POKEMON_LIST'; payload: Pokemon[] } // For infinite scroll
  | { type: 'ADD_TO_CACHE'; payload: { key: string; pokemon: Pokemon } }
  | { type: 'ADD_TO_PAGE_CACHE'; payload: { key: string; pokemon: Pokemon[] } }
  | { type: 'SET_FAVORITES'; payload: Pokemon[] }
  | { type: 'TOGGLE_FAVORITE'; payload: Pokemon }
  | { type: 'SET_FILTERS'; payload: PokemonFilters }
  | { type: 'SET_SORT'; payload: SortConfig }
  | { type: 'SET_PAGE'; payload: number }
  | { type: 'SET_TOTAL_PAGES'; payload: number }
  | { type: 'SET_HAS_MORE'; payload: boolean }
  | { type: 'SET_TOTAL_COUNT'; payload: number };

const initialState: PokemonState = {
  pokemonList: [],
  favorites: [],
  cache: {},
  pageCache: {},
  loading: false,
  error: null,
  filters: {},
  sortConfig: { field: 'name', direction: 'asc' },
  currentPage: 1,
  totalPages: 0,
  hasMore: true,
  totalCount: 0,
};

function pokemonReducer(state: PokemonState, action: PokemonAction): PokemonState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'SET_POKEMON_LIST':
      return { ...state, pokemonList: action.payload };
    case 'APPEND_POKEMON_LIST':
      return { 
        ...state, 
        pokemonList: [...state.pokemonList, ...action.payload]
      };
    case 'ADD_TO_CACHE':
      return {
        ...state,
        cache: { ...state.cache, [action.payload.key]: action.payload.pokemon }
      };
    case 'ADD_TO_PAGE_CACHE':
      return {
        ...state,
        pageCache: { ...state.pageCache, [action.payload.key]: action.payload.pokemon }
      };
    case 'SET_FAVORITES':
      return { ...state, favorites: action.payload };
    case 'TOGGLE_FAVORITE':
      const isFavorite = state.favorites.some(p => p.id === action.payload.id);
      const newFavorites = isFavorite
        ? state.favorites.filter(p => p.id !== action.payload.id)
        : [...state.favorites, action.payload];
      return { ...state, favorites: newFavorites };
    case 'SET_FILTERS':
      return { ...state, filters: action.payload, currentPage: 1, hasMore: true };
    case 'SET_SORT':
      return { ...state, sortConfig: action.payload, currentPage: 1, hasMore: true };
    case 'SET_PAGE':
      return { ...state, currentPage: action.payload };
    case 'SET_TOTAL_PAGES':
      return { ...state, totalPages: action.payload };
    case 'SET_HAS_MORE':
      return { ...state, hasMore: action.payload };
    case 'SET_TOTAL_COUNT':
      return { ...state, totalCount: action.payload };
    default:
      return state;
  }
}

interface PokemonContextType {
  state: PokemonState;
  fetchPokemonList: (page?: number, filters?: PokemonFilters, append?: boolean) => Promise<void>;
  fetchPokemonDetail: (id: number) => Promise<Pokemon | null>;
  toggleFavorite: (pokemon: Pokemon) => void;
  setFilters: (filters: PokemonFilters) => void;
  setSort: (sortConfig: SortConfig) => void;
  setPage: (page: number) => void;
  getCachedPokemon: (id: number) => Pokemon | null;
  getCachedPage: (page: number, filters: PokemonFilters) => Pokemon[] | null;
  clearCache: () => void;
  getCacheStats: () => { pokemonCount: number; pageCount: number };
  preloadAdjacentPages: (currentPage: number) => void;
  loadNextPage: () => Promise<void>; // For infinite scroll
  clearPokemonList: () => void;
}

const PokemonContext = createContext<PokemonContextType | undefined>(undefined);

export function PokemonProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(pokemonReducer, initialState);

  // Load favorites from localStorage on mount
  useEffect(() => {
    const savedFavorites = localStorage.getItem('pokemon-favorites');
    if (savedFavorites) {
      try {
        const favorites = JSON.parse(savedFavorites);
        dispatch({ type: 'SET_FAVORITES', payload: favorites });
      } catch (error) {
        console.error('Error loading favorites:', error);
      }
    }
  }, []);

  // Save favorites to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('pokemon-favorites', JSON.stringify(state.favorites));
  }, [state.favorites]);

  const fetchPokemonList = async (page = 1, filters = state.filters, append = false) => {
    // Create cache key for this page and filters combination
    const cacheKey = `page-${page}-${JSON.stringify(filters)}`;
    
    // Check if we already have this page cached
    if (state.pageCache[cacheKey] && !append) {
      console.log(`📦 Using cached data for page ${page}`);
      dispatch({ type: 'SET_POKEMON_LIST', payload: state.pageCache[cacheKey] });
      dispatch({ type: 'SET_PAGE', payload: page });
      return;
    }

    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });

      const limit = 20;
      const offset = (page - 1) * limit;
      const data = await pokemonApi.getPokemonList(limit, offset, filters);

      // Cache the page results
      dispatch({ type: 'ADD_TO_PAGE_CACHE', payload: { key: cacheKey, pokemon: data.results } });
      
      // Either set or append based on the append flag
      if (append) {
        dispatch({ type: 'APPEND_POKEMON_LIST', payload: data.results });
      } else {
        dispatch({ type: 'SET_POKEMON_LIST', payload: data.results });
      }
      
      dispatch({ type: 'SET_TOTAL_PAGES', payload: Math.ceil(data.count / limit) });
      dispatch({ type: 'SET_TOTAL_COUNT', payload: data.count });
      dispatch({ type: 'SET_PAGE', payload: page });
      
      // Check if there are more pages
      const hasMore = (page * limit) < data.count;
      dispatch({ type: 'SET_HAS_MORE', payload: hasMore });

      // Cache individual Pokemon data
      data.results.forEach(pokemon => {
        const pokemonCacheKey = `pokemon-${pokemon.id}`;
        if (!state.cache[pokemonCacheKey]) {
          dispatch({ type: 'ADD_TO_CACHE', payload: { key: pokemonCacheKey, pokemon } });
        }
      });
    } catch (error) {
      console.error('❌ Error fetching Pokemon:', error);
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to fetch Pokemon' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const fetchPokemonDetail = async (id: number): Promise<Pokemon | null> => {
    const cacheKey = `pokemon-${id}`;
    
    // Check cache first
    if (state.cache[cacheKey]) {
      return state.cache[cacheKey];
    }

    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const pokemon = await pokemonApi.getPokemon(id);
      
      // Add to cache
      dispatch({ type: 'ADD_TO_CACHE', payload: { key: cacheKey, pokemon } });
      
      return pokemon;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to fetch Pokemon details' });
      return null;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const toggleFavorite = (pokemon: Pokemon) => {
    dispatch({ type: 'TOGGLE_FAVORITE', payload: pokemon });
  };

  const setFilters = (filters: PokemonFilters) => {
    dispatch({ type: 'SET_FILTERS', payload: filters });
  };

  const setSort = (sortConfig: SortConfig) => {
    dispatch({ type: 'SET_SORT', payload: sortConfig });
  };

  const setPage = (page: number) => {
    dispatch({ type: 'SET_PAGE', payload: page });
  };

  const getCachedPokemon = (id: number): Pokemon | null => {
    const cacheKey = `pokemon-${id}`;
    return state.cache[cacheKey] || null;
  };

  const getCachedPage = (page: number, filters: PokemonFilters): Pokemon[] | null => {
    const cacheKey = `page-${page}-${JSON.stringify(filters)}`;
    return state.pageCache[cacheKey] || null;
  };

  const clearCache = () => {
    dispatch({ type: 'SET_POKEMON_LIST', payload: [] });
    // Reset cache by dispatching actions to clear them
    Object.keys(state.cache).forEach(key => {
      dispatch({ type: 'ADD_TO_CACHE', payload: { key, pokemon: null as any } });
    });
    Object.keys(state.pageCache).forEach(key => {
      dispatch({ type: 'ADD_TO_PAGE_CACHE', payload: { key, pokemon: [] } });
    });
  };

  const getCacheStats = () => {
    return {
      pokemonCount: Object.keys(state.cache).length,
      pageCount: Object.keys(state.pageCache).length,
    };
  };

  const preloadAdjacentPages = (currentPage: number) => {
    // Only preload the next page, not previous (to avoid too many API calls)
    const nextPage = currentPage + 1;
    
    if (nextPage <= state.totalPages) {
      const cacheKey = `page-${nextPage}-${JSON.stringify(state.filters)}`;
      if (!state.pageCache[cacheKey]) {
        console.log(`Preloading next page ${nextPage}`);
        // Use a separate function to avoid triggering loading state
        preloadPage(nextPage, state.filters);
      }
    }
  };

  const preloadPage = async (page: number, filters: PokemonFilters) => {
    try {
      const limit = 20;
      const offset = (page - 1) * limit;
      const data = await pokemonApi.getPokemonList(limit, offset, filters);
      
      const cacheKey = `page-${page}-${JSON.stringify(filters)}`;
      dispatch({ type: 'ADD_TO_PAGE_CACHE', payload: { key: cacheKey, pokemon: data.results } });
      
      // Cache individual Pokemon data
      data.results.forEach(pokemon => {
        const pokemonCacheKey = `pokemon-${pokemon.id}`;
        if (!state.cache[pokemonCacheKey]) {
          dispatch({ type: 'ADD_TO_CACHE', payload: { key: pokemonCacheKey, pokemon } });
        }
      });
    } catch (error) {
      console.error(`Failed to preload page ${page}:`, error);
    }
  };

  const loadNextPage = async () => {
    if (!state.hasMore || state.loading) {
      return;
    }
    
    const nextPage = state.currentPage + 1;
    await fetchPokemonList(nextPage, state.filters, true);
  };

  const clearPokemonList = () => {
    dispatch({ type: 'SET_POKEMON_LIST', payload: [] });
  };

  return (
    <PokemonContext.Provider
      value={{
        state,
        fetchPokemonList,
        fetchPokemonDetail,
        toggleFavorite,
        setFilters,
        setSort,
        setPage,
        getCachedPokemon,
        getCachedPage,
        clearCache,
        getCacheStats,
        preloadAdjacentPages,
        loadNextPage,
        clearPokemonList,
      }}
    >
      {children}
    </PokemonContext.Provider>
  );
}

export function usePokemon() {
  const context = useContext(PokemonContext);
  if (context === undefined) {
    throw new Error('usePokemon must be used within a PokemonProvider');
  }
  return context;
}
