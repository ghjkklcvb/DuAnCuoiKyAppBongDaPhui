import { useQuery } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text, View, StatusBar } from 'react-native';
import TopTeamCard from '../../../components/stats/TopTeamCard';
import { Colors } from '../../../constants/theme';
import { useColorScheme } from '../../../hooks/use-color-scheme';
import { useLeagueId } from '../../../hooks/useRouteParams';
import { standingsService } from '../../../services/standings';
import LeagueBackground from '../../../components/league/LeagueBackground';

export default function StatisticsScreen() {
  const id = useLeagueId();
  const colors = Colors;

  const { data: stats, isLoading } = useQuery({
    queryKey: ['leagueStats', id],
    queryFn: () => standingsService.getLeagueStats(id as string),
  });

  const calculateFormPoints = (form: any): number => {
    if (!form) return 0;
    
    const formString = Array.isArray(form) ? form.join('') : String(form);
    
    return formString.split('').reduce((total, result) => {
      if (result === 'W') return total + 3;
      if (result === 'D') return total + 1;
      return total;
    }, 0);
  };

  const sortedStats = React.useMemo(() => {
    if (!stats) return null;

    return {
      ...stats,
      topScorers: stats.topScorers ? [...stats.topScorers].sort((a: any, b: any) => {
        return (b.stats?.goalsFor || 0) - (a.stats?.goalsFor || 0);
      }) : [],
      
      bestDefense: stats.bestDefense ? [...stats.bestDefense].sort((a: any, b: any) => {
        return (a.stats?.goalsAgainst || 0) - (b.stats?.goalsAgainst || 0);
      }) : [],

      bestForm: stats.bestForm ? [...stats.bestForm].sort((a: any, b: any) => {
        const aPoints = calculateFormPoints(a.form);
        const bPoints = calculateFormPoints(b.form);
        return bPoints - aPoints;
      }) : [],
    };
  }, [stats]);

  if (isLoading) {
    return (
    <>
      <StatusBar 
        backgroundColor="rgba(214, 18, 64, 1)"
        barStyle="light-content"
      />
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: 'Thống kê',
          headerStyle: { 
            backgroundColor: 'rgba(214, 18, 64, 1)',
          },
          headerTintColor: '#FFFFFF',
          headerTitleStyle: {
            color: '#FFFFFF',
            fontWeight: '600',
          },
        }}
      />
      <LeagueBackground>
        <View style={styles.loading}>
          <Text style={styles.loadingText}>Đang tải...</Text>
        </View>
      </LeagueBackground>
    </>
    );
  }

  return (
    <>
      <StatusBar 
        backgroundColor="rgba(214, 18, 64, 1)"
        barStyle="light-content"
      />
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: 'Thống Kê',
          headerStyle: { 
            backgroundColor: 'rgba(214, 18, 64, 1)',
          },
          headerTintColor: '#FFFFFF',
          headerTitleStyle: {
            color: '#FFFFFF',
            fontWeight: '600',
          },
        }}
      />
      
      <LeagueBackground>
        <ScrollView style={styles.container}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Tổng quan</Text>
            <View style={styles.statsGrid}>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>
                  {sortedStats?.stats?.totalTeams || 0}
                </Text>
                <Text style={styles.statLabel}>Đội</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>
                  {sortedStats?.stats?.matchesPlayed || 0}
                </Text>
                <Text style={styles.statLabel}>Trận đã đấu</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>
                  {sortedStats?.stats?.totalGoals || 0}
                </Text>
                <Text style={styles.statLabel}>Bàn thắng</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>
                  {sortedStats?.stats?.averageGoalsPerMatch?.toFixed(1) || '0.0'}
                </Text>
                <Text style={styles.statLabel}>TB bàn/trận</Text>
              </View>
            </View>
          </View>

          {sortedStats?.topScorers && sortedStats.topScorers.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Tấn công tốt nhất</Text>
              {sortedStats.topScorers.map((item: any, index: number) => (
                <TopTeamCard
                  key={item.team._id}
                  position={index + 1}
                  team={item.team}
                  value={item.stats?.goalsFor || 0}
                  label="bàn thắng"
                  color={colors.win}
                />
              ))}
            </View>
          )}

          {sortedStats?.bestDefense && sortedStats.bestDefense.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Phòng thủ tốt nhất</Text>
              {sortedStats.bestDefense.map((item: any, index: number) => (
                <TopTeamCard
                  key={item.team._id}
                  position={index + 1}
                  team={item.team}
                  value={item.stats?.goalsAgainst || 0}
                  label="bàn thua"
                  color={colors.secondary}
                />
              ))}
            </View>
          )}

          {sortedStats?.bestForm && sortedStats.bestForm.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Phong độ tốt nhất</Text>
              {sortedStats.bestForm.map((item: any, index: number) => (
                <TopTeamCard
                  key={item.team._id}
                  position={index + 1}
                  team={item.team}
                  form={item.form}
                  color={colors.win}
                />
              ))}
            </View>
          )}

          {!sortedStats?.topScorers?.length && !sortedStats?.bestDefense?.length && !sortedStats?.bestForm?.length && (
            <View style={styles.empty}>
              <Text style={styles.emptyText}>
                Chưa có dữ liệu thống kê
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
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  section: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: 'rgba(255, 255, 255, 0.95)',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  statCard: {
    width: '48%',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(214, 18, 64, 0.1)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  statValue: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#B91C3C',
  },
  statLabel: {
    fontSize: 14,
    color: '#6B7280',
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