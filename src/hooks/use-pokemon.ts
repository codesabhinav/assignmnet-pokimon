'use client';

import { useQuery } from '@tanstack/react-query';
import { pokemonApi } from '@/lib/api';
import { PokemonFilters } from '@/types/api';

export function usePokemon(page: number, limit = 20, filters?: PokemonFilters) {
  const offset = (page - 1) * limit;
  
  return useQuery({
    queryKey: ['pokemon', page, limit, filters],
    queryFn: () => pokemonApi.getPokemonList(limit, offset, filters),
    placeholderData: (previousData) => previousData,
  });
}

export function usePokemonDetail(id: number) {
  return useQuery({
    queryKey: ['pokemon-detail', id],
    queryFn: () => pokemonApi.getPokemon(id),
    enabled: !!id,
  });
}

export function usePokemonTypes() {
  return useQuery({
    queryKey: ['pokemon-types'],
    queryFn: () => pokemonApi.getPokemonTypes(),
    staleTime: 1000 * 60 * 60, // 1 hour
  });
}
