import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSizes, BorderRadius, Shadow } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { StatusBadge } from '@/components/ui/StatusBadge';
import type { Student, Location } from '@/types';

interface TrackingInfoProps {
  student: Student;
  driverLocation: Location | null;
  isDriverOnRoute: boolean;
}

export function TrackingInfo({ student, driverLocation, isDriverOnRoute }: TrackingInfoProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  // Calculate estimated time (mock calculation)
  const getEstimatedTime = () => {
    if (!isDriverOnRoute || !driverLocation) return '--';
    
    // Simple mock calculation based on status
    switch (student.status) {
      case 'home':
        return '~10 min';
      case 'picked_up':
        return '~15 min';
      case 'at_school':
        return 'At destination';
      case 'returning':
        return '~12 min';
      case 'delivered':
        return 'Arrived';
      default:
        return '--';
    }
  };

  const getProgressSteps = () => {
    const steps = [
      { label: 'Waiting', icon: 'home' as const, completed: student.status !== 'home' },
      { label: 'Picked Up', icon: 'enter' as const, completed: ['picked_up', 'in_transit', 'at_school', 'returning', 'delivered'].includes(student.status) },
      { label: 'In Transit', icon: 'bus' as const, completed: ['at_school', 'returning', 'delivered'].includes(student.status) },
      { label: 'Arrived', icon: 'checkmark-circle' as const, completed: ['at_school', 'delivered'].includes(student.status) },
    ];
    return steps;
  };

  const steps = getProgressSteps();

  return (
    <View style={[styles.container, { backgroundColor: colors.card }, Shadow.medium]}>
      {/* Student Info Header */}
      <View style={styles.header}>
        <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
          <Text style={styles.avatarText}>
            {student.name.split(' ').map(n => n[0]).join('')}
          </Text>
        </View>
        <View style={styles.headerInfo}>
          <Text style={[styles.name, { color: colors.text }]}>{student.name}</Text>
          <Text style={[styles.school, { color: colors.textSecondary }]}>
            {student.school.name}
          </Text>
        </View>
        <StatusBadge status={student.status} size="md" />
      </View>

      {/* Progress Steps */}
      <View style={styles.progressContainer}>
        {steps.map((step, index) => (
          <View key={step.label} style={styles.stepWrapper}>
            <View style={styles.stepContent}>
              <View
                style={[
                  styles.stepCircle,
                  {
                    backgroundColor: step.completed ? colors.success : colors.backgroundSecondary,
                    borderColor: step.completed ? colors.success : colors.border,
                  },
                ]}
              >
                <Ionicons
                  name={step.icon}
                  size={16}
                  color={step.completed ? '#FFFFFF' : colors.textMuted}
                />
              </View>
              <Text
                style={[
                  styles.stepLabel,
                  { color: step.completed ? colors.text : colors.textMuted },
                ]}
              >
                {step.label}
              </Text>
            </View>
            {index < steps.length - 1 && (
              <View
                style={[
                  styles.stepLine,
                  { backgroundColor: step.completed ? colors.success : colors.border },
                ]}
              />
            )}
          </View>
        ))}
      </View>

      {/* Estimated Time */}
      <View style={[styles.etaContainer, { backgroundColor: colors.backgroundSecondary }]}>
        <Ionicons name="time-outline" size={20} color={colors.primary} />
        <View style={styles.etaInfo}>
          <Text style={[styles.etaLabel, { color: colors.textSecondary }]}>
            Estimated Arrival
          </Text>
          <Text style={[styles.etaTime, { color: colors.text }]}>
            {getEstimatedTime()}
          </Text>
        </View>
        {isDriverOnRoute && (
          <View style={[styles.liveIndicator, { backgroundColor: colors.success }]}>
            <View style={styles.liveDot} />
            <Text style={styles.liveText}>LIVE</Text>
          </View>
        )}
      </View>

      {/* Destination */}
      <View style={styles.destinationContainer}>
        <View style={styles.destinationRow}>
          <Ionicons name="navigate" size={18} color={colors.primary} />
          <Text style={[styles.destinationLabel, { color: colors.textSecondary }]}>
            {student.status === 'returning' || student.status === 'delivered' ? 'Home' : 'School'}
          </Text>
        </View>
        <Text style={[styles.destinationAddress, { color: colors.text }]} numberOfLines={2}>
          {student.status === 'returning' || student.status === 'delivered'
            ? student.homeAddress
            : student.school.address}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: FontSizes.md,
    fontWeight: '600',
  },
  headerInfo: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  name: {
    fontSize: FontSizes.lg,
    fontWeight: '600',
  },
  school: {
    fontSize: FontSizes.sm,
    marginTop: 2,
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.lg,
  },
  stepWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  stepContent: {
    alignItems: 'center',
  },
  stepCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xs,
  },
  stepLabel: {
    fontSize: FontSizes.xs,
    textAlign: 'center',
  },
  stepLine: {
    flex: 1,
    height: 2,
    marginTop: 15,
    marginHorizontal: 4,
  },
  etaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.md,
  },
  etaInfo: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  etaLabel: {
    fontSize: FontSizes.xs,
  },
  etaTime: {
    fontSize: FontSizes.lg,
    fontWeight: '700',
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: BorderRadius.full,
    gap: 4,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FFFFFF',
  },
  liveText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  destinationContainer: {
    gap: Spacing.xs,
  },
  destinationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  destinationLabel: {
    fontSize: FontSizes.sm,
  },
  destinationAddress: {
    fontSize: FontSizes.md,
    marginLeft: Spacing.lg + 2,
  },
});
