'use client';

import { useState, useEffect, useMemo, forwardRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Pokemon } from '@/types/api';
import { usePokemon } from '@/contexts/pokemon-context';
import { getTypeColor, formatPokemonId, capitalizeFirst, cn } from '@/lib/utils';
import { imageCache } from '@/lib/image-cache';

interface PokemonCardProps {
  pokemon: Pokemon;
  className?: string;
}

export const PokemonCard = forwardRef<HTMLAnchorElement, PokemonCardProps>(
  ({ pokemon, className }, ref) => {
    const { state, toggleFavorite } = usePokemon();
    const isFavorite = state.favorites.some(fav => fav.id === pokemon.id);

    // Memoize the image source to prevent unnecessary re-renders
    const imageSrc = useMemo(() => {
      return pokemon.sprites.other['official-artwork']?.front_default || pokemon.sprites.front_default;
    }, [pokemon.sprites]);

    // Preload image when component mounts
    useEffect(() => {
      if (imageSrc) {
        imageCache.preloadImage(imageSrc).catch(console.error);
      }
    }, [imageSrc]);

    const handleFavoriteToggle = (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      toggleFavorite(pokemon);
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
      <Link
        ref={ref}
        href={`/pokemon/${pokemon.id}`}
        className={cn(
          'group relative card cursor-pointer hover:scale-[1.03] block animate-fade-in',
          className
        )}
      >
      {/* Background gradient based on primary type */}
      <div className={cn('absolute inset-0 bg-gradient-to-br opacity-5 group-hover:opacity-10 transition-opacity duration-300', typeGradient)} />
      
      <div className="relative">
        {/* Pokemon ID badge */}
        <div className="absolute top-3 left-3 z-10">
          <span className="px-2 py-1 bg-black/20 backdrop-blur-sm text-white text-xs font-bold rounded-full">
            {formatPokemonId(pokemon.id)}
          </span>
        </div>

        {/* Favorite button */}
        <button
          onClick={handleFavoriteToggle}
          className="absolute top-3 right-3 z-10 p-2 bg-white/80 backdrop-blur-sm rounded-full hover:bg-white transition-all duration-200 hover:scale-110"
        >
          <svg
            className={cn(
              'w-5 h-5 transition-colors',
              isFavorite ? 'text-red-500 fill-current' : 'text-gray-400 hover:text-red-500'
            )}
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        </button>

        {/* Pokemon image */}
        <div className="relative h-48 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-dark-700 dark:to-dark-800 flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-transparent to-black/5 dark:to-white/5" />
                            <Image
                    src={imageSrc}
                    alt={pokemon.name}
                    width={200}
                    height={200}
                    className="w-32 h-32 object-contain drop-shadow-lg group-hover:scale-110 transition-transform duration-300"
                    priority={false}
                    loading="lazy"
                  />
        </div>
      </div>

      <div className="p-5">
        <h3 className="font-bold text-xl text-gray-900 dark:text-gray-100 mb-3 capitalize group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200">
          {pokemon.name}
        </h3>
        
        <div className="space-y-3">
          {/* Pokemon types */}
          <div className="flex flex-wrap gap-2">
            {pokemon.types.map((typeInfo) => (
              <span
                key={typeInfo.type.name}
                className={cn(
                  'px-3 py-1 text-xs font-semibold rounded-full shadow-sm',
                  getTypeColor(typeInfo.type.name)
                )}
              >
                {capitalizeFirst(typeInfo.type.name)}
              </span>
            ))}
          </div>
          
          {/* Pokemon stats preview */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-gray-600 dark:text-gray-400 font-medium">Height</span>
              <span className="font-semibold text-gray-900 dark:text-gray-100">{(pokemon.height / 10).toFixed(1)}m</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600 dark:text-gray-400 font-medium">Weight</span>
              <span className="font-semibold text-gray-900 dark:text-gray-100">{(pokemon.weight / 10).toFixed(1)}kg</span>
            </div>
          </div>

          {/* Base experience */}
          <div className="pt-2 border-t border-gray-100 dark:border-dark-600">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400 font-medium">Base Experience</span>
              <div className="flex items-center gap-2">
                <div className="w-16 h-2 bg-gray-200 dark:bg-dark-600 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-400 to-purple-500 transition-all duration-500"
                    style={{ width: `${Math.min((pokemon.base_experience / 300) * 100, 100)}%` }}
                  />
                </div>
                <span className="font-semibold text-gray-900 dark:text-gray-100 min-w-[2rem] text-right">{pokemon.base_experience}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

        {/* Hover effect overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-primary-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
      </Link>
    );
  }
);

PokemonCard.displayName = 'PokemonCard';
