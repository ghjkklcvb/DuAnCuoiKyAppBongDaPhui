import { useLocalSearchParams } from 'expo-router';

/**
 * Custom hook to safely extract a single string ID from route params
 * Handles the case where useLocalSearchParams() returns string | string[] | undefined
 * 
 * @returns string | undefined - The ID as a single string value
 */
export function useLeagueId(): string | undefined {
  const params = useLocalSearchParams();
  const id = params.id;
  
  // Handle array case (e.g., from URL like /league/123/league/456)
  if (Array.isArray(id)) {
    return id[0];
  }
  
  //Handle string or undefined
  return id;
}

/**
 * Custom hook to safely extract match ID from route params
 */
export function useMatchId(): string | undefined{
  const params = useLocalSearchParams();
  const id = params.id;
  
  if (Array.isArray(id)) {
    return id[0];
  }
  
  return id;
}

/**
 * Generic helper to extract a single param value
 */
export function getParamAsString(param: string | string[] | undefined): string | undefined {
  if (Array.isArray(param)) {
    return param[0];
  }
  return param;
}
