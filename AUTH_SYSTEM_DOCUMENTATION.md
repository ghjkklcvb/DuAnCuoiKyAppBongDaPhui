# 🔐 HỆ THỐNG AUTHENTICATION - BÓNG ĐÁ PHỦI

## 📋 TỔNG QUAN HỆ THỐNG

Hệ thống authentication của app Bóng Đá Phủi được xây dựng với React Native, Expo Router và sử dụng JWT (JSON Web Token) để quản lý phiên đăng nhập. Hệ thống bao gồm các tính năng chính:

- ✅ Đăng ký tài khoản với validation mạnh
- ✅ Đăng nhập với "Remember Me" 
- ✅ Quên mật khẩu
- ✅ Quản lý phiên đăng nhập với JWT
- ✅ Auto-redirect dựa trên trạng thái đăng nhập
- ✅ UI/UX hiện đại với gradient background

---

## 🏗️ KIẾN TRÚC HỆ THỐNG

### 1. **Cấu trúc thư mục**
```
app/(auth)/
├── _layout.tsx          # Layout wrapper cho auth screens
├── login.tsx           # Màn hình đăng nhập
├── register.tsx        # Màn hình đăng ký
└── forgot-password.tsx # Màn hình quên mật khẩu

contexts/
└── AuthContext.tsx     # Context quản lý state authentication

services/
├── auth.ts            # API calls cho authentication
└── api.ts             # Base API configuration

components/
├── auth/
│   └── AuthBackground.tsx  # Background component cho auth screens
└── ui/
    └── universal-background.tsx  # Universal background system
```

### 2. **Flow Architecture**
```
User Input → Validation → API Call → Context Update → Navigation
     ↓           ↓           ↓           ↓            ↓
   Form      Yup Schema   Auth Service  AuthContext   Router
```

---

## 🔄 LUỒNG CHẠY CHI TIẾT

### **A. LUỒNG ĐĂNG NHẬP (Login Flow)**

#### **1. Khởi tạo Component**
```tsx
export default function LoginScreen() {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const { login } = useAuth();
  const router = useRouter();
```

**Giải thích:**
- `isLoading`: Trạng thái loading khi đang xử lý đăng nhập
- `showPassword`: Toggle hiển thị/ẩn mật khẩu
- `rememberMe`: Lưu thông tin đăng nhập
- `login`: Function từ AuthContext
- `router`: Navigation từ Expo Router

#### **2. Form Validation với Yup**
```tsx
const loginSchema = yup.object({
  email: yup
    .string()
    .email('Email không hợp lệ')
    .required('Email là bắt buộc'),
  password: yup
    .string()
    .min(6, 'Mật khẩu phải có ít nhất 6 ký tự')
    .required('Mật khẩu là bắt buộc'),
});
```

**Luồng validation:**
1. User nhập email/password
2. React Hook Form trigger validation
3. Yup schema kiểm tra format và required
4. Hiển thị error message nếu không hợp lệ
5. Enable/disable submit button

#### **3. Remember Me Feature**
```tsx
const loadSavedCredentials = async () => {
  try {
    const savedRememberMe = await AsyncStorage.getItem(REMEMBER_ME_KEY);
    if (savedRememberMe === 'true') {
      const savedCredentials = await AsyncStorage.getItem(CREDENTIALS_KEY);
      if (savedCredentials) {
        const { email, password } = JSON.parse(savedCredentials);
        setValue('email', email);
        setValue('password', password);
        setRememberMe(true);
      }
    }
  } catch (error) {
    console.log('Error loading saved credentials:', error);
  }
};
```

**Luồng Remember Me:**
1. **Load lúc khởi tạo**: Kiểm tra AsyncStorage có credentials đã lưu
2. **Auto-fill form**: Nếu có, tự động điền email/password
3. **Save khi login**: Nếu user check "Remember Me", lưu credentials
4. **Clear khi uncheck**: Xóa credentials khỏi AsyncStorage

#### **4. Submit Process**
```tsx
const onSubmit = async (data: LoginForm) => {
  setIsLoading(true);
  try {
    await login(data.email, data.password);        // 1. Call AuthContext login
    await saveCredentials(data.email, data.password); // 2. Save credentials if needed
    router.replace('/(tabs)');                     // 3. Navigate to main app
  } catch (error: any) {
    Alert.alert(
      'Đăng nhập thất bại',
      error.response?.data?.message || 'Email hoặc mật khẩu không đúng'
    );
  } finally {
    setIsLoading(false);
  }
};
```

**Luồng submit:**
1. **Set loading state**: Disable form, show loading
2. **Call login API**: Thông qua AuthContext
3. **Save credentials**: Nếu Remember Me được check
4. **Navigate**: Chuyển đến main app
5. **Error handling**: Hiển thị lỗi nếu có
6. **Reset loading**: Enable form lại

---

### **B. LUỒNG ĐĂNG KÝ (Register Flow)**

#### **1. Enhanced Validation**
```tsx
const registerSchema = yup.object({
  username: yup
    .string()
    .min(3, 'Tên người dùng phải có ít nhất 3 ký tự')
    .max(30, 'Tên người dùng không được quá 30 ký tự')
    .required('Tên người dùng là bắt buộc'),
  email: yup
    .string()
    .email('Email không hợp lệ')
    .required('Email là bắt buộc'),
  password: yup
    .string()
    .min(8, 'Mật khẩu phải có ít nhất 8 ký tự')
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      'Mật khẩu phải có chữ hoa, chữ thường, số và ký tự đặc biệt'
    )
    .required('Mật khẩu là bắt buộc'),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref('password')], 'Mật khẩu xác nhận không khớp')
    .required('Xác nhận mật khẩu là bắt buộc'),
});
```

**Validation Rules:**
- **Username**: 3-30 ký tự
- **Email**: Format email hợp lệ
- **Password**: Tối thiểu 8 ký tự, có chữ hoa, chữ thường, số, ký tự đặc biệt
- **Confirm Password**: Phải khớp với password

#### **2. Register Process**
```tsx
const onSubmit = async (data: RegisterForm) => {
  setIsLoading(true);
  try {
    await authService.register({
      username: data.username,
      email: data.email,
      password: data.password,
    });
    Alert.alert(
      'Đăng ký thành công!',
      'Tài khoản của bạn đã được tạo. Vui lòng đăng nhập để tiếp tục.',
      [{ text: 'Đăng nhập ngay', onPress: () => router.replace('/login') }]
    );
  } catch (error: any) {
    Alert.alert(
      'Đăng ký thất bại',
      error.response?.data?.message || 'Có lỗi xảy ra. Vui lòng thử lại.'
    );
  } finally {
    setIsLoading(false);
  }
};
```

**Luồng đăng ký:**
1. **Validate form**: Kiểm tra tất cả fields
2. **Call register API**: Gửi data đến server
3. **Success**: Hiển thị thông báo thành công, chuyển đến login
4. **Error**: Hiển thị lỗi từ server hoặc generic error

---

## 🔧 AUTHCONTEXT - QUẢN LÝ STATE

### **1. Context Structure**
```tsx
interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (userData: Partial<User>) => void;
}
```

### **2. Login Function**
```tsx
const login = async (email: string, password: string) => {
  try {
    const response = await authService.login(email, password);
    const { user, token, refreshToken } = response;
    
    // Save tokens
    await AsyncStorage.setItem('accessToken', token);
    await AsyncStorage.setItem('refreshToken', refreshToken);
    
    // Update state
    setUser(user);
    setLoading(false);
  } catch (error) {
    setLoading(false);
    throw error;
  }
};
```

### **3. Auto-login Check**
```tsx
useEffect(() => {
  checkAuthState();
}, []);

const checkAuthState = async () => {
  try {
    const token = await AsyncStorage.getItem('accessToken');
    if (token) {
      // Verify token with server
      const user = await authService.getProfile();
      setUser(user);
    }
  } catch (error) {
    // Token invalid, clear storage
    await AsyncStorage.multiRemove(['accessToken', 'refreshToken']);
  } finally {
    setLoading(false);
  }
};
```

---

## 🛡️ BẢO MẬT VÀ XỬ LÝ LỖI

### **1. Token Management**
```tsx
// API interceptor for automatic token attachment
api.interceptors.request.use((config) => {
  const token = AsyncStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auto refresh token
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Try refresh token
      const refreshToken = await AsyncStorage.getItem('refreshToken');
      if (refreshToken) {
        try {
          const response = await authService.refreshToken(refreshToken);
          await AsyncStorage.setItem('accessToken', response.token);
          // Retry original request
          return api.request(error.config);
        } catch (refreshError) {
          // Refresh failed, logout user
          await logout();
        }
      }
    }
    return Promise.reject(error);
  }
);
```

### **2. Error Handling Strategy**
```tsx
// Network errors
if (!error.response) {
  Alert.alert('Lỗi kết nối', 'Vui lòng kiểm tra kết nối internet');
  return;
}

// Server errors
const message = error.response.data?.message || 'Có lỗi xảy ra';
Alert.alert('Lỗi', message);

// Validation errors
if (error.response.status === 400) {
  // Handle field-specific errors
  const fieldErrors = error.response.data?.errors;
  // Update form errors
}
```

---

## 🎨 UI/UX COMPONENTS

### **1. AuthBackground System**
```tsx
// Old system
<AuthBackground>
  <LoginForm />
</AuthBackground>

// New universal system
<UniversalBackground variant="auth">
  <LoginForm />
</UniversalBackground>
```

**Features:**
- **Gradient overlay**: Đỏ đậm ở trên, trắng ở dưới
- **Background blur**: Tạo depth và focus
- **Responsive design**: Tự động adapt với screen size

### **2. Form Components**
```tsx
// Input with icon and validation
<View style={[styles.inputContainer, errors.email && styles.inputError]}>
  <Ionicons name="mail-outline" size={20} color="#9CA3AF" />
  <TextInput
    style={styles.textInput}
    placeholder="phuileague@gmail.com"
    value={value}
    onChangeText={onChange}
    keyboardType="email-address"
    autoCapitalize="none"
  />
</View>
{errors.email && <Text style={styles.errorText}>{errors.email.message}</Text>}
```

**Features:**
- **Visual feedback**: Border color thay đổi khi có lỗi
- **Icons**: Tăng tính trực quan
- **Placeholder**: Gợi ý format input
- **Error messages**: Hiển thị lỗi validation

### **3. Button States**
```tsx
<TouchableOpacity
  style={[styles.loginButton, isLoading && styles.buttonDisabled]}
  onPress={handleSubmit(onSubmit)}
  disabled={isLoading}
>
  <LinearGradient colors={['#B91C3C', '#DC2626']}>
    <Text>{isLoading ? 'Đăng nhập...' : 'Đăng nhập'}</Text>
    {!isLoading && <Ionicons name="arrow-forward" />}
  </LinearGradient>
</TouchableOpacity>
```

**States:**
- **Normal**: Gradient button với icon
- **Loading**: Text thay đổi, icon ẩn, button disabled
- **Disabled**: Opacity giảm, không thể click

---

## 🔄 NAVIGATION FLOW

### **1. Root Layout Navigation**
```tsx
// app/_layout.tsx
function RootLayoutNav() {
  const { user, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading) return; // Wait for auth check

    const inAuthGroup = segments[0] === '(auth)';
    const isPublicRoute = /* check public routes */;

    if (!user && !inAuthGroup && !isPublicRoute) {
      router.replace('/login'); // Redirect to login
    } else if (user && inAuthGroup) {
      router.replace('/(tabs)'); // Redirect to main app
    }
  }, [user, loading, segments]);
}
```

### **2. Auth Layout**
```tsx
// app/(auth)/_layout.tsx
export default function AuthLayout() {
  return (
    <ThemedView style={{ flex: 1 }}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="login" />
        <Stack.Screen name="register" />
        <Stack.Screen name="forgot-password" />
      </Stack>
      <StatusBar style="light" />
    </ThemedView>
  );
}
```

### **3. Navigation Rules**
```
User State    | Current Route | Action
------------- | ------------- | ------
Not logged in | /(auth)/*     | Stay
Not logged in | /(tabs)/*     | Redirect to /login
Not logged in | /league/*     | Allow (public)
Logged in     | /(auth)/*     | Redirect to /(tabs)
Logged in     | /(tabs)/*     | Stay
Logged in     | /league/*     | Stay
```

---

## 📱 RESPONSIVE DESIGN

### **1. Screen Adaptation**
```tsx
const styles = StyleSheet.create({
  header: {
    paddingTop: 60,           // Safe area for status bar
    paddingBottom: 40,
    paddingHorizontal: 24,
  },
  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,         // Rounded corners
    padding: 24,
    shadowColor: '#000',      // iOS shadow
    elevation: 8,             // Android shadow
  },
});
```

### **2. Typography Scale**
```tsx
appTitle: {
  fontSize: 28,              // Large title
  fontWeight: '700',         // Bold
  color: '#FFFFFF',
},
formTitle: {
  fontSize: 24,              // Section title
  fontWeight: '700',
  color: '#1F2937',
},
inputLabel: {
  fontSize: 14,              // Label text
  fontWeight: '600',
  color: '#374151',
},
```

---

## 🚀 PERFORMANCE OPTIMIZATIONS

### **1. Form Optimization**
```tsx
// Debounced validation
const debouncedValidation = useCallback(
  debounce((value) => {
    // Validate field
  }, 300),
  []
);

// Memoized components
const MemoizedInput = React.memo(({ field, error }) => (
  <TextInput {...field} error={error} />
));
```

### **2. Image Optimization**
```tsx
<Image 
  source={require('../../assets/images/icon.png')} 
  style={styles.logoImage}
  resizeMode="cover"        // Optimize rendering
  priority="high"           // Load first
/>
```

### **3. AsyncStorage Optimization**
```tsx
// Batch operations
await AsyncStorage.multiSet([
  ['accessToken', token],
  ['refreshToken', refreshToken],
  ['user', JSON.stringify(user)]
]);

// Clear multiple keys
await AsyncStorage.multiRemove([
  'accessToken', 
  'refreshToken', 
  'user'
]);
```

---

## 🧪 TESTING SCENARIOS

### **1. Happy Path**
1. ✅ User mở app lần đầu → Hiển thị login screen
2. ✅ User nhập email/password hợp lệ → Đăng nhập thành công
3. ✅ User check "Remember Me" → Credentials được lưu
4. ✅ User đóng app, mở lại → Auto-login thành công

### **2. Error Scenarios**
1. ❌ Email sai format → Hiển thị validation error
2. ❌ Password quá ngắn → Hiển thị validation error
3. ❌ Server trả về 401 → Hiển thị "Sai email/password"
4. ❌ Không có internet → Hiển thị "Lỗi kết nối"
5. ❌ Token hết hạn → Auto refresh hoặc logout

### **3. Edge Cases**
1. 🔄 User spam click submit button → Button disabled khi loading
2. 🔄 User navigate back khi đang loading → Cancel request
3. 🔄 App bị kill khi đang login → State reset khi mở lại
4. 🔄 Multiple login attempts → Rate limiting từ server

---

## 📊 MONITORING & ANALYTICS

### **1. Login Success Rate**
```tsx
// Track successful logins
analytics.track('login_success', {
  method: 'email',
  remember_me: rememberMe,
  timestamp: new Date().toISOString()
});

// Track failed logins
analytics.track('login_failed', {
  error_type: error.response?.status || 'network_error',
  error_message: error.message
});
```

### **2. User Journey**
```tsx
// Track registration funnel
analytics.track('registration_started');
analytics.track('registration_completed');
analytics.track('first_login_after_registration');
```

---

## 🔮 FUTURE ENHANCEMENTS

### **1. Planned Features**
- [ ] **Social Login**: Google, Facebook, Apple
- [ ] **Biometric Auth**: Face ID, Touch ID
- [ ] **2FA**: SMS, Email verification
- [ ] **Password Strength Meter**: Real-time feedback
- [ ] **Account Recovery**: Security questions

### **2. Technical Improvements**
- [ ] **Offline Support**: Cache credentials securely
- [ ] **Background Refresh**: Silent token refresh
- [ ] **Session Management**: Multiple device support
- [ ] **Security Headers**: CSRF protection
- [ ] **Rate Limiting**: Client-side throttling

---

## 📚 TÀI LIỆU THAM KHẢO

### **Dependencies Used**
- `expo-router`: Navigation system
- `react-hook-form`: Form management
- `yup`: Schema validation
- `@react-native-async-storage/async-storage`: Local storage
- `expo-linear-gradient`: UI gradients
- `@expo/vector-icons`: Icon system

### **API Endpoints**
```
POST /api/v1/user/register    # Đăng ký
POST /api/v1/user/login       # Đăng nhập  
POST /api/v1/user/refresh     # Refresh token
GET  /api/v1/user/profile     # Get user info
POST /api/v1/user/logout      # Đăng xuất
```

### **Error Codes**
```
400: Bad Request (Validation errors)
401: Unauthorized (Invalid credentials)
403: Forbidden (Account locked)
429: Too Many Requests (Rate limited)
500: Internal Server Error
```

---

## 🎯 KẾT LUẬN

Hệ thống authentication của Bóng Đá Phủi được thiết kế với:

✅ **Bảo mật cao**: JWT tokens, validation mạnh, error handling tốt
✅ **UX tốt**: Remember me, auto-login, loading states, error feedback
✅ **Performance**: Optimized rendering, efficient storage, debounced validation
✅ **Maintainable**: Clean architecture, separation of concerns, documented code
✅ **Scalable**: Context pattern, service layer, modular components

Hệ thống sẵn sàng cho production và có thể mở rộng thêm các tính năng authentication nâng cao trong tương lai.