import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, View } from 'react-native';

interface AuthBackgroundProps {
  children: React.ReactNode;
}

export default function AuthBackground({ children }: AuthBackgroundProps) {
  return (
    <View style={styles.container}>
      <Image
        source={require('@/assets/images/Background_1.jpg')}
        style={styles.backgroundImage}
        contentFit="cover"
        blurRadius={8}
        priority="high"
      />
      
      <LinearGradient
        colors={['rgba(0, 0, 0, 0.07)', 'rgba(0, 0, 0, 0.32)', 'rgba(0, 0, 0, 0.66)']}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
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
