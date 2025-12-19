import { Ionicons } from '@expo/vector-icons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, Image, ScrollView, StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../../../constants/theme';
import { useColorScheme } from '../../../hooks/use-color-scheme';
import { matchService } from '../../../services/match';
import MatchBackground from '../../../components/match/MatchBackground';

export default function UpdateResultScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const colors = Colors;

  const { data: match } = useQuery({
    queryKey: ['match', id],
    queryFn: () => matchService.getMatchById(id as string),
  });

  const [homeScore, setHomeScore] = useState('0');
  const [awayScore, setAwayScore] = useState('0');

  useEffect(() => {
    if (match) {
      setHomeScore(match.score?.home?.toString() || '0');
      setAwayScore(match.score?.away?.toString() || '0');
    }
  }, [match]);

  const updateMutation = useMutation({
    mutationFn: (data: { homeScore: number; awayScore: number }) =>
      matchService.updateMatchResult(id as string, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['match', id] });
      queryClient.invalidateQueries({ queryKey: ['matches'] });
      queryClient.invalidateQueries({ queryKey: ['teams'] });
      queryClient.invalidateQueries({ queryKey: ['standings'] });
      queryClient.invalidateQueries({ queryKey: ['group-standings'] });
      queryClient.invalidateQueries({ queryKey: ['statistics'] });
      queryClient.invalidateQueries({ queryKey: ['league'] });
      
      Alert.alert(
        '✓ Thành công',
        'Đã cập nhật kết quả. Stats của các đội đã được tính tự động.',
        [{ text: 'OK', onPress: () => router.back() }]
      );
    },
    onError: (error: any) => {
      Alert.alert('✕ Lỗi', error.response?.data?.message || 'Không thể cập nhật kết quả');
    },
  });

  const handleSubmit = () => {
    const home = parseInt(homeScore);
    const away = parseInt(awayScore);

    if (isNaN(home) || isNaN(away) || home < 0 || away < 0) {
      Alert.alert('✕ Lỗi', 'Vui lòng nhập tỷ số hợp lệ');
      return;
    }

    Alert.alert(
      'Xác nhận cập nhật',
      `Tỷ số: ${match?.homeTeam.name} ${home} - ${away} ${match?.awayTeam.name}\n\nStats của các đội sẽ được tính tự động. Tiếp tục?`,
      [
        { text: 'Hủy', style: 'cancel' },
        { 
          text: 'Xác nhận', 
          onPress: () => updateMutation.mutate({ homeScore: home, awayScore: away }),
          style: 'default'
        }
      ]
    );
  };

  return (
    <>
      <StatusBar 
        backgroundColor="rgba(214, 18, 64, 1)"
        barStyle="light-content"
      />
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: 'Cập nhật kết quả',
          headerStyle: { 
            backgroundColor: 'rgba(214, 18, 64, 1)',
          },
          headerTintColor: '#FFFFFF',
          headerTitleStyle: {
            color: '#FFFFFF',
            fontWeight: '700',
            fontSize: 18,
          },
        }}
      />
      
      <MatchBackground>
        <ScrollView 
          style={styles.container}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.scoreboardCard}>
            <View style={styles.matchHeader}>
              <Ionicons name="football" size={16} color="rgba(214, 18, 64, 0.7)" />
              <Text style={styles.matchLabel}>TRẬN ĐẤU</Text>
              <View style={styles.roundBadge}>
                <Text style={styles.roundText}>Vòng {match?.round}</Text>
              </View>
            </View>
            
            <View style={styles.teamsContainer}>
              <View style={styles.teamSection}>
                {match?.homeTeam.logo ? (
                  <Image source={{ uri: match.homeTeam.logo }} style={styles.teamLogo} />
                ) : (
                  <View style={[styles.teamLogoPlaceholder, { backgroundColor: colors.primary }]}>
                    <Text style={styles.teamLogoText}>{match?.homeTeam.shortName}</Text>
                  </View>
                )}
                <Text style={styles.teamName} numberOfLines={2}>
                  {match?.homeTeam.name}
                </Text>
                
                <View style={styles.scoreInputSection}>
                  <TouchableOpacity
                    style={styles.scoreButton}
                    onPress={() => setHomeScore(String(Math.max(0, parseInt(homeScore) - 1)))}
                    activeOpacity={0.6}
                  >
                    <Ionicons name="remove-circle" size={32} color="rgba(214, 18, 64, 0.8)" />
                  </TouchableOpacity>
                  
                  <TextInput
                    style={styles.scoreInput}
                    value={homeScore}
                    onChangeText={setHomeScore}
                    keyboardType="number-pad"
                    maxLength={2}
                    selectTextOnFocus
                  />
                  
                  <TouchableOpacity
                    style={styles.scoreButton}
                    onPress={() => setHomeScore(String(parseInt(homeScore) + 1))}
                    activeOpacity={0.6}
                  >
                    <Ionicons name="add-circle" size={32} color="rgba(214, 18, 64, 0.8)" />
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.vsDivider}>
                <View style={styles.vsCircle}>
                  <Text style={styles.vsText}>VS</Text>
                </View>
                <View style={styles.scoreLine} />
              </View>

              <View style={styles.teamSection}>
                {match?.awayTeam.logo ? (
                  <Image source={{ uri: match.awayTeam.logo }} style={styles.teamLogo} />
                ) : (
                  <View style={[styles.teamLogoPlaceholder, { backgroundColor: colors.primary }]}>
                    <Text style={styles.teamLogoText}>{match?.awayTeam.shortName}</Text>
                  </View>
                )}
                <Text style={styles.teamName} numberOfLines={2}>
                  {match?.awayTeam.name}
                </Text>
                
                <View style={styles.scoreInputSection}>
                  <TouchableOpacity
                    style={styles.scoreButton}
                    onPress={() => setAwayScore(String(Math.max(0, parseInt(awayScore) - 1)))}
                    activeOpacity={0.6}
                  >
                    <Ionicons name="remove-circle" size={32} color="rgba(214, 18, 64, 0.8)" />
                  </TouchableOpacity>
                  
                  <TextInput
                    style={styles.scoreInput}
                    value={awayScore}
                    onChangeText={setAwayScore}
                    keyboardType="number-pad"
                    maxLength={2}
                    selectTextOnFocus
                  />
                  
                  <TouchableOpacity
                    style={styles.scoreButton}
                    onPress={() => setAwayScore(String(parseInt(awayScore) + 1))}
                    activeOpacity={0.6}
                  >
                    <Ionicons name="add-circle" size={32} color="rgba(214, 18, 64, 0.8)" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>

          <View style={styles.infoCard}>
            <View style={styles.infoHeader}>
              <View style={styles.iconCircle}>
                <Ionicons name="calculator-outline" size={18} color="#fff" />
              </View>
              <Text style={styles.infoTitle}>Tính toán tự động</Text>
            </View>
            
            <View style={styles.infoContent}>
              <View style={styles.infoRow}>
                <Ionicons name="checkmark-circle" size={16} color="rgba(214, 18, 64, 0.7)" />
                <Text style={styles.infoText}>Điểm: Thắng +3, Hòa +1, Thua 0</Text>
              </View>
              <View style={styles.infoRow}>
                <Ionicons name="checkmark-circle" size={16} color="rgba(214, 18, 64, 0.7)" />
                <Text style={styles.infoText}>Stats: Played, Won, Drawn, Lost</Text>
              </View>
              <View style={styles.infoRow}>
                <Ionicons name="checkmark-circle" size={16} color="rgba(214, 18, 64, 0.7)" />
                <Text style={styles.infoText}>Goals: For, Against, Difference</Text>
              </View>
              <View style={styles.infoRow}>
                <Ionicons name="checkmark-circle" size={16} color="rgba(214, 18, 64, 0.7)" />
                <Text style={styles.infoText}>Form: W/D/L (5 trận gần nhất)</Text>
              </View>
            </View>
          </View>

          <TouchableOpacity
            style={[
              styles.submitButton,
              updateMutation.isPending && styles.submitButtonDisabled
            ]}
            onPress={handleSubmit}
            disabled={updateMutation.isPending}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['rgba(214, 18, 64, 1)', 'rgba(180, 15, 54, 1)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.submitGradient}
            >
              {updateMutation.isPending ? (
                <>
                  <Ionicons name="hourglass-outline" size={20} color="#fff" />
                  <Text style={styles.submitText}>Đang cập nhật...</Text>
                </>
              ) : (
                <>
                  <Ionicons name="checkmark-circle" size={20} color="#fff" />
                  <Text style={styles.submitText}>Cập nhật kết quả</Text>
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </ScrollView>
      </MatchBackground>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },

  scoreboardCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.98)',
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    shadowColor: 'rgba(214, 18, 64, 0.25)',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
    borderWidth: 1,
    borderColor: 'rgba(214, 18, 64, 0.08)',
  },
  matchHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(214, 18, 64, 0.1)',
  },
  matchLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.5,
    color: 'rgba(214, 18, 64, 0.7)',
    textTransform: 'uppercase',
  },
  roundBadge: {
    backgroundColor: 'rgba(214, 18, 64, 0.08)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 'auto',
  },
  roundText: {
    fontSize: 10,
    fontWeight: '700',
    color: 'rgba(214, 18, 64, 0.9)',
    letterSpacing: 0.5,
  },
  teamsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  
  teamSection: {
    flex: 1,
    alignItems: 'center',
    gap: 10,
  },
  teamLogo: {
    width: 64,
    height: 64,
    borderRadius: 16,
    borderWidth: 2.5,
    borderColor: 'rgba(214, 18, 64, 0.15)',
    backgroundColor: '#fff',
  },
  teamLogoPlaceholder: {
    width: 64,
    height: 64,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2.5,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  teamLogoText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  teamName: {
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 17,
    color: '#1F2937',
    minHeight: 34,
  },
  
  scoreInputSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
  },
  scoreButton: {
    padding: 2,
  },
  scoreInput: {
    width: 64,
    height: 64,
    backgroundColor: 'rgba(214, 18, 64, 1)',
    borderRadius: 16,
    fontSize: 36,
    fontWeight: '900',
    textAlign: 'center',
    color: '#FFFFFF',
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.25)',
    shadowColor: 'rgba(214, 18, 64, 0.6)',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  
  vsDivider: {
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 4,
  },
  vsCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(214, 18, 64, 1)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: 'rgba(214, 18, 64, 0.5)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.9)',
  },
  vsText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 1,
  },
  scoreLine: {
    width: 2,
    height: 40,
    backgroundColor: 'rgba(214, 18, 64, 0.15)',
  },
  
  infoCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 20,
    padding: 18,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(214, 18, 64, 0.08)',
    shadowColor: 'rgba(214, 18, 64, 0.15)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 6,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 14,
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(214, 18, 64, 1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1F2937',
    letterSpacing: 0.3,
  },
  infoContent: {
    gap: 10,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  infoText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#4B5563',
    lineHeight: 18,
    flex: 1,
  },
  
  submitButton: {
    borderRadius: 18,
    overflow: 'hidden',
    shadowColor: 'rgba(214, 18, 64, 0.5)',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 10,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 18,
    paddingHorizontal: 24,
  },
  submitText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
});