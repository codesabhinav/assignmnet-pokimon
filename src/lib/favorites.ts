import { Pokemon } from '@/types/api';

const FAVORITES_KEY = 'pokemon-favorites';

export const favoritesManager = {
  getFavorites(): Pokemon[] {
    if (typeof window === 'undefined') return [];
    
    try {
      const stored = localStorage.getItem(FAVORITES_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  },

  addFavorite(pokemon: Pokemon): void {
    if (typeof window === 'undefined') return;
    
    const favorites = this.getFavorites();
    if (!favorites.find(fav => fav.id === pokemon.id)) {
      favorites.push(pokemon);
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
    }
  },

  removeFavorite(pokemonId: number): void {
    if (typeof window === 'undefined') return;
    
    const favorites = this.getFavorites();
    const filtered = favorites.filter(fav => fav.id !== pokemonId);
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(filtered));
  },

  isFavorite(pokemonId: number): boolean {
    const favorites = this.getFavorites();
    return favorites.some(fav => fav.id === pokemonId);
  },

  clearFavorites(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(FAVORITES_KEY);
  },
};
