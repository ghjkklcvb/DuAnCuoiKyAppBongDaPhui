import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Stack, useRouter, useSegments } from 'expo-router';
import { useEffect } from 'react';
import FlashMessage from 'react-native-flash-message';
import { OfflineIndicator } from '../components/ui/offline-indicator';
import { AuthProvider, useAuth } from '../contexts/AuthContext';
import { FavoritesProvider } from '../contexts/FavoritesContext';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 5 * 60 * 1000, 
    },
  },
});

function RootLayoutNav() {
  const { user, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading) {
      return;
    }

    const inAuthGroup = segments[0] === '(auth)';
    const inTabsGroup = segments[0] === '(tabs)';
    const currentTab = String(segments[1] || 'index');
    const onHomeScreen = inTabsGroup && (currentTab === 'index' || !segments[1]);
    
    const isPublicRoute = 
      onHomeScreen ||
      segments[0] === 'league' || 
      segments[0] === 'team' || 
      segments[0] === 'match' || 
      (inTabsGroup && currentTab === 'index'); 

    if (!segments[0]) {
      router.replace('/(tabs)');
      return;
    }

    if (!user && !inAuthGroup && !isPublicRoute) {
      router.replace('/login');
    } else if (user && inAuthGroup) {
      router.replace('/(tabs)');
    }
  }, [user, loading, segments, router]);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(tabs)" />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <FavoritesProvider>
          <RootLayoutNav />
          <FlashMessage position="top" />
          <OfflineIndicator />
        </FavoritesProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
