import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../../constants/theme';
import { useColorScheme } from '../../../hooks/use-color-scheme';
import { matchService } from '../../../services/match';
import MatchBackground from '../../../components/match/MatchBackground';

const STATUSES = [
  { value: 'scheduled', label: 'Sắp đấu', description: 'Trận đấu sắp diễn ra' },
  { value: 'live', label: 'ĐANG ĐẤU', description: 'Trận đấu đang diễn ra' },
  { value: 'finished', label: 'Kết thúc', description: 'Trận đấu đã kết thúc' },
  { value: 'postponed', label: 'Hoãn', description: 'Trận đấu bị hoãn' },
  { value: 'cancelled', label: 'Hủy', description: 'Trận đấu bị hủy bỏ' },
];

export default function MatchStatusScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const colors = Colors;

  const { data: match } = useQuery({
    queryKey: ['match', id],
    queryFn: () => matchService.getMatchById(id as string),
  });

  const [selectedStatus, setSelectedStatus] = useState(match?.status || 'scheduled');

  const updateStatusMutation = useMutation({
    mutationFn: (status: string) => matchService.updateMatchStatus(id as string, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['match', id] });
      queryClient.invalidateQueries({ queryKey: ['matches'] });
      queryClient.invalidateQueries({ queryKey: ['league'] });
      Alert.alert('Thành công', 'Đã cập nhật trạng thái trận đấu', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    },
    onError: (error: any) => {
      Alert.alert('Lỗi', error.response?.data?.message || 'Không thể cập nhật trạng thái');
    },
  });

  const handleSubmit = () => {
    if (selectedStatus === match?.status) {
      Alert.alert('Thông báo', 'Trạng thái không thay đổi');
      return;
    }

    Alert.alert(
      'Xác nhận',
      `Đổi trạng thái từ "${STATUSES.find(s => s.value === match?.status)?.label}" sang "${STATUSES.find(s => s.value === selectedStatus)?.label}"?`,
      [
        { text: 'Hủy', style: 'cancel' },
        { text: 'Xác nhận', onPress: () => updateStatusMutation.mutate(selectedStatus) }
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
          headerTitle: 'Đổi trạng thái',
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
        </View>

        <View style={styles.statusList}>
          {STATUSES.map((status) => (
            <TouchableOpacity
              key={status.value}
              style={[
                styles.statusCard,
                selectedStatus === status.value && styles.statusCardActive
              ]}
              onPress={() => setSelectedStatus(status.value)}
            >
              <View style={styles.statusContent}>
                <Text style={[styles.statusLabel, { color: selectedStatus === status.value ? '#FFFFFF' : '#1F2937' }]}>{status.label}</Text>
                <Text style={[styles.statusDescription, { color: selectedStatus === status.value ? 'rgba(255, 255, 255, 0.85)' : '#6B7280' }]}>
                  {status.description}
                </Text>
              </View>
              {selectedStatus === status.value && (
                <View style={styles.checkmark}>
                  <Ionicons name="checkmark-circle" size={24} color="#FFFFFF" />
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          style={[
            styles.button,
            { backgroundColor: colors.primary },
            updateStatusMutation.isPending && styles.buttonDisabled
          ]}
          onPress={handleSubmit}
          disabled={updateStatusMutation.isPending}
        >
          <Text style={styles.buttonText}>
            {updateStatusMutation.isPending ? 'Đang cập nhật...' : 'Cập nhật trạng thái'}
          </Text>
        </TouchableOpacity>
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
    marginBottom: 24,
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
  },
  statusList: {
    marginBottom: 20,
  },
  statusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: 'rgba(214, 18, 64, 0.1)',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  statusCardActive: {
    backgroundColor: 'rgba(214, 18, 64, 0.9)',
    borderColor: '#FFFFFF',
    borderWidth: 2,
    shadowColor: '#FFFFFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  statusIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  statusIconText: {
    fontSize: 24,
  },
  statusContent: {
    flex: 1,
  },
  statusLabel: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
    letterSpacing: 0.3,
  },
  statusDescription: {
    fontSize: 13,
    lineHeight: 18,
  },
  checkmark: {
    marginLeft: 12,
  },
  checkmarkText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  button: {
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
