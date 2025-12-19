import { Colors } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { leagueService } from '@/services/league';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import TabsBackground from '@/components/tabs/TabsBackground';
import { useQueryClient } from '@tanstack/react-query';

export default function CreateLeagueScreen() {
  const router = useRouter();
  const { logout, user } = useAuth();
  const queryClient = useQueryClient();
  const colors = Colors;
  const [step, setStep] = useState(1);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [logo, setLogo] = useState<any>(null);
  const [type, setType] = useState<'round-robin' | 'group-stage'>('round-robin');
  const [visibility, setVisibility] = useState<'public' | 'private'>('public');
  const [numberOfTeams, setNumberOfTeams] = useState('6');
  const [numberOfGroups, setNumberOfGroups] = useState('2');
  const [teamsPerGroup, setTeamsPerGroup] = useState('3');

  const handleTeamsChange = (value: string) => {
    setNumberOfTeams(value);
    if (type === 'group-stage') {
      const teams = parseInt(value) || 0;
      const groups = parseInt(numberOfGroups) || 1;
      if (teams > 0 && groups > 0) {
        const perGroup = Math.floor(teams / groups);
        if (perGroup >= 2) {
          setTeamsPerGroup(String(perGroup));
        }
      }
    }
  };

  const handleGroupsChange = (value: string) => {
    setNumberOfGroups(value);
    if (type === 'group-stage') {
      const teams = parseInt(numberOfTeams) || 0;
      const groups = parseInt(value) || 1;
      if (teams > 0 && groups > 0) {
        const perGroup = Math.floor(teams / groups);
        if (perGroup >= 2) {
          setTeamsPerGroup(String(perGroup));
        }
      }
    }
  };
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [loading, setLoading] = useState(false);

  const handlePickLogo = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setLogo(result.assets[0]);
    }
  };

  const resetForm = () => {
    setName('');
    setDescription('');
    setLogo(null);
    setType('round-robin');
    setVisibility('public');
    setNumberOfTeams('6');
    setNumberOfGroups('2');
    setTeamsPerGroup('3');
    setStartDate('');
    setEndDate('');
    setStep(1);
  };

  const handleCreate = async () => {
    console.log('=== CREATE LEAGUE DEBUG ===');
    console.log('RAW STATE VALUES:', {
      numberOfTeams,
      numberOfGroups,
      teamsPerGroup,
      type,
    });
  
    if (!name.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập tên giải đấu');
      return;
    }
  
    const token = await AsyncStorage.getItem('accessToken');
    if (!token) {
      Alert.alert('Lỗi', 'Vui lòng đăng nhập để tạo giải đấu');
      return;
    }
  
    const totalTeams = Number(numberOfTeams);
    const groups = Number(numberOfGroups);
    const perGroup = Number(teamsPerGroup);
  
    console.log('CONVERTED VALUES:', {
      totalTeams,
      groups,
      perGroup,
      calculation: `${groups} × ${perGroup} = ${groups * perGroup}`,
      isValid: groups * perGroup === totalTeams,
    });
  
    if (type === 'group-stage') {
      console.log('Final validation before submit:', {
        totalTeams,
        groups,
        perGroup,
        calculation: groups * perGroup,
        isValid: groups * perGroup === totalTeams
      });
  
      if (groups * perGroup !== totalTeams) {
        Alert.alert(
          'Lỗi cài đặt bảng đấu',
          `Số đội không khớp: ${groups} × ${perGroup} = ${groups * perGroup}, nhưng bạn chọn ${totalTeams}`
        );
        return;
      }
  
      if (groups < 2) {
        Alert.alert('Lỗi', 'Giải chia bảng phải có ít nhất 2 bảng');
        return;
      }
  
      if (perGroup < 2) {
        Alert.alert('Lỗi', 'Mỗi bảng phải có ít nhất 2 đội');
        return;
      }
    }
  
    const actualNumberOfTeams = type === 'group-stage' ? groups * perGroup : totalTeams;
  
    const shouldUseJson = type === 'group-stage' || !logo;
  
    let payload: FormData | object;
    let createdLeagueId: string | null = null;
  
    if (shouldUseJson) {
      const jsonPayload: any = {
        name: name.trim(),
        type,
        visibility,
        numberOfTeams: actualNumberOfTeams,
      };
  
      if (description.trim()) {
        jsonPayload.description = description.trim();
      }
  
      if (type === 'group-stage') {
        jsonPayload.groupSettings = {
          numberOfGroups: groups,
          teamsPerGroup: perGroup,
        };
      }
  
      if (startDate) jsonPayload.startDate = startDate;
      if (endDate) jsonPayload.endDate = endDate;
  
      payload = jsonPayload;
      
      console.log('📤 JSON PAYLOAD:', JSON.stringify(jsonPayload, null, 2));
    } else {
      const formData = new FormData();
      formData.append('name', name.trim());
      formData.append('type', type);
      formData.append('visibility', visibility);
      formData.append('numberOfTeams', String(actualNumberOfTeams));
  
      if (description.trim()) {
        formData.append('description', description.trim());
      }
  
      if (startDate) formData.append('startDate', startDate);
      if (endDate) formData.append('endDate', endDate);
  
      formData.append('logo', {
        uri: logo.uri,
        name: 'logo.jpg',
        type: 'image/jpeg',
      } as any);
  
      payload = formData;
      
      console.log('📤 FORMDATA for round-robin with logo');
    }
  
    try {
      setLoading(true);
  
      console.log('=== CREATE LEAGUE ===');
      console.log('Using:', shouldUseJson ? 'JSON' : 'FormData');
      console.log('Type:', type);
      console.log('Teams:', actualNumberOfTeams);
      if (type === 'group-stage') {
        console.log('Groups:', groups, '× Teams/Group:', perGroup, '=', groups * perGroup);
      }
      console.log('Has logo:', !!logo);
  
      const response = await leagueService.createLeague(payload);
      
      console.log('✅ League created successfully:', response);
      console.log('League ID:', response.league._id);
      
      if (shouldUseJson && logo) {
        console.log('📤 Uploading logo separately...');
        try {
          const logoFormData = new FormData();
          logoFormData.append('logo', {
            uri: logo.uri,
            name: 'logo.jpg',
            type: 'image/jpeg',
          } as any);
          
          await leagueService.updateLeague(response.league._id, logoFormData);
          console.log('✅ Logo uploaded successfully');
        } catch (logoError) {
          console.warn('⚠️ Logo upload failed, but league was created:', logoError);
        }
      }
  
      router.push(`/league/${response.league._id}` as any);
      resetForm();
      
      // Invalidate queries to refresh league lists
      queryClient.invalidateQueries({ queryKey: ['publicLeagues'] });
      queryClient.invalidateQueries({ queryKey: ['myLeagues', user?._id] });
      
      Alert.alert(
        'Thành công',
        response.message || 'Tạo giải đấu thành công!'
      );
    } catch (error: any) {
      console.error('League creation error:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
  
      let errorMessage = 'Không thể tạo giải đấu';
  
      if (error.message === 'Access forbidden' || error.response?.status === 403) {
        await logout();
        Alert.alert(
          'Phiên đăng nhập hết hạn',
          'Vui lòng đăng nhập lại để tiếp tục',
          [
            {
              text: 'OK',
              onPress: () => router.replace('/login'),
            },
          ]
        );
        return;
      }
  
      if (error.message === 'Authentication failed') {
        errorMessage = 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.';
      } else if (error.response?.status === 400) {
        if (error.response?.data?.errors?.length > 0) {
          errorMessage = error.response.data.errors.join('\n');
        } else {
          errorMessage = error.response?.data?.message || 'Dữ liệu không hợp lệ';
        }
      } else if (error.response?.status === 500) {
        errorMessage = 'Lỗi server. Vui lòng thử lại sau.';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
  
      Alert.alert('Lỗi tạo giải', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const renderStep1 = () => (
    <View style={styles.stepCard}>
      <Text style={styles.stepTitle}>Thông tin cơ bản</Text>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Tên giải đấu *</Text>
        <View style={styles.inputContainer}>
          <Ionicons name="trophy-outline" size={20} color="#9CA3AF" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="VD: Giải Bóng Đá Phủi 2024"
            placeholderTextColor="#9CA3AF"
            value={name}
            onChangeText={setName}
          />
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Mô tả</Text>
        <View style={[styles.inputContainer, styles.textAreaContainer]}>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Mô tả về giải đấu"
            placeholderTextColor="#9CA3AF"
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
          />
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Logo giải đấu</Text>
        <TouchableOpacity
          style={styles.logoPicker}
          onPress={handlePickLogo}>
          {logo ? (
            <>
              <Ionicons name="checkmark-circle" size={48} color="#4CAF50" />
              <Text style={[styles.logoText, { color: '#4CAF50', fontWeight: '600' }]}>✓ Đã chọn logo</Text>
            </>
          ) : (
            <>
              <Ionicons name="image-outline" size={48} color="#9CA3AF" />
              <Text style={styles.logoText}>Chọn logo</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={[styles.primaryButton, { backgroundColor: colors.primary }]}
        onPress={() => setStep(2)}>
        <Text style={styles.primaryButtonText}>Tiếp theo</Text>
        <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.stepCard}>
      <Text style={styles.stepTitle}>Thể thức thi đấu</Text>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Chọn thể thức *</Text>
        <View style={styles.typeContainer}>
        <TouchableOpacity
          style={[
            styles.typeButton,
            { borderColor: colors.border },
            type === 'round-robin' && { backgroundColor: colors.primary, borderColor: colors.primary }
          ]}
          onPress={() => setType('round-robin')}>
          <Text style={[
            styles.typeText,
            type === 'round-robin' && { fontWeight: '600', color: '#FFFFFF' }
          ]}>
            Vòng tròn 1 lượt
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.typeButton,
            { borderColor: colors.border },
            type === 'group-stage' && { backgroundColor: colors.primary, borderColor: colors.primary }
          ]}
          onPress={() => setType('group-stage')}>
          <Text style={[
            styles.typeText,
            type === 'group-stage' && { fontWeight: '600', color: '#FFFFFF' }
          ]}>
            Chia bảng
          </Text>
        </TouchableOpacity>
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Số đội tham gia *</Text>
        <View style={styles.inputContainer}>
          <Ionicons name="people-outline" size={20} color="#9CA3AF" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="6"
            placeholderTextColor="#9CA3AF"
            value={numberOfTeams}
            onChangeText={handleTeamsChange}
            keyboardType="number-pad"
          />
        </View>
      </View>

      {type === 'group-stage' && (
        <>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Số bảng đấu *</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="grid-outline" size={20} color="#9CA3AF" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="2"
                placeholderTextColor="#9CA3AF"
                value={numberOfGroups}
                onChangeText={handleGroupsChange}
                keyboardType="number-pad"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Số đội/bảng *</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="list-outline" size={20} color="#9CA3AF" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="4"
                placeholderTextColor="#9CA3AF"
                value={teamsPerGroup}
                onChangeText={setTeamsPerGroup}
                keyboardType="number-pad"
              />
            </View>
          </View>

          <View style={styles.validationContainer}>
            <Text style={styles.hint}>
              * Tổng số đội = Số bảng × Số đội/bảng ({numberOfGroups} × {teamsPerGroup} = {parseInt(numberOfGroups) * parseInt(teamsPerGroup)})
            </Text>
            {parseInt(numberOfGroups) * parseInt(teamsPerGroup) === parseInt(numberOfTeams) ? (
              <View style={styles.validationSuccess}>
                <Ionicons name="checkmark-circle" size={16} color={colors.win} />
                <Text style={[styles.validationText, { color: colors.win }]}>Cài đặt hợp lệ</Text>
              </View>
            ) : (
              <View style={styles.validationError}>
                <Ionicons name="warning" size={16} color={colors.lose} />
                <Text style={[styles.validationText, { color: colors.lose }]}>
                  Cần điều chỉnh: {parseInt(numberOfTeams)} đội ≠ {parseInt(numberOfGroups) * parseInt(teamsPerGroup)} đội
                </Text>
                <TouchableOpacity
                  style={[styles.autoFixButton, { backgroundColor: colors.primary }]}
                  onPress={() => {
                    const teams = parseInt(numberOfTeams);
                    const groups = parseInt(numberOfGroups);
                    if (teams > 0 && groups > 0) {
                      const perGroup = Math.floor(teams / groups);
                      setTeamsPerGroup(String(perGroup));
                    }
                  }}>
                  <Text style={styles.autoFixText}>Tự động sửa</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </>
      )}

      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => setStep(1)}>
          <Ionicons name="arrow-back" size={20} color="#374151" />
          <Text style={styles.secondaryButtonText}>Quay lại</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.primaryButton, { flex: 1, backgroundColor: colors.primary }]}
          onPress={() => setStep(3)}>
          <Text style={styles.primaryButtonText}>Tiếp theo</Text>
          <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderStep3 = () => (
    <View style={styles.stepCard}>
      <Text style={styles.stepTitle}>Cài đặt</Text>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Chế độ hiển thị *</Text>
        <View style={styles.typeContainer}>
        <TouchableOpacity
          style={[
            styles.typeButton,
            { borderColor: colors.border },
            visibility === 'public' && { backgroundColor: colors.primary, borderColor: colors.primary }
          ]}
          onPress={() => setVisibility('public')}>
          <Text style={[
            styles.typeText,
            visibility === 'public' && { fontWeight: '600', color: '#FFFFFF' }
          ]}>
            Công khai
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.typeButton,
            { borderColor: colors.border },
            visibility === 'private' && { backgroundColor: colors.primary, borderColor: colors.primary }
          ]}
          onPress={() => setVisibility('private')}>
          <Text style={[
            styles.typeText,
            visibility === 'private' && { fontWeight: '600', color: '#FFFFFF' }
          ]}>
            Riêng tư
          </Text>
        </TouchableOpacity>
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Ngày bắt đầu (Tùy chọn)</Text>
        <TouchableOpacity
        style={styles.dateButton}
        onPress={() => setShowStartDatePicker(true)}
      >
        <Ionicons name="calendar-outline" size={20} color="#B91C3C" />
        <Text style={[styles.dateButtonText, !startDate && { opacity: 0.6 }]}>
          {startDate ? new Date(startDate).toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          }) : 'Chọn ngày bắt đầu'}
        </Text>
      </TouchableOpacity>
      {showStartDatePicker && (
        <DateTimePicker
          value={startDate ? new Date(startDate + 'T00:00:00') : new Date()}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={(event, selectedDate) => {
            setShowStartDatePicker(Platform.OS === 'ios');
            if (selectedDate) {
              const year = selectedDate.getFullYear();
              const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
              const day = String(selectedDate.getDate()).padStart(2, '0');
              setStartDate(`${year}-${month}-${day}`);
            }
          }}
        />
      )}
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Ngày kết thúc (Tùy chọn)</Text>
        <TouchableOpacity
        style={styles.dateButton}
        onPress={() => setShowEndDatePicker(true)}
      >
        <Ionicons name="calendar-outline" size={20} color="#B91C3C" />
        <Text style={[styles.dateButtonText, !endDate && { opacity: 0.6 }]}>
          {endDate ? new Date(endDate).toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          }) : 'Chọn ngày kết thúc'}
        </Text>
      </TouchableOpacity>
      {showEndDatePicker && (
        <DateTimePicker
          value={endDate ? new Date(endDate + 'T00:00:00') : new Date()}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={(event, selectedDate) => {
            setShowEndDatePicker(Platform.OS === 'ios');
            if (selectedDate) {
              const year = selectedDate.getFullYear();
              const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
              const day = String(selectedDate.getDate()).padStart(2, '0');
              setEndDate(`${year}-${month}-${day}`);
            }
          }}
        />
      )}
      </View>

      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => setStep(2)}>
          <Ionicons name="arrow-back" size={20} color="#374151" />
          <Text style={styles.secondaryButtonText}>Quay lại</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.primaryButton,
            { flex: 1, backgroundColor: colors.primary },
            (loading || (type === 'group-stage' && parseInt(numberOfGroups) * parseInt(teamsPerGroup) !== parseInt(numberOfTeams))) && { opacity: 0.6 }
          ]}
          onPress={handleCreate}
          disabled={loading || (type === 'group-stage' && parseInt(numberOfGroups) * parseInt(teamsPerGroup) !== parseInt(numberOfTeams))}>
          <Text style={styles.primaryButtonText}>
            {loading ? 'Đang tạo...' : 'Tạo giải đấu'}
          </Text>
          {!loading && <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />}
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <TabsBackground>
      <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Tạo Giải Đấu Mới</Text>
        <Text style={styles.headerSubtitle}>Bước {step}/3</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.progress}>
          <View style={[styles.progressDot, { backgroundColor: colors.border }, step >= 1 && { backgroundColor: colors.primary }]} />
          <View style={[styles.progressLine, { backgroundColor: colors.border }, step >= 2 && { backgroundColor: colors.primary }]} />
          <View style={[styles.progressDot, { backgroundColor: colors.border }, step >= 2 && { backgroundColor: colors.primary }]} />
          <View style={[styles.progressLine, { backgroundColor: colors.border }, step >= 3 && { backgroundColor: colors.primary }]} />
          <View style={[styles.progressDot, { backgroundColor: colors.border }, step >= 3 && { backgroundColor: colors.primary }]} />
        </View>

        <View style={styles.form}>
          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}
        </View>
      </ScrollView>
      </View>
    </TabsBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 15,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.95)',
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  content: {
    flex: 1,
    paddingTop: 20,
  },
  progress: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 40,
    marginBottom: 30,
  },
  progressDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  progressLine: {
    flex: 1,
    height: 2,
  },
  form: {
    padding: 20,
  },
  stepCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    borderWidth: 1.5,
    borderColor: 'rgba(214, 18, 64, 0.15)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
    marginBottom: 120,
  },
  stepTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 24,
    color: '#1F2937',
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 10,
    color: '#374151',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    backgroundColor: '#F9FAFB',
    overflow: 'hidden',
  },
  inputIcon: {
    marginLeft: 15,
  },
  input: {
    flex: 1,
    height: 50,
    paddingHorizontal: 15,
    fontSize: 16,
    color: '#1F2937',
  },
  textAreaContainer: {
    alignItems: 'flex-start',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
    paddingTop: 15,
  },
  logoPicker: {
    height: 140,
    borderWidth: 2,
    borderRadius: 16,
    borderStyle: 'dashed',
    borderColor: '#D1D5DB',
    backgroundColor: '#F9FAFB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    marginTop: 12,
    fontSize: 15,
    fontWeight: '500',
    color: '#6B7280',
  },
  typeContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  typeButton: {
    flex: 1,
    height: 50,
    borderWidth: 1.5,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  typeText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#374151',
  },
  hint: {
    fontSize: 12,
    marginTop: -17,
    color: '#6B7280',
  },
  validationContainer: {
    marginTop: 12,
    padding: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 10,
  },
  validationSuccess: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  validationError: {
    gap: 8,
  },
  validationText: {
    fontSize: 13,
    fontWeight: '500',
  },
  autoFixButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    marginTop: 10,
    alignSelf: 'flex-start',
  },
  autoFixText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  primaryButton: {
    flexDirection: 'row',
    height: 54,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  secondaryButton: {
    flexDirection: 'row',
    height: 54,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F3F4F6',
    borderWidth: 1.5,
    borderColor: '#D1D5DB',
    flex: 1,
  },
  secondaryButtonText: {
    color: '#374151',
    fontSize: 16,
    fontWeight: '600',
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    gap: 12,
    backgroundColor: '#F9FAFB',
  },
  dateButtonText: {
    fontSize: 15,
    flex: 1,
    fontWeight: '500',
    color: '#374151',
  },
});
