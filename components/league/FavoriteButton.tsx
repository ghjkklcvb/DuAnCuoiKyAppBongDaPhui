import React from 'react';
import { TouchableOpacity, StyleSheet, ActivityIndicator, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';

interface FavoriteButtonProps {
  isFavorite: boolean;
  onPress: (e?: any) => void;
  loading?: boolean;
  size?: number;
}

export default function FavoriteButton({ 
  isFavorite, 
  onPress, 
  loading = false,
  size = 24 
}: FavoriteButtonProps) {
  const colors = Colors;

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      disabled={loading}
      activeOpacity={0.7}
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
    >
      {loading ? (
        <ActivityIndicator size="small" color={colors.primary} />
      ) : (
        <View style={styles.iconContainer}>
          <Ionicons
            name={isFavorite ? 'star' : 'star-outline'}
            size={size}
            color={isFavorite ? '#FFD700' : '#FFFFFF'}
            style={styles.icon}
          />
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 4,
  },
  iconContainer: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  icon: {
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
});
