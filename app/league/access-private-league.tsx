import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View, ActivityIndicator } from 'react-native';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { parseLeagueLink, saveLeagueToken } from '@/utils/leagueLink';
import { leagueService } from '@/services/league';

export default function AccessPrivateLeagueScreen() {
  const router = useRouter();
  const colors = Colors;
  
  const [linkCode, setLinkCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  const handleSubmit = async () => {
    if (!linkCode.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập mã truy cập');
      return;
    }

    const parsed = parseLeagueLink(linkCode);
    if (!parsed) {
      Alert.alert('Mã không hợp lệ', 'Mã truy cập không đúng định dạng. Vui lòng kiểm tra lại.');
      return;
    }

    setIsVerifying(true);
    try {
      const league = await leagueService.getLeagueById(parsed.leagueId, parsed.token);
      
      if (league) {
        await saveLeagueToken(parsed.leagueId, parsed.token);
        
        router.replace(`/league/${parsed.leagueId}`);
        
        Alert.alert('Thành công', `Đã truy cập giải "${league.name}"`);
      }
    } catch (error: any) {
      let message = 'Mã truy cập không hợp lệ hoặc đã hết hạn';
      
      if (error.response?.status === 403) {
        message = 'Mã truy cập không đúng. Vui lòng kiểm tra lại.';
      } else if (error.response?.status === 404) {
        message = 'Không tìm thấy giải đấu này.';
      }
      
      Alert.alert('Lỗi truy cập', message);
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.card, { backgroundColor: colors.card }]}>
        <View style={[styles.iconContainer, { backgroundColor: colors.primary + '20' }]}>
          <Ionicons name="link" size={40} color={colors.primary} />
        </View>
        
        <Text style={[styles.title, { color: colors.text }]}>Truy cập giải riêng tư</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Nhập mã truy cập do người tạo giải chia sẻ
        </Text>

        <View style={styles.inputGroup}>
          <Text style={[styles.label, { color: colors.text }]}>Mã truy cập</Text>
          <TextInput
            style={[styles.input, { 
              backgroundColor: colors.background,
              borderColor: colors.border,
              color: colors.text 
            }]}
            placeholder="Paste mã truy cập tại đây"
            placeholderTextColor={colors.textSecondary}
            value={linkCode}
            onChangeText={setLinkCode}
            autoCapitalize="none"
            autoCorrect={false}
            multiline
            numberOfLines={3}
          />
        </View>

        <TouchableOpacity
          style={[styles.button, { 
            backgroundColor: colors.primary,
            opacity: isVerifying ? 0.6 : 1 
          }]}
          onPress={handleSubmit}
          disabled={isVerifying}
        >
          {isVerifying ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Ionicons name="arrow-forward" size={20} color="#fff" style={{ marginRight: 8 }} />
              <Text style={styles.buttonText}>Truy cập giải đấu</Text>
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => router.back()}
        >
          <Text style={[styles.cancelText, { color: colors.textSecondary }]}>Hủy bỏ</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.infoBox}>
        <Ionicons name="information-circle-outline" size={20} color={colors.textSecondary} />
        <Text style={[styles.infoText, { color: colors.textSecondary }]}>
          Mã truy cập là chuỗi ký tự do người tạo giải chia sẻ. Sau khi truy cập thành công, bạn có thể xem giải này bất kỳ lúc nào.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  card: {
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 22,
  },
  inputGroup: {
    width: '100%',
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    fontSize: 14,
    textAlignVertical: 'top',
    minHeight: 80,
  },
  button: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    paddingVertical: 12,
  },
  cancelText: {
    fontSize: 16,
    fontWeight: '600',
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginTop: 24,
    paddingHorizontal: 16,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
});
