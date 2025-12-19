import { Colors } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import { leagueService } from '@/services/league';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useState } from 'react';
// Thêm Modal vào imports
import TabsBackground from '@/components/tabs/TabsBackground';
import { useQueryClient } from '@tanstack/react-query';
import { Alert, Image, Modal, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function CreateLeagueScreen() {
  const router = useRouter();
  const { logout, user } = useAuth();
  const queryClient = useQueryClient();
  const colors = Colors;
  const [step, setStep] = useState(1);

  // --- States ---
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [logo, setLogo] = useState<any>(null);
  const [type, setType] = useState<'round-robin' | 'group-stage'>('round-robin');
  const [visibility, setVisibility] = useState<'public' | 'private'>('public');
  const [numberOfTeams, setNumberOfTeams] = useState('6');
  const [numberOfGroups, setNumberOfGroups] = useState('2');
  const [teamsPerGroup, setTeamsPerGroup] = useState('3');
  
  // Date picker states
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  // State tạm để lưu ngày khi đang quay trên iOS
  const [tempDate, setTempDate] = useState(new Date());
  
  const [loading, setLoading] = useState(false);

  // --- Logic Handler Functions (Giữ nguyên không đổi) ---
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
    // ... (Logic tạo giải đấu giữ nguyên như cũ)
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

    if (type === 'group-stage') {
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

    if (shouldUseJson) {
      const jsonPayload: any = {
        name: name.trim(),
        type,
        visibility,
        numberOfTeams: actualNumberOfTeams,
      };
      if (description.trim()) jsonPayload.description = description.trim();
      if (type === 'group-stage') {
        jsonPayload.groupSettings = {
          numberOfGroups: groups,
          teamsPerGroup: perGroup,
        };
      }
      if (startDate) jsonPayload.startDate = startDate;
      if (endDate) jsonPayload.endDate = endDate;
      payload = jsonPayload;
    } else {
      const formData = new FormData();
      formData.append('name', name.trim());
      formData.append('type', type);
      formData.append('visibility', visibility);
      formData.append('numberOfTeams', String(actualNumberOfTeams));
      if (description.trim()) formData.append('description', description.trim());
      if (startDate) formData.append('startDate', startDate);
      if (endDate) formData.append('endDate', endDate);
      formData.append('logo', {
        uri: logo.uri,
        name: 'logo.jpg',
        type: 'image/jpeg',
      } as any);
      payload = formData;
    }

    try {
      setLoading(true);
      const response = await leagueService.createLeague(payload);
      
      if (shouldUseJson && logo) {
        try {
          const logoFormData = new FormData();
          logoFormData.append('logo', {
            uri: logo.uri,
            name: 'logo.jpg',
            type: 'image/jpeg',
          } as any);
          await leagueService.updateLeague(response.league._id, logoFormData);
        } catch (logoError) {
          console.warn('Logo upload failed', logoError);
        }
      }

      router.push(`/league/${response.league._id}` as any);
      resetForm();
      queryClient.invalidateQueries({ queryKey: ['publicLeagues'] });
      queryClient.invalidateQueries({ queryKey: ['myLeagues', user?._id] });
      
      Alert.alert('Thành công', response.message || 'Tạo giải đấu thành công!');
    } catch (error: any) {
      let errorMessage = 'Không thể tạo giải đấu';
      if (error.message === 'Access forbidden' || error.response?.status === 403) {
        await logout();
        Alert.alert('Phiên đăng nhập hết hạn', 'Vui lòng đăng nhập lại', [{ text: 'OK', onPress: () => router.replace('/login') }]);
        return;
      }
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      Alert.alert('Lỗi tạo giải', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // --- Helper function cho iOS DatePicker Modal ---
  const renderIOSDatePickerModal = (
    visible: boolean,
    setVisible: (v: boolean) => void,
    onConfirm: (date: Date) => void
  ) => {
    if (Platform.OS !== 'ios') return null;

    return (
      <Modal transparent animationType="fade" visible={visible}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setVisible(false)}>
                <Text style={styles.modalCancelText}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => {
                onConfirm(tempDate);
                setVisible(false);
              }}>
                <Text style={[styles.modalDoneText, { color: colors.primary }]}>Xong</Text>
              </TouchableOpacity>
            </View>
            {/* Bắt buộc set textColor cho iOS */}
            <DateTimePicker
              value={tempDate}
              mode="date"
              display="spinner"
              onChange={(_, selectedDate) => {
                if (selectedDate) setTempDate(selectedDate);
              }}
              textColor="#000000" 
              style={{ height: 200 }}
            />
          </View>
        </View>
      </Modal>
    );
  };


  // --- Render Steps ---
  const renderStep1 = () => (
    // ... (Giữ nguyên nội dung renderStep1)
     <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Thông tin cơ bản</Text>
      <Text style={styles.stepDescription}>Thiết lập tên và hình ảnh nhận diện cho giải đấu.</Text>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Tên giải đấu <Text style={styles.required}>*</Text></Text>
        <View style={styles.inputContainer}>
          <Ionicons name="trophy" size={20} color={colors.primary} style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="VD: Super League 2025"
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
            placeholder="Nhập thông tin chi tiết về giải đấu..."
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
        <TouchableOpacity style={styles.logoPicker} onPress={handlePickLogo}>
          {logo ? (
            <View style={styles.logoPreviewContainer}>
              <Image source={{ uri: logo.uri }} style={styles.logoPreview} />
              <View style={styles.logoOverlay}>
                <Ionicons name="camera" size={24} color="#FFF" />
                <Text style={styles.logoOverlayText}>Thay đổi</Text>
              </View>
            </View>
          ) : (
            <View style={styles.logoPlaceholder}>
              <View style={[styles.iconCircle, { backgroundColor: '#F3F4F6' }]}>
                <Ionicons name="image-outline" size={32} color={colors.primary} />
              </View>
              <Text style={styles.logoText}>Nhấn để tải ảnh lên</Text>
              <Text style={styles.logoSubText}>PNG, JPG tối đa 5MB</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={styles.nextButtonWrapper}
        onPress={() => setStep(2)}>
        <LinearGradient
          colors={[colors.primary, '#D64253']} 
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.primaryButton}
        >
          <Text style={styles.primaryButtonText}>Tiếp theo</Text>
          <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );

  const renderStep2 = () => (
    // ... (Giữ nguyên nội dung renderStep2)
     <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Thể thức thi đấu</Text>
      <Text style={styles.stepDescription}>Lựa chọn cách thức tổ chức và số lượng đội.</Text>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Chọn thể thức <Text style={styles.required}>*</Text></Text>
        <View style={styles.typeRow}>
          <TouchableOpacity
            style={[styles.typeOption, type === 'round-robin' && styles.typeOptionActive, { borderColor: type === 'round-robin' ? colors.primary : '#E5E7EB' }]}
            onPress={() => setType('round-robin')}>
            <View style={[styles.radioCircle, type === 'round-robin' && { borderColor: colors.primary }]}>
                {type === 'round-robin' && <View style={[styles.radioDot, { backgroundColor: colors.primary }]} />}
            </View>
            <View>
                <Text style={[styles.typeOptionTitle, type === 'round-robin' && { color: colors.primary }]}>Vòng tròn</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.typeOption, type === 'group-stage' && styles.typeOptionActive, { borderColor: type === 'group-stage' ? colors.primary : '#E5E7EB' }]}
            onPress={() => setType('group-stage')}>
             <View style={[styles.radioCircle, type === 'group-stage' && { borderColor: colors.primary }]}>
                {type === 'group-stage' && <View style={[styles.radioDot, { backgroundColor: colors.primary }]} />}
            </View>
            <View>
                <Text style={[styles.typeOptionTitle, type === 'group-stage' && { color: colors.primary }]}>Chia bảng</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.rowInputs}>
        <View style={[styles.inputGroup, { flex: 1 }]}>
            <Text style={styles.label}>Số đội tham gia <Text style={styles.required}>*</Text></Text>
            <View style={styles.inputContainer}>
            <Ionicons name="people-outline" size={20} color="#6B7280" style={styles.inputIcon} />
            <TextInput
                style={styles.input}
                value={numberOfTeams}
                onChangeText={handleTeamsChange}
                keyboardType="number-pad"
                textAlign="center"
            />
            </View>
        </View>
      </View>

      {type === 'group-stage' && (
        <View style={styles.groupStageSettings}>
            <View style={styles.groupHeader}>
                <Ionicons name="options-outline" size={20} color="#4B5563" />
                <Text style={styles.groupHeaderTitle}>Cấu hình bảng đấu</Text>
            </View>
            
          <View style={styles.rowInputs}>
            <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
                <Text style={styles.subLabel}>Số bảng</Text>
                <View style={styles.miniInputContainer}>
                <TextInput
                    style={styles.input}
                    value={numberOfGroups}
                    onChangeText={handleGroupsChange}
                    keyboardType="number-pad"
                    textAlign="center"
                />
                </View>
            </View>
            <View style={[styles.inputGroup, { flex: 1, marginLeft: 10 }]}>
                <Text style={styles.subLabel}>Số đội/bảng</Text>
                <View style={styles.miniInputContainer}>
                <TextInput
                    style={styles.input}
                    value={teamsPerGroup}
                    onChangeText={setTeamsPerGroup}
                    keyboardType="number-pad"
                    textAlign="center"
                />
                </View>
            </View>
          </View>

          <View style={styles.validationBox}>
            {parseInt(numberOfGroups) * parseInt(teamsPerGroup) === parseInt(numberOfTeams) ? (
              <View style={styles.validationSuccess}>
                <Ionicons name="checkmark-circle" size={18} color="#10B981" />
                <Text style={styles.validationTextSuccess}>Cài đặt hợp lệ</Text>
              </View>
            ) : (
              <View style={styles.validationError}>
                <View style={styles.validationRow}>
                    <Ionicons name="alert-circle" size={18} color="#EF4444" />
                    <Text style={styles.validationTextError}>
                    Tổng: {parseInt(numberOfTeams)} đội ≠ {parseInt(numberOfGroups) * parseInt(teamsPerGroup)} (Tính toán)
                    </Text>
                </View>
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
        </View>
      )}

      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.secondaryButton} onPress={() => setStep(1)}>
          <Ionicons name="arrow-back" size={20} color="#374151" />
          <Text style={styles.secondaryButtonText}>Quay lại</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.nextButtonWrapper, {flex: 1}]} onPress={() => setStep(3)}>
            <LinearGradient
            colors={[colors.primary, '#D64253']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.primaryButton}
            >
            <Text style={styles.primaryButtonText}>Tiếp theo</Text>
            <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
            </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderStep3 = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>Cài đặt khác</Text>
      <Text style={styles.stepDescription}>Thiết lập quyền riêng tư và thời gian.</Text>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Chế độ hiển thị</Text>
        <View style={styles.visibilityContainer}>
          <TouchableOpacity
            style={[styles.visibilityBtn, visibility === 'public' && { backgroundColor: '#EEF2FF', borderColor: colors.primary }]}
            onPress={() => setVisibility('public')}>
            <Ionicons name="globe-outline" size={24} color={visibility === 'public' ? colors.primary : '#6B7280'} />
            <Text style={[styles.visibilityText, visibility === 'public' && { color: colors.primary, fontWeight: '700' }]}>Công khai</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.visibilityBtn, visibility === 'private' && { backgroundColor: '#EEF2FF', borderColor: colors.primary }]}
            onPress={() => setVisibility('private')}>
            <Ionicons name="lock-closed-outline" size={24} color={visibility === 'private' ? colors.primary : '#6B7280'} />
            <Text style={[styles.visibilityText, visibility === 'private' && { color: colors.primary, fontWeight: '700' }]}>Riêng tư</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Thời gian (Tùy chọn)</Text>
        
        {/* Nút chọn Ngày bắt đầu */}
        <TouchableOpacity 
            style={styles.datePickerBtn} 
            onPress={() => {
                setTempDate(startDate ? new Date(startDate) : new Date());
                setShowStartDatePicker(true);
            }}
        >
            <View style={styles.dateIconBox}>
                <Ionicons name="calendar" size={20} color={colors.primary} />
            </View>
            <View style={styles.dateInfo}>
                <Text style={styles.dateLabel}>Ngày bắt đầu</Text>
                <Text style={styles.dateValue}>
                    {startDate ? new Date(startDate).toLocaleDateString('vi-VN') : 'Chưa chọn'}
                </Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
        </TouchableOpacity>
        
        <View style={styles.dateConnector} />

        {/* Nút chọn Ngày kết thúc */}
        <TouchableOpacity 
            style={styles.datePickerBtn} 
            onPress={() => {
                 setTempDate(endDate ? new Date(endDate) : new Date());
                setShowEndDatePicker(true);
            }}
        >
             <View style={styles.dateIconBox}>
                <Ionicons name="flag" size={20} color={colors.primary} />
            </View>
            <View style={styles.dateInfo}>
                <Text style={styles.dateLabel}>Ngày kết thúc</Text>
                <Text style={styles.dateValue}>
                    {endDate ? new Date(endDate).toLocaleDateString('vi-VN') : 'Chưa chọn'}
                </Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color="#9CA3AF" />
        </TouchableOpacity>
      </View>

      {/* --- Xử lý hiển thị DatePicker --- */}
      
      {/* Cho iOS: Dùng Modal */}
      {Platform.OS === 'ios' && renderIOSDatePickerModal(
        showStartDatePicker,
        setShowStartDatePicker,
        (date) => setStartDate(date.toISOString().split('T')[0])
      )}
       {Platform.OS === 'ios' && renderIOSDatePickerModal(
        showEndDatePicker,
        setShowEndDatePicker,
        (date) => setEndDate(date.toISOString().split('T')[0])
      )}

      {/* Cho Android: Hiển thị trực tiếp (giữ nguyên) */}
      {Platform.OS !== 'ios' && showStartDatePicker && (
        <DateTimePicker
          value={startDate ? new Date(startDate + 'T00:00:00') : new Date()}
          mode="date"
          display="default"
          onChange={(event, selectedDate) => {
            setShowStartDatePicker(false);
            if (selectedDate) {
              setStartDate(selectedDate.toISOString().split('T')[0]);
            }
          }}
        />
      )}
      {Platform.OS !== 'ios' && showEndDatePicker && (
        <DateTimePicker
          value={endDate ? new Date(endDate + 'T00:00:00') : new Date()}
          mode="date"
          display="default"
          onChange={(event, selectedDate) => {
            setShowEndDatePicker(false);
            if (selectedDate) {
              setEndDate(selectedDate.toISOString().split('T')[0]);
            }
          }}
        />
      )}
      {/* ----------------------------------- */}

      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.secondaryButton} onPress={() => setStep(2)}>
          <Ionicons name="arrow-back" size={20} color="#374151" />
          <Text style={styles.secondaryButtonText}>Quay lại</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.nextButtonWrapper, {flex: 1}, (loading || (type === 'group-stage' && parseInt(numberOfGroups) * parseInt(teamsPerGroup) !== parseInt(numberOfTeams))) && { opacity: 0.6 }]}
          onPress={handleCreate}
          disabled={loading || (type === 'group-stage' && parseInt(numberOfGroups) * parseInt(teamsPerGroup) !== parseInt(numberOfTeams))}>
            <LinearGradient
            colors={['#10B981', '#059669']} 
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.primaryButton}
            >
            <Text style={styles.primaryButtonText}>{loading ? 'Đang tạo...' : 'Hoàn tất'}</Text>
            {!loading && <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />}
            </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <TabsBackground>
      <View style={styles.container}>
        <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                 <Ionicons name="arrow-back" size={24} color="#FFF" />
            </TouchableOpacity>
          <Text style={styles.headerTitle}>Tạo Giải Đấu</Text>
          <View style={{ width: 24 }} /> 
        </View>

        <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
                <View style={[styles.progressStep, step >= 1 && styles.progressStepActive]} />
                <View style={[styles.progressStep, step >= 2 && styles.progressStepActive]} />
                <View style={[styles.progressStep, step >= 3 && styles.progressStepActive]} />
            </View>
            <Text style={styles.progressText}>Bước {step}/3</Text>
        </View>

        <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
          {/* Thẻ chứa nội dung chính */}
          <View style={styles.cardContainer}>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 15,
  },
  backButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  progressContainer: {
    paddingHorizontal: 24,
    marginBottom: 20,
  },
  progressBar: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  progressStep: {
    flex: 1,
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 2,
  },
  progressStepActive: {
    backgroundColor: '#FFF',
  },
  progressText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'right',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  // --- THAY ĐỔI STYLE CHO THẺ TRONG HƠN ---
  cardContainer: {
    // Sử dụng màu trắng bán trong suốt (rgba)
    backgroundColor: 'rgba(255, 255, 255, 0.85)', 
    borderRadius: 24,
    padding: 24,
    // Thêm viền mờ để tạo hiệu ứng kính
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    // Điều chỉnh shadow nhẹ hơn và có màu
    shadowColor: Colors.primary, 
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 4,
    marginBottom: 40,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 8,
  },
  stepDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 24,
    lineHeight: 20,
  },
  stepContent: {
    width: '100%',
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    color: '#374151',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  required: {
    color: '#EF4444',
  },
  subLabel: {
    fontSize: 13,
    color: '#4B5563',
    marginBottom: 6,
    fontWeight: '500',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    // Nền input cũng nên hơi trong một chút nếu muốn đồng bộ
    backgroundColor: 'rgba(255, 255, 255, 0.8)', 
    paddingHorizontal: 4,
    height: 52,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  inputIcon: {
    paddingLeft: 12,
  },
  input: {
    flex: 1,
    height: '100%',
    paddingHorizontal: 12,
    fontSize: 16,
    color: '#1F2937',
  },
  textAreaContainer: {
    height: 120,
    alignItems: 'flex-start',
    paddingTop: 12,
  },
  textArea: {
    height: '100%',
    textAlignVertical: 'top',
  },
  logoPicker: {
    height: 160,
    borderWidth: 2,
    borderRadius: 16,
    borderStyle: 'dashed',
    borderColor: '#D1D5DB',
    backgroundColor: 'rgba(249, 250, 251, 0.8)', // Hơi trong
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  logoPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  logoText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#4B5563',
  },
  logoSubText: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 4,
  },
  logoPreviewContainer: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  logoPreview: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  logoOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 8,
    gap: 6,
  },
  logoOverlayText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '600',
  },
  typeRow: {
    flexDirection: 'row',
    gap: 12,
  },
  typeOption: {
    flex: 1,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1.5,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  typeOptionActive: {
    backgroundColor: 'rgba(254, 242, 242, 0.9)', 
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  typeOptionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#374151',
  },
  typeOptionDesc: {
    fontSize: 11,
    color: '#6B7280',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 10,
  },
  nextButtonWrapper: {
    borderRadius: 14,
    overflow: 'hidden',
  },
  primaryButton: {
    flexDirection: 'row',
    height: 54,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  secondaryButton: {
    height: 54,
    paddingHorizontal: 24,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    backgroundColor: '#F3F4F6',
  },
  secondaryButtonText: {
    color: '#4B5563',
    fontSize: 15,
    fontWeight: '600',
  },
  groupStageSettings: {
    backgroundColor: 'rgba(249, 250, 251, 0.8)',
    padding: 16,
    borderRadius: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  groupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  groupHeaderTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4B5563',
  },
  rowInputs: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  miniInputContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    height: 48,
  },
  validationBox: {
    marginTop: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  validationSuccess: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  validationTextSuccess: {
    color: '#10B981',
    fontWeight: '600',
    fontSize: 13,
  },
  validationError: {
    gap: 8,
  },
  validationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  validationTextError: {
    color: '#EF4444',
    fontSize: 13,
    flex: 1,
  },
  autoFixButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginLeft: 26,
  },
  autoFixText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  visibilityContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  visibilityBtn: {
    flex: 1,
    height: 80,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(249, 250, 251, 0.8)',
  },
  visibilityText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  datePickerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: 'rgba(249, 250, 251, 0.8)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  dateIconBox: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#EEF2FF', 
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  dateInfo: {
    flex: 1,
  },
  dateLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 2,
  },
  dateValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937',
  },
  dateConnector: {
    height: 20,
    width: 2,
    backgroundColor: '#E5E7EB',
    marginLeft: 29, 
    marginVertical: 4,
  },
  // --- STYLES CHO IOS MODAL ---
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Nền tối mờ khi modal hiện lên
  },
  modalContent: {
    backgroundColor: 'white', // Nền trắng cho vùng quay số
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    backgroundColor: '#F9FAFB',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  modalCancelText: {
    fontSize: 16,
    color: '#6B7280',
  },
  modalDoneText: {
    fontSize: 16,
    fontWeight: '600',
  },
});