import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useToast } from '@/hooks/useToast';
import { useLeagueId } from '@/hooks/useRouteParams';
import { leagueService } from '@/services/league';
import { Ionicons } from '@expo/vector-icons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Stack, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Clipboard, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View, StatusBar, Platform } from 'react-native';
import { generateLeagueLink } from '@/utils/leagueLink';
import LeagueBackground from '@/components/league/LeagueBackground';

export default function LeagueSettingsScreen() {
  const id = useLeagueId();
  const router = useRouter();
  const queryClient = useQueryClient();
  const colors = Colors;
  const toast = useToast();

  const { data: league } = useQuery({
    queryKey: ['league', id],
    queryFn: () => leagueService.getLeagueById(id as string),
  });

  const [isPrivate, setIsPrivate] = useState(league?.visibility === 'private');

  const visibilityMutation = useMutation({
    mutationFn: (visibility: 'public' | 'private') =>
      leagueService.updateVisibility(id as string, visibility),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['league', id] });
      queryClient.invalidateQueries({ queryKey: ['myLeagues'] });
      queryClient.invalidateQueries({ queryKey: ['publicLeagues'] });
      toast.showSuccess('Thành công', 'Đã cập nhật chế độ hiển thị');
    },
    onError: (error: any) => {
      toast.showError('Lỗi', error.response?.data?.message || 'Không thể cập nhật');
    },
  });

  const generateTokenMutation = useMutation({
    mutationFn: () => leagueService.generateToken(id as string),
    onSuccess: (data) => {
      Alert.alert(
        'Mã truy cập mới',
        `Mã: ${data.accessToken}\n\nChia sẻ mã này để người khác có thể xem giải đấu.`
      );
      queryClient.invalidateQueries({ queryKey: ['league', id] });
      toast.showSuccess('Đã tạo mã mới', 'Mã truy cập mới đã được tạo');
    },
    onError: (error: any) => {
      toast.showError('Lỗi', error.response?.data?.message || 'Không thể tạo mã mới');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => leagueService.deleteLeague(id as string),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myLeagues'] });
      queryClient.invalidateQueries({ queryKey: ['publicLeagues'] });
      toast.showSuccess('Đã xóa giải đấu', 'Giải đấu đã được xóa thành công');
      setTimeout(() => router.replace('/my-leagues' as any), 500);
    },
    onError: (error: any) => {
      toast.showError('Lỗi', error.response?.data?.message || 'Không thể xóa giải đấu');
    },
  });

  const handleVisibilityToggle = (value: boolean) => {
    setIsPrivate(value);
    visibilityMutation.mutate(value ? 'private' : 'public');
  };

  const handleGenerateToken = () => {
    Alert.alert(
      'Tạo mã mới',
      'Mã cũ sẽ không còn hiệu lực. Bạn có chắc chắn?',
      [
        { text: 'Hủy', style: 'cancel' },
        { text: 'Tạo mới', onPress: () => generateTokenMutation.mutate() }
      ]
    );
  };

  const handleShareLink = () => {
    if (!league?.accessToken || !id) return;
    
    const shareableLink = generateLeagueLink(id as string, league.accessToken);
    Clipboard.setString(shareableLink);
    
    Alert.alert(
      'Đã sao chép!',
      `Mã truy cập đã được sao chép vào clipboard.\n\nChia sẻ mã này để người khác có thể truy cập giải đấu:\n\n${shareableLink}`,
      [{ text: 'OK' }]
    );
    toast.showSuccess('Đã sao chép', 'Mã đã được sao chép vào clipboard');
  };

  const handleDelete = () => {
    if (league?.tournamentStatus === 'completed') {
      Alert.alert('Lỗi', 'Không thể xóa giải đấu đã kết thúc');
      return;
    }

    Alert.alert(
      'Xóa giải đấu',
      'Bạn có chắc chắn muốn xóa giải đấu này? Hành động này không thể hoàn tác.',
      [
        { text: 'Hủy', style: 'cancel' },
        { text: 'Xóa', style: 'destructive', onPress: () => deleteMutation.mutate() }
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
          headerTitle: 'Cài Đặt Giải Đấu',
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
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons name="eye" size={20} color="#B91C3C" />
              <Text style={styles.cardTitle}>Chế Độ Hiển Thị</Text>
            </View>
            
            <View style={styles.switchContainer}>
              <View style={styles.switchInfo}>
                <Text style={styles.switchLabel}>Giải đấu riêng tư</Text>
                <Text style={styles.switchDescription}>
                  Chỉ người có mã truy cập mới xem được
                </Text>
              </View>
              <Switch
                value={isPrivate}
                onValueChange={handleVisibilityToggle}
                trackColor={{ false: 'rgba(214, 18, 64, 0.2)', true: '#B91C3C'}}
                thumbColor="#FFFFFF"
                ios_backgroundColor="rgba(255, 255, 255, 0.2)"
              />
            </View>

            {isPrivate && league?.accessToken && (
              <View style={styles.tokenCard}>
                <Text style={styles.tokenLabel}>Mã truy cập hiện tại</Text>
                <View style={styles.tokenValueContainer}>
                  <Ionicons name="key" size={18} color="#B91C3C" />
                  <Text style={styles.tokenValue}>{league.accessToken}</Text>
                </View>
                
                <View style={styles.tokenActions}>
                  <TouchableOpacity
                    style={styles.tokenButton}
                    onPress={handleShareLink}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="copy" size={16} color="#FFFFFF" />
                    <Text style={styles.tokenButtonText}>Sao chép</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={[styles.tokenButton, styles.tokenButtonSecondary]}
                    onPress={handleGenerateToken}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="refresh" size={16} color="#B91C3C"/>
                    <Text style={[styles.tokenButtonText, { color: '#B91C3C' }]}>Tạo mới</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>

          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons name="settings" size={20} color="#B91C3C" />
              <Text style={styles.cardTitle}>Quản Lý Nội Dung</Text>
            </View>
            
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => router.push(`/league/${id}/edit` as any)}
              activeOpacity={0.7}
            >
              <View style={styles.menuIconContainer}>
                <Ionicons name="create" size={20} color="#B91C3C" />
              </View>
              <Text style={styles.menuText}>Chỉnh sửa thông tin</Text>
              <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => router.push(`/league/${id}/teams` as any)}
              activeOpacity={0.7}
            >
              <View style={styles.menuIconContainer}>
                <Ionicons name="people" size={20} color="#B91C3C" />
              </View>
              <Text style={styles.menuText}>Quản lý đội bóng</Text>
              <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.menuItem, { borderBottomWidth: 0 }]}
              onPress={() => router.push(`/league/${id}/matches` as any)}
              activeOpacity={0.7}
            >
              <View style={styles.menuIconContainer}>
                <Ionicons name="calendar" size={20} color="#B91C3C" />
              </View>
              <Text style={styles.menuText}>Quản lý trận đấu</Text>
              <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
            </TouchableOpacity>
          </View>

          <View style={[styles.card, styles.dangerCard]}>
            <View style={styles.cardHeader}>
              <Ionicons name="warning" size={20} color="#FF3B30" />
              <Text style={[styles.cardTitle, { color: '#FF3B30' }]}>Vùng Nguy Hiểm</Text>
            </View>
            
            <TouchableOpacity
              style={styles.dangerButton}
              onPress={handleDelete}
              activeOpacity={0.7}
            >
              <Ionicons name="trash" size={20} color="#FF3B30" />
              <Text style={styles.dangerButtonText}>Xóa giải đấu</Text>
            </TouchableOpacity>

            <View style={styles.warningNotice}>
              <Ionicons name="alert-circle" size={14} color="rgba(255, 59, 48, 0.7)" />
              <Text style={styles.warningText}>
                Hành động này không thể hoàn tác
              </Text>
            </View>
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
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(214, 18, 64, 0.1)',
    padding: 20,
    marginBottom: 16,
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
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 10,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    letterSpacing: 0.2,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  switchInfo: {
    flex: 1,
    marginRight: 16,
  },
  switchLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
    letterSpacing: 0.2,
  },
  switchDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  tokenCard: {
    marginTop: 20,
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#FFF7ED',
    borderWidth: 2,
    borderColor: 'rgba(255, 149, 0, 0.3)',
  },
  tokenLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#78350F',
    marginBottom: 10,
    letterSpacing: 0.2,
    textTransform: 'uppercase',
  },
  tokenValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
    padding: 12,
    backgroundColor: 'rgba(255, 149, 0, 0.1)',
    borderRadius: 8,
  },
  tokenValue: {
    fontSize: 12,
    marginRight: 20,
    fontWeight: '700',
    color: '#92400E',
    letterSpacing: 1,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  tokenActions: {
    flexDirection: 'row',
    gap: 10,
  },
  tokenButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: '#B91C3C',
    gap: 6,
  },
  tokenButtonSecondary: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: '#B91C3C',
  },
  tokenButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  menuIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 149, 0, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  menuText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    color: '#1F2937',
    letterSpacing: 0.2,
  },
  dangerCard: {
    borderColor: 'rgba(255, 59, 48, 0.3)',
    marginBottom: 32,
  },
  dangerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 59, 48, 0.15)',
    borderWidth: 1.5,
    borderColor: '#FF3B30',
    gap: 10,
  },
  dangerButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FF3B30',
    letterSpacing: 0.3,
  },
  warningNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    padding: 10,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 59, 48, 0.08)',
    gap: 8,
  },
  warningText: {
    flex: 1,
    fontSize: 13,
    color: 'rgba(255, 59, 48, 0.8)',
    fontWeight: '500',
  },
});