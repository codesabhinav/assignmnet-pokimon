import { Pokemon, SortConfig } from '@/types/api';
import { clsx, type ClassValue } from 'clsx';

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function sortPokemon(pokemon: Pokemon[], sortConfig: SortConfig): Pokemon[] {
  return [...pokemon].sort((a, b) => {
    let aValue: string | number;
    let bValue: string | number;

    if (sortConfig.field === 'name') {
      aValue = a.name;
      bValue = b.name;
    } else if (sortConfig.field === 'id') {
      aValue = a.id;
      bValue = b.id;
    } else if (sortConfig.field === 'height') {
      aValue = a.height;
      bValue = b.height;
    } else if (sortConfig.field === 'weight') {
      aValue = a.weight;
      bValue = b.weight;
    } else {
      // Default to name if field is not recognized
      aValue = a.name;
      bValue = b.name;
    }
    
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      const comparison = aValue.localeCompare(bValue);
      return sortConfig.direction === 'asc' ? comparison : -comparison;
    }
    
    if (typeof aValue === 'number' && typeof bValue === 'number') {
      const comparison = aValue - bValue;
      return sortConfig.direction === 'asc' ? comparison : -comparison;
    }
    
    return 0;
  });
}

export function getTypeColor(type: string): string {
  const typeColors: Record<string, string> = {
    normal: 'bg-gray-400 text-white shadow-lg',
    fire: 'bg-gradient-to-r from-red-500 to-orange-500 text-white shadow-lg',
    water: 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg',
    electric: 'bg-gradient-to-r from-yellow-400 to-amber-400 text-black shadow-lg',
    grass: 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg',
    ice: 'bg-gradient-to-r from-cyan-300 to-blue-300 text-black shadow-lg',
    fighting: 'bg-gradient-to-r from-red-600 to-orange-600 text-white shadow-lg',
    poison: 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg',
    ground: 'bg-gradient-to-r from-yellow-600 to-orange-600 text-white shadow-lg',
    flying: 'bg-gradient-to-r from-indigo-400 to-blue-400 text-white shadow-lg',
    psychic: 'bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-lg',
    bug: 'bg-gradient-to-r from-green-400 to-lime-400 text-white shadow-lg',
    rock: 'bg-gradient-to-r from-yellow-800 to-amber-800 text-white shadow-lg',
    ghost: 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg',
    dragon: 'bg-gradient-to-r from-indigo-700 to-purple-700 text-white shadow-lg',
    dark: 'bg-gradient-to-r from-gray-800 to-gray-900 text-white shadow-lg',
    steel: 'bg-gradient-to-r from-gray-500 to-slate-500 text-white shadow-lg',
    fairy: 'bg-gradient-to-r from-pink-300 to-rose-300 text-black shadow-lg',
  };
  
  return typeColors[type] || 'bg-gray-400 text-white shadow-lg';
}

export function formatPokemonId(id: number): string {
  return `#${id.toString().padStart(3, '0')}`;
}

export function capitalizeFirst(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function getStatColor(statName: string): string {
  const statColors: Record<string, string> = {
    hp: 'bg-green-500',
    attack: 'bg-red-500',
    defense: 'bg-blue-500',
    'special-attack': 'bg-purple-500',
    'special-defense': 'bg-yellow-500',
    speed: 'bg-pink-500',
  };
  
  return statColors[statName] || 'bg-gray-500';
}
