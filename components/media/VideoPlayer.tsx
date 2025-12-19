import { Video, ResizeMode, AVPlaybackStatus } from 'expo-av';
import React, { useRef, useState } from 'react';
import { View, StyleSheet, TouchableOpacity, ActivityIndicator, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface VideoPlayerProps {
  uri: string;
  title?: string;
}

export default function VideoPlayer({ uri, title }: VideoPlayerProps) {
  const colors = Colors;
  const video = useRef<Video>(null);
  const [status, setStatus] = useState<AVPlaybackStatus>();
  const [isLoading, setIsLoading] = useState(true);

  const isPlaying = status?.isLoaded && status.isPlaying;

  const togglePlayPause = () => {
    if (status?.isLoaded) {
      if (status.isPlaying) {
        video.current?.pauseAsync();
      } else {
        video.current?.playAsync();
      }
    }
  };

  return (
    <View style={styles.container}>
      {title && (
        <Text style={[styles.title, { color: '#cfc3c3ff' }]} numberOfLines={2}>
          {title}
        </Text>
      )}
      <View style={styles.videoContainer}>
        <Video
          ref={video}
          source={{ uri }}
          style={styles.video}
          useNativeControls
          resizeMode={ResizeMode.CONTAIN}
          isLooping={false}
          onPlaybackStatusUpdate={(status) => {
            setStatus(status);
            if (status.isLoaded) {
              setIsLoading(false);
            }
          }}
          onLoad={() => setIsLoading(false)}
          onLoadStart={() => setIsLoading(true)}
        />
        
        {isLoading && (
          <View style={[styles.loadingOverlay, { backgroundColor: colors.background }]}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        )}

        {!isLoading && (
          <TouchableOpacity
            style={styles.playButton}
            onPress={togglePlayPause}
            activeOpacity={0.7}
          >
            <View style={[styles.playButtonInner, { backgroundColor: colors.primary + '90' }]}>
              <Ionicons
                name={isPlaying ? 'pause' : 'play'}
                size={32}
                color="#fff"
              />
            </View>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 10,
    paddingHorizontal: 4,
  },
  videoContainer: {
    width: '100%',
    height: 200,
    backgroundColor: '#000',
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  video: {
    width: '100%',
    height: '100%',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playButton: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -30 }, { translateY: -30 }],
  },
  playButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
