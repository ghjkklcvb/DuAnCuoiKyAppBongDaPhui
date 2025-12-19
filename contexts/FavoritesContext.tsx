import React, { createContext, useContext, ReactNode } from 'react';
import { useFavoriteLeagues as useFavoritesHook } from '@/hooks/useFavoriteLeagues';

interface FavoritesContextType {
  favorites: any[];
  isLoading: boolean;
  isFavorite: (leagueId: string) => boolean;
  addFavorite: (league: any) => Promise<void>;
  removeFavorite: (leagueId: string) => Promise<void>;
  toggleFavorite: (league: any) => Promise<boolean>;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const favoritesData = useFavoritesHook();

  return (
    <FavoritesContext.Provider value={favoritesData}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const context = useContext(FavoritesContext);
  if (context === undefined) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
}
