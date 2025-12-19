import { useRouter } from 'expo-router';
import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors } from '../../constants/theme';
import { useColorScheme } from '../../hooks/use-color-scheme';

interface TopTeamCardProps {
  position: number;
  team: {
    _id: string;
    name: string;
    shortName: string;
    logo?: string;
  };
  value?: number;
  label?: string;
  form?: ('W' | 'D' | 'L')[];
  color?: string;
}

export default function TopTeamCard({ 
  position, 
  team, 
  value, 
  label, 
  form, 
  color 
}: TopTeamCardProps) {
  const router = useRouter();
  const colors = Colors;

  const getFormColor = (result: 'W' | 'D' | 'L') => {
    switch (result) {
      case 'W': return colors.win;
      case 'D': return colors.draw;
      case 'L': return colors.lose;
    }
  };

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: colors.card }]}
      onPress={() => router.push(`/team/${team._id}`)}
    >
      <View style={[styles.position, { backgroundColor: color || colors.primary }]}>
        <Text style={styles.positionText}>{position}</Text>
      </View>

      {team.logo ? (
        <Image source={{ uri: team.logo }} style={styles.logo} />
      ) : (
        <View style={[styles.logoPlaceholder, { backgroundColor: colors.primary }]}>
          <Text style={styles.logoText}>{team.shortName}</Text>
        </View>
      )}

      <Text style={[styles.teamName, { color: colors.text }]} numberOfLines={1}>
        {team.name}
      </Text>

      {value !== undefined && (
        <View style={styles.value}>
          <Text style={[styles.valueNumber, { color: colors.text }]}>{value}</Text>
          {label && <Text style={[styles.valueLabel, { color: colors.textSecondary }]}>{label}</Text>}
        </View>
      )}

      {form && (
        <View style={styles.form}>
          {form.slice(-5).map((result, index) => (
            <View
              key={index}
              style={[styles.formDot, { backgroundColor: getFormColor(result) }]}
            />
          ))}
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    gap: 12,
  },
  position: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  positionText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  logo: {
    width: 40,
    height: 40,
    borderRadius: 8,
  },
  logoPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  teamName: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
  },
  value: {
    alignItems: 'center',
  },
  valueNumber: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  valueLabel: {
    fontSize: 12,
  },
  form: {
    flexDirection: 'row',
    gap: 4,
  },
  formDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});