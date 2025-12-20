import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Stack, useLocalSearchParams } from 'expo-router';
import React, { useState, useCallback, useEffect } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import StandingsTable from '../../../components/standings/StandingsTable';
import { Colors } from '../../../constants/theme';
import { useColorScheme } from '../../../hooks/use-color-scheme';
import { standingsService } from '../../../services/standings';
import LeagueBackground from '../../../components/league/LeagueBackground';
import { useFocusEffect } from '@react-navigation/native';
import { getLeagueToken } from '@/utils/leagueLink';

export default function StandingsScreen() {
  const { id } = useLocalSearchParams();
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const colors = Colors;
  const queryClient = useQueryClient();
  const [savedToken, setSavedToken] = useState<string | null>(null);
  const [tokenLoaded, setTokenLoaded] = useState(false);

  useEffect(() => {
    const loadToken = async () => {
      try {
        const token = await getLeagueToken(id as string);
        setSavedToken(token);
      } catch (error) {
        console.error('Error loading saved token:', error);
      } finally {
        setTokenLoaded(true);
      }
    };
    loadToken();
  }, [id]);

  const { data: leagueInfo } = useQuery({
    queryKey: ['league-standings-info', id, savedToken],
    queryFn: async () => {
      const response = await standingsService.getStandings(id as string, savedToken || undefined);
      return response;
    },
    enabled: tokenLoaded,
  });

  const isGroupStage = leagueInfo?.league?.type === 'group-stage';

  const { data: standings, isLoading } = useQuery({
    queryKey: ['standings', id, selectedGroup, isGroupStage, savedToken],
    queryFn: () => {
      if (selectedGroup) {
        return standingsService.getGroupStandings(id as string, selectedGroup, savedToken || undefined);
      }
      if (isGroupStage) {
        return standingsService.getAllGroupsStandings(id as string, savedToken || undefined);
      }
      return standingsService.getStandings(id as string, savedToken || undefined);
    },
    enabled: leagueInfo !== undefined && tokenLoaded,
  });

  const groups = isGroupStage && leagueInfo?.league?.groupSettings
    ? Array.from({ length: leagueInfo.league.groupSettings.numberOfGroups },
        (_, i) => String.fromCharCode(65 + i))
    : [];

  useFocusEffect(
    useCallback(() => {
      queryClient.invalidateQueries({ queryKey: ['standings', id] });
      queryClient.invalidateQueries({ queryKey: ['league-standings-info', id] });
    }, [queryClient, id])
  );

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: 'Bảng Xếp Hạng',
          headerStyle: { 
            backgroundColor: 'rgba(214, 18, 64, 1)',
          },
          headerTintColor: '#FFFFFF',
          headerTitleStyle: {
            color: '#FFFFFF',
            fontWeight: '600',
          },
          headerTransparent: false,
          headerBlurEffect: undefined,
          headerShadowVisible: false,
          contentStyle: {
            backgroundColor: 'transparent',
          },
        }}
      />
      
      <LeagueBackground>
        <ScrollView style={styles.container}>
          {isGroupStage && groups.length > 0 && (
            <View style={[styles.tabs, { borderBottomColor: colors.border, backgroundColor: colors.background }]}>
              <TouchableOpacity
                style={[
                  styles.tab,
                  !selectedGroup && [styles.tabActive, { borderBottomColor: colors.primary }]
                ]}
                onPress={() => setSelectedGroup(null)}
              >
                <Text style={[
                  styles.tabText,
                  { color: colors.textSecondary },
                  !selectedGroup && [styles.tabTextActive, { color: colors.primary }]
                ]}>
                  Tất cả
                </Text>
              </TouchableOpacity>
              {groups.map((group) => (
                <TouchableOpacity
                  key={group}
                  style={[
                    styles.tab,
                    selectedGroup === group && [styles.tabActive, { borderBottomColor: colors.primary }]
                  ]}
                  onPress={() => setSelectedGroup(group)}
                >
                  <Text style={[
                    styles.tabText,
                    { color: colors.textSecondary },
                    selectedGroup === group && [styles.tabTextActive, { color: colors.primary }]
                  ]}>
                    Bảng {group}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {isLoading ? (
            <View style={styles.loading}>
              <Text style={styles.loadingText}>Đang tải...</Text>
            </View>
          ) : selectedGroup && standings?.standings ? (
            <View style={styles.tableContainer}>
              <StandingsTable standings={standings.standings} />
            </View>
          ) : !selectedGroup && isGroupStage && standings?.groups ? (
            <View>
              {Object.entries(standings.groups).map(([group, teams]: [string, any]) => (
                <View key={group} style={styles.groupSection}>
                  <Text style={styles.groupTitle}>Bảng {group}</Text>
                  <StandingsTable standings={teams} />
                </View>
              ))}
            </View>
          ) : standings?.standings ? (
            <View style={styles.tableContainer}>
              <StandingsTable standings={standings.standings} />
            </View>
          ) : (
            <View style={styles.empty}>
              <Text style={styles.emptyText}>
                Chưa có dữ liệu xếp hạng
              </Text>
            </View>
          )}
        </ScrollView>
      </LeagueBackground>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tabs: {
    flexDirection: 'row',
    borderBottomWidth: 1,
  },
  tab: {
    flex: 1,
    paddingVertical: 15,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
  },
  tabText: {
    fontSize: 14,
  },
  tabTextActive: {
    fontWeight: '600',
  },
  loading: {
    padding: 50,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  tableContainer: {
    padding: 16,
  },
  groupSection: {
    paddingHorizontal: 16,
    paddingTop: 0,
    paddingBottom: 20,
  },
  groupTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
    marginTop: 20,
    color: 'rgba(255, 255, 255, 0.95)',
    letterSpacing: 0.3,
  },
  empty: {
    padding: 50,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.7)',
  },
});