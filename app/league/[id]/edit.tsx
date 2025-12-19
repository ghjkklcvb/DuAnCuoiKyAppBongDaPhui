import { Ionicons } from '@expo/vector-icons';
import { yupResolver } from '@hookform/resolvers/yup';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as ImagePicker from 'expo-image-picker';
import { Stack, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Alert, Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, Platform, StatusBar } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as yup from 'yup';
import { Colors } from '../../../constants/theme';
import { useColorScheme } from '../../../hooks/use-color-scheme';
import { useLeagueId } from '../../../hooks/useRouteParams';
import { leagueService } from '../../../services/league';
import LeagueBackground from '../../../components/league/LeagueBackground';

const schema = yup.object({
  name: yup.string().required('Tên giải đấu là bắt buộc').min(3, 'Tối thiểu 3 ký tự'),
  description: yup.string().max(500, 'Mô tả tối đa 500 ký tự'),
  startDate: yup.string(),
  endDate: yup.string(),
});

export default function EditLeagueScreen() {
  const id = useLeagueId();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);
  const [logoUploading, setLogoUploading] = useState(false);
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const colors = Colors;

  const { data: league, isLoading } = useQuery({
    queryKey: ['league', id],
    queryFn: () => leagueService.getLeagueById(id as string),
  });

  const { control, handleSubmit, formState: { errors }, setValue, watch } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      name: league?.name || '',
      description: league?.description || '',
      startDate: league?.startDate ? new Date(league.startDate).toISOString().split('T')[0] : '',
      endDate: league?.endDate ? new Date(league.endDate).toISOString().split('T')[0] : '',
    },
  });

  React.useEffect(() => {
    if (league) {
      setValue('name', league.name);
      setValue('description', league.description || '');
      setValue('startDate', league.startDate ? new Date(league.startDate).toISOString().split('T')[0] : '');
      setValue('endDate', league.endDate ? new Date(league.endDate).toISOString().split('T')[0] : '');
    }
  }, [league, setValue]);

  const updateMutation = useMutation({
    mutationFn: (data: any) => leagueService.updateLeague(id as string, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['league', id] });
      Alert.alert('Thành công', 'Cập nhật thông tin giải đấu thành công', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    },
    onError: (error: any) => {
      Alert.alert('Lỗi', error.response?.data?.message || 'Không thể cập nhật thông tin');
    },
  });

  const logoMutation = useMutation({
    mutationFn: (formData: FormData) => leagueService.updateLeague(id as string, formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['league', id] });
      Alert.alert('Thành công', 'Cập nhật logo thành công');
    },
    onError: (error: any) => {
      Alert.alert('Lỗi', error.response?.data?.message || 'Không thể cập nhật logo');
    },
  });

  const onSubmit = async (data: any) => {
    setLoading(true);
    try {
      const updateData = {
        name: data.name,
        description: data.description,
        startDate: data.startDate ? new Date(data.startDate).toISOString() : undefined,
        endDate: data.endDate ? new Date(data.endDate).toISOString() : undefined,
      };
      
      updateMutation.mutate(updateData);
    } finally {
      setLoading(false);
    }
  };

  const handleChangeLogo = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setLogoUploading(true);
      try {
        const formData = new FormData();
        formData.append('logo', {
          uri: result.assets[0].uri,
          type: 'image/jpeg',
          name: 'logo.jpg',
        } as any);

        logoMutation.mutate(formData);
      } finally {
        setLogoUploading(false);
      }
    }
  };

  const handleRemoveLogo = () => {
    Alert.alert(
      'Xóa logo',
      'Bạn có chắc chắn muốn xóa logo giải đấu?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: () => {
            const formData = new FormData();
            formData.append('removeLogo', 'true');
            logoMutation.mutate(formData);
          }
        }
      ]
    );
  };

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
            headerTitle: 'Chỉnh Sửa Giải Đấu',
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
          headerTitle: 'Chỉnh Sửa Giải Đấu',
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
              <Ionicons name="image" size={20} color='#B91C3C' />
              <Text style={styles.cardTitle}>Logo Giải Đấu</Text>
            </View>
            
            <View style={styles.logoContainer}>
              {league?.logo ? (
                <Image source={{ uri: league.logo }} style={styles.logo} />
              ) : (
                <View style={styles.logoPlaceholder}>
                  <Ionicons name="trophy" size={40} color="rgba(255, 255, 255, 0.4)" />
                </View>
              )}
            </View>
              
            <View style={styles.logoActions}>
              <TouchableOpacity
                style={styles.logoButton}
                onPress={handleChangeLogo}
                disabled={logoUploading}
                activeOpacity={0.7}
              >
                <Ionicons name="camera" size={18} color="#FFFFFF" />
                <Text style={styles.logoButtonText}>
                  {logoUploading ? 'Đang tải...' : league?.logo ? 'Đổi logo' : 'Chọn logo'}
                </Text>
              </TouchableOpacity>
              
              {league?.logo && (
                <TouchableOpacity
                  style={[styles.logoButton, styles.logoButtonDanger]}
                  onPress={handleRemoveLogo}
                  activeOpacity={0.7}
                >
                  <Ionicons name="trash" size={18} color="#FF3B30" />
                </TouchableOpacity>
              )}
            </View>
          </View>

          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons name="create" size={20} color='#B91C3C' />
              <Text style={styles.cardTitle}>Thông Tin Cơ Bản</Text>
            </View>

            <Controller
              control={control}
              name="name"
              render={({ field: { onChange, onBlur, value } }) => (
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Tên giải đấu *</Text>
                  <TextInput
                    style={styles.input}
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    placeholder="VD: Premier League 2024"
                    placeholderTextColor="#9CA3AF"
                  />
                  {errors.name && (
                    <Text style={styles.errorText}>{errors.name.message}</Text>
                  )}
                </View>
              )}
            />

            <Controller
              control={control}
              name="description"
              render={({ field: { onChange, onBlur, value } }) => (
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Mô tả</Text>
                  <TextInput
                    style={[styles.input, styles.textArea]}
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    placeholder="Mô tả ngắn về giải đấu..."
                    placeholderTextColor="#9CA3AF"
                    multiline
                    numberOfLines={3}
                    textAlignVertical="top"
                  />
                  {errors.description && (
                    <Text style={styles.errorText}>{errors.description.message}</Text>
                  )}
                </View>
              )}
            />
          </View>

          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons name="calendar" size={20} color='#B91C3C'/>
              <Text style={styles.cardTitle}>Thời Gian</Text>
            </View>

            <Controller
              control={control}
              name="startDate"
              render={({ field: { onChange, value } }) => (
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Ngày bắt đầu</Text>
                  <TouchableOpacity
                    style={styles.dateButton}
                    onPress={() => setShowStartDatePicker(true)}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="calendar-outline" size={20} color="#B91C3C" />
                    <Text style={styles.dateButtonText}>
                      {value ? new Date(value).toLocaleDateString('vi-VN', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      }) : 'Chọn ngày bắt đầu'}
                    </Text>
                  </TouchableOpacity>
                  {showStartDatePicker && (
                    <DateTimePicker
                      value={value ? new Date(value + 'T00:00:00') : new Date()}
                      mode="date"
                      display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                      onChange={(event, selectedDate) => {
                        setShowStartDatePicker(Platform.OS === 'ios');
                        if (selectedDate) {
                          const year = selectedDate.getFullYear();
                          const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
                          const day = String(selectedDate.getDate()).padStart(2, '0');
                          onChange(`${year}-${month}-${day}`);
                        }
                      }}
                    />
                  )}
                </View>
              )}
            />

            <Controller
              control={control}
              name="endDate"
              render={({ field: { onChange, value } }) => (
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Ngày kết thúc</Text>
                  <TouchableOpacity
                    style={styles.dateButton}
                    onPress={() => setShowEndDatePicker(true)}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="calendar-outline" size={20} color="#B91C3C" />
                    <Text style={styles.dateButtonText}>
                      {value ? new Date(value).toLocaleDateString('vi-VN', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      }) : 'Chọn ngày kết thúc'}
                    </Text>
                  </TouchableOpacity>
                  {showEndDatePicker && (
                    <DateTimePicker
                      value={value ? new Date(value + 'T00:00:00') : new Date()}
                      mode="date"
                      display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                      onChange={(event, selectedDate) => {
                        setShowEndDatePicker(Platform.OS === 'ios');
                        if (selectedDate) {
                          const year = selectedDate.getFullYear();
                          const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
                          const day = String(selectedDate.getDate()).padStart(2, '0');
                          onChange(`${year}-${month}-${day}`);
                        }
                      }}
                    />
                  )}
                </View>
              )}
            />
          </View>

          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons name="information-circle" size={20} color='#B91C3C' />
              <Text style={styles.cardTitle}>Thông Tin Khác</Text>
            </View>
            
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Thể thức</Text>
              <View style={styles.infoBadge}>
                <Text style={styles.infoBadgeText}>
                  {league?.type === 'round-robin' ? 'Vòng tròn' : 'Chia bảng'}
                </Text>
              </View>
            </View>
            
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Số đội</Text>
              <View style={styles.infoBadge}>
                <Text style={styles.infoBadgeText}>{league?.numberOfTeams}</Text>
              </View>
            </View>
            
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Trạng thái</Text>
              <View style={styles.infoBadge}>
                <Text style={styles.infoBadgeText}>
                  {league?.tournamentStatus === 'upcoming' ? 'Sắp diễn ra' :
                   league?.tournamentStatus === 'ongoing' ? 'Đang diễn ra' : 'Đã kết thúc'}
                </Text>
              </View>
            </View>
            
            <View style={[styles.notice, { marginTop: 16 }]}>
              <Ionicons name="lock-closed" size={14} color="#9CA3AF" />
              <Text style={styles.noticeText}>
                Thể thức và số đội không thể thay đổi
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.submitButton, (loading || updateMutation.isPending) && styles.submitButtonDisabled]}
            onPress={handleSubmit(onSubmit)}
            disabled={loading || updateMutation.isPending}
            activeOpacity={0.8}
          >
            <Text style={styles.submitButtonText}>
              {loading || updateMutation.isPending ? 'Đang cập nhật...' : 'Lưu thay đổi'}
            </Text>
          </TouchableOpacity>
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
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '500',
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
  logoContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  logo: {
    width: 100,
    height: 100,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  logoPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    borderStyle: 'dashed',
  },
  logoActions: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
  },
  logoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
    backgroundColor: '#B91C3C',
    ...Platform.select({
      ios: {
        shadowColor: '#B91C3C',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  logoButtonDanger: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#FF3B30',
    paddingHorizontal: 14,
  },
  logoButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    color: '#1F2937',
    letterSpacing: 0.2,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: 'rgba(214, 18, 64, 0.2)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: '#1F2937',
    fontWeight: '500',
  },
  textArea: {
    minHeight: 100,
    paddingTop: 14,
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 13,
    marginTop: 6,
    fontWeight: '500',
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderWidth: 1.5,
    borderColor: 'rgba(214, 18, 64, 0.2)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  dateButtonText: {
    fontSize: 15,
    flex: 1,
    color: '#1F2937',
    fontWeight: '500',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
  },
  infoLabel: {
    fontSize: 15,
    fontWeight: '500',
    color: '#6B7280',
  },
  infoBadge: {
    backgroundColor: 'rgba(214, 18, 64, 0.08)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(214, 18, 64, 0.15)',
  },
  infoBadgeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#B91C3C',
    letterSpacing: 0.2,
  },
  notice: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 10,
    gap: 8,
    backgroundColor: 'rgba(107, 114, 128, 0.08)',
  },
  noticeText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
    color: '#6B7280',
    fontWeight: '500',
  },
  submitButton: {
    backgroundColor: '#B91C3C',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 32,
    ...Platform.select({
      ios: {
        shadowColor: '#B91C3C',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 12,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});