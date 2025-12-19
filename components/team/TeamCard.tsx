import { Ionicons } from '@expo/vector-icons';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import React, { useRef, useState } from 'react';
import {
  Alert,
  Dimensions,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Colors } from '../../constants/theme';
import { useColorScheme } from '../../hooks/use-color-scheme';
import { teamService } from '../../services/team';
import { Team } from '../../types';

interface TeamCardProps {
  team: Team;
  onPress?: () => void;
  onEdit?: () => void;
  showActions?: boolean;
  leagueId?: string;
  isMenuOpen?: boolean;
  onToggleMenu?: () => void;
}

const SCREEN_HEIGHT = Dimensions.get('window').height;
const MENU_HEIGHT = 110; 

export default function TeamCard({
  team,
  onPress,
  onEdit,
  showActions = false,
  leagueId,
  isMenuOpen = false,
  onToggleMenu,
}: TeamCardProps) {
  const colors = Colors;
  const queryClient = useQueryClient();

  const cardRef = useRef<View>(null);
  const [openUpward, setOpenUpward] = useState(false);

  const deleteMutation = useMutation({
    mutationFn: () => teamService.deleteTeam(team._id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams', leagueId] });
      Alert.alert('Thành công', 'Đã xóa đội');
    },
    onError: (error: any) => {
      Alert.alert('Lỗi', error.response?.data?.message || 'Không thể xóa đội');
    },
  });

  const handleDelete = () => {
    Alert.alert('Xác nhận xóa', `Bạn có chắc chắn muốn xóa đội "${team.name}"?`, [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Xóa',
        style: 'destructive',
        onPress: () => deleteMutation.mutate(),
      },
    ]);
  };

  const handleToggleMenu = () => {
    cardRef.current?.measureInWindow((x, y, width, height) => {
      const spaceBelow = SCREEN_HEIGHT - (y + height);
      setOpenUpward(spaceBelow < MENU_HEIGHT);
      onToggleMenu?.();
    });
  };

  return (
    <TouchableOpacity
      ref={cardRef}
      activeOpacity={0.9}
      style={[
        styles.card,
        { backgroundColor: colors.card },
        isMenuOpen && { zIndex: 1001 },
      ]}
      onPress={onPress}
    >
      {team.logo ? (
        <Image source={{ uri: team.logo }} style={styles.logo} />
      ) : (
        <View
          style={[
            styles.logoPlaceholder,
            { backgroundColor: colors.primary },
          ]}
        >
          <Text style={styles.logoText}>{team.shortName}</Text>
        </View>
      )}

      <View style={styles.info}>
        <View style={styles.header}>
          <Text style={[styles.name, { color: colors.text }]}>
            {team.name}
          </Text>

          <View style={styles.headerRight}>
            {team.group && (
              <View
                style={[
                  styles.groupBadge,
                  { backgroundColor: colors.secondary },
                ]}
              >
                <Text style={styles.groupText}>Bảng {team.group}</Text>
              </View>
            )}

            {showActions && (
              <TouchableOpacity
                style={styles.menuButton}
                onPress={handleToggleMenu}
              >
                <Ionicons
                  name="ellipsis-vertical"
                  size={20}
                  color={colors.textSecondary}
                />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {isMenuOpen && showActions && (
          <View
            style={[
              styles.menu,
              {
                backgroundColor: colors.background,
                borderColor: colors.border,
                top: openUpward ? undefined : 40,
                bottom: openUpward ? 40 : undefined,
              },
            ]}
          >
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                onToggleMenu?.();
                onEdit?.();
              }}
            >
              <Ionicons
                name="create-outline"
                size={18}
                color={colors.primary}
              />
              <Text style={[styles.menuText, { color: colors.text }]}>
                Chỉnh sửa
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                onToggleMenu?.();
                handleDelete();
              }}
            >
              <Ionicons
                name="trash-outline"
                size={18}
                color={colors.lose}
              />
              <Text style={[styles.menuText, { color: colors.lose }]}>
                Xóa đội
              </Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.stats}>
          <Text
            style={[styles.statText, { color: colors.textSecondary }]}
          >
            {team.stats?.played || 0} trận •{' '}
            {team.stats?.points || 0} điểm
          </Text>

          {team.form && team.form.length > 0 && (
            <View style={styles.form}>
              {team.form.slice(-5).map((result, index) => (
                <View
                  key={index}
                  style={[
                    styles.formDot,
                    { backgroundColor: getFormColor(result, colors) },
                  ]}
                />
              ))}
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const getFormColor = (result: 'W' | 'D' | 'L', colors: any) => {
  switch (result) {
    case 'W':
      return colors.win;
    case 'D':
      return colors.draw;
    case 'L':
      return colors.lose;
  }
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    overflow: 'visible',
  },
  logo: {
    width: 50,
    height: 50,
    borderRadius: 8,
    marginRight: 15,
  },
  logoPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  logoText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  info: {
    flex: 1,
    overflow: 'visible',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  menuButton: {
    padding: 4,
  },
  menu: {
    position: 'absolute',
    right: 0,
    borderWidth: 1,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 10,
    zIndex: 9999,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    gap: 8,
    minWidth: 120,
  },
  menuText: {
    fontSize: 14,
  },
  groupBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  groupText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statText: {
    fontSize: 14,
  },
  form: {
    flexDirection: 'row',
    gap: 4,
  },
  formDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
});
