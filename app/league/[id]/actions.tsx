import { Ionicons } from '@expo/vector-icons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Stack, useRouter } from 'expo-router';
import React from 'react';
import { Alert, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View, StatusBar } from 'react-native';
import { Colors } from '../../../constants/theme';
import { useColorScheme } from '../../../hooks/use-color-scheme';
import { useToast } from '../../../hooks/useToast';
import { useLeagueId } from '../../../hooks/useRouteParams';
import { leagueService } from '../../../services/league';
import { matchService } from '../../../services/match';
import LeagueBackground from '../../../components/league/LeagueBackground';

export default function LeagueActionsScreen() {
  const id = useLeagueId();
  const router = useRouter();
  const queryClient = useQueryClient();
  const colors = Colors;
  const toast = useToast();

  const { data: leagueData } = useQuery({
    queryKey: ['league', id],
    queryFn: () => leagueService.getLeagueById(id as string),
  });

  const { data: matchesData } = useQuery({
    queryKey: ['matches', id],
    queryFn: () => matchService.getMatchesByLeague(id as string),
  });

  const league = leagueData?.league;
  const matches = matchesData?.matches || [];
  const finishedMatches = matches.filter((m: any) => m.status === 'finished').length;
  const totalMatches = matches.length;

  const resetAllMutation = useMutation({
    mutationFn: () => matchService.resetAllMatches(id as string),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['matches', id] });
      queryClient.invalidateQueries({ queryKey: ['teams', id] });
      queryClient.invalidateQueries({ queryKey: ['standings', id] });
      queryClient.invalidateQueries({ queryKey: ['group-standings', id] });
      queryClient.invalidateQueries({ queryKey: ['statistics', id] });
      queryClient.invalidateQueries({ queryKey: ['league', id] });
      toast.showSuccess(
        'Thành công',
        `Đã reset ${data.totalMatchesReset || 0} trận đấu. Stats của tất cả đội đã về 0.`
      );
    },
    onError: (error: any) => {
      toast.showError('Lỗi', error.response?.data?.message || 'Không thể reset kết quả');
    },
  });

  const deleteScheduleMutation = useMutation({
    mutationFn: () => matchService.deleteSchedule(id as string),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['matches', id] });
      queryClient.invalidateQueries({ queryKey: ['teams', id] });
      queryClient.invalidateQueries({ queryKey: ['league', id] });
      toast.showSuccess(
        'Thành công',
        `Đã xóa ${data.deletedMatches || 0} trận đấu.`
      );
      setTimeout(() => router.back(), 500);
    },
    onError: (error: any) => {
      toast.showError('Lỗi', error.response?.data?.message || 'Không thể xóa lịch thi đấu');
    },
  });

  const handleResetAll = () => {
    Alert.alert(
      'Xác nhận Reset Toàn Bộ',
      `Reset tất cả ${totalMatches} trận đấu?\n\n` +
      '⚠️ Các thay đổi:\n' +
      `• Reset ${totalMatches} trận về 0-0\n` +
      '• Reset stats của TẤT CẢ đội về 0\n' +
      '• Xóa form của tất cả đội\n' +
      '• Xóa tất cả videos & ảnh\n' +
      '• Trạng thái về "scheduled"\n\n' +
      'Hành động này KHÔNG THỂ hoàn tác!',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Reset Tất Cả',
          style: 'destructive',
          onPress: () => resetAllMutation.mutate()
        }
      ]
    );
  };

  const handleDeleteSchedule = () => {
    if (finishedMatches > 0) {
      Alert.alert(
        'Không thể xóa',
        `Không thể xóa lịch thi đấu vì đã có ${finishedMatches} trận có kết quả.\n\nVui lòng "Reset Toàn Bộ Kết Quả" trước.`
      );
      return;
    }

    Alert.alert(
      'Xác nhận Xóa Lịch Thi Đấu',
      `Xóa toàn bộ ${totalMatches} trận đấu?\n\n` +
      '⚠️ Hành động này sẽ:\n' +
      `• Xóa vĩnh viễn ${totalMatches} trận đấu\n` +
      '• KHÔNG được reset các stats\n' +
      '• Giải đấu sẽ không còn lịch thi đấu\n\n' +
      'Bạn có thể tạo lịch mới sau khi xóa.\n\n' +
      'KHÔNG THỂ HOÀN TÁC!',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa Lịch',
          style: 'destructive',
          onPress: () => deleteScheduleMutation.mutate()
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
          headerTitle: 'Quản lý Giải Đấu',
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
          <View style={styles.leagueInfo}>
            <Text style={styles.leagueTitle}>{league?.name}</Text>
            <View style={styles.statsRow}>
              <View style={styles.stat}>
                <Text style={styles.statValue}>{totalMatches}</Text>
                <Text style={styles.statLabel}>Tổng trận</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.stat}>
                <Text style={[styles.statValue, { color: '#34C759' }]}>{finishedMatches}</Text>
                <Text style={styles.statLabel}>Đã đấu</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.stat}>
                <Text style={styles.statValue}>
                  {totalMatches - finishedMatches}
                </Text>
                <Text style={styles.statLabel}>Còn lại</Text>
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Hành động về giải đấu</Text>
              <Text style={styles.sectionSubtitle}>
                Các hành động này áp dụng cho toàn bộ giải đấu
              </Text>
            </View>

            <TouchableOpacity
              style={[
                styles.actionCard,
                resetAllMutation.isPending || totalMatches === 0 ? styles.actionCardDisabled : null
              ]}
              onPress={handleResetAll}
              disabled={resetAllMutation.isPending || totalMatches === 0}
              activeOpacity={0.7}
            >
              <View style={styles.actionIconContainer}>
                <Ionicons name="refresh" size={24} color="#FF9500" />
              </View>
              <View style={styles.actionContent}>
                <Text style={styles.actionTitle}>
                  Reset Toàn Bộ Kết Quả
                </Text>
                <Text style={styles.actionDescription}>
                  Đặt lại {totalMatches} trận về 0-0, xóa stats và media
                </Text>
                {resetAllMutation.isPending && (
                  <Text style={[styles.actionStatus, { color: '#FF9500' }]}>
                    Đang xử lý...
                  </Text>
                )}
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.actionCard,
                (deleteScheduleMutation.isPending || totalMatches === 0 || finishedMatches > 0) ? styles.actionCardDisabled : null
              ]}
              onPress={handleDeleteSchedule}
              disabled={deleteScheduleMutation.isPending || totalMatches === 0 || finishedMatches > 0}
              activeOpacity={0.7}
            >
              <View style={[styles.actionIconContainer, { backgroundColor: 'rgba(255, 59, 48, 0.15)' }]}>
                <Ionicons name="trash" size={24} color="#FF3B30" />
              </View>
              <View style={styles.actionContent}>
                <Text style={styles.actionTitle}>
                  Xóa Toàn Bộ Lịch Thi Đấu
                </Text>
                <Text style={styles.actionDescription}>
                  {finishedMatches > 0
                    ? `Không khả dụng do có ${finishedMatches} trận đã hoàn thành`
                    : `Xóa vĩnh viễn ${totalMatches} trận đấu`}
                </Text>
                {deleteScheduleMutation.isPending && (
                  <Text style={[styles.actionStatus, { color: '#FF3B30' }]}>
                    Đang xử lý...
                  </Text>
                )}
              </View>
            </TouchableOpacity>
          </View>

          <View style={styles.notice}>
            <Text style={styles.noticeTitle}>Lưu ý quan trọng</Text>
            <Text style={styles.noticeText}>
              Các hành động này không thể hoàn tác. Vui lòng kiểm tra kỹ trước khi thực hiện và cân nhắc backup dữ liệu quan trọng.
            </Text>
          </View>

          {totalMatches === 0 && (
            <View style={styles.emptyState}>
              <View style={styles.emptyIconContainer}>
                <Ionicons name="calendar-outline" size={32} color="rgba(255, 255, 255, 0.5)" />
              </View>
              <Text style={styles.emptyTitle}>
                Chưa có lịch thi đấu
              </Text>
              <Text style={styles.emptyText}>
                Giải đấu chưa có trận đấu nào được tạo
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
    padding: 16,
  },
  leagueInfo: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(214, 18, 64, 0.1)',
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
  leagueTitle: {
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 20,
    letterSpacing: 0.3,
    color: '#1F2937',
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    marginTop: -40,
  },
  stat: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 4,
    color: '#B91C3C',
  },
  statLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: '#6B7280',
  },
  divider: {
    width: 1,
    height: 40,
    marginHorizontal: 8,
    backgroundColor: '#E5E7EB',
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
    letterSpacing: 0.2,
    color: '#FFFFFF',
  },
  sectionSubtitle: {
    fontSize: 14,
    lineHeight: 20,
    color: 'rgba(255, 255, 255, 0.85)',
  },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(214, 18, 64, 0.1)',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  actionCardDisabled: {
    opacity: 0.5,
  },
  actionIconContainer: {
    width: 52,
    height: 52,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
    backgroundColor: 'rgba(255, 149, 0, 0.15)',
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
    letterSpacing: 0.1,
    color: '#1F2937',
  },
  actionDescription: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '400',
    color: '#6B7280',
  },
  actionStatus: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 6,
  },
  notice: {
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#FF3B30',
    marginBottom: 24,
    backgroundColor: 'rgba(255, 59, 48, 0.08)',
  },
  noticeTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 6,
    letterSpacing: 0.1,
    color: 'rgba(255, 255, 255, 0.95)',
  },
  noticeText: {
    fontSize: 13,
    lineHeight: 20,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  emptyState: {
    padding: 40,
    borderRadius: 16,
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  emptyIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 6,
    letterSpacing: 0.1,
    color: 'rgba(255, 255, 255, 0.95)',
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    color: 'rgba(255, 255, 255, 0.7)',
  },
});
