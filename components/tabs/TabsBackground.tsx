import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, View } from 'react-native';

interface TabsBackgroundProps {
  children: React.ReactNode;
}

export default function TabsBackground({ children }: TabsBackgroundProps) {
  return (
    <View style={styles.container}>
      <Image
        source={require('@/assets/images/Background_2.jpg')}
        style={styles.backgroundImage}
        contentFit="cover"
        blurRadius={0}
        priority="high"
      />

      <LinearGradient
        colors={[
          'rgba(220, 38, 38, 0.74)',
          'rgba(239, 68, 68, 0.56)',
          'rgba(116, 59, 59, 0.66)',
          'rgba(44, 24, 24, 0.44)',
          'rgba(20, 12, 12, 0.36)',
          'rgba(27, 17, 17, 0.45)',
        ]}
        style={styles.gradient}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        locations={[0, 0.15, 0.3, 0.45, 0.7, 1]}
      />

      <View style={styles.content}>
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
  },
  gradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  content: {
    flex: 1,
  },
});
