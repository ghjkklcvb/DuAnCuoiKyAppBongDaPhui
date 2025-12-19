import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Colors } from '../../constants/theme';
import { useColorScheme } from '../../hooks/use-color-scheme';

interface UploadProgressProps {
  progress: number;
  fileName?: string;
  isUploading: boolean;
}

export function UploadProgress({ progress, fileName, isUploading }: UploadProgressProps) {
  const colors = Colors;

  if (!isUploading) return null;

  return (
    <View style={[styles.container, { backgroundColor: colors.card }]}>
      <Text style={[styles.fileName, { color: colors.text }]} numberOfLines={1}>
        {fileName || 'Đang upload...'}
      </Text>
      <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
        <View 
          style={[
            styles.progressFill, 
            { 
              backgroundColor: colors.primary,
              width: `${progress}%` 
            }
          ]} 
        />
      </View>
      <Text style={[styles.progressText, { color: colors.textSecondary }]}>
        {Math.round(progress)}%
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 15,
    borderRadius: 8,
    marginVertical: 10,
  },
  fileName: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  progressBar: {
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 12,
    textAlign: 'right',
  },
});