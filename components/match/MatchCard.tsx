import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors } from '../../constants/theme';
import { useColorScheme } from '../../hooks/use-color-scheme';
import { Match } from '../../types';

interface MatchCardProps {
  match: Match;
  onPress?: () => void;
}

export default function MatchCard({ match, onPress }: MatchCardProps) {
  const colors = Colors;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'live': return colors.lose;
      case 'finished': return colors.win;
      default: return colors.textSecondary;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'scheduled': return 'Sắp đấu';
      case 'live': return 'LIVE';
      case 'finished': return 'KT';
      case 'postponed': return 'Hoãn';
      case 'cancelled': return 'Hủy';
      default: return status;
    }
  };

  if (!match.homeTeam || !match.awayTeam) {
    return null;
  }

  return (
    <TouchableOpacity style={[styles.card, { backgroundColor: colors.card }]} onPress={onPress}>
      <View style={styles.header}>
        <Text style={[styles.round, { color: colors.textSecondary }]}>Vòng {match.round}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(match.status) }]}>
          <Text style={styles.statusText}>{getStatusText(match.status)}</Text>
        </View>
      </View>

      <View style={styles.matchContent}>
        <View style={styles.team}>
          {match.homeTeam?.logo ? (
            <Image source={{ uri: match.homeTeam.logo }} style={styles.teamLogo} />
          ) : (
            <View style={[styles.teamLogoPlaceholder, { backgroundColor: colors.primary }]}>
              <Text style={styles.teamLogoText}>{match.homeTeam?.shortName || '??'}</Text>
            </View>
          )}
          <Text style={[styles.teamName, { color: colors.text }]} numberOfLines={1}>
            {match.homeTeam?.name || 'Đội chưa xác định'}
          </Text>
        </View>

        <View style={styles.scoreContainer}>
          {match.status === 'finished' ? (
            <View style={styles.score}>
              <Text style={[styles.scoreText, { color: colors.primary }]}>{match.score?.home ?? 0}</Text>
              <Text style={[styles.scoreSeparator, { color: colors.textSecondary }]}>-</Text>
              <Text style={[styles.scoreText, { color: colors.primary }]}>{match.score?.away ?? 0}</Text>
            </View>
          ) : (
            <Text style={[styles.vsText, { color: colors.textSecondary }]}>VS</Text>
          )}
          {match.scheduledDate && (
            <Text style={[styles.dateText, { color: colors.textSecondary }]}>
              {new Date(match.scheduledDate).toLocaleDateString('vi-VN', {
                day: '2-digit',
                month: '2-digit',
              })}
            </Text>
          )}
        </View>

        <View style={styles.team}>
          {match.awayTeam?.logo ? (
            <Image source={{ uri: match.awayTeam.logo }} style={styles.teamLogo} />
          ) : (
            <View style={[styles.teamLogoPlaceholder, { backgroundColor: colors.primary }]}>
              <Text style={styles.teamLogoText}>{match.awayTeam?.shortName || '??'}</Text>
            </View>
          )}
          <Text style={[styles.teamName, { color: colors.text }]} numberOfLines={1}>
            {match.awayTeam?.name || 'Đội chưa xác định'}
          </Text>
        </View>
      </View>

      {match.venue && (
        <Text style={[styles.venue, { color: colors.textSecondary }]}>📍 {match.venue}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  round: {
    fontSize: 13,
    fontWeight: '600',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  statusText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: 'bold',
  },
  matchContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  team: {
    flex: 1,
    alignItems: 'center',
  },
  teamLogo: {
    width: 40,
    height: 40,
    borderRadius: 8,
    marginBottom: 8,
  },
  teamLogoPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  teamLogoText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  teamName: {
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
  scoreContainer: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  score: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  scoreText: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  scoreSeparator: {
    fontSize: 20,
    fontWeight: 'bold',
    marginHorizontal: 10,
  },
  vsText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  dateText: {
    fontSize: 12,
  },
  venue: {
    fontSize: 12,
    textAlign: 'center',
  },
});