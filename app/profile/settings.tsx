import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Stack } from 'expo-router';
import React, { useState } from 'react';
import { Alert, ScrollView, StatusBar, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import TabsBackground from '../../components/tabs/TabsBackground';
import { Colors } from '../../constants/theme';
import { useColorScheme } from '../../hooks/use-color-scheme';

export default function SettingsScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors;
  
  const [settings, setSettings] = useState({
    notifications: true,
    matchReminders: true,
    leagueUpdates: true,
    darkMode: colorScheme === 'dark',
    autoSync: true,
  });

  const updateSetting = async (key: string, value: boolean) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    try {
      await AsyncStorage.setItem(`setting_${key}`, JSON.stringify(value));
      Alert.alert('Đã lưu', 'Cài đặt đã được cập nhật');
    } catch (error) {
      console.error('Error saving setting:', error);
      Alert.alert('Lỗi', 'Không thể lưu cài đặt');
    }
  };

  const clearCache = () => {
    Alert.alert(
      'Xóa bộ nhớ đệm',
      'Bạn có chắc chắn muốn xóa tất cả dữ liệu đã lưu trong bộ nhớ đệm?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            try {
              const keys = await AsyncStorage.getAllKeys();
              const cacheKeys = keys.filter(key => key.startsWith('cache_'));
              await AsyncStorage.multiRemove(cacheKeys);
              Alert.alert('Thành công', 'Đã xóa bộ nhớ đệm');
            } catch (error) {
              Alert.alert('Lỗi', 'Không thể xóa bộ nhớ đệm');
            }
          }
        }
      ]
    );
  };

  const settingItems = [
    {
      section: 'Thông báo',
      icon: 'notifications',
      items: [
        {
          key: 'notifications',
          title: 'Thông báo push',
          description: 'Nhận thông báo từ ứng dụng',
          icon: 'notifications-outline',
          type: 'switch',
          value: settings.notifications,
        },
        {
          key: 'matchReminders',
          title: 'Nhắc nhở trận đấu',
          description: 'Thông báo trước khi trận đấu bắt đầu',
          icon: 'time-outline',
          type: 'switch',
          value: settings.matchReminders,
        },
        {
          key: 'leagueUpdates',
          title: 'Cập nhật giải đấu',
          description: 'Thông báo khi có cập nhật mới',
          icon: 'trophy-outline',
          type: 'switch',
          value: settings.leagueUpdates,
        },
      ],
    },
    {
      section: 'Giao diện',
      icon: 'color-palette',
      items: [
        {
          key: 'darkMode',
          title: 'Chế độ tối',
          description: 'Sử dụng giao diện tối',
          icon: 'moon-outline',
          type: 'switch',
          value: settings.darkMode,
        },
      ],
    },
    {
      section: 'Dữ liệu',
      icon: 'folder',
      items: [
        {
          key: 'autoSync',
          title: 'Tự động đồng bộ',
          description: 'Đồng bộ dữ liệu khi có kết nối',
          icon: 'sync-outline',
          type: 'switch',
          value: settings.autoSync,
        },
        {
          key: 'clearCache',
          title: 'Xóa bộ nhớ đệm',
          description: 'Xóa dữ liệu tạm thời để giải phóng dung lượng',
          icon: 'trash-outline',
          type: 'action',
          onPress: clearCache,
        },
      ],
    },
  ];

  return (
    <TabsBackground>
      <StatusBar backgroundColor="rgba(214, 18, 64, 1)" barStyle="light-content" />
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: 'Cài đặt',
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
        {settingItems.map((section, sectionIndex) => (
          <View key={section.section} style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name={section.icon as any} size={20} color="#e2dedfff" />
              <Text style={styles.sectionTitle}>{section.section}</Text>
            </View>
            
            <View style={styles.sectionCard}>
              {section.items.map((item, index) => (
                <View
                  key={item.key}
                  style={[
                    styles.settingItem,
                    index < section.items.length - 1 && styles.settingItemBorder,
                  ]}
                >
                  <View style={styles.settingLeft}>
                    <View style={styles.iconContainer}>
                      <Ionicons 
                        name={item.icon as any} 
                        size={22} 
                        color="#B91C3C" 
                      />
                    </View>
                    <View style={styles.settingText}>
                      <Text style={styles.settingTitle}>
                        {item.title}
                      </Text>
                      <Text style={styles.settingDescription}>
                        {item.description}
                      </Text>
                    </View>
                  </View>
                  
                  {item.type === 'switch' && (
                    <Switch
                      value={item.value}
                      onValueChange={(value) => updateSetting(item.key, value)}
                      trackColor={{ false: '#E5E7EB', true: '#FCA5A5' }}
                      thumbColor={item.value ? '#B91C3C' : '#9CA3AF'}
                      ios_backgroundColor="#E5E7EB"
                    />
                  )}
                  
                  {item.type === 'action' && (
                    <TouchableOpacity 
                      onPress={item.onPress}
                      style={styles.actionButton}
                      activeOpacity={0.7}
                    >
                      <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
                    </TouchableOpacity>
                  )}
                </View>
              ))}
            </View>
          </View>
        ))}

        <View style={styles.versionCard}>
          <Ionicons name="information-circle" size={20} color="#6B7280" />
          <Text style={styles.versionText}>Phiên bản 1.0.0</Text>
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
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#bdbcbcff',
    marginLeft: 8,
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    minHeight: 72,
  },
  settingItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#FEF2F2',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  settingText: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 18,
  },
  actionButton: {
    padding: 4,
  },
  versionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
  },
  versionText: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 8,
    fontWeight: '500',
  },
});
