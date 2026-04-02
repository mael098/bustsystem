import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSizes, BorderRadius, Shadow } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { StatusBadge } from '@/components/ui/StatusBadge';
import type { Student } from '@/types';

interface StudentCardProps {
  student: Student;
  onPress?: () => void;
  onPickup?: () => void;
  onDropoff?: () => void;
  showActions?: boolean;
  compact?: boolean;
}

export function StudentCard({
  student,
  onPress,
  onPickup,
  onDropoff,
  showActions = false,
  compact = false,
}: StudentCardProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const canPickup = student.status === 'home' || student.status === 'at_school';
  const canDropoff = student.status === 'picked_up' || student.status === 'returning';

  if (compact) {
    return (
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={onPress ? 0.7 : 1}
        style={[
          styles.compactContainer,
          { backgroundColor: colors.card, borderColor: colors.border },
        ]}
      >
        <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
          <Text style={styles.avatarText}>
            {student.name.split(' ').map(n => n[0]).join('')}
          </Text>
        </View>
        <View style={styles.compactInfo}>
          <Text style={[styles.compactName, { color: colors.text }]}>
            {student.name}
          </Text>
          <StatusBadge status={student.status} size="sm" />
        </View>
        <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
      style={[styles.container, { backgroundColor: colors.card }, Shadow.light]}
    >
      <View style={styles.header}>
        <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
          <Text style={styles.avatarText}>
            {student.name.split(' ').map(n => n[0]).join('')}
          </Text>
        </View>
        <View style={styles.headerInfo}>
          <Text style={[styles.name, { color: colors.text }]}>{student.name}</Text>
          <Text style={[styles.age, { color: colors.textSecondary }]}>
            Age {student.age}
          </Text>
        </View>
        <StatusBadge status={student.status} />
      </View>

      <View style={styles.details}>
        <View style={styles.detailRow}>
          <Ionicons name="school-outline" size={16} color={colors.textMuted} />
          <Text style={[styles.detailText, { color: colors.textSecondary }]} numberOfLines={1}>
            {student.school.name}
          </Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name="home-outline" size={16} color={colors.textMuted} />
          <Text style={[styles.detailText, { color: colors.textSecondary }]} numberOfLines={1}>
            {student.homeAddress}
          </Text>
        </View>
        {student.notes && (
          <View style={styles.detailRow}>
            <Ionicons name="alert-circle-outline" size={16} color={colors.warning} />
            <Text style={[styles.detailText, { color: colors.warning }]} numberOfLines={1}>
              {student.notes}
            </Text>
          </View>
        )}
      </View>

      {showActions && (
        <View style={[styles.actions, { borderTopColor: colors.border }]}>
          <TouchableOpacity
            onPress={onPickup}
            disabled={!canPickup}
            style={[
              styles.actionButton,
              {
                backgroundColor: canPickup ? colors.primary : colors.backgroundSecondary,
              },
            ]}
          >
            <Ionicons
              name="enter-outline"
              size={18}
              color={canPickup ? '#FFFFFF' : colors.textMuted}
            />
            <Text
              style={[
                styles.actionText,
                { color: canPickup ? '#FFFFFF' : colors.textMuted },
              ]}
            >
              Pick Up
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={onDropoff}
            disabled={!canDropoff}
            style={[
              styles.actionButton,
              {
                backgroundColor: canDropoff ? colors.success : colors.backgroundSecondary,
              },
            ]}
          >
            <Ionicons
              name="exit-outline"
              size={18}
              color={canDropoff ? '#FFFFFF' : colors.textMuted}
            />
            <Text
              style={[
                styles.actionText,
                { color: canDropoff ? '#FFFFFF' : colors.textMuted },
              ]}
            >
              Drop Off
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  compactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    marginBottom: Spacing.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
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
  age: {
    fontSize: FontSizes.sm,
  },
  compactInfo: {
    flex: 1,
    marginLeft: Spacing.md,
    gap: Spacing.xs,
  },
  compactName: {
    fontSize: FontSizes.md,
    fontWeight: '500',
  },
  details: {
    marginTop: Spacing.md,
    gap: Spacing.sm,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  detailText: {
    flex: 1,
    fontSize: FontSizes.sm,
  },
  actions: {
    flexDirection: 'row',
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    gap: Spacing.md,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.sm,
    borderRadius: BorderRadius.md,
    gap: Spacing.xs,
  },
  actionText: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
  },
});
