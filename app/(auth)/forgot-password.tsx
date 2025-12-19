import { Ionicons } from '@expo/vector-icons';
import { yupResolver } from '@hookform/resolvers/yup';
import { LinearGradient } from 'expo-linear-gradient';
import { Link, useRouter } from 'expo-router';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Alert, Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, StatusBar } from 'react-native';
import * as yup from 'yup';
import { authService } from '../../services/auth';
import AuthBackground from '../../components/auth/AuthBackground';

const emailSchema = yup.object({
  email: yup
    .string()
    .email('Email không hợp lệ')
    .required('Email là bắt buộc'),
});

const otpSchema = yup.object({
  otp: yup
    .string()
    .length(6, 'OTP phải có 6 chữ số')
    .required('OTP là bắt buộc'),
});

const passwordSchema = yup.object({
  newPassword: yup
    .string()
    .min(6, 'Mật khẩu phải có ít nhất 6 ký tự')
    .required('Mật khẩu là bắt buộc'),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref('newPassword')], 'Mật khẩu không khớp')
    .required('Xác nhận mật khẩu là bắt buộc'),
});

type EmailForm = yup.InferType<typeof emailSchema>;
type OTPForm = yup.InferType<typeof otpSchema>;
type PasswordForm = yup.InferType<typeof passwordSchema>;

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const emailForm = useForm<EmailForm>({
    resolver: yupResolver(emailSchema),
    defaultValues: { email: '' },
  });

  const otpForm = useForm<OTPForm>({
    resolver: yupResolver(otpSchema),
    defaultValues: { otp: '' },
  });

  const passwordForm = useForm<PasswordForm>({
    resolver: yupResolver(passwordSchema),
    defaultValues: { newPassword: '', confirmPassword: '' },
  });

  const handleSendOTP = async (data: EmailForm) => {
    setIsLoading(true);
    try {
      const response = await authService.sendOTP(data.email);
      setEmail(data.email);
      Alert.alert('Thành công', response.message || 'Đã gửi mã OTP đến email của bạn!');
      setStep(2);
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Không thể gửi OTP. Vui lòng thử lại.';
      Alert.alert('Lỗi', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async (data: OTPForm) => {
    setIsLoading(true);
    try {
      const response = await authService.verifyOTP(email, data.otp);
      setResetToken(response.resetToken);
      Alert.alert('Thành công', response.message || 'Xác minh OTP thành công!');
      setStep(3);
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'OTP không hợp lệ hoặc đã hết hạn.';
      Alert.alert('Lỗi', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (data: PasswordForm) => {
    setIsLoading(true);
    try {
      const response = await authService.resetPassword(email, resetToken, data.newPassword);
      Alert.alert(
        'Thành công',
        response.message || 'Đặt lại mật khẩu thành công!',
        [{ text: 'OK', onPress: () => router.replace('/(auth)/login') }]
      );
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Không thể đặt lại mật khẩu.';
      Alert.alert('Lỗi', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setIsLoading(true);
    try {
      await authService.sendOTP(email);
      Alert.alert('Thành công', 'Đã gửi lại mã OTP!');
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Không thể gửi lại OTP.';
      Alert.alert('Lỗi', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToEmail = () => {
    setStep(1);
    setEmail('');
    setResetToken('');
    otpForm.reset();
    passwordForm.reset();
  };


  if (step === 1) {
    return (
      <AuthBackground>
        <ScrollView showsVerticalScrollIndicator={false}>
          <StatusBar barStyle="light-content" />
          
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <Image 
                source={require('../../assets/images/icon.png')} 
                style={styles.logoImage}
                resizeMode="cover"
              />
            </View>
            
            <Text style={styles.appTitle}>Quên mật khẩu</Text>
            <Text style={styles.appSubtitle}>Nhập email để nhận mã OTP</Text>
          </View>

        <View style={styles.formContainer}>
          <View style={styles.formCard}>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Email</Text>
              <View style={[styles.inputContainer, emailForm.formState.errors.email && styles.inputError]}>
                <Ionicons name="mail-outline" size={20} color="#9CA3AF" style={styles.inputIcon} />
                <Controller
                  control={emailForm.control}
                  name="email"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                      style={styles.textInput}
                      placeholder="phuileague@gmaiil.com"
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      placeholderTextColor="#9CA3AF"
                    />
                  )}
                />
              </View>
              {emailForm.formState.errors.email && (
                <Text style={styles.errorText}>{emailForm.formState.errors.email.message}</Text>
              )}
            </View>

            <TouchableOpacity
              style={[styles.submitButton, isLoading && styles.buttonDisabled]}
              onPress={emailForm.handleSubmit(handleSendOTP)}
              disabled={isLoading}>
              <LinearGradient
                colors={['#B91C3C', '#DC2626']}
                style={styles.buttonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}>
                <Text style={styles.submitButtonText}>
                  {isLoading ? 'Đang gửi...' : 'Gửi mã OTP'}
                </Text>
                {!isLoading && <Ionicons name="send" size={18} color="#FFFFFF" style={{ marginLeft: 8 }} />}
              </LinearGradient>
            </TouchableOpacity>

            <View style={styles.linkContainer}>
              <Text style={styles.linkText}>Nhớ mật khẩu rồi? </Text>
              <Link href="/(auth)/login" asChild>
                <TouchableOpacity>
                  <Text style={styles.link}>Đăng nhập ngay</Text>
                </TouchableOpacity>
              </Link>
            </View>
          </View>
        </View>
        </ScrollView>
      </AuthBackground>
    );
  }

  if (step === 2) {
    return (
      <AuthBackground>
        <ScrollView showsVerticalScrollIndicator={false}>
          <StatusBar barStyle="light-content" />
          
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <Image 
                source={require('../../assets/images/icon.png')} 
                style={styles.logoImage}
                resizeMode="cover"
              />
            </View>
            
            <Text style={styles.appTitle}>Xác thực OTP</Text>
            <Text style={styles.appSubtitle}>Nhập mã OTP đã gửi đến email</Text>
          </View>

        <View style={styles.formContainer}>
          <View style={styles.formCard}>
            
            <View style={styles.emailDisplay}>
              <Ionicons name="mail" size={16} color="#B91C3C" style={{ marginRight: 8 }} />
              <Text style={styles.emailDisplayText}>{email}</Text>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Mã OTP</Text>
              <View style={[styles.inputContainer, otpForm.formState.errors.otp && styles.inputError]}>
                <Ionicons name="lock-closed-outline" size={20} color="#9CA3AF" style={styles.inputIcon} />
                <Controller
                  control={otpForm.control}
                  name="otp"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                      style={[styles.textInput, styles.otpInput]}
                      placeholder="000000"
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      keyboardType="number-pad"
                      maxLength={6}
                      placeholderTextColor="#9CA3AF"
                    />
                  )}
                />
              </View>
              {otpForm.formState.errors.otp && (
                <Text style={styles.errorText}>{otpForm.formState.errors.otp.message}</Text>
              )}
            </View>

            <View style={styles.infoBox}>
              <View style={styles.infoRow}>
                <Ionicons name="time-outline" size={16} color="#3B82F6" />
                <Text style={styles.infoText}>OTP có hiệu lực trong 3 phút</Text>
              </View>
              <View style={styles.infoRow}>
                <Ionicons name="mail-open-outline" size={16} color="#3B82F6" />
                <Text style={styles.infoText}>Kiểm tra hộp thư spam nếu không thấy</Text>
              </View>
            </View>

            <TouchableOpacity
              style={[styles.submitButton, isLoading && styles.buttonDisabled]}
              onPress={otpForm.handleSubmit(handleVerifyOTP)}
              disabled={isLoading}>
              <LinearGradient
                colors={['#B91C3C', '#DC2626']}
                style={styles.buttonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}>
                <Text style={styles.submitButtonText}>
                  {isLoading ? 'Đang xác thực...' : 'Xác thực'}
                </Text>
                {!isLoading && <Ionicons name="checkmark-circle" size={18} color="#FFFFFF" style={{ marginLeft: 8 }} />}
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.secondaryButton, isLoading && styles.buttonDisabled]}
              onPress={handleResendOTP}
              disabled={isLoading}>
              <Ionicons name="refresh" size={18} color="#B91C3C" style={{ marginRight: 8 }} />
              <Text style={styles.secondaryButtonText}>
                {isLoading ? 'Đang gửi...' : 'Gửi lại mã OTP'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.backButtonContainer} onPress={handleBackToEmail}>
              <Ionicons name="arrow-back" size={16} color="#6B7280" style={{ marginRight: 6 }} />
              <Text style={styles.backButtonText}>Quay lại</Text>
            </TouchableOpacity>
          </View>
        </View>
        </ScrollView>
      </AuthBackground>
    );
  }

  return (
    <AuthBackground>
      <ScrollView 
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 40 }}
      >
        <StatusBar barStyle="light-content" />
        
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Image 
              source={require('../../assets/images/icon.png')} 
              style={styles.logoImage}
              resizeMode="cover"
            />
          </View>
          
          <Text style={styles.appTitle}>Đặt lại mật khẩu</Text>
          <Text style={styles.appSubtitle}>Tạo mật khẩu mới cho tài khoản của bạn</Text>
        </View>

        <View style={styles.formContainer}>
          <View style={styles.formCard} key="step-3">
            
            <View style={styles.emailDisplay}>
              <Ionicons name="mail" size={16} color="#B91C3C" style={{ marginRight: 8 }} />
              <Text style={styles.emailDisplayText}>{email}</Text>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Mật khẩu mới</Text>
              <View style={[
                styles.inputContainer, 
                passwordForm.formState.errors.newPassword && styles.inputError
              ]}>
                <Ionicons name="lock-closed-outline" size={20} color="#9CA3AF" style={styles.inputIcon} />
                <Controller
                  control={passwordForm.control}
                  name="newPassword"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                      style={styles.textInput}
                      placeholder="Nhập mật khẩu mới"
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      secureTextEntry={!showPassword}
                      autoCapitalize="none"
                      autoCorrect={false}
                      textContentType="newPassword"
                      placeholderTextColor="#9CA3AF"
                      returnKeyType="next"
                    />
                  )}
                />
                <TouchableOpacity 
                  onPress={() => setShowPassword(!showPassword)} 
                  style={styles.eyeButton}
                  activeOpacity={0.7}
                >
                  <Ionicons 
                    name={showPassword ? "eye-outline" : "eye-off-outline"} 
                    size={20} 
                    color="#9CA3AF" 
                  />
                </TouchableOpacity>
              </View>
              {passwordForm.formState.errors.newPassword && (
                <View style={styles.errorContainer}>
                  <Ionicons name="alert-circle" size={14} color="#DC2626" />
                  <Text style={styles.errorText}>{passwordForm.formState.errors.newPassword.message}</Text>
                </View>
              )}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Xác nhận mật khẩu</Text>
              <View style={[
                styles.inputContainer, 
                passwordForm.formState.errors.confirmPassword && styles.inputError
              ]}>
                <Ionicons name="lock-closed-outline" size={20} color="#9CA3AF" style={styles.inputIcon} />
                <Controller
                  control={passwordForm.control}
                  name="confirmPassword"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                      style={styles.textInput}
                      placeholder="Nhập lại mật khẩu"
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      secureTextEntry={!showConfirmPassword}
                      autoCapitalize="none"
                      autoCorrect={false}
                      textContentType="newPassword"
                      placeholderTextColor="#9CA3AF"
                      returnKeyType="done"
                    />
                  )}
                />
                <TouchableOpacity 
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)} 
                  style={styles.eyeButton}
                  activeOpacity={0.7}
                >
                  <Ionicons 
                    name={showConfirmPassword ? "eye-outline" : "eye-off-outline"} 
                    size={20} 
                    color="#9CA3AF" 
                  />
                </TouchableOpacity>
              </View>
              {passwordForm.formState.errors.confirmPassword && (
                <View style={styles.errorContainer}>
                  <Ionicons name="alert-circle" size={14} color="#DC2626" />
                  <Text style={styles.errorText}>{passwordForm.formState.errors.confirmPassword.message}</Text>
                </View>
              )}
            </View>

            <View style={styles.infoBox}>
              <View style={styles.infoRow}>
                <Ionicons name="shield-checkmark-outline" size={16} color="#3B82F6" />
                <Text style={styles.infoText}>Mật khẩu phải có ít nhất 6 ký tự</Text>
              </View>
              <View style={styles.infoRow}>
                <Ionicons name="checkmark-circle-outline" size={16} color="#3B82F6" />
                <Text style={styles.infoText}>Nên kết hợp chữ hoa, thường và số</Text>
              </View>
            </View>

            <TouchableOpacity
              style={[styles.submitButton, isLoading && styles.buttonDisabled]}
              onPress={passwordForm.handleSubmit(handleResetPassword)}
              disabled={isLoading}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#B91C3C', '#DC2626']}
                style={styles.buttonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Text style={styles.submitButtonText}>
                  {isLoading ? 'Đang xử lý...' : 'Đặt lại mật khẩu'}
                </Text>
                {!isLoading && <Ionicons name="checkmark-done" size={20} color="#FFFFFF" style={{ marginLeft: 8 }} />}
              </LinearGradient>
            </TouchableOpacity>

            <Link href="/(auth)/login" asChild>
              <TouchableOpacity style={styles.backButtonContainer} activeOpacity={0.7}>
                <Ionicons name="arrow-back" size={16} color="#B91C3C" style={{ marginRight: 6 }} />
                <Text style={styles.link}>Quay lại đăng nhập</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </View>
      </ScrollView>
    </AuthBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 40,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  logoContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    overflow: 'hidden',
  },
  logoImage: {
    width: 90,
    height: 90,
    borderRadius: 45,
  },
  appTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  appSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.85)',
    textAlign: 'center',
  },
  formContainer: {
    flex: 1,
    paddingHorizontal: 24,
    paddingBottom: 40,
    marginTop: -30,
  },
  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
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
  otpInput: {
    fontSize: 20,
    fontWeight: '600',
    letterSpacing: 6,
    textAlign: 'center',
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
  emailDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#FEF2F2',
    marginBottom: 20,
  },
  emailDisplayText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#B91C3C',
  },
  infoBox: {
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
    padding: 14,
    marginBottom: 20,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  infoText: {
    fontSize: 13,
    color: '#1E40AF',
    flex: 1,
    marginLeft: 8,
  },
  submitButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,

  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonGradient: {
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#B91C3C',
    paddingVertical: 14,
    marginBottom: 16,
    backgroundColor: '#FEF2F2',
  },
  secondaryButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#B91C3C',
  },
  linkContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  linkText: {
    fontSize: 14,
    color: '#6B7280',
  },
  link: {
    fontSize: 14,
    color: '#B91C3C',
    fontWeight: '600',
  },
  backButtonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  backButtonText: {
    fontSize: 14,
    color: '#6B7280',
  },
  eyeButton: {
    padding: 4,
  },
});
