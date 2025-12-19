import AsyncStorage from '@react-native-async-storage/async-storage';
import { useState, useEffect, useCallback } from 'react';

const FAVORITES_KEY = '@favorite_leagues';

export interface FavoriteLeague {
  _id: string;
  name: string;
  logo?: string;
  type: string;
  visibility: string;
  description?: string;
  numberOfTeams?: number;
  teamsCount?: number; 
  addedAt: string;
}

export const useFavoriteLeagues = () => {
  const [favorites, setFavorites] = useState<FavoriteLeague[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    try {
      const stored = await AsyncStorage.getItem(FAVORITES_KEY);
      if (stored) {
        setFavorites(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Error loading favorites:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveFavorites = async (newFavorites: FavoriteLeague[]) => {
    try {
      console.log('⭐ Saving favorites:', newFavorites);
      await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(newFavorites));
      setFavorites(newFavorites);
      console.log('✅ Favorites saved successfully');
    } catch (error) {
      console.error('❌ Error saving favorites:', error);
    }
  };

  const isFavorite = useCallback((leagueId: string) => {
    return favorites.some(fav => fav._id === leagueId);
  }, [favorites]);

  const addFavorite = async (league: Omit<FavoriteLeague, 'addedAt'>) => {
    const newFavorite: FavoriteLeague = {
      ...league,
      addedAt: new Date().toISOString(),
    };
    const newFavorites = [newFavorite, ...favorites];
    await saveFavorites(newFavorites);
  };

  const removeFavorite = async (leagueId: string) => {
    const newFavorites = favorites.filter(fav => fav._id !== leagueId);
    await saveFavorites(newFavorites);
  };

  const toggleFavorite = async (league: Omit<FavoriteLeague, 'addedAt'>) => {
    if (isFavorite(league._id)) {
      await removeFavorite(league._id);
      return false; 
    } else {
      await addFavorite(league);
      return true; 
    }
  };

  return {
    favorites,
    isLoading,
    isFavorite,
    addFavorite,
    removeFavorite,
    toggleFavorite,
  };
};
