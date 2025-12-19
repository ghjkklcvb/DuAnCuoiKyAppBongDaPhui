import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import React from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

interface SearchFilterBarProps {
  searchQuery: string;
  onSearchChange: (text: string) => void;
  filterType: 'all' | 'round-robin' | 'group-stage';
  onTypeChange: (type: 'all' | 'round-robin' | 'group-stage') => void;
  filterStatus: 'all' | 'upcoming' | 'ongoing' | 'completed';
  onStatusChange: (status: 'all' | 'upcoming' | 'ongoing' | 'completed') => void;
}

export const SearchFilterBar = React.memo(function SearchFilterBar({
  searchQuery,
  onSearchChange,
  filterType,
  onTypeChange,
  filterStatus,
  onStatusChange,
}: SearchFilterBarProps) {
  const colors = Colors;

  return (
    <View style={styles.container}>
      <View style={[styles.searchContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Ionicons name="search" size={20} color={colors.textSecondary} />
        <TextInput
          style={[styles.searchInput, { color: colors.text }]}
          placeholder="Tìm kiếm giải đấu..."
          placeholderTextColor={colors.textSecondary}
          value={searchQuery}
          onChangeText={onSearchChange}
          autoCorrect={false}
          autoCapitalize="none"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => onSearchChange('')}>
            <Ionicons name="close-circle" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow}>
        <FilterChip
          label="Tất cả"
          active={filterType === 'all'}
          onPress={() => onTypeChange('all')}
          colors={colors}
        />
        <FilterChip
          label="Vòng tròn"
          active={filterType === 'round-robin'}
          onPress={() => onTypeChange('round-robin')}
          colors={colors}
        />
        <FilterChip
          label="Chia bảng"
          active={filterType === 'group-stage'}
          onPress={() => onTypeChange('group-stage')}
          colors={colors}
        />
      </ScrollView>

      {/* Status Filter */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow}>
        <FilterChip
          label="Tất cả"
          active={filterStatus === 'all'}
          onPress={() => onStatusChange('all')}
          colors={colors}
        />
        <FilterChip
          label="Sắp diễn ra"
          active={filterStatus === 'upcoming'}
          onPress={() => onStatusChange('upcoming')}
          colors={colors}
        />
        <FilterChip
          label="Đang diễn ra"
          active={filterStatus === 'ongoing'}
          onPress={() => onStatusChange('ongoing')}
          colors={colors}
        />
        <FilterChip
          label="Đã kết thúc"
          active={filterStatus === 'completed'}
          onPress={() => onStatusChange('completed')}
          colors={colors}
        />
      </ScrollView>
    </View>
  );
});

interface FilterChipProps {
  label: string;
  active: boolean;
  onPress: () => void;
  colors: any;
}

function FilterChip({ label, active, onPress, colors }: FilterChipProps) {
  return (
    <TouchableOpacity
      style={[
        styles.chip,
        { 
          borderColor: active ? colors.primary : 'rgba(255, 255, 255, 0.5)',
          backgroundColor: active ? colors.primary : 'rgba(255, 255, 255, 0.15)',
        },
      ]}
      onPress={onPress}
    >
      <Text style={[
        styles.chipText, 
        { color: '#FFFFFF' } // Always white text for readability on gradient
      ]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
  },
  filterRow: {
    marginBottom: 8,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
  },
  chipText: {
    fontSize: 14,
    fontWeight: '500',
  },
});
