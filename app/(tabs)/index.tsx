import { Ionicons } from '@expo/vector-icons';
import LeagueCard from '@/components/league/LeagueCard';
import { SearchFilterBar } from '@/components/ui/search-filter-bar';
import { SkeletonLeagueCard } from '@/components/ui/skeleton';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useDebounce } from '@/hooks/useDebounce';
import { leagueService } from '@/services/league';
import { useInfiniteQuery } from '@tanstack/react-query';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import { FlatList, Image, RefreshControl, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import TabsBackground from '@/components/tabs/TabsBackground';

export default function HomeScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'round-robin' | 'group-stage'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'upcoming' | 'ongoing' | 'completed'>('all');
  const debouncedSearch = useDebounce(searchQuery, 300);
  const colors = Colors;
  const router = useRouter();
  const { user } = useAuth();

  const { 
    data,
    isLoading,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch
  } = useInfiniteQuery({
    queryKey: ['publicLeagues'],
    queryFn: ({ pageParam = 1 }) => leagueService.getPublicLeagues(pageParam, 5),
    getNextPageParam: (lastPage, allPages) => {
      if (!lastPage || !lastPage.pagination) {
        return undefined;
      }
      const currentPage = lastPage.pagination.page;
      const totalPages = lastPage.pagination.totalPages;
      
      if (currentPage < totalPages) {
        return currentPage + 1;
      }
      
      return undefined;
    },
    retry: false,
    initialPageParam: 1,
  });

  const allLeagues = useMemo(() => {
    if (!data?.pages) return [];
    const leagues = data.pages.flatMap(page => page.leagues || []);
    
    const uniqueLeaguesMap = new Map();
    leagues.forEach((league: any) => {
      if (league._id && !uniqueLeaguesMap.has(league._id)) {
        uniqueLeaguesMap.set(league._id, league);
      }
    });
    
    return Array.from(uniqueLeaguesMap.values());
  }, [data]);

  const normalizeVietnamese = useCallback((str: string): string => {
    if (!str) return '';
    return str
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') 
      .replace(/đ/g, 'd')
      .replace(/Đ/g, 'd');
  }, []);

  const filteredLeagues = useMemo(() => {
    let filtered = allLeagues;

    if (debouncedSearch) {
      const normalizedSearch = normalizeVietnamese(debouncedSearch);
      filtered = filtered.filter((league: any) => {
        const normalizedName = normalizeVietnamese(league.name);
        const normalizedDesc = normalizeVietnamese(league.description || '');
        return normalizedName.includes(normalizedSearch) || normalizedDesc.includes(normalizedSearch);
      });
    }

    if (filterType !== 'all') {
      filtered = filtered.filter((league: any) => league.type === filterType);
    }

    if (filterStatus !== 'all') {
      filtered = filtered.filter((league: any) => league.tournamentStatus === filterStatus);
    }

    return filtered;
  }, [allLeagues, debouncedSearch, filterType, filterStatus, normalizeVietnamese]);

  const handleSearchChange = useCallback((text: string) => {
    setSearchQuery(text);
  }, []);

  const handleTypeChange = useCallback((type: 'all' | 'round-robin' | 'group-stage') => {
    setFilterType(type);
  }, []);

  const handleStatusChange = useCallback((status: 'all' | 'upcoming' | 'ongoing' | 'completed') => {
    setFilterStatus(status);
  }, []);

  const handleLoadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const renderFooter = useCallback(() => {
    if (!isFetchingNextPage) return null;
    
    return (
      <View style={styles.footerLoader}>
        <SkeletonLeagueCard />
      </View>
    );
  }, [isFetchingNextPage]);

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
        {error ? (
          <>
            <Text style={styles.emptyIcon}>🔌</Text>
            <Text style={[styles.emptyTitle, { color: colors.text }]}>
              Không thể tải giải đấu
            </Text>
            <Text style={[styles.emptyText, { color: colors.textSecondary || colors.icon }]}>
              {user 
                ? 'Vui lòng kiểm tra kết nối mạng và thử lại'
                : 'Đăng nhập để xem và tạo giải đấu của bạn'}
            </Text>
          </>
        ) : (
          <>
            <Text style={styles.emptyIcon}>⚽</Text>
            <Text style={[styles.emptyTitle, { color: colors.text }]}>
              Chưa có giải đấu nào
            </Text>
            <Text style={[styles.emptyText, { color: colors.textSecondary || colors.icon }]}>
              {user 
                ? 'Hãy tạo giải đấu đầu tiên của bạn!'
                : 'Đăng nhập để tạo giải đấu mới'}
            </Text>
          </>
        )}
      </View>
    );
  };

  // const renderAuthPrompt = () => {
  //   if (user) return null; // Hide if logged in

  //   return (
  //     <View style={[styles.authPrompt, { backgroundColor: colors.card, borderColor: colors.primary }]}>
  //       <View style={styles.authPromptContent}>
  //         <Ionicons name="person-circle-outline" size={32} color={colors.primary} />
  //         <View style={styles.authPromptText}>
  //           <Text style={[styles.authPromptTitle, { color: colors.text }]}>
  //             Tạo giải đấu của riêng bạn!
  //           </Text>
  //           <Text style={[styles.authPromptSubtitle, { color: colors.textSecondary }]}>
  //             Đăng nhập để tạo và quản lý giải đấu
  //           </Text>
  //         </View>
  //       </View>
  //       <View style={styles.authPromptButtons}>
  //         <TouchableOpacity
  //           style={[styles.authButton, { backgroundColor: colors.primary }]}
  //           onPress={() => router.push('/login')}
  //         >
  //           <Text style={styles.authButtonText}>Đăng nhập</Text>
  //         </TouchableOpacity>
  //         <TouchableOpacity
  //           style={[styles.authButtonOutline, { borderColor: colors.primary }]}
  //           onPress={() => router.push('/register')}
  //         >
  //           <Text style={[styles.authButtonOutlineText, { color: colors.primary }]}>Đăng ký</Text>
  //         </TouchableOpacity>
  //       </View>
  //     </View>
  //   );
  // };

  const listHeaderComponent = useMemo(() => (
    <>
      <SearchFilterBar 
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        filterType={filterType}
        onTypeChange={handleTypeChange}
        filterStatus={filterStatus}
        onStatusChange={handleStatusChange}
      />

      <TouchableOpacity
        style={[styles.privateLeagueButton, { backgroundColor: colors.card, borderColor: colors.primary }]}
        onPress={() => router.push('/league/access-private-league')}
      >
        <Ionicons name="lock-closed" size={20} color={colors.primary} />
        <Text style={[styles.privateLeagueText, { color: colors.primary }]}>
          Truy cập giải riêng tư
        </Text>
        <Ionicons name="arrow-forward" size={16} color={colors.primary} />
      </TouchableOpacity>
    </>
  ), [searchQuery, handleSearchChange, filterType, handleTypeChange, filterStatus, handleStatusChange, colors.card, colors.primary, router]);

  return (
    <TabsBackground>
      <View style={styles.container}>
      <View style={styles.header}>
        
        <View style={styles.headerTop}>
          <View style={styles.headerLeft}>
            <Text style={styles.headerTitle}>Bóng Đá Phủi</Text>
            <Text style={styles.headerSubtitle}>
              {user ? `Xin chào, ${user.fullName || user.username}!` : 'Giải Đấu Công Khai'}
            </Text>
          </View>

          {user ? (
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
          ) : (
            <View style={styles.headerAuthButtons}>
              <TouchableOpacity
                style={styles.headerLoginButton}
                onPress={() => router.push('/login')}
              >
                <Text style={styles.headerLoginText}>Đăng nhập</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.headerRegisterButton}
                onPress={() => router.push('/register')}
              >
                <Text style={styles.headerRegisterText}>Đăng ký</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>

      <FlatList
        data={filteredLeagues}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => <LeagueCard league={item} />}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
        ListHeaderComponent={listHeaderComponent}
        ListEmptyComponent={renderEmptyComponent}
        contentContainerStyle={filteredLeagues.length === 0 ? styles.emptyList : styles.list}
        showsVerticalScrollIndicator={false}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={renderFooter}
        removeClippedSubviews={true}
        maxToRenderPerBatch={10}
        windowSize={5}
        initialNumToRender={5}
        updateCellsBatchingPeriod={50}
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
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLeft: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 6,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  headerSubtitle: {
    fontSize: 15,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.95)',
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  avatarButton: {
    marginLeft: 12,
  },
  avatarContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  avatarText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  headerAuthButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  headerLoginButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  headerLoginText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  headerRegisterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
  },
  headerRegisterText: {
    color: '#000',
    fontSize: 14,
    fontWeight: '600',
  },
  list: {
    paddingTop: 20,
    paddingBottom: 100,
  },
  emptyList: {
    flex: 1,
    paddingTop: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingTop: 100,
  },
  emptyIcon: {
    fontSize: 100,
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  authPrompt: {
    marginHorizontal: 16,
    marginTop: 20,
    marginBottom: 16,
    padding: 16,
    borderRadius: 16,
    borderWidth: 2,
  },
  authPromptContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  authPromptText: {
    flex: 1,
  },
  authPromptTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  authPromptSubtitle: {
    fontSize: 14,
    lineHeight: 20,
  },
  authPromptButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  authButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  authButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  authButtonOutline: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 2,
  },
  authButtonOutlineText: {
    fontSize: 15,
    fontWeight: '600',
  },
  privateLeagueButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    padding: 16,
    marginHorizontal: 20,
    marginTop: 10,
    marginBottom: 20,
    borderRadius: 12,
    borderWidth: 1.5,
  },
  privateLeagueText: {
    fontSize: 15,
    fontWeight: '600',
    flex: 1,
  },
  footerLoader: {
    paddingVertical: 10,
  },
});
