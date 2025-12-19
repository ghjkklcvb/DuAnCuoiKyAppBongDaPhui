import { Colors } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { authService } from '@/services/auth';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import TabsBackground from '@/components/tabs/TabsBackground';

export default function ProfileScreen() {
  const { user, logout, updateUser } = useAuth();
  const router = useRouter();
  const [uploading, setUploading] = useState(false);
  const colors = Colors;

  const handleLogout = () => {
    Alert.alert(
      'Đăng xuất',
      'Bạn có chắc chắn muốn đăng xuất?',
      [
        { text: 'Hủy', style: 'cancel' },
        { 
          text: 'Đăng xuất', 
          style: 'destructive',
          onPress: async () => {
            await logout();
            router.replace('/login' as any);
          }
        },
      ]
    );
  };

  const handleChangeAvatar = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setUploading(true);
      console.log('📸 Profile: Starting avatar upload...');
      try {
        const formData = new FormData();
        formData.append('avatar', {
          uri: result.assets[0].uri,
          type: 'image/jpeg',
          name: 'avatar.jpg',
        } as any);

        console.log('📤 Profile: Calling updateProfile API...');
        const response = await authService.updateProfile(formData);
        console.log('✅ Profile: API response received:', response);
        console.log('👤 Profile: Updating user state with:', response.user);
        updateUser(response.user);
        console.log('🎉 Profile: User state updated successfully');
        Alert.alert('Thành công', 'Cập nhật avatar thành công');
      } catch (error: any) {
        console.error('❌ Profile: Avatar update failed:', error);
        Alert.alert('Lỗi', error.response?.data?.message || 'Không thể cập nhật avatar');
      } finally {
        setUploading(false);
        console.log('🏁 Profile: Avatar upload process finished');
      }
    }
  };

  const menuItems = [
    {
      id: 'edit-profile',
      title: 'Chỉnh sửa thông tin',
      icon: 'person-outline',
      color: colors.primary,
      onPress: () => router.push('/profile/edit' as any),
    },
    {
      id: 'change-password',
      title: 'Đổi mật khẩu',
      icon: 'lock-closed-outline',
      color: colors.primary,
      onPress: () => router.push('/profile/change-password' as any),
    },
    {
      id: 'settings',
      title: 'Cài đặt',
      icon: 'settings-outline',
      color: colors.primary,
      onPress: () => router.push('/profile/settings' as any),
    },
    {
      id: 'help',
      title: 'Trợ giúp',
      icon: 'help-circle-outline',
      color: colors.primary,
      onPress: () => router.push('/profile/help' as any),
    },
    {
      id: 'logout',
      title: 'Đăng xuất',
      icon: 'log-out-outline',
      color: colors.lose,
      onPress: handleLogout,
    },
  ];

  const accountMenuItems = menuItems.filter(item => ['edit-profile', 'change-password'].includes(item.id));
  const appMenuItems = menuItems.filter(item => ['settings', 'help'].includes(item.id));
  const logoutItem = menuItems.find(item => item.id === 'logout');

  const renderMenuCard = (item: typeof menuItems[0]) => (
    <TouchableOpacity
      key={item.id}
      style={[
        styles.menuCard,
        item.id === 'logout' && styles.logoutCard
      ]}
      onPress={item.onPress}
      activeOpacity={0.7}
    >
      <View style={[
        styles.iconContainer,
        item.id === 'logout' && { backgroundColor: 'rgba(244, 67, 54, 0.1)' }
      ]}>
        <Ionicons 
          name={item.icon as any} 
          size={24} 
          color={item.id === 'logout' ? colors.lose : colors.primary} 
        />
      </View>
      <Text style={[
        styles.menuCardText,
        item.id === 'logout' && { color: colors.lose }
      ]}>
        {item.title}
      </Text>
      {item.id !== 'logout' && (
        <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
      )}
    </TouchableOpacity>
  );

  return (
    <TabsBackground>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <LinearGradient
            colors={['rgba(0, 0, 0, 0.3)', 'transparent']}
            style={styles.headerGradient}
          />
          
          <TouchableOpacity 
            onPress={handleChangeAvatar} 
            style={styles.avatarContainer}
            disabled={uploading}
            activeOpacity={0.8}
          >
            {user?.avatar ? (
              <Image source={{ uri: user.avatar }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatar, styles.avatarPlaceholder]}>
                <Ionicons name="person" size={56} color="#FFFFFF" />
              </View>
            )}
            
            <LinearGradient
              colors={[colors.primary, colors.secondary || colors.primary]}
              style={styles.cameraIcon}
            >
              {uploading ? (
                <Ionicons name="hourglass" size={18} color="#FFFFFF" />
              ) : (
                <Ionicons name="camera" size={18} color="#FFFFFF" />
              )}
            </LinearGradient>
          </TouchableOpacity>

          <Text style={styles.username}>{user?.username}</Text>
          <Text style={styles.email}>{user?.email}</Text>
        </View>

        <View style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tài khoản</Text>
          <View style={styles.sectionCard}>
            {accountMenuItems.map((item, index) => (
              <React.Fragment key={item.id}>
                {renderMenuCard(item)}
                {index < accountMenuItems.length - 1 && <View style={styles.divider} />}
              </React.Fragment>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ứng dụng</Text>
          <View style={styles.sectionCard}>
            {appMenuItems.map((item, index) => (
              <React.Fragment key={item.id}>
                {renderMenuCard(item)}
                {index < appMenuItems.length - 1 && <View style={styles.divider} />}
              </React.Fragment>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionCard}>
            {logoutItem && renderMenuCard(logoutItem)}
          </View>
        </View>

          <View style={styles.appInfo}>
            <Text style={styles.appInfoText}>Bóng Đá Phủi v1.0.0</Text>
            <Text style={styles.appInfoText}>© 2025 Football League Management</Text>
          </View>
        </View>
      </ScrollView>
    </TabsBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 32,
    paddingHorizontal: 24,
    position: 'relative',
  },
  headerGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 200,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  avatarPlaceholder: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraIcon: {
    position: 'absolute',
    right: 4,
    bottom: 4,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  username: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 6,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  email: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.85)',
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 8,
    marginLeft: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  divider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginLeft: 64,
  },
  menuGroup: {
    gap: 12,
  },
  menuCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
  },
  logoutCard: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(244, 67, 54, 0.1)',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: 'rgba(214, 18, 64, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  menuCardText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937',
  },
  appInfo: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingBottom: 40,
  },
  appInfoText: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.4)',
    marginBottom: 4,
  },
});
