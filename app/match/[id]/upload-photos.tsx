import { Ionicons } from '@expo/vector-icons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as ImagePicker from 'expo-image-picker';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Image, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors } from '../../../constants/theme';
import { useColorScheme } from '../../../hooks/use-color-scheme';
import { matchService } from '../../../services/match';
import MatchBackground from '../../../components/match/MatchBackground';

export default function UploadPhotosScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const queryClient = useQueryClient();
    const colors = Colors;

    const { data: match } = useQuery({
        queryKey: ['match', id],
        queryFn: () => matchService.getMatchById(id as string),
    });

    const [selectedPhotos, setSelectedPhotos] = useState<any[]>([]);

    const uploadMutation = useMutation({
        mutationFn: (formData: FormData) => matchService.uploadPhotos(id as string, formData),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['match', id] });
            Alert.alert('Thành công', 'Đã upload ảnh trận đấu', [
                { text: 'OK', onPress: () => router.back() }
            ]);
        },
        onError: (error: any) => {
            Alert.alert('Lỗi', error.response?.data?.message || 'Không thể upload ảnh');
        },
    });

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

    const handleUpload = () => {
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

        uploadMutation.mutate(formData);
    };

    const removeSelectedPhoto = (index: number) => {
        setSelectedPhotos(selectedPhotos.filter((_, i) => i !== index));
    };

    const maxPhotos = 10;
    const currentPhotos = match?.photos?.length || 0;

    return (
        <>
            <StatusBar 
              backgroundColor="rgba(214, 18, 64, 1)"
              barStyle="light-content"
            />
            <Stack.Screen
                options={{
                    headerShown: true,
                    headerTitle: 'Upload Ảnh',
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
                <View style={[styles.header, { borderBottomColor: colors.border }]}>
                    <Text style={[styles.title, { color: colors.text }]}>
                        Ảnh trận đấu ({currentPhotos}/{maxPhotos})
                    </Text>
                    <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                        Tối đa 10 ảnh, mỗi ảnh max 10MB
                    </Text>
                </View>

                {match?.photos && match.photos.length > 0 && (
                    <View style={styles.section}>
                        <Text style={[styles.sectionTitle, { color: colors.text }]}>Ảnh hiện có</Text>
                        <View style={styles.photoGrid}>
                            {match.photos.map((photo: string, index: number) => (
                                <Image
                                    key={index}
                                    source={{ uri: photo }}
                                    style={styles.photo}
                                />
                            ))}
                        </View>
                    </View>
                )}

                {selectedPhotos.length > 0 && (
                    <View style={styles.section}>
                        <Text style={[styles.sectionTitle, { color: colors.text }]}>
                            Đã chọn ({selectedPhotos.length})
                        </Text>
                        <View style={styles.photoGrid}>
                            {selectedPhotos.map((photo, index) => (
                                <View key={index} style={styles.photoContainer}>
                                    <Image source={{ uri: photo.uri }} style={styles.photo} />
                                    <TouchableOpacity
                                        style={styles.removeButton}
                                        onPress={() => removeSelectedPhoto(index)}
                                    >
                                        <Ionicons name="close-circle" size={24} color={colors.lose} />
                                    </TouchableOpacity>
                                </View>
                            ))}
                        </View>
                    </View>
                )}

                {currentPhotos < maxPhotos && (
                    <TouchableOpacity
                        style={[styles.pickButton, { borderColor: colors.border }]}
                        onPress={handlePickPhotos}
                    >
                        <Ionicons name="images-outline" size={40} color={colors.primary} />
                        <Text style={[styles.pickButtonText, { color: colors.primary }]}>
                            {selectedPhotos.length > 0
                                ? `Đã chọn ${selectedPhotos.length} ảnh`
                                : 'Chọn ảnh'}
                        </Text>
                    </TouchableOpacity>
                )}

                {selectedPhotos.length > 0 && (
                    <TouchableOpacity
                        style={[
                            styles.button,
                            { backgroundColor: colors.primary },
                            uploadMutation.isPending && styles.buttonDisabled
                        ]}
                        onPress={handleUpload}
                        disabled={uploadMutation.isPending}
                    >
                        <Text style={styles.buttonText}>
                            {uploadMutation.isPending ? 'Đang upload...' : `Upload ${selectedPhotos.length} ảnh`}
                        </Text>
                    </TouchableOpacity>
                )}
            </ScrollView>
      </MatchBackground>
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        padding: 20,
        borderBottomWidth: 1,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    subtitle: {
        fontSize: 14,
    },
    section: {
        padding: 20,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 15,
    },
    photoGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
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
    pickButton: {
        margin: 20,
        height: 150,
        borderWidth: 2,
        borderRadius: 12,
        borderStyle: 'dashed',
        justifyContent: 'center',
        alignItems: 'center',
    },
    pickButtonText: {
        marginTop: 10,
        fontSize: 16,
        fontWeight: '600',
    },
    button: {
        margin: 20,
        height: 50,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    buttonDisabled: {
        opacity: 0.6,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
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
    buttonPrimary: {
    },
    buttonDanger: {
        backgroundColor: 'transparent',
        borderWidth: 1,
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
    titleInput: {
        marginBottom: 15,
    },
    titleLabel: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 8,
    },
});