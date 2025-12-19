import { Ionicons } from '@expo/vector-icons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Alert, Image, ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import TeamBackground from '../../components/team/TeamBackground';
import { Colors } from '../../constants/theme';
import { useAuth } from '../../contexts/AuthContext';
import { teamService } from '../../services/team';

export default function TeamDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const colors = Colors;

  const { data: team, isLoading } = useQuery({
    queryKey: ['team', id],
    queryFn: () => teamService.getTeamById(id as string),
  });

  const isOwner = user?._id === team?.league?.owner;

  const deleteMutation = useMutation({
    mutationFn: () => teamService.deleteTeam(id as string),
    onSuccess: () => {
      const leagueId = team?.league?._id;
      
      queryClient.invalidateQueries({ queryKey: ['teams'] });
      if (leagueId) {
        queryClient.invalidateQueries({ queryKey: ['league', leagueId] }); 
        queryClient.invalidateQueries({ queryKey: ['standings', leagueId] });
        queryClient.invalidateQueries({ queryKey: ['group-standings', leagueId] });
        queryClient.invalidateQueries({ queryKey: ['matches', leagueId] }); 
        queryClient.invalidateQueries({ queryKey: ['statistics', leagueId] });
      }
      
      Alert.alert('Thành công', 'Đã xóa đội', [
        { 
          text: 'OK', 
          onPress: () => router.back()
        }
      ]);
    },
    onError: (error: any) => {
      Alert.alert('Lỗi', error.response?.data?.message || 'Không thể xóa đội');
    },
  });

  const handleDelete = () => {
    Alert.alert(
      'Xác nhận xóa',
      'Bạn có chắc chắn muốn xóa đội "' + team?.name + '"? Hành động này không thể hoàn tác.',
      [
        { text: 'Hủy', style: 'cancel' },
        { 
          text: 'Xóa', 
          style: 'destructive',
          onPress: () => deleteMutation.mutate()
        }
      ]
    );
  };

  if (isLoading) {
    return (
      <View style={[styles.loading, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.text }}>Đang tải...</Text>
      </View>
    );
  }

  return (
    <>
      <StatusBar 
        backgroundColor="transparent"
        translucent
        barStyle="light-content"
      />
      <Stack.Screen
        options={{
          headerShown: true,
          headerTransparent: true,
          headerTitle: '',
          headerTintColor: '#FFFFFF',
          headerRight: () => isOwner ? (
            <TouchableOpacity
              onPress={() => router.push(`/team/${id}/edit` as any)}
              style={styles.editButton}
            >
              <Ionicons name="create-outline" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          ) : null,
        }}
      />
      
      <TeamBackground>
        <ScrollView style={styles.container} contentContainerStyle={{ paddingTop: 100 }}>
        
        {/* --- PHẦN 1: THẺ TO (HEADER) - MÀU TRONG TỐI (DARK GLASS) --- */}
        <View style={styles.headerCardDark}>
          {team?.logo ? (
            <Image source={{ uri: team.logo }} style={styles.logo} />
          ) : (
            <View style={[styles.logoPlaceholder, { backgroundColor: 'rgba(255, 255, 255, 0.1)', borderColor: 'rgba(255,255,255,0.2)' }]}>
              <Text style={[styles.logoText, { color: '#FFFFFF' }]}>
                {team?.shortName}
              </Text>
            </View>
          )}
          
          <Text style={[styles.teamName, { color: '#FFFFFF' }]}>{team?.name}</Text>
          <Text style={[styles.teamShortName, { color: 'rgba(255, 255, 255, 0.7)' }]}>
            {team?.shortName}
          </Text>
          
          {team?.group && (
            <View style={styles.groupBadge}>
              <Ionicons name="grid" size={12} color="#FFFFFF" />
              <Text style={styles.groupText}>
                Bảng {team.group}
              </Text>
            </View>
          )}
        </View>

        {/* --- PHẦN 2: 3 THẺ NHỎ (STATS) - MÀU TRONG TỐI (DARK GLASS) --- */}
        <View style={styles.statsRow}>
          <View style={styles.statItemDark}>
            <View style={[styles.iconContainer, { backgroundColor: 'rgba(255, 255, 255, 0.1)' }]}>
                <Ionicons name="football-outline" size={20} color="#FFFFFF" />
            </View>
            <Text style={[styles.statValue, { color: '#FFFFFF' }]}>
              {team?.stats?.played || 0}
            </Text>
            <Text style={[styles.statLabel, { color: 'rgba(255, 255, 255, 0.7)' }]}>
              Trận đấu
            </Text>
          </View>

          <View style={styles.statItemDark}>
             <View style={[styles.iconContainer, { backgroundColor: 'rgba(16, 185, 129, 0.2)' }]}>
                <Ionicons name="trophy-outline" size={20} color="#4ADE80" />
             </View>
            <Text style={[styles.statValue, { color: '#FFFFFF' }]}>
              {team?.stats?.won || 0}
            </Text>
            <Text style={[styles.statLabel, { color: 'rgba(255, 255, 255, 0.7)' }]}>
              Thắng
            </Text>
          </View>

          <View style={styles.statItemDark}>
            <View style={[styles.iconContainer, { backgroundColor: 'rgba(214, 18, 64, 0.2)' }]}>
                <Ionicons name="star-outline" size={20} color="#F87171" />
            </View>
            <Text style={[styles.statValue, { color: '#FFFFFF' }]}>
              {team?.stats?.points || 0}
            </Text>
            <Text style={[styles.statLabel, { color: 'rgba(255, 255, 255, 0.7)' }]}>
              Điểm
            </Text>
          </View>
        </View>

        {/* --- PHẦN 3: CÁC THẺ DƯỚI - MÀU TRẮNG GỐC (SOLID WHITE) --- */}

        {team?.form && team.form.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>
                Phong độ gần đây
              </Text>
            </View>
            <View style={styles.cardWhite}>
              <View style={styles.formRow}>
                {team.form.slice(-5).map((result: 'W' | 'D' | 'L', index: number) => (
                  <View key={index} style={styles.formItem}>
                    <View style={[
                      styles.formCircle,
                      { 
                        backgroundColor: getFormColor(result, colors) + '20',
                        borderColor: getFormColor(result, colors),
                      }
                    ]}>
                      <Text style={[styles.formText, { color: getFormColor(result, colors) }]}>
                        {result}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          </View>
        )}

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              Thống kê chi tiết
            </Text>
          </View>
          
          <View style={styles.cardWhite}>
            <StatsRow icon="checkmark-circle-outline" label="Thắng" value={team?.stats?.won || 0} color={colors.win} colors={colors} />
            <StatsRow icon="remove-circle-outline" label="Hòa" value={team?.stats?.drawn || 0} color={colors.draw} colors={colors} />
            <StatsRow icon="close-circle-outline" label="Thua" value={team?.stats?.lost || 0} color={colors.lose} colors={colors} />
            <StatsRow icon="arrow-up-circle-outline" label="Bàn thắng" value={team?.stats?.goalsFor || 0} color={colors.primary} colors={colors} />
            <StatsRow icon="arrow-down-circle-outline" label="Bàn thua" value={team?.stats?.goalsAgainst || 0} color="#6B7280" colors={colors} />
            <StatsRow 
              icon="swap-horizontal-outline" 
              label="Hiệu số" 
              value={team?.stats?.goalDifference || 0} 
              color={team?.stats?.goalDifference && team.stats.goalDifference > 0 ? colors.win : colors.lose} 
              colors={colors}
              isLast
            />
          </View>
        </View>

        {isOwner && (
          <View style={styles.section}>
            <View style={styles.dangerCardWhite}>
              <View style={styles.dangerHeader}>
                <View style={styles.dangerIconBox}>
                    <Ionicons name="warning" size={20} color="#DC2626" />
                </View>
                <Text style={styles.dangerTitle}>Vùng nguy hiểm</Text>
              </View>
              
              <Text style={styles.dangerDescription}>
                Xóa đội sẽ xóa tất cả dữ liệu liên quan bao gồm thống kê, lịch sử thi đấu và không thể khôi phục.
              </Text>

              <TouchableOpacity
                style={[
                  styles.deleteButton,
                  deleteMutation.isPending && styles.deleteButtonDisabled
                ]}
                onPress={handleDelete}
                disabled={deleteMutation.isPending}
                activeOpacity={0.7}
              >
                <Ionicons 
                  name={deleteMutation.isPending ? "hourglass-outline" : "trash-outline"} 
                  size={18} 
                  color="#FFFFFF" 
                />
                <Text style={styles.deleteButtonText}>
                  {deleteMutation.isPending ? 'Đang xóa...' : 'Xóa đội vĩnh viễn'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
      </TeamBackground>
    </>
  );
}

const StatsRow = ({ icon, label, value, color, colors, isLast }: any) => (
  <View style={[
    styles.statsRowItem,
    !isLast && { borderBottomWidth: 1, borderBottomColor: '#F3F4F6' } // Divider nhạt cho nền trắng
  ]}>
    <View style={styles.statsRowLeft}>
      <View style={[styles.statsIconBox, { backgroundColor: color + '15' }]}>
        <Ionicons name={icon} size={18} color={color} />
      </View>
      <Text style={[styles.statsRowLabel, { color: '#374151' }]}>{label}</Text>
    </View>
    <Text style={[styles.statsRowValue, { color: '#111827' }]}>{value}</Text>
  </View>
);

const getFormColor = (result: 'W' | 'D' | 'L', colors: any) => {
  switch (result) {
    case 'W': return colors.win;
    case 'D': return colors.draw;
    case 'L': return colors.lose;
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editButton: {
    padding: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20,
    marginRight: 4,
  },
  
  // --- DARK GLASS STYLES (HEADER & STATS) ---
  headerCardDark: {
    alignItems: 'center',
    padding: 24,
    marginHorizontal: 16,
    marginBottom: 20,
    borderRadius: 24,
    // Dark Glass
    backgroundColor: 'rgba(131, 38, 38, 0.427)', // Nền đen trong suốt
    borderWidth: 1,
    borderColor: 'rgba(176, 117, 120, 0.6)', // Viền sáng mờ
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
  },
  logo: {
    width: 90,
    height: 90,
    borderRadius: 20,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  logoPlaceholder: {
    width: 90,
    height: 90,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 2,
  },
  logoText: {
    fontSize: 32,
    fontWeight: '800',
  },
  teamName: {
    fontSize: 24,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 4,
    // Màu chữ đã set inline style là #FFFFFF
  },
  teamShortName: {
    fontSize: 15,
    marginBottom: 16,
    fontWeight: '500',
  },
  groupBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: Colors.primary,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  groupText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  statsRow: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  statItemDark: {
    flex: 1,
    padding: 16,
    borderRadius: 20,
    alignItems: 'center',
    gap: 8,
    // Dark Glass
    backgroundColor: 'rgba(132, 53, 53, 0.456)', // Nền đen trong suốt
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statValue: {
    fontSize: 22,
    fontWeight: '800',
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },

  // --- SOLID WHITE STYLES (BOTTOM CARDS) ---
  section: {
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  sectionHeader: {
    marginBottom: 10,
    paddingLeft: 4,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.9)',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  cardWhite: {
    padding: 8,
    borderRadius: 20,
    // Solid White
    backgroundColor: '#FFFFFF',
    borderWidth: 0, // Không cần viền kính
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    overflow: 'hidden',
  },

  formRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 16,
    gap: 8,
  },
  formItem: {
    flex: 1,
    alignItems: 'center',
  },
  formCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  formText: {
    fontSize: 16,
    fontWeight: '800',
  },

  statsRowItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  statsRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  statsIconBox: {
    width: 32,
    height: 32,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsRowLabel: {
    fontSize: 15,
    fontWeight: '500',
  },
  statsRowValue: {
    fontSize: 16,
    fontWeight: '700',
  },

  dangerCardWhite: {
    backgroundColor: '#FFFFFF', // Nền trắng gốc
    borderRadius: 20,
    padding: 20,
    shadowColor: '#DC2626',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  dangerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  dangerIconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: 'rgba(220, 38, 38, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dangerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#DC2626',
  },
  dangerDescription: {
    fontSize: 13,
    lineHeight: 20,
    color: '#6B7280',
    marginBottom: 20,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 14,
    backgroundColor: '#DC2626',
    shadowColor: '#DC2626',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  deleteButtonDisabled: {
    opacity: 0.6,
  },
  deleteButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});