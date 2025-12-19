import { Ionicons } from '@expo/vector-icons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, Image, ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Colors } from '../../../constants/theme';
import { useColorScheme } from '../../../hooks/use-color-scheme';
import { matchService } from '../../../services/match';
import MatchBackground from '../../../components/match/MatchBackground';

export default function UploadMediaScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const colors = Colors;

  const { data: match, isLoading } = useQuery({
    queryKey: ['match', id],
    queryFn: () => matchService.getMatchById(id as string),
  });

  const [videoUrl, setVideoUrl] = useState('');
  const [selectedVideos, setSelectedVideos] = useState<any[]>([]);
  const [videoTitles, setVideoTitles] = useState<string[]>([]);
  const [selectedPhotos, setSelectedPhotos] = useState<any[]>([]);

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
    onError: (error: any) => {
      Alert.alert('Lỗi', error.response?.data?.message || 'Không thể cập nhật video');
    },
  });

  const uploadHighlightsMutation = useMutation({
    mutationFn: (formData: FormData) => matchService.uploadHighlights(id as string, formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['match', id] });
      Alert.alert('Thành công', 'Đã upload highlight videos');
      setSelectedVideos([]);
      setVideoTitles([]);
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

  const uploadPhotosMutation = useMutation({
    mutationFn: (formData: FormData) => matchService.uploadPhotos(id as string, formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['match', id] });
      Alert.alert('Thành công', 'Đã upload ảnh trận đấu');
      setSelectedPhotos([]);
    },
    onError: (error: any) => {
      Alert.alert('Lỗi', error.response?.data?.message || 'Không thể upload ảnh');
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

  const handlePickVideosFromGallery = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Videos,
        allowsMultipleSelection: true,
        quality: 1,
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

        const oversized = result.assets.filter(
          asset => asset.fileSize && asset.fileSize > 20 * 1024 * 1024
        );
        if (oversized.length > 0) {
          Alert.alert('Lỗi', `Mỗi video tối đa 20MB. ${oversized.length} video vượt quá giới hạn.`);
          return;
        }

        const convertedAssets = result.assets.map(asset => ({
          uri: asset.uri,
          name: asset.fileName || 'video.mp4',
          size: asset.fileSize,
          mimeType: asset.type || 'video/mp4',
        }));

        setSelectedVideos(convertedAssets);
        setVideoTitles(new Array(convertedAssets.length).fill(''));
      }
    } catch (error) {
      console.error('Error picking videos from gallery:', error);
      Alert.alert('Lỗi', 'Không thể chọn video từ thư viện');
    }
  };

  const handlePickVideosFromFiles = async () => {
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

        setSelectedVideos(result.assets);
        setVideoTitles(new Array(result.assets.length).fill(''));
      }
    } catch (error) {
      console.error('Error picking videos from files:', error);
      Alert.alert('Lỗi', 'Không thể chọn video từ files');
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

    videoTitles.forEach((title) => {
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

  const handlePickPhotos = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        quality: 0.8,
      });

      if (!result.canceled) {
        const currentCount = match?.photos?.length || 0;
        const canAdd = 10 - currentCount;

        if (result.assets.length > canAdd) {
          Alert.alert('Lỗi', `Chỉ có thể thêm ${canAdd} ảnh nữa (tối đa 10 ảnh)`);
          return;
        }

        const oversized = result.assets.filter(asset =>
          asset.fileSize && asset.fileSize > 10 * 1024 * 1024
        );
        if (oversized.length > 0) {
          Alert.alert('Lỗi', 'Mỗi ảnh tối đa 10MB');
          return;
        }

        setSelectedPhotos(result.assets);
      }
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể chọn ảnh');
    }
  };

  const handleUploadPhotos = () => {
    if (selectedPhotos.length === 0) {
      Alert.alert('Lỗi', 'Vui lòng chọn ảnh');
      return;
    }

    const formData = new FormData();
    selectedPhotos.forEach((photo, index) => {
      formData.append('photos', {
        uri: photo.uri,
        type: 'image/jpeg',
        name: `photo_${index}.jpg`,
      } as any);
    });

    uploadPhotosMutation.mutate(formData);
  };

  const maxHighlights = (match?.score?.home || 0) + (match?.score?.away || 0);
  const currentHighlights = match?.highlightVideos?.length || 0;
  const currentPhotos = match?.photos?.length || 0;

  if (isLoading) {
    return (
      <>
        <StatusBar 
          backgroundColor="rgba(214, 18, 64, 1)"
          barStyle="light-content"
        />
        <MatchBackground>
          <View style={styles.loading}>
            <Text style={{ color: colors.text }}>Đang tải...</Text>
          </View>
        </MatchBackground>
      </>
    );
  }

  return (
    <>
      <StatusBar 
        backgroundColor="rgba(214, 18, 64, 1)"
        barStyle="light-content"
      />
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: 'Upload Media',
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
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="videocam" size={22} color={colors.primary} />
            <Text style={[styles.sectionTitle, { color: '#FFFFFF' }]}>Video Full Match</Text>
          </View>
          <Text style={[styles.hint, { color: 'rgba(255, 255, 255, 0.7)' }]}>
            Nhập URL YouTube hoặc Cloudinary
          </Text>
          <TextInput
            style={styles.input}
            placeholder="https://youtube.com/watch?v=..."
            placeholderTextColor="#9CA3AF"
            value={videoUrl}
            onChangeText={setVideoUrl}
            autoCapitalize="none"
          />
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[styles.button, { backgroundColor: colors.primary }]}
              onPress={handleUpdateVideoUrl}
              disabled={updateVideoMutation.isPending}
            >
              <Text style={styles.buttonText}>
                {updateVideoMutation.isPending ? 'Đang lưu...' : 'Lưu URL'}
              </Text>
            </TouchableOpacity>
            {match?.videoUrl && (
              <TouchableOpacity
                style={[styles.button, styles.buttonOutline]}
                onPress={handleRemoveVideoUrl}
              >
                <Text style={[styles.buttonTextDanger, { color: colors.lose }]}>Xóa</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="film" size={22} color={colors.primary} />
            <Text style={[styles.sectionTitle, { color: '#FFFFFF' }]}>
              Highlight Videos ({currentHighlights}/{maxHighlights})
            </Text>
          </View>
          <Text style={[styles.hint, { color: 'rgba(255, 255, 255, 0.7)' }]}>
            Số video tối đa = Tổng bàn thắng. Mỗi video max 20MB.
          </Text>

          {match?.highlightVideos && match.highlightVideos.length > 0 && (
            <View style={styles.list}>
              {match.highlightVideos.map((highlight: any) => (
                <View key={highlight._id} style={styles.listItem}>
                  <View style={styles.listItemInfo}>
                    <Ionicons name="videocam" size={20} color={colors.primary} />
                    <Text style={[styles.listItemTitle, { color: '#1F2937' }]} numberOfLines={1}>
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

          {currentHighlights < maxHighlights && (
            <>
              <View style={styles.pickerButtons}>
                <TouchableOpacity
                  style={styles.halfPickButton}
                  onPress={handlePickVideosFromGallery}
                >
                  <Ionicons name="images-outline" size={28} color={colors.primary} />
                  <Text style={[styles.halfPickButtonText, { color: colors.primary }]}>
                    Từ thư viện
                  </Text>
                  <Text style={[styles.halfPickButtonHint, { color: '#6B7280' }]}>
                    (Xem thumbnail)
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.halfPickButton}
                  onPress={handlePickVideosFromFiles}
                >
                  <Ionicons name="folder-outline" size={28} color={colors.primary} />
                  <Text style={[styles.halfPickButtonText, { color: colors.primary }]}>
                    Từ files
                  </Text>
                  <Text style={[styles.halfPickButtonHint, { color: '#6B7280' }]}>
                    (Duyệt thư mục)
                  </Text>
                </TouchableOpacity>
              </View>

              {selectedVideos.length > 0 && (
                <View style={[styles.selectedInfo, { backgroundColor: colors.primary + '10' }]}>
                  <Ionicons name="checkmark-circle" size={20} color={colors.primary} />
                  <Text style={[styles.selectedInfoText, { color: colors.primary }]}>
                    Đã chọn {selectedVideos.length} video
                  </Text>
                </View>
              )}

              {selectedVideos.length > 0 && (
                <>
                  {selectedVideos.map((video, index) => (
                    <View key={index} style={styles.titleInputContainer}>
                      <Text style={[styles.titleLabel, { color: '#1F2937' }]}>
                        Title video {index + 1}:
                      </Text>
                      <TextInput
                        style={[styles.input, { borderColor: 'rgba(214, 18, 64, 0.2)', color: '#1F2937', backgroundColor: '#FFFFFF' }]}
                        placeholder="VD: Bàn thắng của Rashford phút 15"
                        placeholderTextColor="#9CA3AF"
                        value={videoTitles[index]}
                        onChangeText={(text) => {
                          const newTitles = [...videoTitles];
                          newTitles[index] = text;
                          setVideoTitles(newTitles);
                        }}
                      />
                    </View>
                  ))}
                  <TouchableOpacity
                    style={[styles.button, { backgroundColor: colors.primary }]}
                    onPress={handleUploadHighlights}
                    disabled={uploadHighlightsMutation.isPending}
                  >
                    <Text style={styles.buttonText}>
                      {uploadHighlightsMutation.isPending ? 'Đang upload...' : 'Upload Highlights'}
                    </Text>
                  </TouchableOpacity>
                </>
              )}
            </>
          )}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="images" size={22} color={colors.primary} />
            <Text style={[styles.sectionTitle, { color: '#FFFFFF' }]}>
              Ảnh trận đấu ({currentPhotos}/10)
            </Text>
          </View>
          <Text style={[styles.hint, { color: 'rgba(255, 255, 255, 0.7)' }]}>
            Tối đa 10 ảnh, mỗi ảnh max 10MB
          </Text>

          {match?.photos && match.photos.length > 0 && (
            <View style={styles.photoGrid}>
              {match.photos.map((photo: string, index: number) => (
                <Image
                  key={index}
                  source={{ uri: photo }}
                  style={styles.photo}
                />
              ))}
            </View>
          )}

          {selectedPhotos.length > 0 && (
            <>
              <Text style={[styles.subsectionTitle, { color: '#1F2937' }]}>
                Đã chọn ({selectedPhotos.length})
              </Text>
              <View style={styles.photoGrid}>
                {selectedPhotos.map((photo, index) => (
                  <View key={index} style={styles.photoContainer}>
                    <Image source={{ uri: photo.uri }} style={styles.photo} />
                    <TouchableOpacity
                      style={styles.removeButton}
                      onPress={() => setSelectedPhotos(selectedPhotos.filter((_, i) => i !== index))}
                    >
                      <Ionicons name="close-circle" size={24} color={colors.lose} />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            </>
          )}

          {currentPhotos < 10 && (
            <>
              <TouchableOpacity
                style={styles.pickButton}
                onPress={handlePickPhotos}
              >
                <Ionicons name="images-outline" size={32} color={colors.primary} />
                <Text style={[styles.pickButtonText, { color: colors.primary }]}>
                  {selectedPhotos.length > 0
                    ? `Đã chọn ${selectedPhotos.length} ảnh`
                    : 'Chọn ảnh'}
                </Text>
              </TouchableOpacity>

              {selectedPhotos.length > 0 && (
                <TouchableOpacity
                  style={[styles.button, { backgroundColor: colors.primary }]}
                  onPress={handleUploadPhotos}
                  disabled={uploadPhotosMutation.isPending}
                >
                  <Text style={styles.buttonText}>
                    {uploadPhotosMutation.isPending ? 'Đang upload...' : `Upload ${selectedPhotos.length} ảnh`}
                  </Text>
                </TouchableOpacity>
              )}
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
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  section: {
    padding: 20,
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  subsectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 10,
    marginTop: 15,
  },
  hint: {
    fontSize: 12,
    marginBottom: 15,
    lineHeight: 18,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 15,
    marginBottom: 15,
    fontSize: 14,
    backgroundColor: '#FFFFFF',
    borderColor: 'rgba(214, 18, 64, 0.2)',
    color: '#1F2937',
    paddingLeft:10,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 10,
  },
  button: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonOutline: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: 'rgba(214, 18, 64, 1)',
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
  list: {
    marginBottom: 15,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(214, 18, 64, 0.1)',
  },
  listItemInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  listItemTitle: {
    flex: 1,
    fontSize: 14,
  },
  pickButton: {
    height: 100,
    borderWidth: 2,
    borderRadius: 16,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
    backgroundColor: '#FFFFFF',
    borderColor: 'rgba(214, 18, 64, 0.2)',
  },
  pickButtonText: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: '600',
  },
  pickerButtons: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 15,
  },
  halfPickButton: {
    flex: 1,
    height: 110,
    borderWidth: 2,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#FFFFFF',
    borderColor: 'rgba(214, 18, 64, 0.2)',
  },
  halfPickButtonText: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: '600',
  },
  halfPickButtonHint: {
    marginTop: 4,
    fontSize: 11,
  },
  selectedInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 8,
    marginBottom: 15,
  },
  selectedInfoText: {
    fontSize: 14,
    fontWeight: '600',
  },
  titleInputContainer: {
    marginBottom: 15,
  },
  titleLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 15,
  },
  photoContainer: {
    position: 'relative',
    width: '48%',
  },
  photo: {
    width: '100%',
    height: 150,
    borderRadius: 12,
  },
  removeButton: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: '#fff',
    borderRadius: 12,
  },
});
