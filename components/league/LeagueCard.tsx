import { Colors } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import React, { useCallback } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { League } from '../../types/index';
import { useFavorites } from '@/contexts/FavoritesContext';
import FavoriteButton from './FavoriteButton';
import { useToast } from '@/hooks/useToast';
import { LinearGradient } from 'expo-linear-gradient';

interface LeagueCardProps {
  league: League;
}

function LeagueCard({ league }: LeagueCardProps) {
  const router = useRouter();
  const colors = Colors;

  const handlePress = useCallback(() => {
    router.push(`/league/${league._id}` as any);
  }, [league._id, router]);

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'ongoing':
        return {
          colors: ['#10B981', '#059669'] as const,
          icon: 'play-circle' as const,
          text: 'Đang diễn ra',
          bgColor: 'rgba(16, 185, 129, 0.15)',
          borderColor: 'rgba(16, 185, 129, 0.3)',
        };
      case 'upcoming':
        return {
          colors: ['#F59E0B', '#D97706'] as const,
          icon: 'time' as const,
          text: 'Sắp diễn ra',
          bgColor: 'rgba(245, 158, 11, 0.15)',
          borderColor: 'rgba(245, 158, 11, 0.3)',
        };
      case 'completed':
        return {
          colors: ['#6B7280', '#4B5563'] as const,
          icon: 'checkmark-circle' as const,
          text: 'Đã kết thúc',
          bgColor: 'rgba(107, 114, 128, 0.15)',
          borderColor: 'rgba(107, 114, 128, 0.3)',
        };
      default:
        return {
          colors: ['#6B7280', '#4B5563'] as const,
          icon: 'help-circle' as const,
          text: status,
          bgColor: 'rgba(107, 114, 128, 0.15)',
          borderColor: 'rgba(107, 114, 128, 0.3)',
        };
    }
  };

  const { isFavorite, toggleFavorite } = useFavorites();
  const toast = useToast();
  const [favoriteLoading, setFavoriteLoading] = React.useState(false);

  const handleFavoritePress = async (e: any) => {
    e.stopPropagation(); 
    setFavoriteLoading(true);
    try {
      const isNowFavorite = await toggleFavorite({
        _id: league._id,
        name: league.name,
        logo: league.logo,
        type: league.type,
        visibility: league.visibility,
        description: league.description,
        numberOfTeams: league.numberOfTeams,
        teamsCount: Array.isArray(league.teams) ? league.teams.length : 0,
      });
      toast.showSuccess(
        isNowFavorite ? 'Đã thêm quan tâm' : 'Đã bỏ quan tâm',
        league.name
      );
    } catch (error) {
      toast.showError('Lỗi', 'Không thể cập nhật');
    } finally {
      setFavoriteLoading(false);
    }
  };

  const statusConfig = getStatusConfig(league.tournamentStatus);

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
      onPress={handlePress}
      activeOpacity={0.7}
      accessible={true}
      accessibilityRole="button"
      accessibilityLabel={`Giải đấu ${league.name}`}
      accessibilityHint="Nhấn để xem chi tiết giải đấu"
    >
      
      {league.logo && (
        <Image 
          source={{ uri: league.logo }}
          style={styles.logo}
          contentFit="cover"
          transition={200}
          placeholder={require('@/assets/images/icon.png')}
        />
      )}
      
      <View style={styles.info}>
        <Text style={[styles.name, { color: colors.text }]} numberOfLines={1}>
          {league.name}
        </Text>
        
        {league.description && (
          <Text style={[styles.description, { color: colors.textSecondary || colors.icon }]} numberOfLines={2}>
            {league.description}
          </Text>
        )}
        
        <View style={styles.footer}>
          <View style={[styles.statusBadge, { 
            backgroundColor: statusConfig.bgColor,
            borderColor: statusConfig.borderColor,
          }]}>
            <LinearGradient
              colors={statusConfig.colors}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.statusGradient}
            >
              <Ionicons 
                name={statusConfig.icon} 
                size={14} 
                color="#FFFFFF" 
                style={styles.statusIcon}
              />
              <Text style={styles.statusText}>
                {statusConfig.text}
              </Text>
            </LinearGradient>
          </View>

          <View style={styles.teamsContainer}>
            <Ionicons 
              name="people" 
              size={16} 
              color={colors.textSecondary || colors.icon} 
              style={{ marginRight: 4 }}
            />
            <Text style={[styles.teams, { color: colors.textSecondary || colors.icon }]}>
              {Array.isArray(league.teams) ? league.teams.length : 0}/{league.numberOfTeams}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.favoriteButton}>
        <FavoriteButton
          isFavorite={isFavorite(league._id)}
          onPress={handleFavoritePress}
          loading={favoriteLoading}
        />
      </View>
    </TouchableOpacity>
  );
}

export default React.memo(LeagueCard);

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    borderRadius: 20,
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 14,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    borderWidth: 1,
  },
  logo: {
    width: 70,
    height: 70,
    borderRadius: 14,
    marginRight: 14,
  },
  info: {
    flex: 1,
    justifyContent: 'space-between',
  },
  name: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 6,
    letterSpacing: 0.3,
  },
  description: {
    fontSize: 13,
    marginBottom: 12,
    lineHeight: 18,
    opacity: 0.85,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusBadge: {
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  statusGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  statusIcon: {
    marginRight: 5,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  teamsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(107, 114, 128, 0.08)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  teams: {
    fontSize: 13,
    fontWeight: '600',
  },
  favoriteButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 10,
  },
});