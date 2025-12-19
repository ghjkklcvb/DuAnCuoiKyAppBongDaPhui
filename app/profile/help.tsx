import { Ionicons } from '@expo/vector-icons';
import { Stack } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Linking, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import TabsBackground from '../../components/tabs/TabsBackground';
import { Colors } from '../../constants/theme';

export default function HelpScreen() {
  const colors = Colors;
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null);

  const faqItems = [
    {
      id: '1',
      question: 'Làm thế nào để tạo giải đấu mới?',
      answer: 'Vào tab "Tạo giải", điền thông tin giải đấu và chọn thể thức thi đấu. Bạn có thể chọn vòng tròn hoặc chia bảng tùy theo số đội tham gia.',
      icon: 'trophy',
    },
    {
      id: '2',
      question: 'Cách thêm đội vào giải đấu?',
      answer: 'Trong trang chi tiết giải đấu, chọn "Quản lý đội" > "Thêm đội". Nhập thông tin đội bóng và logo nếu có.',
      icon: 'people',
    },
    {
      id: '3',
      question: 'Làm sao để tạo lịch thi đấu?',
      answer: 'Sau khi thêm đủ số đội, vào "Quản lý trận" > "Tạo lịch thi đấu". Hệ thống sẽ tự động tạo lịch dựa trên thể thức đã chọn.',
      icon: 'calendar',
    },
    {
      id: '4',
      question: 'Cách cập nhật kết quả trận đấu?',
      answer: 'Chọn trận đấu cần cập nhật > "Cập nhật kết quả". Nhập tỷ số và hệ thống sẽ tự động tính điểm, bảng xếp hạng.',
      icon: 'football',
    },
    {
      id: '5',
      question: 'Tôi quên mật khẩu, phải làm sao?',
      answer: 'Ở màn hình đăng nhập, chọn "Quên mật khẩu". Nhập email đã đăng ký và làm theo hướng dẫn trong email.',
      icon: 'lock-closed',
    },
    {
      id: '6',
      question: 'Làm thế nào để chia sẻ giải đấu riêng tư?',
      answer: 'Trong cài đặt giải đấu, chọn "Chia sẻ mã truy cập". Gửi mã này cho người khác để họ có thể xem giải đấu.',
      icon: 'share-social',
    },
  ];

  const contactItems = [
    {
      title: 'Email hỗ trợ',
      value: 'support@bongdaphui.com',
      icon: 'mail',
      color: '#3B82F6',
      onPress: () => Linking.openURL('mailto:support@bongdaphui.com'),
    },
    {
      title: 'Hotline',
      value: '1900 1234',
      icon: 'call',
      color: '#10B981',
      onPress: () => Linking.openURL('tel:19001234'),
    },
    {
      title: 'Website',
      value: 'www.bongdaphui.com',
      icon: 'globe',
      color: '#8B5CF6',
      onPress: () => Linking.openURL('https://www.bongdaphui.com'),
    },
    {
      title: 'Facebook',
      value: 'Bóng Đá Phủi',
      icon: 'logo-facebook',
      color: '#1877F2',
      onPress: () => Linking.openURL('https://facebook.com/bongdaphui'),
    },
  ];

  const toggleFAQ = (id: string) => {
    setExpandedFAQ(expandedFAQ === id ? null : id);
  };

  const sendFeedback = () => {
    Alert.alert(
      'Gửi phản hồi',
      'Bạn sẽ được chuyển đến ứng dụng email để gửi phản hồi.',
      [
        { text: 'Hủy', style: 'cancel' },
        { 
          text: 'Tiếp tục', 
          onPress: () => Linking.openURL('mailto:feedback@bongdaphui.com?subject=Phản hồi ứng dụng')
        }
      ]
    );
  };

  return (
    <TabsBackground>
      <StatusBar backgroundColor="rgba(214, 18, 64, 1)" barStyle="light-content" />
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: 'Trợ giúp',
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
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="help-circle" size={20} color="#B91C3C" />
            <Text style={styles.sectionTitle}>Câu hỏi thường gặp</Text>
          </View>
          
          <View style={styles.faqContainer}>
            {faqItems.map((item, index) => (
              <View 
                key={item.id} 
                style={[
                  styles.faqCard,
                  expandedFAQ === item.id && styles.faqCardExpanded
                ]}
              >
                <TouchableOpacity
                  style={styles.faqHeader}
                  onPress={() => toggleFAQ(item.id)}
                  activeOpacity={0.7}
                >
                  <View style={styles.faqHeaderLeft}>
                    <View style={styles.faqIconContainer}>
                      <Ionicons name={item.icon as any} size={18} color="#B91C3C" />
                    </View>
                    <Text style={styles.faqQuestion}>{item.question}</Text>
                  </View>
                  <Ionicons
                    name={expandedFAQ === item.id ? 'chevron-up' : 'chevron-down'}
                    size={20}
                    color="#9CA3AF"
                  />
                </TouchableOpacity>
                
                {expandedFAQ === item.id && (
                  <View style={styles.faqAnswer}>
                    <View style={styles.answerLine} />
                    <Text style={styles.faqAnswerText}>{item.answer}</Text>
                  </View>
                )}
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="headset" size={20} color="#B91C3C" />
            <Text style={styles.sectionTitle}>Liên hệ hỗ trợ</Text>
          </View>
          
          <View style={styles.contactContainer}>
            {contactItems.map((item, index) => (
              <TouchableOpacity
                key={item.title}
                style={styles.contactCard}
                onPress={item.onPress}
                activeOpacity={0.7}
              >
                <View style={[styles.contactIconContainer, { backgroundColor: `${item.color}15` }]}>
                  <Ionicons 
                    name={item.icon as any} 
                    size={24} 
                    color={item.color} 
                  />
                </View>
                <View style={styles.contactInfo}>
                  <Text style={styles.contactTitle}>{item.title}</Text>
                  <Text style={styles.contactValue}>{item.value}</Text>
                </View>
                <Ionicons 
                  name="chevron-forward" 
                  size={20} 
                  color="#9CA3AF" 
                />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <TouchableOpacity
          style={styles.feedbackButton}
          onPress={sendFeedback}
          activeOpacity={0.8}
        >
          <View style={styles.feedbackContent}>
            <Ionicons name="chatbubble-ellipses" size={22} color="#FFFFFF" />
            <View style={styles.feedbackText}>
              <Text style={styles.feedbackTitle}>Gửi phản hồi</Text>
              <Text style={styles.feedbackSubtitle}>Giúp chúng tôi cải thiện ứng dụng</Text>
            </View>
          </View>
          <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
        </TouchableOpacity>

        <View style={styles.appInfoCard}>
          <Ionicons name="information-circle" size={20} color="#6B7280" />
          <View style={styles.appInfoContent}>
            <Text style={styles.appInfoText}>Phiên bản 1.0.0</Text>
            <Text style={styles.appInfoSubtext}>Cập nhật lần cuối: 19/12/2024</Text>
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
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 28,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
    paddingHorizontal: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    marginLeft: 8,
  },
  faqContainer: {
    gap: 12,
  },
  faqCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
  },
  faqCardExpanded: {
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  faqHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  faqHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
  },
  faqIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: '#FEF2F2',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  faqQuestion: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937',
    flex: 1,
    lineHeight: 20,
  },
  faqAnswer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  answerLine: {
    height: 2,
    backgroundColor: '#F3F4F6',
    marginBottom: 12,
    borderRadius: 1,
  },
  faqAnswerText: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 22,
  },
  contactContainer: {
    gap: 12,
  },
  contactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
  },
  contactIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  contactInfo: {
    flex: 1,
  },
  contactTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  contactValue: {
    fontSize: 13,
    color: '#6B7280',
  },
  feedbackButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#B91C3C',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#B91C3C',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  feedbackContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  feedbackText: {
    marginLeft: 14,
    flex: 1,
  },
  feedbackTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  feedbackSubtitle: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.85)',
  },
  appInfoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 14,
    padding: 18,
  },
  appInfoContent: {
    marginLeft: 12,
  },
  appInfoText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 2,
  },
  appInfoSubtext: {
    fontSize: 12,
    color: '#9CA3AF',
  },
});
