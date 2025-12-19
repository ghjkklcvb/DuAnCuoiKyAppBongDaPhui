import AsyncStorage from '@react-native-async-storage/async-storage';

const ACCESS_TOKENS_KEY = '@private_league_tokens';

/**
 * Generate a shareable league access link
 * Format: leagueId|token
 */
export const generateLeagueLink = (leagueId: string, token: string): string => {
  return `${leagueId}|${token}`;
};

/**
 * Parse league link to extract leagueId and token
 * Format: leagueId|token
 */
export const parseLeagueLink = (link: string): { leagueId: string; token: string } | null => {
  try {
    const plainLink = link.trim();
    
    // Parse format: leagueId|token
    const parts = plainLink.split('|');
    if (parts.length === 2 && parts[0] && parts[1]) {
      return {
        leagueId: parts[0].trim(),
        token: parts[1].trim(),
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error parsing league link:', error);
    return null;
  }
};

/**
 * Save league access token
 */
export const saveLeagueToken = async (leagueId: string, token: string): Promise<void> => {
  try {
    const saved = await AsyncStorage.getItem(ACCESS_TOKENS_KEY);
    const tokens = saved ? JSON.parse(saved) : {};
    tokens[leagueId] = token;
    await AsyncStorage.setItem(ACCESS_TOKENS_KEY, JSON.stringify(tokens));
  } catch (error) {
    console.error('Error saving league token:', error);
  }
};

/**
 * Get saved token for a league
 */
export const getLeagueToken = async (leagueId: string): Promise<string | null> => {
  try {
    const saved = await AsyncStorage.getItem(ACCESS_TOKENS_KEY);
    if (!saved) return null;
    const tokens = JSON.parse(saved);
    return tokens[leagueId] || null;
  } catch (error) {
    console.error('Error getting league token:', error);
    return null;
  }
};

/**
 * Remove saved token for a league
 */
export const removeLeagueToken = async (leagueId: string): Promise<void> => {
  try {
    const saved = await AsyncStorage.getItem(ACCESS_TOKENS_KEY);
    if (!saved) return;
    const tokens = JSON.parse(saved);
    delete tokens[leagueId];
    await AsyncStorage.setItem(ACCESS_TOKENS_KEY, JSON.stringify(tokens));
  } catch (error) {
    console.error('Error removing league token:', error);
  }
};
