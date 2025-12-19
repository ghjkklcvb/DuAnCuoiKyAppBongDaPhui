import { Ionicons } from '@expo/vector-icons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as ImagePicker from 'expo-image-picker';
import { Stack, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, Platform, StatusBar } from 'react-native';
import { Colors } from '../../../constants/theme';
import { useColorScheme } from '../../../hooks/use-color-scheme';
import { useToast } from '../../../hooks/useToast';
import { useLeagueId } from '../../../hooks/useRouteParams';
import { leagueService } from '../../../services/league';
import { teamService } from '../../../services/team';
import LeagueBackground from '../../../components/league/LeagueBackground';

export default function AddTeamScreen() {
  const id = useLeagueId();
  const router = useRouter();
  const queryClient = useQueryClient();
  const colors = Colors;
  
  const [name, setName] = useState('');
  const [shortName, setShortName] = useState('');
  const [logo, setLogo] = useState<any>(null);
  const toast = useToast();

  const { data: league } = useQuery({
    queryKey: ['league', id],
    queryFn: () => leagueService.getLeagueById(id as string),
  });

  const createMutation = useMutation({
    mutationFn: (formData: FormData) => teamService.createTeam(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams', id] });
      queryClient.invalidateQueries({ queryKey: [' league', id] }); 
      toast.showSuccess('Thành công', 'Đã thêm đội mới');
      setTimeout(() => router.back(), 500);
    },
    onError: (error: any) => {
      console.error('Team creation error:', error);
      
      let errorMessage = 'Không thể thêm đội';
      
      if (error.name === 'AuthenticationError' || error.message?.includes('Phiên đăng nhập')) {
        errorMessage = error.message;
        Alert.alert('Phiên đăng nhập hết hạn', errorMessage, [
          { text: 'OK', onPress: () => router.replace('/auth/login' as any) }
        ]);
        return;
      }
      
      if (error.message?.includes('timeout') || error.code === 'ECONNABORTED') {
        errorMessage = 'Kết nối chậm. Vui lòng thử lại sau.';
      } else if (error.response?.status === 500) {
        errorMessage = 'Lỗi server. Vui lòng kiểm tra thông tin và thử lại.';
      } else if (error.response?.status === 400) {
        errorMessage = error.response?.data?.message || 'Dữ liệu không hợp lệ';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      toast.showError('Lỗi', errorMessage);
    },
  });

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

  const handleSubmit = () => {
    if (!name.trim() || !shortName.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ thông tin');
      return;
    }

    if (shortName.length < 2 || shortName.length > 5) {
      Alert.alert('Lỗi', 'Tên viết tắt phải từ 2-5 ký tự');
      return;
    }

    const formData = new FormData();
    formData.append('name', name);
    formData.append('shortName', shortName.toUpperCase());
    formData.append('leagueId', id as string);



    if (logo) {
      formData.append('logo', {
        uri: logo.uri,
        type: 'image/jpeg',
        name: 'logo.jpg',
      } as any);
    }

    console.log('Creating team with data:', {
      name,
      shortName: shortName.toUpperCase(),
      leagueId: id,
      hasLogo: !!logo,
    });

    createMutation.mutate(formData);
  };



  return (
    <>
      <StatusBar 
        backgroundColor="rgba(214, 18, 64, 1)"
        barStyle="light-content"
      />
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: 'Thêm Đội Mới',
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
      
      <LeagueBackground>
        <ScrollView style={styles.container}>
          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Tên đội</Text>
              <Text style={styles.required}>*</Text>
            </View>
            <TextInput
              style={styles.input}
              placeholder="Ví dụ: Manchester United"
              placeholderTextColor="rgba(255, 255, 255, 0.5)"
              value={name}
              onChangeText={setName}
            />

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Tên viết tắt</Text>
              <Text style={styles.required}>*</Text>
              <Text style={styles.hint}>(2-5 ký tự)</Text>
            </View>
            <TextInput
              style={styles.input}
              placeholder="Ví dụ: MUN"
              placeholderTextColor="rgba(255, 255, 255, 0.5)"
              value={shortName}
              onChangeText={setShortName}
              autoCapitalize="characters"
              maxLength={5}
            />

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Logo đội</Text>
              <Text style={styles.hint}>(Tùy chọn)</Text>
            </View>
            <TouchableOpacity 
              style={styles.logoPicker} 
              onPress={handlePickLogo}
              activeOpacity={0.7}
            >
              {logo ? (
                <View style={styles.logoSelected}>
                  <View style={styles.logoCheckmark}>
                    <Ionicons name="checkmark" size={20} color="#fff" />
                  </View>
                  <Text style={styles.logoSelectedText}>Logo đã được chọn</Text>
                  <Text style={styles.logoHint}>Nhấn để thay đổi</Text>
                </View>
              ) : (
                <View style={styles.logoEmpty}>
                  <View style={styles.logoIconContainer}>
                    <Ionicons name="image-outline" size={32} color="rgba(255, 255, 255, 0.5)" />
                  </View>
                  <Text style={styles.logoEmptyText}>Chọn logo cho đội</Text>
                  <Text style={styles.logoHint}>JPG, PNG - Tỷ lệ 1:1</Text>
                </View>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.button,
                createMutation.isPending && styles.buttonDisabled
              ]}
              onPress={handleSubmit}
              disabled={createMutation.isPending}
              activeOpacity={0.8}
            >
              <Text style={styles.buttonText}>
                {createMutation.isPending ? 'Đang thêm đội...' : 'Thêm đội vào giải'}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </LeagueBackground>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  form: {
    padding: 20,
    gap: 20,
  },
  inputGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 6,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.1,
    color: 'rgba(255, 255, 255, 0.95)',
  },
  required: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FF3B30',
  },
  hint: {
    fontSize: 13,
    fontWeight: '400',
    color: 'rgba(255, 255, 255, 0.6)',
  },
  input: {
    height: 56,
    borderWidth: 2,
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 20,
    fontSize: 16,
    backgroundColor: 'rgba(70, 22, 22, 0.75)',
    borderColor: 'rgba(255, 255, 255, 0.3)',
    color: 'rgba(255, 255, 255, 0.95)',
    ...Platform.select({
      ios: {
        shadowColor: '#581818ff',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  logoPicker: {
    minHeight: 160,
    borderWidth: 2,
    borderRadius: 16,
    borderStyle: 'dashed',
    borderColor: 'rgba(255, 255, 255, 0.3)',
    backgroundColor: 'rgba(70, 22, 22, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
    padding: 24,
  },
  logoSelected: {
    alignItems: 'center',
    gap: 8,
  },
  logoCheckmark: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
    backgroundColor: '#34C759',
  },
  logoSelectedText: {
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.1,
    color: 'rgba(255, 255, 255, 0.95)',
  },
  logoEmpty: {
    alignItems: 'center',
    gap: 8,
  },
  logoIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  logoEmptyText: {
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.1,
    color: 'rgba(255, 255, 255, 0.95)',
  },
  logoHint: {
    fontSize: 13,
    textAlign: 'center',
    color: 'rgba(255, 255, 255, 0.6)',
  },
  button: {
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: "#ff0000ff",
    ...Platform.select({
      ios: {
        shadowColor: "#ff0000ff",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});