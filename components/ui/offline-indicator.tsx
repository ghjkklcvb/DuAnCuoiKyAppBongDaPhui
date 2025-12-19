import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';


let showOfflineCallback: (() => void) | null = null;
let hideOfflineCallback: (() => void) | null = null;

export const showOfflineBanner = () => {
  if (showOfflineCallback) {
    showOfflineCallback();
  }
};

export const hideOfflineBanner = () => {
  if (hideOfflineCallback) {
    hideOfflineCallback();
  }
};

export function OfflineIndicator() {
  const [isVisible, setIsVisible] = useState(false);
  const [slideAnim] = useState(new Animated.Value(-100));
  const colorScheme = useColorScheme() ?? 'light';

  useEffect(() => {
    showOfflineCallback = () => {
      setIsVisible(true);
    
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 65,
        friction: 10,
      }).start();
    };

    hideOfflineCallback = () => {

      Animated.spring(slideAnim, {
        toValue: -100,
        useNativeDriver: true,
        tension: 65,
        friction: 10,
      }).start(() => {
        setIsVisible(false);
      });
    };

    return () => {
      showOfflineCallback = null;
      hideOfflineCallback = null;
    };
  }, []);

  if (!isVisible) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <View style={styles.content}>
        <Ionicons name="cloud-offline" size={18} color="#FFFFFF" />
        <Text style={styles.text}>Không có kết nối mạng</Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingTop: 50,
    paddingBottom: 12,
    paddingHorizontal: 16,
    zIndex: 9999,
    elevation: 9999,
    backgroundColor: '#FF9500',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  text: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});
