import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { useRouter, Stack } from 'expo-router';
import { useLeagueId } from '@/hooks/useRouteParams';
import React, { useState } from 'react';
import { Alert, FlatList, StyleSheet, Text, TouchableOpacity, View, StatusBar } from 'react-native';
import TeamCard from '../../../components/team/TeamCard';
import { Colors } from '../../../constants/theme';
import { useAuth } from '../../../contexts/AuthContext';
import { useColorScheme } from '../../../hooks/use-color-scheme';
import { useLeagueToken } from '../../../hooks/useLeagueToken';
import { leagueService } from '../../../services/league';
import { teamService } from '../../../services/team';
import LeagueBackground from '../../../components/league/LeagueBackground';

export default function LeagueTeamsScreen() {
  const id = useLeagueId();
  const router = useRouter();
  const { user } = useAuth();
  const colors = Colors;
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const { savedToken, tokenLoaded } = useLeagueToken(id);

  const { data: league } = useQuery({
    queryKey: ['league', id, savedToken],
    queryFn: () => leagueService.getLeagueById(id as string, savedToken || undefined),
    enabled: tokenLoaded,
  });

  const { data, isLoading, error } = useQuery({
    queryKey: ['teams', id, selectedGroup, savedToken],
    queryFn: () => selectedGroup 
     ? teamService.getTeamsByGroup(id as string, selectedGroup, savedToken || undefined)
      : teamService.getTeamsByLeague(id as string, savedToken || undefined),
    enabled: tokenLoaded,
    retry: (failureCount, error: any) => {
      if (error.message?.includes('timeout') && failureCount < 3) {
        return true;
      }
      return false;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  const groups = league?.groupSettings
    ? Array.from({ length: league.groupSettings.numberOfGroups }, (_, i) =>
        String.fromCharCode(65 + i)
      )
    : [];

  const isOwner = user?._id === league?.owner?._id;
  const isGroupStage = league?.type === 'group-stage';
  const teamsCount = data?.teams?.length || 0;
  const requiredTeams = league?.numberOfTeams || 0;
  const canAssignGroups = isGroupStage && teamsCount >= requiredTeams && isOwner;
  
  const hasAssignedGroups = data?.teams?.some((team: any) => team.group !== null) || false;
  
  const [openMenuTeamId, setOpenMenuTeamId] = useState<string | null>(null);

  const handleAssignGroups = () => {
    if (!canAssignGroups) return;
    
    Alert.alert(
      'Phân bảng tự động',
      'Bạn có muốn phân bảng tự động cho các đội?',
      [
        { text: 'Hủy', style: 'cancel' },
        { 
          text: 'Phân bảng', 
          onPress: () => router.push(`/league/${id}/assign-groups` as any)
        }
      ]
    );
  };

  return (
    <>
      <StatusBar 
        backgroundColor="rgba(214, 18, 64, 1)"
        barStyle="light-content"
      />
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: `Đội bóng (${teamsCount}/${requiredTeams})`,
          headerStyle: { 
            backgroundColor: 'rgba(214, 18, 64, 1)',
          },
          headerTintColor: '#FFFFFF',
          headerTitleStyle: {
            color: '#FFFFFF',
            fontWeight: '600',
          },
          headerRight: () => isOwner ? (
            <View style={styles.headerActions}>
              {canAssignGroups && (
                <TouchableOpacity
                  onPress={handleAssignGroups}
                  style={[styles.headerButton, { marginRight: 10 }]}
                >
                  <Ionicons name="grid-outline" size={22} color="#FFFFFF" />
                </TouchableOpacity>
              )}
              <TouchableOpacity
                onPress={() => router.push(`/league/${id}/add-team`)}
                style={styles.headerButton}
              >
                <Ionicons name="add" size={24} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          ) : null,
        }}
      />
      
      <LeagueBackground>
        <View style={styles.container}>
        {isGroupStage && hasAssignedGroups && groups.length > 0 && (
          <View style={styles.filtersContainer}>
            <FlatList
              horizontal
              data={[{ id: 'all', label: 'Tất cả' }, ...groups.map(g => ({ id: g, label: `Bảng ${g}` }))]}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.filterChip,
                    (item.id === 'all' ? !selectedGroup : selectedGroup === item.id) && styles.filterChipActive
                  ]}
                  onPress={() => setSelectedGroup(item.id === 'all' ? null : item.id)}
                  activeOpacity={0.7}
                >
                  <Text style={[
                    styles.filterText,
                    (item.id === 'all' ? !selectedGroup : selectedGroup === item.id) && styles.filterTextActive
                  ]}>
                    {item.label}
                  </Text>
                </TouchableOpacity>
              )}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filtersContent}
            />
          </View>
        )}

        <FlatList
          data={data?.teams || []}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <TeamCard
              team={item}
              onPress={() => router.push(`/team/${item._id}` as any)}
              onEdit={() => router.push(`/team/${item._id}/edit` as any)}
              showActions={isOwner}
              leagueId={id as string}
              isMenuOpen={openMenuTeamId === item._id}
              onToggleMenu={() => setOpenMenuTeamId(openMenuTeamId === item._id ? null : item._id)}
            />
          )}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <View style={styles.emptyCard}>
                <View style={styles.emptyIconContainer}>
                  <Ionicons name="people-outline" size={48} color="rgba(255, 255, 255, 0.6)" />
                </View>
                <Text style={styles.emptyTitle}>
                  {isLoading ? 'Đang tải...' : 
                   error ? 'Không thể tải danh sách đội' : 
                   'Chưa có đội bóng nào'}
                </Text>
                {!isLoading && !error && (
                  <Text style={styles.emptySubtitle}>
                    Thêm đội để bắt đầu giải đấu của bạn
                  </Text>
                )}
                {isOwner && !isLoading && (
                  <TouchableOpacity
                    style={styles.addButton}
                    onPress={() => router.push(`/league/${id}/add-team`)}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="add-circle" size={20} color="#FFFFFF" />
                    <Text style={styles.addButtonText}>Thêm đội bóng</Text>
                  </TouchableOpacity>
                )}
              </View>
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
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 15,
  },
  headerButton: {
  },
  ownerActionsContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  ownerActions: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.29)',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 5,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 18,
    paddingHorizontal: 20,
    backgroundColor: 'rgba(255, 149, 0, 0.15)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  actionButtonIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 0, 34, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 0, 0, 0.3)',
  },
  actionButtonSecondary: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#ff0000ff',
  },
  actionButtonDisabled: {
    opacity: 0.4,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
    marginLeft: 12,
  },
  actionButtonTextSecondary: {
    fontSize: 14,
    fontWeight: '600',
  },
  warning: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    gap: 10,
    backgroundColor: 'rgba(255, 165, 0, 0.12)',
  },
  warningText: {
    fontSize: 13,
    flex: 1,
    color: '#ff0000ff',
    fontWeight: '500',
    lineHeight: 18,
  },
  filtersContainer: {
    paddingVertical: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  filtersContent: {
    paddingHorizontal: 16,
    gap: 10,
  },
  filterChip: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    marginRight: 10,
  },
  filterChipActive: {
    backgroundColor: '#ff0000ff',
    borderColor: '#ff0000ff',
    shadowColor: '#ff0000ff',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  filterText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.7)',
  },
  filterTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  list: {
    padding: 15,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  emptyCard: {
    backgroundColor: 'rgba(0, 0, 0, 0.27)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.37)',
    padding: 32,
    alignItems: 'center',
    width: '100%',
    maxWidth: 400,
    shadowColor: '#330f0f6b',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 4,
  },
  emptyIconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    backgroundColor: 'rgba(255, 0, 0, 0.15)',
    borderWidth: 2,
    borderColor: 'rgba(255, 0, 0, 0.3)',
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.95)',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    fontWeight: '400',
    color: 'rgba(255, 255, 255, 0.6)',
    marginBottom: 24,
    textAlign: 'center',
    lineHeight: 20,
  },
  emptyText: {
    fontSize: 16,
    marginTop: 8,
    marginBottom: 24,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '500',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#ff0000ff',
    shadowColor: '#ff0000ff',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});