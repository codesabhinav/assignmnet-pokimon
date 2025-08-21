'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Pokemon } from '@/types/api';
import { favoritesManager } from '@/lib/favorites';
import { getTypeColor, formatPokemonId, capitalizeFirst, getStatColor, cn } from '@/lib/utils';

interface PokemonModalProps {
  pokemon: Pokemon | null;
  isOpen: boolean;
  onClose: () => void;
}

export function PokemonModal({ pokemon, isOpen, onClose }: PokemonModalProps) {
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    if (pokemon) {
      setIsFavorite(favoritesManager.isFavorite(pokemon.id));
    }
  }, [pokemon]);

  if (!isOpen || !pokemon) return null;

  const handleFavoriteToggle = () => {
    if (isFavorite) {
      favoritesManager.removeFavorite(pokemon.id);
    } else {
      favoritesManager.addFavorite(pokemon);
    }
    setIsFavorite(!isFavorite);
  };

  const primaryType = pokemon.types[0]?.type.name;
  const typeGradient = {
    fire: 'from-red-400 to-orange-400',
    water: 'from-blue-400 to-cyan-400',
    grass: 'from-green-400 to-emerald-400',
    electric: 'from-yellow-300 to-amber-300',
    psychic: 'from-pink-400 to-purple-400',
    ice: 'from-cyan-300 to-blue-300',
    dragon: 'from-purple-500 to-indigo-500',
    dark: 'from-gray-700 to-gray-900',
    fairy: 'from-pink-300 to-rose-300',
    fighting: 'from-red-600 to-orange-600',
    poison: 'from-purple-500 to-pink-500',
    ground: 'from-yellow-600 to-orange-600',
    flying: 'from-blue-300 to-indigo-300',
    bug: 'from-green-400 to-lime-400',
    rock: 'from-yellow-800 to-amber-800',
    ghost: 'from-purple-600 to-indigo-600',
    steel: 'from-gray-400 to-slate-400',
    normal: 'from-gray-400 to-gray-500',
  }[primaryType] || 'from-gray-400 to-gray-500';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
              <div className="relative bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto animate-scale-in">
        {/* Header with gradient background */}
        <div className={cn('relative bg-gradient-to-br p-6', typeGradient)}>
          <div className="absolute inset-0 bg-black/10" />
          
          <div className="relative flex items-center justify-between text-white">
            <div className="flex items-center gap-4">
              <span className="text-2xl font-bold">{formatPokemonId(pokemon.id)}</span>
              <h1 className="text-3xl font-bold capitalize">{pokemon.name}</h1>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={handleFavoriteToggle}
                className="p-3 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-all duration-200 hover:scale-110"
              >
                <svg
                  className={cn(
                    'w-6 h-6 transition-colors',
                    isFavorite ? 'text-red-400 fill-current' : 'text-white/80 hover:text-red-400'
                  )}
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </button>
              
              <button
                onClick={onClose}
                className="p-3 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-all duration-200"
              >
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        <div className="p-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Pokemon Image and Basic Info */}
            <div className="space-y-6">
              <div className="relative bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-8 flex items-center justify-center">
                <Image
                  src={pokemon.sprites.other['official-artwork']?.front_default || pokemon.sprites.front_default}
                  alt={pokemon.name}
                  width={300}
                  height={300}
                  className="w-64 h-64 object-contain drop-shadow-2xl"
                  priority
                />
              </div>

              {/* Types */}
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-gray-900">Types</h3>
                <div className="flex flex-wrap gap-3">
                  {pokemon.types.map((typeInfo) => (
                    <span
                      key={typeInfo.type.name}
                      className={cn(
                        'px-4 py-2 text-sm font-semibold rounded-xl shadow-lg',
                        getTypeColor(typeInfo.type.name)
                      )}
                    >
                      {capitalizeFirst(typeInfo.type.name)}
                    </span>
                  ))}
                </div>
              </div>

              {/* Physical Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 rounded-xl p-4 text-center">
                  <p className="text-sm text-blue-600 font-medium">Height</p>
                  <p className="text-2xl font-bold text-blue-900">{(pokemon.height / 10).toFixed(1)}m</p>
                </div>
                <div className="bg-green-50 rounded-xl p-4 text-center">
                  <p className="text-sm text-green-600 font-medium">Weight</p>
                  <p className="text-2xl font-bold text-green-900">{(pokemon.weight / 10).toFixed(1)}kg</p>
                </div>
              </div>
            </div>

            {/* Stats and Abilities */}
            <div className="space-y-6">
              {/* Base Stats */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Base Stats</h3>
                <div className="space-y-3">
                  {pokemon.stats.map((stat) => (
                    <div key={stat.stat.name} className="space-y-1">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-700 capitalize">
                          {stat.stat.name.replace('-', ' ')}
                        </span>
                        <span className="text-sm font-bold text-gray-900">{stat.base_stat}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                        <div 
                          className={cn('h-full transition-all duration-1000 rounded-full', getStatColor(stat.stat.name))}
                          style={{ width: `${Math.min((stat.base_stat / 150) * 100, 100)}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Abilities */}
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-gray-900">Abilities</h3>
                <div className="space-y-2">
                  {pokemon.abilities.map((abilityInfo) => (
                    <div
                      key={abilityInfo.ability.name}
                      className={cn(
                        'px-4 py-3 rounded-xl border-2',
                        abilityInfo.is_hidden 
                          ? 'bg-purple-50 border-purple-200 text-purple-900' 
                          : 'bg-gray-50 border-gray-200 text-gray-900'
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium capitalize">
                          {abilityInfo.ability.name.replace('-', ' ')}
                        </span>
                        {abilityInfo.is_hidden && (
                          <span className="text-xs bg-purple-200 text-purple-800 px-2 py-1 rounded-full font-medium">
                            Hidden
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Base Experience */}
              <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl p-4">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Base Experience</h3>
                <div className="flex items-center gap-3">
                  <div className="flex-1 bg-gray-200 rounded-full h-4 overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-yellow-400 to-orange-500 transition-all duration-1000 rounded-full"
                      style={{ width: `${Math.min((pokemon.base_experience / 400) * 100, 100)}%` }}
                    />
                  </div>
                  <span className="text-xl font-bold text-gray-900 min-w-[3rem] text-right">
                    {pokemon.base_experience}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
