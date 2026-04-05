import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSizes, BorderRadius } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import type { Notification } from '@/types';

interface NotificationItemProps {
  notification: Notification;
  onPress?: () => void;
}

export function NotificationItem({ notification, onPress }: NotificationItemProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const getIcon = (): { name: keyof typeof Ionicons.glyphMap; color: string } => {
    switch (notification.type) {
      case 'pickup':
        return { name: 'enter-outline', color: colors.primary };
      case 'dropoff':
        return { name: 'exit-outline', color: colors.success };
      case 'arrival_school':
        return { name: 'school-outline', color: colors.success };
      case 'arrival_home':
        return { name: 'home-outline', color: colors.success };
      case 'delay':
        return { name: 'time-outline', color: colors.warning };
      case 'info':
      default:
        return { name: 'information-circle-outline', color: colors.info };
    }
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const icon = getIcon();

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={[
        styles.container,
        {
          backgroundColor: notification.read ? colors.background : colors.backgroundSecondary,
          borderColor: colors.border,
        },
      ]}
    >
      <View style={[styles.iconContainer, { backgroundColor: `${icon.color}20` }]}>
        <Ionicons name={icon.name} size={22} color={icon.color} />
      </View>
      
      <View style={styles.content}>
        <View style={styles.header}>
          <Text
            style={[
              styles.title,
              { color: colors.text, fontWeight: notification.read ? '500' : '600' },
            ]}
            numberOfLines={1}
          >
            {notification.title}
          </Text>
          <Text style={[styles.time, { color: colors.textMuted }]}>
            {formatTime(notification.timestamp)}
          </Text>
        </View>
        <Text
          style={[styles.message, { color: colors.textSecondary }]}
          numberOfLines={2}
        >
          {notification.message}
        </Text>
      </View>
      
      {!notification.read && (
        <View style={[styles.unreadDot, { backgroundColor: colors.primary }]} />
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.sm,
    borderWidth: 1,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  title: {
    fontSize: FontSizes.md,
    flex: 1,
    marginRight: Spacing.sm,
  },
  time: {
    fontSize: FontSizes.xs,
  },
  message: {
    fontSize: FontSizes.sm,
    lineHeight: 20,
  },
  unreadDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginLeft: Spacing.sm,
    marginTop: 4,
  },
});
