import { Ionicons } from '@expo/vector-icons';
import LeagueCard from '@/components/league/LeagueCard';
import { SkeletonLeagueCard } from '@/components/ui/skeleton';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useFavorites } from '@/contexts/FavoritesContext';
import { useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '@/contexts/AuthContext';
import TabsBackground from '@/components/tabs/TabsBackground';

export default function FavoritesScreen() {
  const colors = Colors;
  const router = useRouter();
  const { user } = useAuth();
  const { favorites, isLoading } = useFavorites();

  useEffect(() => {
    console.log('🌟 Favorites Screen - Data:', {
      favoritesCount: favorites.length,
      favorites: favorites,
      isLoading,
    });
  }, [favorites, isLoading]);

  const renderEmptyComponent = () => {
    if (isLoading) {
      return (
        <View style={{ padding: 16 }}>
          <SkeletonLeagueCard />
          <SkeletonLeagueCard />
          <SkeletonLeagueCard />
        </View>
      );
    }

    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyIcon}>⭐</Text>
        <Text style={[styles.emptyTitle, { color: "#FFFFFF" }]}>
          Chưa có giải quan tâm
        </Text>
        <Text style={[styles.emptyText, { color: '#d6b6b6ff' }]}>
          Nhấn vào ngôi sao trên thẻ giải đấu để thêm vào danh sách quan tâm
        </Text>
        <TouchableOpacity
          style={[styles.exploreButton, { backgroundColor: colors.primary }]}
          onPress={() => router.push('/')}
        >
          <Ionicons name="search" size={20} color="#fff" />
          <Text style={styles.exploreButtonText}>Khám phá giải đấu</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <TabsBackground>
      <View style={styles.container}>
      <View style={styles.header}>
        
        <View style={styles.headerTop}>
          <View style={styles.headerLeft}>
            <Text style={styles.headerTitle}>Giải Quan Tâm</Text>
            <Text style={styles.headerSubtitle}>
              {favorites.length > 0 
                ? `${favorites.length} giải đấu` 
                : 'Chưa có giải nào'}
            </Text>
          </View>

          {user && (
            <TouchableOpacity
              style={styles.avatarButton}
              onPress={() => router.push('/(tabs)/profile')}
            >
              {user.avatar ? (
                <Image 
                  source={{ uri: user.avatar }} 
                  style={styles.avatarContainer}
                />
              ) : (
                <View style={styles.avatarContainer}>
                  <Text style={styles.avatarText}>
                    {(user.fullName || user.username)?.charAt(0).toUpperCase() || 'U'}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          )}
        </View>
      </View>

      <FlatList
        data={favorites}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => {
          const league = {
            _id: item._id,
            name: item.name,
            logo: item.logo,
            type: item.type,
            visibility: item.visibility,
            description: item.description || '',
            numberOfTeams: item.numberOfTeams || 0,
            teams: new Array(item.teamsCount || 0).fill(null), 
            tournamentStatus: 'ongoing',
          };
          return <LeagueCard league={league as any} />;
        }}
        ListEmptyComponent={renderEmptyComponent}
        contentContainerStyle={favorites.length === 0 ? styles.emptyList : styles.list}
        showsVerticalScrollIndicator={false}
      />
      </View>
    </TabsBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 24,
    backgroundColor: 'transparent',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  avatarButton: {
    marginLeft: 12,
  },
  avatarContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  avatarText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  list: {
    paddingVertical: 16,
    paddingBottom: 100,
  },
  emptyList: {
    flexGrow: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyIcon: {
    fontSize: 100,
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 22,
  },
  exploreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  exploreButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
