import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withSequence,
    withTiming,
} from 'react-native-reanimated';

interface FootballHeaderProps {
  title: string;
  subtitle: string;
  icon?: string;
}

export function FootballHeader({ title, subtitle, icon = '⚽' }: FootballHeaderProps) {
  const colors = Colors;
  
  const ballRotation = useSharedValue(0);
  const ballScale = useSharedValue(1);

  useEffect(() => {
    ballRotation.value = withRepeat(
      withTiming(360, { duration: 8000 }),
      -1,
      false
    );
    
    ballScale.value = withRepeat(
      withSequence(
        withTiming(1.1, { duration: 1500 }),
        withTiming(1, { duration: 1500 })
      ),
      -1,
      true
    );
  }, [ballRotation, ballScale]);

  const animatedBallStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { rotate: `${ballRotation.value}deg` },
        { scale: ballScale.value },
      ],
    };
  });

  return (
    <ThemedView style={styles.container}>
      {/* Header Background with Gradient */}
      <LinearGradient
        colors={colors.gradient.primary as unknown as readonly [string, string, ...string[]]}
        style={styles.headerGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}>
        
        {/* Football Pattern Background */}
        <ThemedView style={styles.patternContainer}>
          <ThemedText style={styles.patternText}>⚽</ThemedText>
          <ThemedText style={[styles.patternText, styles.pattern2]}>🏆</ThemedText>
          <ThemedText style={[styles.patternText, styles.pattern3]}>⚽</ThemedText>
        </ThemedView>

        {/* Main Content */}
        <ThemedView style={styles.content}>
          {/* Animated Football Icon */}
          <ThemedView style={styles.iconContainer}>
            <Animated.Text style={[styles.footballIcon, animatedBallStyle]}>
              {icon}
            </Animated.Text>
          </ThemedView>

          {/* App Title */}
          <ThemedText style={styles.appTitle}>Bóng Đá Phủi</ThemedText>
          <ThemedText style={styles.appSubtitle}>Quản lý giải đấu chuyên nghiệp</ThemedText>

          {/* Page Title */}
          <ThemedView style={styles.titleContainer}>
            <ThemedText style={styles.title}>{title}</ThemedText>
            <ThemedText style={styles.subtitle}>{subtitle}</ThemedText>
          </ThemedView>
        </ThemedView>
      </LinearGradient>

      {/* Bottom Curve */}
      <ThemedView style={styles.curveContainer}>
        <LinearGradient
          colors={[colors.primary, 'transparent']}
          style={styles.curve}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
        />
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  headerGradient: {
    paddingTop: 60,
    paddingBottom: 40,
    paddingHorizontal: 24,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  patternContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.1,
  },
  patternText: {
    position: 'absolute',
    fontSize: 40,
    color: '#FFFFFF',
  },
  pattern2: {
    top: 80,
    right: 30,
    fontSize: 30,
  },
  pattern3: {
    bottom: 60,
    left: 50,
    fontSize: 35,
  },
  content: {
    alignItems: 'center',
    zIndex: 1,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 15,
  },
  footballIcon: {
    fontSize: 60,
  },
  appTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  appSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 30,
    textAlign: 'center',
  },
  titleContainer: {
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    lineHeight: 22,
  },
  curveContainer: {
    height: 20,
    marginTop: -20,
  },
  curve: {
    flex: 1,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
});