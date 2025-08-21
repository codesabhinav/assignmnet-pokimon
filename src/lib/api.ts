import axios from 'axios';
import { Pokemon, PokemonListResponse, PokemonFilters, PokemonType } from '@/types/api';

const API_BASE_URL = 'https://pokeapi.co/api/v2';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 404) {
      throw new Error('Pokemon not found');
    }
    if (error.response?.status >= 500) {
      throw new Error('Server error. Please try again later.');
    }
    if (error.code === 'ECONNABORTED') {
      throw new Error('Request timeout. Please check your connection.');
    }
    throw new Error('An unexpected error occurred.');
  }
);

export const pokemonApi = {
  async getPokemonList(limit = 20, offset = 0, filters?: PokemonFilters): Promise<{ results: Pokemon[]; count: number; next: string | null; previous: string | null }> {
    let pokemonList: Pokemon[] = [];
    
    if (filters?.type) {
      // If filtering by type, get Pokemon from type endpoint
      const typeResponse = await apiClient.get<PokemonType>(`/type/${filters.type}`);
      const pokemonUrls = typeResponse.data.pokemon.slice(offset, offset + limit).map(p => p.pokemon.url);
      
      pokemonList = await Promise.all(
        pokemonUrls.map(async (url) => {
          const id = url.split('/').filter(Boolean).pop();
          return this.getPokemon(parseInt(id!));
        })
      );
    } else {
      // Get regular Pokemon list
      const listResponse = await apiClient.get<PokemonListResponse>(`/pokemon?limit=${limit}&offset=${offset}`);
      
      pokemonList = await Promise.all(
        listResponse.data.results.map(async (pokemon) => {
          const id = pokemon.url.split('/').filter(Boolean).pop();
          return this.getPokemon(parseInt(id!));
        })
      );
    }

    // Filter by name if provided
    if (filters?.name) {
      pokemonList = pokemonList.filter(pokemon => 
        pokemon.name.toLowerCase().includes(filters.name!.toLowerCase())
      );
    }

    return {
      results: pokemonList,
      count: 1010, // Total Pokemon count
      next: offset + limit < 1010 ? `${offset + limit}` : null,
      previous: offset > 0 ? `${Math.max(0, offset - limit)}` : null,
    };
  },

  async getPokemon(id: number): Promise<Pokemon> {
    const response = await apiClient.get<Pokemon>(`/pokemon/${id}`);
    return response.data;
  },

  async getPokemonTypes(): Promise<string[]> {
    const response = await apiClient.get('/type');
    return response.data.results.map((type: any) => type.name);
  },
};
