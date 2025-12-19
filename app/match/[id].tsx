import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { Image, Linking, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors } from '../../constants/theme';
import { useAuth } from '../../contexts/AuthContext';
import { useColorScheme } from '../../hooks/use-color-scheme';
import { matchService } from '../../services/match';
import { leagueService } from '../../services/league';
import VideoPlayer from '../../components/media/VideoPlayer';
import MatchBackground from '../../components/match/MatchBackground';

export default function MatchDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  const colors = Colors;

  const { data: match, isLoading: matchLoading, isError, error } = useQuery({
    queryKey: ['match', id],
    queryFn: () => matchService.getMatchById(id as string),
    retry: 1, 
  });

  const leagueId = typeof match?.league === 'object' ? match.league._id : match?.league;

  const { data: league } = useQuery({
    queryKey: ['league', leagueId],
    queryFn: () => leagueService.getLeagueById(leagueId as string),
    enabled: !!leagueId,
    retry: 1,
  });

  const leagueOwnerId = typeof league?.owner === 'object' ? league.owner._id : league?.owner;
  const isOwner = user?._id && leagueOwnerId && user._id === leagueOwnerId;

  const handleOpenVideo = (url: string) => {
    Linking.openURL(url);
  };

  if (matchLoading) {
    return (
      <MatchBackground>
        <View style={styles.loading}>
          <Text style={{ color: colors.text }}>Đang tải...</Text>
        </View>
      </MatchBackground>
    );
  }

  if (isError) {
    return (
      <MatchBackground>
        <View style={styles.loading}>
          <Text style={{ fontSize: 40, marginBottom: 16 }}>⚠️</Text>
          <Text style={{ color: colors.text, fontSize: 18, fontWeight: '600', marginBottom: 8 }}>
            Không thể tải trận đấu
          </Text>
          <Text style={{ color: colors.textSecondary, fontSize: 14, textAlign: 'center', paddingHorizontal: 40 }}>
            {error?.message?.includes('500') 
              ? 'Server đang gặp sự cố. Vui lòng thử lại sau.' 
              : 'Vui lòng kiểm tra kết nối mạng và thử lại.'}
          </Text>
          <TouchableOpacity 
            onPress={() => router.back()}
            style={{ marginTop: 20, paddingHorizontal: 24, paddingVertical: 12, backgroundColor: colors.primary, borderRadius: 8 }}
          >
            <Text style={{ color: '#fff', fontWeight: '600' }}>Quay lại</Text>
          </TouchableOpacity>
        </View>
      </MatchBackground>
    );
  }

  if (!match) {
    return (
      <MatchBackground>
        <View style={styles.loading}>
          <Text style={{ color: colors.text }}>Không tìm thấy trận đấu</Text>
        </View>
      </MatchBackground>
    );
  }

  return (
    <>
      <StatusBar 
        backgroundColor="rgba(214, 18, 64, 1)"
        barStyle="light-content"
      />
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: 'Chi tiết trận đấu',
          headerStyle: { 
            backgroundColor: 'rgba(214, 18, 64, 1)',
          },
          headerTintColor: '#FFFFFF',
          headerTitleStyle: {
            color: '#FFFFFF',
            fontWeight: '600',
          },
          headerRight: () =>
            isOwner ? (
              <TouchableOpacity
                onPress={() => router.push(`/match/${id}/edit-info` as any)}
                style={styles.headerButton}
              >
                <Ionicons name="create-outline" size={22} color="#FFFFFF" />
              </TouchableOpacity>
            ) : null,
        }}
      />
      
      <MatchBackground>
        <ScrollView style={styles.container}>
        <View style={styles.matchHeader}>
          <Text style={styles.round}>Vòng {match.round}</Text>
          <View style={styles.teamsContainer}>
            <View style={styles.teamSection}>
              {match.homeTeam.logo ? (
                <Image source={{ uri: match.homeTeam.logo }} style={styles.logo} />
              ) : (
                <View style={[styles.logoPlaceholder, { backgroundColor: colors.primary }]}>
                  <Text style={styles.logoText}>{match.homeTeam.shortName}</Text>
                </View>
              )}
              <Text style={[styles.teamName, { color: '#1F2937' }]}>{match.homeTeam.name}</Text>
            </View>

            <View style={styles.scoreSection}>
              {match.status === 'finished' ? (
                <>
                  <View style={styles.scoreDisplay}>
                    <Text style={[styles.scoreNumber, { color: '#B91C3C' }]}>{match.score?.home || 0}</Text>
                    <Text style={[styles.scoreSep, { color: '#9CA3AF' }]}>-</Text>
                    <Text style={[styles.scoreNumber, { color: '#B91C3C' }]}>{match.score?.away || 0}</Text>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: colors.win }]}>
                    <Text style={styles.badgeText}>Kết thúc</Text>
                  </View>
                </>
              ) : match.status === 'live' ? (
                <>
                  <View style={styles.scoreDisplay}>
                    <Text style={[styles.scoreNumber, { color: '#B91C3C' }]}>{match.score?.home || 0}</Text>
                    <Text style={[styles.scoreSep, { color: '#9CA3AF' }]}>-</Text>
                    <Text style={[styles.scoreNumber, { color: '#B91C3C' }]}>{match.score?.away || 0}</Text>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: colors.lose }]}>
                    <Text style={styles.badgeText}>LIVE</Text>
                  </View>
                </>
              ) : (
                <>
                  <Text style={[styles.vsText, { color: '#1F2937' }]}>VS</Text>
                  {match.scheduledDate && (
                    <Text style={[styles.dateText, { color: '#6B7280' }]}>
                      {new Date(match.scheduledDate).toLocaleString('vi-VN')}
                    </Text>
                  )}
                </>
              )}
            </View>

            <View style={styles.teamSection}>
              {match.awayTeam.logo ? (
                <Image source={{ uri: match.awayTeam.logo }} style={styles.logo} />
              ) : (
                <View style={[styles.logoPlaceholder, { backgroundColor: colors.primary }]}>
                  <Text style={styles.logoText}>{match.awayTeam.shortName}</Text>
                </View>
              )}
              <Text style={[styles.teamName, { color: '#1F2937' }]}>{match.awayTeam.name}</Text>
            </View>
          </View>
        </View>

        {(match.venue || match.referee) && (
          <View style={styles.infoCard}>
            {match.venue && (
              <View style={styles.infoRow}>
                <Ionicons name="location-outline" size={20} color={colors.primary} />
                <Text style={[styles.infoText, { color: '#1F2937' }]}>{match.venue}</Text>
              </View>
            )}
            {match.referee && (
              <View style={styles.infoRow}>
                <Ionicons name="person-outline" size={20} color={colors.primary} />
                <Text style={[styles.infoText, { color: '#1F2937' }]}>Trọng tài: {match.referee}</Text>
              </View>
            )}
          </View>
        )}

        {match.videoUrl && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: '#FFFFFF' }]}>Video trận đấu</Text>
            <TouchableOpacity
              style={styles.videoCard}
              onPress={() => handleOpenVideo(match.videoUrl)}
            >
              <Ionicons name="play-circle" size={40} color={colors.primary} />
              <Text style={[styles.videoButtonText, { color: '#1F2937' }]}>Xem video full trận</Text>
            </TouchableOpacity>
          </View>
        )}

        {match.highlightVideos && match.highlightVideos.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: '#FFFFFF' }]}>
              Highlights ({match.highlightVideos.length})
            </Text>
            <View style={styles.highlightsContainer}>
              {match.highlightVideos.map((highlight: any) => (
                <VideoPlayer
                  key={highlight._id}
                  uri={highlight.url}
                  title={highlight.title || 'Highlight'}
                />
              ))}
            </View>
          </View>
        )}

        {match.photos && match.photos.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: '#FFFFFF' }]}>
              Ảnh trận đấu ({match.photos.length})
            </Text>
            <View style={styles.photoGrid}>
              {match.photos.map((photo: string, index: number) => (
                <Image
                  key={index}
                  source={{ uri: photo }}
                  style={styles.photo}
                />
              ))}
            </View>
          </View>
        )}

        {match.notes && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: '#FFFFFF' }]}>📝 Ghi chú</Text>
            <Text style={[styles.notesText, { color: '#4B5563' }]}>{match.notes}</Text>
          </View>
        )}

        {isOwner && (
          <View style={styles.ownerActions}>
            <Text style={[styles.sectionTitle, { color: '#FFFFFF', marginBottom: 16 }]}>Sửa kết quả</Text>
            <TouchableOpacity
              style={[styles.primaryButton, { backgroundColor: colors.primary }]}
              onPress={() => router.push(`/match/${id}/update-result` as any)}
            >
              <Ionicons name="trophy-outline" size={20} color="#fff" />
              <Text style={styles.primaryButtonText}>
                {match.status === 'finished' ? 'Sửa kết quả' : 'Cập nhật kết quả'}
              </Text>
            </TouchableOpacity>
            
            <View style={styles.actionGrid}>
              <TouchableOpacity
                style={styles.smallButton}
                onPress={() => router.push(`/match/${id}/status` as any)}
              >
                <Ionicons name="swap-horizontal-outline" size={20} color={colors.primary} />
                <Text style={[styles.smallButtonText, { color: '#1F2937' }]}>Trạng thái</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.smallButton}
                onPress={() => router.push(`/match/${id}/upload-media` as any)}
              >
                <Ionicons name="cloud-upload-outline" size={20} color={colors.primary} />
                <Text style={[styles.smallButtonText, { color: '#1F2937' }]}>Upload</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.smallButton}
                onPress={() => router.push(`/match/${id}/actions` as any)}
              >
                <Ionicons name="ellipsis-horizontal" size={20} color={colors.primary} />
                <Text style={[styles.smallButtonText, { color: '#1F2937' }]}>Khác</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        <View style={styles.standingsSection}>
          <TouchableOpacity
            style={styles.standingsCard}
            onPress={() => router.push(`/league/${leagueId}/standings` as any)}
          >
            <Ionicons name="podium-outline" size={22} color={colors.primary} />
            <Text style={[styles.standingsButtonText, { color: '#1F2937' }]}>Xem Bảng xếp hạng</Text>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>
        </View>
        </ScrollView>
      </MatchBackground>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerButton: {
    padding: 5,
  },
  matchHeader: {
    alignItems: 'center',
    padding: 28,
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 24,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(214, 18, 64, 0.15)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 8,
  },
  round: {
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 20,
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: '#6B7280',
  },
  teamsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  teamSection: {
    flex: 1,
    alignItems: 'center',
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
  },
  logoPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  logoText: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '900',
  },
  teamName: {
    fontSize: 15,
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  scoreSection: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  scoreDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 14,
  },
  scoreNumber: {
    fontSize: 52,
    fontWeight: '900',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  scoreSep: {
    fontSize: 36,
    fontWeight: '600',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  statusFinished: {
    fontSize: 13,
    fontWeight: '600',
  },
  liveBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  liveText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  vsText: {
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  dateText: {
    fontSize: 13,
    textAlign: 'center',
  },
  infoCard: {
    borderRadius: 16,
    padding: 18,
    marginHorizontal: 16,
    marginBottom: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(214, 18, 64, 0.1)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  infoText: {
    fontSize: 14,
    marginLeft: 10,
    fontWeight: '500',
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
    letterSpacing: 0.3,
  },
  videoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    borderRadius: 16,
    gap: 10,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(214, 18, 64, 0.1)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  videoButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  photo: {
    width: '48%',
    height: 150,
    borderRadius: 12,
  },
  notesText: {
    fontSize: 14,
    lineHeight: 22,
  },
  highlightsContainer: {
    gap: 10,
  },
  ownerActions: {
    padding: 20,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 12,
    gap: 10,
    marginBottom: 16,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  actionGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  smallButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 12,
    gap: 6,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(214, 18, 64, 0.1)',
  },
  smallButtonText: {
    fontSize: 13,
    fontWeight: '600',
  },
  standingsSection: {
    padding: 20,
    paddingTop: 10,
  },
  standingsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    gap: 10,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(214, 18, 64, 0.1)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  standingsButtonText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
  },
});