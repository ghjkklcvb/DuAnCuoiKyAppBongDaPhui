import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, View } from 'react-native';

interface TeamBackgroundProps {
  children: React.ReactNode;
}

export default function TeamBackground({ children }: TeamBackgroundProps) {
  return (
    <View style={styles.container}>
      <Image
        source={require('@/assets/images/Background_5.jpg')}
        style={styles.backgroundImage}
        contentFit="cover"
        blurRadius={0}
        priority="high"
      />
      
      <LinearGradient
        colors={[
          'rgba(221, 27, 73, 0.84)',   
          'rgba(107, 17, 37, 0.62)',     
          'rgba(148, 18, 46, 0.60)',  
          'rgba(125, 20, 42, 0.60)',     
          'rgba(110, 18, 38, 0.60)',    
          'rgba(100, 15, 35, 0.60)',     
        ]}
        style={styles.gradient}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        locations={[0, 0.2, 0.4, 0.6, 0.85, 1]}
      />
      
      <LinearGradient
        colors={[
          'rgba(160, 20, 50, 0.05)',    
          'rgba(100, 10, 30, 0.06)',    
          'rgba(140, 18, 42, 0.05)',     
        ]}
        style={styles.accentGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
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
  accentGradient: {
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
