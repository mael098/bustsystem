import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, BorderRadius, Spacing, FontSizes, getStatusColor, getStatusLabel } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import type { StudentStatus } from '@/types';

interface StatusBadgeProps {
  status: StudentStatus;
  size?: 'sm' | 'md' | 'lg';
}

export function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const statusColor = getStatusColor(status, isDark);
  const label = getStatusLabel(status);

  const getPadding = () => {
    switch (size) {
      case 'sm':
        return { paddingVertical: 2, paddingHorizontal: Spacing.sm };
      case 'lg':
        return { paddingVertical: Spacing.sm, paddingHorizontal: Spacing.md };
      default:
        return { paddingVertical: 4, paddingHorizontal: Spacing.sm + 2 };
    }
  };

  const getFontSize = () => {
    switch (size) {
      case 'sm':
        return FontSizes.xs;
      case 'lg':
        return FontSizes.md;
      default:
        return FontSizes.sm;
    }
  };

  return (
    <View
      style={[
        styles.badge,
        getPadding(),
        { backgroundColor: `${statusColor}20` },
      ]}
    >
      <View style={[styles.dot, { backgroundColor: statusColor }]} />
      <Text
        style={[
          styles.text,
          { color: statusColor, fontSize: getFontSize() },
        ]}
      >
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BorderRadius.full,
    gap: Spacing.xs,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  text: {
    fontWeight: '500',
  },
});
