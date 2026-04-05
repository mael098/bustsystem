import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSizes, BorderRadius, Shadow } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import type { Route } from '@/types';

interface RouteCardProps {
  route: Route | null;
  onStartMorning: () => void;
  onStartAfternoon: () => void;
  onEndRoute: () => void;
  studentsCount: number;
}

export function RouteCard({
  route,
  onStartMorning,
  onStartAfternoon,
  onEndRoute,
  studentsCount,
}: RouteCardProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const isRouteActive = route && route.status !== 'completed' && route.status !== 'not_started';
  const completedStops = route?.points.filter(p => p.completed).length ?? 0;
  const totalStops = route?.points.length ?? 0;

  const getRouteStatusText = () => {
    if (!route) return 'No active route';
    switch (route.status) {
      case 'morning_pickup':
        return 'Morning Pickup';
      case 'to_school':
        return 'Heading to School';
      case 'afternoon_pickup':
        return 'Afternoon Pickup';
      case 'returning_home':
        return 'Returning Home';
      case 'completed':
        return 'Route Completed';
      default:
        return 'Ready to Start';
    }
  };

  const getRouteStatusColor = () => {
    if (!route || route.status === 'not_started') return colors.textMuted;
    if (route.status === 'completed') return colors.success;
    return colors.primary;
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.card }, Shadow.medium]}>
      <View style={styles.header}>
        <View>
          <Text style={[styles.title, { color: colors.text }]}>
            {"Today's Route"}
          </Text>
          <Text style={[styles.date, { color: colors.textSecondary }]}>
            {new Date().toLocaleDateString('en-US', {
              weekday: 'long',
              month: 'short',
              day: 'numeric',
            })}
          </Text>
        </View>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: `${getRouteStatusColor()}20` },
          ]}
        >
          <View
            style={[styles.statusDot, { backgroundColor: getRouteStatusColor() }]}
          />
          <Text style={[styles.statusText, { color: getRouteStatusColor() }]}>
            {getRouteStatusText()}
          </Text>
        </View>
      </View>

      <View style={styles.stats}>
        <View style={styles.statItem}>
          <Ionicons name="people" size={24} color={colors.primary} />
          <Text style={[styles.statValue, { color: colors.text }]}>
            {studentsCount}
          </Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
            Students
          </Text>
        </View>

        <View style={[styles.statDivider, { backgroundColor: colors.border }]} />

        <View style={styles.statItem}>
          <Ionicons name="location" size={24} color={colors.warning} />
          <Text style={[styles.statValue, { color: colors.text }]}>
            {isRouteActive ? `${completedStops}/${totalStops}` : totalStops}
          </Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
            Stops
          </Text>
        </View>

        <View style={[styles.statDivider, { backgroundColor: colors.border }]} />

        <View style={styles.statItem}>
          <Ionicons name="time" size={24} color={colors.success} />
          <Text style={[styles.statValue, { color: colors.text }]}>
            {isRouteActive ? 'Active' : '--'}
          </Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
            Status
          </Text>
        </View>
      </View>

      <View style={styles.actions}>
        {!isRouteActive ? (
          <>
            <TouchableOpacity
              onPress={onStartMorning}
              style={[styles.actionButton, { backgroundColor: colors.primary }]}
            >
              <Ionicons name="sunny-outline" size={20} color="#FFFFFF" />
              <Text style={styles.actionText}>Start Morning Route</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={onStartAfternoon}
              style={[styles.actionButton, { backgroundColor: colors.warning }]}
            >
              <Ionicons name="partly-sunny-outline" size={20} color="#FFFFFF" />
              <Text style={styles.actionText}>Start Afternoon Route</Text>
            </TouchableOpacity>
          </>
        ) : (
          <TouchableOpacity
            onPress={onEndRoute}
            style={[styles.actionButton, styles.endButton, { backgroundColor: colors.error }]}
          >
            <Ionicons name="stop-circle-outline" size={20} color="#FFFFFF" />
            <Text style={styles.actionText}>End Route</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.lg,
  },
  title: {
    fontSize: FontSizes.xl,
    fontWeight: '700',
  },
  date: {
    fontSize: FontSizes.sm,
    marginTop: Spacing.xs,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.full,
    gap: Spacing.xs,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: FontSizes.sm,
    fontWeight: '500',
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  statItem: {
    alignItems: 'center',
    gap: Spacing.xs,
  },
  statValue: {
    fontSize: FontSizes.xl,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: FontSizes.xs,
  },
  statDivider: {
    width: 1,
    height: 40,
  },
  actions: {
    gap: Spacing.sm,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    gap: Spacing.sm,
  },
  endButton: {
    marginTop: Spacing.sm,
  },
  actionText: {
    color: '#FFFFFF',
    fontSize: FontSizes.md,
    fontWeight: '600',
  },
});
