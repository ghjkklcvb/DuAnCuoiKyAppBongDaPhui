import { Ionicons } from '@expo/vector-icons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { Alert, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors } from '../../../constants/theme';
import { useColorScheme } from '../../../hooks/use-color-scheme';
import { matchService } from '../../../services/match';
import MatchBackground from '../../../components/match/MatchBackground';

export default function MatchActionsScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const colors = Colors;

  const { data: match } = useQuery({
    queryKey: ['match', id],
    queryFn: () => matchService.getMatchById(id as string),
  });

  const resetMutation = useMutation({
    mutationFn: () => matchService.resetMatch(id as string),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['match', id] });
      queryClient.invalidateQueries({ queryKey: ['matches'] });
      queryClient.invalidateQueries({ queryKey: ['teams'] });
      queryClient.invalidateQueries({ queryKey: ['standings'] });
      queryClient.invalidateQueries({ queryKey: ['group-standings'] });
      queryClient.invalidateQueries({ queryKey: ['statistics'] });
      queryClient.invalidateQueries({ queryKey: ['league'] });
      Alert.alert('Thành công', 'Đã reset kết quả trận đấu. Stats của các đội đã được reset.', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    },
    onError: (error: any) => {
      Alert.alert('Lỗi', error.response?.data?.message || 'Không thể reset trận đấu');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => matchService.deleteMatch(id as string),
    onSuccess: () => {
      const leagueId = typeof match?.league === 'object' ? match.league._id : match?.league;
      
      queryClient.invalidateQueries({ queryKey: ['matches'] });
      queryClient.invalidateQueries({ queryKey: ['league'] });
      queryClient.invalidateQueries({ queryKey: ['teams'] });
      queryClient.invalidateQueries({ queryKey: ['standings'] });
      queryClient.invalidateQueries({ queryKey: ['group-standings'] });
      queryClient.invalidateQueries({ queryKey: ['statistics'] });
      Alert.alert('Thành công', 'Đã xóa trận đấu', [
        { text: 'OK', onPress: () => router.replace(`/league/${leagueId}` as any) }
      ]);
    },
    onError: (error: any) => {
      Alert.alert('Lỗi', error.response?.data?.message || 'Không thể xóa trận đấu');
    },
  });

  const handleReset = () => {
    Alert.alert(
      'Xác nhận Reset',
      'Reset kết quả trận đấu này? Các thay đổi:\n\n' +
      '• Tỷ số về 0-0\n' +
      '• Trạng thái về "scheduled"\n' +
      '• Stats của 2 đội được điều chỉnh\n' +
      '• Form được cập nhật\n' +
      '• Xóa video & ảnh',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => resetMutation.mutate()
        }
      ]
    );
  };

  const handleDelete = () => {
    if (match?.status === 'finished') {
      Alert.alert(
        'Không thể xóa',
        'Không thể xóa trận đấu đã có kết quả. Vui lòng reset kết quả trước.'
      );
      return;
    }

    Alert.alert(
      'Xác nhận Xóa',
      `Xóa trận đấu "${match?.homeTeam.name} vs ${match?.awayTeam.name}"? Hành động này không thể hoàn tác!`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: () => deleteMutation.mutate()
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
          headerTitle: 'Hành động',
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
      
      <MatchBackground>
        <ScrollView style={styles.container}>
        <View style={styles.matchInfo}>
          <Text style={[styles.infoTitle, { color: '#6B7280' }]}>Trận đấu</Text>
          <Text style={[styles.matchText, { color: '#1F2937' }]}>
            {match?.homeTeam.name} vs {match?.awayTeam.name}
          </Text>
          <Text style={[styles.roundText, { color: '#6B7280' }]}>Vòng {match?.round}</Text>
          {match?.status && (
            <View style={[styles.statusBadge, { backgroundColor: colors.primary }]}>
              <Text style={[styles.statusText, { color: '#FFFFFF' }]}>
                {match.status === 'finished' ? 'Kết thúc' :
                 match.status === 'live' ? 'LIVE' :
                 match.status === 'scheduled' ? 'Sắp đấu' :
                 match.status}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: '#FFFFFF' }]}>⚠️ Hành động nguy hiểm</Text>
          
          <TouchableOpacity
            style={styles.actionCard}
            onPress={handleReset}
            disabled={resetMutation.isPending}
          >
            <View style={[styles.actionIcon, { backgroundColor: '#FF9500' }]}>
              <Ionicons name="refresh" size={28} color="#FFFFFF" />
            </View>
            <View style={styles.actionContent}>
              <Text style={[styles.actionTitle, { color: '#1F2937' }]}>Reset kết quả</Text>
              <Text style={[styles.actionDescription, { color: '#6B7280' }]}>
                Xóa kết quả, stats về 0, xóa media
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="rgba(255, 255, 255, 0.5)" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.deleteCard}
            onPress={handleDelete}
            disabled={deleteMutation.isPending || match?.status === 'finished'}
          >
            <View style={[styles.actionIcon, { backgroundColor: colors.lose }]}>
              <Ionicons name="trash" size={28} color="#FFFFFF" />
            </View>
            <View style={styles.actionContent}>
              <Text style={[styles.actionTitle, { color: '#1F2937' }]}>Xóa trận đấu</Text>
              <Text style={[styles.actionDescription, { color: '#6B7280' }]}>
                {match?.status === 'finished' 
                  ? 'Không thể xóa trận đã có kết quả'
                  : 'Xóa vĩnh viễn, không thể hoàn tác'}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>
        </View>

        <View style={styles.warning}>
          <Ionicons name="warning" size={24} color="#FF9500" />
          <Text style={[styles.warningText, { color: 'rgba(255, 255, 255, 0.85)' }]}>
            Các hành động này không thể hoàn tác. Hãy cẩn thận khi thực hiện.
          </Text>
        </View>
        </ScrollView>
      </MatchBackground>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  matchInfo: {
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginBottom: 30,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(214, 18, 64, 0.1)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  infoTitle: {
    fontSize: 14,
    marginBottom: 10,
    fontWeight: '500',
  },
  matchText: {
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 5,
  },
  roundText: {
    fontSize: 14,
    marginBottom: 10,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  statusText: {
    fontSize: 13,
    fontWeight: '600',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height:3 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  deleteCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(214, 18, 64, 0.1)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  actionIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  actionDescription: {
    fontSize: 13,
    lineHeight: 18,
  },
  warning: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 16,
    gap: 12,
    backgroundColor: 'rgba(255, 149, 0, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 149, 0, 0.3)',
  },
  warningText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 20,
  },
});
