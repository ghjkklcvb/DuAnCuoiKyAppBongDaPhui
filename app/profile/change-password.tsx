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
  currentPassword: yup.string().required('Mật khẩu hiện tại là bắt buộc'),
  newPassword: yup
    .string()
    .required('Mật khẩu mới là bắt buộc')
    .min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
  confirmPassword: yup
    .string()
    .required('Xác nhận mật khẩu là bắt buộc')
    .oneOf([yup.ref('newPassword')], 'Mật khẩu xác nhận không khớp'),
});

export default function ChangePasswordScreen() {
  const router = useRouter();
  const { logout } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const colors = Colors;

  const { control, handleSubmit, formState: { errors }, reset } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (data: any) => {
    setLoading(true);
    try {
      await authService.changePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
        confirmPassword: data.confirmPassword,
      });
      
      Alert.alert(
        'Thành công', 
        'Đổi mật khẩu thành công! Vui lòng đăng nhập lại.',
        [
          { 
            text: 'OK', 
            onPress: async () => {
              try {
                await logout();
              } catch (error) {
                console.log('⚠️ Logout after password change - token already invalidated (expected)');
              } finally {
                router.replace('/login' as any);
              }
            }
          }
        ]
      );
    } catch (error: any) {
      Alert.alert('Lỗi', error.response?.data?.message || 'Không thể đổi mật khẩu');
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
          headerTitle: 'Đổi mật khẩu',
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
            <Ionicons name="shield-checkmark" size={20} color="#3B82F6" />
            <Text style={styles.infoText}>
              Để bảo mật tài khoản, vui lòng nhập mật khẩu hiện tại và mật khẩu mới.
            </Text>
          </View>

          <Controller
            control={control}
            name="currentPassword"
            render={({ field: { onChange, onBlur, value } }) => (
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Mật khẩu hiện tại</Text>
                <View style={[styles.inputContainer, errors.currentPassword && styles.inputError]}>
                  <Ionicons name="lock-closed-outline" size={20} color="#9CA3AF" style={styles.inputIcon} />
                  <TextInput
                    style={styles.textInput}
                    placeholder="Nhập mật khẩu hiện tại"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    secureTextEntry={!showCurrentPassword}
                    autoCapitalize="none"
                    placeholderTextColor="#9CA3AF"
                  />
                  <TouchableOpacity 
                    onPress={() => setShowCurrentPassword(!showCurrentPassword)}
                    style={styles.eyeButton}
                  >
                    <Ionicons 
                      name={showCurrentPassword ? "eye-outline" : "eye-off-outline"} 
                      size={20} 
                      color="#9CA3AF" 
                    />
                  </TouchableOpacity>
                </View>
                {errors.currentPassword && (
                  <View style={styles.errorContainer}>
                    <Ionicons name="alert-circle" size={14} color="#DC2626" />
                    <Text style={styles.errorText}>{errors.currentPassword.message}</Text>
                  </View>
                )}
              </View>
            )}
          />

          <Controller
            control={control}
            name="newPassword"
            render={({ field: { onChange, onBlur, value } }) => (
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Mật khẩu mới</Text>
                <View style={[styles.inputContainer, errors.newPassword && styles.inputError]}>
                  <Ionicons name="lock-open-outline" size={20} color="#9CA3AF" style={styles.inputIcon} />
                  <TextInput
                    style={styles.textInput}
                    placeholder="Nhập mật khẩu mới"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    secureTextEntry={!showNewPassword}
                    autoCapitalize="none"
                    placeholderTextColor="#9CA3AF"
                  />
                  <TouchableOpacity 
                    onPress={() => setShowNewPassword(!showNewPassword)}
                    style={styles.eyeButton}
                  >
                    <Ionicons 
                      name={showNewPassword ? "eye-outline" : "eye-off-outline"} 
                      size={20} 
                      color="#9CA3AF" 
                    />
                  </TouchableOpacity>
                </View>
                {errors.newPassword && (
                  <View style={styles.errorContainer}>
                    <Ionicons name="alert-circle" size={14} color="#DC2626" />
                    <Text style={styles.errorText}>{errors.newPassword.message}</Text>
                  </View>
                )}
              </View>
            )}
          />

          <Controller
            control={control}
            name="confirmPassword"
            render={({ field: { onChange, onBlur, value } }) => (
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Xác nhận mật khẩu mới</Text>
                <View style={[styles.inputContainer, errors.confirmPassword && styles.inputError]}>
                  <Ionicons name="checkmark-circle-outline" size={20} color="#9CA3AF" style={styles.inputIcon} />
                  <TextInput
                    style={styles.textInput}
                    placeholder="Nhập lại mật khẩu mới"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    secureTextEntry={!showConfirmPassword}
                    autoCapitalize="none"
                    placeholderTextColor="#9CA3AF"
                  />
                  <TouchableOpacity 
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                    style={styles.eyeButton}
                  >
                    <Ionicons 
                      name={showConfirmPassword ? "eye-outline" : "eye-off-outline"} 
                      size={20} 
                      color="#9CA3AF" 
                    />
                  </TouchableOpacity>
                </View>
                {errors.confirmPassword && (
                  <View style={styles.errorContainer}>
                    <Ionicons name="alert-circle" size={14} color="#DC2626" />
                    <Text style={styles.errorText}>{errors.confirmPassword.message}</Text>
                  </View>
                )}
              </View>
            )}
          />

          <View style={styles.requirementsBox}>
            <View style={styles.requirementRow}>
              <Ionicons name="shield-checkmark" size={16} color="#10B981" />
              <Text style={styles.requirementText}>Mật khẩu phải có ít nhất 6 ký tự</Text>
            </View>
            <View style={styles.requirementRow}>
              <Ionicons name="key" size={16} color="#10B981" />
              <Text style={styles.requirementText}>Nên kết hợp chữ hoa, thường và số</Text>
            </View>
          </View>

          <Button
            onPress={handleSubmit(onSubmit)}
            disabled={loading}
            loading={loading}
            style={styles.submitButton}
          >
            {loading ? 'Đang cập nhật...' : 'Đổi mật khẩu'}
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
    elevation: 8,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
    padding: 14,
    marginBottom: 24,
  },
  infoText: {
    fontSize: 13,
    color: '#1E40AF',
    marginLeft: 10,
    flex: 1,
    lineHeight: 20,
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
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
  },
  inputError: {
    borderColor: '#DC2626',
  },
  inputIcon: {
    marginRight: 12,
  },
  textInput: {
    flex: 1,
    fontSize: 15,
    color: '#1F2937',
    paddingVertical: 0,
  },
  eyeButton: {
    padding: 4,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    marginLeft: 4,
  },
  errorText: {
    fontSize: 12,
    color: '#DC2626',
    marginLeft: 6,
    flex: 1,
  },
  requirementsBox: {
    backgroundColor: '#F0FDF4',
    borderRadius: 12,
    padding: 14,
    marginBottom: 24,
  },
  requirementRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  requirementText: {
    fontSize: 13,
    color: '#166534',
    marginLeft: 10,
    flex: 1,
  },
  submitButton: {
    marginTop: 8,
  },
});
