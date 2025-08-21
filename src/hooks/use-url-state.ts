'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useState } from 'react';
import { Pokemon, PokemonFilters, SortConfig } from '@/types/api';

interface URLState {
  page: number;
  filters: PokemonFilters;
  sortConfig: SortConfig;
}

export function useURLState() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [state, setState] = useState<URLState>(() => ({
    page: parseInt(searchParams.get('page') || '1'),
    filters: {
      name: searchParams.get('q') || undefined,
      type: searchParams.get('type') || undefined,
      generation: searchParams.get('generation') || undefined,
    },
    sortConfig: {
      field: (searchParams.get('sort') as keyof Pokemon | 'name') || 'name',
      direction: (searchParams.get('order') as 'asc' | 'desc') || 'asc',
    },
  }));

  const updateURL = useCallback((newState: Partial<URLState>) => {
    const updatedState = { ...state, ...newState };
    const params = new URLSearchParams();

    if (updatedState.page > 1) {
      params.set('page', updatedState.page.toString());
    }

    if (updatedState.filters.name) {
      params.set('q', updatedState.filters.name);
    }

    if (updatedState.filters.type) {
      params.set('type', updatedState.filters.type);
    }

    if (updatedState.filters.generation) {
      params.set('generation', updatedState.filters.generation);
    }

    if (updatedState.sortConfig.field !== 'name' || updatedState.sortConfig.direction !== 'asc') {
      params.set('sort', updatedState.sortConfig.field.toString());
      params.set('order', updatedState.sortConfig.direction);
    }

    const newURL = params.toString() ? `/?${params.toString()}` : '/';
    router.push(newURL);
    setState(updatedState);
  }, [state, router]);

  const updateFilters = useCallback((filters: PokemonFilters) => {
    updateURL({ filters, page: 1 });
  }, [updateURL]);

  const updatePage = useCallback((page: number) => {
    updateURL({ page });
  }, [updateURL]);

  const updateSort = useCallback((sortConfig: SortConfig) => {
    updateURL({ sortConfig });
  }, [updateURL]);

  const clearFilters = useCallback(() => {
    updateURL({
      filters: {},
      page: 1,
      sortConfig: { field: 'name', direction: 'asc' },
    });
  }, [updateURL]);

  return {
    state,
    updateFilters,
    updatePage,
    updateSort,
    clearFilters,
  };
}
