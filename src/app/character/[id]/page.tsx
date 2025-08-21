'use client';

import { useParams, useRouter } from 'next/navigation';
import { usePokemonDetail } from '@/hooks/use-pokemon';
import { PokemonModal } from '@/components/pokemon-modal';
import { useEffect, useState } from 'react';

export default function PokemonDetailPage() {
  const params = useParams();
  const router = useRouter();
  const pokemonId = parseInt(params.id as string);
  const [isModalOpen, setIsModalOpen] = useState(true);

  const { data: pokemon, isLoading, error } = usePokemonDetail(pokemonId);

  useEffect(() => {
    if (!isModalOpen) {
      router.push('/');
    }
  }, [isModalOpen, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-100 flex items-center justify-center p-4">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl p-8 max-w-lg w-full">
          <div className="animate-pulse space-y-6">
            <div className="h-48 bg-gradient-to-br from-gray-200 to-gray-300 rounded-2xl"></div>
            <div className="space-y-3">
              <div className="h-8 bg-gray-200 rounded-lg w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="flex gap-2">
                <div className="h-6 bg-gray-200 rounded-full w-16"></div>
                <div className="h-6 bg-gray-200 rounded-full w-20"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100 flex items-center justify-center p-4">
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
          <div className="text-red-500 mb-6">
            <svg className="w-20 h-20 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Pokémon Not Found</h2>
          <p className="text-gray-600 mb-6">{error.message}</p>
          <button
            onClick={() => router.push('/')}
            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl"
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

  return (
    <PokemonModal
      pokemon={pokemon}
      isOpen={isModalOpen}
      onClose={() => setIsModalOpen(false)}
    />
  );
}
