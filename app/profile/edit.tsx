import { Ionicons } from '@expo/vector-icons';
import { yupResolver } from '@hookform/resolvers/yup';
import { Stack, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Alert, ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import * as yup from 'yup';
import { Button } from '../../components/ui/button';
import TabsBackground from '../../components/tabs/TabsBackground';
import { Colors } from '../../constants/theme';
import { useAuth } from '../../contexts/AuthContext';
import { authService } from '../../services/auth';

const schema = yup.object({
  username: yup
    .string()
    .required('Tên người dùng là bắt buộc')
    .min(3, 'Tối thiểu 3 ký tự')
    .max(30, 'Tối đa 30 ký tự')
    .matches(/^[a-zA-ZÀ-ỹ0-9_ ]+$/, 'Chỉ gồm chữ cái, số, dấu gạch dưới và khoảng trắng'),
  email: yup
    .string()
    .email('Email không hợp lệ')
    .required('Email là bắt buộc'),
  phone: yup
    .string()
    .matches(/^(0|\+84)[0-9]{9,10}$/, 'Số điện thoại không hợp lệ (VD: 0912345678 hoặc +84912345678)')
    .optional(),
  address: yup
    .string()
    .max(255, 'Địa chỉ tối đa 255 ký tự')
    .optional(),
});

export default function EditProfileScreen() {
  const { user, updateUser } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const colors = Colors;

  const { control, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      username: user?.username || '',
      email: user?.email || '',
      phone: user?.phone || '',
      address: user?.address || '',
    },
  });

  const onSubmit = async (data: any) => {
    setLoading(true);
    try {
      const response = await authService.updateProfile(data);
      updateUser(response.user);
      Alert.alert('Thành công', 'Cập nhật thông tin thành công', [
        { text: 'OK', onPress: () => router.back()}
      ]);
    } catch (error: any) {
      Alert.alert('Lỗi', error.response?.data?.message || 'Không thể cập nhật thông tin');
    } finally {
      setLoading(false);
    }
  };

  return (
    <TabsBackground>
      <StatusBar backgroundColor="rgba(214, 18, 64, 1)" barStyle="light-content" />
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: 'Chỉnh sửa thông tin',
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
      
      <ScrollView 
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.formCard}>
          <View style={styles.infoBox}>
            <Ionicons name="information-circle" size={20} color="#3B82F6" />
            <Text style={styles.infoText}>
              Cập nhật thông tin cá nhân của bạn. Email không thể thay đổi.
            </Text>
          </View>

          <Controller
            control={control}
            name="username"
            render={({ field: { onChange, onBlur, value } }) => (
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Tên người dùng</Text>
                <View style={[styles.inputContainer, errors.username && styles.inputError]}>
                  <Ionicons name="person-outline" size={20} color="#9CA3AF" style={styles.inputIcon} />
                  <TextInput
                    style={styles.textInput}
                    placeholder="Nhập tên người dùng"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    autoCapitalize="words"
                    placeholderTextColor="#9CA3AF"
                  />
                </View>
                {errors.username && (
                  <View style={styles.errorContainer}>
                    <Ionicons name="alert-circle" size={14} color="#DC2626" />
                    <Text style={styles.errorText}>{errors.username.message}</Text>
                  </View>
                )}
              </View>
            )}
          />

          <Controller
            control={control}
            name="email"
            render={({ field: { onChange, onBlur, value } }) => (
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Email</Text>
                <View style={[styles.inputContainer, styles.inputDisabled]}>
                  <Ionicons name="mail-outline" size={20} color="#9CA3AF" style={styles.inputIcon} />
                  <TextInput
                    style={[styles.textInput, { color: '#9CA3AF' }]}
                    placeholder="Email"
                    value={value}
                    editable={false}
                    placeholderTextColor="#9CA3AF"
                  />
                  <Ionicons name="lock-closed" size={16} color="#9CA3AF" />
                </View>
                <Text style={styles.hintText}>Email không thể thay đổi</Text>
              </View>
            )}
          />

          <Controller
            control={control}
            name="phone"
            render={({ field: { onChange, onBlur, value } }) => (
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Số điện thoại (Tùy chọn)</Text>
                <View style={[styles.inputContainer, errors.phone && styles.inputError]}>
                  <Ionicons name="call-outline" size={20} color="#9CA3AF" style={styles.inputIcon} />
                  <TextInput
                    style={styles.textInput}
                    placeholder="0912345678"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    keyboardType="phone-pad"
                    placeholderTextColor="#9CA3AF"
                  />
                </View>
                {errors.phone && (
                  <View style={styles.errorContainer}>
                    <Ionicons name="alert-circle" size={14} color="#DC2626" />
                    <Text style={styles.errorText}>{errors.phone.message}</Text>
                  </View>
                )}
              </View>
            )}
          />

          <Controller
            control={control}
            name="address"
            render={({ field: { onChange, onBlur, value } }) => (
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Địa chỉ (Tùy chọn)</Text>
                <View style={[styles.inputContainer, errors.address && styles.inputError]}>
                  <Ionicons name="location-outline" size={20} color="#9CA3AF" style={styles.inputIcon} />
                  <TextInput
                    style={styles.textInput}
                    placeholder="Nhập địa chỉ của bạn"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    autoCapitalize="words"
                    placeholderTextColor="#9CA3AF"
                  />
                </View>
                {errors.address && (
                  <View style={styles.errorContainer}>
                    <Ionicons name="alert-circle" size={14} color="#DC2626" />
                    <Text style={styles.errorText}>{errors.address.message}</Text>
                  </View>
                )}
              </View>
            )}
          />

          <Button
            onPress={handleSubmit(onSubmit)}
            disabled={loading}
            loading={loading}
            style={styles.submitButton}
          >
            {loading ? 'Đang cập nhật...' : 'Cập nhật thông tin'}
          </Button>
        </View>
      </ScrollView>
    </TabsBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
    padding: 14,
    marginBottom: 24,
    gap: 10,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: '#1E40AF',
    lineHeight: 18,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 14,
    minHeight: 50,
  },
  inputDisabled: {
    backgroundColor: '#F3F4F6',
  },
  inputError: {
    borderColor: '#DC2626',
    backgroundColor: '#FEF2F2',
  },
  inputIcon: {
    marginRight: 10,
  },
  textInput: {
    flex: 1,
    fontSize: 15,
    color: '#1F2937',
    paddingVertical: 12,
  },
  textAreaContainer: {
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    backgroundColor: '#F9FAFB',
    minHeight: 90,
  },
  textArea: {
    fontSize: 15,
    color: '#1F2937',
    padding: 14,
    minHeight: 90,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 6,
  },
  errorText: {
    fontSize: 13,
    color: '#DC2626',
  },
  hintText: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 6,
  },
  submitButton: {
    marginTop: 12,
  },
});
