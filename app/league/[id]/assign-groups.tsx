import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Stack, useRouter } from 'expo-router';
import React from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View, Platform, StatusBar } from 'react-native';
import { Colors } from '../../../constants/theme';
import { useColorScheme } from '../../../hooks/use-color-scheme';
import { useLeagueId } from '../../../hooks/useRouteParams';
import { leagueService } from '../../../services/league';
import { teamService } from '../../../services/team';
import LeagueBackground from '../../../components/league/LeagueBackground';

export default function AssignGroupsScreen() {
  const id = useLeagueId();
  const router = useRouter();
  const queryClient = useQueryClient();
  const colors = Colors;

  const { data: league } = useQuery({
    queryKey: ['league', id],
    queryFn: () => leagueService.getLeagueById(id as string),
  });

  const { data: teams } = useQuery({
    queryKey: ['teams', id],
    queryFn: () => teamService.getTeamsByLeague(id as string),
  });

  const assignMutation = useMutation({
    mutationFn: () => teamService.assignGroups(id as string),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams', id] });
      queryClient.invalidateQueries({ queryKey: ['league', id] }); 
      queryClient.invalidateQueries({ queryKey: ['group-standings', id] }); 
      Alert.alert('Thành công', 'Đã phân bảng tự động', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    },
    onError: (error: any) => {
      Alert.alert('Lỗi', error.response?.data?.message || 'Không thể phân bảng');
    },
  });

  const resetMutation = useMutation({
    mutationFn: () => teamService.resetGroups(id as string),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams', id] });
      queryClient.invalidateQueries({ queryKey: ['league', id] }); 
      queryClient.invalidateQueries({ queryKey: ['group-standings', id] }); 
      Alert.alert('Thành công', 'Đã reset phân bảng');
    },
  });

  const handleAssign = () => {
    const teamsCount = teams?.teams?.length || 0;
    const requiredTeams = league?.numberOfTeams || 0;

    if (teamsCount < requiredTeams) {
      Alert.alert(
        'Chưa đủ đội',
        `Cần ${requiredTeams} đội, hiện có ${teamsCount} đội`
      );
      return;
    }

    Alert.alert(
      'Xác nhận',
      'Phân bảng tự động sẽ chia đều các đội vào các bảng. Tiếp tục?',
      [
        { text: 'Hủy', style: 'cancel' },
        { text: 'Phân bảng', onPress: () => assignMutation.mutate() }
      ]
    );
  };

  const handleReset = () => {
    Alert.alert(
      'Xác nhận',
      'Reset phân bảng sẽ xóa tất cả phân bổ hiện tại. Tiếp tục?',
      [
        { text: 'Hủy', style: 'cancel' },
        { text: 'Reset', style: 'destructive', onPress: () => resetMutation.mutate() }
      ]
    );
  };

  const teamsCount = teams?.teams?.length || 0;
  const requiredTeams = league?.numberOfTeams || 0;
  const canAssign = teamsCount >= requiredTeams;

  return (
    <>
      <StatusBar 
        backgroundColor="rgba(214, 18, 64, 1)"
        barStyle="light-content"
      />
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: 'Phân Bảng Tự Động',
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
          <View style={styles.infoCard}>
            <Text style={styles.cardTitle}>Thông tin cấu hình</Text>
            
            <View style={styles.infoGrid}>
              <View style={styles.infoItem}>
                <Text style={styles.infoValue}>
                  {league?.groupSettings?.numberOfGroups}
                </Text>
                <Text style={styles.infoLabel}>Số bảng</Text>
              </View>
              
              <View style={styles.divider} />
              
              <View style={styles.infoItem}>
                <Text style={styles.infoValue}>
                  {league?.groupSettings?.teamsPerGroup}
                </Text>
                <Text style={styles.infoLabel}>Đội/bảng</Text>
              </View>
              
              <View style={styles.divider} />
              
              <View style={styles.infoItem}>
                <Text style={styles.infoValue}>
                  {requiredTeams}
                </Text>
                <Text style={styles.infoLabel}>Tổng cần</Text>
              </View>
            </View>
          </View>

          <View style={styles.statusCard}>
            <View style={styles.statusRow}>
              <Text style={styles.statusLabel}>Số đội hiện có:</Text>
              <Text style={[
                styles.statusValue,
                { color: canAssign ? '#34C759' : '#FF3B30' }
              ]}>
                {teamsCount} / {requiredTeams}
              </Text>
            </View>
            
            {!canAssign && (
              <View style={styles.warning}>
                <Text style={styles.warningText}>
                  Cần thêm {requiredTeams - teamsCount} đội để có thể phân bảng
                </Text>
              </View>
            )}
          </View>

          <View style={styles.instructionsCard}>
            <Text style={styles.instructionsTitle}>Cách thức phân bảng</Text>
            <View style={styles.instructionsList}>
              <View style={styles.instructionItem}>
                <View style={styles.bullet} />
                <Text style={styles.instructionText}>
                  Các đội sẽ được phân đều vào {league?.groupSettings?.numberOfGroups} bảng
                </Text>
              </View>
              <View style={styles.instructionItem}>
                <View style={styles.bullet} />
                <Text style={styles.instructionText}>
                  Mỗi bảng có {league?.groupSettings?.teamsPerGroup} đội
                </Text>
              </View>
              <View style={styles.instructionItem}>
                <View style={styles.bullet} />
                <Text style={styles.instructionText}>
                  Phân bổ ngẫu nhiên đảm bảo công bằng
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.actions}>
            <TouchableOpacity
              style={[
                styles.button,
                styles.buttonPrimary,
                !canAssign && styles.buttonDisabled
              ]}
              onPress={handleAssign}
              disabled={!canAssign || assignMutation.isPending}
              activeOpacity={0.8}
            >
              <Text style={styles.buttonText}>
                {assignMutation.isPending ? 'Đang xử lý...' : 'Phân bảng tự động'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.buttonSecondary]}
              onPress={handleReset}
              disabled={resetMutation.isPending}
              activeOpacity={0.8}
            >
              <Text style={styles.buttonSecondaryText}>
                {resetMutation.isPending ? 'Đang xử lý...' : 'Reset phân bảng'}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </LeagueBackground>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  infoCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    backgroundColor: '#FAF5FF',
    borderWidth: 1,
    borderColor: 'rgba(168, 85, 247, 0.2)',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 20,
    letterSpacing: 0.2,
    color: '#6B21A8',
  },
  infoGrid: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  infoItem: {
    alignItems: 'center',
    flex: 1,
  },
  infoValue: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 6,
    color: '#A855F7',
  },
  infoLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: '#7C3AED',
  },
  divider: {
    width: 1,
    height: 40,
    marginHorizontal: 8,
    backgroundColor: 'rgba(168, 85, 247, 0.2)',
  },
  statusCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(214, 18, 64, 0.1)',
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusLabel: {
    fontSize: 15,
    fontWeight: '500',
    color: '#6B7280',
  },
  statusValue: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  warning: {
    padding: 14,
    borderRadius: 10,
    marginTop: 14,
    borderLeftWidth: 4,
    borderLeftColor: '#F59E0B',
    backgroundColor: '#FEF3C7',
  },
  warningText: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
    color: '#92400E',
  },
  instructionsCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    backgroundColor: '#F0F9FF',
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.2)',
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 16,
    letterSpacing: 0.1,
    color: '#1E40AF',
  },
  instructionsList: {
    gap: 12,
  },
  instructionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  bullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 6,
    backgroundColor: '#3B82F6',
  },
  instructionText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    color: '#1E40AF',
  },
  actions: {
    gap: 12,
    paddingBottom: 16,
  },
  button: {
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonPrimary: {
    backgroundColor: '#B91C3C',
    ...Platform.select({
      ios: {
        shadowColor: '#B91C3C',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonSecondary: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#FF3B30',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  buttonSecondaryText: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.2,
    color: '#FF3B30',
  },
});