import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet } from 'react-native';

interface GradientBackgroundProps {
  children: React.ReactNode;
  variant?: 'primary' | 'surface';
}

export function GradientBackground({ children, variant = 'surface' }: GradientBackgroundProps) {
  const colorScheme = useColorScheme() ?? 'light';
  
  const gradientColors = variant === 'primary'
    ? (Colors[colorScheme].gradient.primary as unknown as readonly [string, string, ...string[]])
    : (Colors[colorScheme].gradient.surface as unknown as readonly [string, string, ...string[]]);

  return (
    <LinearGradient
      colors={gradientColors}
      style={styles.gradient}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}>
      {children}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
});