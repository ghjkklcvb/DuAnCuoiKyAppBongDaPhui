import { useEffect, useState } from 'react';
import { getLeagueToken } from '@/utils/leagueLink';

/**
 * Hook to load and manage saved access token for private league
 */
export const useLeagueToken = (leagueId: string | string[] | undefined) => {
  const [savedToken, setSavedToken] = useState<string | null>(null);
  const [tokenLoaded, setTokenLoaded] = useState(false);

  useEffect(() => {
    if (!leagueId) {
      setTokenLoaded(true);
      return;
    }

    const loadToken = async () => {
      try {
        const token = await getLeagueToken(leagueId as string);
        setSavedToken(token);
      } catch (error) {
        console.error('Error loading saved token:', error);
      } finally {
        setTokenLoaded(true);
      }
    };

    loadToken();
  }, [leagueId]);

  return { savedToken, tokenLoaded };
};
