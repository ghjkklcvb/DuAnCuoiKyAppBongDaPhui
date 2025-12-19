import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';

export function SkeletonLeagueCard() {
  const colors = Colors;
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const opacity = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={styles.header}>
        <Animated.View
          style={[
            styles.logo,
            { backgroundColor: colors.surface, opacity },
          ]}
        />
        <View style={styles.headerText}>
          <Animated.View
            style={[
              styles.titleSkeleton,
              { backgroundColor: colors.surface, opacity },
            ]}
          />
          <Animated.View
            style={[
              styles.subtitleSkeleton,
              { backgroundColor: colors.surface, opacity },
            ]}
          />
        </View>
      </View>

      <View style={styles.stats}>
        <Animated.View
          style={[
            styles.statSkeleton,
            { backgroundColor: colors.surface, opacity },
          ]}
        />
        <Animated.View
          style={[
            styles.statSkeleton,
            { backgroundColor: colors.surface, opacity },
          ]}
        />
        <Animated.View
          style={[
            styles.statSkeleton,
            { backgroundColor: colors.surface, opacity },
          ]}
        />
      </View>
    </View>
  );
}

export function SkeletonMatchCard() {
  const colors = Colors;
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const opacity = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={styles.matchHeader}>
        <Animated.View
          style={[
            styles.roundSkeleton,
            { backgroundColor: colors.surface, opacity },
          ]}
        />
        <Animated.View
          style={[
            styles.dateSkeleton,
            { backgroundColor: colors.surface, opacity },
          ]}
        />
      </View>

      <View style={styles.matchContent}>
        <View style={styles.team}>
          <Animated.View
            style={[
              styles.teamLogo,
              { backgroundColor: colors.surface, opacity },
            ]}
          />
          <Animated.View
            style={[
              styles.teamName,
              { backgroundColor: colors.surface, opacity },
            ]}
          />
        </View>

        <Animated.View
          style={[
            styles.scoreSkeleton,
            { backgroundColor: colors.surface, opacity },
          ]}
        />

        <View style={styles.team}>
          <Animated.View
            style={[
              styles.teamLogo,
              { backgroundColor: colors.surface, opacity },
            ]}
          />
          <Animated.View
            style={[
              styles.teamName,
              { backgroundColor: colors.surface, opacity },
            ]}
          />
        </View>
      </View>
    </View>
  );
}

export function SkeletonTeamCard() {
  const colors = Colors;
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const opacity = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={styles.teamCard}>
        <Animated.View
          style={[
            styles.teamLogo,
            { backgroundColor: colors.surface, opacity },
          ]}
        />
        <View style={styles.teamInfo}>
          <Animated.View
            style={[
              styles.teamNameLarge,
              { backgroundColor: colors.surface, opacity },
            ]}
          />
          <Animated.View
            style={[
              styles.teamShortName,
              { backgroundColor: colors.surface, opacity },
            ]}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  logo: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  headerText: {
    flex: 1,
  },
  titleSkeleton: {
    height: 20,
    borderRadius: 4,
    marginBottom: 8,
    width: '70%',
  },
  subtitleSkeleton: {
    height: 14,
    borderRadius: 4,
    width: '50%',
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statSkeleton: {
    height: 16,
    borderRadius: 4,
    width: '30%',
  },
  matchHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  roundSkeleton: {
    height: 16,
    borderRadius: 4,
    width: 80,
  },
  dateSkeleton: {
    height: 14,
    borderRadius: 4,
    width: 100,
  },
  matchContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  team: {
    alignItems: 'center',
    flex: 1,
  },
  teamLogo: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginBottom: 8,
  },
  teamName: {
    height: 14,
    borderRadius: 4,
    width: '80%',
  },
  scoreSkeleton: {
    height: 28,
    borderRadius: 6,
    width: 60,
    marginHorizontal: 12,
  },
  teamCard: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  teamInfo: {
    flex: 1,
    marginLeft: 12,
  },
  teamNameLarge: {
    height: 18,
    borderRadius: 4,
    width: '70%',
    marginBottom: 8,
  },
  teamShortName: {
    height: 14,
    borderRadius: 4,
    width: '30%',
  },
});
