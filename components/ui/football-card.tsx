import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { ReactNode } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
} from 'react-native-reanimated';

interface FootballCardProps {
  children: ReactNode;
  style?: any;
}

export function FootballCard({ children, style }: FootballCardProps) {
  const colors = Colors;
  
  const scale = useSharedValue(1);
  const shadowOpacity = useSharedValue(0.1);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
      shadowOpacity: shadowOpacity.value,
    };
  });

  const handlePressIn = () => {
    scale.value = withSpring(0.98);
    shadowOpacity.value = withSpring(0.2);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
    shadowOpacity.value = withSpring(0.1);
  };

  return (
    <Animated.View
      style={[
        styles.card,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
        },
        animatedStyle,
        style,
      ]}
      onTouchStart={handlePressIn}
      onTouchEnd={handlePressOut}
      onTouchCancel={handlePressOut}>
      <ThemedView style={styles.content}>
        {children}
      </ThemedView>
      
      {/* Football accent */}
      <ThemedView style={[styles.accent, { backgroundColor: colors.primary }]} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowRadius: 8,
    elevation: 8,
    overflow: 'hidden',
    position: 'relative',
  },
  content: {
    padding: 24,
    backgroundColor: 'transparent',
  },
  accent: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 4,
    height: '100%',
  },
});