'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState, useMemo } from 'react';
import Image from 'next/image';
import { usePokemon } from '@/contexts/pokemon-context';
import { useTheme } from '@/contexts/theme-context';
import { getTypeColor, formatPokemonId, capitalizeFirst, getStatColor, cn } from '@/lib/utils';
import { ThemeToggle } from '@/components/theme-toggle';
import { imageCache } from '@/lib/image-cache';

export default function PokemonDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { theme } = useTheme();
  const { state, fetchPokemonDetail, toggleFavorite, getCachedPokemon } = usePokemon();
  
  const pokemonId = parseInt(params.id as string);
  const [pokemon, setPokemon] = useState(getCachedPokemon(pokemonId));

  // Memoize the image source to prevent unnecessary re-renders
  const imageSrc = useMemo(() => {
    return pokemon?.sprites.other['official-artwork']?.front_default || pokemon?.sprites.front_default || '';
  }, [pokemon?.sprites]);

  // Preload image when pokemon data is available
  useEffect(() => {
    if (imageSrc) {
      imageCache.preloadImage(imageSrc).catch(console.error);
    }
  }, [imageSrc]);

  useEffect(() => {
    const loadPokemon = async () => {
      if (!pokemon) {
        const fetchedPokemon = await fetchPokemonDetail(pokemonId);
        if (fetchedPokemon) {
          setPokemon(fetchedPokemon);
        }
      }
    };

    loadPokemon();
  }, [pokemonId, pokemon]); // Removed fetchPokemonDetail from dependencies

  if (state.loading && !pokemon) {
    return (
      <div className="min-h-screen bg-gradient-primary flex items-center justify-center p-4">
        <div className="bg-glass rounded-2xl shadow-2xl p-8 max-w-lg w-full">
          <div className="animate-pulse space-y-6">
            <div className="h-48 bg-gradient-to-br from-gray-200 to-gray-300 rounded-2xl dark:from-dark-600 dark:to-dark-700"></div>
            <div className="space-y-3">
              <div className="h-8 bg-gray-200 rounded-lg w-3/4 dark:bg-dark-600"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 dark:bg-dark-600"></div>
              <div className="flex gap-2">
                <div className="h-6 bg-gray-200 rounded-full w-16 dark:bg-dark-600"></div>
                <div className="h-6 bg-gray-200 rounded-full w-20 dark:bg-dark-600"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (state.error && !pokemon) {
    return (
      <div className="min-h-screen bg-gradient-primary flex items-center justify-center p-4">
        <div className="bg-glass rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
          <div className="text-red-500 mb-6">
            <svg className="w-20 h-20 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-3">Pokémon Not Found</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">{state.error}</p>
          <button
            onClick={() => router.push('/')}
            className="btn-primary"
          >
            Back to Pokédex
          </button>
        </div>
      </div>
    );
  }

  if (!pokemon) {
    return null;
  }

  const isFavorite = state.favorites.some(fav => fav.id === pokemon.id);
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
    <div className="min-h-screen bg-gradient-primary">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-glass/80 backdrop-blur-md border-b border-gray-200/50 dark:border-dark-600/50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.push('/')}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span className="font-medium">Back to Pokédex</span>
            </button>
            
            <div className="flex items-center gap-4">
              <ThemeToggle />
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Pokemon Header */}
          <div className={cn('relative bg-gradient-to-br rounded-3xl p-8 mb-8 shadow-2xl', typeGradient)}>
            <div className="absolute inset-0 bg-black/10 rounded-3xl" />
            
            <div className="relative flex flex-col lg:flex-row items-center gap-8 text-white">
              <div className="flex-1 text-center lg:text-left">
                <div className="flex items-center justify-center lg:justify-start gap-4 mb-4">
                  <span className="text-3xl font-bold">{formatPokemonId(pokemon.id)}</span>
                  <h1 className="text-4xl lg:text-5xl font-black capitalize">{pokemon.name}</h1>
                </div>
                
                <div className="flex flex-wrap justify-center lg:justify-start gap-3 mb-6">
                  {pokemon.types.map((typeInfo) => (
                    <span
                      key={typeInfo.type.name}
                      className="px-4 py-2 text-sm font-semibold bg-white/20 backdrop-blur-sm rounded-xl shadow-lg"
                    >
                      {capitalizeFirst(typeInfo.type.name)}
                    </span>
                  ))}
                </div>
                
                <div className="grid grid-cols-2 gap-4 max-w-xs mx-auto lg:mx-0">
                  <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 text-center">
                    <p className="text-sm font-medium opacity-90">Height</p>
                    <p className="text-2xl font-bold">{(pokemon.height / 10).toFixed(1)}m</p>
                  </div>
                  <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 text-center">
                    <p className="text-sm font-medium opacity-90">Weight</p>
                    <p className="text-2xl font-bold">{(pokemon.weight / 10).toFixed(1)}kg</p>
                  </div>
                </div>
              </div>
              
              <div className="relative">
                <div className="bg-white/20 backdrop-blur-sm rounded-3xl p-8">
                  <Image
                    src={imageSrc}
                    alt={pokemon.name}
                    width={300}
                    height={300}
                    className="w-48 h-48 lg:w-64 lg:h-64 object-contain drop-shadow-2xl"
                    priority
                  />
                </div>
                
                <button
                  onClick={() => toggleFavorite(pokemon)}
                  className="absolute top-4 right-4 p-3 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-all duration-200 hover:scale-110"
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
              </div>
            </div>
          </div>

          {/* Stats and Abilities */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Base Stats */}
            <div className="card p-6">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">Base Stats</h3>
              <div className="space-y-4">
                {pokemon.stats.map((stat) => (
                  <div key={stat.stat.name} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">
                        {stat.stat.name.replace('-', ' ')}
                      </span>
                      <span className="text-sm font-bold text-gray-900 dark:text-gray-100">{stat.base_stat}</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-dark-600 rounded-full h-3 overflow-hidden">
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
            <div className="card p-6">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">Abilities</h3>
              <div className="space-y-3">
                {pokemon.abilities.map((abilityInfo) => (
                  <div
                    key={abilityInfo.ability.name}
                    className={cn(
                      'px-4 py-3 rounded-xl border-2 transition-all duration-200',
                      abilityInfo.is_hidden 
                        ? 'bg-purple-50 border-purple-200 text-purple-900 dark:bg-purple-900/20 dark:border-purple-700 dark:text-purple-200' 
                        : 'bg-gray-50 border-gray-200 text-gray-900 dark:bg-dark-700 dark:border-dark-600 dark:text-gray-200'
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium capitalize">
                        {abilityInfo.ability.name.replace('-', ' ')}
                      </span>
                      {abilityInfo.is_hidden && (
                        <span className="text-xs bg-purple-200 text-purple-800 px-2 py-1 rounded-full font-medium dark:bg-purple-800 dark:text-purple-200">
                          Hidden
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Base Experience */}
          <div className="card p-6 mt-8">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">Base Experience</h3>
            <div className="flex items-center gap-4">
              <div className="flex-1 bg-gray-200 dark:bg-dark-600 rounded-full h-6 overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-yellow-400 to-orange-500 transition-all duration-1000 rounded-full"
                  style={{ width: `${Math.min((pokemon.base_experience / 400) * 100, 100)}%` }}
                />
              </div>
              <span className="text-2xl font-bold text-gray-900 dark:text-gray-100 min-w-[4rem] text-right">
                {pokemon.base_experience}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
