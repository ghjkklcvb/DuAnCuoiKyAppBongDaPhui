import { Ionicons } from '@expo/vector-icons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as DocumentPicker from 'expo-document-picker';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Colors } from '../../../constants/theme';
import { useColorScheme } from '../../../hooks/use-color-scheme';
import { matchService } from '../../../services/match';
import MatchBackground from '../../../components/match/MatchBackground';

export default function UploadVideosScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const colors = Colors;

  const { data: match } = useQuery({
    queryKey: ['match', id],
    queryFn: () => matchService.getMatchById(id as string),
  });

  const [videoUrl, setVideoUrl] = useState('');
  const [selectedVideos, setSelectedVideos] = useState<any[]>([]);
  const [titles, setTitles] = useState<string[]>([]);

  useEffect(() => {
    if (match?.videoUrl) {
      setVideoUrl(match.videoUrl);
    }
  }, [match]);

  const updateVideoMutation = useMutation({
    mutationFn: (url: string | null) => matchService.updateMatchVideo(id as string, url),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['match', id] });
      Alert.alert('Thành công', 'Đã cập nhật video full match');
      setVideoUrl('');
    },
  });

  const uploadHighlightsMutation = useMutation({
    mutationFn: (formData: FormData) => matchService.uploadHighlights(id as string, formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['match', id] });
      Alert.alert('Thành công', 'Đã upload highlight videos');
      setSelectedVideos([]);
      setTitles([]);
    },
    onError: (error: any) => {
      Alert.alert('Lỗi', error.response?.data?.message || 'Không thể upload videos');
    },
  });

  const deleteHighlightMutation = useMutation({
    mutationFn: (highlightId: string) =>
      matchService.deleteHighlight(id as string, highlightId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['match', id] });
      Alert.alert('Thành công', 'Đã xóa video');
    },
  });

  const handleUpdateVideoUrl = () => {
    if (!videoUrl.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập URL video');
      return;
    }
    updateVideoMutation.mutate(videoUrl);
  };

  const handleRemoveVideoUrl = () => {
    Alert.alert(
      'Xác nhận',
      'Xóa video full match?',
      [
        { text: 'Hủy', style: 'cancel' },
        { text: 'Xóa', style: 'destructive', onPress: () => updateVideoMutation.mutate(null) }
      ]
    );
  };

  const handlePickVideos = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'video/*',
        multiple: true,
      });

      if (!result.canceled) {
        const maxVideos = (match?.score?.home || 0) + (match?.score?.away || 0);
        const currentCount = match?.highlightVideos?.length || 0;
        const canAdd = maxVideos - currentCount;

        if (result.assets.length > canAdd) {
          Alert.alert(
            'Lỗi',
            `Chỉ có thể thêm ${canAdd} video nữa (tổng bàn thắng: ${maxVideos})`
          );
          return;
        }

        const oversized = result.assets.filter(file => file.size && file.size > 20 * 1024 * 1024);
        if (oversized.length > 0) {
          Alert.alert('Lỗi', `Mỗi video tối đa 20MB. ${oversized.length} video vượt quá giới hạn.`);
          return;
        }

        const invalidFormat = result.assets.filter(file => 
          file.mimeType && !file.mimeType.startsWith('video/')
        );
        if (invalidFormat.length > 0) {
          Alert.alert('Lỗi', 'Chỉ chấp nhận file video');
          return;
        }

        setSelectedVideos(result.assets);
        setTitles(new Array(result.assets.length).fill(''));
      }
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể chọn video');
    }
  };

  const handleUploadHighlights = () => {
    if (selectedVideos.length === 0) {
      Alert.alert('Lỗi', 'Vui lòng chọn video');
      return;
    }

    const formData = new FormData();
    selectedVideos.forEach((video) => {
      formData.append('highlights', {
        uri: video.uri,
        type: 'video/mp4',
        name: video.name || 'video.mp4',
      } as any);
    });

    titles.forEach((title) => {
      formData.append('titles', title || '');
    });

    uploadHighlightsMutation.mutate(formData);
  };

  const handleDeleteHighlight = (highlightId: string) => {
    Alert.alert(
      'Xác nhận',
      'Xóa video này?',
      [
        { text: 'Hủy', style: 'cancel' },
        { text: 'Xóa', style: 'destructive', onPress: () => deleteHighlightMutation.mutate(highlightId) }
      ]
    );
  };

  const maxHighlights = (match?.score?.home || 0) + (match?.score?.away || 0);
  const currentHighlights = match?.highlightVideos?.length || 0;

  return (
    <>
      <StatusBar 
        backgroundColor="rgba(214, 18, 64, 1)"
        barStyle="light-content"
      />
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: 'Upload Videos',
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
      
      <MatchBackground>
      <ScrollView style={styles.container}>
        <View style={[styles.section, { borderBottomColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Video Full Match</Text>
          <Text style={[styles.hint, { color: colors.textSecondary }]}>
            Nhập URL YouTube hoặc Cloudinary
          </Text>
          <TextInput
            style={[styles.input, { borderColor: colors.border, color: colors.text }]}
            placeholder="https://youtube.com/watch?v=..."
            placeholderTextColor={colors.textSecondary}
            value={videoUrl}
            onChangeText={setVideoUrl}
            autoCapitalize="none"
          />
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[styles.button, styles.buttonPrimary, { backgroundColor: colors.primary }]}
              onPress={handleUpdateVideoUrl}
              disabled={updateVideoMutation.isPending}
            >
              <Text style={styles.buttonText}>
                {updateVideoMutation.isPending ? 'Đang lưu...' : 'Lưu URL'}
              </Text>
            </TouchableOpacity>
            {match?.videoUrl && (
              <TouchableOpacity
                style={[styles.button, styles.buttonDanger, { borderColor: colors.lose }]}
                onPress={handleRemoveVideoUrl}
              >
                <Text style={[styles.buttonTextDanger, { color: colors.lose }]}>Xóa</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        <View style={[styles.section, { borderBottomColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Highlight Videos ({currentHighlights}/{maxHighlights})
          </Text>
          <Text style={[styles.hint, { color: colors.textSecondary }]}>
            Số video tối đa = Tổng bàn thắng. Mỗi video max 20MB.
          </Text>

          {match?.highlightVideos && match.highlightVideos.length > 0 && (
            <View style={styles.highlightsList}>
              {match.highlightVideos.map((highlight: any) => (
                <View key={highlight._id} style={[styles.highlightItem, { backgroundColor: colors.card }]}>
                  <View style={styles.highlightInfo}>
                    <Ionicons name="videocam" size={20} color={colors.primary} />
                    <Text style={[styles.highlightTitle, { color: colors.text }]} numberOfLines={1}>
                      {highlight.title || 'Highlight'}
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => handleDeleteHighlight(highlight._id)}
                    disabled={deleteHighlightMutation.isPending}
                  >
                    <Ionicons name="trash-outline" size={20} color={colors.lose} />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}

          <TouchableOpacity
            style={[styles.pickButton, { borderColor: colors.border }]}
            onPress={handlePickVideos}
            disabled={currentHighlights >= maxHighlights}
          >
            <Ionicons name="cloud-upload-outline" size={24} color={colors.primary} />
            <Text style={[styles.pickButtonText, { color: colors.primary }]}>
              {selectedVideos.length > 0
                ? `Đã chọn ${selectedVideos.length} video`
                : 'Chọn videos'}
            </Text>
          </TouchableOpacity>

          {selectedVideos.length > 0 && (
            <>
              {selectedVideos.map((video, index) => (
                <View key={index} style={styles.titleInput}>
                  <Text style={[styles.titleLabel, { color: colors.text }]}>
                    Title video {index + 1}:
                  </Text>
                  <TextInput
                    style={[styles.input, { borderColor: colors.border, color: colors.text }]}
                    placeholder="VD: Bàn thắng của Rashford phút 15"
                    placeholderTextColor={colors.textSecondary}
                    value={titles[index]}
                    onChangeText={(text) => {
                      const newTitles = [...titles];
                      newTitles[index] = text;
                      setTitles(newTitles);
                    }}
                  />
                </View>
              ))}
              <TouchableOpacity
                style={[styles.button, styles.buttonPrimary, { backgroundColor: colors.primary }]}
                onPress={handleUploadHighlights}
                disabled={uploadHighlightsMutation.isPending}
              >
                <Text style={styles.buttonText}>
                  {uploadHighlightsMutation.isPending ? 'Đang upload...' : 'Upload Highlights'}
                </Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </ScrollView>
      </MatchBackground>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  section: {
    padding: 20,
    borderBottomWidth: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  hint: {
    fontSize: 12,
    marginBottom: 15,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 15,
    fontSize: 14,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 10,
  },
  button: {
    flex: 1,
    height: 45,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonPrimary: {
  },
  buttonDanger: {
    backgroundColor: 'transparent',
    borderWidth: 1,
  },
  buttonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  buttonTextDanger: {
    fontSize: 15,
    fontWeight: '600',
  },
  highlightsList: {
    marginBottom: 15,
  },
  highlightItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  highlightInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  highlightTitle: {
    flex: 1,
    fontSize: 14,
  },
  pickButton: {
    height: 100,
    borderWidth: 2,
    borderRadius: 8,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  pickButtonText: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: '600',
  },
  titleInput: {
    marginBottom: 15,
  },
  titleLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
});