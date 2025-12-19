import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { Stack, useRouter } from 'expo-router';
import React, { useState, useMemo } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View, StatusBar } from 'react-native';
import MatchCard from '../../../components/match/MatchCard';
import { Colors } from '../../../constants/theme';
import { useColorScheme } from '../../../hooks/use-color-scheme';
import { useLeagueId } from '../../../hooks/useRouteParams';
import { matchService } from '../../../services/match';
import LeagueBackground from '../../../components/league/LeagueBackground';

export default function MatchesListScreen() {
  const id = useLeagueId();
  const router = useRouter();
  const colors = Colors;
  const [selectedRound, setSelectedRound] = useState<number | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);

  const { data: allMatchesData } = useQuery({
    queryKey: ['matches', id],
    queryFn: () => matchService.getMatchesByLeague(id as string),
    staleTime: 30000, 
  });

  const { data, isLoading, error } = useQuery({
    queryKey: ['matches', id, selectedRound, selectedStatus],
    queryFn: () => matchService.getMatchesByLeague(id as string, undefined, {
      round: selectedRound || undefined,
      status: selectedStatus || undefined,
    }),
    retry: (failureCount, error: any) => {
      if (error.message?.includes('timeout') && failureCount < 3) {
        return true;
      }
      return false;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  const rounds = useMemo(() => {
    if (!allMatchesData?.matches) return [];
    return [...new Set(allMatchesData.matches.map((m: any) => m.round))].sort((a: any, b: any) => a - b);
  }, [allMatchesData]);

  const statuses = [
    { value: 'scheduled', label: 'Sắp đấu' },
    { value: 'live', label: 'Đang đấu' },
    { value: 'finished', label: 'Đã đấu' },
  ];

  return (
    <>
      <StatusBar 
        backgroundColor="rgba(214, 18, 64, 1)"
        barStyle="light-content"
      />
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: 'Lịch thi đấu',
          headerStyle: { 
            backgroundColor: 'rgba(214, 18, 64, 1)',
          },
          headerTintColor: '#FFFFFF',
          headerTitleStyle: {
            color: '#FFFFFF',
            fontWeight: '600',
          },
          headerRight: () => (
            <TouchableOpacity
              onPress={() => router.push(`/league/${id}/standings` as any)}
              style={{ marginRight: 16, flexDirection: 'row', alignItems: 'center', gap: 4 }}
            >
              <Ionicons name="podium-outline" size={20} style={{marginLeft:15}} color="#FFFFFF" />
              <Text style={{ color: '#FFFFFF', fontSize: 14, fontWeight: '600'}}>BXH</Text>
            </TouchableOpacity>
          ),
        }}
      />
      
      <LeagueBackground>
        <View style={styles.container}>
        {rounds.length > 0 && (
          <View style={styles.filters}>
            <Text style={[styles.filterTitle, { color: '#FFFFFF' }]}>Vòng đấu:</Text>
            <FlatList
              horizontal
              data={[
                { value: null, label: 'Tất cả' },
                ...rounds.map(r => ({ value: r, label: `Vòng ${r}` }))
              ]}
              keyExtractor={(item) => String(item.value)}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.filterChip,
                    selectedRound === item.value && styles.filterChipActive
                  ]}
                  onPress={() => setSelectedRound(item.value as number | null)}
                >
                  <Text style={[
                    styles.filterText,
                    { color: selectedRound === item.value ? '#FFFFFF' : 'rgba(255, 255, 255, 0.7)' },
                    selectedRound === item.value && styles.filterTextActive
                  ]}>
                    {item.label}
                  </Text>
                </TouchableOpacity>
              )}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filterList}
            />
          </View>
        )}

        <View style={styles.filters}>
          <Text style={[styles.filterTitle, { color: '#FFFFFF' }]}>Trạng thái:</Text>
          <View style={styles.filterRow}>
            <TouchableOpacity
              style={[
                styles.filterChip,
                !selectedStatus && styles.filterChipActive
              ]}
              onPress={() => setSelectedStatus(null)}
            >
              <Text style={[
                styles.filterText,
                { color: !selectedStatus ? '#FFFFFF' : 'rgba(255, 255, 255, 0.7)' },
                !selectedStatus && styles.filterTextActive
              ]}>
                Tất cả
              </Text>
            </TouchableOpacity>
            
            {statuses.map((status) => (
              <TouchableOpacity
                key={status.value}
                style={[
                  styles.filterChip,
                  selectedStatus === status.value && styles.filterChipActive
                ]}
                onPress={() => setSelectedStatus(status.value)}
              >
                <Text style={[
                  styles.filterText,
                  { color: selectedStatus === status.value ? '#FFFFFF' : 'rgba(255, 255, 255, 0.7)' },
                  selectedStatus === status.value && styles.filterTextActive
                ]}>
                  {status.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <FlatList
          data={data?.matches || []}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <MatchCard
              match={item}
              onPress={() => router.push(`/match/${item._id}` as any)}
            />
          )}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={[styles.emptyText, { color: 'rgba(255, 255, 255, 0.7)' }]}>
                {isLoading ? 'Đang tải...' : 
                 error ? 'Không thể tải danh sách trận đấu. Vui lòng thử lại.' : 
                 'Chưa có trận đấu nào'}
              </Text>
            </View>
          }
        />
        </View>
      </LeagueBackground>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  filters: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  filterTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 10,
    letterSpacing: 0.5,
  },
  filterList: {
    gap: 8,
  },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 2,
    backgroundColor: 'rgba(70, 22, 22, 0.6)',
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  filterChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterText: {
    fontSize: 13,
  },
  filterTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  list: {
    padding: 15,
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 100,
  },
  emptyText: {
    fontSize: 16,
  },
});